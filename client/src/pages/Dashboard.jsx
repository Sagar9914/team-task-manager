import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

function StatCard({ label, value, color, icon }) {
  return (
    <div
      className="card"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: color,
          borderRadius: "12px 12px 0 0",
        }}
      />
      <div style={{ fontSize: "1.8rem", marginBottom: "0.35rem" }}>{icon}</div>
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: color,
          fontFamily: "DM Mono, monospace",
        }}
      >
        {value ?? "—"}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          api.get("/tasks/dashboard/summary"),
          api.get("/tasks"),
        ]);
        setStats(summaryRes.data);
        setRecentTasks(tasksRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function statusBadge(status, dueDate) {
    const isOverdue =
      dueDate &&
      new Date(dueDate) < new Date() &&
      status !== "DONE";

    if (isOverdue) return <span className="badge badge-overdue">Overdue</span>;
    if (status === "TODO") return <span className="badge badge-todo">Todo</span>;
    if (status === "IN_PROGRESS") return <span className="badge badge-inprogress">In Progress</span>;
    if (status === "DONE") return <span className="badge badge-done">Done</span>;
    return null;
  }

  if (loading) {
    return (
      <div style={{ color: "var(--muted)", padding: "2rem" }}>Loading dashboard...</div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
          Dashboard
        </h1>
        <p style={{ margin: "0.3rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
          Welcome back, {user?.name} · {user?.global_role}
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard label="Total Tasks" value={stats?.total_tasks} color="var(--accent)" icon="📋" />
        <StatCard label="Todo" value={stats?.todo_tasks} color="var(--muted)" icon="⏳" />
        <StatCard label="In Progress" value={stats?.in_progress_tasks} color="var(--accent)" icon="🔄" />
        <StatCard label="Done" value={stats?.done_tasks} color="var(--success)" icon="✅" />
        <StatCard label="Overdue" value={stats?.overdue_tasks} color="var(--danger)" icon="🔴" />
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Recent Tasks</h2>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Last 5 tasks</span>
        </div>

        {recentTasks.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>
            No tasks yet. Go to Tasks to create one.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recentTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "var(--bg)",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{task.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.15rem" }}>
                    Assigned to: {task.assigned_user_name || "—"}
                    {task.due_date && (
                      <> · Due {new Date(task.due_date).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
                {statusBadge(task.status, task.due_date)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
