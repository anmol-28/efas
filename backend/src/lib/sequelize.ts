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
  await db.query(`
    CREATE TABLE IF NOT EXISTS revoked_tokens (
      jti text PRIMARY KEY,
      expires_at timestamp NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    );
  `);
}
