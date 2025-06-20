// 处理点击卡片激活状态
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// 获取 MZPLAY Period 的函数
function updatePeriod() {
  fetch("https://mzplay-fixed.zfx.workers.dev")  // 我提供的中转 API
    .then(res => res.json())
    .then(data => {
      document.getElementById("period").textContent = "Period: " + data.data.issueNumber;
    })
    .catch(() => {
      document.getElementById("period").textContent = "Period 获取失败";
    });
}

// 初始化加载一次 + 每30秒自动刷新
updatePeriod();
setInterval(updatePeriod, 30000);