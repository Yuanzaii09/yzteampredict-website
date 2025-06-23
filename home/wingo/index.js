const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

let countdown = 30;
let isPredicting = false;
let lastPeriod = "";

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

  // 当 countdown 到 0，开始预测
  if (countdown === 0 && !isPredicting && nextPeriod !== lastPeriod) {
    isPredicting = true;
    lastPeriod = nextPeriod;

    if (resultEl) resultEl.textContent = "AI运作中...";

    const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5秒

    setTimeout(() => {
      fetch("https://predict-gamma.vercel.app/api/result")
        .then(res => res.json())
        .then(data => {
          const result = data.result;
          
          // 生成随机概率
          const rand = Math.random();
          let probability = 0;
          let color = "orange";

          if (rand < 0.85) {
            probability = Math.floor(Math.random() * 25) + 45; // 45-69
            color = "orange";
          } else {
            probability = Math.floor(Math.random() * 16) + 70; // 70-85
            color = "green";
          }

          resultEl.innerHTML = `<span style="color:${color};">${result} (${probability}%)</span>`;
        })
        .catch(() => {
          resultEl.textContent = "结果获取失败";
        })
        .finally(() => {
          isPredicting = false;
        });

    }, delay);

  } else if (!isPredicting) {
    const padded = String(countdown).padStart(2, "0");
    if (cdEl) cdEl.textContent = `00 : ${padded}`;
  }
}

setInterval(updatePeriod, 1000);
updatePeriod();