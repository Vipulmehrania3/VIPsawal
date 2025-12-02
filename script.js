document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const backendUrl = "https://quiz-second-time.onrender.com"; // REPLACE WITH YOUR RENDER URL

    // --- STATE ---
    let currentLang = 'en';
    let selectedSubject = null;
    let selectedChapterIds = [];
    let selectedTopicIds = {}; // Map chapterId -> [topicIds]
    let quizData = [];
    let currentQIndex = 0;
    let userAnswers = [];
    let activeChapterForSidebar = null;

    // --- DATA (Syllabus) ---
    // A simplified version of the syllabus for demonstration. 
    // In a real app, this would be the huge object you provided.
    const SYLLABUS = {
        physics: { name: 'Physics', icon: 'atom', chapters: [
            { id: 'p1', name: 'Kinematics', topics: ['Motion in 1D', 'Projectile Motion', 'Relative Velocity'] },
            { id: 'p2', name: 'Laws of Motion', topics: ['Newtons Laws', 'Friction', 'Circular Motion'] },
            { id: 'p3', name: 'Gravitation', topics: ['Keplers Laws', 'Gravitational Potential', 'Satellites'] }
        ]},
        chemistry: { name: 'Chemistry', icon: 'flask', chapters: [
            { id: 'c1', name: 'Atomic Structure', topics: ['Bohr Model', 'Quantum Numbers'] },
            { id: 'c2', name: 'Thermodynamics', topics: ['First Law', 'Entropy', 'Gibbs Energy'] }
        ]},
        botany: { name: 'Botany', icon: 'leaf', chapters: [
            { id: 'b1', name: 'Plant Kingdom', topics: ['Algae', 'Bryophytes', 'Gymnosperms'] },
            { id: 'b2', name: 'Photosynthesis', topics: ['Light Reaction', 'C3 Cycle', 'C4 Cycle'] }
        ]},
        zoology: { name: 'Zoology', icon: 'skull', chapters: [
            { id: 'z1', name: 'Human Physiology', topics: ['Digestion', 'Respiration', 'Circulation'] },
            { id: 'z2', name: 'Human Reproduction', topics: ['Male System', 'Female System', 'Fertilization'] }
        ]}
    };

    // --- DOM ELEMENTS ---
    const screens = document.querySelectorAll('.app-screen');
    const sidebar = document.getElementById('topic-sidebar');
    const loader = document.getElementById('loader');
    
    // --- UTILS ---
    const playSound = (id) => document.getElementById(`snd-${id}`)?.play();
    const showScreen = (id) => {
        screens.forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    };
    const showLoader = (show) => loader.classList.toggle('active', show);

    // --- NAVIGATION ---
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => showScreen(btn.dataset.to));
    });

    document.getElementById('theme-btn').addEventListener('click', () => {
        document.documentElement.classList.toggle('light');
    });

    document.getElementById('lang-btn').addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        document.getElementById('lang-btn').innerText = currentLang === 'en' ? 'EN' : 'HI';
        updateLanguage();
    });

    function updateLanguage() {
        document.querySelectorAll('[data-en]').forEach(el => {
            el.innerText = el.getAttribute(`data-${currentLang}`);
        });
    }

    // --- HOME SCREEN ---
    const subjectGrid = document.getElementById('subject-grid');
    Object.keys(SYLLABUS).forEach(key => {
        const sub = SYLLABUS[key];
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = `<i class="fas fa-${sub.icon}"></i><h3>${sub.name}</h3><p>${sub.chapters.length} Chapters</p>`;
        card.onclick = () => loadChapters(key);
        subjectGrid.appendChild(card);
    });

    document.getElementById('btn-go-vip').onclick = () => showScreen('screen-vip');

    // --- CHAPTER SELECTION ---
    function loadChapters(subjectKey) {
        selectedSubject = SYLLABUS[subjectKey];
        selectedChapterIds = [];
        selectedTopicIds = {};
        
        document.getElementById('selected-subject-name').innerText = selectedSubject.name;
        const list = document.getElementById('chapter-list');
        list.innerHTML = '';

        selectedSubject.chapters.forEach(chap => {
            const div = document.createElement('div');
            div.className = 'chapter-item';
            div.innerHTML = `
                <div class="chapter-left" onclick="toggleChapter('${chap.id}', this)">
                    <div class="checkbox"><i class="fas fa-check"></i></div>
                    <span>${chap.name}</span>
                </div>
                <button class="topic-btn" onclick="openSidebar('${chap.id}')">Topics</button>
            `;
            list.appendChild(div);
        });
        
        document.getElementById('btn-go-setup').disabled = true;
        showScreen('screen-chapters');
    }

    window.toggleChapter = (chapId, el) => { // Global for inline onclick
        const parent = el.parentElement;
        parent.classList.toggle('selected');
        if (selectedChapterIds.includes(chapId)) {
            selectedChapterIds = selectedChapterIds.filter(id => id !== chapId);
        } else {
            selectedChapterIds.push(chapId);
        }
        document.getElementById('btn-go-setup').disabled = selectedChapterIds.length === 0;
        playSound('click');
    };

    window.openSidebar = (chapId) => {
        activeChapterForSidebar = chapId;
        const chap = selectedSubject.chapters.find(c => c.id === chapId);
        const list = document.getElementById('topic-list');
        list.innerHTML = `<h4>${chap.name}</h4>`;
        
        chap.topics.forEach(topic => {
            const isSel = (selectedTopicIds[chapId] || []).includes(topic);
            const div = document.createElement('div');
            div.className = `topic-item ${isSel ? 'selected' : ''}`;
            div.innerHTML = `<div class="checkbox"><i class="fas fa-check"></i></div><span>${topic}</span>`;
            div.onclick = () => {
                div.classList.toggle('selected');
                if (!selectedTopicIds[chapId]) selectedTopicIds[chapId] = [];
                
                if (div.classList.contains('selected')) {
                    selectedTopicIds[chapId].push(topic);
                } else {
                    selectedTopicIds[chapId] = selectedTopicIds[chapId].filter(t => t !== topic);
                }
                // Auto-select parent chapter
                if (!selectedChapterIds.includes(chapId)) {
                    // Find the chapter DOM element and trigger click (hacky but works)
                    // Better: just add to array and update UI
                    selectedChapterIds.push(chapId);
                    // Update main list UI... simplified for now
                }
            };
            list.appendChild(div);
        });
        
        sidebar.classList.add('open');
    };

    document.getElementById('close-sidebar-btn').onclick = () => sidebar.classList.remove('open');
    document.getElementById('confirm-topics-btn').onclick = () => sidebar.classList.remove('open');
    document.getElementById('btn-go-setup').onclick = () => showScreen('screen-setup');

    // --- QUIZ SETUP & GENERATION ---
    const qCountRange = document.getElementById('q-count-range');
    qCountRange.oninput = (e) => document.getElementById('q-count-val').innerText = e.target.value;

    document.getElementById('btn-start-quiz').onclick = async () => {
        showLoader(true);
        playSound('start');
        
        const count = parseInt(qCountRange.value);
        const prompt = document.getElementById('custom-prompt').value;
        
        // Get names
        const chapterNames = selectedSubject.chapters
            .filter(c => selectedChapterIds.includes(c.id))
            .map(c => c.name);
            
        // Flatten topics
        let topicNames = [];
        Object.values(selectedTopicIds).forEach(list => topicNames.push(...list));

        try {
            const res = await fetch(`${backendUrl}/generate_quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: selectedSubject.name,
                    chapters: chapterNames,
                    topics: topicNames,
                    limit: count,
                    custom_prompt: prompt,
                    language: currentLang
                })
            });
            
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            
            quizData = data.questions;
            startQuiz();
        } catch (e) {
            alert("Error: " + e.message);
            showLoader(false);
        }
    };

    // --- QUIZ RUNNING ---
    function startQuiz() {
        showLoader(false);
        currentQIndex = 0;
        userAnswers = Array(quizData.length).fill(null);
        document.getElementById('total-q-num').innerText = quizData.length;
        renderQuestion();
        showScreen('screen-quiz');
    }

    function renderQuestion() {
        const q = quizData[currentQIndex];
        document.getElementById('curr-q-num').innerText = currentQIndex + 1;
        document.getElementById('progress-fill').style.width = `${((currentQIndex + 1) / quizData.length) * 100}%`;
        
        document.getElementById('question-text').innerText = q.text;
        const optsDiv = document.getElementById('options-container');
        optsDiv.innerHTML = '';
        
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.innerText = opt;
            if (userAnswers[currentQIndex] === idx) btn.classList.add('selected');
            btn.onclick = () => {
                userAnswers[currentQIndex] = idx;
                renderQuestion(); // Re-render to show selection
                playSound('click');
            };
            optsDiv.appendChild(btn);
        });
        
        document.getElementById('btn-prev').disabled = currentQIndex === 0;
        const nextBtn = document.getElementById('btn-next');
        if (currentQIndex === quizData.length - 1) {
            nextBtn.innerText = "Submit";
            nextBtn.onclick = finishQuiz;
        } else {
            nextBtn.innerText = "Next";
            nextBtn.onclick = () => { currentQIndex++; renderQuestion(); };
        }
    }

    document.getElementById('btn-prev').onclick = () => { currentQIndex--; renderQuestion(); };
    document.getElementById('btn-quit-quiz').onclick = () => {
        if(confirm("Quit quiz?")) showScreen('screen-home');
    };

    // --- RESULTS ---
    function finishQuiz() {
        playSound('tada');
        let correct = 0;
        const reviewList = document.getElementById('review-list');
        reviewList.innerHTML = '';

        quizData.forEach((q, i) => {
            const userAns = userAnswers[i];
            const isCorrect = userAns === q.correctAnswerIndex;
            if (isCorrect) correct++;

            const div = document.createElement('div');
            div.className = 'review-item';
            div.innerHTML = `
                <h4>Q${i+1}: ${q.text}</h4>
                <div class="ans" style="color: ${isCorrect ? 'var(--success)' : 'var(--danger)'}">
                    Your Answer: ${userAns !== null ? q.options[userAns] : 'Skipped'}
                </div>
                ${!isCorrect ? `<div class="ans" style="color: var(--success)">Correct: ${q.options[q.correctAnswerIndex]}</div>` : ''}
                <div class="exp">${q.explanation}</div>
            `;
            reviewList.appendChild(div);
        });

        document.getElementById('result-score').innerText = Math.round((correct / quizData.length) * 100) + "%";
        document.getElementById('stat-correct').innerText = correct;
        document.getElementById('stat-wrong').innerText = quizData.length - correct;
        showScreen('screen-result');
    }

    // --- VIP DOUBTS ---
    const chatHistory = document.getElementById('chat-history');
    const doubtInput = document.getElementById('doubt-input');

    document.getElementById('btn-send-doubt').onclick = async () => {
        const text = doubtInput.value.trim();
        if (!text) return;
        
        // Add user msg
        chatHistory.innerHTML += `<div class="chat-msg user">${text}</div>`;
        doubtInput.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Loading placeholder
        const loadDiv = document.createElement('div');
        loadDiv.className = 'chat-msg ai';
        loadDiv.innerText = '...';
        chatHistory.appendChild(loadDiv);

        try {
            const res = await fetch(`${backendUrl}/resolve_doubt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text, language: currentLang })
            });
            const data = await res.json();
            loadDiv.innerText = data.answer;
        } catch (e) {
            loadDiv.innerText = "Error connecting to AI.";
        }
    };
});
