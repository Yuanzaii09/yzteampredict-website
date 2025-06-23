const cards = document.querySelectorAll('.card');

// 卡片点击高亮效果
cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// 每秒向后端获取最新的 period 和结果
async function fetchPeriodData() {
  try {
    const res = await fetch("https://predict-gamma.vercel.app/");
    const data = await res.json();

    // 更新 Period 显示
    const periodEl = document.getElementById("period");
    if (periodEl) periodEl.textContent = data.period;

    // 更新倒计时显示
    const cdEl = document.querySelector(".cd");
    if (cdEl) cdEl.textContent = `00 : ${String(data.countdown).padStart(2, "0")}`;

    // 更新结果显示
    const resultEl = document.getElementById("result");
    if (resultEl) resultEl.textContent = data.result;

  } catch (e) {
    const resultEl = document.getElementById("result");
    if (resultEl) resultEl.textContent = "获取失败";
  }
}

// 初始执行一次 + 每秒执行
fetchPeriodData();
setInterval(fetchPeriodData, 1000);