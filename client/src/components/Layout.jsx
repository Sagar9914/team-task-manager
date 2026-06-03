import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 0",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "var(--accent)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#fff",
              }}
            >
              T
            </div>
            <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em" }}>
              TaskFlow
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {[
            { to: "/dashboard", label: "Dashboard", icon: "⊞" },
            { to: "/projects", label: "Projects", icon: "◫" },
            { to: "/tasks", label: "Tasks", icon: "✓" },
          ].map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.55rem 0.75rem",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: isActive ? "#fff" : "var(--muted)",
                background: isActive ? "rgba(79,142,247,0.15)" : "transparent",
                border: isActive ? "1px solid rgba(79,142,247,0.25)" : "1px solid transparent",
                transition: "all 0.15s",
              })}
            >
              <span style={{ fontSize: "1rem" }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>
              {user?.name}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: user?.global_role === "ADMIN" ? "var(--accent)" : "var(--muted)",
                fontFamily: "DM Mono, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {user?.global_role}
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: "220px", flex: 1, padding: "2rem", minHeight: "100vh" }}>
        <Outlet />
      </main>
    </div>
  );
}
