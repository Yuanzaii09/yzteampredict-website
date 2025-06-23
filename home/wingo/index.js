const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

let countdown = 30;
let isPredicting = false;

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
  const nextPeriodNum = periodNum + 1;
  const periodStr = String(nextPeriodNum).padStart(5, "0");
  const nextPeriod = `${year}${month}${day}${fixedCode}${periodStr}`;

  const periodEl = document.getElementById("period");
  if (periodEl) periodEl.textContent = nextPeriod;

  const cdEl = document.querySelector(".cd");
  const resultEl = document.getElementById("result");

  if (countdown === 0 && !isPredicting) {
    isPredicting = true;

    if (resultEl) resultEl.textContent = "AI运作中...";

    const delay = Math.floor(Math.random() * 2000) + 1000;

    setTimeout(() => {
      const result = Math.random() < 0.5 ? "BIG" : "SMALL";
      if (resultEl) resultEl.textContent = result;

      isPredicting = false;
    }, delay);

  } else if (!isPredicting) {
    const padded = String(countdown).padStart(2, "0");
    if (cdEl) cdEl.textContent = `00 : ${padded}`;
  }
}

setInterval(updatePeriod, 1000);
updatePeriod();