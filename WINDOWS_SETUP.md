
# Windows Setup Guide

## Prerequisites

1. **Node.js**: Download and install from [nodejs.org](https://nodejs.org/) (LTS version recommended)
2. **PostgreSQL**: Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)
3. **Git**: Download from [git-scm.com](https://git-scm.com/download/win)

## Database Setup

1. After installing PostgreSQL, open pgAdmin or use psql command line
2. Create a new database:
   ```sql
   CREATE DATABASE genzinternational;
   ```
3. Update the `.env` file with your database credentials:
   ```
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/genzinternational
   ```

## Installation Steps

1. Open Command Prompt (cmd) as Administrator
2. Navigate to your project directory
3. Install dependencies:
   ```cmd
   npm install
   ```
4. Install additional required packages:
   ```cmd
   npm install pg dotenv
   npm install -D @types/pg
   ```
5. Set up your environment variables in `.env` file
6. Run database migrations:
   ```cmd
   npm run db:push
   ```
7. Start the development server:
   ```cmd
   npm run dev
   ```

## Google Sheets Setup (Optional)

1. Place your `credentials.json` file in the project root
2. Update the `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`

## Running the Application

- Development: `npm run dev`
- Production build: `npm run build`
- Production start: `npm run start`

The application will be available at `http://localhost:5000`

## Troubleshooting

- If you get permission errors, run cmd as Administrator
- Make sure PostgreSQL service is running
- Check that all environment variables are set correctly in `.env`
