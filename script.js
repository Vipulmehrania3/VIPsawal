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
    
    // --- REPAIRED: SYLLABUS DATA ---
    const chaptersData = {
        chaptersEnglish: {
            physics: ["Physics and Measurement", "Kinematics", "Laws of Motion", "Work, Energy, and Power", "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves", "Electrostatics", "Current Electricity", "Magnetic Effects of Current and Magnetism", "Electromagnetic Induction and Alternating Currents", "Electromagnetic Waves", "Optics", "Dual Nature of Matter and Radiation", "Atoms and Nuclei", "Electronic Devices", "Experimental Skills"],
            chemistry: ["Some Basic Concepts in Chemistry", "Atomic Structure", "Chemical Bonding and Molecular Structure", "Chemical Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions and Electrochemistry", "Chemical Kinetics", "Classification of Elements and Periodicity in Properties", "p-Block Elements", "d- and f-Block Elements", "Co-ordination Compounds", "Purification and Characterisation of Organic Compounds", "Some Basic Principles of Organic Chemistry", "Hydrocarbons", "Organic Compounds Containing Halogens", "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen", "Biomolecules", "Principles Related to Practical Chemistry"],
            botany: ["The Living World", "Biological Classification", "Plant Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Cell: The Unit of Life", "Cell Cycle and Cell Division", "Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth and Development", "Transport in Plants", "Mineral Nutrition", "Sexual Reproduction in Flowering Plants", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution", "Microbes in Human Welfare", "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"],
            zoology: ["Animal Kingdom", "Structural Organisation in Animals", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination", "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration", "Biomolecules", "Human Reproduction", "Reproductive Health", "Genetics and Evolution", "Human Health and Disease", "Immunology (as part of Human Health and Disease)"]
        },
        chaptersHindi: {
             // Hindi chapters can be added here following the same structure if needed
        }
    };

    // --- NAVIGATION ---
    function showScreen(screenKey) {
        // Hide all screens first by adding an exit class, then activate the target
        Object.values(screens).forEach(screen => {
            if (screen.classList.contains('active')) {
                screen.classList.add('exit-left');
            }
        });

        setTimeout(() => {
            Object.values(screens).forEach(screen => {
                screen.classList.remove('active', 'exit-left');
            });
            if (screens[screenKey]) {
                screens[screenKey].classList.add('active');
            }
        }, 300); // Wait for the exit animation to start
    }

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetScreenKey = btn.dataset.target.replace('-screen', '');
            const currentScreen = document.querySelector('.app-screen.active');
            if (currentScreen) {
                currentScreen.classList.add('exit-left'); // Animate current screen out
            }
            // Find the target screen and remove any exit animations from it before making it active
            const targetScreen = screens[targetScreenKey];
            if(targetScreen) {
                targetScreen.classList.remove('exit-left');
                // The main showScreen logic will handle making it active
            }
            showScreen(targetScreenKey);
        });
    });

    // --- SETUP FLOW ---
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            appState.currentSubject = card.dataset.subject;
            const subjectTitle = card.querySelector('span').textContent;
            document.getElementById('chapter-title').textContent = `Select Chapters for ${subjectTitle}`;
            populateChapterList();
            showScreen('chapter');
        });
    });

    function populateChapterList() {
        const chapterList = document.getElementById('chapter-list');
        chapterList.innerHTML = ''; // Clear previous chapters
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
        // Reset selections for the new subject
        updateSelectedChapters(); 
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
        
        loader.classList.add('active'); // Use a simpler loader call
        try {
            const response = await fetch(`${backendUrl}/generate_quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: appState.currentSubject,
                    chapter: appState.selectedChapters.join(', '),
                    limit: questionLimit,
                    style_prompt: stylePrompt,
                    language: 'english'
                })
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
    }

    function renderLatex(text) {
        if (!text) return '';
        return text
            .replace(/\_\{?([^\s^}]+)\}?/g, '<sub>$1</sub>')
            .replace(/\^\{?([^\s_}]+)\}?/g, '<sup>$1</sup>');
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
            
            if (appState.userAnswers[appState.currentQuestionIndex] && appState.userAnswers[appState.currentQuestionIndex].selectedAnswer === option) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
                const answer = {
                    selectedAnswer: option,
                    timeTaken: Date.now() - (appState.userAnswers[appState.currentQuestionIndex]?.startTime || Date.now())
                };
                appState.userAnswers[appState.currentQuestionIndex] = answer;

                // Visually update selection without auto-sliding for better user control
                 optionsContainer.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                 btn.classList.add('selected');

                 // Auto-slide after a short delay
                 setTimeout(() => {
                    if (appState.currentQuestionIndex < appState.currentQuiz.length - 1) {
                        appState.currentQuestionIndex++;
                        displayQuestion();
                    }
                 }, 500); // 0.5 second delay
            });
            optionsContainer.appendChild(btn);
        });
        
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
                    <span class="time-taken"><i class="far fa-clock"></i> ${userAnswer && userAnswer.timeTaken ? (userAnswer.timeTaken / 1000).toFixed(1) + 's' : 'N/A'}</span>
                </div>
                <p>${renderLatex(question.question)}</p>
                <p>Your Answer: <span class="your-answer ${isCorrect ? 'correct' : 'incorrect'}">${renderLatex(userAnswer?.selectedAnswer) || 'Not Answered'}</span></p>
                ${!isCorrect ? `<p>Correct Answer: <span class="correct-answer">${renderLatex(question.correctAnswer)}</span></p>` : ''}
                <p class="explanation">${renderLatex(question.solution)}</p>
            `;
            detailedResults.appendChild(item);
        });

        const scorePercent = appState.currentQuiz.length > 0 ? Math.round((score / appState.currentQuiz.length) * 100) : 0;
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
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('submit-doubt-btn').addEventListener('click', async () => {
        const prompt = document.getElementById('doubt-prompt').value;
        if (!prompt) {
            alert('Please ask a question.');
            return;
        }
        loader.classList.add('active');
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert("Doubt feature is in development and not yet connected to the backend.");
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            loader.classList.remove('active');
        }
    });

    // --- INITIALIZE APP ---
    showScreen('subject');
});
