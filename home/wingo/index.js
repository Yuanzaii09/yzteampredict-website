const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// 获取 MZPLAY Period 的函数（使用 zfx workers 中转接口）
function updatePeriod() {
  fetch("https://mzplay-period.zfx.workers.dev/")
    .then(res => res.json())
    .then(data => {
      document.getElementById("period").textContent = "Period: " + (data.period || "无数据");
    })
    .catch(() => {
      document.getElementById("period").textContent = "Period 获取失败";
    });
}

// 初次加载 + 每30秒刷新
updatePeriod();
setInterval(updatePeriod, 30000);