document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Tilt effect on the dashboard cards as the cursor moves over them
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

    if (!prefersReducedMotion) {
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10; // max 10deg
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateY(-10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = ''; // reset on leave
            });
        });
    }
});
