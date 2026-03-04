const express = require("express");
const mysql2 = require("mysql2/promise");

const app = express();
app.use(express.json());

const DB = {
  host: "mysql-1882f076-moha15252-39cc.e.aivencloud.com",
  port: 14290,
  user: "avnadmin",
  password: "AVNS_WhWfnrPLvhpYy9MFAEw",
  database: "defaultdb",
  ssl: { rejectUnauthorized: false },
};

async function setup() {
  const c = await mysql2.createConnection(DB);
  await c.execute("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100), password VARCHAR(100))");
  const [rows] = await c.execute("SELECT * FROM users WHERE username='med'");
  if (rows.length === 0) {
    await c.execute("INSERT INTO users (username, password) VALUES ('med', 'med')");
    console.log("User med/med created");
  }
  await c.end();
}

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; justify-content: center; margin-top: 100px; background: #f0f0f0; }
    .box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 320px; }
    h2 { margin-bottom: 24px; text-align: center; }
    input { width: 100%; padding: 10px; margin-bottom: 14px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 14px; }
    button { width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 15px; cursor: pointer; }
    #msg { margin-top: 14px; text-align: center; font-size: 14px; color: red; }
    #dashboard { display:none; text-align:center; }
  </style>
</head>
<body>
  <div class="box" id="loginBox">
    <h2>Login</h2>
    <input type="text" id="username" placeholder="Username" />
    <input type="password" id="password" placeholder="Password" />
    <button onclick="login()">Sign In</button>
    <div id="msg"></div>
  </div>

  <div id="dashboard">
    <h1>Welcome, <span id="uname"></span>!</h1>
    <p>You are now logged in.</p>
    <button onclick="location.reload()" style="width:auto;padding:8px 20px;margin-top:20px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">Logout</button>
  </div>

  <script>
    async function login() {
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("uname").textContent = data.user;
      } else {
        document.getElementById("msg").textContent = data.error || "Invalid credentials";
      }
    }
  </script>
</body>
</html>`);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const c = await mysql2.createConnection(DB);
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  console.log("Query:", query);
  try {
    const [rows] = await c.query(query);
    rows.length > 0
      ? res.json({ success: true, user: rows[0].username })
      : res.json({ success: false });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
  await c.end();
});

setup().then(() => {
  app.listen(3000, () => console.log("Open http://localhost:3000"));
});
