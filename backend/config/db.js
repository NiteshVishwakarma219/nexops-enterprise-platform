/**
 * Prisma (PostgreSQL) connection. Exports a single shared PrismaClient
 * instance — every controller imports `prisma` from here rather than
 * creating its own client, which avoids exhausting the database's
 * connection pool.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function connectDB() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error(
      'DATABASE_URL is not set. On Render/Vercel/any host, environment variables must be entered\n' +
      'in that platform\'s dashboard directly — .env is gitignored and never gets deployed.\n' +
      'Locally, make sure backend/.env exists and contains DATABASE_URL (a postgresql:// connection string).'
    );
    process.exit(1);
  }
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected via Prisma');
  } catch (err) {
    console.error('Database connection error:', err.message);
    console.error(
      '\nTroubleshooting checklist:\n' +
      '  1. Is DATABASE_URL a valid postgresql:// connection string?\n' +
      '  2. Have you run `npx prisma migrate deploy` (or `prisma migrate dev` locally) to create the tables?\n' +
      '  3. Is the database reachable from this network (security group / firewall / RDS public access)?\n' +
      '  4. Is the username/password correct? Special characters must be URL-encoded.\n'
    );
    process.exit(1);
  }
}

module.exports = { prisma, connectDB };
