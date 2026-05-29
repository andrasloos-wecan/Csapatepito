import { Router } from "express";
import { prisma } from "../db.js";

/**
 * Résztvevői portál — token-link alapú hozzáférés, nincs jelszó.
 * URL: /p/:token → frontend, ami innen tölti a részleteket.
 */
const router = Router();

async function loadByToken(token) {
  const p = await prisma.participant.findUnique({
    where: { accessToken: token },
    include: {
      event: {
        include: {
          organization: true,
          eventActivities: {
            include: { activity: true },
            orderBy: { startTime: "asc" },
          },
          polls: { where: { closedAt: null } },
        },
      },
    },
  });
  return p;
}

router.get("/:token", async (req, res, next) => {
  try {
    const p = await loadByToken(req.params.token);
    if (!p) return res.status(404).json({ error: "Érvénytelen link." });

    const teamMates = p.team
      ? await prisma.participant.findMany({
          where: { eventId: p.eventId, team: p.team },
          select: { id: true, name: true },
        })
      : [];

    res.json({
      participant: {
        id: p.id,
        name: p.name,
        email: p.email,
        dietary: safeParse(p.dietary, []),
        team: p.team,
        rsvp: p.rsvp,
        accessibility: p.accessibility,
      },
      event: {
        id: p.event.id,
        name: p.event.name,
        startDate: p.event.startDate,
        endDate: p.event.endDate,
        location: p.event.location,
        description: p.event.description,
        status: p.event.status,
        agenda: p.event.eventActivities.map((it) => ({
          id: it.id,
          title: it.customTitle || it.activity?.name,
          startTime: it.startTime,
          durationMin: it.durationMin,
          lane: it.lane,
          notes: it.notes,
          steps: safeParse(it.activity?.steps, []),
          imageEmoji: it.activity?.imageEmoji || "✦",
        })),
        polls: p.event.polls.map((pl) => ({
          id: pl.id,
          type: pl.type,
          question: pl.question,
          options: safeParse(pl.options, []),
        })),
        organization: {
          name: p.event.organization.name,
          primaryColor: p.event.organization.primaryColor,
          logoUrl: p.event.organization.logoUrl,
        },
      },
      teamMates,
    });
  } catch (e) {
    next(e);
  }
});

// RSVP + étkezés frissítés
router.post("/:token/rsvp", async (req, res, next) => {
  try {
    const p = await prisma.participant.findUnique({
      where: { accessToken: req.params.token },
    });
    if (!p) return res.status(404).json({ error: "Érvénytelen link." });

    const { rsvp, dietary, accessibility } = req.body;
    const data = {};
    if (["YES", "NO", "MAYBE"].includes(rsvp)) data.rsvp = rsvp;
    if (Array.isArray(dietary)) data.dietary = JSON.stringify(dietary);
    if (accessibility !== undefined) data.accessibility = accessibility;

    const updated = await prisma.participant.update({
      where: { id: p.id },
      data,
    });
    res.json({ ok: true, rsvp: updated.rsvp });
  } catch (e) {
    next(e);
  }
});

// Élő poll-ra szavazás
router.post("/:token/polls/:pollId/vote", async (req, res, next) => {
  try {
    const p = await prisma.participant.findUnique({
      where: { accessToken: req.params.token },
    });
    if (!p) return res.status(404).json({ error: "Érvénytelen link." });

    const poll = await prisma.poll.findFirst({
      where: { id: req.params.pollId, eventId: p.eventId, closedAt: null },
    });
    if (!poll) return res.status(404).json({ error: "Szavazás nem található." });

    const { answer } = req.body;
    if (!answer) return res.status(400).json({ error: "Hiányzó válasz." });

    await prisma.pollVote.create({
      data: { pollId: poll.id, participantId: p.id, answer: String(answer) },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Post-event feedback (token-link alapon)
router.post("/:token/feedback", async (req, res, next) => {
  try {
    const p = await prisma.participant.findUnique({
      where: { accessToken: req.params.token },
    });
    if (!p) return res.status(404).json({ error: "Érvénytelen link." });

    const { nps, rating, text, anonymous } = req.body;
    const fb = await prisma.feedback.create({
      data: {
        eventId: p.eventId,
        participantId: anonymous ? null : p.id,
        nps: nps != null ? Number(nps) : null,
        rating: rating != null ? Number(rating) : null,
        text: text || "",
        anonymous: !!anonymous,
      },
    });
    res.json({ ok: true, id: fb.id });
  } catch (e) {
    next(e);
  }
});

function safeParse(s, f) {
  try {
    return JSON.parse(s);
  } catch {
    return f;
  }
}

export default router;
