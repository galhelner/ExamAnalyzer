const container = document.getElementById('authContainer');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const formTitle = document.getElementById('formTitle');
const infoTitle = document.getElementById('infoTitle');
const infoText = document.getElementById('infoText');
const roleSelector = document.getElementById('roleSelector');
const roleDropdown = document.getElementById('role');
const submitButton = document.getElementById('submit');
const authFullName = document.getElementById('authFullName');
let isLogin = true;

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        if (isLogin) {
            await login();
        } else {
            await register();
        }
    });
});

toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  container.classList.toggle('register');

  if (!isLogin) {
    // register mode
    formTitle.textContent = 'Register';
    submitButton.textContent = 'Register';
    infoTitle.textContent = 'Join Us!';
    infoText.textContent = 'Sign up and explore our platform.';
    toggleLink.textContent = 'Login';
    toggleText.textContent = 'Already have an account? ';
    roleSelector.style.display = 'flex';
    roleDropdown.disabled = false;
    roleDropdown.required = true;
    authFullName.classList.remove('hidden');
    authFullName.required = true;
  } else {
    // login mode
    formTitle.textContent = 'Login';
    submitButton.textContent = 'Login';
    infoTitle.textContent = 'Welcome Back!';
    infoText.textContent = 'Login to continue your journey.';
    toggleLink.textContent = 'Register';
    toggleText.textContent = 'Don\'t have an account? ';
    roleSelector.style.display = 'none';
    roleDropdown.disabled = true;
    roleDropdown.required = false;
    authFullName.classList.add('hidden');
    authFullName.required = false;
  }
});

// login submission handler
async function login() {
    const payload = {
            email: authForm.authEmail.value,
            password: authForm.authPassword.value,
        };

        try {
            const res = await fetch('/auth/login', {
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

            // Redirect to home page on successful login
            window.location.href = '/';
        } catch (error) {
            console.error('Error during Login:', error);
            alert('Login failed. Please try again.');
        }
}

// registration submission handler
async function register() {
    const payload = {
            fullName: authFullName.value,
            email: authForm.authEmail.value,
            password: authForm.authPassword.value,
            role: authForm.role.value,
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

            // Redirect to home page on successful registration
            window.location.href = '/';
        } catch (error) {
            console.error('Error during Registration:', error);
            alert('Registration failed. Please try again.');
        }
}
