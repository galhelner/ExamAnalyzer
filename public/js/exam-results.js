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

    // set score with indicator
    const score = exam.submittions.find(sub => sub.userId.toString() === userID)?.score || 0;
    const scoreBlock = document.getElementById('score-block');
    let indicator = '';
    if (score < 56) {
        indicator = '<span class="score-indicator fail">&#10006;</span>'; // red X
    } else {
        indicator = '<span class="score-indicator pass">&#10004;</span>'; // green V
    }
    scoreBlock.innerHTML = `<span class="score-label">Score: ${score}</span>${indicator}`;

    // Render question results
    renderQuestions(exam, userID);

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
    const questionPoints = 100 / exam.questions.length;
    questionsResults.innerHTML = '';
    // Find the user's submission
    const submission = exam.submittions.find(sub => sub.userId.toString() === userID);
    const chosenAnswers = submission ? submission.answers : [];
    exam.questions.forEach((q, idx) => {
        const block = document.createElement('div');
        block.className = 'result-block';
        block.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span class="question-title">${idx + 1}. ${q.description}</span>
                <span class="question-points">${questionPoints} pts</span>
            </div>
            <div class="answers-list">
                ${q.options.map((ans, aIdx) => {
                    let classes = '';
                    const chosen = chosenAnswers[idx];
                    const correct = 0; // correct answer is always index 0
                    if (aIdx === chosen && aIdx === correct) {
                        classes = 'chosen-answer correct-answer';
                    } else if (aIdx === chosen) {
                        classes = 'chosen-answer incorrect';
                    } else if (aIdx === correct) {
                        classes = 'correct-answer';
                    }
                    return `<div class="answer-row"><span class="${classes}">${ans}</span></div>`;
                }).join('')}
            </div>
        `;
        questionsResults.appendChild(block);
    });
}
