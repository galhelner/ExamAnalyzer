document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const examID = urlParams.get('examID');

    if (!examID) {
        alert('Exam ID is missing.');
        window.location.href = '/';
        return;
    }

    const examData = await fetchExamData(examID);

    if (!examData.success) {
        alert('Failed to load exam data: ' + examData.message);
        return;
    }

    const exam = examData.data;
    document.title = exam.title;
    document.getElementById('exam-title').textContent = exam.title;

    renderAnalysis(exam);
    renderExamStateActions(exam);

    document.getElementById('exit-analysis-btn').addEventListener('click', function () {
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
        return { success: false, message: error.message };
    }
}

function renderAnalysis(exam) {
    const questionsResults = document.getElementById('questions-results');
    questionsResults.innerHTML = '';

    const answerCounts = exam.questions.map((q, qIdx) => {
        const counts = Array(q.options.length).fill(0);
        (exam.submittions || []).forEach(sub => {
            const ansIdx = sub.answers[qIdx];
            if (typeof ansIdx === 'number' && ansIdx >= 0 && ansIdx < q.options.length) {
                counts[ansIdx]++;
            }
        });
        return counts;
    });

    exam.questions.forEach((q, idx) => {
        const block = document.createElement('div');
        block.className = 'result-block';
        let content = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span class="question-title">${idx + 1}. ${q.description}</span>
            </div>
            <div class="answers-list">
                ${q.options.map((ans, aIdx) => {
                    return `
                        <div class="answer-row">
                            <span>${aIdx + 1}) ${ans}</span>
                        </div>
                        <div class="answered-count">answered: ${answerCounts[idx][aIdx]}</div>
                    `;
                }).join('')}
            </div>
        `;
        block.innerHTML = content;
        questionsResults.appendChild(block);
    });
}

function renderExamStateActions(exam) {
    const actionButtonsContainer = document.getElementById('action-buttons');
    actionButtonsContainer.innerHTML = '';

    switch (exam.status) {
        case 'private':
            renderPrivateStateActions(exam, actionButtonsContainer);
            break;
        case 'in_progress':
            renderInProgressStateActions(exam, actionButtonsContainer);
            break;
        case 'done':
            // No actions for done state
            break;
    }
}

function renderPrivateStateActions(exam, container) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Exam';
    deleteButton.className = 'btn delete-btn';
    deleteButton.onclick = async () => {
        if (confirm('Are you sure you want to delete this exam?')) {
            const response = await fetch(`/exams/${exam._id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Exam deleted successfully.');
                window.location.href = '/';
            } else {
                alert('Failed to delete exam.');
            }
        }
    };

    const publishButton = document.createElement('button');
    publishButton.textContent = 'Publish Exam';
    publishButton.className = 'btn publish-btn';
    publishButton.onclick = async () => {
        const response = await fetch(`/exams/publish-exam`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ examId: exam._id })
        });
        if (response.ok) {
            alert('Exam published successfully.');
            location.reload();
        } else {
            alert('Failed to publish exam.');
        }
    };

    container.appendChild(deleteButton);
    container.appendChild(publishButton);
}

function renderInProgressStateActions(exam, container) {
    const inProgressContainer = document.createElement('div');
    inProgressContainer.className = 'in-progress-container';

    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-container';

    const codeInput = document.createElement('input');
    codeInput.type = 'text';
    codeInput.value = exam.examCode;
    codeInput.readOnly = true;
    codeInput.className = 'exam-code-input';

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.innerHTML = '<img src="images/copy-icon.png" alt="Copy">'; // Placeholder for copy icon
    copyButton.onclick = () => {
        codeInput.select();
        document.execCommand('copy');
        alert('Exam code copied to clipboard!');
    };

    codeContainer.appendChild(codeInput);
    codeContainer.appendChild(copyButton);

    const endExamButton = document.createElement('button');
    endExamButton.textContent = 'End Exam';
    endExamButton.className = 'btn end-exam-btn';
    endExamButton.onclick = async () => {
        if (confirm('Are you sure you want to end this exam?')) {
            const response = await fetch(`/exams/finish-exam`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId: exam._id })
            });
            if (response.ok) {
                alert('Exam has been ended.');
                location.reload();
            } else {
                alert('Failed to end exam.');
            }
        }
    };

    inProgressContainer.appendChild(codeContainer);
    inProgressContainer.appendChild(endExamButton);
    container.appendChild(inProgressContainer);
}
