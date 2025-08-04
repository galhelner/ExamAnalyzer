let questionCount = 0;
const maxExamNameLength = 40;

document.addEventListener('DOMContentLoaded', function () {
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

function createQuestionElement(index) {
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `
                <label>Question ${index + 1}:</label>
                <textarea class="auto-expand" name="questions[${index}][description]" placeholder="Enter question" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
                <div class="answers">
                    <textarea class="auto-expand" name="questions[${index}][answers][0]" placeholder="Answer 1 - The correct answer!" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
                    <textarea class="auto-expand" name="questions[${index}][answers][1]" placeholder="Answer 2" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
                    <textarea class="auto-expand" name="questions[${index}][answers][2]" placeholder="Answer 3" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
                    <textarea class="auto-expand" name="questions[${index}][answers][3]" placeholder="Answer 4" required autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
                </div>
                <button type="button" class="remove-question-btn">Remove</button>
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

// Add the first question by default
window.onload = function () {
    document.getElementById('add-question-btn').click();
};

function createExam(e) {
    e.preventDefault();
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
    const questionBlocks = document.querySelectorAll('.question-block');
    questionBlocks.forEach((block, idx) => {
        const questionText = block.querySelector('textarea.auto-expand').value.trim();
        const answerInputs = block.querySelectorAll('.answers textarea');
        const answers = Array.from(answerInputs).map(input => input.value.trim());
        questions.push({ description: questionText, answers });
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

    const data = {
        examName,
        questions
    };

    fetch('/exams/create-exam', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Exam created successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/';
                }
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: result.message || 'Failed to create exam.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(err => {
        alert('Error creating exam.');
        console.error(err);
    });
}

// Attach submit event to form
document.getElementById('create-exam-form').addEventListener('submit', createExam);