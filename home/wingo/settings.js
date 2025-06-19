const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('click', () => {
        document.querySelector('.card.active')?.classList.remove('active');
        card.classList.add('active');
    });
});
