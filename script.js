document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const backendUrl = "https://quiz-second-time.onrender.com"; // Your Render URL

    // --- STATE ---
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let selectedOptionValue = null;
    let questionStartTime;
    let navStack = ['home-screen']; // Navigation history
    let selection = { subject: null, chapter: null };
    
    let quizSettings = {
        lang: 'english',
        theme: 'dark',
        sound: true
    };

    // --- ELEMENTS ---
    const screens = {
        home: document.getElementById('home-screen'),
        chapter: document.getElementById('chapter-screen'),
        config: document.getElementById('config-screen'),
        quiz: document.getElementById('quiz-area'),
        result: document.getElementById('result-area'),
        history: document.getElementById('history-area')
    };

    const els = {
        loader: document.getElementById('loader'),
        backBtn: document.getElementById('back-btn'),
        chapterList: document.getElementById('chapter-list'),
        limitInput: document.getElementById('question-limit'),
        promptInput: document.getElementById('style-prompt'),
        startBtn: document.getElementById('start-quiz-btn'),
        
        // Quiz
        topicDisplay: document.getElementById('quiz-topic-display'),
        qNum: document.getElementById('current-question-number'),
        qText: document.getElementById('question-text'),
        opts: document.getElementById('options-container'),
        nextBtn: document.getElementById('next-question-btn'),
        submitBtn: document.getElementById('submit-quiz-btn'),
        timer: document.getElementById('timer'),
        
        // Results
        score: document.getElementById('score-display'),
        summary: document.getElementById('score-summary'),
        details: document.getElementById('detailed-results'),
        homeBtn: document.getElementById('home-btn'),
        
        // History
        histList: document.getElementById('history-list'),
        
        // Toggles
        theme: document.getElementById('theme-toggle'),
        lang: document.getElementById('lang-toggle'),
        sound: document.getElementById('sound-toggle'),
        histBtn: document.getElementById('history-btn'),
        exitBtn: document.getElementById('exit-quiz-btn'),
        
        // Audio
        audClick: document.getElementById('sound-click'),
        audSuccess: document.getElementById('sound-success'),
        audError: document.getElementById('sound-error')
    };

    // --- SYLLABUS DATA ---
    const chaptersEnglish = {
        botany: ["Biological Classification", "The Living World", "Plant Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Cell: The Unit of Life", "Cell Cycle", "Photosynthesis", "Respiration", "Plant Growth", "Transport", "Mineral Nutrition", "Sexual Reproduction", "Inheritance Principles", "Molecular Basis", "Evolution", "Microbes", "Biotech Principles", "Biotech Applications", "Organisms & Pop", "Ecosystem", "Biodiversity", "Environmental Issues"],
        zoology: ["Animal Kingdom", "Structural Org", "Digestion", "Breathing", "Body Fluids", "Excretory Products", "Locomotion", "Neural Control", "Chemical Coordination", "Biomolecules", "Human Reproduction", "Reproductive Health", "Genetics", "Human Health", "Immunology"],
        physics: ["Measurement", "Kinematics", "Laws of Motion", "Work Energy Power", "Rotational Motion", "Gravitation", "Solids & Liquids", "Thermodynamics", "Kinetic Theory", "Oscillations", "Electrostatics", "Current Electricity", "Magnetic Effects", "EMI & AC", "EM Waves", "Optics", "Dual Nature", "Atoms & Nuclei", "Electronic Devices"],
        chemistry: ["Basic Concepts", "Atomic Structure", "Bonding", "Thermodynamics", "Solutions", "Equilibrium", "Redox & Electrochem", "Kinetics", "Periodicity", "p-Block", "d- & f-Block", "Co-ordination", "Organic Basics", "Hydrocarbons", "Haloalkanes", "Alcohols", "Aldehydes", "Amines", "Biomolecules"]
    };

    const chaptersHindi = {
        botany: ["जीव जगत का वर्गीकरण", "जीव जगत", "वनस्पति जगत", "आकारिकी", "शारीर", "कोशिका", "कोशिका चक्र", "प्रकाश संश्लेषण", "श्वसन", "वृद्धि", "परिवहन", "खनिज पोषण", "लैंगिक जनन", "वंशागति सिद्धांत", "आणविक आधार", "विकास", "सूक्ष्मजीव", "जैव प्रौद्योगिकी सिद्धांत", "अनुप्रयोग", "जीव और समष्टियाँ", "पारितंत्र", "जैव विविधता", "पर्यावरण"],
        zoology: ["प्राणि जगत", "संरचनात्मक संगठन", "पाचन", "श्वसन", "परिसंचरण", "उत्सर्जन", "गमन", "तंत्रिकीय नियंत्रण", "रासायनिक समन्वय", "जैव अणु", "मानव जनन", "जनन स्वास्थ्य", "आनुवंशिकी", "स्वास्थ्य और रोग", "प्रतिरक्षा"],
        physics: ["मापन", "गतिकी", "गति के नियम", "कार्य ऊर्जा", "घूर्णी गति", "गुरुत्वाकर्षण", "ठोस द्रव", "ऊष्मप्रवैगिकी", "अणुगति", "दोलन", "स्थिरवैद्युतिकी", "धारा", "चुंबकत्व", "प्रेरण", "तरंगें", "प्रकाशिकी", "द्वैत प्रकृति", "परमाणु", "इलेक्ट्रॉनिक्स"],
        chemistry: ["मूल अवधारणाएँ", "परमाणु संरचना", "आबंधन", "ऊष्मप्रवैगिकी", "विलयन", "साम्यावस्था", "वैद्युतरसायन", "गतिकी", "आवर्तिता", "p-ब्लॉक", "d-f ब्लॉक", "उपसहसंयोजन", "कार्बनिक सिद्धांत", "हाइड्रोकार्बन", "हैलोजन", "ऑक्सीजन", "एल्डिहाइड", "एमीन", "जैव अणु"]
    };

    // --- NAVIGATION LOGIC ---
    function navigateTo(screenId) {
        // Hide all screens
        Object.values(screens).forEach(s => s.classList.remove('active'));
        // Show target
        screens[screenId].classList.add('active');
        
        // Push to stack if moving forward
        if (navStack[navStack.length - 1] !== screenId) {
            navStack.push(screenId);
        }
        
        // Show/Hide Back Button
        els.backBtn.style.display = (screenId === 'home') ? 'none' : 'block';
    }

    function goBack() {
        if (navStack.length > 1) {
            navStack.pop(); // Remove current
            const prev = navStack[navStack.length - 1]; // Get previous
            
            // UI Switch
            Object.values(screens).forEach(s => s.classList.remove('active'));
            screens[prev].classList.add('active');
            
            els.backBtn.style.display = (prev === 'home') ? 'none' : 'block';
        }
    }

    els.backBtn.onclick = () => { playSound('click'); goBack(); };

    // --- SETTINGS LOGIC ---
    function loadSettings() {
        const saved = localStorage.getItem('vipSettings');
        if (saved) quizSettings = JSON.parse(saved);
        applyTheme();
        updateLanguageUI();
    }

    function applyTheme() {
        document.body.classList.toggle('light-theme', quizSettings.theme === 'light');
        els.theme.className = quizSettings.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        els.sound.className = quizSettings.sound ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }

    els.theme.onclick = () => {
        quizSettings.theme = quizSettings.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('vipSettings', JSON.stringify(quizSettings));
        applyTheme();
        playSound('click');
    };

    els.sound.onclick = () => {
        quizSettings.sound = !quizSettings.sound;
        localStorage.setItem('vipSettings', JSON.stringify(quizSettings));
        applyTheme();
        playSound('click');
    };

    els.lang.onclick = () => {
        quizSettings.lang = quizSettings.lang === 'english' ? 'hindi' : 'english';
        localStorage.setItem('vipSettings', JSON.stringify(quizSettings));
        updateLanguageUI();
        playSound('click');
        // If on chapter screen, refresh list
        if(screens.chapter.classList.contains('active') && selection.subject) {
            renderChapters(selection.subject);
        }
    };

    function updateLanguageUI() {
        const isHindi = quizSettings.lang === 'hindi';
        const t = (en, hi) => isHindi ? hi : en;
        
        document.getElementById('lbl-select-chap').textContent = t('Select Chapter', 'अध्याय चुनें');
        document.getElementById('lbl-config').textContent = t('Configure Quiz', 'क्विज़ कॉन्फ़िगर करें');
        document.getElementById('lbl-limit').textContent = t('Number of Questions', 'प्रश्नों की संख्या');
        document.getElementById('lbl-prompt').textContent = t('Custom Instructions', 'कस्टम निर्देश');
        els.startBtn.textContent = t('Start Quiz', 'क्विज़ प्रारंभ करें');
        els.homeBtn.textContent = t('Go Home', 'होम');
        
        // Update subject cards text if needed (requires more robust DOM selection or re-rendering)
        document.querySelector('.botany span').textContent = t('Botany', 'वनस्पति विज्ञान');
        document.querySelector('.zoology span').textContent = t('Zoology', 'प्राणी विज्ञान');
        document.querySelector('.physics span').textContent = t('Physics', 'भौतिकी');
        document.querySelector('.chemistry span').textContent = t('Chemistry', 'रसायन विज्ञान');
    }

    function playSound(type) {
        if (!quizSettings.sound) return;
        if (type === 'click') els.audClick.play();
        if (type === 'success') els.audSuccess.play();
    }

    // --- STEP 1: SUBJECT SELECTION ---
    document.querySelectorAll('.subject-card').forEach(card => {
        card.onclick = () => {
            playSound('click');
            selection.subject = card.dataset.subject;
            renderChapters(selection.subject);
            navigateTo('chapter');
        };
    });

    // --- STEP 2: CHAPTER SELECTION ---
    function renderChapters(subject) {
        els.chapterList.innerHTML = '';
        const list = (quizSettings.lang === 'hindi') ? chaptersHindi[subject] : chaptersEnglish[subject];
        const refList = chaptersEnglish[subject]; // For API values

        refList.forEach((chap, i) => {
            const btn = document.createElement('div');
            btn.className = 'chapter-item';
            btn.textContent = list[i] || chap;
            btn.onclick = () => {
                playSound('click');
                selection.chapter = chap; // Store English name
                navigateTo('config');
            };
            els.chapterList.appendChild(btn);
        });
    }

    // --- STEP 3: CONFIG & START ---
    els.startBtn.onclick = async () => {
        playSound('click');
        const limit = parseInt(els.limitInput.value);
        const prompt = els.promptInput.value.trim();

        els.loader.style.display = 'flex';
        document.getElementById('loader-text').textContent = quizSettings.lang === 'hindi' ? 'प्रश्न तैयार हो रहे हैं...' : 'Generating Quiz...';

        try {
            const res = await fetch(`${backendUrl}/generate_quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: selection.subject,
                    chapter: selection.chapter,
                    limit: limit,
                    language: quizSettings.lang,
                    style_prompt: prompt
                })
            });

            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            
            if (!data.questions || data.questions.length === 0) throw new Error("No questions");

            currentQuiz = data.questions;
            currentQuestionIndex = 0;
            userAnswers = [];
            
            els.topicDisplay.textContent = selection.chapter;
            showQuestion(0);
            navigateTo('quiz');

        } catch (err) {
            alert("Connection Error. Please try again. (Wake up server?)");
        } finally {
            els.loader.style.display = 'none';
        }
    };

    // --- QUIZ LOGIC ---
    function showQuestion(index) {
        selectedOptionValue = null;
        questionStartTime = Date.now();
        const q = currentQuiz[index];
        
        els.qNum.textContent = `Q ${index + 1}/${currentQuiz.length}`;
        els.qText.textContent = q.question;
        els.opts.innerHTML = '';
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => {
                playSound('click');
                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedOptionValue = opt;
            };
            els.opts.appendChild(btn);
        });

        if (index === currentQuiz.length - 1) {
            els.nextBtn.style.display = 'none';
            els.submitBtn.style.display = 'block';
        } else {
            els.nextBtn.style.display = 'block';
            els.submitBtn.style.display = 'none';
        }
    }

    function saveAnswer() {
        userAnswers[currentQuestionIndex] = {
            qIndex: currentQuestionIndex,
            selected: selectedOptionValue,
            correct: currentQuiz[currentQuestionIndex].correctAnswer,
            time: Math.round((Date.now() - questionStartTime)/1000)
        };
    }

    els.nextBtn.onclick = () => {
        saveAnswer();
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        playSound('click');
    };

    els.submitBtn.onclick = () => {
        saveAnswer();
        finishQuiz();
        playSound('click');
    };

    els.exitBtn.onclick = () => {
        if(confirm("Exit quiz?")) {
            navStack = ['home-screen']; // Reset stack
            navigateTo('home');
        }
    };

    // --- RESULTS ---
    function finishQuiz() {
        let score = 0;
        els.details.innerHTML = '';

        userAnswers.forEach((ans, i) => {
            const q = currentQuiz[i];
            const isCorrect = ans.selected && ans.selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            if (isCorrect) score++;

            const div = document.createElement('div');
            div.className = `result-card ${isCorrect ? 'correct' : 'wrong'}`;
            div.innerHTML = `
                <h4>Q${i+1}: ${q.question}</h4>
                <span class="ans-label ${isCorrect ? 'green' : 'red'}">Your: ${ans.selected || '-'}</span>
                <span class="ans-label green">Correct: ${q.correctAnswer}</span>
                <div class="explanation"><strong>Sol:</strong> ${q.solution}</div>
            `;
            els.details.appendChild(div);
        });

        const pct = Math.round((score / currentQuiz.length) * 100);
        els.score.textContent = `${pct}%`;
        els.summary.textContent = `${score} / ${currentQuiz.length}`;
        
        // Save History
        saveHistory({
            date: new Date().toLocaleDateString(),
            topic: selection.chapter,
            score: score,
            total: currentQuiz.length,
            html: els.details.innerHTML
        });

        navigateTo('result');
        if (pct > 50) playSound('success');
    }

    els.homeBtn.onclick = () => {
        navStack = ['home-screen'];
        navigateTo('home');
    };

    // --- HISTORY ---
    function saveHistory(item) {
        let h = JSON.parse(localStorage.getItem('vipHistory') || '[]');
        h.unshift(item);
        if(h.length > 20) h.pop();
        localStorage.setItem('vipHistory', JSON.stringify(h));
    }

    els.histBtn.onclick = () => {
        const h = JSON.parse(localStorage.getItem('vipHistory') || '[]');
        els.histList.innerHTML = '';
        if(h.length === 0) els.histList.innerHTML = '<p style="text-align:center; padding:1rem; color:var(--text-sub)">No history yet.</p>';
        
        h.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `<div><strong>${item.topic}</strong><br><small>${item.date}</small></div><div style="font-weight:bold;color:var(--accent-color)">${item.score}/${item.total}</div>`;
            div.onclick = () => {
                els.score.textContent = Math.round((item.score/item.total)*100) + "%";
                els.summary.textContent = "History Review";
                els.details.innerHTML = item.html;
                navigateTo('result');
            };
            els.histList.appendChild(div);
        });
        navigateTo('history');
    };

    // --- ROUGH PAD LOGIC ---
    const pad = document.getElementById('rough-pad');
    const canvas = document.getElementById('rough-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    document.getElementById('rough-pad-toggle').onclick = () => {
        pad.classList.add('active');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    document.getElementById('close-rough').onclick = () => pad.classList.remove('active');
    document.getElementById('clear-rough').onclick = () => ctx.clearRect(0,0,canvas.width,canvas.height);
    
    function draw(e) {
        if(!isDrawing) return;
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    
    canvas.addEventListener('mousedown', (e) => { isDrawing=true; ctx.beginPath(); ctx.moveTo(e.clientX, e.clientY); });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing=false);
    canvas.addEventListener('touchstart', (e) => { isDrawing=true; ctx.beginPath(); ctx.moveTo(e.touches[0].clientX, e.touches[0].clientY); });
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', () => isDrawing=false);

    // Init
    loadSettings();
});
