document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission
        console.log('Login form submitted');

        const payload = {
            email: loginForm.loginEmail.value,
            password: loginForm.loginPassword.value,
        };

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Status: ${res.status}`);

            const data = await res.json();
            window.location.href = '/';
        } catch (error) {
            console.error('Error during Login:', error);
            alert('Login failed. Please try again.');
        }
    });
});