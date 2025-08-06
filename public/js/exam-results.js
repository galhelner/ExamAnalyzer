function blockBackNavigation() {
  window.history.pushState(null, '', window.location.href);
  window.history.pushState(null, '', window.location.href);

  window.addEventListener('popstate', function(event) {
    // Push states again to prevent back
    window.history.pushState(null, '', window.location.href);
    console.log('Back navigation blocked');
    window.location.href = '/';
  });
}

blockBackNavigation();

document.addEventListener('DOMContentLoaded', async function () {
    // get the examID and userID from query string
    const urlParams = new URLSearchParams(window.location.search);
    const examID = urlParams.get('examID');
    const userID = urlParams.get('userID');

    // Fetch exam data from server
    const examData = await fetchExamData(examID);

    if (examData.success === false) {
        alert('Failed to load exam data: ' + examData.message);
        return;
    }

    const exam = examData.data;

    // Set title
    document.title = exam.title;
    document.getElementById('exam-title').textContent = exam.title;
    document.getElementById('exam-teacher').textContent = `Teacher: ${exam.createdBy.fullName}`;

    // set score with indicator
    const submission = exam.submittions[0];
    const score = submission ? Math.ceil(submission.score) : 0;
    const scoreBlock = document.getElementById('score-block');
    let indicator = '';
    if (score < 56) {
        indicator = '<span class="score-indicator fail">&#10006;</span>'; // red X
    } else {
        indicator = '<span class="score-indicator pass">&#10004;</span>'; // green V
    }
    scoreBlock.innerHTML = `<span class="score-label">Score: ${score.toFixed(2)}</span>${indicator}`;

    // Render question results
    renderQuestions(exam, userID);

    // Show results container
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.classList.remove('hidden');

    // Handle exit button
    document.getElementById('exit-results-btn').addEventListener('click', function () {
        window.location.href = '/';
    });
});

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

function renderQuestions(exam, userID) {
    const questionsResults = document.getElementById('questions-results');
    // Calculate points per question
    const firstQuestionPoints = Math.ceil(100 / exam.questions.length);
    const questionPoints = (100 - firstQuestionPoints) / (exam.questions.length - 1);
    questionsResults.innerHTML = '';
    // Find the user's submission
    const submission = exam.submittions.find(sub => sub.userId._id.toString() === userID);
    const chosenAnswers = submission ? submission.answers : [];

    if (chosenAnswers.length === 0) {
        questionsResults.innerHTML = `
        <div class="no-answers">
            <p>No answers submitted!</p>
        </div>
        `;
        return;
    }

    exam.questions.forEach((q, idx) => {
        const block = document.createElement('div');
        block.className = 'result-block';
        const chosen = chosenAnswers[idx];
        const correct = 0; // correct answer is always index 0
        block.innerHTML = `
            <div class="question-header">
                <span class="question-title">${idx + 1}. ${q.description}</span>
                <span class="question-points">${q.points} pts</span>
            </div>
            <div class="answers-list">
                ${q.options.map((ans, aIdx) => {
                    let classes = '';
                    let label = '';
                    if (aIdx === chosen && aIdx === correct) {
                        classes = 'chosen-answer correct-answer';
                        label = '<span class="answer-label correct-label">Correct answer</span>';
                    } else if (aIdx === chosen) {
                        classes = 'chosen-answer incorrect';
                        label = '<span class="answer-label chosen-label">Your answer</span>';
                    } else if (aIdx === correct) {
                        classes = 'correct-answer';
                        // Only show correct label if user got it wrong
                        if (chosen !== correct) {
                            label = '<span class="answer-label correct-label">Correct answer</span>';
                        }
                    }
                    return `<div class="answer-row">${label ? label + '<br>' : ''}<span class="${classes}">${ans}</span></div>`;
                }).join('')}
            </div>
        `;
        questionsResults.appendChild(block);
    });
}
