<!-- Period 显示区 -->
<div id="period">加载中...</div>

<script>
// 原本的卡片点击逻辑
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// Period 自动生成逻辑
function getCurrentPeriod() {
  const now = new Date();

  // 获取今天的年月日
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // 计算从早上 8:00 到现在过去了多少秒
  const start = new Date();
  start.setHours(8, 0, 0, 0); // 今天的8:00AM
  const diffMs = now - start;

  let periodNum = 0;
  if (diffMs >= 0) {
    const diffSec = Math.floor(diffMs / 1000); // 毫秒转秒
    periodNum = Math.floor(diffSec / 30);      // 每30秒一期开
  }

  const fixedCode = "10005";
  const periodStr = String(periodNum).padStart(5, "0"); // 保证五位数
  const finalPeriod = `${year}${month}${day}${fixedCode}${periodStr}`;

  document.getElementById("period").textContent = finalPeriod;
}

// 初次加载 + 每30秒刷新
getCurrentPeriod();
setInterval(getCurrentPeriod, 30000);
</script>