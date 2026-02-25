# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running
- Git installed

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
Make sure PostgreSQL is running, then run:
```bash
# Generate Prisma Client
npx prisma generate

# Create and apply database migrations
npx prisma migrate dev --name init
```

### Step 3: Start Development Server
```bash
npm run dev
```

Server will start at http://localhost:3000

### Step 4: Test the API

**Using cURL:**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"doc@fluxkart.com","phoneNumber":"999999"}'
```

**Using Postman:**
- Import `Bitespeed.postman_collection.json`
- Run any request from the collection

## Common Issues

### Database Connection Error
If you see "Can't reach database server":
1. Ensure PostgreSQL is running
2. Check your `.env` file has correct DATABASE_URL
3. Default: `postgresql://postgres:postgres@localhost:5432/bitespeed?schema=public`

### Port Already in Use
If port 3000 is busy, change PORT in `.env` file:
```
PORT=8080
```

### Prisma Migration Issues
Reset database (⚠️ deletes all data):
```bash
npx prisma migrate reset
```

## View Database
Open Prisma Studio to view your data:
```bash
npx prisma studio
```

## Production Build
```bash
npm run build
npm start
```

## Environment Variables
Copy `.env.example` to `.env` and update values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: development or production

## Next Steps
1. Read the full README.md for detailed documentation
2. Test all API scenarios using the Postman collection
3. Deploy to Render.com following deployment instructions
4. Add your live URL to README.md

## Need Help?
- Check logs for error messages
- Ensure all dependencies are installed
- Verify PostgreSQL is accessible
- Try `npm install` again if issues persist

Happy coding! 🎉
