# Discord Clone Backend Server

A robust Express.js backend server with TypeScript, PostgreSQL, and Prisma ORM for the Discord Clone application.

## 🚀 Features

- **Express.js** with TypeScript for type-safe API development
- **PostgreSQL** with Prisma ORM for database management
- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent abuse
- **Comprehensive Logging** with Winston
- **Error Handling** with proper HTTP status codes
- **API Documentation** with built-in endpoint listing
- **Security** with Helmet.js and CORS configuration
- **Data Validation** with Joi schemas
- **Database Seeding** for development testing

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/discord_clone"

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"

   # CORS Configuration
   FRONTEND_URL="http://localhost:5173"

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Logging
   LOG_LEVEL="info"
   LOG_FILE="logs/app.log"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # Seed the database (optional, for development)
   npm run db:seed
   ```

## 🏃‍♂️ Running the Server

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:3001` with hot reload enabled.

### Production Mode
```bash
npm run build
npm start
```

## 📊 Database Schema

The application uses the following main entities:

- **Users** - Authentication and user profiles
- **Servers** - Discord-like servers with members
- **Channels** - Text/voice channels within servers
- **Messages** - Channel messages with author information
- **DirectMessages** - Private messages between users
- **ServerMembers** - Server membership with roles

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

### Servers
- `GET /api/servers/user` - Get user's servers
- `GET /api/servers/search?q=query` - Search servers
- `POST /api/servers` - Create server
- `GET /api/servers/:id` - Get server by ID
- `PUT /api/servers/:id` - Update server
- `DELETE /api/servers/:id` - Delete server
- `GET /api/servers/:id/members` - Get server members
- `POST /api/servers/:id/members` - Add server member
- `PUT /api/servers/:id/members/:userId` - Update member role
- `DELETE /api/servers/:id/members/:userId` - Remove member

### Messages
- `POST /api/messages` - Create message
- `GET /api/messages/channel/:channelId` - Get channel messages
- `GET /api/messages/channel/:channelId/after/:messageId` - Get messages after specific message
- `GET /api/messages/channel/:channelId/window/:minutes` - Get messages within time window
- `GET /api/messages/channel/:channelId/search?q=query` - Search messages
- `GET /api/messages/:id` - Get message by ID
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

### Health & Documentation
- `GET /health` - Health check endpoint
- `GET /api` - API documentation

## 🔧 Development Tools

### Prisma Studio
```bash
npm run db:studio
```
Open Prisma Studio to view and edit your database.

### Database Management
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy
```

## 📝 Logging

The application uses Winston for structured logging:

- **Development**: Logs to console and files
- **Production**: Logs to files only
- **Log Files**: `logs/error.log` and `logs/combined.log`
- **Log Levels**: error, warn, info, debug

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent API abuse
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Joi schema validation
- **Password Hashing** - bcrypt with salt rounds
- **SQL Injection Prevention** - Prisma ORM

## 🧪 Testing Data

The seed script creates realistic test data:

- **4 Users** with different usernames and emails
- **4 Servers** with various themes
- **16 Channels** (text, voice, category)
- **50+ Messages** across channels
- **Direct Messages** between users

**Test User Credentials:**
- user1@example.com / password123
- user2@example.com / password456
- user3@example.com / password789
- user4@example.com / password000

## 🔄 Frontend Integration

The backend is designed to work seamlessly with the existing frontend:

1. **CORS** is configured for `http://localhost:5173` (Vite dev server)
2. **JWT tokens** are sent in Authorization headers
3. **API responses** follow a consistent format
4. **Error handling** provides clear feedback

## 🚨 Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (in development)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication errors)
- `404` - Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## 📈 Performance

- **Compression** - Gzip compression for responses
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Database Indexing** - Optimized queries with Prisma
- **Connection Pooling** - Efficient database connections

## 🌍 Environment Variables

All configuration is done through environment variables. See `.env.example` for all available options.

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Documentation](https://jwt.io/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
