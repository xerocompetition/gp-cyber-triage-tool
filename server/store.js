// A deliberately simple data store: a single JSON file on disk.
// This is a prototype choice, stated plainly rather than hidden: it is
// fine for one practice on one machine, and for demonstrating that the
// DSPT "record a logged entry" requirement can be made real rather than
// just text in a browser tab. A production version serving more than one
// practice would need a proper database (e.g. SQLite or Postgres) and
// almost certainly authentication in front of it, neither of which this
// prototype implements.

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "incidents.json");

function ensureFile(){
  if(!fs.existsSync(DATA_FILE)){
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  }
}

function readAll(){
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch(err){
    // If the file is somehow corrupted, don't crash the server, start clean
    // and keep the corrupted file alongside for inspection.
    fs.renameSync(DATA_FILE, DATA_FILE + `.corrupted-${Date.now()}`);
    ensureFile();
    return [];
  }
}

function addIncident(record){
  const rows = readAll();
  const id = rows.length === 0 ? 1 : Math.max(...rows.map(r => r.id)) + 1;
  const entry = { id, receivedAt: new Date().toISOString(), ...record };
  rows.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
  return entry;
}

module.exports = { readAll, addIncident };
