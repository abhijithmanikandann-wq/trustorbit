document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('backBtn');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../thome.html';
        });
    }
    // Optional: Add subtle floating animation to the messages
    const messages = document.querySelectorAll('.message-wrapper');
    messages.forEach((msg, index) => {
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(20px)';
        msg.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            msg.style.opacity = '1';
            msg.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
        msg.tabIndex = 0;
        msg.setAttribute('role', 'link');
        const openRequest = () => {
            window.location.href = 'accept/accept.html';
        };
        msg.addEventListener('click', openRequest);
        msg.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openRequest();
            }
        });
    });
});
