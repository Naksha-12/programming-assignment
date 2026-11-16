
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("users.db");

app.use(cors());
app.use(express.json());

db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL
)`);

app.post("/api/register", (req, res) => {
 const { name, email, password } = req.body;

 if (!name || !email || !password)
  return res.status(400).json({message:"All fields are required"});

 if (password.length < 8)
  return res.status(400).json({message:"Password must be 8 characters"});

 try {
  const hash = bcrypt.hashSync(password, 12);
  db.prepare("INSERT INTO users (name,email,password_hash) VALUES (?,?,?)")
   .run(name, email.toLowerCase(), hash);

  res.status(201).json({message:"Registration successful"});
 } catch {
  res.status(409).json({message:"Email already registered"});
 }
});

app.post("/api/login", (req, res) => {
 const { email, password } = req.body;

 const user = db.prepare("SELECT * FROM users WHERE email=?")
  .get(email.toLowerCase());

 if (!user || !bcrypt.compareSync(password, user.password_hash))
  return res.status(401).json({message:"Invalid email or password"});

 const token = jwt.sign(
  {id:user.id},
  process.env.JWT_SECRET || "development_secret",
  {expiresIn:"2h"}
 );

 res.json({message:"Login successful", token});
});

app.listen(5000, () => {
 console.log("Server running on port 5000");
});
