import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.global_role === "ADMIN";

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(null); // project id
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [newMember, setNewMember] = useState({ user_id: "", role: "MEMBER" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get("/projects"),
        api.get("/users"),
      ]);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/projects", newProject);
      setNewProject({ name: "", description: "" });
      setShowCreateForm(false);
      setMsg("Project created!");
      loadData();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/projects/${showAddMember}/members`, newMember);
      setNewMember({ user_id: "", role: "MEMBER" });
      setShowAddMember(null);
      setMsg("Member added!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    }
  }

  if (loading) return <div style={{ color: "var(--muted)" }}>Loading projects...</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Projects</h1>
          <p style={{ margin: "0.3rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setShowCreateForm(!showCreateForm); setError(""); }}>
            + New Project
          </button>
        )}
      </div>

      {msg && (
        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "var(--success)", padding: "0.65rem 1rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.875rem" }}>
          {msg}
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "0.65rem 1rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* Create project form */}
      {showCreateForm && isAdmin && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "rgba(79,142,247,0.3)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 600 }}>Create New Project</h3>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label className="label">Project Name</label>
              <input
                className="input"
                placeholder="e.g. Team Task Manager"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Description (optional)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="What is this project about?"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary" type="submit">Create Project</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          }}
          onClick={() => setShowAddMember(null)}
        >
          <div className="card" style={{ width: 400, maxWidth: "90vw" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 600 }}>Add Member to Project</h3>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="label">Select User</label>
                <select
                  className="input"
                  value={newMember.user_id}
                  onChange={(e) => setNewMember({ ...newMember, user_id: e.target.value })}
                  required
                >
                  <option value="">-- Select a user --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) — {u.global_role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Project Role</label>
                <select
                  className="input"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {error && (
                <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</div>
              )}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-primary" type="submit">Add Member</button>
                <button className="btn btn-ghost" type="button" onClick={() => setShowAddMember(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>◫</div>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {isAdmin ? 'No projects yet. Click "+ New Project" to start.' : "You haven't been added to any projects yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {projects.map((project) => (
            <div key={project.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "var(--accent)",
                    }}
                  />
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.7rem", color: "var(--muted)" }}>
                    #{project.id}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 0.4rem", fontSize: "1rem", fontWeight: 600 }}>{project.name}</h3>
                {project.description && (
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    {project.description}
                  </p>
                )}
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
              {isAdmin && (
                <button
                  className="btn btn-ghost"
                  style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
                  onClick={() => { setShowAddMember(project.id); setError(""); }}
                >
                  + Add Member
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
