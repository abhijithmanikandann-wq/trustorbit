document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('backBtn');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../activecontracts/contract/client_contract.html';
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
    });
});
