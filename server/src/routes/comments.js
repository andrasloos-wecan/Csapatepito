import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser } from "../middleware/auth.js";
import { COMMENT_BLOCK } from "../utils/enums.js";

const router = Router();
router.use(requireUser);

// GET /api/comments?eventId=...
router.get("/", async (req, res, next) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: "eventId kötelező." });

    const evt = await prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const comments = await prisma.comment.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
    res.json({ comments });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { eventId, blockKey, content } = req.body;
    if (!eventId || !blockKey || !content)
      return res.status(400).json({ error: "Hiányzó mező." });
    if (!COMMENT_BLOCK.includes(blockKey))
      return res.status(400).json({ error: "Ismeretlen blokk." });

    const evt = await prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const c = await prisma.comment.create({
      data: {
        eventId,
        blockKey,
        content,
        authorUserId: req.user.id,
        authorName: req.user.name,
      },
    });
    res.json({ comment: c });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const c = await prisma.comment.findFirst({
      where: {
        id: req.params.id,
        event: { organizationId: req.user.organizationId },
      },
    });
    if (!c) return res.status(404).json({ error: "Komment nem található." });
    if (c.authorUserId && c.authorUserId !== req.user.id && req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Csak a szerző vagy admin törölheti." });

    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
