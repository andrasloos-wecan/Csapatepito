import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { signToken, requireUser } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register — első user létrejön ADMIN-ként + új szervezet
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, organizationName } = req.body;
    if (!email || !password || !name || !organizationName)
      return res.status(400).json({ error: "Hiányzó mezők." });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Ez az email már foglalt." });

    const passwordHash = await bcrypt.hash(password, 10);
    const org = await prisma.organization.create({
      data: { name: organizationName },
    });
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "ADMIN",
        organizationId: org.id,
      },
      include: { organization: true },
    });

    const token = signToken(user);
    res.json({ token, user: serialize(user) });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/invite-organizer — admin új szervezőt vesz fel a saját szervezetébe
router.post("/invite-organizer", requireUser, async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Csak admin." });

    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: "Hiányzó mezők." });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Ez az email már foglalt." });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "ORGANIZER",
        organizationId: req.user.organizationId,
      },
    });

    res.json({ ok: true, user: serialize(user) });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Hiányzó email vagy jelszó." });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
    if (!user) return res.status(401).json({ error: "Hibás belépési adatok." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Hibás belépési adatok." });

    const token = signToken(user);
    res.json({ token, user: serialize(user) });
  } catch (e) {
    next(e);
  }
});

// GET /api/auth/me
router.get("/me", requireUser, async (req, res) => {
  res.json({ user: serialize(req.user) });
});

function serialize(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    organization: user.organization
      ? {
          id: user.organization.id,
          name: user.organization.name,
          primaryColor: user.organization.primaryColor,
          logoUrl: user.organization.logoUrl,
        }
      : null,
  };
}

export default router;
