/*
* TODOS:
* 2. Display the exam analysis results if status is 'done' or 'in_progress' otherwise show the exam questions.
* 3. If the exam is private, add a publish button to make it public.
* 4. If the exam is private, add a button to allow the teacher to delete or edit the exam.
* 5. If the exam is in_progress, add a button to allow the teacher to end the exam.
*/

document.addEventListener('DOMContentLoaded', async function () {
    // get the examID from query string
    const urlParams = new URLSearchParams(window.location.search);
    const examID = urlParams.get('examID');

    // Fetch exam data from server
    const examData = await fetchExamData(examID);

    if (examData.success === false) {
        alert('Failed to load exam data: ' + examData.message);
        return;
    }

    const exam = examData.data;
    document.title = exam.title;
    document.getElementById('exam-title').textContent = exam.title;

    renderAnalysis(exam);

    document.getElementById('exit-analysis-btn').addEventListener('click', function () {
        window.location.href = '/';
    });
});


// fetch exam data from server
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

// Render analysis for teachers
function renderAnalysis(exam) {
    const questionsResults = document.getElementById('questions-results');
    questionsResults.innerHTML = '';

    // Calculate answer counts for each option in each question
    // submittions: [{ answers: [Number, ...] }]
    const answerCounts = exam.questions.map((q, qIdx) => {
        // For each option, count how many students picked it for this question
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
        block.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span class="question-title">${idx + 1}. ${q.description}</span>
            </div>
            <div class="answers-list">
                ${q.options.map((ans, aIdx) => {
                    // Show option number before each answer
                    // Show answer count below each option
                    return `
                        <div class="answer-row">
                            <span>${aIdx + 1}) ${ans}</span>
                        </div>
                        <div class="answered-count">answered: ${answerCounts[idx][aIdx]}</div>
                    `;
                }).join('')}
            </div>
        `;
        questionsResults.appendChild(block);
    });
}