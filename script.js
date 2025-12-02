document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const backendUrl = "https://quiz-second-time.onrender.com"; 

    // --- STATE ---
    let currentLang = 'en';
    let selectedSubject = null;
    let selectedChapterIds = [];
    let selectedTopicIds = {}; // Map chapterId -> [topic strings]
    let quizData = [];
    let currentQIndex = 0;
    let userAnswers = [];
    let activeChapterForSidebar = null;

    // --- SYLLABUS DATA (Condensed for brevity, relies on full data logic) ---
    // Note: In a real production app, this object would be massive. 
    // I am including the structure so the logic below works perfectly.
    const SYLLABUS = {
        physics: { 
            name: 'Physics', icon: 'atom', 
            chapters: [
                { id: 'p1', name: 'Physics and Measurement', topics: ['SI Units', 'Dimensions', 'Errors'] },
                { id: 'p2', name: 'Kinematics', topics: ['Motion in 1D', 'Projectile Motion'] },
                { id: 'p3', name: 'Laws of Motion', topics: ['Newtons Laws', 'Friction', 'Dynamics'] },
                { id: 'p4', name: 'Work, Energy and Power', topics: ['Work-Energy Theorem', 'Collisions'] },
                { id: 'p5', name: 'Rotational Motion', topics: ['Centre of Mass', 'Torque', 'MOI'] },
                { id: 'p6', name: 'Gravitation', topics: ['Keplers Laws', 'Satellites'] },
                { id: 'p7', name: 'Solids and Liquids', topics: ['Elasticity', 'Viscosity', 'Surface Tension'] },
                { id: 'p8', name: 'Thermodynamics', topics: ['First Law', 'Entropy'] },
                { id: 'p9', name: 'Kinetic Theory', topics: ['Ideal Gas', 'RMS Speed'] },
                { id: 'p10', name: 'Oscillations', topics: ['SHM', 'Waves', 'Doppler'] },
                { id: 'p11', name: 'Electrostatics', topics: ['Coulombs Law', 'Field', 'Capacitors'] },
                { id: 'p12', name: 'Current Electricity', topics: ['Ohms Law', 'Kirchhoff'] },
                { id: 'p13', name: 'Magnetic Effects', topics: ['Biot-Savart', 'Amperes Law'] },
                { id: 'p14', name: 'EMI & AC', topics: ['Faraday', 'LCR'] },
                { id: 'p15', name: 'EM Waves', topics: ['Spectrum'] },
                { id: 'p16', name: 'Optics', topics: ['Ray Optics', 'Wave Optics'] },
                { id: 'p17', name: 'Dual Nature', topics: ['Photoelectric Effect'] },
                { id: 'p18', name: 'Atoms & Nuclei', topics: ['Bohr Model', 'Radioactivity'] },
                { id: 'p19', name: 'Electronics', topics: ['Semiconductors', 'Logic Gates'] }
            ]
        },
        chemistry: { name: 'Chemistry', icon: 'flask', chapters: [
            { id: 'c1', name: 'Basic Concepts', topics: ['Mole Concept'] },
            { id: 'c2', name: 'Atomic Structure', topics: ['Quantum Numbers'] },
            { id: 'c3', name: 'Chemical Bonding', topics: ['VSEPR', 'MOT'] },
            { id: 'c4', name: 'Thermodynamics', topics: ['Enthalpy', 'Gibbs Energy'] },
            { id: 'c5', name: 'Solutions', topics: ['Raoults Law'] },
            { id: 'c6', name: 'Equilibrium', topics: ['Le Chatelier', 'pH'] },
            { id: 'c7', name: 'Redox', topics: ['Nernst Eq'] },
            { id: 'c8', name: 'Kinetics', topics: ['Rate Law'] },
            { id: 'c9', name: 'Periodicity', topics: ['Trends'] },
            { id: 'c10', name: 'p-Block', topics: ['Group 13-18'] },
            { id: 'c11', name: 'd & f Block', topics: ['Transition Metals'] },
            { id: 'c12', name: 'Coordination', topics: ['IUPAC', 'CFT'] },
            { id: 'c13', name: 'Organic Basics', topics: ['IUPAC', 'Isomerism'] },
            { id: 'c14', name: 'Hydrocarbons', topics: ['Alkanes', 'Aromatic'] },
            { id: 'c15', name: 'Haloalkanes', topics: ['SN1/SN2'] },
            { id: 'c16', name: 'Alcohols/Phenols', topics: ['Reactions'] },
            { id: 'c17', name: 'Aldehydes/Ketones', topics: ['Nucleophilic Addn'] },
            { id: 'c18', name: 'Amines', topics: ['Basic Character'] },
            { id: 'c19', name: 'Biomolecules', topics: ['Carbs', 'Proteins'] }
        ]},
        botany: { name: 'Botany', icon: 'leaf', chapters: [
            { id: 'b1', name: 'Living World', topics: ['Taxonomy'] },
            { id: 'b2', name: 'Plant Kingdom', topics: ['Algae', 'Bryophytes'] },
            { id: 'b3', name: 'Morphology', topics: ['Roots', 'Flowers'] },
            { id: 'b4', name: 'Anatomy', topics: ['Tissues'] },
            { id: 'b5', name: 'Cell', topics: ['Organelles', 'Division'] },
            { id: 'b6', name: 'Transport', topics: ['Xylem', 'Phloem'] },
            { id: 'b7', name: 'Photosynthesis', topics: ['Light Rxn', 'Dark Rxn'] },
            { id: 'b8', name: 'Respiration', topics: ['Glycolysis', 'Krebs'] },
            { id: 'b9', name: 'Growth', topics: ['Hormones'] },
            { id: 'b10', name: 'Reproduction', topics: ['Double Fert'] },
            { id: 'b11', name: 'Genetics', topics: ['Mendel', 'DNA'] },
            { id: 'b12', name: 'Ecology', topics: ['Ecosystem', 'Biodiversity'] }
        ]},
        zoology: { name: 'Zoology', icon: 'skull', chapters: [
            { id: 'z1', name: 'Animal Kingdom', topics: ['Chordates', 'Non-Chordates'] },
            { id: 'z2', name: 'Tissues', topics: ['Epithelial', 'Connective'] },
            { id: 'z3', name: 'Digestion', topics: ['Alimentary Canal'] },
            { id: 'z4', name: 'Breathing', topics: ['Exchange of Gases'] },
            { id: 'z5', name: 'Circulation', topics: ['Heart', 'Blood'] },
            { id: 'z6', name: 'Excretion', topics: ['Nephron'] },
            { id: 'z7', name: 'Locomotion', topics: ['Muscles', 'Bones'] },
            { id: 'z8', name: 'Neural Control', topics: ['Brain', 'Nerves'] },
            { id: 'z9', name: 'Chemical Control', topics: ['Hormones'] },
            { id: 'z10', name: 'Reproduction', topics: ['Male/Female System'] },
            { id: 'z11', name: 'Health', topics: ['Diseases', 'Immunity'] },
            { id: 'z12', name: 'Evolution', topics: ['Origin of Life'] }
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

    // --- SWIPE HANDLER UTILITY ---
    function addSwipeHandler(element, onLeft, onRight) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        element.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});
        
        element.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleGesture();
        }, {passive: true});
        
        function handleGesture() {
            if (touchEndX < touchStartX - 50) if(onLeft) onLeft(); // Swiped Left
            if (touchEndX > touchStartX + 50) if(onRight) onRight(); // Swiped Right
        }
    }

    // --- SWIPE IMPLEMENTATION ---
    // 1. Sidebar: Swipe Right to Close
    addSwipeHandler(sidebar, null, () => sidebar.classList.remove('open'));

    // 2. Quiz: Swipe Left (Next), Swipe Right (Prev)
    const quizArea = document.getElementById('quiz-swipe-area');
    addSwipeHandler(quizArea, 
        () => document.getElementById('btn-next').click(), // Left Swipe -> Next
        () => document.getElementById('btn-prev').click()  // Right Swipe -> Prev
    );

    // --- NAVIGATION ---
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => showScreen(btn.dataset.to));
    });

    document.getElementById('theme-btn').addEventListener('click', () => {
        document.documentElement.classList.toggle('light');
        const theme = document.documentElement.classList.contains('light') ? '#f8fafc' : '#0f172a';
        document.getElementById('theme-color-meta').setAttribute('content', theme);
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

    window.toggleChapter = (chapId, el) => {
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

    // --- SIDEBAR & TOPIC SELECTION (FIXED) ---
    window.openSidebar = (chapId) => {
        activeChapterForSidebar = chapId;
        const chap = selectedSubject.chapters.find(c => c.id === chapId);
        const list = document.getElementById('topic-list');
        list.innerHTML = `<h4>${chap.name}</h4>`;
        
        chap.topics.forEach(topic => {
            // Check if topic is already selected
            const isSel = (selectedTopicIds[chapId] || []).includes(topic);
            
            const div = document.createElement('div');
            div.className = `topic-item ${isSel ? 'selected' : ''}`;
            div.innerHTML = `<div class="checkbox"><i class="fas fa-check"></i></div><span>${topic}</span>`;
            
            // Fixed OnClick Logic
            div.onclick = () => {
                div.classList.toggle('selected');
                if (!selectedTopicIds[chapId]) selectedTopicIds[chapId] = [];
                
                if (div.classList.contains('selected')) {
                    selectedTopicIds[chapId].push(topic);
                } else {
                    selectedTopicIds[chapId] = selectedTopicIds[chapId].filter(t => t !== topic);
                }
                
                // Auto-select parent chapter if a topic is clicked
                if (!selectedChapterIds.includes(chapId)) {
                    selectedChapterIds.push(chapId);
                    // (Optional) Update the visual checkbox in the chapter list if needed
                    document.getElementById('btn-go-setup').disabled = false;
                }
                playSound('click');
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
        
        const chapterNames = selectedSubject.chapters
            .filter(c => selectedChapterIds.includes(c.id))
            .map(c => c.name);
            
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
                renderQuestion(); 
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

    // --- VIP DOUBTS (CHAT UI) ---
    const chatHistory = document.getElementById('chat-history');
    const doubtInput = document.getElementById('doubt-input');

    document.getElementById('btn-send-doubt').onclick = handleDoubt;
    doubtInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleDoubt(); });

    async function handleDoubt() {
        const text = doubtInput.value.trim();
        if (!text) return;
        
        // Add User Message (Right)
        addMessage(text, 'user');
        doubtInput.value = '';
        
        // Add Loading Placeholder (Left)
        const loadId = addMessage('...', 'ai');

        try {
            const res = await fetch(`${backendUrl}/resolve_doubt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text, language: currentLang })
            });
            const data = await res.json();
            
            // Replace loading with answer
            const aiMsgDiv = document.getElementById(loadId);
            if(aiMsgDiv) aiMsgDiv.innerHTML = `<div class="msg-content">${data.answer}</div>`;
            
        } catch (e) {
            const aiMsgDiv = document.getElementById(loadId);
            if(aiMsgDiv) aiMsgDiv.innerHTML = `<div class="msg-content">Error connecting to AI.</div>`;
        }
    };

    function addMessage(text, sender) {
        const id = 'msg-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = `chat-msg ${sender}`;
        div.innerHTML = `<div class="msg-content">${text}</div>`;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return id;
    }
});
