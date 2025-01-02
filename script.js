// dice-roller
// just rolls for now

const dieEl = document.getElementById("dieType");
const countEl = document.getElementById("dieCount");
const rollBtn = document.getElementById("rollBtn");
const resultEl = document.getElementById("result");
const detailEl = document.getElementById("rollDetail");

function rollOne(sides) {
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
}

rollBtn.addEventListener("click", roll);
