document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const startBtn = document.getElementById('startBtn');
    loginBtn.addEventListener('click', () => {
        window.location.href = 'login/loginc.html';
    });
    startBtn.addEventListener('click', () => {
        window.location.href = 'createaccount/createacc.html';
    });
    // Add subtle hover interaction to buttons
    loginBtn.addEventListener('mouseenter', () => {
        loginBtn.style.transform = 'scale(1.02) rotate(-3deg)';
    });
    
    loginBtn.addEventListener('mouseleave', () => {
        loginBtn.style.transform = 'scale(1) rotate(-3deg)';
    });
    startBtn.addEventListener('mouseenter', () => {
        startBtn.style.transform = 'scale(1.02) rotate(-3deg)';
    });
    
    startBtn.addEventListener('mouseleave', () => {
        startBtn.style.transform = 'scale(1) rotate(-3deg)';
    });
    // Optional: Add a simple parallax effect to the background pattern on mouse move
    const bgPattern = document.querySelector('.bg-pattern');
    
    document.addEventListener('mousemove', (e) => {
        if (!bgPattern) return;
        
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        bgPattern.style.backgroundPosition = `${x * 20}px ${y * 20}px`;
    });
});
