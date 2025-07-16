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
    window.location.href = '/login.html'; // redirect if not logged in
  });
