import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser } from "../middleware/auth.js";
import { EVENT_STATUS, EVENT_TYPE } from "../utils/enums.js";

const router = Router();

router.use(requireUser);

// GET /api/events — szervezet összes eseménye, kanban-csoportosításhoz használható
router.get("/", async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizationId: req.user.organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { participants: true, eventActivities: true, feedback: true } },
        participants: { select: { rsvp: true } },
      },
    });
    res.json({ events: events.map(decorate) });
  } catch (e) {
    next(e);
  }
});

// GET /api/events/:id — részletes nézet (a Details B-hez)
router.get("/:id", async (req, res, next) => {
  try {
    const event = await loadEvent(req.params.id, req.user.organizationId);
    if (!event) return res.status(404).json({ error: "Esemény nem található." });
    res.json({ event: decorate(event) });
  } catch (e) {
    next(e);
  }
});

// POST /api/events — új esemény (a wizard-hoz)
router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      type,
      startDate,
      endDate,
      location,
      description,
      expectedHeadcount,
      budgetPlanned,
      goals,
      status,
      voteDeadline,
    } = req.body;

    if (!name) return res.status(400).json({ error: "Kötelező a név." });

    const event = await prisma.event.create({
      data: {
        name,
        type: EVENT_TYPE.includes(type) ? type : "CSAPATNAP",
        status: EVENT_STATUS.includes(status) ? status : "OTLET",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        description: description || null,
        expectedHeadcount: Number(expectedHeadcount) || 0,
        budgetPlanned: Number(budgetPlanned) || 0,
        goals: JSON.stringify(Array.isArray(goals) ? goals : []),
        voteDeadline: voteDeadline ? new Date(voteDeadline) : null,
        createdById: req.user.id,
        organizationId: req.user.organizationId,
      },
    });
    res.json({ event: decorate(event) });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/events/:id — mező-szintű frissítés (kanban státusz is ezen megy)
router.patch("/:id", async (req, res, next) => {
  try {
    const found = await prisma.event.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });
    if (!found) return res.status(404).json({ error: "Esemény nem található." });

    const allowed = [
      "name",
      "type",
      "status",
      "startDate",
      "endDate",
      "location",
      "description",
      "expectedHeadcount",
      "budgetPlanned",
      "budgetActual",
      "voteDeadline",
    ];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] === undefined) continue;
      if (key === "startDate" || key === "endDate" || key === "voteDeadline")
        data[key] = req.body[key] ? new Date(req.body[key]) : null;
      else if (key === "status" && !EVENT_STATUS.includes(req.body.status)) continue;
      else if (key === "type" && !EVENT_TYPE.includes(req.body.type)) continue;
      else if (
        key === "expectedHeadcount" ||
        key === "budgetPlanned" ||
        key === "budgetActual"
      )
        data[key] = Number(req.body[key]) || 0;
      else data[key] = req.body[key];
    }
    if (Array.isArray(req.body.goals)) data.goals = JSON.stringify(req.body.goals);

    const event = await prisma.event.update({ where: { id: req.params.id }, data });
    res.json({ event: decorate(event) });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/events/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const found = await prisma.event.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });
    if (!found) return res.status(404).json({ error: "Esemény nem található." });
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// --------- agenda / EventActivity ---------

// GET /api/events/:id/agenda
router.get("/:id/agenda", async (req, res, next) => {
  try {
    const items = await prisma.eventActivity.findMany({
      where: { eventId: req.params.id, event: { organizationId: req.user.organizationId } },
      orderBy: [{ startTime: "asc" }, { position: "asc" }],
      include: { activity: true },
    });
    res.json({ items: items.map(decorateAgendaItem) });
  } catch (e) {
    next(e);
  }
});

// POST /api/events/:id/agenda — egy programpont hozzáadása
router.post("/:id/agenda", async (req, res, next) => {
  try {
    const evt = await prisma.event.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });
    if (!evt) return res.status(404).json({ error: "Esemény nem található." });

    const { activityId, customTitle, startTime, durationMin, lane, notes } = req.body;
    if (!activityId && !customTitle)
      return res
        .status(400)
        .json({ error: "Kell vagy aktivitás-azonosító, vagy egyedi cím." });

    const item = await prisma.eventActivity.create({
      data: {
        eventId: req.params.id,
        activityId: activityId || null,
        customTitle: customTitle || null,
        startTime: startTime || "09:00",
        durationMin: Number(durationMin) || 30,
        lane: lane || "Fő helyszín",
        notes: notes || "",
      },
      include: { activity: true },
    });
    res.json({ item: decorateAgendaItem(item) });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/agenda/:itemId", async (req, res, next) => {
  try {
    const found = await prisma.eventActivity.findFirst({
      where: {
        id: req.params.itemId,
        eventId: req.params.id,
        event: { organizationId: req.user.organizationId },
      },
    });
    if (!found) return res.status(404).json({ error: "Programpont nem található." });

    const allowed = ["startTime", "durationMin", "lane", "notes", "customTitle", "position"];
    const data = {};
    for (const k of allowed) {
      if (req.body[k] === undefined) continue;
      if (k === "durationMin" || k === "position") data[k] = Number(req.body[k]);
      else data[k] = req.body[k];
    }
    const item = await prisma.eventActivity.update({
      where: { id: req.params.itemId },
      data,
      include: { activity: true },
    });
    res.json({ item: decorateAgendaItem(item) });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id/agenda/:itemId", async (req, res, next) => {
  try {
    const found = await prisma.eventActivity.findFirst({
      where: {
        id: req.params.itemId,
        eventId: req.params.id,
        event: { organizationId: req.user.organizationId },
      },
    });
    if (!found) return res.status(404).json({ error: "Programpont nem található." });
    await prisma.eventActivity.delete({ where: { id: req.params.itemId } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// --------- sablonok ---------

router.post("/:id/save-template", async (req, res, next) => {
  try {
    const event = await loadEvent(req.params.id, req.user.organizationId);
    if (!event) return res.status(404).json({ error: "Esemény nem található." });
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Adj nevet a sablonnak." });

    const snapshot = {
      type: event.type,
      description: event.description,
      goals: JSON.parse(event.goals),
      expectedHeadcount: event.expectedHeadcount,
      agenda: event.eventActivities.map((it) => ({
        activityId: it.activityId,
        customTitle: it.customTitle,
        startTime: it.startTime,
        durationMin: it.durationMin,
        lane: it.lane,
        notes: it.notes,
      })),
    };
    const tpl = await prisma.eventTemplate.create({
      data: {
        organizationId: req.user.organizationId,
        name,
        data: JSON.stringify(snapshot),
      },
    });
    res.json({ template: tpl });
  } catch (e) {
    next(e);
  }
});

async function loadEvent(id, orgId) {
  return prisma.event.findFirst({
    where: { id, organizationId: orgId },
    include: {
      eventActivities: { include: { activity: true }, orderBy: { startTime: "asc" } },
      participants: true,
      comments: true,
      polls: true,
      feedback: true,
      createdBy: { select: { id: true, name: true } },
    },
  });
}

function decorate(event) {
  const participants = event.participants || [];
  const counts = { yes: 0, no: 0, maybe: 0, pending: 0 };
  for (const p of participants) {
    if (p.rsvp === "YES") counts.yes++;
    else if (p.rsvp === "NO") counts.no++;
    else if (p.rsvp === "MAYBE") counts.maybe++;
    else counts.pending++;
  }
  const rsvpYes = counts.yes;
  const total = participants.length || event.expectedHeadcount || 0;
  const rsvpRatio = total ? Math.round((rsvpYes / total) * 100) : 0;
  return {
    ...event,
    goals: safeParse(event.goals, []),
    counts,
    rsvpRatio,
  };
}

function decorateAgendaItem(item) {
  return {
    ...item,
    title: item.customTitle || item.activity?.name || "Programpont",
    category: item.activity?.category || "OTHER",
  };
}

function safeParse(s, fallback) {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

export default router;
