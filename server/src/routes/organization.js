import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { prisma } from "../db.js";
import { requireUser } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `org-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const router = Router();

router.get("/", requireUser, async (req, res, next) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      include: { users: { select: { id: true, name: true, email: true, role: true } } },
    });
    res.json({ organization: org });
  } catch (e) {
    next(e);
  }
});

router.patch("/", requireUser, async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Csak admin változtathat." });
    const { name, primaryColor } = req.body;
    const updated = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(primaryColor !== undefined ? { primaryColor } : {}),
      },
    });
    res.json({ organization: updated });
  } catch (e) {
    next(e);
  }
});

router.post("/logo", requireUser, upload.single("logo"), async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Csak admin változtathat." });
    if (!req.file) return res.status(400).json({ error: "Hiányzó fájl." });
    const logoUrl = `/uploads/${req.file.filename}`;
    const updated = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: { logoUrl },
    });
    res.json({ organization: updated });
  } catch (e) {
    next(e);
  }
});

export default router;
