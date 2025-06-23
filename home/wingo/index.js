const cards = document.querySelectorAll('.card');

// 卡片切换激活
cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

let isPredicting = false;
let latestPeriod = ""; // 用来避免重复请求

function fetchResult() {
  fetch('https://yzteampredict-website.vercel.app/api/result')
    .then(res => res.json())
    .then(data => {
      const periodEl = document.getElementById("period");
      const cdEl = document.querySelector(".cd");
      const resultEl = document.getElementById("result");

      if (periodEl) periodEl.textContent = data.period;
      if (cdEl) cdEl.textContent = `00 : ${String(data.countdown).padStart(2, "0")}`;

      // 判断是否进入新一期（倒计时归0，换期）
      if (data.period !== latestPeriod) {
        latestPeriod = data.period;

        // 显示 AI 运作中...
        if (resultEl) resultEl.textContent = "AI运作中...";

        isPredicting = true;
        const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 秒之间

        setTimeout(() => {
          const color = data.probability >= 70 ? 'green' : 'orange';
          if (resultEl) {
            resultEl.innerHTML = `${data.result} <span style="color:${color}">(${data.probability}%)</span>`;
          }
          isPredicting = false;
        }, delay);
      }
    })
    .catch(() => {
      const resultEl = document.getElementById("result");
      if (resultEl) resultEl.textContent = "获取失败";
    });
}

// 每秒更新
setInterval(fetchResult, 1000);
fetchResult(); // 初次加载