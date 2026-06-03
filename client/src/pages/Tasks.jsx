import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "DONE"];

function StatusBadge({ status, dueDate }) {
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "DONE";
  if (isOverdue) return <span className="badge badge-overdue">Overdue</span>;
  if (status === "TODO") return <span className="badge badge-todo">Todo</span>;
  if (status === "IN_PROGRESS") return <span className="badge badge-inprogress">In Progress</span>;
  if (status === "DONE") return <span className="badge badge-done">Done</span>;
  return null;
}

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.global_role === "ADMIN";

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [form, setForm] = useState({
    project_id: "",
    title: "",
    description: "",
    assigned_to: "",
    status: "TODO",
    due_date: "",
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [tasksRes, projRes, usersRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects"),
        api.get("/users"),
      ]);
      setTasks(tasksRes.data);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/tasks", form);
      setForm({ project_id: "", title: "", description: "", assigned_to: "", status: "TODO", due_date: "" });
      setShowForm(false);
      setMsg("Task created!");
      loadAll();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    setUpdatingId(taskId);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  if (loading) return <div style={{ color: "var(--muted)" }}>Loading tasks...</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Tasks</h1>
          <p style={{ margin: "0.3rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
            {isAdmin ? "All tasks" : "Your assigned tasks"} · {tasks.length} total
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setError(""); }}>
            + New Task
          </button>
        )}
      </div>

      {msg && (
        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "var(--success)", padding: "0.65rem 1rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.875rem" }}>
          {msg}
        </div>
      )}

      {/* Create Task Form */}
      {showForm && isAdmin && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "rgba(79,142,247,0.3)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 600 }}>Create New Task</h3>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "0.65rem 0.85rem", borderRadius: 8, fontSize: "0.85rem", marginBottom: "1rem" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="label">Task Title</label>
                <input className="input" placeholder="e.g. Build login API" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="label">Project</label>
                <select className="input" value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })} required>
                  <option value="">-- Select project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Assign To</label>
                <select className="input" value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} required>
                  <option value="">-- Select user --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Status</label>
                <select className="input" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Due Date</label>
                <input className="input" type="date" value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="label">Description (optional)</label>
                <textarea className="input" rows={2} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ resize: "vertical" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary" type="submit">Create Task</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {["ALL", ...STATUS_OPTIONS].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.35rem 0.85rem",
              borderRadius: 999,
              fontSize: "0.8rem",
              fontWeight: 500,
              border: "1px solid",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              borderColor: filter === f ? "var(--accent)" : "var(--border)",
              background: filter === f ? "rgba(79,142,247,0.15)" : "transparent",
              color: filter === f ? "var(--accent)" : "var(--muted)",
              transition: "all 0.15s",
            }}
          >
            {f.replace("_", " ")}
            <span style={{ marginLeft: "0.35rem", color: "var(--muted)", fontSize: "0.75rem" }}>
              ({f === "ALL" ? tasks.length : tasks.filter((t) => t.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Tasks list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
          <p style={{ color: "var(--muted)", margin: 0 }}>No tasks found for this filter.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((task) => {
            const canEdit = isAdmin || task.assigned_to === user?.id;
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "DONE";

            return (
              <div
                key={task.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  borderLeft: `3px solid ${isOverdue ? "var(--danger)" : task.status === "DONE" ? "var(--success)" : task.status === "IN_PROGRESS" ? "var(--accent)" : "var(--border)"}`,
                  padding: "1rem 1.25rem",
                }}
              >
                {/* Left */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{task.title}</span>
                    <StatusBadge status={task.status} dueDate={task.due_date} />
                  </div>
                  {task.description && (
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                      {task.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.78rem", color: "var(--muted)" }}>
                    <span>👤 {task.assigned_user_name || "Unassigned"}</span>
                    {task.due_date && (
                      <span style={{ color: isOverdue ? "var(--danger)" : "var(--muted)" }}>
                        📅 {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    <span style={{ fontFamily: "DM Mono, monospace" }}>#{task.id}</span>
                  </div>
                </div>

                {/* Status changer */}
                {canEdit && (
                  <div>
                    <select
                      className="input"
                      style={{ width: "auto", fontSize: "0.8rem", padding: "0.35rem 0.6rem" }}
                      value={task.status}
                      disabled={updatingId === task.id}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
