import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store.js";

export default function OrganizerLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();

  const primary = user?.organization?.primaryColor || "#3b6ea5";
  document.documentElement.style.setProperty("--brand", primary);

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-card border-r border-line flex flex-col">
        <div className="px-5 py-5 border-b border-line">
          <Link to="/" className="flex items-center gap-2">
            {user?.organization?.logoUrl ? (
              <img
                src={user.organization.logoUrl}
                alt=""
                className="h-7 w-7 rounded object-cover"
              />
            ) : (
              <span
                className="h-7 w-7 rounded inline-flex items-center justify-center text-white font-head"
                style={{ background: primary }}
              >
                ✦
              </span>
            )}
            <div className="flex flex-col">
              <span className="font-head text-lg leading-none">Csapatépítő</span>
              <span className="text-[11px] text-subtle truncate">
                {user?.organization?.name}
              </span>
            </div>
          </Link>
        </div>

        <nav className="px-2 py-3 flex-1 space-y-1 text-sm">
          <SideLink to="/" exact>Vezérlőpult</SideLink>
          <SideLink to="/events">Eventek</SideLink>
          <SideLink to="/activities">Aktivitások</SideLink>
          <SideLink to="/settings">Beállítások</SideLink>
        </nav>

        <div className="px-3 py-3 border-t border-line">
          <div className="text-xs text-subtle px-2 mb-1">{user?.name}</div>
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
            className="text-xs text-subtle hover:text-ink px-2"
          >
            Kijelentkezés
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

function SideLink({ to, children, exact }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 transition ${
          isActive
            ? "bg-brand-50 text-brand-700 font-medium"
            : "text-subtle hover:bg-paper hover:text-ink"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
