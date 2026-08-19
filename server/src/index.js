import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const CATEGORIES = [
  "Alimentación",
  "Transporte",
  "Vivienda",
  "Ocio",
  "Salud",
  "Otros",
];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "controlDeGastos" });
});

app.get("/api/categories", (_req, res) => {
  res.json(CATEGORIES);
});

app.get("/api/expenses", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM expenses ORDER BY date DESC, id DESC")
    .all();
  res.json(rows);
});

app.post("/api/expenses", (req, res) => {
  const { description, amount, category, date } = req.body ?? {};

  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "La descripción es obligatoria." });
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res
      .status(400)
      .json({ error: "El importe debe ser un número mayor que cero." });
  }

  const finalCategory =
    typeof category === "string" && category.trim() ? category.trim() : "Otros";
  const finalDate =
    typeof date === "string" && date.trim()
      ? date.trim()
      : new Date().toISOString().slice(0, 10);

  const info = db
    .prepare(
      "INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)"
    )
    .run(description.trim(), parsedAmount, finalCategory, finalDate);

  const row = db
    .prepare("SELECT * FROM expenses WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json(row);
});

app.delete("/api/expenses/:id", (req, res) => {
  const info = db
    .prepare("DELETE FROM expenses WHERE id = ?")
    .run(req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: "Gasto no encontrado." });
  }
  res.status(204).end();
});

app.get("/api/summary", (_req, res) => {
  const { total } = db
    .prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses")
    .get();
  const byCategory = db
    .prepare(
      "SELECT category, SUM(amount) AS total, COUNT(*) AS count FROM expenses GROUP BY category ORDER BY total DESC"
    )
    .all();
  res.json({ total, byCategory });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`API controlDeGastos escuchando en http://localhost:${port}`);
});
