document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const container = document.querySelector('.toggle-container');

  toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.toggle('on');
    container.classList.toggle('on');
  });
});