// Fetch user authentication status (id and role)
fetch('/auth/me', {
  method: 'GET',
  credentials: 'include'
})
  .then(res => {
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  })
  .then(user => {
    console.log('User ID:', user.id);
    console.log('User Role:', user.role);
  })
  .catch(err => {
    console.error('Auth failed:', err);
    window.location.href = '/auth.html'; // redirect if not logged in
  });

  // logout button click event listener
  document.getElementById('logout').addEventListener('click', async () => {
    try {
        const res = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include' // Include cookies for session management
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        // Redirect to login page on successful logout
        window.location.href = '/auth.html';
    } catch (error) {
        console.error('Error during Logout:', error);
        alert('Logout failed. Please try again.');
    }
  });
