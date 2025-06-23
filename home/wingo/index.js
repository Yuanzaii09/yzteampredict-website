const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

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

  // ✅ 显示完整期号
  const periodEl = document.getElementById("period");
  if (periodEl) periodEl.textContent = finalPeriod;

  // ✅ 倒计时格式 00 : SS
  const cdEl = document.querySelector(".cd");
  if (cdEl) {
    const padded = String(countdown).padStart(2, "0");
    cdEl.textContent = `00 : ${padded}`;
  }

  lastPeriod = finalPeriod;
}

setInterval(updatePeriod, 1000);
updatePeriod();