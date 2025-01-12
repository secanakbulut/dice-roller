// dice-roller
// stats are stored per die size, so d6 stats don't pollute d20 stats etc.

const dieEl = document.getElementById("dieType");
const countEl = document.getElementById("dieCount");
const rollBtn = document.getElementById("rollBtn");
const resultEl = document.getElementById("result");
const detailEl = document.getElementById("rollDetail");
const statsBody = document.getElementById("statsBody");
const clearBtn = document.getElementById("clearBtn");

const STORAGE_KEY = "diceRollerStats.v1";

// chi-square critical values at p = 0.05
// df = sides - 1, so df 3 for d4 up to df 19 for d20
const CHI2_CRIT = {
  3: 7.815,    // d4
  5: 11.070,   // d6
  7: 14.067,   // d8
  9: 16.919,   // d10
  11: 19.675,  // d12
  19: 30.144,  // d20
};

// load whatever stats we had last time
let stats = loadStats();

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function rollOne(sides) {
  // Math.random is fine for a toy, no need to get fancy
  return Math.floor(Math.random() * sides) + 1;
}

function roll() {
  const sides = parseInt(dieEl.value, 10);
  const count = parseInt(countEl.value, 10);

  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollOne(sides));
  }

  const sum = rolls.reduce((a, b) => a + b, 0);
  resultEl.textContent = sum;
  detailEl.textContent = count > 1
    ? `${count}d${sides} = ${rolls.join(" + ")}`
    : `d${sides}`;

  // record into per-die bucket
  const key = "d" + sides;
  if (!stats[key]) {
    stats[key] = { sides, total: 0, faces: {} };
  }
  for (const r of rolls) {
    stats[key].total += 1;
    stats[key].faces[r] = (stats[key].faces[r] || 0) + 1;
  }

  saveStats();
  renderStats();
}

function renderStats() {
  const sides = parseInt(dieEl.value, 10);
  const key = "d" + sides;
  const s = stats[key];

  if (!s || s.total === 0) {
    statsBody.innerHTML = `<p class="muted">no rolls yet for d${sides}.</p>`;
    return;
  }

  const expected = s.total / sides;
  // mean of observed rolls
  let weightedSum = 0;
  for (let f = 1; f <= sides; f++) {
    weightedSum += f * (s.faces[f] || 0);
  }
  const avg = weightedSum / s.total;
  const expVal = (sides + 1) / 2; // expected value of a fair n-sided die

  // chi-square
  let chi = 0;
  for (let f = 1; f <= sides; f++) {
    const obs = s.faces[f] || 0;
    chi += Math.pow(obs - expected, 2) / expected;
  }

  const df = sides - 1;
  const crit = CHI2_CRIT[df];
  const minRolls = sides * 5; // need a reasonable sample before we judge

  let verdictHtml;
  if (s.total < minRolls) {
    verdictHtml = `<div class="verdict wait">need at least ${minRolls} rolls before the fairness test means anything. you have ${s.total}.</div>`;
  } else if (chi > crit) {
    verdictHtml = `<div class="verdict sus">looking suspicious. chi-square ${chi.toFixed(2)} is above the ${crit} cutoff (df ${df}, p=0.05).</div>`;
  } else {
    verdictHtml = `<div class="verdict fair">looks fair. chi-square ${chi.toFixed(2)} is under the ${crit} cutoff (df ${df}, p=0.05).</div>`;
  }

  let facesHtml = '<div class="face-grid">';
  for (let f = 1; f <= sides; f++) {
    const c = s.faces[f] || 0;
    facesHtml += `<div class="face"><div class="n">${f}</div><div class="c">${c}</div></div>`;
  }
  facesHtml += "</div>";

  statsBody.innerHTML = `
    <div class="summary">
      <div><div class="label">rolls</div><div class="value">${s.total}</div></div>
      <div><div class="label">average</div><div class="value">${avg.toFixed(3)}</div></div>
      <div><div class="label">expected</div><div class="value">${expVal.toFixed(3)}</div></div>
      <div><div class="label">chi-square</div><div class="value">${chi.toFixed(2)}</div></div>
    </div>
    ${facesHtml}
    ${verdictHtml}
  `;
}

function clearStats() {
  const sides = parseInt(dieEl.value, 10);
  const key = "d" + sides;
  // only clear the current die, the other buckets are fine
  delete stats[key];
  saveStats();
  resultEl.textContent = "-";
  detailEl.textContent = "";
  renderStats();
}

rollBtn.addEventListener("click", roll);
clearBtn.addEventListener("click", clearStats);
dieEl.addEventListener("change", renderStats);

// Enter rolls too, feels nicer
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    roll();
  }
});

renderStats();
