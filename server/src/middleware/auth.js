import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, organizationId: user.organizationId, role: user.role },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "30d" }
  );
}

export async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Hiányzó token." });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { organization: true },
    });
    if (!user) return res.status(401).json({ error: "Felhasználó nem található." });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Érvénytelen token." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN")
    return res.status(403).json({ error: "Csak admin." });
  next();
}
