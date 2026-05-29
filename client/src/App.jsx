import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store.js";
import { Spinner } from "./components/primitives.jsx";

import OrganizerLayout from "./components/OrganizerLayout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/organizer/Dashboard.jsx";
import EventList from "./pages/organizer/EventList.jsx";
import EventCreate from "./pages/organizer/EventCreate.jsx";
import EventDetail from "./pages/organizer/EventDetail.jsx";
import EventTimeline from "./pages/organizer/EventTimeline.jsx";
import EventParticipants from "./pages/organizer/EventParticipants.jsx";
import EventFeedback from "./pages/organizer/EventFeedback.jsx";
import ActivityLibrary from "./pages/organizer/ActivityLibrary.jsx";
import ActivityDetail from "./pages/organizer/ActivityDetail.jsx";
import Settings from "./pages/organizer/Settings.jsx";

import ParticipantPortal from "./pages/participant/ParticipantPortal.jsx";

export default function App() {
  const { user, loading, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-subtle">
        <Spinner />
        <span className="ml-2 text-sm">Betöltés…</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/p/:token/*" element={<ParticipantPortal />} />

      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

      <Route element={user ? <OrganizerLayout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/new" element={<EventCreate />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/:id/timeline" element={<EventTimeline />} />
        <Route path="/events/:id/participants" element={<EventParticipants />} />
        <Route path="/events/:id/feedback" element={<EventFeedback />} />
        <Route path="/activities" element={<ActivityLibrary />} />
        <Route path="/activities/:id" element={<ActivityDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
