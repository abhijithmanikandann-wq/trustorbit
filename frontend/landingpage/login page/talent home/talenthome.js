document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    
    // 3D Tilt Effect on hover for a premium dynamic feel
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to card center
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit rotation to max 10 degrees for subtlety
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            
            // Apply transform
            // We preserve the scale and hover effects by setting them inline, 
            // but normally we'd want to merge this with CSS.
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05) translateY(-12px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset transforms allowing CSS transition to take over
            card.style.transform = '';
        });
    });
    // Material-UI style Ripple effect on click
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Optional: prevent default if you just want to see the animation
            // e.preventDefault();
            
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            // Clean up the ripple element after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});