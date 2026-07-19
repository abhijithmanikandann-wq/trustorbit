document.addEventListener('DOMContentLoaded', () => {
    const roleBtns = document.querySelectorAll('.role-btn');
    const selectedRoleInput = document.getElementById('selectedRole');
    const form = document.getElementById('registrationForm');
    // Role selection logic
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            roleBtns.forEach(b => b.classList.remove('active'));
            // Add active class to the clicked button
            btn.classList.add('active');
            // Set the hidden input value
            selectedRoleInput.value = btn.dataset.role;
        });
    });
    // Form submission logic
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate role selection
        if (!selectedRoleInput.value) {
            alert('Please select whether you are a Client or Talent.');
            return;
        }
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        // Validate password match
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Keep the chosen role locally until authentication is connected.
        localStorage.setItem('trustOrbitRole', selectedRoleInput.value);

        const destination = selectedRoleInput.value === 'client'
            ? '../login page/client home/clienthome.html'
            : '../login page/talent home/talenthome.html';
        window.location.assign(destination);
    });
});
