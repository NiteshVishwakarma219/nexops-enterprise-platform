const asyncHandler = require('../utils/asyncHandler');
const seedDatabase = require('../utils/seedDatabase');

/**
 * POST /api/admin/seed
 * Seeds the connected database with demo data. Protected by ADMIN_KEY.
 * Pass ?force=true to wipe and reseed even if data already exists.
 */
const runSeed = asyncHandler(async (req, res) => {
  const force = req.query.force === 'true';
  const result = await seedDatabase({ force });
  res.json(result);
});

module.exports = { runSeed };
