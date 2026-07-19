document.addEventListener('DOMContentLoaded', () => {
    // Subtle parallax effect on background grid
    const bgGrid = document.querySelector('.background-grid');
    
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20; // max 10px offset
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        bgGrid.style.transform = `translate(${x}px, ${y}px)`;
    });
    // Add hover effects for buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)`;
        });
        btn.addEventListener('mouseleave', function() {
            if(this.classList.contains('btn-login')) {
                this.style.boxShadow = `0 4px 30px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05)`;
            } else {
                this.style.boxShadow = 'none';
            }
        });
    });
});
