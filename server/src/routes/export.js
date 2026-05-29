import { Router } from "express";
import PDFDocument from "pdfkit";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { prisma } from "../db.js";
import { requireUser } from "../middleware/auth.js";
import { EVENT_STATUS_LABEL, RSVP_LABEL } from "../utils/enums.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

router.use(requireUser);

router.get("/event/:id/pdf", async (req, res, next) => {
  try {
    const event = await prisma.event.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
      include: {
        organization: true,
        eventActivities: {
          include: { activity: true },
          orderBy: { startTime: "asc" },
        },
        participants: { orderBy: { name: "asc" } },
        feedback: true,
      },
    });
    if (!event) return res.status(404).json({ error: "Esemény nem található." });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${sanitize(event.name)}.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: event.name } });
    doc.pipe(res);

    const primary = event.organization.primaryColor || "#3b6ea5";

    // Címsor
    if (event.organization.logoUrl) {
      const logoPath = path.join(
        __dirname,
        "..",
        "..",
        event.organization.logoUrl.replace(/^\//, "")
      );
      if (fs.existsSync(logoPath)) {
        try { doc.image(logoPath, 48, 40, { height: 36 }); } catch {}
      }
    }
    doc.fillColor("#333").fontSize(10).text(event.organization.name, 48, 82);
    doc
      .fillColor(primary)
      .fontSize(24)
      .text(event.name, 48, 110, { align: "left" });

    doc
      .fillColor("#666")
      .fontSize(11)
      .text(
        `${formatDateRange(event.startDate, event.endDate)} · ${
          event.location || "helyszín nincs megadva"
        } · ${EVENT_STATUS_LABEL[event.status] || event.status}`
      );

    doc.moveDown(1);

    if (event.description) {
      doc.fillColor("#333").fontSize(11).text(event.description);
      doc.moveDown(0.5);
    }

    section(doc, "Program", primary);
    if (!event.eventActivities.length) {
      doc.fillColor("#888").fontSize(10).text("Még nincs programpont.");
    } else {
      for (const it of event.eventActivities) {
        const title = it.customTitle || it.activity?.name || "Programpont";
        doc
          .fillColor("#333")
          .fontSize(11)
          .text(`${it.startTime}  ·  ${title}  (${it.durationMin} perc, ${it.lane})`);
        if (it.notes) doc.fillColor("#777").fontSize(9).text(`   ${it.notes}`);
      }
    }
    doc.moveDown(0.8);

    section(doc, "Résztvevők", primary);
    const counts = countRsvp(event.participants);
    doc
      .fillColor("#444")
      .fontSize(10)
      .text(
        `${event.participants.length} résztvevő · Igen ${counts.YES} · Nem ${counts.NO} · Talán ${counts.MAYBE} · Vár ${counts.PENDING}`
      );
    doc.moveDown(0.3);
    for (const p of event.participants) {
      doc
        .fillColor("#333")
        .fontSize(10)
        .text(
          `• ${p.name}${p.email ? ` <${p.email}>` : ""}  —  ${
            RSVP_LABEL[p.rsvp] || p.rsvp
          }${p.team ? ` · csapat: ${p.team}` : ""}`
        );
    }
    doc.moveDown(0.8);

    section(doc, "Visszajelzés", primary);
    if (!event.feedback.length) {
      doc.fillColor("#888").fontSize(10).text("Még nincs visszajelzés.");
    } else {
      const r = event.feedback
        .map((f) => f.rating)
        .filter((n) => typeof n === "number");
      const avg = r.length ? (r.reduce((a, b) => a + b, 0) / r.length).toFixed(1) : "—";
      const npss = event.feedback
        .map((f) => f.nps)
        .filter((n) => typeof n === "number");
      const promoters = npss.filter((n) => n >= 9).length;
      const detractors = npss.filter((n) => n <= 6).length;
      const nps = npss.length
        ? Math.round(((promoters - detractors) / npss.length) * 100)
        : "—";

      doc
        .fillColor("#444")
        .fontSize(10)
        .text(
          `Átlag csillag: ${avg} / 5  ·  NPS: ${nps}  ·  Válaszok: ${event.feedback.length}`
        );
      doc.moveDown(0.4);
      for (const f of event.feedback) {
        if (f.text) {
          doc
            .fillColor("#333")
            .fontSize(10)
            .text(`„${f.text}”  —  ${f.anonymous ? "anonim" : "résztvevő"}`);
        }
      }
    }

    doc
      .moveDown(1.5)
      .fillColor("#aaa")
      .fontSize(8)
      .text(
        `Generálva: ${new Date().toLocaleString("hu-HU")}  ·  csapatépítő`,
        { align: "right" }
      );

    doc.end();
  } catch (e) {
    next(e);
  }
});

function section(doc, title, color) {
  doc.moveDown(0.4);
  doc.fillColor(color).fontSize(13).text(title);
  doc
    .strokeColor(color)
    .lineWidth(0.8)
    .moveTo(doc.x, doc.y + 2)
    .lineTo(doc.x + 500, doc.y + 2)
    .stroke();
  doc.moveDown(0.4);
}

function formatDateRange(start, end) {
  if (!start) return "időpont nincs megadva";
  const fmt = (d) =>
    new Date(d).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  if (!end || new Date(end).toDateString() === new Date(start).toDateString())
    return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

function countRsvp(participants) {
  const c = { YES: 0, NO: 0, MAYBE: 0, PENDING: 0 };
  for (const p of participants) c[p.rsvp] = (c[p.rsvp] || 0) + 1;
  return c;
}

function sanitize(s) {
  return String(s).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80) || "esemeny";
}

export default router;
