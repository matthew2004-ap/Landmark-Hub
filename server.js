const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const port = process.env.PORT || 3001;
const rootDir = __dirname;
const dataFile = path.join(rootDir, "data", "store.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function readStore() {
  const raw = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(raw);
}

function writeStore(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/platform-data") {
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
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    collectRequestBody(req)
      .then((body) => {
        const parsed = JSON.parse(body || "{}");
        const name = String(parsed.name || "").trim();
        const email = String(parsed.email || "").trim();
        const organization = String(parsed.organization || "").trim();
        const message = String(parsed.message || "").trim();

        if (!name || !email || !message) {
          sendJson(res, 400, { error: "Name, email, and message are required." });
          return;
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
        sendJson(res, 201, {
          message: "Inquiry received successfully.",
          submission
        });
      })
      .catch((error) => {
        const statusCode = error.message === "Payload too large" ? 413 : 400;
        sendJson(res, statusCode, { error: "Invalid request body." });
      });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/inquiries") {
    const store = readStore();
    sendJson(res, 200, {
      count: store.submissions.length,
      submissions: store.submissions
    });
    return true;
  }

  return false;
}

function serveStatic(req, res, pathname) {
  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const relativePath = normalized.replace(/^[/\\]+/, "");
  const filePath = path.join(rootDir, relativePath);

  if (!filePath.startsWith(rootDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendText(res, 404, "File not found");
      } else {
        sendText(res, 500, `Server error: ${error.code}`);
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (handleApi(req, res, url)) {
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(port, () => {
  console.log(`Landmark Hub full-stack app is running at http://localhost:${port}`);
});
