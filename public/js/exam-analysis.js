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

    // NEW: show status label below title
    const statusHost = document.getElementById('exam-status');
    const { text, className } = mapStatusToLabel(exam.status);
    statusHost.textContent = text;
    statusHost.classList.add(className);

    renderQuestions(exam);
    renderExamStateActions(exam);

    // Remove the table from the page, only show via popup
    const scoresTableContainer = document.getElementById('student-scores-table-container');
    scoresTableContainer.innerHTML = '';

    // Handle exit button
    const exitButton = document.getElementById('exit-analysis-btn');
    exitButton.style.display = 'block';  // Make the button visible
    exitButton.addEventListener('click', function () {
        window.location.href = '/';
    });
});

function mapStatusToLabel(status) {
    switch (status) {
        case 'private':
            return { text: 'Not Published', className: 'status-private' };
        case 'in_progress':
            return { text: 'Open For Submission', className: 'status-in-progress' };
        case 'done':
            return { text: 'Exam Ended', className: 'status-done' };
        default:
            return { text: status || '', className: '' };
    }
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
        return { success: false, message: error.message };
    }
}

/*
 * Renders the exam questions and answer statistics to the page
*/
function renderQuestions(exam) {
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
        const points = q.points;
        let content = `
            <div class="question-header">
                <span class="question-title">${idx + 1}. ${q.description}</span>
                <span class="question-points">${points} pts</span>
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
/*
 * Displays action buttons based on the exam's current status.
*/
function renderExamStateActions(exam) {
    const actionButtonsContainer = document.getElementById('action-buttons');
    actionButtonsContainer.innerHTML = '';

    switch (exam.status) {
        case 'private':
            renderPrivateStateActions(exam, actionButtonsContainer);
            break;
        case 'in_progress':
        case 'done':
            renderInProgressStateActions(exam, actionButtonsContainer);
            break;
    }
}

/*
 * Renders buttons for deleting or publishing a private exam.
*/
function renderPrivateStateActions(exam, container) {
    // Create a flex container for horizontal stacking
    const privateBtnContainer = document.createElement('div');
    privateBtnContainer.className = 'private-btn-container';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit Exam';
    editButton.className = 'btn edit-btn';
    editButton.onclick = () => {
        window.location.href = `/exam-edit.html?examID=${exam._id}`;
    };

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

    privateBtnContainer.appendChild(editButton);
    privateBtnContainer.appendChild(deleteButton);
    privateBtnContainer.appendChild(publishButton);
    container.appendChild(privateBtnContainer);
}

/*
 * Renders controls for in-progress or finished exams, 
   including code, group, and grading popups.
*/
function renderInProgressStateActions(exam, container) {
    const inProgressContainer = document.createElement('div');
    inProgressContainer.className = 'in-progress-container';

    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-container';

    // Only show exam code and copy button if exam is in progress
    if (exam.status === 'in_progress') {
        // Create wrapper for code input and copy button
        const codeInputWrapper = document.createElement('div');
        codeInputWrapper.className = 'code-input-wrapper';

        const codeInput = document.createElement('input');
        codeInput.type = 'text';
        codeInput.value = exam.examCode;
        codeInput.readOnly = true;
        codeInput.className = 'exam-code-input';

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.innerHTML = `
            <img src="images/copy-icon.png" alt="Copy">
            <div class="checkmark"></div>
        `; 
        copyButton.onclick = async () => {
            try {
                // modern async clipboard API
                await navigator.clipboard.writeText(codeInput.value);
                
                // Show checkmark animation
                copyButton.classList.add('show-checkmark');
                setTimeout(() => {
                    copyButton.classList.remove('show-checkmark');
                }, 600);
                
            } catch (err) {
                console.warn('Clipboard API failed, please copy manually', err);
                // fallback: select the text and prompt user
                codeInput.removeAttribute('readonly');
                codeInput.select();
                alert('Failed to copy code. Press ⌘+C (or Ctrl+C) to copy');
                codeInput.setAttribute('readonly', '');
            }
            // animate the button click
            copyButton.classList.add('clicked');
            setTimeout(() => copyButton.classList.remove('clicked'), 300);
        };

        // Add input and copy button to the wrapper
        codeInputWrapper.appendChild(codeInput);
        codeInputWrapper.appendChild(copyButton);
        
        // Add the wrapper to the container
        codeContainer.appendChild(codeInputWrapper);
    }

    // Create and add popup buttons for groups and grading
    const showGroupsBtn = document.createElement('button');
    showGroupsBtn.textContent = 'Show Groups by Grades';
    showGroupsBtn.className = 'btn popup-btn same-size-btn';
    
    const showGradesBtn = document.createElement('button');
    showGradesBtn.textContent = 'Show Grading';
    showGradesBtn.className = 'btn popup-btn same-size-btn';
    // Check if there are any submissions
    const noSubmissions = !exam.submittions || exam.submittions.length === 0;
    if (noSubmissions) {
        showGroupsBtn.disabled = true;
        showGradesBtn.disabled = true;
        showGroupsBtn.classList.add('disabled-btn');
        showGradesBtn.classList.add('disabled-btn');
    }
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'popup-buttons';
    buttonsDiv.appendChild(showGroupsBtn);
    buttonsDiv.appendChild(showGradesBtn);
    // Add grayed text if no submissions
    if (noSubmissions) {
        const noSubText = document.createElement('div');
        noSubText.textContent = 'No students have submitted the exam yet';
        noSubText.className = 'no-submissions-text';
        buttonsDiv.insertBefore(noSubText, buttonsDiv.firstChild);
    }
    codeContainer.appendChild(buttonsDiv);
    
    showGroupsBtn.onclick = () => {
        showTablePopup(renderGroupTbl(exam, true));
    };
    showGradesBtn.onclick = () => {
        showTablePopup(renderGradesTbl(exam));
    };

    // Add the code container
    inProgressContainer.appendChild(codeContainer);
    
    // Only add end exam button if exam is in progress
    if (exam.status === 'in_progress') {
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
        inProgressContainer.appendChild(endExamButton);
    }
    container.appendChild(inProgressContainer);
}

/*
 * Creates a table grouping students by score ranges for the exam.
*/
function renderGroupTbl(exam, asElement = false) {
    if (exam.status !== 'in_progress' && exam.status !== 'done') {
        return null;
    }
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'popup-table-wrapper';
    const table = document.createElement('table');
    table.className = 'student-scores-table groups-table';
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
    tableWrapper.appendChild(table);
    return tableWrapper;
}

/*
 * Creates a table listing students' names, emails, and scores for the exam.
*/
function renderGradesTbl(exam) {
    if (exam.status !== 'in_progress' && exam.status !== 'done') {
        return null;
    }
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'popup-table-wrapper';
    const table = document.createElement('table');
    table.className = 'student-scores-table grades-table';
    const header = table.createTHead();
    const headerRow = header.insertRow();
    const headers = ['Full Name', 'Email', 'Score'];
    headers.forEach((text) => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    const tbody = table.createTBody();
    exam.submittions.forEach(sub => {
        const row = tbody.insertRow();
        row.insertCell().textContent = sub.userId.fullName;
        row.insertCell().textContent = sub.userId.email;
        row.insertCell().textContent = sub.score;
    });
    tableWrapper.appendChild(table);
    return tableWrapper;
}

/*
 * Displays a popup containing a table and handles closing the popup.
*/
function showTablePopup(tableElement) {
    const popupContainer = document.getElementById('table-popup-container');
    popupContainer.innerHTML = '';
    // Disable background scroll using class
    document.body.classList.add('popup-open');
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    const popup = document.createElement('div');
    popup.className = 'popup-table';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    function closePopup() {
        popupContainer.innerHTML = '';
        document.body.classList.remove('popup-open');
    }
    closeBtn.onclick = closePopup;
    overlay.onclick = (e) => {
        if (e.target === overlay) closePopup();
    };
    popup.appendChild(closeBtn);
    popup.appendChild(tableElement);
    overlay.appendChild(popup);
    popupContainer.appendChild(overlay);
}
