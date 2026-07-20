document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('projectForm');
    const backBtn = document.querySelector('.logo');

    backBtn?.addEventListener('click', () => {
        window.location.href = '../chome.html';
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        
        // Gather form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        localStorage.setItem('trustOrbitLatestProject', JSON.stringify(data));
        window.location.href = '../chome.html';
    });
});
