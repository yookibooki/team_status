const rosterEl = document.getElementById("roster");
const searchEl = document.getElementById("search");
const dataNoteEl = document.getElementById("data-note");

function normalize(value) {
  return value.toLowerCase();
}

function sortMembers(members) {
  return [...members].sort((a, b) => {
    const nameA = normalize(a.name);
    const nameB = normalize(b.name);
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}

function matchesSearch(member, term) {
  if (!term) return true;
  const haystack = `${member.name} ${member.github}`.toLowerCase();
  return haystack.includes(term);
}

function renderMembers(members) {
  rosterEl.innerHTML = "";

  if (!members.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.style.opacity = "1";
    empty.innerHTML = "<h3>No members yet</h3><p class=\"card__meta\">Be the first to join via a PR or issue.</p>";
    rosterEl.appendChild(empty);
    return;
  }

  members.forEach((member, index) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${index * 40}ms`;

    const tags = [];
    if (member.role) tags.push(`<span class=\"tag\">${member.role}</span>`);
    if (member.timezone) tags.push(`<span class=\"tag\">${member.timezone}</span>`);

    const links = Array.isArray(member.links)
      ? member.links
          .filter((link) => link && link.label && link.url)
          .map(
            (link) =>
              `<a href=\"${link.url}\" target=\"_blank\" rel=\"noreferrer\">${link.label}</a>`
          )
      : [];

    card.innerHTML = `
      <h3>${member.name}</h3>
      <p class="card__meta">
        <a href="https://github.com/${member.github}" target="_blank" rel="noreferrer">@${member.github}</a>
      </p>
      ${tags.length ? `<div class="card__tags">${tags.join("")}</div>` : ""}
      ${links.length ? `<div class="links">${links.join("")}</div>` : ""}
    `;

    rosterEl.appendChild(card);
  });
}

function applyFilter(members) {
  const term = searchEl.value.trim().toLowerCase();
  const filtered = members.filter((member) => matchesSearch(member, term));
  renderMembers(filtered);
}

async function loadTeam() {
  try {
    const response = await fetch("team.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load team.json");

    const lastModified = response.headers.get("last-modified");
    if (lastModified) {
      const date = new Date(lastModified);
      if (!Number.isNaN(date.valueOf())) {
        dataNoteEl.textContent = `Data updated ${date.toLocaleDateString()}`;
      }
    }

    const members = await response.json();
    const sorted = sortMembers(members);
    renderMembers(sorted);

    searchEl.addEventListener("input", () => applyFilter(sorted));
  } catch (error) {
    rosterEl.innerHTML = "";
    const card = document.createElement("div");
    card.className = "card";
    card.style.opacity = "1";
    card.innerHTML = "<h3>Unable to load roster</h3><p class=\"card__meta\">Check that team.json is available and valid JSON.</p>";
    rosterEl.appendChild(card);
  }
}

loadTeam();
