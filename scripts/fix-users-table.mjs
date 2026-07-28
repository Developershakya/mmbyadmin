// Ye script Users table me createdAt aur updatedAt columns add karti hai
// Run karo (project root se): node scripts/fix-users-table.mjs

import sequelize from '../config/sequelize.js';
import { DataTypes } from 'sequelize';

async function run() {
  const qi = sequelize.getQueryInterface();

  try {
    await qi.addColumn('Users', 'createdAt', {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    });
    console.log('✅ createdAt column added');
  } catch (err) {
    console.log('⚠️ createdAt:', err.message);
  }

  try {
    await qi.addColumn('Users', 'updatedAt', {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    });
    console.log('✅ updatedAt column added');
  } catch (err) {
    console.log('⚠️ updatedAt:', err.message);
  }

  await sequelize.close();
  console.log('Done.');
}

run();