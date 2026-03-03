#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const serverDir = path.resolve(__dirname, "..", "server");
const routeFiles = fs
  .readdirSync(serverDir)
  .filter((fileName) => /^routes.*\.ts$/.test(fileName))
  .map((fileName) => path.join(serverDir, fileName));

const routes = new Map();
const routePattern =
  /\bapp\.(get|post|put|delete|patch)\s*\(\s*(["'])((?:\\.|(?!\2)[\s\S])*)\2/g;

function getLineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

for (const routeFile of routeFiles) {
  const source = fs.readFileSync(routeFile, "utf8");
  let match;
  while ((match = routePattern.exec(source)) !== null) {
    const method = match[1].toUpperCase();
    const route = match[3].trim();

    if (!route.startsWith("/")) {
      continue;
    }

    const key = `${method} ${route}`;
    if (!routes.has(key)) {
      routes.set(key, []);
    }

    routes.get(key).push({
      file: path.relative(path.resolve(__dirname, ".."), routeFile),
      line: getLineNumber(source, match.index),
    });
  }
}

const duplicates = Array.from(routes.entries()).filter(([, locations]) => locations.length > 1);

if (duplicates.length === 0) {
  console.log("Route duplication check passed: no duplicate method+path pairs found.");
  process.exit(0);
}

console.error("Route duplication check failed. Duplicate method+path pairs found:");
for (const [route, locations] of duplicates) {
  const formatted = locations
    .map((location) => `${location.file}:${location.line}`)
    .join(", ");
  console.error(`- ${route} at ${formatted}`);
}

process.exit(1);
