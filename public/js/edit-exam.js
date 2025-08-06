let questionCount = 0;
const maxExamNameLength = 40;
let currentExamId = null;

document.addEventListener('DOMContentLoaded', async function () {
    // Get exam ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentExamId = urlParams.get('examID');

    if (!currentExamId) {
        alert('Exam ID is missing.');
        window.location.href = '/';
        return;
    }

    // Load existing exam data
    await loadExamData(currentExamId);

    const examNameInput = document.getElementById('exam-name');
    const examNameError = document.getElementById('exam-name-error');

    examNameInput.addEventListener('input', function () {
        if (examNameInput.value.length > maxExamNameLength) {
            examNameError.style.display = 'block';
        } else {
            examNameError.style.display = 'none';
        }
    });
});

async function loadExamData(examId) {
    try {
        const response = await fetch(`/exams/${examId}`);
        if (!response.ok) {
            throw new Error('Failed to load exam data.');
        }
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to load exam data.');
        }

        const exam = result.data;
        
        // Populate exam name
        document.getElementById('exam-name').value = exam.title;
        
        // Clear existing questions and populate with exam data
        const questionsContainer = document.getElementById('questions-container');
        questionsContainer.innerHTML = '';
        
        exam.questions.forEach((question, index) => {
            const questionElement = createQuestionElement(index);
            
            // Populate question data
            questionElement.querySelector('textarea[name*="[description]"]').value = question.description;
            questionElement.querySelector('.question-points').value = question.points;
            
            // Populate answers
            const answerInputs = questionElement.querySelectorAll('.answers textarea');
            question.options.forEach((option, optionIndex) => {
                if (answerInputs[optionIndex]) {
                    answerInputs[optionIndex].value = option;
                }
            });
            
            // Trigger auto-expand for textareas
            questionElement.querySelectorAll('textarea.auto-expand').forEach(textarea => {
                textarea.style.height = '2.5em';
                if (textarea.value.length > 0 && textarea.scrollHeight > textarea.offsetHeight) {
                    textarea.style.height = 'auto';
                    textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
                }
            });
            
            questionsContainer.appendChild(questionElement);
        });
        
    } catch (error) {
        console.error('Error loading exam data:', error);
        alert('Failed to load exam data: ' + error.message);
        window.location.href = '/';
    }
}

function createQuestionElement(index) {
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `
        <div class="question-top-row">
            <label class="question-label">Question ${index + 1}:</label>
            <div class="points-input-group">
                <input type="number" class="question-points" name="questions[${index}][points]" min="1" max="100" placeholder="Points" required>
            </div>
            <button type="button" class="remove-question-btn">Remove</button>
        </div>
        <textarea class="auto-expand" name="questions[${index}][description]" placeholder="Enter question" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
        <div class="answers">
            <textarea class="auto-expand" name="questions[${index}][answers][0]" placeholder="Answer 1 - The correct answer!" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
            <textarea class="auto-expand" name="questions[${index}][answers][1]" placeholder="Answer 2" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
            <textarea class="auto-expand" name="questions[${index}][answers][2]" placeholder="Answer 3" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
            <textarea class="auto-expand" name="questions[${index}][answers][3]" placeholder="Answer 4" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
        </div>
    `;
    // Add auto-expand event listeners to textareas
    div.querySelectorAll('textarea.auto-expand').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = '2.5em';
            if (this.value.length > 0 && this.scrollHeight > this.offsetHeight) {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 180) + 'px';
            }
        });
    });
    div.querySelector('.remove-question-btn').onclick = function () {
        div.remove();
        updateQuestionLabels();
    };
    return div;
}

function updateQuestionLabels() {
    const blocks = document.querySelectorAll('.question-block');
    blocks.forEach((block, idx) => {
        block.querySelector('label').textContent = `Question ${idx + 1}:`;
        // Update points input name
        block.querySelector('.question-points').setAttribute('name', `questions[${idx}][points]`);
        // Update textarea name for question description
        block.querySelector('textarea.auto-expand').setAttribute('name', `questions[${idx}][description]`);
        const answerInputs = block.querySelectorAll('.answers textarea');
        answerInputs.forEach((input, aIdx) => {
            input.setAttribute('name', `questions[${idx}][answers][${aIdx}]`);
        });
    });
}

document.getElementById('add-question-btn').onclick = function () {
    const container = document.getElementById('questions-container');
    container.appendChild(createQuestionElement(container.children.length));
};

function updateExam(e) {
    e.preventDefault();
    
    if (!currentExamId) {
        alert('Exam ID is missing.');
        return;
    }
    
    const examName = document.getElementById('exam-name').value.trim();
    if (examName.length > maxExamNameLength) {
        Swal.fire({
            title: 'Error!',
            text: 'Exam name is limited to 40 characters.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    const questions = [];
    let totalPoints = 0;
    let pointsValid = true;
    const questionBlocks = document.querySelectorAll('.question-block');
    questionBlocks.forEach((block, idx) => {
        const questionText = block.querySelector('textarea.auto-expand').value.trim();
        const answerInputs = block.querySelectorAll('.answers textarea');
        const answers = Array.from(answerInputs).map(input => input.value.trim());
        const pointsInput = block.querySelector('.question-points');
        const points = parseInt(pointsInput.value, 10);
        if (isNaN(points) || points < 1) pointsValid = false;
        totalPoints += points;
        questions.push({ description: questionText, answers: answers, points });
    });

    if (questions.length === 0) {
        Swal.fire({
            title: 'Error!',
            text: 'You must add at least one question.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    if (!pointsValid || totalPoints !== 100) {
        Swal.fire({
            title: 'Error!',
            text: 'Total points must be exactly 100.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    const examData = {
        title: examName,
        questions: questions
    };

    fetch(`/exams/${currentExamId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ examData }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Exam updated successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirect back to exam analysis page
                    window.location.href = `/exam-analysis.html?examID=${currentExamId}`;
                }
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: result.message || 'Failed to update exam.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(err => {
        Swal.fire({
            title: 'Error!',
            text: 'Error updating exam.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        console.error(err);
    });
}

// Attach submit event to form
document.getElementById('edit-exam-form').addEventListener('submit', updateExam);

// Set Points Evenly button logic
document.getElementById('set-points-evenly-btn').onclick = function () {
    const blocks = document.querySelectorAll('.question-block');
    const n = blocks.length;
    if (n === 0) return;
    let even = Math.floor(100 / n);
    let remainder = 100 - even * n;
    if (remainder === 0) {
        // Set all to even
        blocks.forEach(block => {
            block.querySelector('.question-points').value = even;
        });
    } else {
        // Set first to ceil, rest to floor
        let ceil = Math.ceil(100 / n);
        blocks[0].querySelector('.question-points').value = ceil;
        let rest = Math.floor((100 - ceil) / (n - 1));
        let used = ceil;
        for (let i = 1; i < n; ++i) {
            // For last, use remaining to ensure sum is 100
            if (i === n - 1) {
                blocks[i].querySelector('.question-points').value = 100 - used;
            } else {
                blocks[i].querySelector('.question-points').value = rest;
                used += rest;
            }
        }
    }
};