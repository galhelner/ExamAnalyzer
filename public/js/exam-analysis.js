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
    renderStudentScoresTable(exam);

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
        Swal.fire({
            title: 'Deleting Exam...',
            html: '<div class="swal2-loading-spinner"></div>',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        const response = await fetch(`/exams/${exam._id}`, { method: 'DELETE' });
        if (response.ok) {
            Swal.fire({
                title: 'Deleted!',
                text: 'Exam deleted.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/';
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete exam.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const publishButton = document.createElement('button');
    publishButton.textContent = 'Publish Exam';
    publishButton.className = 'btn publish-btn';
    publishButton.onclick = async () => {
        Swal.fire({
            title: 'Publishing Exam...',
            html: '<div class="swal2-loading-spinner"></div>',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        const response = await fetch(`/exams/publish-exam`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ examId: exam._id })
        });
        if (response.ok) {
            Swal.fire({
                title: 'Published!',
                text: 'Published exam.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to publish exam.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
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
        Swal.fire({
            title: 'Ending Exam...',
            html: '<div class="swal2-loading-spinner"></div>',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        const response = await fetch(`/exams/finish-exam`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ examId: exam._id })
        });
        if (response.ok) {
            Swal.fire({
                title: 'Ended!',
                text: 'Ended exam.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to end exam.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    inProgressContainer.appendChild(codeContainer);
    inProgressContainer.appendChild(endExamButton);
    container.appendChild(inProgressContainer);
}

function renderStudentScoresTable(exam) {
    if (exam.status !== 'in_progress' && exam.status !== 'done') {
        return;
    }

    const container = document.getElementById('student-scores-table-container');
    container.innerHTML = '';

    // Add the heading above the table
    const heading = document.createElement('div');
    heading.textContent = 'Students grouped by grades:';
    heading.className = 'student-grades-heading';
    container.appendChild(heading);

    const table = document.createElement('table');
    table.className = 'student-scores-table';

    const header = table.createTHead();
    const headerRow = header.insertRow();
    const headers = ['0-25', '25-50', '50-75', '75-100'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    const ranges = {
        '0-25': [],
        '25-50': [],
        '50-75': [],
        '75-100': []
    };

    exam.submittions.forEach(sub => {
        const score = sub.score;
        const studentName = sub.userId.fullName;

        if (score >= 0 && score < 25) {
            ranges['0-25'].push(studentName);
        } else if (score >= 25 && score < 50) {
            ranges['25-50'].push(studentName);
        } else if (score >= 50 && score < 75) {
            ranges['50-75'].push(studentName);
        } else if (score >= 75 && score <= 100) {
            ranges['75-100'].push(studentName);
        }
    });

    const maxRows = Math.max(...Object.values(ranges).map(r => r.length));

    for (let i = 0; i < maxRows; i++) {
        const row = tbody.insertRow();
        headers.forEach(header => {
            const cell = row.insertCell();
            cell.textContent = ranges[header][i] || '';
        });
    }

    container.appendChild(table);
}
