const express = require("express");
const mysql2 = require("mysql2/promise");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── DB connection ──────────────────────────────────────────────
const dbConfig = {
  
};

// ── Seed the users table on startup ───────────────────────────
async function seedDB() {
  const conn = await mysql2.createConnection(dbConfig);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL
    )
  `);
  const [rows] = await conn.execute("SELECT * FROM users WHERE username = 'med'");
  if (rows.length === 0) {
    await conn.execute("INSERT INTO users (username, password) VALUES ('med', 'med')");
    console.log("✅ Seeded user: med / med");
  }
  await conn.end();
}

// ── VULNERABLE login endpoint ──────────────────────────────────
// ❌ Directly concatenates user input — SQL injection possible
app.post("/api/login/vulnerable", async (req, res) => {
  const { username, password } = req.body;
  let conn;
  try {
    conn = await mysql2.createConnection(dbConfig);

    // ⚠️  VULNERABLE: raw string concatenation
    const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
    console.log("🔍 Executing query:", query);

    const [rows] = await conn.query(query);

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0].username, query });
    } else {
      res.json({ success: false, query });
    }
  } catch (err) {
    res.json({ success: false, error: err.message, query: `Error: ${err.message}` });
  } finally {
    if (conn) await conn.end();
  }
});

// ── Start ──────────────────────────────────────────────────────
const PORT = 3000;
seedDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀  http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
