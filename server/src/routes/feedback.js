import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser } from "../middleware/auth.js";

const router = Router();
router.use(requireUser);

// GET /api/feedback?eventId=...  — szervező-oldali összesítő
router.get("/", async (req, res, next) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: "eventId kötelező." });
    const evt = await prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const items = await prisma.feedback.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      include: { participant: { select: { id: true, name: true } } },
    });

    const summary = summarize(items);
    res.json({
      summary,
      items: items.map((it) => ({
        id: it.id,
        nps: it.nps,
        rating: it.rating,
        text: it.text,
        anonymous: it.anonymous,
        createdAt: it.createdAt,
        participant: it.anonymous ? null : it.participant,
      })),
    });
  } catch (e) {
    next(e);
  }
});

function summarize(items) {
  if (!items.length)
    return { count: 0, avgRating: 0, avgNps: 0, npsScore: 0 };
  const ratings = items.map((i) => i.rating).filter((n) => typeof n === "number");
  const npss = items.map((i) => i.nps).filter((n) => typeof n === "number");
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : 0;
  const promoters = npss.filter((n) => n >= 9).length;
  const detractors = npss.filter((n) => n <= 6).length;
  const npsScore = npss.length
    ? Math.round(((promoters - detractors) / npss.length) * 100)
    : 0;
  return {
    count: items.length,
    avgRating,
    avgNps:
      npss.length
        ? Math.round((npss.reduce((a, b) => a + b, 0) / npss.length) * 10) / 10
        : 0,
    npsScore,
  };
}

export default router;
