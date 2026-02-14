# Parking Reservation System - NestJS + Neon PostgreSQL

Parking reservation system built with NestJS and PostgreSQL (Neon Database).

## Requirements

- Node.js >= 18
- npm or yarn
- Neon Database account (https://neon.tech)

## Installation

### 1. Install Dependencies

```bash
npm install
```



### 3. Run Migrations

```bash
# Build the project first
npm run build

# Run migrations to create tables
npm run migration:run
```

### 4. Seed Database with Initial Data

```bash
# Copy seed.json to project root first
cp /path/to/seed.json .

# Then run the seed script
npm run build
node dist/seeds/seed.js
```

### 5. Run the Application

#### Development mode:
```bash
npm run start:dev
```

#### Production mode:
```bash
npm run build
npm run start:prod
```

The application will run on: `http://localhost:3000/api/v1`

## API Endpoints

All endpoints remain the same as the original code:

### Auth
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - Create new account

### Master Data
- `GET /api/v1/master/gates` - Get all gates
- `GET /api/v1/master/zones?gateId={gateId}` - Get zones (optional: by gate)
- `GET /api/v1/master/categories` - Get all categories

### Zones
- `GET /api/v1/zones` - Get all zones
- `GET /api/v1/zones/:id` - Get specific zone

### Gates
- `GET /api/v1/gates` - Get all gates
- `GET /api/v1/gates/:id` - Get specific gate
- `GET /api/v1/gates/:id/zones` - Get zones for specific gate

### Tickets
- `POST /api/v1/tickets/checkin` - Vehicle check-in
- `POST /api/v1/tickets/checkout` - Vehicle check-out
- `GET /api/v1/tickets/:id` - Get specific ticket

### Subscriptions
- `GET /api/v1/subscriptions` - Get all subscriptions
- `GET /api/v1/subscriptions/plate/:plate` - Search subscription by license plate
- `POST /api/v1/subscriptions` - Create new subscription (admin only)

### Admin (requires admin privileges)
- `GET /api/v1/admin/reports/parking-state` - Parking state report
- `PUT /api/v1/admin/categories/:id` - Update category
- `PUT /api/v1/admin/zones/:id/open` - Open/close zone
- `POST /api/v1/admin/rush-hours` - Add rush hour
- `GET /api/v1/admin/rush-hours` - Get rush hours
- `POST /api/v1/admin/vacations` - Add vacation period
- `GET /api/v1/admin/vacations` - Get vacations
- `GET /api/v1/admin/subscriptions` - Get subscriptions
- `GET /api/v1/admin/users` - Get users
- `POST /api/v1/admin/users` - Create user
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user

### WebSocket
- `ws://localhost:3000/api/v1/ws` - WebSocket endpoint for real-time updates

#### WebSocket Messages:
```javascript
// Subscribe to a gate
{
  "type": "subscribe",
  "payload": { "gateId": "gate_1" }
}

// Unsubscribe
{
  "type": "unsubscribe",
  "payload": { "gateId": "gate_1" }
}

// Messages from server:
// Zone update
{
  "type": "zone-update",
  "payload": { /* zone data */ }
}

// Admin update
{
  "type": "admin-update",
  "payload": { /* admin action data */ }
}
```

## Project Structure

```
src/
├── config/             # Configuration files
│   └── typeorm.config.ts
├── dto/                # Data Transfer Objects
│   └── auth.dto.ts
├── entities/           # TypeORM Entities
│   ├── category.entity.ts
│   ├── gate.entity.ts
│   ├── zone.entity.ts
│   ├── rush-hour.entity.ts
│   ├── vacation.entity.ts
│   ├── user.entity.ts
│   ├── subscription.entity.ts
│   └── ticket.entity.ts
├── guards/             # Auth Guards
│   └── auth.guard.ts
├── modules/            # Feature Modules
│   ├── auth/
│   ├── zones/
│   ├── gates/
│   ├── tickets/
│   ├── admin/
│   ├── subscriptions/
│   └── websocket/
├── migrations/         # Database Migrations
└── seeds/              # Database Seeds
```

## Security

- All endpoints are protected by AuthGuard
- Admin endpoints require role = 'admin'
- Tokens format: `token-{userId}`

## Important Notes

1. **WebSocket**: Uses `ws` library instead of Socket.io for compatibility with original code
2. **Authentication**: Simple authentication system, JWT recommended for production
3. **Passwords**: Passwords stored as plain text, hashing recommended for production
4. **Migration vs Sync**: Use migrations instead of `synchronize: true` in production

## Development

```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug

# Run tests
npm run test

# Generate migration
npm run migration:generate -- src/migrations/MigrationName

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert
```

## Production

1. Make sure to set `NODE_ENV=production` in `.env`
2. Run build:
   ```bash
   npm run build
   ```
3. Start the application:
   ```bash
   npm run start:prod
   ```

## License

MIT