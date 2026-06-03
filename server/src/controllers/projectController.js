const pool = require("../config/db");

exports.createProject = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  try {
    const projectResult = await pool.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, req.user.id]
    );

    const project = projectResult.rows[0];

    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [project.id, req.user.id, "ADMIN"]
    );

    res.status(201).json(project);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Failed to create project", error: err.message });
  }
};

exports.addMemberToProject = async (req, res) => {
  const { projectId } = req.params;
  const { user_id, role } = req.body;

  if (!user_id || !role) {
    return res.status(400).json({ message: "user_id and role are required" });
  }

  try {
    const projectCheck = await pool.query(
      `SELECT * FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const result = await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [projectId, user_id, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ADD MEMBER ERROR:", err);
    res.status(500).json({ message: "Failed to add member", error: err.message });
  }
};
//---------------------------------------------------------------------------rr
exports.getProjects = async (req, res) => {
  try {
    let result;
    if (req.user.global_role === "ADMIN") {
      result = await pool.query(
        `SELECT * FROM projects ORDER BY created_at DESC`
      );
    } else {
      result = await pool.query(
        `SELECT p.* FROM projects p
         INNER JOIN project_members pm ON p.id = pm.project_id
         WHERE pm.user_id = $1
         ORDER BY p.created_at DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch projects", error: err.message });
  }
};
