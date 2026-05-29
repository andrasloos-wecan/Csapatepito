# Csapatépítő

Belsős HR-eszköz csapatépítő rendezvények tervezésére, lebonyolítására és kiértékelésére. Magyar nyelvű, web + mobil (PWA) felület.

## Stack

- **Backend:** Node.js + Express + Prisma + SQLite + JWT
- **Frontend:** React 18 + Vite + Tailwind CSS + React Router + Zustand + dnd-kit

## Indítás

```bash
# függőségek
npm run install:all

# adatbázis migráció + seed (30+ aktivitás)
npm --prefix server run db:migrate
npm run seed

# fejlesztői szerver (server :4000 + client :5173)
npm run dev
```

A frontend a `http://localhost:5173`, a backend a `http://localhost:4000` címen érhető el.

## Struktúra

```
server/         Express + Prisma backend
client/         React + Vite frontend
design_ref/     Wireframe-prototípus (referencia)
```

## P0 funkciók

- Szervezet workspace + admin/szervező jogkör (egyszerű email+jelszó belépés)
- Vezérlőpult kanban-pipeline-nal és AI parancssor stub-bal
- Esemény-létrehozási varázsló (4-lépéses + élő meghívó-előnézet)
- Esemény-részletek görgethető nézettel, blokk-szintű kommentekkel
- Élő timeline párhuzamos sávokkal és élő-szavazás dokkal
- Aktivitás könyvtár (30+ magyar aktivitás) szűrőkkel
- Résztvevő-kezelés CSV-importtal és RSVP-tracker-rel
- Mobil résztvevői PWA (token-link, agenda, csapatom)
- Post-event visszajelzés (NPS + csillag + szöveg)
- PDF export az event-összefoglalóhoz
