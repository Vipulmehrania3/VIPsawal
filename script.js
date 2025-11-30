document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = "https://your-render-backend-url-goes-here.onrender.com"; // UPDATE THIS!

    // --- State ---
    const state = {
        lang: 'english', // or 'hindi'
        subject: null,
        selectedChapters: [],
        quizData: [],
        currentIndex: 0,
        answers: [],
        historyStack: ['screen-start'] // For back button navigation
    };

    // --- Syllabus Data ---
    const syllabus = {
        english: {
            physics: ["Physics and Measurement", "Kinematics", "Laws of Motion", "Work, Energy, and Power", "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves", "Electrostatics", "Current Electricity", "Magnetic Effects of Current and Magnetism", "Electromagnetic Induction and Alternating Currents", "Electromagnetic Waves", "Optics", "Dual Nature of Matter and Radiation", "Atoms and Nuclei", "Electronic Devices"],
            chemistry: ["Some Basic Concepts in Chemistry", "Atomic Structure", "Chemical Bonding", "Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions", "Chemical Kinetics", "p-Block Elements", "d- and f-Block Elements", "Co-ordination Compounds", "Hydrocarbons", "Haloalkanes and Haloarenes", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines", "Biomolecules"],
            botany: ["Living World", "Biological Classification", "Plant Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Cell: The Unit of Life", "Cell Cycle", "Photosynthesis", "Respiration in Plants", "Plant Growth", "Sexual Reproduction in Flowering Plants", "Principles of Inheritance", "Molecular Basis of Inheritance", "Ecosystem", "Biodiversity"],
            zoology: ["Animal Kingdom", "Structural Organisation in Animals", "Digestion", "Breathing", "Body Fluids", "Excretory Products", "Locomotion", "Neural Control", "Chemical Coordination", "Human Reproduction", "Reproductive Health", "Evolution", "Human Health and Disease"]
        },
        hindi: {
            physics: ["भौतिकी और मापन", "गतिकी", "गति के नियम", "कार्य, ऊर्जा और शक्ति", "घूर्णी गति", "गुरुत्वाकर्षण", "ठोस और तरल पदार्थ", "ऊष्मप्रवैगिकी", "दोलन और तरंगें", "स्थिरवैद्युतिकी", "विद्युत धारा", "चुंबकत्व", "विद्युत चुम्बकीय प्रेरण", "प्रकाशिकी", "परमाणु और नाभिक", "इलेक्ट्रॉनिक उपकरण"],
            chemistry: ["रसायन विज्ञान की मूल अवधारणाएँ", "परमाणु संरचना", "रासायनिक आबंधन", "ऊष्मप्रवैगिकी", "विलयन", "साम्यावस्था", "रेडॉक्स अभिक्रियाएँ", "रासायनिक गतिकी", "p-ब्लॉक", "d- और f-ब्लॉक", "उपसहसंयोजन यौगिक", "हाइड्रोकार्बन", "जैव अणु"],
            botany: ["जीव जगत", "वनस्पति जगत", "पुष्पी पादपों की आकारिकी", "कोशिका", "प्रकाश संश्लेषण", "श्वसन", "पादप वृद्धि", "पुष्पी पादपों में लैंगिक जनन", "वंशागति के सिद्धांत", "पारिस्थितिकी"],
            zoology: ["प्राणि जगत", "पाचन एवं अवशोषण", "श्वसन", "शरीर द्रव", "उत्सर्जन", "गमन", "तंत्रिकीय नियंत्रण", "रासायनिक समन्वय", "मानव जनन", "विकास", "मानव स्वास्थ्य"]
        }
    };

    // --- DOM Elements ---
    const screens = document.querySelectorAll('.screen');
    const loader = document.getElementById('loader');
    
    // --- Navigation Logic ---
    function showScreen(screenId, direction = 'forward') {
        const activeScreen = document.querySelector('.screen.active');
        const nextScreen = document.getElementById(screenId);

        if (activeScreen.id === screenId) return;

        // Manage History
        if (direction === 'forward') {
            state.historyStack.push(screenId);
            activeScreen.classList.add('slide-out-left'); // Move current left
            nextScreen.classList.remove('slide-out-left', 'slide-out-right'); // Reset
            nextScreen.classList.add('active'); // Slide in (default right-to-left via CSS default transform)
            
            setTimeout(() => {
                activeScreen.classList.remove('active', 'slide-out-left');
            }, 300);
        } else {
            // Backward
            state.historyStack.pop();
            activeScreen.classList.add('slide-out-right'); // Move current right
            nextScreen.classList.add('active');
            nextScreen.style.transform = 'translateX(-100%)'; // Prep to slide in from left? No, active is 0.
            
            // For backward, we want Next to slide in from Left. 
            // CSS Default is translateX(100%). We need to override momentarily or use specific class.
            // Simplified: Just use opacity fade or simplified slide for robustness.
            
            // Better Logic:
            activeScreen.classList.remove('active');
            nextScreen.classList.add('active');
        }
        
        // Render dynamic content if needed
        if (screenId === 'screen-chapters') renderChapters();
    }

    // Back Button Handler
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.historyStack.length > 1) {
                const prevScreen = state.historyStack[state.historyStack.length - 2];
                showScreen(prevScreen, 'backward');
            }
        });
    });

    // Native Back Button Support
    window.onpopstate = function(event) {
        // Simple handling: if in quiz, ask confirm. Else go back.
        if (document.getElementById('screen-quiz').classList.contains('active')) {
            if(!confirm("Quit Quiz?")) return;
        }
        // Reload or custom logic could go here. For SPA, usually pushState is needed.
    };

    // --- Language Toggle ---
    const langToggle = document.getElementById('language-toggle');
    langToggle.addEventListener('change', () => {
        state.lang = langToggle.checked ? 'hindi' : 'english';
        updateUIText();
    });

    function updateUIText() {
        const isHi = state.lang === 'hindi';
        document.getElementById('txt-select-subject').innerText = isHi ? "विषय चुनें" : "Select Subject";
        document.getElementById('txt-chat-btn').innerText = isHi ? "vipAI से चैट करें" : "Chat with vipAI";
        // Update subject cards text dynamically if needed, or mapping
    }

    // --- Subject Selection ---
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            state.subject = card.dataset.subject;
            state.selectedChapters = [];
            showScreen('screen-chapters', 'forward');
        });
    });

    function renderChapters() {
        const list = document.getElementById('chapter-list');
        list.innerHTML = '';
        const chapterNames = syllabus[state.lang][state.subject] || [];
        
        chapterNames.forEach(chap => {
            const div = document.createElement('div');
            div.className = 'chapter-item';
            div.innerText = chap;
            div.onclick = () => {
                div.classList.toggle('selected');
                if (state.selectedChapters.includes(chap)) {
                    state.selectedChapters = state.selectedChapters.filter(c => c !== chap);
                } else {
                    state.selectedChapters.push(chap);
                }
                document.getElementById('btn-confirm-chapters').disabled = state.selectedChapters.length === 0;
            };
            list.appendChild(div);
        });
    }

    document.getElementById('btn-confirm-chapters').addEventListener('click', () => {
        showScreen('screen-settings', 'forward');
    });

    // --- Settings & Generate ---
    document.getElementById('num-increase').onclick = () => {
        const inp = document.getElementById('question-limit');
        if (inp.value < 50) inp.value = parseInt(inp.value) + 5;
    };
    document.getElementById('num-decrease').onclick = () => {
        const inp = document.getElementById('question-limit');
        if (inp.value > 5) inp.value = parseInt(inp.value) - 5;
    };

    document.getElementById('btn-generate').addEventListener('click', async () => {
        const limit = document.getElementById('question-limit').value;
        const prompt = document.getElementById('style-prompt').value;
        
        loader.classList.remove('hidden');
        try {
            const res = await fetch(`${BACKEND_URL}/generate_quiz`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    subject: state.subject,
                    chapter: state.selectedChapters.join(', '),
                    limit: limit,
                    style_prompt: prompt,
                    language: state.lang
                })
            });
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            
            state.quizData = data.questions;
            state.currentIndex = 0;
            state.answers = new Array(state.quizData.length).fill(null);
            
            renderQuestion();
            showScreen('screen-quiz', 'forward');
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            loader.classList.add('hidden');
        }
    });

    // --- Quiz Logic & Latex Parser ---
    function simpleLatex(text) {
        // The user's Python logic converted to JS
        if (!text) return "";
        let t = text.replace(/\$/g, ""); // Remove $
        t = t.replace(/\\text\{([^}]*)\}/g, "$1"); // \text{}
        t = t.replace(/\\mathrm\{([^}]*)\}/g, "$1"); // \mathrm{}
        
        // Superscripts ^{...} -> ^... (Simplified for HTML display)
        // We will use HTML tags for better rendering in browser
        t = t.replace(/\^\{([^}]*)\}/g, "<sup>$1</sup>");
        t = t.replace(/\_\{([^}]*)\}/g, "<sub>$1</sub>");
        
        // Single char sub/sup
        t = t.replace(/\^([A-Za-z0-9])/g, "<sup>$1</sup>");
        t = t.replace(/\_([A-Za-z0-9])/g, "<sub>$1</sub>");
        
        // Clean latex spaces
        t = t.replace(/\\,/g, " ").replace(/\\;/g, " ").replace(/\\:/g, " ");
        return t;
    }

    function renderQuestion() {
        const q = state.quizData[state.currentIndex];
        const bar = document.getElementById('progress-bar');
        bar.style.width = `${((state.currentIndex + 1) / state.quizData.length) * 100}%`;
        
        document.getElementById('q-number').innerText = `Q${state.currentIndex + 1}/${state.quizData.length}`;
        document.getElementById('q-text').innerHTML = simpleLatex(q.question);
        
        const optsDiv = document.getElementById('options-list');
        optsDiv.innerHTML = '';
        
        q.options.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'opt-btn';
            if (state.answers[state.currentIndex]?.selected === opt) btn.classList.add('selected');
            
            btn.innerHTML = simpleLatex(opt);
            btn.onclick = () => {
                // Save answer
                state.answers[state.currentIndex] = { selected: opt, correct: q.correctAnswer };
                // Visual update
                document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                
                // Auto Slide (Delayed)
                setTimeout(() => {
                    if (state.currentIndex < state.quizData.length - 1) {
                        state.currentIndex++;
                        renderQuestion();
                    } else {
                        document.getElementById('btn-submit-quiz').style.display = 'block';
                    }
                }, 800);
            };
            optsDiv.appendChild(btn);
        });

        // Submit button logic visibility
        const subBtn = document.getElementById('btn-submit-quiz');
        if (state.currentIndex === state.quizData.length - 1) subBtn.style.display = 'block';
        else subBtn.style.display = 'none';
    }

    // --- Touch Gestures (Swipe) ---
    let touchStartX = 0;
    const quizArea = document.getElementById('screen-quiz');
    
    quizArea.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
    
    quizArea.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        handleSwipe(touchStartX, touchEndX);
    });

    function handleSwipe(start, end) {
        const threshold = 50;
        if (start - end > threshold) {
            // Swipe Left -> Next
            if (state.currentIndex < state.quizData.length - 1) {
                state.currentIndex++;
                renderQuestion();
            }
        }
        if (end - start > threshold) {
            // Swipe Right -> Prev
            if (state.currentIndex > 0) {
                state.currentIndex--;
                renderQuestion();
            }
        }
    }

    document.getElementById('btn-exit-quiz').onclick = () => {
        if(confirm("Exit quiz? Progress will be lost.")) showScreen('screen-start', 'backward');
    };

    document.getElementById('btn-submit-quiz').onclick = () => {
        showResults();
        showScreen('screen-result', 'forward');
    };

    // --- Results ---
    function showResults() {
        let score = 0;
        const list = document.getElementById('results-list');
        list.innerHTML = '';
        
        state.quizData.forEach((q, i) => {
            const userAns = state.answers[i]?.selected;
            const isCorrect = userAns === q.correctAnswer;
            if (isCorrect) score++;
            
            const div = document.createElement('div');
            div.className = `res-item ${isCorrect ? 'correct' : 'wrong'}`;
            div.innerHTML = `
                <p><strong>Q${i+1}:</strong> ${simpleLatex(q.question)}</p>
                <div class="ans-label">Your Answer: <span class="ans-text ${isCorrect?'green':'red'}">${simpleLatex(userAns || "Skipped")}</span></div>
                <div class="ans-label">Correct: <span class="ans-text green">${simpleLatex(q.correctAnswer)}</span></div>
                <div class="ans-label" style="margin-top:5px; font-style:italic;">Exp: ${simpleLatex(q.solution)}</div>
            `;
            list.appendChild(div);
        });
        
        const percent = Math.round((score / state.quizData.length) * 100);
        document.getElementById('score-text').innerText = `${percent}%`;
        document.getElementById('score-msg').innerText = percent > 80 ? "Excellent!" : "Keep Practicing!";
    }

    document.getElementById('btn-home').onclick = () => {
        state.historyStack = ['screen-start'];
        showScreen('screen-start', 'backward');
    };

    // --- Chat with vipAI ---
    document.getElementById('btn-goto-chat').onclick = () => showScreen('screen-chat', 'forward');
    
    document.getElementById('btn-send-chat').onclick = async () => {
        const inp = document.getElementById('chat-input');
        const txt = inp.value.trim();
        if (!txt) return;
        
        addChatMsg(txt, 'user');
        inp.value = '';
        
        try {
            const res = await fetch(`${BACKEND_URL}/chat_with_vipai`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: txt, language: state.lang })
            });
            const data = await res.json();
            addChatMsg(data.reply || "Sorry, I couldn't understand.", 'bot');
        } catch (e) {
            addChatMsg("Error connecting to vipAI.", 'bot');
        }
    };

    function addChatMsg(text, sender) {
        const box = document.getElementById('chat-history');
        const div = document.createElement('div');
        div.className = `chat-msg ${sender}`;
        div.innerHTML = simpleLatex(text); // Apply latex parsing to chat too!
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }
});
