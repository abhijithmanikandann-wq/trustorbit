document.addEventListener('DOMContentLoaded', () => {
    // Select our elements
    const backBtn = document.querySelector('.back-btn');
    const agreementBtn = document.getElementById('agreement-btn');
    const chatBtn = document.getElementById('chat-btn');
    // Add click event for the back button
    backBtn.addEventListener('click', () => {
        window.location.assign('../activereq.html');
    });
    // Add click event for the agreement button
    agreementBtn.addEventListener('click', () => {
        // Add subtle click animation
        agreementBtn.style.transform = 'scale(0.97)';
        setTimeout(() => {
            agreementBtn.style.transform = '';
        }, 150);
    });
    // Add click event for the chat button
    chatBtn.addEventListener('click', () => {
        // Add subtle click animation
        chatBtn.style.transform = 'scale(0.97)';
        setTimeout(() => {
            chatBtn.style.transform = '';
            window.location.assign('../../messages/messages.html');
        }, 150);
    });
});
