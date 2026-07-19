document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('projectForm');
    const backBtn = document.querySelector('.back-btn');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simple form validation or data collection here
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Form Data Submitted:', data);
        
        // Add a simple animation to the button to indicate success
        const submitBtn = form.querySelector('.post-btn');
        const originalHtml = submitBtn.innerHTML;
        const originalBg = submitBtn.style.backgroundColor;
        
        submitBtn.innerHTML = 'Posted! ✓';
        submitBtn.style.backgroundColor = '#28a745'; // Green color for success
        
        setTimeout(() => {
            window.location.assign('../active requests/activereq.html');
        }, 2000);
    });
    backBtn.addEventListener('click', () => {
        window.location.assign('../clienthome.html');
    });
});
