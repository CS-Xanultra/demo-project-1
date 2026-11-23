// Deliberately vulnerable demo app for the Cloud Sentry staging walk.
// Every handler below contains a flaw on purpose so code scanning has
// something to find. Do not deploy, and do not copy these patterns.
const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

// Command injection: the host parameter reaches a shell unescaped.
app.get("/ping", (req, res) => {
  exec("ping -c 1 " + req.query.host, (err, stdout) => {
    res.send(err ? "ping failed" : stdout);
  });
});

// Path traversal: the file name is joined without any check.
app.get("/files", (req, res) => {
  const file = path.join(__dirname, "uploads", req.query.name);
  res.send(fs.readFileSync(file, "utf8"));
});

// Open redirect: any URL the caller supplies is followed.
app.get("/go", (req, res) => {
  res.redirect(req.query.next);
});

// Reflected cross-site scripting: input is echoed into HTML as is.
app.get("/hello", (req, res) => {
  res.send("<h1>Hello " + req.query.name + "</h1>");
});

app.listen(3000);
