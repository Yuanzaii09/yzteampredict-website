// card 选中效果
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

// 获取最新10期 issueNumber
function updatePeriod() {
  fetch("https://mzplayapi.com/api/webapi/getNoaverageEmerdList", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 你的_Bearer_Token", // ⬅️ 换成你自己抓到的
      "Content-Type": "application/json;charset=UTF-8",
      "Origin": "https://mzplayj.com",
      "Referer": "https://mzplayj.com/"
    },
    body: JSON.stringify({
      gameId: 1,
      pageNo: 1,
      pageSize: 10
    })
  })
  .then(res => res.json())
  .then(data => {
    const list = data?.data?.list || [];
    if (list.length === 0) {
      document.getElementById("period").textContent = "未找到数据";
      return;
    }

    // 组合显示10个期号
    const issuesHTML = list.map(item => `<li>${item.issueNumber}</li>`).join("");
    document.getElementById("period").innerHTML = `<ul>${issuesHTML}</ul>`;
  })
  .catch(() => {
    document.getElementById("period").textContent = "Period 获取失败";
  });
}

// 初次加载 + 每30秒刷新
updatePeriod();
setInterval(updatePeriod, 30000);