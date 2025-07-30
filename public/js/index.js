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

      function createStatusElement(status) {
        const statusElement = document.createElement('div');
        statusElement.title = status;
        statusElement.style.width = '20px';
        statusElement.style.height = '20px';
        statusElement.style.borderRadius = '50%';
        statusElement.style.marginTop = '10px';

        if (status === 'private') {
          statusElement.style.backgroundColor = 'red';
        } else if (status === 'in_progress') {
          statusElement.style.backgroundColor = 'yellow';
        } else if (status === 'done') {
          statusElement.style.backgroundColor = 'green';
        }

        return statusElement;
      }

      function createGradeElement(grade) {
        const gradeElement = document.createElement('div');
        gradeElement.style.width = '50px';
        gradeElement.style.height = '20px';
        gradeElement.style.borderRadius = '5px';
        gradeElement.style.marginTop = '10px';
        gradeElement.style.textAlign = 'center';
        gradeElement.style.color = 'white';
        gradeElement.style.fontWeight = 'bold';
        gradeElement.innerText = grade;

        if (grade > 55) {
          gradeElement.style.backgroundColor = 'green';
        } else {
          gradeElement.style.backgroundColor = 'red';
        }

        return gradeElement;
      }

      function createCard(title, date, time, status, grade) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
          <h3>${title}</h3>
          <p>${date}</p>
          <p>${time}</p>
        `;
        if (userRole === teacherRole) {
          card.appendChild(createStatusElement(status));
        } else {
          card.appendChild(createGradeElement(grade));
        }
        return card;
      }

      // Example: Inject 5 cards
      const exam1 = createCard('Math Exam', '2023-10-01', '10:00 AM', 'private', '85');
      const exam2 = createCard('Science Exam', '2023-10-02', '11:00 AM', 'in_progress', '60');
      const exam3 = createCard('History Exam', '2023-10-03', '12:00 PM', 'done', '75');
      const exam4 = createCard('English Exam', '2023-10-04', '1:00 PM', 'private', '45');
      const exam5 = createCard('Geography Exam', '2023-10-05', '2:00 PM', 'in_progress', '90');
      grid.appendChild(exam1);
      grid.appendChild(exam2);
      grid.appendChild(exam3);
      grid.appendChild(exam4);
      grid.appendChild(exam5);
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
