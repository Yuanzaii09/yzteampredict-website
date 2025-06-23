// 卡片点击状态（你原本有的）
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// 生成下一期的期号
function getNextPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const start = new Date();
  start.setHours(8, 0, 0, 0); // 今天早上8点
  const diffSec = Math.floor((now - start) / 1000);
  const periodNum = Math.floor(diffSec / 30) + 1;

  const fixedCode = "10005";
  const periodStr = String(periodNum).padStart(5, "0");
  return `${year}${month}${day}${fixedCode}${periodStr}`;
}

// 显示 BIG / SMALL 的 AI预测
function showPrediction() {
  const resultEl = document.getElementById("result");
  if (!resultEl) return;

  resultEl.textContent = "AI运作中...";

  const delay = Math.floor(Math.random() * 2000) + 1000;
  setTimeout(() => {
    // 替换原来的随机逻辑
    const seed = parseInt(nextPeriod.slice(-2)); 
    const result = seed % 2 === 0 ? "BIG" : "SMALL";
    resultEl.textContent = result;
  }, delay);
}

// 更新周期和倒计时
function updatePeriodAndCountdown() {
  const now = new Date();
  const seconds = now.getSeconds();
  const secondsPast = seconds % 30;
  const remaining = 30 - secondsPast;

  // 更新倒计时显示
  const cdEl = document.querySelector(".cd");
  if (cdEl) {
    cdEl.textContent = `00 : ${String(remaining).padStart(2, "0")}`;
  }

  // 更新期号
  const periodEl = document.getElementById("period");
  if (periodEl) {
    periodEl.textContent = getNextPeriod();
  }

  // 如果刚好整 30 秒（如 00、30、60）时触发预测
  if (secondsPast === 0) {
    showPrediction();
  }
}

// 每 1 秒执行一次
setInterval(updatePeriodAndCountdown, 1000);
updatePeriodAndCountdown();