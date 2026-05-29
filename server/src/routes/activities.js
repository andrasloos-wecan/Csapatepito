import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser } from "../middleware/auth.js";
import { ACTIVITY_CATEGORY, ENERGY_LEVEL } from "../utils/enums.js";

const router = Router();

router.use(requireUser);

// GET /api/activities — szűrhető lista (a könyvtárhoz)
router.get("/", async (req, res, next) => {
  try {
    const { q, category, minSize, maxSize, durationMax, indoor, outdoor, energy } =
      req.query;

    const where = {
      AND: [
        {
          OR: [
            { organizationId: null }, // globális seed
            { organizationId: req.user.organizationId }, // saját
          ],
        },
      ],
    };
    if (q)
      where.AND.push({
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      });
    if (category && ACTIVITY_CATEGORY.includes(category))
      where.AND.push({ category });
    if (minSize) where.AND.push({ minSize: { lte: Number(minSize) } });
    if (maxSize) where.AND.push({ maxSize: { gte: Number(maxSize) } });
    if (durationMax) where.AND.push({ durationMin: { lte: Number(durationMax) } });
    if (indoor === "true") where.AND.push({ indoor: true });
    if (outdoor === "true") where.AND.push({ outdoor: true });
    if (energy && ENERGY_LEVEL.includes(energy)) where.AND.push({ energyLevel: energy });

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { name: "asc" },
    });
    res.json({ activities: activities.map(decorate) });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const a = await prisma.activity.findFirst({
      where: {
        id: req.params.id,
        OR: [{ organizationId: null }, { organizationId: req.user.organizationId }],
      },
    });
    if (!a) return res.status(404).json({ error: "Aktivitás nem található." });
    res.json({ activity: decorate(a) });
  } catch (e) {
    next(e);
  }
});

// POST /api/activities — saját egyedi aktivitás
router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      minSize,
      maxSize,
      durationMin,
      indoor,
      outdoor,
      energyLevel,
      materials,
      steps,
      tips,
      variations,
      imageEmoji,
    } = req.body;
    if (!name || !category)
      return res.status(400).json({ error: "Név és kategória kötelező." });
    if (!ACTIVITY_CATEGORY.includes(category))
      return res.status(400).json({ error: "Ismeretlen kategória." });

    const a = await prisma.activity.create({
      data: {
        name,
        description: description || "",
        category,
        minSize: Number(minSize) || 4,
        maxSize: Number(maxSize) || 50,
        durationMin: Number(durationMin) || 30,
        indoor: indoor !== false,
        outdoor: !!outdoor,
        energyLevel: ENERGY_LEVEL.includes(energyLevel) ? energyLevel : "KOZEPES",
        materials: materials || "",
        steps: JSON.stringify(Array.isArray(steps) ? steps : []),
        tips: tips || "",
        variations: variations || "",
        imageEmoji: imageEmoji || "✦",
        isCustom: true,
        organizationId: req.user.organizationId,
      },
    });
    res.json({ activity: decorate(a) });
  } catch (e) {
    next(e);
  }
});

function decorate(a) {
  return { ...a, steps: safeParse(a.steps, []) };
}
function safeParse(s, f) {
  try {
    return JSON.parse(s);
  } catch {
    return f;
  }
}

export default router;
