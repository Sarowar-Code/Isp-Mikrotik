import { RouterOSAPI } from "node-routeros"; // MikroTik API client
import winston from "winston"; // Logging library
import { Router } from "../models/router.model.js"; // MongoDB router model
import { ApiError } from "../utils/ApiError.js"; // Custom API errors

// --------------------
// Winston Logger Setup
// --------------------
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/routeros-error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/routeros-combined.log" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

class RouterOSService {
  constructor() {
    this.connections = new Map(); // Stores active RouterOS connections
    this.maxRetries = 3; // Retry connection attempts
    this.retryDelay = 1000; // 1 second delay between retries
    this.idleTimeout = 5 * 60 * 1000; // Auto-close idle connections after 5 min
  }

  /**
   * Get or create RouterOS connection
   * @param {string} routerId - Router ID from database
   * @returns {Promise<RouterOSAPI>} RouterOS client instance
   */
  async getConnection(routerId) {
    try {
      // --------- Check existing connection ---------
      if (this.connections.has(routerId)) {
        const { client, timer } = this.connections.get(routerId);
        if (client.isConnected) {
          // <--- Router is already connected here
          clearTimeout(timer); // Reset idle timer
          this.connections.set(routerId, {
            client,
            timer: this.startIdleTimer(routerId), // Restart idle timeout
          });
          return client; // Return existing connection
        }
      }

      // --------- Get router details from DB ---------
      const router = await Router.findById(routerId).select(
        "host port username password isActive"
      );
      if (!router) throw new ApiError(404, "Router not found");
      if (!router.isActive) throw new ApiError(400, "Router is inactive");

      // --------- Create a new RouterOS client ---------
      const client = new RouterOSAPI({
        host: router.host,
        user: router.username,
        password: router.password,
        port: router.port,
        timeout: 10000,
        keepalive: true,
      });

      // --------- Connect to RouterOS with retry ---------
      await this.connectWithRetry(client, routerId); // <--- Actual connection happens here
      console.log("client :", client, routerId);

      // --------- Store connection with idle timer ---------
      this.connections.set(routerId, {
        client,
        timer: this.startIdleTimer(routerId),
      });

      logger.info(`RouterOS connection established for router ${routerId}`);
      return client;
    } catch (error) {
      logger.error(
        `Failed to get RouterOS connection for router ${routerId}: ${error.message}`
      );
      throw new ApiError(500, `RouterOS connection failed: ${error.message}`);
    }
  }

  // -----------------------
  // Retry connection helper
  // -----------------------
  async connectWithRetry(client, routerId) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await client.connect(); // <--- Here is where RouterOSAPI actually connects
        logger.info(
          `RouterOS connection successful for router ${routerId} (attempt ${attempt})`
        );
        return;
      } catch (error) {
        lastError = error;
        logger.warn(
          `Connection attempt ${attempt} failed for router ${routerId}: ${error.message}`
        );
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    throw lastError; // Throws if all retries fail
  }

  // -----------------------
  // Execute RouterOS command
  // -----------------------
  async executeCommand(routerId, command) {
    const client = await this.getConnection(routerId); // Ensure connection exists
    try {
      let cmd, params;
      if (Array.isArray(command)) {
        cmd = command[0];
        params = command[1] || {};
      } else {
        cmd = command;
        params = {};
      }

      logger.info(`Executing command for router ${routerId}: ${cmd}`, params);
      const result = await client.write(cmd, params); // <--- Command sent to router
      logger.info(`Command executed successfully for router ${routerId}`);
      return result;
    } catch (error) {
      logger.error(`Command failed for router ${routerId}: ${error.message}`);
      this.connections.delete(routerId); // Drop broken connection
      throw new ApiError(500, `RouterOS command failed: ${error.message}`);
    }
  }

  // -----------------------
  // Close connections
  // -----------------------
  async closeConnection(routerId) {
    if (this.connections.has(routerId)) {
      const { client, timer } = this.connections.get(routerId);
      try {
        clearTimeout(timer);
        await client.close();
        logger.info(`RouterOS connection closed for router ${routerId}`);
      } catch (error) {
        logger.error(
          `Error closing connection for router ${routerId}: ${error.message}`
        );
      } finally {
        this.connections.delete(routerId);
      }
    }
  }

  async closeAllConnections() {
    const closePromises = Array.from(this.connections.keys()).map((id) =>
      this.closeConnection(id)
    );
    await Promise.all(closePromises);
    logger.info("All RouterOS connections closed");
  }

  // -----------------------
  // Utility functions
  // -----------------------
  getConnectionStatus(routerId) {
    const entry = this.connections.get(routerId);
    console.log("ENTRY :", entry);
    console.log("Connections :", this.connections);

    return { connected: entry ? entry.client.isConnected : false, routerId };
  }

  async healthCheck() {
    const healthStatus = [];
    for (const [routerId, { client }] of this.connections) {
      try {
        await client.write("/system/identity/print");
        healthStatus.push({ routerId, status: "healthy", connected: true });
      } catch (error) {
        healthStatus.push({
          routerId,
          status: "unhealthy",
          connected: false,
          error: error.message,
        });
        this.connections.delete(routerId);
      }
    }
    return healthStatus;
  }

  startIdleTimer(routerId) {
    return setTimeout(() => {
      this.closeConnection(routerId);
      logger.info(`RouterOS idle connection auto-closed for ${routerId}`);
    }, this.idleTimeout);
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const routerOSService = new RouterOSService();

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Received SIGINT, closing connections...");
  await routerOSService.closeAllConnections();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, closing connections...");
  await routerOSService.closeAllConnections();
  process.exit(0);
});
