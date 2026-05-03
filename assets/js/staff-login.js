document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = togglePassword.querySelector('i');
            icon.classList.toggle('ri-eye-line');
            icon.classList.toggle('ri-eye-off-line');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const data = await fetchData('/auth/staff-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                localStorage.setItem('staffToken', data.token);
                localStorage.setItem('staffUser', JSON.stringify(data.user));
                window.location.href = 'staffDashboard.html';
            } catch (err) {
                alert('Đăng nhập thất bại: ' + err.message);
            }
        });
    }
});
