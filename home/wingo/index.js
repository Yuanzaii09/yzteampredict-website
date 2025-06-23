const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// 每秒请求 Vercel API，显示 period、倒计时、result、概率
function fetchData() {
  fetch("https://predict-gamma.vercel.app/api/result")
    .then(res => res.json())
    .then(data => {
      // 更新 Period
      const periodEl = document.getElementById("period");
      if (periodEl) periodEl.textContent = data.period;

      // 倒计时
      const cdEl = document.querySelector(".cd");
      const padded = String(data.countdown).padStart(2, "0");
      if (cdEl) cdEl.textContent = `00 : ${padded}`;

      // 结果 + 概率显示
      const resultEl = document.getElementById("result");
      if (resultEl) {
        const color = data.probability >= 70 ? "green" : "orange";
        resultEl.innerHTML = `${data.result} <span style="color:${color}">（${data.probability}%）</span>`;
      }
    })
    .catch(() => {
      const cdEl = document.querySelector(".cd");
      const resultEl = document.getElementById("result");
      if (cdEl) cdEl.textContent = "加载失败";
      if (resultEl) resultEl.textContent = "AI离线中";
    });
}

setInterval(fetchData, 1000);
fetchData(); // 初次加载