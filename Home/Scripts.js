const toggleContainer = document.querySelector('.toggle-container');
const toggleButton = document.querySelector('.custom-toggle');

toggleButton.addEventListener('click', () => {
    toggleContainer.classList.toggle('on');
    toggleButton.classList.toggle('on');
});
