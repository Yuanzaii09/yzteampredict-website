// card 点击逻辑保持不变
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// 获取最新一期 issueNumber
function updatePeriod() {
  fetch("https://mzplayapi.com/api/webapi/getNoaverageEmerdList", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 你的_Bearer_Token", // ⚠️ 替换为你自己的 Token
      "Content-Type": "application/json;charset=UTF-8",
      "Origin": "https://mzplayj.com",
      "Referer": "https://mzplayj.com/"
    },
    body: JSON.stringify({
      gameId: 1,
      pageNo: 1,
      pageSize: 1 // 只要最新一期
    })
  })
  .then(res => res.json())
  .then(data => {
    const latest = data?.data?.list?.[0]?.issueNumber || "未知";
    document.getElementById("period").textContent = "Period: " + latest;
  })
  .catch(() => {
    document.getElementById("period").textContent = "Period 获取失败";
  });
}

// 初次加载 + 每30秒刷新
updatePeriod();
setInterval(updatePeriod, 30000);