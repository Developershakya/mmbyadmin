import { newDb } from "pg-mem";
import { Sequelize } from "sequelize";

// In-memory pure JavaScript PostgreSQL database for Sequelize
const db = newDb();
const pg = db.adapters.createPg();

const sequelize = new Sequelize({
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

export default sequelize;
