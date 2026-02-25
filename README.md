# Bitespeed Identity Reconciliation Service

Production-ready backend service for FluxKart customer identity tracking and reconciliation.

## Features

- **Identity Reconciliation**: Automatically links customer contacts based on email and phone number
- **Primary/Secondary Contact Management**: Maintains contact hierarchy with oldest as primary
- **Smart Merging**: Automatically merges multiple primary contacts when new information connects them
- **PostgreSQL Database**: Reliable data storage with Prisma ORM
- **Modern Web Interface**: Beautiful, responsive frontend for easy testing
- **RESTful API**: Well-documented JSON API
- **Production Ready**: Built with TypeScript, Express, and deployed on Render
- **Clean Architecture**: Organized codebase with controllers, services, and routes

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Deployment**: Render.com

## Project Structure

```
bitespeed-identity-reconciliation/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Frontend files
│   ├── index.html            # Web interface
│   ├── styles.css            # Styling
│   └── app.js                # Frontend JavaScript
├── src/
│   ├── controllers/           # Request handlers
│   │   └── identity.controller.ts
│   ├── services/              # Business logic
│   │   └── identity.service.ts
│   ├── routes/                # API routes
│   │   └── identity.routes.ts
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.ts
│   │   └── validator.ts
│   ├── lib/                   # Utilities
│   │   └── prisma.ts
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── render.yaml                # Render deployment config
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bitespeed-identity-reconciliation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/bitespeed?schema=public"
   PORT=3000
   NODE_ENV=development
   ```

4. **Setup database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   ```

5. **Run development server**
   ```bash

6. **Access the application**
   - **Web Interface**: Open `http://localhost:3000` in your browser
   - **API Endpoint**: `http://localhost:3000/identify`
   - **Health Check**: `http://localhost:3000/health`

## Using the Web Interface

The project includes a beautiful, modern web interface for easy testing:

1. Open your browser and navigate to `http://localhost:3000`
2. Enter email and/or phone number in the form
3. Click "Identify Contact" to see results
4. Try the example scenarios provided on the page

**Features:**
- Modern, responsive design
- Real-time validation
- Visual display of contact relationships
- Live API status indicator
- Mobile-friendly interface
   npm run dev
   ```
   
   Server will start at `http://localhost:3000`

## API Usage

### Endpoint: POST /identify

Identifies and reconciles customer identity based on email and phone number.

#### Request

```http
POST /identify
Content-Type: application/json

{
  "email": "doc@fluxkart.com",
  "phoneNumber": "999999"
}
```

**Note**: At least one of `email` or `phoneNumber` must be provided.

#### Response

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["doc@fluxkart.com", "another@fluxkart.com"],
    "phoneNumbers": ["999999", "888888"],
    "secondaryContactIds": [2, 3]
  }
}
```

### Example Scenarios

#### Scenario 1: First Contact (New Customer)

**Request:**
```json
{
  "email": "doc@fluxkart.com",
  "phoneNumber": "999999"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["doc@fluxkart.com"],
    "phoneNumbers": ["999999"],
    "secondaryContactIds": []
  }
}
```

#### Scenario 2: Same Customer, New Email

**Request:**
```json
{
  "email": "newemail@fluxkart.com",
  "phoneNumber": "999999"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["doc@fluxkart.com", "newemail@fluxkart.com"],
    "phoneNumbers": ["999999"],
    "secondaryContactIds": [2]
  }
}
```

#### Scenario 3: Merging Two Primary Contacts

**Initial State:**
- Contact 1: email=george@hillvalley.edu, phone=919191 (primary)
- Contact 2: email=biffsucks@hillvalley.edu, phone=717171 (primary)

**Request:**
```json
{
  "email": "george@hillvalley.edu",
  "phoneNumber": "717171"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["george@hillvalley.edu", "biffsucks@hillvalley.edu"],
    "phoneNumbers": ["919191", "717171"],
    "secondaryContactIds": [2]
  }
}
```

### Testing with cURL

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doc@fluxkart.com",
    "phoneNumber": "999999"
  }'
```

### Testing with Postman

1. Create a new POST request
2. URL: `http://localhost:3000/identify`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
   ```json
   {
     "email": "doc@fluxkart.com",
     "phoneNumber": "999999"
   }
   ```

## Deployment Instructions

### Deploy to Render.com

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a PostgreSQL database**
   - Go to Dashboard → New → PostgreSQL
   - Choose a name (e.g., `bitespeed-db`)
   - Select Free plan
   - Click "Create Database"
   - Copy the "Internal Database URL"

3. **Create a Web Service**
   - Go to Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: bitespeed-identity-service
     - **Environment**: Node
     - **Region**: Oregon (or your preferred region)
     - **Branch**: main
     - **Build Command**: `npm install && npx prisma generate && npm run build`
     - **Start Command**: `npx prisma migrate deploy && npm start`
     - **Plan**: Free

4. **Add Environment Variables**
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Add `NODE_ENV` with value `production`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete
   - Your API will be available at `https://your-service-name.onrender.com`

### Alternative: Deploy using render.yaml

1. Push the `render.yaml` file to your repository
2. In Render dashboard, go to "Blueprints"
3. Click "New Blueprint Instance"
4. Connect your repository
5. Render will automatically create both the database and web service

## Running Tests

```bash
# Add your test command here
npm test
```

## Database Schema

```prisma
model Contact {
  id              Int       @id @default(autoincrement())
  phoneNumber     String?
  email           String?
  linkedId        Int?
  linkPrecedence  String    // "primary" or "secondary"
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  @@index([email])
  @@index([phoneNumber])
  @@index([linkedId])
}
```

## How Identity Reconciliation Works

1. **No Existing Contacts**: Creates a new primary contact
2. **Matching Contact Found**: Links to existing primary contact
3. **New Information Detected**: Creates secondary contact with new data
4. **Multiple Primaries Connected**: Merges primaries (oldest stays primary)

### Key Rules

- Contacts are linked if they share email OR phone number
- Oldest contact in a group is always the primary
- All others are secondary and point to the primary via `linkedId`
- When primaries merge, all their secondaries are updated

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma migrate dev` - Create and apply database migration
- `npx prisma migrate deploy` - Apply migrations in production
- `npx prisma generate` - Generate Prisma client
- `npx prisma studio` - Open Prisma Studio (database GUI)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |

## API Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "success",
  "message": "Service is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Built for the Bitespeed Backend Task

## Acknowledgments

- Bitespeed for the interesting problem statement
- FluxKart.com use case
- Dr. Emmett Brown for being an inspiring customer 🚀

---

**Live API Endpoint**: [Add your deployed URL here after deployment]

**Example Request to Live API**:
```bash
curl -X POST https://your-service.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"doc@fluxkart.com","phoneNumber":"999999"}'
```
