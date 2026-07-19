document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.querySelector('.login-btn');
            
            // Basic animation to show loading state
            const originalText = btn.textContent;
            btn.textContent = 'Logging in...';
            btn.style.opacity = '0.7';
            
            // Simulate an API call
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.opacity = '1';
                const role = localStorage.getItem('trustOrbitRole') || 'talent';
                const destination = role === 'client'
                    ? 'client home/clienthome.html'
                    : 'talent home/talenthome.html';
                window.location.assign(destination);
            }, 1500);
        });
    }
});
