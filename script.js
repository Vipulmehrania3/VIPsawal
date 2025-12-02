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

    // --- OFFICIAL NEET 2025 SYLLABUS ---
    const SYLLABUS = {
        physics: { 
            name: 'Physics', 
            icon: 'atom', 
            chapters: [
                { id: 'p1', name: 'Physics and Measurement', topics: ['SI Units', 'Dimensions', 'Errors in Measurement'] },
                { id: 'p2', name: 'Kinematics', topics: ['Motion in 1D', 'Projectile Motion', 'Relative Velocity'] },
                { id: 'p3', name: 'Laws of Motion', topics: ['Newtons Laws', 'Friction', 'Circular Motion'] },
                { id: 'p4', name: 'Work, Energy and Power', topics: ['Work-Energy Theorem', 'Collisions', 'Power'] },
                { id: 'p5', name: 'Rotational Motion', topics: ['Centre of Mass', 'Torque', 'Moment of Inertia'] },
                { id: 'p6', name: 'Gravitation', topics: ['Keplers Laws', 'Escape Velocity', 'Satellites'] },
                { id: 'p7', name: 'Properties of Solids and Liquids', topics: ['Elasticity', 'Viscosity', 'Surface Tension', 'Bernoullis Principle'] },
                { id: 'p8', name: 'Thermodynamics', topics: ['First Law', 'Entropy', 'Carnot Engine'] },
                { id: 'p9', name: 'Kinetic Theory of Gases', topics: ['Ideal Gas Equation', 'RMS Speed', 'Degrees of Freedom'] },
                { id: 'p10', name: 'Oscillations and Waves', topics: ['SHM', 'Doppler Effect', 'Beats'] },
                { id: 'p11', name: 'Electrostatics', topics: ['Coulombs Law', 'Electric Field', 'Capacitors'] },
                { id: 'p12', name: 'Current Electricity', topics: ['Ohms Law', 'Kirchhoffs Laws', 'Potentiometer'] },
                { id: 'p13', name: 'Magnetic Effects of Current and Magnetism', topics: ['Biot-Savart Law', 'Amperes Law', 'Earths Magnetism'] },
                { id: 'p14', name: 'Electromagnetic Induction and AC', topics: ['Faradays Law', 'Lenz Law', 'LCR Circuits'] },
                { id: 'p15', name: 'Electromagnetic Waves', topics: ['EM Spectrum', 'Displacement Current'] },
                { id: 'p16', name: 'Optics', topics: ['Reflection/Refraction', 'Lenses/Mirrors', 'Wave Optics', 'Interference'] },
                { id: 'p17', name: 'Dual Nature of Matter', topics: ['Photoelectric Effect', 'De Broglie Hypothesis'] },
                { id: 'p18', name: 'Atoms and Nuclei', topics: ['Bohr Model', 'Radioactivity', 'Fission/Fusion'] },
                { id: 'p19', name: 'Electronic Devices', topics: ['Semiconductors', 'Logic Gates', 'PN Junction'] },
                { id: 'p20', name: 'Experimental Skills', topics: ['Vernier Calipers', 'Screw Gauge', 'Simple Pendulum'] }
            ]
        },
        chemistry: { 
            name: 'Chemistry', 
            icon: 'flask', 
            chapters: [
                { id: 'c1', name: 'Some Basic Concepts in Chemistry', topics: ['Mole Concept', 'Stoichiometry'] },
                { id: 'c2', name: 'Atomic Structure', topics: ['Bohr Model', 'Quantum Numbers', 'Electronic Config'] },
                { id: 'c3', name: 'Chemical Bonding', topics: ['VSEPR Theory', 'Hybridization', 'MOT'] },
                { id: 'c4', name: 'Chemical Thermodynamics', topics: ['Enthalpy', 'Entropy', 'Gibbs Free Energy'] },
                { id: 'c5', name: 'Solutions', topics: ['Raoults Law', 'Colligative Properties', 'Van\'t Hoff Factor'] },
                { id: 'c6', name: 'Equilibrium', topics: ['Le Chatelier Principle', 'pH Calculation', 'Buffer Solutions'] },
                { id: 'c7', name: 'Redox Reactions and Electrochemistry', topics: ['Nernst Equation', 'Conductance', 'Batteries'] },
                { id: 'c8', name: 'Chemical Kinetics', topics: ['Rate Law', 'Order of Reaction', 'Arrhenius Equation'] },
                { id: 'c9', name: 'Classification of Elements', topics: ['Periodic Trends', 'Ionization Energy'] },
                { id: 'c10', name: 'p-Block Elements', topics: ['Group 13-18 Trends', 'Important Compounds'] },
                { id: 'c11', name: 'd- and f-Block Elements', topics: ['Transition Metals', 'Lanthanoids', 'KMnO4/K2Cr2O7'] },
                { id: 'c12', name: 'Co-ordination Compounds', topics: ['IUPAC Nomenclature', 'Isomerism', 'CFT'] },
                { id: 'c13', name: 'Purification & Characterisation', topics: ['Chromatography', 'Qualitative Analysis'] },
                { id: 'c14', name: 'Basic Principles of Organic Chemistry', topics: ['IUPAC Naming', 'Isomerism', 'Reaction Mechanisms'] },
                { id: 'c15', name: 'Hydrocarbons', topics: ['Alkanes/Alkenes/Alkynes', 'Aromatic Hydrocarbons'] },
                { id: 'c16', name: 'Organic Compounds containing Halogens', topics: ['SN1/SN2', 'Haloalkanes', 'Haloarenes'] },
                { id: 'c17', name: 'Organic Compounds containing Oxygen', topics: ['Alcohols', 'Phenols', 'Ethers', 'Aldehydes', 'Ketones', 'Acids'] },
                { id: 'c18', name: 'Organic Compounds containing Nitrogen', topics: ['Amines', 'Diazonium Salts'] },
                { id: 'c19', name: 'Biomolecules', topics: ['Carbohydrates', 'Proteins', 'Nucleic Acids', 'Vitamins'] },
                { id: 'c20', name: 'Principles Related to Practical Chemistry', topics: ['Titration', 'Salt Analysis'] }
            ]
        },
        botany: { 
            name: 'Botany', 
            icon: 'leaf', 
            chapters: [
                { id: 'b1', name: 'Diversity in Living World', topics: ['Living World', 'Biological Classification', 'Plant Kingdom'] },
                { id: 'b2', name: 'Structural Organisation in Plants', topics: ['Morphology of Flowering Plants', 'Anatomy of Flowering Plants'] },
                { id: 'b3', name: 'Cell: Structure and Function', topics: ['Cell The Unit of Life', 'Biomolecules', 'Cell Cycle & Division'] },
                { id: 'b4', name: 'Plant Physiology', topics: ['Photosynthesis', 'Respiration', 'Plant Growth & Development'] },
                { id: 'b5', name: 'Reproduction in Flowering Plants', topics: ['Flower Structure', 'Pollination', 'Double Fertilization'] },
                { id: 'b6', name: 'Genetics', topics: ['Principles of Inheritance', 'Molecular Basis of Inheritance'] },
                { id: 'b7', name: 'Ecology', topics: ['Organisms & Populations', 'Ecosystem', 'Biodiversity'] }
            ]
        },
        zoology: { 
            name: 'Zoology', 
            icon: 'skull', 
            chapters: [
                { id: 'z1', name: 'Animal Kingdom', topics: ['Classification of Animals', 'Non-Chordates', 'Chordates'] },
                { id: 'z2', name: 'Structural Organisation in Animals', topics: ['Animal Tissues', 'Frog (Morphology/Anatomy)'] },
                { id: 'z3', name: 'Human Physiology', topics: ['Digestion', 'Breathing', 'Circulation', 'Excretion', 'Locomotion', 'Neural Control', 'Chemical Control'] },
                { id: 'z4', name: 'Human Reproduction', topics: ['Male/Female System', 'Gametogenesis', 'Reproductive Health'] },
                { id: 'z5', name: 'Evolution', topics: ['Origin of Life', 'Evidences', 'Hardy-Weinberg'] },
                { id: 'z6', name: 'Biology and Human Welfare', topics: ['Human Health & Disease', 'Microbes in Human Welfare'] },
                { id: 'z7', name: 'Biotechnology', topics: ['Principles & Processes', 'Applications'] }
            ]
        }
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
                if (!selectedChapterIds.includes(chapId)) {
                    // Auto-select chapter if a topic is picked (simplified)
                    // In a real app we'd update the chapter checkbox UI too
                    selectedChapterIds.push(chapId);
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
