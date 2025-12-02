document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const backendUrl = "https://quiz-second-time.onrender.com"; // Replace if different

    // --- VARIABLES ---
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let selectedOptionValue = null;
    let questionStartTime;
    let quizSettings = {
        lang: 'english',
        theme: 'dark',
        sound: true
    };
    
    // Canvas Vars
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // --- ELEMENTS ---
    const screens = document.querySelectorAll('.app-screen');
    const elements = {
        setup: document.getElementById('quiz-setup'),
        quiz: document.getElementById('quiz-area'),
        result: document.getElementById('result-area'),
        history: document.getElementById('history-area'),
        loader: document.getElementById('loader'),
        roughPad: document.getElementById('rough-pad'),
        canvas: document.getElementById('rough-canvas'),
        ctx: document.getElementById('rough-canvas').getContext('2d'),
        
        subject: document.getElementById('subject-select'),
        chapter: document.getElementById('chapter-select'),
        limit: document.getElementById('question-limit'),
        prompt: document.getElementById('style-prompt'),
        startBtn: document.getElementById('start-quiz-btn'),
        
        quizTopic: document.getElementById('quiz-topic-display'),
        qNum: document.getElementById('current-question-number'),
        qText: document.getElementById('question-text'),
        opts: document.getElementById('options-container'),
        nextBtn: document.getElementById('next-question-btn'),
        submitBtn: document.getElementById('submit-quiz-btn'),
        timer: document.getElementById('timer'),
        
        score: document.getElementById('score-display'),
        summary: document.getElementById('score-summary'),
        details: document.getElementById('detailed-results'),
        homeBtn: document.getElementById('home-btn'),
        
        historyList: document.getElementById('history-list'),
        
        // Toggles & Icons
        themeToggle: document.getElementById('theme-toggle'),
        langToggle: document.getElementById('lang-toggle'),
        soundToggle: document.getElementById('sound-toggle'),
        historyBtn: document.getElementById('history-btn'),
        roughToggle: document.getElementById('rough-pad-toggle'),
        exitBtn: document.getElementById('exit-quiz-btn'),
        
        // Rough Pad
        penSize: document.getElementById('pen-size'),
        clearRough: document.getElementById('clear-rough'),
        closeRough: document.getElementById('close-rough'),

        // Audio
        audClick: document.getElementById('sound-click'),
        audSuccess: document.getElementById('sound-success'),
        audError: document.getElementById('sound-error')
    };

    // --- DATA (Syllabus) ---
    const chaptersEnglish = {
        botany: [
            "Biological Classification", // ADDED
            "The Living World", "Plant Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Cell: The Unit of Life", "Cell Cycle and Cell Division", "Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth and Development", "Transport in Plants", "Mineral Nutrition",
            "Sexual Reproduction in Flowering Plants", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution", "Microbes in Human Welfare", "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"
        ],
        zoology: ["Animal Kingdom", "Structural Organisation in Animals", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination", "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration", "Biomolecules", "Human Reproduction", "Reproductive Health", "Genetics and Evolution", "Human Health and Disease", "Immunology"],
        physics: ["Physics and Measurement", "Kinematics", "Laws of Motion", "Work, Energy, and Power", "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves", "Electrostatics", "Current Electricity", "Magnetic Effects of Current and Magnetism", "Electromagnetic Induction and Alternating Currents", "Electromagnetic Waves", "Optics", "Dual Nature of Matter and Radiation", "Atoms and Nuclei", "Electronic Devices"],
        chemistry: ["Some Basic Concepts", "Atomic Structure", "Chemical Bonding", "Thermodynamics", "Solutions", "Equilibrium", "Redox & Electrochemistry", "Chemical Kinetics", "Periodicity", "p-Block", "d- and f-Block", "Co-ordination Compounds", "Organic Basics", "Hydrocarbons", "Haloalkanes/Haloarenes", "Alcohols/Phenols/Ethers", "Aldehydes/Ketones/Carboxylic Acids", "Amines", "Biomolecules"]
    };

    const chaptersHindi = {
        botany: ["जीव जगत का वर्गीकरण", "जीव जगत", "वनस्पति जगत", "पुष्पी पादपों की आकारिकी", "पुष्पी पादपों का शारीर", "कोशिका: जीवन की इकाई", "कोशिका चक्र", "प्रकाश संश्लेषण", "श्वसन", "पादप वृद्धि", "परिवहन", "खनिज पोषण", "लैंगिक जनन", "वंशागति के सिद्धांत", "आणविक आधार", "विकास", "सूक्ष्मजीव", "जैव प्रौद्योगिकी सिद्धांत", "जैव प्रौद्योगिकी उपयोग", "जीव और समष्टियाँ", "पारितंत्र", "जैव विविधता", "पर्यावरण"],
        // (Shortened for brevity, you can fill the rest based on previous prompt if needed, logic handles fallback)
        zoology: ["प्राणि जगत", "संरचनात्मक संगठन", "पाचन", "श्वसन", "परिसंचरण", "उत्सर्जन", "गमन", "तंत्रिकीय नियंत्रण", "रासायनिक समन्वय", "जैव अणु", "मानव जनन", "जनन स्वास्थ्य", "आनुवंशिकी", "स्वास्थ्य और रोग", "प्रतिरक्षा"],
        physics: ["मापन", "गतिकी", "गति के नियम", "कार्य ऊर्जा", "घूर्णी गति", "गुरुत्वाकर्षण", "ठोस द्रव गुण", "ऊष्मप्रवैगिकी", "अणुगति सिद्धांत", "दोलन", "स्थिरवैद्युतिकी", "धारा", "चुंबकत्व", "प्रेरण", "तरंगें", "प्रकाशिकी", "द्वैत प्रकृति", "परमाणु", "इलेक्ट्रॉनिक्स"],
        chemistry: ["मूल अवधारणाएँ", "परमाणु संरचना", "आबंधन", "ऊष्मप्रवैगिकी", "विलयन", "साम्यावस्था", "वैद्युतरसायन", "गतिकी", "आवर्तिता", "p-ब्लॉक", "d-f ब्लॉक", "उपसहसंयोजन", "कार्बनिक सिद्धांत", "हाइड्रोकार्बन", "हैलोजन यौगिक", "ऑक्सीजन यौगिक", "एल्डिहाइड/केटोन", "एमीन", "जैव अणु"]
    };

    // --- FUNCTIONS ---

    function playSound(type) {
        if (!quizSettings.sound) return;
        if (type === 'click') elements.audClick.play();
        if (type === 'success') elements.audSuccess.play();
        if (type === 'error') elements.audError.play();
    }

    function switchScreen(screenId) {
        screens.forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    function toggleLoader(show, text = "Loading...") {
        document.getElementById('loader-text').textContent = text;
        elements.loader.style.display = show ? 'flex' : 'none';
    }

    // --- SETTINGS LOGIC ---
    function loadSettings() {
        const saved = localStorage.getItem('vipSettings');
        if (saved) quizSettings = JSON.parse(saved);
        
        // Apply Theme
        document.body.classList.toggle('light-theme', quizSettings.theme === 'light');
        elements.themeToggle.className = quizSettings.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        
        // Apply Sound Icon
        elements.soundToggle.className = quizSettings.sound ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        
        updateLanguageUI();
    }

    function saveSettings() {
        localStorage.setItem('vipSettings', JSON.stringify(quizSettings));
    }

    elements.themeToggle.onclick = () => {
        quizSettings.theme = quizSettings.theme === 'dark' ? 'light' : 'dark';
        saveSettings();
        loadSettings();
        playSound('click');
    };

    elements.soundToggle.onclick = () => {
        quizSettings.sound = !quizSettings.sound;
        saveSettings();
        loadSettings();
        playSound('click');
    };

    elements.langToggle.onclick = () => {
        quizSettings.lang = quizSettings.lang === 'english' ? 'hindi' : 'english';
        saveSettings();
        updateLanguageUI();
        populateChapters(); // Refresh list
        playSound('click');
    };

    function updateLanguageUI() {
        const isHindi = quizSettings.lang === 'hindi';
        document.getElementById('lbl-subject').textContent = isHindi ? 'विषय चुनें' : 'Select Subject';
        document.getElementById('lbl-chapter').textContent = isHindi ? 'अध्याय चुनें' : 'Select Chapter';
        document.getElementById('lbl-limit').textContent = isHindi ? 'प्रश्नों की संख्या' : 'Number of Questions';
        document.getElementById('lbl-prompt').textContent = isHindi ? 'कस्टम निर्देश (वैकल्पिक)' : 'Custom Instructions (Optional)';
        elements.startBtn.textContent = isHindi ? 'क्विज़ प्रारंभ करें' : 'Start Quiz';
        elements.homeBtn.textContent = isHindi ? 'होम' : 'Go Home';
    }

    // --- QUIZ SETUP ---
    function populateChapters() {
        elements.chapter.innerHTML = '<option value="">-- Select Chapter --</option>';
        elements.chapter.disabled = true;
        const sub = elements.subject.value;
        if (!sub) return;

        const list = (quizSettings.lang === 'hindi' && chaptersHindi[sub]) ? chaptersHindi[sub] : chaptersEnglish[sub];
        // We always use English list values for backend consistency, display text varies
        const refList = chaptersEnglish[sub]; 

        refList.forEach((chap, i) => {
            const opt = document.createElement('option');
            opt.value = chap; // Send English name to API
            opt.textContent = list[i] || chap; // Show Hindi/English
            elements.chapter.appendChild(opt);
        });
        elements.chapter.disabled = false;
        checkStartBtn();
    }

    function checkStartBtn() {
        elements.startBtn.disabled = !(elements.subject.value && elements.chapter.value);
    }

    elements.subject.onchange = () => { populateChapters(); checkStartBtn(); playSound('click'); };
    elements.chapter.onchange = () => { checkStartBtn(); playSound('click'); };

    // --- QUIZ GENERATION ---
    elements.startBtn.onclick = async () => {
        playSound('click');
        const subject = elements.subject.options[elements.subject.selectedIndex].text;
        const chapter = elements.chapter.value;
        const limit = parseInt(elements.limit.value);
        const prompt = elements.prompt.value.trim();

        toggleLoader(true, quizSettings.lang === 'hindi' ? 'क्विज़ बन रहा है...' : 'Generating Quiz...');

        try {
            const res = await fetch(`${backendUrl}/generate_quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject, chapter, limit,
                    language: quizSettings.lang,
                    style_prompt: prompt
                })
            });

            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            
            if (!data.questions || data.questions.length === 0) throw new Error("Empty quiz");

            currentQuiz = data.questions;
            currentQuestionIndex = 0;
            userAnswers = [];
            
            elements.quizTopic.textContent = chapter;
            showQuestion(0);
            switchScreen('quiz-area');

        } catch (err) {
            alert("Connection Error. Please try again.");
            console.error(err);
        } finally {
            toggleLoader(false);
        }
    };

    // --- QUIZ LOGIC ---
    function showQuestion(index) {
        selectedOptionValue = null;
        questionStartTime = Date.now();
        const q = currentQuiz[index];
        
        elements.qNum.textContent = `Q ${index + 1}/${currentQuiz.length}`;
        elements.qText.textContent = q.question; // Ensure plain text rendering
        
        elements.opts.innerHTML = '';
        
        // Randomize options visually but keep track
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => selectOption(btn, opt);
            elements.opts.appendChild(btn);
        });

        // Toggle Next/Submit buttons
        if (index === currentQuiz.length - 1) {
            elements.nextBtn.style.display = 'none';
            elements.submitBtn.style.display = 'block';
        } else {
            elements.nextBtn.style.display = 'block';
            elements.submitBtn.style.display = 'none';
        }
    }

    function selectOption(btn, value) {
        playSound('click');
        const all = document.querySelectorAll('.option-btn');
        all.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedOptionValue = value;
    }

    function saveAnswer() {
        const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
        userAnswers[currentQuestionIndex] = {
            qIndex: currentQuestionIndex,
            selected: selectedOptionValue, // null if skipped
            correct: currentQuiz[currentQuestionIndex].correctAnswer,
            time: timeTaken
        };
    }

    elements.nextBtn.onclick = () => {
        saveAnswer();
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        playSound('click');
    };

    elements.submitBtn.onclick = () => {
        saveAnswer();
        finishQuiz();
        playSound('click');
    };

    elements.exitBtn.onclick = () => {
        if(confirm("Exit quiz? Progress will be lost.")) {
            switchScreen('quiz-setup');
        }
    };

    // --- RESULTS & HISTORY ---
    function finishQuiz() {
        let score = 0;
        elements.details.innerHTML = '';

        // Calculate Score & Generate Details HTML
        userAnswers.forEach((ans, i) => {
            const q = currentQuiz[i];
            const isCorrect = ans.selected && ans.selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            if (isCorrect) score++;

            const div = document.createElement('div');
            div.className = `result-card ${isCorrect ? 'correct' : 'wrong'}`;
            
            div.innerHTML = `
                <h4>Q${i+1}: ${q.question}</h4>
                <span class="ans-label ${isCorrect ? 'green' : 'red'}">
                    Your Answer: ${ans.selected || 'Skipped'}
                </span>
                <span class="ans-label green">Correct: ${q.correctAnswer}</span>
                <div class="explanation">
                    <strong>NCERT Explanation:</strong> ${q.solution}
                    <br><small>Time taken: ${ans.time}s</small>
                </div>
            `;
            elements.details.appendChild(div);
        });

        const percent = Math.round((score / currentQuiz.length) * 100);
        elements.score.textContent = `${percent}%`;
        elements.summary.textContent = `You scored ${score} / ${currentQuiz.length}`;
        
        playSound(percent > 50 ? 'success' : 'error');

        // Save to History
        const historyEntry = {
            date: new Date().toLocaleDateString(),
            topic: elements.quizTopic.textContent,
            score: score,
            total: currentQuiz.length,
            details: elements.details.innerHTML // Store HTML for easy replay
        };
        saveToHistory(historyEntry);

        switchScreen('result-area');
    }

    function saveToHistory(entry) {
        let hist = JSON.parse(localStorage.getItem('vipHistory') || '[]');
        hist.unshift(entry); // Add to top
        if (hist.length > 20) hist.pop(); // Keep last 20
        localStorage.setItem('vipHistory', JSON.stringify(hist));
    }

    // --- HISTORY UI ---
    elements.historyBtn.onclick = () => {
        const hist = JSON.parse(localStorage.getItem('vipHistory') || '[]');
        elements.historyList.innerHTML = '';
        
        if (hist.length === 0) {
            elements.historyList.innerHTML = '<p style="text-align:center">No quizzes attempted yet.</p>';
        } else {
            hist.forEach((h, index) => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `
                    <div>
                        <strong>${h.topic}</strong><br>
                        <small>${h.date}</small>
                    </div>
                    <div style="font-weight:bold; color: var(--accent-color)">
                        ${h.score}/${h.total}
                    </div>
                `;
                // Click to view details
                div.onclick = () => {
                    elements.score.textContent = Math.round((h.score/h.total)*100) + '%';
                    elements.summary.textContent = "Review Mode";
                    elements.details.innerHTML = h.details;
                    switchScreen('result-area');
                };
                elements.historyList.appendChild(div);
            });
        }
        switchScreen('history-area');
    };

    document.getElementById('back-from-history').onclick = () => switchScreen('quiz-setup');
    elements.homeBtn.onclick = () => switchScreen('quiz-setup');

    // --- ROUGH PAD LOGIC ---
    elements.roughToggle.onclick = () => {
        elements.roughPad.classList.add('active');
        resizeCanvas();
    };
    elements.closeRough.onclick = () => elements.roughPad.classList.remove('active');
    elements.clearRough.onclick = () => elements.ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    function resizeCanvas() {
        elements.canvas.width = window.innerWidth;
        elements.canvas.height = window.innerHeight;
    }

    function startDraw(e) {
        isDrawing = true;
        const { x, y } = getPos(e);
        lastX = x;
        lastY = y;
    }

    function draw(e) {
        if (!isDrawing) return;
        const { x, y } = getPos(e);
        
        elements.ctx.strokeStyle = '#000';
        elements.ctx.lineJoin = 'round';
        elements.ctx.lineCap = 'round';
        elements.ctx.lineWidth = elements.penSize.value;
        
        elements.ctx.beginPath();
        elements.ctx.moveTo(lastX, lastY);
        elements.ctx.lineTo(x, y);
        elements.ctx.stroke();
        
        lastX = x;
        lastY = y;
    }

    function getPos(e) {
        if(e.touches) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    elements.canvas.addEventListener('mousedown', startDraw);
    elements.canvas.addEventListener('mousemove', draw);
    elements.canvas.addEventListener('mouseup', () => isDrawing = false);
    elements.canvas.addEventListener('mouseout', () => isDrawing = false);
    
    // Touch support
    elements.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); });
    elements.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
    elements.canvas.addEventListener('touchend', () => isDrawing = false);

    // --- INIT ---
    loadSettings();
    populateChapters();
});
