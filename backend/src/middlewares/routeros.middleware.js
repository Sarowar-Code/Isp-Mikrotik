import { Router } from "../models/router.model.js";
import { routerOSService } from "../services/routeros.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to ensure router connection before RouterOS operations
 */
export const ensureRouterConnection = asyncHandler(async (req, res, next) => {
    const { routerId } = req.params;

    if (!routerId) {
        throw new ApiError(400, "Router ID is required");
    }

    // Check if router exists and is active
    const router = await Router.findById(routerId);
    if (!router) {
        throw new ApiError(404, "Router not found");
    }

    if (!router.isActive) {
        throw new ApiError(400, "Router is inactive");
    }

    // Ensure connection is established
    try {
        await routerOSService.getConnection(routerId);
        req.router = router;
        next();
    } catch (error) {
        throw new ApiError(
            500,
            `Failed to connect to router: ${error.message}`
        );
    }
});

/**
 * Middleware to validate RouterOS command format
 */
export const validateRouterOSCommand = (req, res, next) => {
    const { command } = req.body;

    if (!Array.isArray(command)) {
        throw new ApiError(400, "Command must be an array");
    }

    if (command.length === 0) {
        throw new ApiError(400, "Command cannot be empty");
    }

    // Basic validation for dangerous commands
    const dangerousCommands = [
        "/system/reboot",
        "/system/shutdown",
        "/system/reset-configuration",
        "/user/remove",
        "/user/add",
    ];

    const firstCommand = command[0];
    if (dangerousCommands.some((cmd) => firstCommand.includes(cmd))) {
        throw new ApiError(
            400,
            "This command is not allowed for security reasons"
        );
    }

    next();
};

/**
 * Middleware to rate limit RouterOS operations
 */
export const rateLimitRouterOS = (maxRequests = 10, windowMs = 60000) => {
    const requests = new Map();

    return (req, res, next) => {
        const key = req.user._id.toString();
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        if (requests.has(key)) {
            const userRequests = requests
                .get(key)
                .filter((time) => time > windowStart);
            requests.set(key, userRequests);
        } else {
            requests.set(key, []);
        }

        const userRequests = requests.get(key);

        if (userRequests.length >= maxRequests) {
            throw new ApiError(
                429,
                "Too many RouterOS requests. Please try again later."
            );
        }

        userRequests.push(now);
        next();
    };
};

/**
 * Middleware to log RouterOS operations
 */
export const logRouterOSOperation = (operation) => {
    return (req, res, next) => {
        const startTime = Date.now();

        // Log the operation start
        console.log(
            `[RouterOS] ${operation} started by user ${
                req.user._id
            } at ${new Date().toISOString()}`
        );

        // Override res.json to log completion
        const originalJson = res.json;
        res.json = function (data) {
            const duration = Date.now() - startTime;
            console.log(`[RouterOS] ${operation} completed in ${duration}ms`);
            return originalJson.call(this, data);
        };

        next();
    };
};

/**
 * Middleware to handle RouterOS connection errors gracefully
 */
export const handleRouterOSErrors = (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
        // Check if this is an error response
        if (res.statusCode >= 400) {
            console.error(`[RouterOS Error] ${res.statusCode}: ${data}`);
        }

        return originalSend.call(this, data);
    };

    next();
};
