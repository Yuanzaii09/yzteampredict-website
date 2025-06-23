const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.card.active')?.classList.remove('active');
    card.classList.add('active');
  });
});

function updatePeriod() {
  fetch("https://你的项目名.vercel.app/api/period")
    .then(res => res.json())
    .then(data => {
      document.getElementById("period").textContent = "Period: " + data.period;
    })
    .catch(() => {
      document.getElementById("period").textContent = "Period 获取失败";
    });
}

updatePeriod();
setInterval(updatePeriod, 30000);