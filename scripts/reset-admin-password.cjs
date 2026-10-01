/**
 * Safe Admin Password Reset Utility
 * Updates the password hash of the existing admin account in MongoDB Atlas
 * using the configured ADMIN_EMAIL and ADMIN_PASSWORD from .env
 *
 * Safety Guarantees:
 * - Does NOT create duplicate admins
 * - Does NOT delete or alter any orders
 * - Does NOT change the database schema
 * - Does NOT expose the password or hash in output logs
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[Error] MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'wecare@makheindia.com').trim().toLowerCase();
  const newPassword = process.env.ADMIN_PASSWORD;

  if (!newPassword || newPassword.trim().length === 0) {
    console.error('[Error] ADMIN_PASSWORD is empty or not set in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);

    const adminCol = mongoose.connection.db.collection('admins');
    const existing = await adminCol.findOne({ email: adminEmail });

    if (!existing) {
      console.error(`[Error] No existing admin account found with email: ${adminEmail}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    const newHash = await bcrypt.hash(newPassword.trim(), 10);

    const result = await adminCol.updateOne(
      { email: adminEmail },
      {
        $set: {
          passwordHash: newHash,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0 || result.matchedCount > 0) {
      console.log(`[Success] Password hash safely updated for existing admin: ${adminEmail}`);
      console.log('[Notice] The same admin ID was retained. No orders were touched.');
    } else {
      console.log('[Notice] Password update completed with no changes detected.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('[Error] Database connection error during password reset:', err.message);
    process.exit(1);
  }
}

resetAdminPassword();
