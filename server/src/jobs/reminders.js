import { prisma } from "../db.js";
import nodemailer from "nodemailer";

// Belsős eszköz: ha nincs SMTP konfigurálva, a "küldés" csak console-ra logol.
const transporter =
  process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      })
    : null;

const SENT = new Map(); // { eventId+kind: true } — egyszerű memóriás dedup

export async function reminderTick() {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      status: "VEGLEGES",
      startDate: { gt: now },
    },
    include: { participants: true, organization: true },
  });

  for (const e of events) {
    const daysToStart = Math.round(
      (new Date(e.startDate).getTime() - now.getTime()) / 86_400_000
    );
    if (daysToStart === 7) await sendReminder(e, "T-7");
    if (daysToStart === 1) await sendReminder(e, "T-1");
  }
}

async function sendReminder(event, kind) {
  const key = `${event.id}:${kind}`;
  if (SENT.has(key)) return;
  SENT.set(key, true);

  for (const p of event.participants) {
    if (!p.email) continue;
    const base = process.env.PARTICIPANT_BASE_URL || "http://localhost:5173";
    const link = `${base}/p/${p.accessToken}`;
    const subject = `${kind === "T-7" ? "Egy hét múlva" : "Holnap"}: ${event.name}`;
    const body =
      `Kedves ${p.name}!\n\n` +
      `Emlékeztetünk a közelgő ${event.name} eseményre.\n` +
      (event.location ? `Helyszín: ${event.location}\n` : "") +
      `Időpont: ${new Date(event.startDate).toLocaleString("hu-HU")}\n\n` +
      `A részleteket itt nézheted meg és állíthatod az RSVP-d:\n${link}\n\n` +
      `Üdv,\n${event.organization.name}`;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || "csapatepito@example.com",
          to: p.email,
          subject,
          text: body,
        });
      } catch (e) {
        console.error("[mail-send-failed]", p.email, e.message);
      }
    } else {
      console.log(`\n[email-stub] ${subject}\n  → ${p.email}\n${body}\n`);
    }
  }
}
