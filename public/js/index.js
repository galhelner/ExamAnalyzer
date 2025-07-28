const navButton1 = document.getElementById('navButton1');
const navButton2 = document.getElementById('navButton2');
const teacherRole = 'teacher';

document.addEventListener('DOMContentLoaded', () => {
  // Fetch current authenticated user data
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

      // Set buttons text based on user role
      setNavButtonsText(user.role);

      // Handle navigation buttons click events based on user role
      handleNavButtonsClick(user.role);
    })
    .catch(err => {
      console.error('Auth failed:', err);
      window.location.href = '/auth.html'; // redirect if not logged in
    });
});

// Function to set navigation buttons text based on user role
function setNavButtonsText(role) {
  if (role === teacherRole) {
    navButton1.textContent = 'Create Exam';
    navButton2.textContent = 'View Exams Analysis';
  } else {
    // student role
    navButton1.textContent = 'Start Exam';
    navButton2.textContent = 'My Grades';
  }
}

// Event listeners for navigation buttons based on user role
function handleNavButtonsClick(role) {
  if (role === teacherRole) {
    navButton1.addEventListener('click', () => {
      window.location.href = '/create-exam.html';
    });
    navButton2.addEventListener('click', () => {
    });
  } else {
    // student role
    navButton1.addEventListener('click', () => {
      console.log('clicked start exam button');
      showStartExamPopup();
    });
    navButton2.addEventListener('click', () => {
    });
  }
}


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

function showStartExamPopup() {
  const overlay = document.getElementById('ovelay');
  overlay.classList.remove('hidden');

  const closeButton = document.getElementById('closePopup');
  closeButton.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  const startExamButton = document.getElementById('startExamButton');
  startExamButton.addEventListener('click', async () => {
    const examCode = document.getElementById('examCode').value;
    if (examCode) {
      const response = await fetch('/exams/validate-exam-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ examCode }),
        credentials: 'include'
      });

      const result = await response.json();

      if (!result.success) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Failed to validate exam code.'
        });
        return;
      }

      const examID = result.data;

      // redirect to exam page with the exam ID
      window.location.href = `/do-exam.html?examID=${examID}`;
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please enter an exam code.'
      });
    }
  });
}
