import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import activityRoutes from "./routes/activities.js";
import participantRoutes from "./routes/participants.js";
import commentRoutes from "./routes/comments.js";
import pollRoutes from "./routes/polls.js";
import feedbackRoutes from "./routes/feedback.js";
import exportRoutes from "./routes/export.js";
import organizationRoutes from "./routes/organization.js";
import participantPortalRoutes from "./routes/participantPortal.js";
import { reminderTick } from "./jobs/reminders.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/auth", authRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/p", participantPortalRoutes); // résztvevői token-alapú nézet

app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Belső szerverhiba." });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`[csapatepito] szerver fut: http://localhost:${port}`);
});

setInterval(() => reminderTick().catch((e) => console.error("[reminder]", e)), 60_000);
