document.addEventListener('DOMContentLoaded', () => {
    initGrid();
    initTopographyBackground();
    document.querySelector('.back-button')?.addEventListener('click', () => {
        const isClient = new URLSearchParams(window.location.search).get('from') === 'client';
        window.location.href = isClient ? '../../clienthome/chome.html' : '../thome.html';
    });
});

/**
 * Initializes the grid with 12 card elements
 */
function initGrid() {
    const grid = document.getElementById('grid');
    // Create 12 cards as seen in the reference (4x3 grid)
    for (let i = 0; i < 12; i++) {
        const card = document.createElement('div');
        card.className = 'card';

        const dots = document.createElement('div');
        dots.className = 'card-dots';
        // Add 3 yellow dots to each card
        for (let j = 0; j < 3; j++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dots.appendChild(dot);
        }
        card.appendChild(dots);

        // Redirect to req_accept.html when the card is clicked
        card.addEventListener('click', () => {
            window.location.href = 'req_accept/req_accept.html';
        });

        grid.appendChild(card);
    }
}