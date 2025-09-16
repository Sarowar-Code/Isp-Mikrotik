import { RouterOSAPI } from "node-routeros-v2";
import winston from "winston";
import { Router } from "../models/router.model.js";
import { ApiError } from "../utils/ApiError.js";

// Configure Winston logger
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
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

class RouterOSService {
  constructor() {
    this.connections = new Map(); // Store active connections
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Get or create RouterOS connection
   * @param {string} routerId - Router ID from database
   * @returns {Promise<RouterOSAPI>} RouterOS client instance
   */
  async getConnection(routerId) {
    try {
      // Check if connection already exists
      if (this.connections.has(routerId)) {
        const connection = this.connections.get(routerId);
        if (connection.connected) {
          return connection;
        }
      }

      // Get router details from database
      const router = await Router.findById(routerId).select(
        "host port username password isActive"
      );

      if (!router) {
        throw new ApiError(404, "Router not found");
      }

      if (!router.isActive) {
        throw new ApiError(400, "Router is inactive");
      }

      // Create new connection using node-routeros-v2
      const client = new RouterOSAPI({
        host: router.host,
        user: router.username,
        password: router.password,
        port: router.port,
        timeout: 10000,
        keepalive: true,
      });

      // Connect with retry logic
      await this.connectWithRetry(client, routerId);

      // Store connection
      this.connections.set(routerId, client);

      logger.info(`RouterOS connection established for router ${routerId}`);
      return client;
    } catch (error) {
      logger.error(
        `Failed to get RouterOS connection for router ${routerId}:`,
        error
      );
      throw new ApiError(500, `RouterOS connection failed: ${error.message}`);
    }
  }

  /**
   * Connect with retry logic
   * @param {RouterOSAPI} client - RouterOS client
   * @param {string} routerId - Router ID
   */
  async connectWithRetry(client, routerId) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await client.connect();
        logger.info(
          `RouterOS connection successful for router ${routerId} (attempt ${attempt})`
        );
        return;
      } catch (error) {
        lastError = error;
        logger.warn(
          `RouterOS connection attempt ${attempt} failed for router ${routerId}:`,
          error.message
        );
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    throw lastError;
  }

  /**
   * Execute RouterOS command with error handling
   * @param {string} routerId - Router ID
   * @param {Array} command - RouterOS command array
   * @returns {Promise<Object>} Command result
   */
  async executeCommand(routerId, command) {
    const client = await this.getConnection(routerId);
    try {
      logger.info(
        `Executing RouterOS command for router ${routerId}:`,
        command
      );
      // node-routeros-v2 expects command as string and parameters as array
      // If command is array, first element is path, rest are parameters
      let cmd = command;
      let params = [];
      if (Array.isArray(command) && command.length > 0) {
        cmd = command[0];
        params = command.slice(1);
      }
      const result = await client.write(cmd, params);
      logger.info(
        `RouterOS command executed successfully for router ${routerId}`
      );
      return result;
    } catch (error) {
      logger.error(`RouterOS command failed for router ${routerId}:`, error);
      // If connection error, remove from cache and retry once
      if (
        error.message.includes("connection") ||
        error.message.includes("timeout")
      ) {
        this.connections.delete(routerId);
        try {
          const newClient = await this.getConnection(routerId);
          let cmd = command;
          let params = [];
          if (Array.isArray(command) && command.length > 0) {
            cmd = command[0];
            params = command.slice(1);
          }
          return await newClient.write(cmd, params);
        } catch (retryError) {
          throw new ApiError(
            500,
            `RouterOS command failed after retry: ${retryError.message}`
          );
        }
      }
      throw new ApiError(500, `RouterOS command failed: ${error.message}`);
    }
  }

  /**
   * Close specific router connection
   * @param {string} routerId - Router ID
   */
  async closeConnection(routerId) {
    if (this.connections.has(routerId)) {
      const client = this.connections.get(routerId);
      try {
        await client.close();
        logger.info(`RouterOS connection closed for router ${routerId}`);
      } catch (error) {
        logger.error(
          `Error closing RouterOS connection for router ${routerId}:`,
          error
        );
      } finally {
        this.connections.delete(routerId);
      }
    }
  }

  /**
   * Close all connections
   */
  async closeAllConnections() {
    const closePromises = Array.from(this.connections.keys()).map((routerId) =>
      this.closeConnection(routerId)
    );

    await Promise.all(closePromises);
    logger.info("All RouterOS connections closed");
  }

  /**
   * Get connection status for a router
   * @param {string} routerId - Router ID
   * @returns {Object} Connection status
   */
  getConnectionStatus(routerId) {
    const connection = this.connections.get(routerId);
    return {
      connected: connection ? connection.isConnected : false,
      routerId,
    };
  }

  /**
   * Health check for all active connections
   * @returns {Array} Health status of all connections
   */
  async healthCheck() {
    const healthStatus = [];

    for (const [routerId, client] of this.connections) {
      try {
        // Try to execute a simple command to check health
        await client.send(["/system/identity/print"]);
        healthStatus.push({
          routerId,
          status: "healthy",
          connected: true,
        });
      } catch (error) {
        healthStatus.push({
          routerId,
          status: "unhealthy",
          connected: false,
          error: error.message,
        });

        // Remove unhealthy connection
        this.connections.delete(routerId);
      }
    }

    return healthStatus;
  }

  /**
   * Utility method for delay
   * @param {number} ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const routerOSService = new RouterOSService();

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Received SIGINT, closing RouterOS connections...");
  await routerOSService.closeAllConnections();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, closing RouterOS connections...");
  await routerOSService.closeAllConnections();
  process.exit(0);
});
