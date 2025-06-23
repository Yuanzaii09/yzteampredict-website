// 点击卡片时切换 active
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// 每秒更新 UI，从服务器获取当前 period 和 result
function updateFromServer() {
  fetch("https://your-vercel-api-url.vercel.app/") // ← ← ← 修改为你自己的 API 地址
    .then(res => res.json())
    .then(data => {
      // 显示期号
      const periodEl = document.getElementById("period");
      if (periodEl) periodEl.textContent = data.period || "无数据";

      // 显示倒计时
      const cdEl = document.querySelector(".cd");
      if (cdEl) cdEl.textContent = `00 : ${String(data.countdown).padStart(2, "0")}`;

      // 显示 BIG / SMALL 或 "AI运作中..."
      const resultEl = document.getElementById("result");
      if (resultEl) resultEl.textContent = data.result || "AI运作中...";
    })
    .catch(() => {
      const resultEl = document.getElementById("result");
      if (resultEl) resultEl.textContent = "获取失败";
    });
}

// 初次加载 + 每秒自动更新
updateFromServer();
setInterval(updateFromServer, 1000);