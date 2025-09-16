import dotenv from "dotenv";

dotenv.config();

export const config = {
    // Server Configuration
    port: process.env.PORT || 8000,
    nodeEnv: process.env.NODE_ENV || "development",

    // Database Configuration
    mongodbUri:
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/isp-mikrotik-web-panel",

    // CORS Configuration
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || "your-super-secret-jwt-key-here",
        refreshSecret:
            process.env.JWT_REFRESH_SECRET ||
            "your-super-secret-refresh-key-here",
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    },

    // RouterOS Configuration
    routerOS: {
        defaultPort: parseInt(process.env.ROUTEROS_DEFAULT_PORT) || 8728,
        defaultTimeout: parseInt(process.env.ROUTEROS_DEFAULT_TIMEOUT) || 10000,
        maxRetries: parseInt(process.env.ROUTEROS_MAX_RETRIES) || 3,
        retryDelay: parseInt(process.env.ROUTEROS_RETRY_DELAY) || 1000,
    },

    // Monitoring Configuration
    monitoring: {
        interval: parseInt(process.env.MONITORING_INTERVAL) || 300000, // 5 minutes
        enabled: process.env.MONITORING_ENABLED === "true" || true,
    },

    // Rate Limiting Configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        routerOSWindowMs:
            parseInt(process.env.ROUTEROS_RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
        routerOSMaxRequests:
            parseInt(process.env.ROUTEROS_RATE_LIMIT_MAX_REQUESTS) || 20,
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || "info",
        maxSize: process.env.LOG_FILE_MAX_SIZE || "10m",
        maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES) || 5,
    },

    // Security Configuration
    security: {
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
        sessionSecret: process.env.SESSION_SECRET || "your-session-secret-here",
    },

    // Cloudinary Configuration
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },

    // Email Configuration
    email: {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: parseInt(process.env.SMTP_PORT) || 587,
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
    },

    // SMS Configuration
    sms: {
        apiKey: process.env.SMS_API_KEY,
        apiSecret: process.env.SMS_API_SECRET,
    },
};

export default config;
