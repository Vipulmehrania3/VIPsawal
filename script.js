document.addEventListener('DOMContentLoaded', () => {
    // --- STEP 1: CONFIGURE YOUR BACKEND URL HERE ---
    const backendUrl = "https://your-render-backend-url-goes-here.onrender.com";

    // --- State Management ---
    let state = {
        currentView: 'HOME',
        language: 'en',
        theme: 'dark',
        subjects: [],
        selectedSubjectId: null,
        selectedChapterIds: [],
        selectedTopicIds: {}, // { chapterId: [topicId1, topicId2] }
        quizConfig: {
            questionCount: 10,
            customPrompt: ''
        },
        currentQuiz: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        quizResult: null,
    };

    // --- Element Selectors ---
    const mainContent = document.getElementById('main-content');
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loader-text');
    const subjectCardsContainer = document.getElementById('subject-cards-container');
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const vipDoubtsNavBtn = document.getElementById('vip-doubts-nav-btn');

    // --- UI Text (Simplified) ---
    const UI_TEXT = {
        en: { startQuiz: "Start AI Quiz", generating: "Generating Questions..." },
        hi: { startQuiz: "AI क्विज़ शुरू करें", generating: "प्रश्न तैयार हो रहे हैं..." }
    };

    // --- Data (Syllabus) ---
    // (Abridged for clarity, use your full syllabus here)
    const SUBJECTS = [
      {
        id: 'physics', name: 'Physics', icon: 'fa-atom', chapters: [{ id: 'phy-01', name: 'Kinematics', topics: [{id: 't1', name: 'Topic A'}] }]
      },
      {
        id: 'chemistry', name: 'Chemistry', icon: 'fa-flask', chapters: [{ id: 'chem-01', name: 'Atomic Structure', topics: [{id: 't2', name: 'Topic B'}] }]
      },
      {
        id: 'botany', name: 'Botany', icon: 'fa-leaf', chapters: [{ id: 'bot-01', name: 'Plant Kingdom', topics: [{id: 't3', name: 'Topic C'}] }]
      },
      {
        id: 'zoology', name: 'Zoology', icon: 'fa-dna', chapters: [{ id: 'zoo-01', name: 'Animal Kingdom', topics: [{id: 't4', name: 'Topic D'}] }]
      }
    ];
    state.subjects = SUBJECTS;

    // --- Core Functions ---

    function render() {
        // Hide all screens
        document.querySelectorAll('.app-screen').forEach(screen => screen.classList.remove('active'));
        // Show the current one
        const currentScreen = document.getElementById(`${state.currentView.toLowerCase()}-screen`);
        if (currentScreen) {
            currentScreen.classList.add('active');
        }
        // Specific render logic for each view
        if (state.currentView === 'HOME') renderHomeScreen();
        if (state.currentView === 'CHAPTER_SELECT') renderChapterSelectScreen();
    }
    
    function setState(newState) {
        state = { ...state, ...newState };
        render();
    }

    const showLoader = (text) => {
        loaderText.textContent = text;
        loader.classList.add('active');
    };
    const hideLoader = () => loader.classList.remove('active');

    // --- Render Functions for each screen ---
    
    function renderHomeScreen() {
        subjectCardsContainer.innerHTML = '';
        state.subjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.innerHTML = `
                <i class="fas ${subject.icon}"></i>
                <h3>${subject.name}</h3>
                <p>${subject.chapters.length} Chapters</p>
            `;
            // Add background color based on subject
            card.querySelector('i').style.backgroundColor = `var(--brand-${subject.id === 'physics' ? 500 : subject.id === 'chemistry' ? 600 : subject.id === 'botany' ? 400 : 700})`;
            card.onclick = () => {
                setState({ currentView: 'CHAPTER_SELECT', selectedSubjectId: subject.id });
            };
            subjectCardsContainer.appendChild(card);
        });
    }

    function renderChapterSelectScreen() {
        const subject = state.subjects.find(s => s.id === state.selectedSubjectId);
        if (!subject) return;

        document.getElementById('chapter-select-title').textContent = `Select Chapters from ${subject.name}`;
        const chaptersList = document.getElementById('chapters-list');
        chaptersList.innerHTML = '';
        subject.chapters.forEach(chapter => {
            const isSelected = state.selectedChapterIds.includes(chapter.id);
            const item = document.createElement('div');
            item.className = `chapter-item ${isSelected ? 'selected' : ''}`;
            item.innerHTML = `
                <div class="chapter-info">
                    <div class="checkbox"></div>
                    <span>${chapter.name}</span>
                </div>
                <button class="topics-btn" data-chapter-id="${chapter.id}">Topics</button>
            `;
            item.onclick = () => {
                const newSelection = isSelected 
                    ? state.selectedChapterIds.filter(id => id !== chapter.id)
                    : [...state.selectedChapterIds, chapter.id];
                setState({ selectedChapterIds: newSelection });
            };
            chaptersList.appendChild(item);
        });
        document.getElementById('continue-to-setup-btn').disabled = state.selectedChapterIds.length === 0;
    }

    // --- Event Listeners ---

    mainContent.addEventListener('click', async (e) => {
        const target = e.target;

        if (target.closest('.back-btn')) {
            const currentScreen = target.closest('.app-screen').id;
            if (currentScreen === 'vip-doubts-screen' || currentScreen === 'chapter-select-screen') {
                setState({ currentView: 'HOME' });
            } else if (currentScreen === 'quiz-setup-screen') {
                setState({ currentView: 'CHAPTER_SELECT' });
            }
        }

        if (target.closest('#continue-to-setup-btn')) {
            setState({ currentView: 'QUIZ_SETUP' });
        }

        if (target.closest('#start-quiz-btn')) {
            const lang = state.language === 'hi' ? 'hi' : 'en';
            showLoader(UI_TEXT[lang].generating);
            
            const subject = state.subjects.find(s => s.id === state.selectedSubjectId);
            const chapterNames = subject.chapters
                .filter(c => state.selectedChapterIds.includes(c.id))
                .map(c => c.name);

            // Fetch request
            try {
                const response = await fetch(`${backendUrl}/generate_quiz`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: state.selectedSubjectId,
                        chapter: chapterNames.join(', '), // Send names
                        limit: state.quizConfig.questionCount,
                        language: state.language,
                        style_prompt: state.quizConfig.customPrompt
                    })
                });
                if (!response.ok) throw new Error('Network response was not ok.');
                const data = await response.json();
                if (!data.questions || data.questions.length === 0) throw new Error('AI failed to generate questions.');

                setState({ currentView: 'QUIZ_RUNNING', currentQuiz: data.questions, currentQuestionIndex: 0, userAnswers: [] });
            } catch (error) {
                alert(`Failed to generate quiz: ${error.message}`);
            } finally {
                hideLoader();
            }
        }

        if (target.closest('#vip-doubts-nav-btn')) {
            setState({ currentView: 'VIP_DOUBTS' });
        }
        
        if (target.closest('#home-btn')) {
            setState({ currentView: 'HOME', selectedChapterIds: [], selectedTopicIds: {} });
        }
        
        if (target.closest('#practice-again-btn')) {
            setState({ currentView: 'QUIZ_SETUP' });
        }
    });

    // Theme and Language toggles
    themeToggleBtn.onclick = () => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        setState({ theme: newTheme });
    };
    langToggleBtn.onclick = () => setState({ language: state.language === 'en' ? 'hi' : 'en' });

    // Initial Render
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    render();
});
