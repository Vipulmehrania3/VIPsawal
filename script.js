document.addEventListener('DOMContentLoaded', () => {
    // --- STEP 1: CONFIGURE YOUR BACKEND URL HERE ---
    const backendUrl = "https://quiz-second-time.onrender.com";

    // --- ELEMENT SELECTORS & STATE ---
    const screens = {
        subject: document.getElementById('subject-screen'),
        chapter: document.getElementById('chapter-screen'),
        settings: document.getElementById('settings-screen'),
        quiz: document.getElementById('quiz-area'),
        result: document.getElementById('result-area'),
        doubt: document.getElementById('doubt-screen')
    };
    const loader = document.getElementById('loader');
    let screenHistory = ['subject']; // NEW: History for back button

    const appState = { currentSubject: '', selectedChapters: [], currentQuiz: [], currentQuestionIndex: 0, userAnswers: [] };
    
    // --- (Syllabus Data is the same as the previous version) ---
    const chaptersData = {
        chaptersEnglish: {
            physics: ["Physics and Measurement", "Kinematics", "Laws of Motion", "Work, Energy, and Power", "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves", "Electrostatics", "Current Electricity", "Magnetic Effects of Current and Magnetism", "Electromagnetic Induction and Alternating Currents", "Electromagnetic Waves", "Optics", "Dual Nature of Matter and Radiation", "Atoms and Nuclei", "Electronic Devices", "Experimental Skills"],
            chemistry: ["Some Basic Concepts in Chemistry", "Atomic Structure", "Chemical Bonding and Molecular Structure", "Chemical Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions and Electrochemistry", "Chemical Kinetics", "Classification of Elements and Periodicity in Properties", "p-Block Elements", "d- and f-Block Elements", "Co-ordination Compounds", "Purification and Characterisation of Organic Compounds", "Some Basic Principles of Organic Chemistry", "Hydrocarbons", "Organic Compounds Containing Halogens", "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen", "Biomolecules", "Principles Related to Practical Chemistry"],
            botany: ["The Living World", "Biological Classification", "Plant Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Cell: The Unit of Life", "Cell Cycle and Cell Division", "Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth and Development", "Transport in Plants", "Mineral Nutrition", "Sexual Reproduction in Flowering Plants", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution", "Microbes in Human Welfare", "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"],
            zoology: ["Animal Kingdom", "Structural Organisation in Animals", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination", "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration", "Biomolecules", "Human Reproduction", "Reproductive Health", "Genetics and Evolution", "Human Health and Disease", "Immunology (as part of Human Health and Disease)"]
        }
    };

    // --- NAVIGATION & HISTORY MANAGEMENT ---
    function showScreen(screenKey) {
        const newScreen = screens[screenKey];
        const currentScreen = document.querySelector('.app-screen.active');

        if (!newScreen || newScreen === currentScreen) return;
        
        // Update history
        if(screenHistory[screenHistory.length - 1] !== screenKey) {
            screenHistory.push(screenKey);
        }

        // Animation logic
        currentScreen.classList.remove('active');
        newScreen.classList.add('active');
    }

    function goBack() {
        if (screenHistory.length <= 1) return; // Can't go back from the first screen

        const currentScreenKey = screenHistory.pop();
        const prevScreenKey = screenHistory[screenHistory.length - 1];
        
        const currentScreen = screens[currentScreenKey];
        const prevScreen = screens[prevScreenKey];

        // Animate current screen out, and bring previous screen into view
        currentScreen.classList.remove('active');
        prevScreen.classList.remove('initial'); // Ensure it's not stuck
        prevScreen.classList.add('active');
    }

    // --- NEW: Handle Phone's Back Button ---
    window.addEventListener('popstate', (event) => {
        // This event is triggered by the browser's back button
        handleBackButton();
    });
    // Add initial state to browser history
    history.pushState({screen: 'subject'}, '');

    function handleBackButton() {
        const currentScreenKey = screenHistory[screenHistory.length - 1];
        
        if (currentScreenKey === 'quiz') {
            if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
                goBack();
            } else {
                // If user says no, push the state back to keep them on the quiz screen
                history.pushState({screen: 'quiz'}, '');
            }
        } else if (screenHistory.length > 1) {
            goBack();
        }
        // If on the first screen, do nothing and let the browser handle it (e.g., exit app)
    }


    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', handleBackButton);
    });

    // --- (The rest of the JS is the same as the simplified version from the last correct response) ---
    // SETUP FLOW
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            appState.currentSubject = card.dataset.subject;
            const subjectTitle = card.querySelector('span').textContent;
            document.getElementById('chapter-title').textContent = `Select Chapters for ${subjectTitle}`;
            populateChapterList();
            showScreen('chapter');
            history.pushState({screen: 'chapter'}, '');
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
            item.addEventListener('click', () => { item.classList.toggle('selected'); updateSelectedChapters(); });
            chapterList.appendChild(item);
        });
        updateSelectedChapters();
    }
    function updateSelectedChapters() {
        appState.selectedChapters = Array.from(document.querySelectorAll('.chapter-item.selected')).map(item => item.dataset.chapter);
        document.getElementById('chapter-next-btn').disabled = appState.selectedChapters.length === 0;
    }
    document.getElementById('chapter-next-btn').addEventListener('click', () => {
        showScreen('settings');
        history.pushState({screen: 'settings'}, '');
    });

    // QUIZ GENERATION & LOGIC
    document.getElementById('generate-quiz-btn').addEventListener('click', async () => {
        const questionLimit = document.getElementById('question-limit').value;
        const stylePrompt = document.getElementById('style-prompt').value;
        loader.classList.add('active');
        try {
            const response = await fetch(`${backendUrl}/generate_quiz`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: appState.currentSubject, chapter: appState.selectedChapters.join(', '), limit: questionLimit, style_prompt: stylePrompt, language: 'english' })
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate quiz');
            appState.currentQuiz = (await response.json()).questions;
            if (!appState.currentQuiz || appState.currentQuiz.length === 0) throw new Error('AI failed to generate questions.');
            startQuiz();
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            loader.classList.remove('active');
        }
    });
    function startQuiz() {
        appState.currentQuestionIndex = 0;
        appState.userAnswers = Array(appState.currentQuiz.length).fill(null);
        document.getElementById('quiz-title').textContent = appState.currentSubject.charAt(0).toUpperCase() + appState.currentSubject.slice(1);
        displayQuestion();
        showScreen('quiz');
        history.pushState({screen: 'quiz'}, '');
    }
    function renderMathematicalText(text) {
        if (!text) return '';
        const sub = "₀₁₂₃₄₅₆₇₈₉", sup = "⁰¹²³⁴⁵⁶⁷⁸⁹";
        let processedText = text.replace(/\$/g, "").replace(/\\text\{([^}]*)\}/g, " $1");
        processedText = processedText.replace(/([A-Za-z])_\{?([0-9]+)\}?/g, (_, char, nums) => char + [...nums].map(d => sub[d]).join(""));
        processedText = processedText.replace(/([A-Za-z0-9])\^\{?([0-9]+)\}?/g, (_, char, nums) => char + [...nums].map(d => sup[d]).join(""));
        return processedText.trim();
    }
    function displayQuestion() {
        const question = appState.currentQuiz[appState.currentQuestionIndex];
        document.getElementById('progress-bar').style.width = `${((appState.currentQuestionIndex + 1) / appState.currentQuiz.length) * 100}%`;
        document.getElementById('current-question-number').textContent = `Question ${appState.currentQuestionIndex + 1} / ${appState.currentQuiz.length}`;
        document.getElementById('question-text').innerHTML = renderMathematicalText(question.question);
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = renderMathematicalText(option);
            if (appState.userAnswers[appState.currentQuestionIndex]?.selectedAnswer === option) btn.classList.add('selected');
            btn.addEventListener('click', () => {
                appState.userAnswers[appState.currentQuestionIndex] = { selectedAnswer: option, timeTaken: Date.now() - (appState.userAnswers[appState.currentQuestionIndex]?.startTime || Date.now()) };
                optionsContainer.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                setTimeout(() => { if (appState.currentQuestionIndex < appState.currentQuiz.length - 1) { appState.currentQuestionIndex++; displayQuestion(); } }, 500);
            });
            optionsContainer.appendChild(btn);
        });
        if (!appState.userAnswers[appState.currentQuestionIndex]) appState.userAnswers[appState.currentQuestionIndex] = { startTime: Date.now() };
        document.getElementById('prev-question-btn').disabled = appState.currentQuestionIndex === 0;
        document.getElementById('next-question-btn').style.display = appState.currentQuestionIndex === appState.currentQuiz.length - 1 ? 'none' : 'flex';
        document.getElementById('submit-quiz-btn').style.display = appState.currentQuestionIndex === appState.currentQuiz.length - 1 ? 'flex' : 'none';
    }
    document.getElementById('next-question-btn').addEventListener('click', () => { if (appState.currentQuestionIndex < appState.currentQuiz.length - 1) { appState.currentQuestionIndex++; displayQuestion(); } });
    document.getElementById('prev-question-btn').addEventListener('click', () => { if (appState.currentQuestionIndex > 0) { appState.currentQuestionIndex--; displayQuestion(); } });
    document.getElementById('submit-quiz-btn').addEventListener('click', showResults);
    document.getElementById('exit-quiz-btn').addEventListener('click', handleBackButton); // Re-use the same logic

    // RESULTS
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
            item.innerHTML = `<div class="result-item-header"><h4>Question ${index + 1}</h4><span class="time-taken"><i class="far fa-clock"></i> ${userAnswer?.timeTaken ? (userAnswer.timeTaken / 1000).toFixed(1) + 's' : 'N/A'}</span></div><p>${renderMathematicalText(question.question)}</p><p>Your Answer: <span class="your-answer ${isCorrect ? 'correct' : 'incorrect'}">${renderMathematicalText(userAnswer?.selectedAnswer) || 'Not Answered'}</span></p>${!isCorrect ? `<p>Correct Answer: <span class="correct-answer">${renderMathematicalText(question.correctAnswer)}</span></p>` : ''}<p class="explanation">${renderMathematicalText(question.solution)}</p>`;
            detailedResults.appendChild(item);
        });
        const scorePercent = appState.currentQuiz.length > 0 ? Math.round((score / appState.currentQuiz.length) * 100) : 0;
        document.querySelector('.score-circle').style.setProperty('--score-percent', `${scorePercent}%`);
        document.getElementById('score-display').textContent = `${scorePercent}%`;
        document.getElementById('score-summary').textContent = `You answered ${score} out of ${appState.currentQuiz.length} questions correctly.`;
        showScreen('result');
        history.pushState({screen: 'result'}, '');
    }
    document.getElementById('restart-quiz-btn').addEventListener('click', () => {
        screenHistory = ['subject']; // Reset history
        showScreen('subject', 'backward');
        history.pushState({screen: 'subject'}, '');
    });

    // DOUBT SCREEN
    document.getElementById('ask-doubt-btn').addEventListener('click', () => {
        showScreen('doubt');
        history.pushState({screen: 'doubt'}, '');
    });
    // ... (rest of doubt functionality is the same)
});
