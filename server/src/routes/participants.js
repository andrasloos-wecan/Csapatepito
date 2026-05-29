import { Router } from "express";
import { nanoid } from "nanoid";
import { parse as parseCsv } from "csv-parse/sync";
import { prisma } from "../db.js";
import { requireUser } from "../middleware/auth.js";
import { RSVP } from "../utils/enums.js";

const router = Router();
router.use(requireUser);

// GET /api/participants?eventId=...
router.get("/", async (req, res, next) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: "eventId kötelező." });
    const evt = await prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const participants = await prisma.participant.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
    res.json({ participants: participants.map(decorate) });
  } catch (e) {
    next(e);
  }
});

// POST /api/participants — egyszeri hozzáadás (token-link generálással)
router.post("/", async (req, res, next) => {
  try {
    const { eventId, name, email, team } = req.body;
    if (!eventId || !name)
      return res.status(400).json({ error: "eventId és név kötelező." });

    const evt = await prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const p = await prisma.participant.create({
      data: {
        eventId,
        name,
        email: email || null,
        team: team || null,
        accessToken: nanoid(24),
      },
    });
    res.json({ participant: decorate(p) });
  } catch (e) {
    next(e);
  }
});

// POST /api/participants/bulk — email-lista beillesztéssel (egy sor egy résztvevő)
router.post("/bulk", async (req, res, next) => {
  try {
    const { eventId, lines } = req.body;
    if (!eventId || !Array.isArray(lines))
      return res.status(400).json({ error: "eventId és lines tömb kötelező." });

    const evt = await prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const created = [];
    for (const raw of lines) {
      const line = String(raw).trim();
      if (!line) continue;
      let name, email;
      if (line.includes(",")) {
        const [n, e] = line.split(",").map((s) => s.trim());
        name = n;
        email = e;
      } else if (line.includes("<") && line.includes(">")) {
        name = line.split("<")[0].trim();
        email = line.split("<")[1].replace(">", "").trim();
      } else if (line.includes("@")) {
        email = line;
        name = line.split("@")[0];
      } else {
        name = line;
      }
      if (!name) continue;
      const p = await prisma.participant.create({
        data: {
          eventId,
          name,
          email: email || null,
          accessToken: nanoid(24),
        },
      });
      created.push(decorate(p));
    }
    res.json({ created });
  } catch (e) {
    next(e);
  }
});

// POST /api/participants/csv — CSV import (name,email,team,dietary,accessibility)
router.post("/csv", async (req, res, next) => {
  try {
    const { eventId, csv } = req.body;
    if (!eventId || !csv)
      return res.status(400).json({ error: "eventId és csv kötelező." });

    const evt = await prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const rows = parseCsv(csv, { columns: true, skip_empty_lines: true, trim: true });
    const created = [];
    for (const r of rows) {
      if (!r.name) continue;
      const dietary = r.dietary
        ? r.dietary
            .split(/[;|]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      const p = await prisma.participant.create({
        data: {
          eventId,
          name: r.name,
          email: r.email || null,
          team: r.team || null,
          accessibility: r.accessibility || "",
          dietary: JSON.stringify(dietary),
          accessToken: nanoid(24),
        },
      });
      created.push(decorate(p));
    }
    res.json({ created });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/participants/:id — szervezői módosítás
router.patch("/:id", async (req, res, next) => {
  try {
    const p = await prisma.participant.findFirst({
      where: {
        id: req.params.id,
        event: { organizationId: req.user.organizationId },
      },
    });
    if (!p) return res.status(404).json({ error: "Résztvevő nem található." });

    const allowed = ["name", "email", "team", "rsvp", "accessibility"];
    const data = {};
    for (const k of allowed) {
      if (req.body[k] === undefined) continue;
      if (k === "rsvp" && !RSVP.includes(req.body.rsvp)) continue;
      data[k] = req.body[k];
    }
    if (Array.isArray(req.body.dietary))
      data.dietary = JSON.stringify(req.body.dietary);

    const updated = await prisma.participant.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ participant: decorate(updated) });
  } catch (e) {
    next(e);
  }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
  try {
    const p = await prisma.participant.findFirst({
      where: {
        id: req.params.id,
        event: { organizationId: req.user.organizationId },
      },
    });
    if (!p) return res.status(404).json({ error: "Résztvevő nem található." });
    await prisma.participant.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Meghívó-link
router.get("/:id/invite-link", async (req, res, next) => {
  try {
    const p = await prisma.participant.findFirst({
      where: {
        id: req.params.id,
        event: { organizationId: req.user.organizationId },
      },
    });
    if (!p) return res.status(404).json({ error: "Résztvevő nem található." });
    const base = process.env.PARTICIPANT_BASE_URL || "http://localhost:5173";
    res.json({ link: `${base}/p/${p.accessToken}` });
  } catch (e) {
    next(e);
  }
});

function decorate(p) {
  return { ...p, dietary: safeParse(p.dietary, []) };
}
function safeParse(s, f) {
  try {
    return JSON.parse(s);
  } catch {
    return f;
  }
}

export default router;
