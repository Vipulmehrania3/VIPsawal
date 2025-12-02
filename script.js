document.addEventListener('DOMContentLoaded', () => {
    // --- STEP 1: CONFIGURE YOUR BACKEND URL HERE ---
    const backendUrl = "https://your-render-backend-url-goes-here.onrender.com";

    // --- Sound Manager ---
    const sounds = {
        click: document.getElementById('sound-click'),
        success: document.getElementById('sound-success'),
        error: document.getElementById('sound-error'),
        start: document.getElementById('sound-start'),
        tada: document.getElementById('sound-tada'),
    };
    let soundEnabled = true;

    function playSound(soundKey) {
        if (soundEnabled && sounds[soundKey]) {
            sounds[soundKey].currentTime = 0;
            sounds[soundKey].play();
        }
    }

    // --- Element Selectors ---
    const allScreens = document.querySelectorAll('.app-screen');
    const loader = document.getElementById('loader');
    const subjectCardsContainer = document.getElementById('subject-cards-container');
    const chaptersListContainer = document.getElementById('chapters-list');
    const chapterSelectTitle = document.getElementById('chapter-select-title');
    const chapterSelectSubtitle = document.getElementById('chapter-select-subtitle');
    const continueToSetupBtn = document.getElementById('continue-to-setup-btn');
    const questionCountSlider = document.getElementById('question-count');
    const questionCountValue = document.getElementById('question-count-value');
    const customPromptInput = document.getElementById('custom-prompt');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    
    // Quiz Running Elements
    const questionProgressText = document.getElementById('question-progress-text');
    const progressGrid = document.getElementById('progress-bar-grid');
    const questionTextEl = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const prevQuestionBtn = document.getElementById('prev-question-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const submitTestBtn = document.getElementById('submit-test-btn');

    // Results Elements
    const accuracyText = document.getElementById('accuracy-text');
    const totalQText = document.getElementById('total-q-text');
    const correctQText = document.getElementById('correct-q-text');
    const reviewContainer = document.getElementById('review-container');


    // --- State Variables ---
    let currentView = 'home-screen';
    let currentLanguage = 'en';
    let selectedSubject = null;
    let selectedChapterIds = [];
    let currentQuiz = [];
    let userAnswers = [];
    let currentQuestionIndex = 0;

    // --- Data (Syllabus) ---
    const SUBJECTS_DATA = { /* Paste the full SUBJECTS array from constants.ts here */ };
    const UI_TEXT_DATA = { /* Paste the full UI_TEXT object from constants.ts here */ };

    // --- Core Functions ---
    function showScreen(screenId) {
        playSound('click');
        currentView = screenId;
        allScreens.forEach(screen => {
            screen.classList.toggle('active', screen.id === screenId);
        });
    }

    const showLoader = (text) => {
        document.getElementById('loader-text').textContent = text;
        loader.classList.add('active');
    };
    const hideLoader = () => loader.classList.remove('active');

    // --- Event Listeners ---
    document.body.addEventListener('click', (e) => {
        const backBtn = e.target.closest('.back-btn');
        if (backBtn) {
            showScreen(backBtn.dataset.target);
        }
    });

    document.getElementById('vip-doubts-btn-home').addEventListener('click', () => showScreen('vip-doubts-screen'));
    continueToSetupBtn.addEventListener('click', () => showScreen('quiz-setup-screen'));
    questionCountSlider.addEventListener('input', () => {
        questionCountValue.textContent = questionCountSlider.value;
    });

    // --- Home Screen Logic ---
    function renderHomeScreen() {
        subjectCardsContainer.innerHTML = '';
        Object.values(SUBJECTS_DATA).forEach(subject => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.innerHTML = `
                <div class="subject-icon" style="background: linear-gradient(45deg, ${subject.color.replace('from-', '').split('-')[0]}-500, ${subject.color.replace('to-', '').split('-')[0]}-600);"><i class="fas fa-${subject.icon.toLowerCase()}"></i></div>
                <h3>${subject.name}</h3>
                <p>${subject.chapters.length} Chapters</p>
            `;
            card.addEventListener('click', () => {
                selectedSubject = subject;
                chapterSelectTitle.textContent = `Select Chapters`;
                chapterSelectSubtitle.textContent = `from ${subject.name}`;
                renderChapterSelectScreen();
                showScreen('chapter-select-screen');
            });
            subjectCardsContainer.appendChild(card);
        });
    }

    // --- Chapter Select Logic ---
    function renderChapterSelectScreen() {
        chaptersListContainer.innerHTML = '';
        selectedSubject.chapters.forEach(chapter => {
            const isSelected = selectedChapterIds.includes(chapter.id);
            const item = document.createElement('div');
            item.className = `chapter-item ${isSelected ? 'selected' : ''}`;
            item.dataset.chapterId = chapter.id;
            item.innerHTML = `
                <div class="chapter-checkbox"><i class="fas fa-check"></i></div>
                <h4>${chapter.name}</h4>
            `;
            item.addEventListener('click', () => {
                const chapterId = item.dataset.chapterId;
                if (selectedChapterIds.includes(chapterId)) {
                    selectedChapterIds = selectedChapterIds.filter(id => id !== chapterId);
                } else {
                    selectedChapterIds.push(chapterId);
                }
                item.classList.toggle('selected');
                continueToSetupBtn.disabled = selectedChapterIds.length === 0;
            });
            chaptersListContainer.appendChild(item);
        });
        continueToSetupBtn.disabled = selectedChapterIds.length === 0;
    }

    // --- Quiz Generation ---
    startQuizBtn.addEventListener('click', async () => {
        if (backendUrl.includes("your-render-backend-url-goes-here")) {
            alert("CRITICAL ERROR: The backendUrl in script.js has not been set.");
            return;
        }

        const chapterNames = selectedSubject.chapters
            .filter(c => selectedChapterIds.includes(c.id))
            .map(c => c.name);

        const quizConfig = {
            subjectId: selectedSubject.id,
            chapterNames: chapterNames,
            topicNames: [], // Simplified: not using topics for now
            count: parseInt(questionCountSlider.value),
            customPrompt: customPromptInput.value,
            language: currentLanguage
        };
        
        showLoader("Generating Your AI Quiz...");
        playSound('start');

        try {
            // Note: This matches the structure of the old app.py
            const response = await fetch(`${backendUrl}/generate_quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: selectedSubject.name,
                    chapter: chapterNames.join(', '), // Send all selected chapters
                    limit: quizConfig.count,
                    language: quizConfig.language,
                    style_prompt: quizConfig.customPrompt
                })
            });

            if (!response.ok) throw new Error('Network response was not ok.');
            
            const data = await response.json();
            if (!data.questions || data.questions.length === 0) throw new Error("AI failed to generate questions.");

            currentQuiz = data.questions;
            userAnswers = new Array(currentQuiz.length).fill(null);
            currentQuestionIndex = 0;
            renderQuizScreen();
            showScreen('quiz-running-screen');

        } catch (error) {
            console.error("Quiz Generation Failed:", error);
            alert("Failed to generate quiz. Please check the backend or try again.");
            playSound('error');
        } finally {
            hideLoader();
        }
    });

    // --- Quiz Running Logic ---
    function renderQuizScreen() {
        questionProgressText.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length}`;
        progressGrid.innerHTML = currentQuiz.map((_, index) => 
            `<div class="progress-segment ${index === currentQuestionIndex ? 'active' : userAnswers[index] !== null ? 'answered' : ''}"></div>`
        ).join('');
        
        const question = currentQuiz[currentQuestionIndex];
        questionTextEl.textContent = question.question;
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const isSelected = userAnswers[currentQuestionIndex] === index;
            const button = document.createElement('button');
            button.className = `option-btn ${isSelected ? 'selected' : ''}`;
            button.textContent = option;
            button.addEventListener('click', () => {
                userAnswers[currentQuestionIndex] = index;
                playSound('click');
                renderQuizScreen(); // Re-render to show selection
            });
            optionsContainer.appendChild(button);
        });

        prevQuestionBtn.disabled = currentQuestionIndex === 0;
        const isLastQuestion = currentQuestionIndex === currentQuiz.length - 1;
        nextQuestionBtn.style.display = isLastQuestion ? 'none' : 'flex';
        submitTestBtn.style.display = isLastQuestion ? 'flex' : 'none';
    }

    prevQuestionBtn.addEventListener('click', () => {
        if(currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuizScreen();
        }
    });
    nextQuestionBtn.addEventListener('click', () => {
        if(currentQuestionIndex < currentQuiz.length - 1) {
            currentQuestionIndex++;
            renderQuizScreen();
        }
    });
    submitTestBtn.addEventListener('click', () => {
        playSound('tada');
        renderResultsScreen();
        showScreen('results-screen');
    });

    // --- Results Screen Logic ---
    function renderResultsScreen() {
        let correctCount = 0;
        userAnswers.forEach((answerIndex, questionIndex) => {
            if (answerIndex === currentQuiz[questionIndex].correctAnswerIndex) { // Assuming correctAnswerIndex from AI
                correctCount++;
            }
        });
        const accuracy = Math.round((correctCount / currentQuiz.length) * 100);

        accuracyText.textContent = `${accuracy}%`;
        totalQText.textContent = currentQuiz.length;
        correctQText.textContent = correctCount;

        reviewContainer.innerHTML = '<h3>Review Explanations</h3>';
        currentQuiz.forEach((q, index) => {
            const userAnswerIndex = userAnswers[index];
            const isCorrect = userAnswerIndex === q.correctAnswerIndex;
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
            reviewItem.innerHTML = `
                <h4>Q${index + 1}: ${q.question}</h4>
                <p>Your Answer: <span class="${isCorrect ? 'correct' : 'incorrect'}">${userAnswerIndex !== null ? q.options[userAnswerIndex] : 'Skipped'}</span></p>
                ${!isCorrect ? `<p>Correct Answer: <span class="correct">${q.options[q.correctAnswerIndex]}</span></p>` : ''}
                <p><i>Explanation: ${q.explanation}</i></p>
            `;
            reviewContainer.appendChild(reviewItem);
        });
    }

    document.getElementById('home-btn').addEventListener('click', () => {
        selectedChapterIds = [];
        showScreen('home-screen');
    });
    document.getElementById('retry-btn').addEventListener('click', () => {
        showScreen('quiz-setup-screen');
    });
    
    // --- Initialize App ---
    renderHomeScreen();
});
