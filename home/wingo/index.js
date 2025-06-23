const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

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
  const nextPeriodNum = periodNum + 1; // ✅ 加一
  const periodStr = String(nextPeriodNum).padStart(5, "0");
  const nextPeriod = `${year}${month}${day}${fixedCode}${periodStr}`;

  // 显示预测的下一期
  const periodEl = document.getElementById("period");
  if (periodEl) periodEl.textContent = nextPeriod;

  // 显示倒计时
  const cdEl = document.querySelector(".cd");
  if (cdEl) {
    const padded = String(countdown).padStart(2, "0");
    cdEl.textContent = `00 : ${padded}`;
  }
}

setInterval(updatePeriod, 1000);
updatePeriod();