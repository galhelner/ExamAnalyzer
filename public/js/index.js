const teacherRole = 'teacher';
const startExamButton = document.getElementById('startExamButton');
const createExamButton = document.getElementById('createExamButton');
const userIconBtn = document.getElementById('userIconBtn');
const userDropdown = document.getElementById('userDropdown');

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
      const userRole = user.role;
      const userName = user.name;

      // set user name in the drop-down menu
      document.getElementById('userName').innerText = userName;

      if (userRole === teacherRole) {
        createExamButton.classList.remove('hidden');
        createExamButton.addEventListener('click', createExam);
      } else {
        startExamButton.classList.remove('hidden');
        startExamButton.addEventListener('click', showStartExamPopup);
      }


      // remove it!!!!
      const grid = document.getElementById('examsGrid');

      function createCard(title, content) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
          <h3>${title}</h3>
          <p>${content}</p>
        `;
        return card;
      }

      // Example: Inject 5 cards
      for (let i = 1; i <= 30; i++) {
        const card = createCard(`Card ${i}`, `This is card number ${i}.`);
        grid.appendChild(card);
      }


    })
    .catch(err => {
      console.error('Auth failed:', err);
      window.location.href = '/auth.html'; // redirect if not logged in
    });
});

// Toggle dropdown visibility
userIconBtn.addEventListener('click', () => {
  userDropdown.classList.toggle('hidden');
});

// Close dropdown if clicked outside
window.addEventListener('click', (e) => {
  if (!userIconBtn.contains(e.target) && !userDropdown.contains(e.target)) {
    userDropdown.classList.add('hidden');
  }
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

function createExam() {
  window.location.href = '/create-exam.html';
}

function showStartExamPopup() {
  const examCodeInput = document.getElementById('examCode');
  const overlay = document.getElementById('ovelay');
  overlay.classList.remove('hidden');

  const closeButton = document.getElementById('closePopup');
  closeButton.addEventListener('click', () => {
    overlay.classList.add('hidden');
    examCodeInput.value = '';
  });

  const startButton = document.getElementById('startButton');
  startButton.addEventListener('click', async () => {
    const examCode = examCodeInput.value;
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
