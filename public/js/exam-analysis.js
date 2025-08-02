/*
* TODOS:
* 1. Fetch exam data from the server.
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