# Onchain Fantasy Backend

A TypeScript/Node.js backend API for the Onchain Fantasy Game built with Express.js and MongoDB.

## Features

- **MVC Architecture**: Clean separation of concerns with Models, Views (Controllers), and Services
- **MongoDB Integration**: Persistent data storage for tournaments and participants
- **RESTful API**: Well-structured endpoints for tournament management
- **TypeScript**: Full type safety and better development experience
- **CORS Support**: Configured for frontend integration

## API Endpoints

### Tournaments
- `GET /api/tournaments` - Get all tournaments (with optional sport filter)
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments` - Create new tournament
- `POST /api/tournaments/:id/join` - Join tournament
- `GET /api/tournaments/:id/participants` - Get tournament participants

### Health
- `GET /health` - Health check endpoint

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/onchain_fantasy
DATABASE_NAME=onchain_fantasy

# Server Configuration
PORT=8000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB (if running locally):
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development server:
```bash
npm run dev
```

## Tournament Data Model

Tournaments have the following fields:
- `name`: Tournament name
- `sport`: Sport type (cricket, football, basketball, etc.)
- `entry_fee`: Entry fee in ETH (as string)
- `prize_pool`: Prize pool in ETH (as string)
- `status`: Tournament status (Active, Inactive, Completed, Cancelled)
- `participants`: Current number of participants
- `max_participants`: Maximum number of participants
- `contract_address`: Blockchain contract address
- `creator_address`: Creator's wallet address
- `end_time`: Tournament end time
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Project Structure

```
src/
├── config/
│   └── database.ts          # Database connection
├── controllers/
│   └── TournamentController.ts  # Tournament business logic
├── models/
│   ├── Tournament.ts        # TypeScript interfaces
│   └── TournamentSchema.ts  # Mongoose schemas
├── routes/
│   ├── tournaments.ts       # Tournament routes
│   └── health.ts           # Health check routes
├── services/
│   └── TournamentService.ts # Data access layer
└── index.ts                # Application entry point
```

## Development

- **Build**: `npm run build`
- **Start**: `npm start`
- **Dev**: `npm run dev`
- **Test**: `npm test`
