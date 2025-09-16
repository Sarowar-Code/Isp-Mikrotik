# RouterOS API Integration

This document provides comprehensive information about the RouterOS API integration in the ISP MikroTik Web Panel.

## Overview

The RouterOS API integration provides full CRUD operations for managing PPP users, profiles, and routers through MikroTik RouterOS devices. It includes production-ready features like connection pooling, monitoring, error handling, and automatic synchronization.

## Features

### ✅ Core Features

-   **Full PPP User Management** - Create, read, update, delete PPP users
-   **RouterOS Profile Management** - Manage PPP profiles with all RouterOS parameters
-   **Router Management** - Add, configure, and monitor multiple routers
-   **Real-time Synchronization** - Automatic sync between database and RouterOS
-   **Connection Pooling** - Efficient connection management for multiple routers
-   **Bulk Operations** - Bulk sync, enable/disable operations
-   **Health Monitoring** - Real-time monitoring of router connections and system health

### ✅ Production Features

-   **Rate Limiting** - Prevents API abuse with configurable limits
-   **Security** - Helmet.js security headers, input validation
-   **Error Handling** - Comprehensive error handling with retry logic
-   **Logging** - Winston-based logging with file rotation
-   **Monitoring** - System metrics, alerts, and performance monitoring
-   **Graceful Shutdown** - Proper cleanup of connections on shutdown

## API Endpoints

### PPP Clients (`/api/v1/ppp-clients`)

| Method | Endpoint                               | Description                     |
| ------ | -------------------------------------- | ------------------------------- |
| POST   | `/`                                    | Create new PPP client           |
| GET    | `/`                                    | Get all PPP clients (paginated) |
| GET    | `/:id`                                 | Get single PPP client           |
| PUT    | `/:id`                                 | Update PPP client               |
| DELETE | `/:id`                                 | Delete PPP client               |
| PATCH  | `/:id/toggle-status`                   | Enable/disable client on router |
| POST   | `/:id/sync`                            | Sync client with RouterOS       |
| POST   | `/bulk/sync`                           | Bulk sync operations            |
| GET    | `/router/:routerId/active-connections` | Get active connections          |

### Packages (`/api/v1/packages`)

| Method | Endpoint                     | Description                           |
| ------ | ---------------------------- | ------------------------------------- |
| POST   | `/`                          | Create new Package (RouterOS profile) |
| GET    | `/`                          | Get all packages (paginated)          |
| GET    | `/:id`                       | Get single package                    |
| PUT    | `/:id`                       | Update package                        |
| DELETE | `/:id`                       | Delete package                        |
| POST   | `/:id/sync`                  | Sync package with RouterOS            |
| POST   | `/bulk/sync`                 | Bulk sync operations                  |
| GET    | `/router/:routerId/profiles` | Get profiles from router              |

### Routers (`/api/v1/routers`)

| Method | Endpoint                  | Description                     |
| ------ | ------------------------- | ------------------------------- |
| POST   | `/`                       | Add new router                  |
| GET    | `/`                       | Get all routers (paginated)     |
| GET    | `/:id`                    | Get single router               |
| PUT    | `/:id`                    | Update router                   |
| DELETE | `/:id`                    | Delete router                   |
| POST   | `/:id/test-connection`    | Test router connection          |
| GET    | `/:id/status`             | Get router status               |
| GET    | `/:id/health`             | Get router health               |
| PATCH  | `/:id/toggle-status`      | Enable/disable router           |
| GET    | `/:id/system-info`        | Get router system information   |
| GET    | `/:id/interfaces`         | Get router interfaces           |
| GET    | `/:id/ppp-secrets`        | Get PPP secrets from router     |
| GET    | `/:id/ppp-profiles`       | Get PPP profiles from router    |
| GET    | `/:id/active-connections` | Get active connections          |
| GET    | `/:id/queue-rules`        | Get queue rules                 |
| POST   | `/:id/execute-command`    | Execute custom RouterOS command |

### Monitoring (`/api/v1/monitoring`)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| GET    | `/metrics`                  | Get system metrics             |
| GET    | `/health-summary`           | Get router health summary      |
| GET    | `/alerts`                   | Get system alerts              |
| GET    | `/status`                   | Get monitoring status          |
| POST   | `/start`                    | Start monitoring               |
| POST   | `/stop`                     | Stop monitoring                |
| POST   | `/force-sync`               | Force sync all entities        |
| GET    | `/routeros-health`          | Get RouterOS service health    |
| GET    | `/router/:routerId/details` | Get detailed router info       |
| GET    | `/performance`              | Get system performance metrics |
| GET    | `/connection-pool`          | Get connection pool status     |
| GET    | `/sync-stats`               | Get sync statistics            |

## Models

### Enhanced PPP Client Model

```javascript
{
  // Existing fields...
  name: String,
  userId: String,
  email: String,
  password: String,
  // ... other existing fields

  // New RouterOS Integration Fields
  routerId: ObjectId, // Reference to Router
  routerosProfile: String, // RouterOS profile name
  routerosSecretId: String, // RouterOS secret ID
  isActiveOnRouter: Boolean, // Active status on router
  lastSyncAt: Date, // Last sync timestamp
  syncStatus: String, // synced, pending, failed, not_synced
  syncError: String, // Sync error message
  routerosData: Mixed // Additional RouterOS data
}
```

### Enhanced Package Model (RouterOS Profile)

```javascript
{
  // Business fields
  createdByAdmin: ObjectId, // Reference to Admin
  resellerId: ObjectId, // Reference to Reseller
  mikrotikRouterId: ObjectId, // Reference to Router
  name: String, // Package name
  price: Number, // Package price
  billingCycle: String, // monthly, yearly, etc.
  bandwidthUp: Number, // Upload bandwidth
  bandwidthDown: Number, // Download bandwidth
  remoteAddressPool: String, // RouterOS address pool

  // RouterOS Profile fields (Package = RouterOS Profile)
  routerosProfileName: String, // RouterOS profile name
  localAddress: String, // Local address
  remoteAddress: String, // Remote address
  dnsServer: String, // DNS server
  winsServer: String, // WINS server
  useEncryption: String, // yes, no, required
  onlyOne: String, // yes, no
  changeTcpMss: String, // yes, no
  useCompression: String, // yes, no
  useVjCompression: String, // yes, no
  useUpnp: String, // yes, no
  addressList: String, // Address list
  incomingFilter: String, // Incoming filter
  outgoingFilter: String, // Outgoing filter
  sessionTimeout: String, // Session timeout
  idleTimeout: String, // Idle timeout
  keepaliveTimeout: String, // Keepalive timeout
  txBitrate: String, // TX bitrate
  rxBitrate: String, // RX bitrate
  txByteLimit: String, // TX byte limit
  rxByteLimit: String, // RX byte limit
  txPacketLimit: String, // TX packet limit
  rxPacketLimit: String, // RX packet limit
  isDefault: Boolean, // Default profile
  description: String, // Profile description

  // Sync status
  syncStatus: String, // synced, pending, failed, not_synced
  lastSyncAt: Date, // Last sync timestamp
  syncError: String // Sync error message
}
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/isp-mikrotik-web-panel

# Server
PORT=8000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# RouterOS
ROUTEROS_DEFAULT_PORT=8728
ROUTEROS_DEFAULT_TIMEOUT=10000
ROUTEROS_MAX_RETRIES=3

# Monitoring
MONITORING_INTERVAL=300000
MONITORING_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ROUTEROS_RATE_LIMIT_WINDOW_MS=60000
ROUTEROS_RATE_LIMIT_MAX_REQUESTS=20
```

## Usage Examples

### Creating a PPP Client

```javascript
POST /api/v1/ppp-clients
{
  "name": "John Doe",
  "userId": "john.doe",
  "email": "john@example.com",
  "password": "password123",
  "contact": "+1234567890",
  "whatsapp": "+1234567890",
  "nid": 1234567890,
  "address": {
    "thana": "Dhanmondi",
    "houseName": "House 123",
    "street": "Road 5",
    "district": "Dhaka",
    "division": "Dhaka"
  },
  "package": "64f8a1b2c3d4e5f6a7b8c9d0",
  "routerId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "routerosProfile": "default",
  "paymentDeadline": "2024-01-01T00:00:00.000Z"
}
```

### Creating a Package (RouterOS Profile)

```javascript
POST /api/v1/packages
{
  "name": "Premium Package",
  "resellerId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "mikrotikRouterId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "price": 1500,
  "bandwidthUp": 10,
  "bandwidthDown": 50,
  "routerosProfileName": "premium",
  "remoteAddressPool": "pool1",
  "localAddress": "192.168.1.1",
  "remoteAddress": "192.168.1.0/24",
  "dnsServer": "8.8.8.8,8.8.4.4",
  "useEncryption": "yes",
  "onlyOne": "yes",
  "txBitrate": "10000000",
  "rxBitrate": "10000000",
  "description": "Premium package profile"
}
```

### Adding a Router

```javascript
POST /api/v1/routers
{
  "host": "192.168.1.1",
  "port": 8728,
  "username": "admin",
  "password": "admin123",
  "assignedFor": "64f8a1b2c3d4e5f6a7b8c9d2",
  "vlanId": 100
}
```

### Executing Custom RouterOS Command

```javascript
POST /api/v1/routers/64f8a1b2c3d4e5f6a7b8c9d1/execute-command
{
  "command": ["/interface/print", "?name=ether1"]
}
```

## Error Handling

The API provides comprehensive error handling with appropriate HTTP status codes:

-   `400` - Bad Request (validation errors, invalid parameters)
-   `401` - Unauthorized (authentication required)
-   `403` - Forbidden (insufficient permissions)
-   `404` - Not Found (resource not found)
-   `429` - Too Many Requests (rate limit exceeded)
-   `500` - Internal Server Error (server errors, RouterOS connection failures)

## Monitoring and Logging

### Log Files

-   `logs/routeros-error.log` - RouterOS specific errors
-   `logs/routeros-combined.log` - All RouterOS operations
-   `logs/monitoring-error.log` - Monitoring errors
-   `logs/monitoring-combined.log` - All monitoring operations

### Monitoring Metrics

-   Router connection status
-   PPP client sync statistics
-   System performance metrics
-   Error rates and alerts
-   Connection pool status

## Security Considerations

1. **Rate Limiting** - Prevents API abuse
2. **Input Validation** - All inputs are validated
3. **Security Headers** - Helmet.js provides security headers
4. **Connection Security** - RouterOS connections can use TLS
5. **Error Handling** - Sensitive information is not exposed in errors

## Performance Optimization

1. **Connection Pooling** - Reuses RouterOS connections
2. **Bulk Operations** - Efficient bulk processing
3. **Caching** - Connection status caching
4. **Async Operations** - Non-blocking operations
5. **Retry Logic** - Automatic retry for failed operations

## Troubleshooting

### Common Issues

1. **Router Connection Failed**

    - Check router credentials
    - Verify network connectivity
    - Check firewall settings

2. **Sync Failures**

    - Check RouterOS API permissions
    - Verify profile names exist
    - Check for duplicate entries

3. **Rate Limit Exceeded**
    - Wait for rate limit window to reset
    - Implement client-side rate limiting
    - Contact administrator for limit increase

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in environment variables.

## Support

For issues and questions:

1. Check the logs for error details
2. Verify RouterOS API connectivity
3. Check system monitoring metrics
4. Contact the development team

## License

This RouterOS API integration is part of the ISP MikroTik Web Panel project.
