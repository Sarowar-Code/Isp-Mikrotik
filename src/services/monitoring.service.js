import winston from "winston";
import { Package } from "../models/package.model.js";
import { PppClient } from "../models/pppClient.model.js";
import { Router } from "../models/router.model.js";
import { routerOSService } from "./routeros.service.js";

// Configure Winston logger for monitoring
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: "logs/monitoring-error.log",
            level: "error",
        }),
        new winston.transports.File({
            filename: "logs/monitoring-combined.log",
        }),
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

class MonitoringService {
    constructor() {
        this.monitoringInterval = null;
        this.isMonitoring = false;
        this.metrics = {
            routerConnections: new Map(),
            pppClients: new Map(),
            systemHealth: new Map(),
            lastUpdate: null,
        };
    }

    /**
     * Start monitoring service
     */
    startMonitoring(intervalMs = 300000) {
        // 5 minutes default
        if (this.isMonitoring) {
            logger.warn("Monitoring service is already running");
            return;
        }

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.collectMetrics();
                await this.checkSystemHealth();
                await this.syncStatus();
            } catch (error) {
                logger.error("Error in monitoring cycle:", error);
            }
        }, intervalMs);

        logger.info(`Monitoring service started with ${intervalMs}ms interval`);
    }

    /**
     * Stop monitoring service
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
        logger.info("Monitoring service stopped");
    }

    /**
     * Collect system metrics
     */
    async collectMetrics() {
        try {
            // Get all active routers
            const routers = await Router.find({ isActive: true });

            for (const router of routers) {
                try {
                    // Test connection
                    const connectionStatus =
                        routerOSService.getConnectionStatus(
                            router._id.toString()
                        );

                    if (connectionStatus.connected) {
                        // Get router system info
                        const systemInfo = await this.getRouterSystemInfo(
                            router._id.toString()
                        );
                        this.metrics.routerConnections.set(
                            router._id.toString(),
                            {
                                status: "connected",
                                systemInfo,
                                lastChecked: new Date(),
                            }
                        );
                    } else {
                        this.metrics.routerConnections.set(
                            router._id.toString(),
                            {
                                status: "disconnected",
                                lastChecked: new Date(),
                            }
                        );
                    }
                } catch (error) {
                    this.metrics.routerConnections.set(router._id.toString(), {
                        status: "error",
                        error: error.message,
                        lastChecked: new Date(),
                    });
                }
            }

            // Get PPP client statistics
            const pppStats = await this.getPppClientStats();
            this.metrics.pppClients = pppStats;

            this.metrics.lastUpdate = new Date();
        } catch (error) {
            logger.error("Error collecting metrics:", error);
        }
    }

    /**
     * Get router system information
     */
    async getRouterSystemInfo(routerId) {
        try {
            const identity = await routerOSService.executeCommand(routerId, [
                "/system/identity/print",
            ]);
            const resource = await routerOSService.executeCommand(routerId, [
                "/system/resource/print",
            ]);
            const clock = await routerOSService.executeCommand(routerId, [
                "/system/clock/print",
            ]);

            return {
                identity: identity[0],
                resource: resource[0],
                clock: clock[0],
            };
        } catch (error) {
            throw new Error(`Failed to get system info: ${error.message}`);
        }
    }

    /**
     * Get PPP client statistics
     */
    async getPppClientStats() {
        try {
            const totalClients = await PppClient.countDocuments();
            const syncedClients = await PppClient.countDocuments({
                syncStatus: "synced",
            });
            const pendingClients = await PppClient.countDocuments({
                syncStatus: "pending",
            });
            const failedClients = await PppClient.countDocuments({
                syncStatus: "failed",
            });
            const notSyncedClients = await PppClient.countDocuments({
                syncStatus: "not_synced",
            });

            return {
                total: totalClients,
                synced: syncedClients,
                pending: pendingClients,
                failed: failedClients,
                notSynced: notSyncedClients,
                syncRate:
                    totalClients > 0 ? (syncedClients / totalClients) * 100 : 0,
            };
        } catch (error) {
            logger.error("Error getting PPP client stats:", error);
            return {};
        }
    }

    /**
     * Check system health
     */
    async checkSystemHealth() {
        try {
            const healthStatus = await routerOSService.healthCheck();

            for (const health of healthStatus) {
                this.metrics.systemHealth.set(health.routerId, {
                    status: health.status,
                    connected: health.connected,
                    error: health.error,
                    lastChecked: new Date(),
                });
            }

            // Log health issues
            const unhealthyRouters = healthStatus.filter(
                (h) => h.status === "unhealthy"
            );
            if (unhealthyRouters.length > 0) {
                logger.warn(
                    `Found ${unhealthyRouters.length} unhealthy routers:`,
                    unhealthyRouters
                );
            }
        } catch (error) {
            logger.error("Error checking system health:", error);
        }
    }

    /**
     * Sync status for all entities
     */
    async syncStatus() {
        try {
            // Sync PPP clients
            await this.syncPppClients();

            // Sync Packages (RouterOS profiles)
            await this.syncPackages();
        } catch (error) {
            logger.error("Error syncing status:", error);
        }
    }

    /**
     * Sync PPP clients with RouterOS
     */
    async syncPppClients() {
        try {
            const pendingClients = await PppClient.find({
                syncStatus: "pending",
            });

            for (const client of pendingClients) {
                try {
                    // Check if client exists on router
                    const checkCommand = [
                        "/ppp/secret/print",
                        `?name=${client.userId}`,
                    ];
                    const existingSecrets =
                        await routerOSService.executeCommand(
                            client.routerId,
                            checkCommand
                        );

                    if (existingSecrets.length > 0) {
                        client.syncStatus = "synced";
                        client.isActiveOnRouter = true;
                        client.routerosSecretId = existingSecrets[0][".id"];
                    } else {
                        // Try to create the secret
                        const command = [
                            "/ppp/secret/add",
                            `=name=${client.userId}`,
                            `=password=${client.password}`,
                            `=profile=${client.routerosProfile}`,
                            `=service=${client.service}`,
                            `=comment=${client.name} - ${client.email}`,
                        ];

                        const result = await routerOSService.executeCommand(
                            client.routerId,
                            command
                        );
                        client.routerosSecretId = result[0]?.ret || "";
                        client.syncStatus = "synced";
                        client.isActiveOnRouter = true;
                    }

                    client.lastSyncAt = new Date();
                    client.syncError = "";
                    await client.save();
                } catch (error) {
                    client.syncStatus = "failed";
                    client.syncError = error.message;
                    await client.save();
                }
            }
        } catch (error) {
            logger.error("Error syncing PPP clients:", error);
        }
    }

    /**
     * Sync Packages (RouterOS profiles)
     */
    async syncPackages() {
        try {
            const pendingPackages = await Package.find({
                syncStatus: "pending",
            });

            for (const packageDoc of pendingPackages) {
                try {
                    // Check if profile exists on router
                    const checkCommand = [
                        "/ppp/profile/print",
                        `?name=${packageDoc.routerosProfileName}`,
                    ];
                    const existingProfiles =
                        await routerOSService.executeCommand(
                            packageDoc.mikrotikRouterId,
                            checkCommand
                        );

                    if (existingProfiles.length > 0) {
                        packageDoc.syncStatus = "synced";
                    } else {
                        // Try to create the profile
                        const command = [
                            "/ppp/profile/add",
                            `=name=${packageDoc.routerosProfileName}`,
                            `=local-address=${packageDoc.localAddress}`,
                            `=remote-address=${packageDoc.remoteAddress}`,
                            `=dns-server=${packageDoc.dnsServer}`,
                            `=wins-server=${packageDoc.winsServer}`,
                            `=use-encryption=${packageDoc.useEncryption}`,
                            `=only-one=${packageDoc.onlyOne}`,
                            `=change-tcp-mss=${packageDoc.changeTcpMss}`,
                            `=use-compression=${packageDoc.useCompression}`,
                            `=use-vj-compression=${packageDoc.useVjCompression}`,
                            `=use-upnp=${packageDoc.useUpnp}`,
                            `=address-list=${packageDoc.addressList}`,
                            `=incoming-filter=${packageDoc.incomingFilter}`,
                            `=outgoing-filter=${packageDoc.outgoingFilter}`,
                            `=session-timeout=${packageDoc.sessionTimeout}`,
                            `=idle-timeout=${packageDoc.idleTimeout}`,
                            `=keepalive-timeout=${packageDoc.keepaliveTimeout}`,
                            `=tx-bitrate=${packageDoc.txBitrate}`,
                            `=rx-bitrate=${packageDoc.rxBitrate}`,
                            `=tx-byte-limit=${packageDoc.txByteLimit}`,
                            `=rx-byte-limit=${packageDoc.rxByteLimit}`,
                            `=tx-packet-limit=${packageDoc.txPacketLimit}`,
                            `=rx-packet-limit=${packageDoc.rxPacketLimit}`,
                            `=comment=${packageDoc.description}`,
                        ];

                        await routerOSService.executeCommand(
                            packageDoc.mikrotikRouterId,
                            command
                        );
                        packageDoc.syncStatus = "synced";
                    }

                    packageDoc.lastSyncAt = new Date();
                    packageDoc.syncError = "";
                    await packageDoc.save();
                } catch (error) {
                    packageDoc.syncStatus = "failed";
                    packageDoc.syncError = error.message;
                    await packageDoc.save();
                }
            }
        } catch (error) {
            logger.error("Error syncing Packages:", error);
        }
    }

    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            isMonitoring: this.isMonitoring,
            uptime: process.uptime(),
        };
    }

    /**
     * Get router health summary
     */
    getRouterHealthSummary() {
        const summary = {
            total: this.metrics.routerConnections.size,
            connected: 0,
            disconnected: 0,
            error: 0,
        };

        for (const [routerId, status] of this.metrics.routerConnections) {
            switch (status.status) {
                case "connected":
                    summary.connected++;
                    break;
                case "disconnected":
                    summary.disconnected++;
                    break;
                case "error":
                    summary.error++;
                    break;
            }
        }

        return summary;
    }

    /**
     * Get system alerts
     */
    getSystemAlerts() {
        const alerts = [];

        // Check for disconnected routers
        for (const [routerId, status] of this.metrics.routerConnections) {
            if (status.status === "disconnected" || status.status === "error") {
                alerts.push({
                    type: "router_disconnected",
                    routerId,
                    message: `Router ${routerId} is ${status.status}`,
                    severity: "high",
                    timestamp: status.lastChecked,
                });
            }
        }

        // Check for high failure rate
        const pppStats = this.metrics.pppClients;
        if (pppStats.syncRate && pppStats.syncRate < 80) {
            alerts.push({
                type: "low_sync_rate",
                message: `PPP client sync rate is low: ${pppStats.syncRate.toFixed(
                    2
                )}%`,
                severity: "medium",
                timestamp: new Date(),
            });
        }

        return alerts;
    }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Start monitoring on service initialization
monitoringService.startMonitoring();

// Graceful shutdown
process.on("SIGINT", () => {
    monitoringService.stopMonitoring();
});

process.on("SIGTERM", () => {
    monitoringService.stopMonitoring();
});
