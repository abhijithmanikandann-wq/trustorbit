document.addEventListener('DOMContentLoaded', () => {
    // Select all cards for interaction
    const cards = document.querySelectorAll('.card');
    
    // Add dynamic 3D-like hover effect using mouse movement tracking
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            // Calculate center points
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation values (subtle)
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset transform when mouse leaves
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            // Adding a small delay to ensure CSS transition takes over smoothly
            setTimeout(() => {
                card.style.transform = '';
            }, 50);
        });
    });
});