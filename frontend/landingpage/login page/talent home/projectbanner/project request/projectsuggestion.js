
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('backBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    const acceptBtn = document.getElementById('acceptBtn');
    backBtn.addEventListener('click', () => {
        window.location.assign('../projectbanner.html');
    });
    rejectBtn.addEventListener('click', () => {
        window.location.assign('../projectbanner.html');
    });
    acceptBtn.addEventListener('click', () => {
        window.location.assign('../../active contract/activecontract.html');
    });
});
