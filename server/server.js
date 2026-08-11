const express = require("express");
const path = require("path");
const store = require("./store");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// List every logged incident, most recent first.
app.get("/api/incidents", (req, res) => {
  const rows = store.readAll().slice().reverse();
  res.json(rows);
});

// Save a completed playbook as a logged incident.
app.post("/api/incidents", (req, res) => {
  const { category, categoryLabel, answers, playbook, generatedAt } = req.body || {};

  if(!category || !Array.isArray(playbook)){
    return res.status(400).json({ error: "Expected at least 'category' and a 'playbook' array." });
  }

  const entry = store.addIncident({ category, categoryLabel, answers, playbook, generatedAt });
  res.status(201).json(entry);
});

app.listen(PORT, () => {
  console.log(`GP Cyber Triage Tool running at http://localhost:${PORT}`);
});
