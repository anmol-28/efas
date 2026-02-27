import { Sequelize } from "sequelize";

let sequelize: Sequelize | null = null;

export function getSequelize() {
  if (sequelize) return sequelize;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add it to backend/.env.");
  }

  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false
  });

  return sequelize;
}

export async function initDatabase() {
  const db = getSequelize();
  await db.authenticate();
}
