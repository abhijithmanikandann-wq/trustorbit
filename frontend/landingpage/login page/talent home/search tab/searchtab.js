document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const totalCards = 15; // 5 columns * 3 rows for standard view
    // Generate cards dynamically
    for (let i = 0; i < totalCards; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Card item ${i + 1}`);
        
        // Add ellipsis indicator in the bottom right corner
        const ellipsis = document.createElement('div');
        ellipsis.classList.add('ellipsis');
        
        for (let j = 0; j < 3; j++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            ellipsis.appendChild(dot);
        }
        
        card.appendChild(ellipsis);
        gridContainer.appendChild(card);
        
        // Add keyboard interaction for accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.style.transform = 'scale(0.95)';
                setTimeout(() => window.location.assign('../projectbanner/project request/projectsuggestion.html'), 150);
            }
        });
        
        // Add click interaction
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => window.location.assign('../projectbanner/project request/projectsuggestion.html'), 150);
        });
    }
    
    // Back button interaction
    const backBtn = document.querySelector('.back-button');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            backBtn.style.transform = 'scale(0.9)';
            setTimeout(() => window.location.assign('../talenthome.html'), 150);
        });
        
        backBtn.addEventListener('keydown', (e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.assign('../talenthome.html');
            }
        });
    }
});
