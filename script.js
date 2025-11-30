document.addEventListener('DOMContentLoaded', () => {
    // --- STEP 1: CONFIGURE YOUR BACKEND URL HERE ---
    const backendUrl = "https://quiz-second-time.onrender.com";

    // --- ELEMENT SELECTORS ---
    const screens = {
        subject: document.getElementById('subject-screen'),
        chapter: document.getElementById('chapter-screen'),
        settings: document.getElementById('settings-screen'),
        quiz: document.getElementById('quiz-area'),
        result: document.getElementById('result-area'),
        doubt: document.getElementById('doubt-screen')
    };
    const loader = document.getElementById('loader');

    // --- STATE VARIABLES ---
    let appState = {
        currentSubject: '',
        selectedChapters: [],
        currentQuiz: [],
        currentQuestionIndex: 0,
        userAnswers: []
    };
    
    // --- SYLLABUS DATA (Same as before) ---
    const chaptersData = {
        // chaptersEnglish and chaptersHindi objects go here (omitted for brevity)
    };

    // --- NAVIGATION ---
    function showScreen(screenKey) {
        Object.values(screens).forEach(screen => {
            if (screen.id.includes(screenKey)) {
                screen.classList.remove('exit-left');
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetScreen = btn.dataset.target.replace('-screen', '');
            const currentScreen = document.querySelector('.app-screen.active');
            currentScreen.classList.add('exit-left');
            setTimeout(() => showScreen(targetScreen), 50);
        });
    });

    // --- SETUP FLOW ---
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            appState.currentSubject = card.dataset.subject;
            document.getElementById('chapter-title').textContent = `Select Chapters for ${appState.currentSubject}`;
            populateChapterList();
            showScreen('chapter');
        });
    });

    function populateChapterList() {
        const chapterList = document.getElementById('chapter-list');
        chapterList.innerHTML = '';
        const chapters = chaptersData.chaptersEnglish[appState.currentSubject] || [];
        chapters.forEach(chapter => {
            const item = document.createElement('div');
            item.className = 'chapter-item';
            item.textContent = chapter;
            item.dataset.chapter = chapter;
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
                updateSelectedChapters();
            });
            chapterList.appendChild(item);
        });
    }
    
    function updateSelectedChapters() {
        appState.selectedChapters = Array.from(document.querySelectorAll('.chapter-item.selected')).map(item => item.dataset.chapter);
        document.getElementById('chapter-next-btn').disabled = appState.selectedChapters.length === 0;
    }

    document.getElementById('chapter-next-btn').addEventListener('click', () => showScreen('settings'));

    // --- QUIZ GENERATION & LOGIC ---
    document.getElementById('generate-quiz-btn').addEventListener('click', async () => {
        const questionLimit = document.getElementById('question-limit').value;
        const stylePrompt = document.getElementById('style-prompt').value;
        
        showLoader('Generating Your Quiz...');
        try {
            const response = await fetch(`${backendUrl}/generate_quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: appState.currentSubject,
                    chapter: appState.selectedChapters.join(', '), // Send all selected chapters
                    limit: questionLimit,
                    style_prompt: stylePrompt,
                    language: 'english' // Simplified for now
                })
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate quiz');
            
            appState.currentQuiz = (await response.json()).questions;
            if (!appState.currentQuiz || appState.currentQuiz.length === 0) throw new Error('AI failed to generate questions.');
            
            startQuiz();
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            hideLoader();
        }
    });

    function startQuiz() {
        appState.currentQuestionIndex = 0;
        appState.userAnswers = Array(appState.currentQuiz.length).fill(null);
        document.getElementById('quiz-title').textContent = appState.currentSubject;
        displayQuestion();
        showScreen('quiz');
    }

    // --- LaTeX to HTML conversion ---
    function renderLatex(text) {
        if (!text) return '';
        return text
            .replace(/\_\{?([^\s^}]+)\}?/g, '<sub>$1</sub>') // Subscripts
            .replace(/\^\{?([^\s_}]+)\}?/g, '<sup>$1</sup>'); // Superscripts
    }

    function displayQuestion() {
        const question = appState.currentQuiz[appState.currentQuestionIndex];
        document.getElementById('progress-bar').style.width = `${((appState.currentQuestionIndex + 1) / appState.currentQuiz.length) * 100}%`;
        document.getElementById('current-question-number').textContent = `Question ${appState.currentQuestionIndex + 1} / ${appState.currentQuiz.length}`;
        document.getElementById('question-text').innerHTML = renderLatex(question.question);
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = renderLatex(option);
            
            // Check if this option was previously selected
            if (appState.userAnswers[appState.currentQuestionIndex] && appState.userAnswers[appState.currentQuestionIndex].selectedAnswer === option) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
                const answer = {
                    selectedAnswer: option,
                    timeTaken: Date.now() - (appState.userAnswers[appState.currentQuestionIndex]?.startTime || Date.now())
                };
                appState.userAnswers[appState.currentQuestionIndex] = answer;

                // Auto-slide to next question
                setTimeout(() => {
                    if (appState.currentQuestionIndex < appState.currentQuiz.length - 1) {
                        appState.currentQuestionIndex++;
                        displayQuestion();
                    }
                }, 1500);

                // Visually update selection
                 optionsContainer.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                 btn.classList.add('selected');
            });
            optionsContainer.appendChild(btn);
        });
        
        // Mark start time for timing this question
        if (!appState.userAnswers[appState.currentQuestionIndex]) {
            appState.userAnswers[appState.currentQuestionIndex] = { startTime: Date.now() };
        }

        document.getElementById('prev-question-btn').disabled = appState.currentQuestionIndex === 0;
        document.getElementById('next-question-btn').style.display = appState.currentQuestionIndex === appState.currentQuiz.length - 1 ? 'none' : 'flex';
        document.getElementById('submit-quiz-btn').style.display = appState.currentQuestionIndex === appState.currentQuiz.length - 1 ? 'flex' : 'none';
    }

    document.getElementById('next-question-btn').addEventListener('click', () => {
        if (appState.currentQuestionIndex < appState.currentQuiz.length - 1) {
            appState.currentQuestionIndex++;
            displayQuestion();
        }
    });

    document.getElementById('prev-question-btn').addEventListener('click', () => {
        if (appState.currentQuestionIndex > 0) {
            appState.currentQuestionIndex--;
            displayQuestion();
        }
    });

    document.getElementById('submit-quiz-btn').addEventListener('click', showResults);
    document.getElementById('exit-quiz-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
            showScreen('subject');
        }
    });


    // --- RESULTS ---
    function showResults() {
        let score = 0;
        const detailedResults = document.getElementById('detailed-results');
        detailedResults.innerHTML = '';

        appState.currentQuiz.forEach((question, index) => {
            const userAnswer = appState.userAnswers[index];
            const isCorrect = userAnswer?.selectedAnswer === question.correctAnswer;
            if (isCorrect) score++;

            const item = document.createElement('div');
            item.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;
            item.innerHTML = `
                <div class="result-item-header">
                    <h4>Question ${index + 1}</h4>
                    <span class="time-taken"><i class="far fa-clock"></i> ${(userAnswer.timeTaken / 1000).toFixed(1)}s</span>
                </div>
                <p>${renderLatex(question.question)}</p>
                <p>Your Answer: <span class="your-answer ${isCorrect ? 'correct' : 'incorrect'}">${renderLatex(userAnswer?.selectedAnswer) || 'Not Answered'}</span></p>
                ${!isCorrect ? `<p>Correct Answer: <span class="correct-answer">${renderLatex(question.correctAnswer)}</span></p>` : ''}
                <p class="explanation">${renderLatex(question.solution)}</p>
            `;
            detailedResults.appendChild(item);
        });

        const scorePercent = Math.round((score / appState.currentQuiz.length) * 100);
        const scoreCircle = document.querySelector('.score-circle');
        scoreCircle.style.setProperty('--score-percent', `${scorePercent}%`);
        document.getElementById('score-display').textContent = `${scorePercent}%`;
        document.getElementById('score-summary').textContent = `You answered ${score} out of ${appState.currentQuiz.length} questions correctly.`;

        showScreen('result');
    }
    
    document.getElementById('restart-quiz-btn').addEventListener('click', () => showScreen('subject'));

    // --- DOUBT SCREEN (Conceptual) ---
    document.getElementById('ask-doubt-btn').addEventListener('click', () => showScreen('doubt'));
    document.getElementById('doubt-image-upload').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('image-preview');
                preview.src = e.target.result;
                preview.classList.remove('hidden');
                // In a real app, you would initialize a cropping library here, e.g., Cropper.js
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('submit-doubt-btn').addEventListener('click', async () => {
        const prompt = document.getElementById('doubt-prompt').value;
        const imageFile = document.getElementById('doubt-image-upload').files[0];
        
        if (!prompt && !imageFile) {
            alert('Please ask a question or upload an image.');
            return;
        }

        showLoader('AI is solving your doubt...');
        // Conceptual: a real implementation would send a multipart/form-data request
        // or a JSON with base64 image data to the backend.
        
        try {
            // This is a placeholder for the actual API call
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI thinking
            
            // The response from the AI would be displayed in a chat-like interface.
            alert("Doubt feature is in development. The backend endpoint needs to be connected to a multimodal AI model like Gemini Pro Vision.");
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            hideLoader();
        }
    });


    // --- INITIALIZE APP ---
    showScreen('subject');
});
