const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

function fetchResult() {
  fetch('https://predict-gamma.vercel.app/api/result')
    .then(res => res.json())
    .then(data => {
      document.getElementById("period").textContent = data.period;

      const cdEl = document.querySelector(".cd");
      cdEl.textContent = `00 : ${String(data.countdown).padStart(2, "0")}`;

      const resultEl = document.getElementById("result");
      const color = data.probability >= 70 ? 'green' : 'orange';
      resultEl.innerHTML = `${data.result} <span style="color:${color}">(${data.probability}%)</span>`;
    })
    .catch(() => {
      document.getElementById("result").textContent = "获取失败";
    });
}

fetchResult();
setInterval(fetchResult, 1000);  // 每秒更新一次