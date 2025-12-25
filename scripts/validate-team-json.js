const fs = require("fs");
const path = require("path");

const teamPath = path.join(process.cwd(), "team.json");

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

let data;
try {
  const raw = fs.readFileSync(teamPath, "utf8");
  data = JSON.parse(raw);
} catch (error) {
  fail(`Unable to read or parse team.json (${error.message}).`);
}

if (!Array.isArray(data)) {
  fail("team.json must be a JSON array.");
}

const seen = new Set();
let previousName = "";

for (let index = 0; index < data.length; index += 1) {
  const entry = data[index];
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    fail(`Entry ${index + 1} must be an object.`);
  }

  if (typeof entry.name !== "string" || entry.name.trim().length === 0) {
    fail(`Entry ${index + 1} is missing a valid "name".`);
  }

  if (typeof entry.github !== "string" || entry.github.trim().length === 0) {
    fail(`Entry ${index + 1} is missing a valid "github".`);
  }

  const github = entry.github.trim();
  if (!/^[A-Za-z0-9-]+$/.test(github) || github.length < 1 || github.length > 39) {
    fail(`Entry ${index + 1} has an invalid GitHub username.`);
  }

  const githubKey = github.toLowerCase();
  if (seen.has(githubKey)) {
    fail(`Duplicate GitHub username detected: ${github}`);
  }
  seen.add(githubKey);

  if (entry.role !== undefined && typeof entry.role !== "string") {
    fail(`Entry ${index + 1} has a non-string "role".`);
  }

  if (entry.timezone !== undefined && typeof entry.timezone !== "string") {
    fail(`Entry ${index + 1} has a non-string "timezone".`);
  }

  if (entry.links !== undefined) {
    if (!Array.isArray(entry.links)) {
      fail(`Entry ${index + 1} "links" must be an array.`);
    }
    entry.links.forEach((link, linkIndex) => {
      if (!link || typeof link !== "object" || Array.isArray(link)) {
        fail(`Entry ${index + 1} link ${linkIndex + 1} must be an object.`);
      }
      if (typeof link.label !== "string" || link.label.trim().length === 0) {
        fail(`Entry ${index + 1} link ${linkIndex + 1} needs a "label".`);
      }
      if (typeof link.url !== "string" || link.url.trim().length === 0) {
        fail(`Entry ${index + 1} link ${linkIndex + 1} needs a "url".`);
      }
    });
  }

  const normalizedName = entry.name.trim().toLowerCase();
  if (index > 0 && normalizedName.localeCompare(previousName) < 0) {
    fail("Entries must be sorted by name (case-insensitive).");
  }
  previousName = normalizedName;
}

console.log("team.json validation passed.");
