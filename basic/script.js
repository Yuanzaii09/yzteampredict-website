const toggleBtn = document.getElementById('toggleBtn');

toggleBtn.addEventListener('click', () => {
  toggleBtn.classList.toggle('on');
  const isOn = toggleBtn.classList.contains('on');
  console.log('Toggle state:', isOn ? '开启' : '关闭');
});