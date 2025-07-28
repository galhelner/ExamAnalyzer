let questionCount = 0;
function createQuestionElement(index) {
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `
                <label>Question ${index + 1}:</label>
                <input type="text" name="questions[${index}][text]" placeholder="Enter question" required>
                <div class="answers">
                    <input type="text" name="questions[${index}][answers][0]" placeholder="Answer 1" required>
                    <input type="text" name="questions[${index}][answers][1]" placeholder="Answer 2" required>
                    <input type="text" name="questions[${index}][answers][2]" placeholder="Answer 3" required>
                    <input type="text" name="questions[${index}][answers][3]" placeholder="Answer 4" required>
                </div>
                <button type="button" class="remove-question-btn">Remove</button>
            `;
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
        // Update input names for correct indexing
        block.querySelector('input[type="text"]').setAttribute('name', `questions[${idx}][text]`);
        const answerInputs = block.querySelectorAll('.answers input');
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
    const questions = [];
    const questionBlocks = document.querySelectorAll('.question-block');
    questionBlocks.forEach((block, idx) => {
        const questionText = block.querySelector('input[type="text"]').value.trim();
        const answerInputs = block.querySelectorAll('.answers input');
        const answers = Array.from(answerInputs).map(input => input.value.trim());
        questions.push({ description: questionText, answers });
    });

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