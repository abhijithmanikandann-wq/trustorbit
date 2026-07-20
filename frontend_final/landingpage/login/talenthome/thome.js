document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const openCard = (card) => {
        const route = card.dataset.route;
        if (route) window.location.href = route;
    };

    cards.forEach(card => {
        card.addEventListener('click', () => openCard(card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCard(card);
            }
        });
    });
    // Add a subtle 3D tilt effect on hover for the cards
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const tiltX = ((y - centerY) / centerY) * 10; // Max rotation 10deg
            const tiltY = ((x - centerX) / centerX) * -10;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-10px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    });
});
