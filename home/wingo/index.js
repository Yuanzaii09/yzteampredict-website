const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// === Period + 倒计时逻辑 ===
let lastPeriod = "";
let countdown = 30;

function updatePeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const start = new Date();
  start.setHours(8, 0, 0, 0);
  const diffMs = now - start;

  let periodNum = 0;
  if (diffMs >= 0) {
    const diffSec = Math.floor(diffMs / 1000);
    periodNum = Math.floor(diffSec / 30);
    countdown = 30 - (diffSec % 30);
  } else {
    countdown = 30;
  }

  const fixedCode = "10005";
  const periodStr = String(periodNum).padStart(5, "0");
  const finalPeriod = `${year}${month}${day}${fixedCode}${periodStr}`;

  if (finalPeriod !== lastPeriod) {
    lastPeriod = finalPeriod;
    document.getElementById("period").textContent = "当前 Period: " + finalPeriod;
  }

  // 更新倒计时显示
  const cdElement = document.querySelector('.cd');
  if (cdElement) {
    cdElement.textContent = `距离下期还有：${countdown} 秒`;
  }
}

// 每秒刷新一次 period 和倒计时
setInterval(() => {
  updatePeriod();
  countdown--;
  if (countdown <= 0) countdown = 30;
}, 1000);

// 首次加载
updatePeriod();