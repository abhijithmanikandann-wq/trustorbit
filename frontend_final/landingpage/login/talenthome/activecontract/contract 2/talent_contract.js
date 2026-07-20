document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const yellowTag = document.querySelector('.yellow-tag');
    // Add click ripple effect or scale animation
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
    yellowTag.addEventListener('click', () => {
        window.location.href = '../talent_act_con_banner.html';
    });
});
