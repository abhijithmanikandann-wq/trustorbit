document.addEventListener('DOMContentLoaded', () => {
    const rejectBtn = document.getElementById('rejectBtn');
    const acceptBtn = document.getElementById('acceptBtn');
    const backBtn = document.querySelector('.back-btn');
    rejectBtn.addEventListener('click', () => {
        rejectBtn.style.transform = 'translateY(5px) rotate(1deg)';
        setTimeout(() => {
            window.location.href = '../talent_reqs.html';
        }, 150);
    });
    acceptBtn.addEventListener('click', () => {
        acceptBtn.style.transform = 'translateY(5px) rotate(-1deg)';
        setTimeout(() => {
            window.location.href = '../../activecontract/contract%202/talent_contract.html';
        }, 150);
    });
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../talent_reqs.html';
        });
    }
});
