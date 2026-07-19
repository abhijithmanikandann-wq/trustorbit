document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const destinations = {
        'messages-card': 'messages/messages.html',
        'contracts-card': 'active requests/activereq.html',
        'project-card': 'new project/newproject.html'
    };
    
    cards.forEach(card => {
        // Add click event listener to demonstrate interactivity
        card.addEventListener('click', () => {
            const destination = destinations[card.id];
            if (destination) {
                window.location.assign(destination);
            }
        });
        // Add a subtle spotlight effect on hover
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
        // Reset the spotlight effect when mouse leaves
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', `50%`);
            card.style.setProperty('--mouse-y', `50%`);
        });
    });
});
