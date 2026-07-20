document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', (e) => {
        // Prevent default form submission
        e.preventDefault();
        
        // Get values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Basic validation logging
        if (email && password) {
            const savedUser = JSON.parse(localStorage.getItem('trustOrbitUser') || 'null');
            const role = savedUser?.email === email ? savedUser.role : 'client';
            window.location.href = role === 'talent'
                ? 'talenthome/thome.html'
                : 'clienthome/chome.html';
        }
    });
});
