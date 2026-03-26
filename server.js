const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;
const rootDir = __dirname;
const dataFile = path.join(rootDir, "data", "store.json");

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(rootDir, "client", "build")));

function readStore() {
  const raw = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(raw);
}

function writeStore(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

function sendText(res, statusCode, message) {
  res.status(statusCode).send(message);
}

// API routes
app.get("/api/health", (req, res) => {
  sendJson(res, 200, { status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/platform-data", (req, res) => {
  const store = readStore();
  const payload = {
    stats: store.stats,
    featuredMenu: store.featuredMenu,
    vendors: store.vendors,
    testimonials: store.testimonials,
    recentSubmissions: store.submissions
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  };
  sendJson(res, 200, payload);
});

app.post("/api/contact", (req, res) => {
  const { name, email, organization, message } = req.body;
  if (!name || !email || !message) {
    return sendJson(res, 400, { error: "Name, email, and message are required." });
  }
  const store = readStore();
  const submission = {
    id: `msg-${Date.now()}`,
    name,
    email,
    organization,
    message,
    createdAt: new Date().toISOString()
  };
  store.submissions.unshift(submission);
  writeStore(store);
  sendJson(res, 201, { message: "Inquiry received successfully.", submission });
});

app.get("/api/inquiries", (req, res) => {
  const store = readStore();
  sendJson(res, 200, { count: store.submissions.length, submissions: store.submissions });
});

// New APIs for the React app
app.get("/api/orders", (req, res) => {
  const store = readStore();
  sendJson(res, 200, store.orders || []);
});

app.post("/api/orders", (req, res) => {
  const store = readStore();
  store.orders = req.body;
  writeStore(store);
  sendJson(res, 200, { success: true });
});

app.get("/api/reviews", (req, res) => {
  const store = readStore();
  sendJson(res, 200, store.reviews || []);
});

app.post("/api/reviews", (req, res) => {
  const store = readStore();
  store.reviews = req.body;
  writeStore(store);
  sendJson(res, 200, { success: true });
});

app.get("/api/complaints", (req, res) => {
  const store = readStore();
  sendJson(res, 200, store.complaints || []);
});

app.post("/api/complaints", (req, res) => {
  const store = readStore();
  store.complaints = req.body;
  writeStore(store);
  sendJson(res, 200, { success: true });
});

app.get("/api/menu", (req, res) => {
  const store = readStore();
  sendJson(res, 200, store.menu || {});
});

app.post("/api/menu", (req, res) => {
  const store = readStore();
  store.menu = req.body;
  writeStore(store);
  sendJson(res, 200, { success: true });
});

// Serve React app for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(rootDir, "client", "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Landmark Hub full-stack app is running at http://localhost:${port}`);
});
