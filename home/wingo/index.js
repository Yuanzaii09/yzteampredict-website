const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

function getNextPeriod() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const start = new Date();
  start.setHours(8, 0, 0, 0);
  const diffSec = Math.floor((now - start) / 1000);
  const periodNum = Math.floor(diffSec / 30) + 1;

  const fixedCode = "10005";
  const periodStr = String(periodNum).padStart(5, "0");
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

function updatePeriodAndCountdown() {
  const now = new Date();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  const secondsPast = seconds % 30;
  const remaining = 30 - secondsPast;

  // 更新时间和倒计时
  document.getElementById("period").textContent = getNextPeriod();
  document.querySelector(".cd").textContent = `00 : ${String(remaining).padStart(2, "0")}`;

  // 如果刚好整点触发
  if (secondsPast === 0) {
    showPrediction();
  }
}

// 每 500 毫秒刷新（确保同步精准）
setInterval(updatePeriodAndCountdown, 500);

// 初始立即执行
updatePeriodAndCountdown();