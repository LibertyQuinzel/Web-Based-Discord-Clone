# Discord Clone

A web-based Discord-inspired communication app. Ready to run with Docker - no setup required!

## **Quick Start**

**Get the app running in one command:**

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Web-Based-Discord-Clone
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Open your browser and go to:**
   - **Frontend App**: http://localhost:5173

That's it! The app is now running and ready to use.

## **How to Stop**

When you're done using the app:
```bash
docker-compose down
```

## **What You Get**

| Service | What it is | How to access |
|---------|------------|---------------|
| **Discord App** | The main chat application | http://localhost:5173 |
| **Backend API** | Powers the app features | http://localhost:3001 |
| **Database** | Stores all your data | Runs automatically |

## **Features**

### **Core Chat Features**
- **Spaces** - Create and join communities (like Discord servers)
- **Rooms** - Text channels for different topics
- **Direct Messages** - Private one-on-one conversations
- **Real-time Messaging** - Instant message delivery
- **@mentions** - Notify specific users
- **Emoji Reactions** - React to messages with emojis

### **User Features**
- **Authentication** - Secure login and registration
- **Friends List** - Add and manage friends
- **Online Status** - See who's online
- **Member Lists** - View everyone in your spaces

### **AI-Powered Features**
- **Manual AI Summary** - Get AI-generated summaries of conversations
- **What You Missed** - Automatic catch-up when you return
- **Search** - Find messages and content quickly

## **System Requirements**

- **Docker** - Download from [docker.com](https://docker.com)
- **Docker Compose** - Usually included with Docker

That's all you need! No Node.js, no database setup, no configuration.

## **Accessing the App**

Once running, simply open your web browser and navigate to:

**http://localhost:5173**

The app will load and you can start using it immediately!

## **Troubleshooting**

### **"Port already in use" error:**
```bash
# Stop other services using ports 5173, 3001, or 5432
# Then try again:
docker-compose up --build
```

### **App won't load:**
```bash
# Check if services are running:
docker-compose ps

# Restart everything:
docker-compose down
docker-compose up --build
```

### **Something went wrong:**
```bash
# Clean start (removes all data):
docker-compose down -v
docker-compose up --build
```

## **Project Overview**

This is a complete Discord-like chat application that runs entirely in Docker. It includes:

- **Frontend**: Modern React interface with Tailwind CSS
- **Backend**: Express.js API server
- **Database**: PostgreSQL for data storage
- **AI Features**: Conversation summaries and smart search

The app is designed to be a drop-in replacement for Discord, with a focus on simplicity and ease of use.

## **Requirements**

- Docker
- Docker Compose

**Total setup time: Less than 5 minutes**
