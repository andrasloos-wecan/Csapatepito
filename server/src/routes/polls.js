import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser } from "../middleware/auth.js";
import { POLL_TYPE } from "../utils/enums.js";

const router = Router();
router.use(requireUser);

// GET /api/polls?eventId=...
router.get("/", async (req, res, next) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: "eventId kötelező." });
    const evt = await prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const polls = await prisma.poll.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { votes: true } }, votes: true },
    });
    res.json({
      polls: polls.map((p) => ({
        ...p,
        options: safeParse(p.options, []),
        tallies: tally(p.votes),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { eventId, type, question, options } = req.body;
    if (!eventId || !question)
      return res.status(400).json({ error: "Hiányzó eventId vagy kérdés." });

    const evt = await prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const t = POLL_TYPE.includes(type) ? type : "MOOD";
    const poll = await prisma.poll.create({
      data: {
        eventId,
        type: t,
        question,
        options: JSON.stringify(Array.isArray(options) ? options : []),
      },
    });
    res.json({ poll: { ...poll, options: safeParse(poll.options, []) } });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/close", async (req, res, next) => {
  try {
    const p = await prisma.poll.findFirst({
      where: {
        id: req.params.id,
        event: { organizationId: req.user.organizationId },
      },
    });
    if (!p) return res.status(404).json({ error: "Szavazás nem található." });
    const updated = await prisma.poll.update({
      where: { id: req.params.id },
      data: { closedAt: new Date() },
    });
    res.json({ poll: updated });
  } catch (e) {
    next(e);
  }
});

function tally(votes) {
  const t = {};
  for (const v of votes || []) t[v.answer] = (t[v.answer] || 0) + 1;
  return t;
}
function safeParse(s, f) {
  try {
    return JSON.parse(s);
  } catch {
    return f;
  }
}

export default router;
