import { RouterOSAPI } from "node-routeros";
import winston from "winston";
import { Router } from "../models/router.model.js";
import { ApiError } from "../utils/ApiError.js";

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
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1s delay between retries
    this.idleTimeout = 5 * 60 * 1000; // 5 min
  }

  /**
   * Get or create RouterOS connection for a router
   * @param {string} routerId
   * @returns {Promise<RouterOSAPI>}
   */
  async getConnection(routerId) {
    // Return existing active connection
    if (this.connections.has(routerId)) {
      const { client, timer } = this.connections.get(routerId);
      if (client.isConnected) {
        clearTimeout(timer);
        this.connections.set(routerId, {
          client,
          timer: this.startIdleTimer(routerId),
        });
        return client;
      }
    }

    // Fetch router info from DB
    const router = await Router.findById(routerId).select(
      "host port username password isActive"
    );
    if (!router) throw new ApiError(404, "Router not found");
    if (!router.isActive) throw new ApiError(400, "Router is inactive");

    // Create RouterOS client
    const client = new RouterOSAPI({
      host: router.host,
      user: router.username,
      password: router.password,
      port: router.port,
      timeout: 10000,
      keepalive: true,
    });

    // Connect with retry
    await this.connectWithRetry(client, routerId);

    // Store connection with idle timer
    this.connections.set(routerId, {
      client,
      timer: this.startIdleTimer(routerId),
    });

    logger.info(`RouterOS connection established for router ${routerId}`);
    return client;
  }

  /**
   * Connect with retry logic
   */
  connectWithRetry = async (client, routerId) => {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await client.connect(); // Actual connection
        logger.info(
          `RouterOS connected for router ${routerId} (attempt ${attempt})`
        );
        return;
      } catch (err) {
        lastError = err;
        logger.warn(
          `Connection attempt ${attempt} failed for router ${routerId}: ${err.message}`
        );
        if (attempt < this.maxRetries)
          await this.delay(this.retryDelay * attempt);
      }
    }
    throw lastError;
  };

  /**
   * Execute a command on RouterOS
   */
  executeCommand = async (routerId, command) => {
    const client = await this.getConnection(routerId);
    let cmd, params;

    if (Array.isArray(command)) {
      cmd = command[0];
      params = command[1] || {};
    } else {
      cmd = command;
      params = {};
    }

    try {
      logger.info(`Executing command on router ${routerId}: ${cmd}`, params);
      const result = await client.write(cmd, params);
      logger.info(`Command executed successfully for router ${routerId}`);
      return result;
    } catch (err) {
      logger.error(`Command failed for router ${routerId}: ${err.message}`);
      this.connections.delete(routerId); // Drop broken connection
      throw new ApiError(500, `RouterOS command failed: ${err.message}`);
    }
  };

  /**
   * Close a specific connection
   */
  closeConnection = async (routerId) => {
    if (this.connections.has(routerId)) {
      const { client, timer } = this.connections.get(routerId);
      try {
        clearTimeout(timer);
        await client.close();
        logger.info(`RouterOS connection closed for router ${routerId}`);
      } catch (err) {
        logger.error(
          `Error closing connection for router ${routerId}: ${err.message}`
        );
      } finally {
        this.connections.delete(routerId);
      }
    }
  };

  /**
   * Close all connections
   */
  closeAllConnections = async () => {
    await Promise.all(
      Array.from(this.connections.keys()).map(this.closeConnection)
    );
    logger.info("All RouterOS connections closed");
  };

  /**
   * Get status of a connection
   */
  getConnectionStatus(routerId) {
    const entry = this.connections.get(routerId);
    console.log("CONNECTIONS :", this.connections);

    console.log("ENTRY :", entry, entry?.client);

    return {
      connected: entry ? entry.client.connected : false,
      routerId,
    };
  }

  /**
   * Health check all active connections
   */
  healthCheck = async () => {
    const status = [];
    for (const [routerId, { client }] of this.connections) {
      try {
        await client.write("/system/identity/print");
        status.push({ routerId, status: "healthy", connected: true });
      } catch (err) {
        status.push({
          routerId,
          status: "unhealthy",
          connected: false,
          error: err.message,
        });
        this.connections.delete(routerId);
      }
    }
    return status;
  };

  /**
   * Idle connection auto-close
   */
  startIdleTimer = (routerId) =>
    setTimeout(() => {
      this.closeConnection(routerId);
      logger.info(
        `Idle RouterOS connection auto-closed for router ${routerId}`
      );
    }, this.idleTimeout);

  /**
   * Delay helper
   */
  delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
}

// Export singleton
export const routerOSService = new RouterOSService();

// --------------------
// Graceful shutdown
// --------------------
["SIGINT", "SIGTERM"].forEach((sig) =>
  process.on(sig, async () => {
    logger.info(`Received ${sig}, closing RouterOS connections...`);
    await routerOSService.closeAllConnections();
    process.exit(0);
  })
);
