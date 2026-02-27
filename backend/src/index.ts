import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { securityProfileRouter } from "./routes/security-profile.js";
import { vaultRouter } from "./routes/vault.js";
import { initDatabase } from "./lib/sequelize.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/security-profile", securityProfileRouter);
app.use("/vault", vaultRouter);

async function start() {
  await initDatabase();
  app.listen(port, () => {
    console.log(`EFAS server listening on port ${port}`);
  });
}

start();
