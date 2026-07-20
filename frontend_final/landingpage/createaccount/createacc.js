document.addEventListener('DOMContentLoaded', () => {
    const roleBtns = document.querySelectorAll('.role-btn');
    const selectedRoleInput = document.getElementById('selectedRole');
    const registrationForm = document.getElementById('registrationForm');
    const backBtn = document.querySelector('.back-btn');

    backBtn?.addEventListener('click', () => {
        window.location.href = '../land.html';
    });
    // Handle role selection
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            roleBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update hidden input value
            selectedRoleInput.value = btn.dataset.role;
        });
    });
    // Handle form submission
    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic validation check
        const newPassword = document.getElementById('newPassword').value;
        const reenterPassword = document.getElementById('reenterPassword').value;
        
        if (newPassword !== reenterPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            dob: document.getElementById('dob').value,
            userId: document.getElementById('userId').value,
            role: selectedRoleInput.value
        };
        localStorage.setItem('trustOrbitUser', JSON.stringify(formData));
        window.location.href = formData.role === 'talent'
            ? '../login/talenthome/thome.html'
            : '../login/clienthome/chome.html';
    });
});
