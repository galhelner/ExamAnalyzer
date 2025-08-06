// get the exam id from query string
const urlParams = new URLSearchParams(window.location.search);
const examID = urlParams.get('examID');

const userID = sessionStorage.getItem('userID');

function blockBackNavigation() {
  window.history.pushState(null, '', window.location.href);
  window.history.pushState(null, '', window.location.href);

  window.addEventListener('popstate', function(event) {
    // Push states again to prevent back
    window.history.pushState(null, '', window.location.href);
    console.log('Back navigation blocked');
    confirmExitExam();
  });
}

blockBackNavigation();

document.addEventListener('DOMContentLoaded', async function () {
    // Fetch exam data from server
    const examData = await fetchExamData(examID);

    if (examData.success === false) {
        alert('Failed to load exam data: ' + examData.message);
        return;
    }
    
    const exam = examData.data;
    console.log('Exam data:', exam);

    // Set title
    document.title = exam.title;
    document.getElementById('exam-title').textContent = exam.title;
    document.getElementById('exam-teacher').textContent = `Teacher: ${exam.createdBy.fullName}`;

    // Render questions
    renderQuestions(exam);
    
    // Handle form submit
    document.getElementById('do-exam-form').addEventListener('submit', async (e) => submitExam(e, examID, exam));

    // Handle exit exam button
    const exitBtn = document.getElementById('exit-exam-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => confirmExitExam());
    }
});

function confirmExitExam() {
    // Confirm exit
    Swal.fire({
        title: 'Exit Exam',
        html: 'Are you sure you want to exit the exam?<br>Your score will be 0.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, exit',
        cancelButtonText: 'No, stay'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await submitEmptyExam(examID);
            setTimeout(() => {
                // redirect to home page after a short delay to ensure submission commited
                window.location.replace('/');
            }, 500);
        } else {
            window.history.pushState(null, '', window.location.href); // restore state
        }
    });
}

async function fetchExamData(examID) {
    try {
        const response = await fetch(`/exams/${examID}`);
        if (!response.ok) {
            throw new Error('Failed to load exam data.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching exam data:', error);
        alert('Failed to load exam data.');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderQuestions(exam) {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';

    exam.questions.forEach((q, idx) => {
        // shuffle options
        const shuffledOptions = shuffleArray(q.options.slice());

        const block = document.createElement('div');
        block.className = 'question-block';
        block.innerHTML = `
            <div class="question-header-row">
                <span class="question-title">${idx + 1}. ${q.description}</span>
                <span class="question-points">${q.points} pts</span>
            </div>
            <div class="answers">
                ${shuffledOptions.map((ans, aIdx) => `
                    <div class="answer-option" onclick="this.querySelector('input[type=radio]').checked = true;">
                        <input type="radio" id="q${idx}_a${aIdx}" name="question_${idx}" value="${ans}" required>
                        <label for="q${idx}_a${aIdx}">${ans}</label>
                    </div>
                `).join('')}
            </div>
        `;
        questionsContainer.appendChild(block);
    });
}

async function submitEmptyExam(examID) {
    fetch('/exams/submit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examID, answers: [] }),
        credentials: 'include'
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            console.log('Exam submitted with no answers.');
        } else {
            console.error('Failed to submit empty exam:', result.message);
        }
    })
    .catch(err => {
        console.error('Error submitting empty exam:', err);
    });
}

async function submitExam(e, examID, exam) {
    e.preventDefault();

    // get submitted answers
    const answers = [];
    exam.questions.forEach((q, idx) => {
        const selected = document.querySelector(`input[name="question_${idx}"]:checked`);
        const answerIndex = exam.questions[idx].options.indexOf(selected ? selected.value : null);
        answers.push(answerIndex);
    });

    Swal.fire({
        title: 'Submitting Exam...',
        text: 'Please wait while we submit your answers.',
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Send answers to server
    fetch('/exams/submit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examID, answers }),
        credentials: 'include'
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                const score = result.data;
                Swal.fire({
                    title: 'Exam Submitted',
                    icon: 'success',
                    html: `
                    <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
                        <button id="btn-ok" class="swal2-confirm swal2-styled">OK</button>
                        <button id="btn-view-results" class="swal2-confirm swal2-styled">View Results</button>
                    </div>`,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        document.getElementById('btn-view-results').addEventListener('click', () => {
                            window.location.href = `/exam-results.html?examID=${examID}&userID=${userID}`;
                        });
                        document.getElementById('btn-ok').addEventListener('click', () => {
                            window.location.href = '/';
                        });
                    }
                });
            } else {
                alert(result.message || 'Submission failed.');
            }
        })
        .catch(err => {
            alert('Error submitting exam.');
            console.error(err);
        });
}