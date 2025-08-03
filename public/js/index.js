const teacherRole = 'teacher';
const startExamButton = document.getElementById('startExamButton');
const createExamButton = document.getElementById('createExamButton');
const userIconBtn = document.getElementById('userIconBtn');
const userDropdown = document.getElementById('userDropdown');
const grid = document.getElementById('examsGrid');

/*
* TODOS:
* 1. Fetch real exam data from the server and render it in the grid.
* 2. Change the mock examID in createCard function to use real exam IDs.
*/

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch current authenticated user data
  const { name: userName, id: userID, role: userRole } = await fetchAuthenticatedUser();

  // store user data in session storage
  sessionStorage.setItem('userName', userName);
  sessionStorage.setItem('userRole', userRole);
  sessionStorage.setItem('userID', userID);

  // set user name in the drop-down menu
  document.getElementById('userName').innerText = userName;

  // set page design based on user role
  if (userRole === teacherRole) {
    createExamButton.classList.remove('hidden');
    createExamButton.addEventListener('click', createExam);
  } else {
    startExamButton.classList.remove('hidden');
    startExamButton.addEventListener('click', showStartExamPopup);
  }

  // mock exam data - replace with real data from the server
  const mockExam1 = { title: 'Math Exam', date: '2023-10-01', time: '10:00 AM', status: 'private', grade: '85' };
  const mockExam2 = { title: 'Science Exam', date: '2023-10-02', time: '11:00 AM', status: 'in_progress', grade: '60' };
  const mockExam3 = { title: 'History Exam', date: '2023-10-03', time: '12:00 PM', status: 'done', grade: '75' };
  const mockExam4 = { title: 'English Exam', date: '2023-10-04', time: '1:00 PM', status: 'private', grade: '45' };
  const mockExam5 = { title: 'Geography Exam', date: '2023-10-05', time: '2:00 PM', status: 'in_progress', grade: '90' };
  const mockExams = [mockExam1, mockExam2, mockExam3, mockExam4, mockExam5,
     mockExam1, mockExam2, mockExam3, mockExam4, mockExam5,
     mockExam1, mockExam2, mockExam3, mockExam4, mockExam5];

  // Render exams on the page - replace with real data from the server
  renderExams(mockExams);
});

// Render exams on the page
function renderExams(exams) {
  exams.forEach(exam => {
    const card = createCard(exam);
    grid.appendChild(card);
  });
}

// Create a grade element for an exam
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

// Create a status element for an exam
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

// Create a card element for an exam
function createCard(exam) {
  const userRole = sessionStorage.getItem('userRole');
  const userID = sessionStorage.getItem('userID');
  const { title, date, time, status, grade } = exam;
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

  // Add click event to redirect to exam details page
  card.addEventListener('click', () => {
    const mockExamID = '688eff0d93097a2a278c3b5b'; // Replace with real exam ID
    if (userRole === teacherRole) {
      window.location.href = `/exam-analysis.html?examID=${mockExamID}`;
    } else {
      window.location.href = `/exam-results.html?examID=${mockExamID}&userID=${userID}`;
    }
  });

  return card;
}

// Fetch authenticated user data
async function fetchAuthenticatedUser() {
  return await fetch('/auth/me', {
    method: 'GET',
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) {
        console.error('Error fetching authenticated user');

        // Clear session storage if user is not authenticated
        sessionStorage.clear();

        // Redirect to login page if not authenticated
        window.location.href = '/auth.html';
      }
      return res.json();
    });
}

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

    // Clear session storage on successful logout
    sessionStorage.clear();

    // Redirect to login page on successful logout
    window.location.href = '/auth.html';
  } catch (error) {
    console.error('Error during Logout:', error);
    alert('Logout failed. Please try again.');
  }
});

// redirect to create exam page
function createExam() {
  window.location.href = '/create-exam.html';
}

function getCodeValue(inputs) {
  const code = Array.from(inputs).map(input => input.value).join('');
  return code;
}

// Show the start exam popup
function showStartExamPopup() {
  const inputs = document.querySelectorAll('.code-input');
  
  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  const overlay = document.getElementById('ovelay');
  overlay.classList.remove('hidden');

  const closeButton = document.getElementById('closePopup');
  closeButton.addEventListener('click', () => {
    overlay.classList.add('hidden');
    examCodeInput.value = '';
  });

  const startButton = document.getElementById('startButton');
  startButton.addEventListener('click', async () => {
    const examCode = getCodeValue(inputs);
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
