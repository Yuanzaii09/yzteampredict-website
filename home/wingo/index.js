const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

let countdown = 30;
let periodNum = 0;
let isPredicting = false;

function generatePeriod() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const start = new Date();
  start.setHours(8, 0, 0, 0);
  const diffSec = Math.floor((now - start) / 1000);
  periodNum = Math.floor(diffSec / 30);

  const fixedCode = "10005";
  const nextPeriodNum = periodNum + 1;
  const periodStr = String(nextPeriodNum).padStart(5, "0");
  return `${year}${month}${day}${fixedCode}${periodStr}`;
}

function showPrediction() {
  const resultEl = document.getElementById("result");
  if (resultEl) resultEl.textContent = "AI运作中...";

  const delay = Math.floor(Math.random() * 2000) + 1000;
  setTimeout(() => {
    const result = Math.random() < 0.5 ? "BIG" : "SMALL";
    if (resultEl) resultEl.textContent = result;
  }, delay);
}

function updateDisplay() {
  const periodEl = document.getElementById("period");
  if (periodEl) periodEl.textContent = generatePeriod();

  const cdEl = document.querySelector(".cd");
  if (cdEl) cdEl.textContent = `00 : ${String(countdown).padStart(2, "0")}`;
}

// 每秒更新倒计时
setInterval(() => {
  countdown--;
  if (countdown <= 0) {
    countdown = 30;
    updateDisplay();
    showPrediction();
  } else {
    updateDisplay();
  }
}, 1000);

// 初次加载
countdown = 30;
updateDisplay();
showPrediction();