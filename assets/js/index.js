document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    // 1. Chuyển đổi giữa Đăng nhập và Đăng ký
    const switchTab = (mode) => {
        if (mode === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            tabLogin.classList.add('bg-white', 'shadow-sm', 'text-gray-800', 'font-bold');
            tabRegister.classList.remove('bg-white', 'shadow-sm', 'text-gray-800', 'font-bold');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            tabRegister.classList.add('bg-white', 'shadow-sm', 'text-gray-800', 'font-bold');
            tabLogin.classList.remove('bg-white', 'shadow-sm', 'text-gray-800', 'font-bold');
        }
    };

    tabLogin.onclick = () => switchTab('login');
    tabRegister.onclick = () => switchTab('register');

    // 2. Xử lý Đăng ký
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            await fetchData('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            alert('Đăng ký thành công! Hãy đăng nhập ngay.');
            switchTab('login');
            document.getElementById('loginEmail').value = email;
        } catch (err) {
            alert(err.message);
        }
    };

    // 3. Xử lý Đăng nhập
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const data = await fetchData('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            alert(`Chào mừng ${data.user.name} đã quay trở lại!`);
            localStorage.setItem('customerToken', data.token);
            localStorage.setItem('customerUser', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } catch (err) {
            alert(err.message);
        }
    };
});
