document.addEventListener('DOMContentLoaded', () => {
    // Add interactivity to the cards
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                window.location.assign('project request/projectsuggestion.html');
            }, 150);
        });
    });
    // Add interactivity to the back button
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            backBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                window.location.assign('../talenthome.html');
            }, 150);
        });
    }
});
