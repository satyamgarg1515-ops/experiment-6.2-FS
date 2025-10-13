// index.js
// Language: JavaScript (Node.js)
// Run using: node index.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Secret key for JWT signing and verification
const SECRET_KEY = "mysecretkey";

// Dummy user credentials (for login)
const USER = {
  username: "admin",
  password: "password123",
};

// Dummy account details
let account = {
  balance: 5000,
};

// ================================
// 🔐 Middleware to verify JWT Token
// ================================
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Format: Bearer <token>
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded; // attach decoded info (username)
    next();
  });
}

// ================================
// 🔑 Login Route - Generate JWT
// ================================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ error: "Invalid username or password" });
  }
});

// ================================
// 💰 Protected Banking Routes
// ================================
app.get("/balance", verifyToken, (req, res) => {
  res.json({ balance: account.balance });
});

app.post("/deposit", verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid deposit amount" });
  }

  account.balance += amount;
  res.json({ message: `Deposited ₹${amount}`, new_balance: account.balance });
});

app.post("/withdraw", verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid withdrawal amount" });
  }

  if (amount > account.balance) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  account.balance -= amount;
  res.json({ message: `Withdrew ₹${amount}`, new_balance: account.balance });
});

// ================================
// 🌐 Start Server
// ================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Banking API running at http://localhost:${PORT}`);
});
