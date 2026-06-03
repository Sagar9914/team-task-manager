const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.json({ message: "Team Task Manager API running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});

const pool = require("./config/db");

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const projectRoutes = require("./routes/projectRoutes");

app.use("/api/projects", projectRoutes);

const taskRoutes = require("./routes/taskRoutes");

app.use("/api/tasks", taskRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

