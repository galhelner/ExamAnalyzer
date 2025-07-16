document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const payload = {
            email: registerForm.regEmail.value,
            password: registerForm.regPassword.value,
            role: registerForm.regRole.value || 'student', // Default to 'student' if no role is selected
        };

        try {
            const res = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include', // Include cookies for session management
            });

            if (!res.ok) throw new Error(`Status: ${res.status}`);

            const data = await res.json();
            console.log(data);

            // Redirect to login page on successful registration
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed. Please try again.');
        }
    });
});