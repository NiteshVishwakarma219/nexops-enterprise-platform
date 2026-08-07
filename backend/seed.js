/**
 * CLI entry point: `npm run seed`.
 * Delegates to utils/seedDatabase.js (also used by the remote admin route).
 */
require('dotenv').config();
const { connectDB, prisma } = require('./config/db');
const seedDatabase = require('./utils/seedDatabase');

(async () => {
  await connectDB();
  const result = await seedDatabase();
  if (!result.seeded) {
    console.log(result.message);
  } else {
    console.log(result.message);
    console.log('\nDemo accounts (each role has its own password):');
    result.accounts.forEach((a) => console.log(`  ${a.role.padEnd(9)} ${a.email.padEnd(24)} ${a.password}`));
    console.log('\nNote: these use fictitious @nexops.com addresses, so no email is sent for');
    console.log('them. Real accounts created via Employees > Add Employee DO get an automatic');
    console.log('credentials email, since they use real addresses.');
  }
  await prisma.$disconnect();
  process.exit(0);
})().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
