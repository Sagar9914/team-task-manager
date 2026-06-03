const pool = require("../config/db");

exports.createTask = async (req, res) => {
  const { project_id, title, description, assigned_to, status, due_date } = req.body;

  if (!project_id || !title || !assigned_to) {
    return res.status(400).json({ message: "project_id, title and assigned_to are required" });
  }

  try {
    const projectCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1",
      [project_id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const memberCheck = await pool.query(
      "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
      [project_id, assigned_to]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(400).json({ message: "Assigned user is not a member of this project" });
    }

    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, assigned_to, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        project_id,
        title,
        description || null,
        assigned_to,
        status || "TODO",
        due_date || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Failed to create task", error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let result;

    if (req.user.global_role === "ADMIN") {
      result = await pool.query(`
        SELECT t.*, u.name AS assigned_user_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY t.id DESC
      `);
    } else {
      result = await pool.query(`
        SELECT t.*, u.name AS assigned_user_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.assigned_to = $1
        ORDER BY t.id DESC
      `, [req.user.id]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const taskResult = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = taskResult.rows[0];

    if (req.user.global_role !== "ADMIN" && task.assigned_to !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own assigned tasks" });
    }

    const updated = await pool.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error("UPDATE TASK STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update task status", error: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.global_role === "ADMIN") {
      query = `
        SELECT
          COUNT(*) AS total_tasks,
          COUNT(*) FILTER (WHERE status = 'TODO') AS todo_tasks,
          COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress_tasks,
          COUNT(*) FILTER (WHERE status = 'DONE') AS done_tasks,
          COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status <> 'DONE') AS overdue_tasks
        FROM tasks
      `;
    } else {
      query = `
        SELECT
          COUNT(*) AS total_tasks,
          COUNT(*) FILTER (WHERE status = 'TODO') AS todo_tasks,
          COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress_tasks,
          COUNT(*) FILTER (WHERE status = 'DONE') AS done_tasks,
          COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status <> 'DONE') AS overdue_tasks
        FROM tasks
        WHERE assigned_to = $1
      `;
      params = [req.user.id];
    }

    const summary = await pool.query(query, params);

    res.json(summary.rows[0]);
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Failed to fetch dashboard", error: err.message });
  }
};