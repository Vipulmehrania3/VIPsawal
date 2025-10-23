document.addEventListener('DOMContentLoaded', () => {
    // --- STEP 1: CONFIGURE YOUR BACKEND URL HERE ---
    // Your new backend URL has been added.
    const backendUrl = "https://quiz-second-time.onrender.com";


    // --- Element Selectors (no changes) ---
    const screens = document.querySelectorAll('.app-screen');
    const quizSetupScreen = document.getElementById('quiz-setup');
    const quizAreaScreen = document.getElementById('quiz-area');
    const resultAreaScreen = document.getElementById('result-area');
    const loader = document.getElementById('loader');
    const subjectSelect = document.getElementById('subject-select');
    const chapterSelect = document.getElementById('chapter-select');
    const questionLimitInput = document.getElementById('question-limit');
    const stylePromptInput = document.getElementById('style-prompt');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const toggleHindiBtn = document.getElementById('toggle-hindi-btn');
    const quizTitle = document.getElementById('quiz-title');
    const exitQuizBtn = document.getElementById('exit-quiz-btn');
    const currentQuestionNumber = document.getElementById('current-question-number');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const scoreDisplay = document.getElementById('score-display');
    const scoreSummary = document.getElementById('score-summary');
    const detailedResultsDiv = document.getElementById('detailed-results');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');

    // --- State Variables (no changes) ---
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let selectedOptionValue = null;
    let currentLanguage = localStorage.getItem('quizLanguage') || 'english';

    // --- Syllabus Data (no changes) ---
    const chaptersEnglish = {
        physics: ["Physics and Measurement", "Kinematics", "Laws of Motion", "Work, Energy, and Power", "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves", "Electrostatics", "Current Electricity", "Magnetic Effects of Current and Magnetism", "Electromagnetic Induction and Alternating Currents", "Electromagnetic Waves", "Optics", "Dual Nature of Matter and Radiation", "Atoms and Nuclei", "Electronic Devices", "Experimental Skills"],
        chemistry: ["Some Basic Concepts in Chemistry", "Atomic Structure", "Chemical Bonding and Molecular Structure", "Chemical Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions and Electrochemistry", "Chemical Kinetics", "Classification of Elements and Periodicity in Properties", "p-Block Elements", "d- and f-Block Elements", "Co-ordination Compounds", "Purification and Characterisation of Organic Compounds", "Some Basic Principles of Organic Chemistry", "Hydrocarbons", "Organic Compounds Containing Halogens", "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen", "Biomolecules", "Principles Related to Practical Chemistry"],
        botany: ["The Living World", "Biological Classification", "Plant Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Cell: The Unit of Life", "Cell Cycle and Cell Division", "Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth and Development", "Transport in Plants", "Mineral Nutrition", "Sexual Reproduction in Flowering Plants", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution", "Microbes in Human Welfare", "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"],
        zoology: ["Animal Kingdom", "Structural Organisation in Animals", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination", "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration", "Biomolecules", "Human Reproduction", "Reproductive Health", "Genetics and Evolution", "Human Health and Disease", "Immunology (as part of Human Health and Disease)"]
    };
    const chaptersHindi = {
        physics: ["भौतिकी और मापन", "गतिकी", "गति के नियम", "कार्य, ऊर्जा और शक्ति", "घूर्णी गति", "गुरुत्वाकर्षण", "ठोस और तरल पदार्थों के गुण", "ऊष्मप्रवैगिकी", "गैसों का अणुगति सिद्धांत", "दोलन और तरंगें", "स्थिरवैद्युतिकी", "विद्युत धारा", "धारा और चुंबकत्व के चुंबकीय प्रभाव", "विद्युत चुंबकीय प्रेरण और प्रत्यावर्ती धाराएं", "विद्युत चुम्बकीय तरंगें", "प्रकाशिकी", "द्रव्य और विकिरण की द्वैत प्रकृति", "परमाणु और नाभिक", "इलेक्ट्रॉनिक उपकरण", "प्रायोगिक कौशल"],
        chemistry: ["रसायन विज्ञान की कुछ मूल अवधारणाएँ", "परमाणु संरचना", "रासायनिक आबंधन और आणविक संरचना", "रासायनिक ऊष्मप्रवैगिकी", "विलयन", "साम्यावस्था", "अपचयोपचय अभिक्रियाएँ और वैद्युतरसायन", "रासायनिक गतिकी", "तत्वों का वर्गीकरण और गुणधर्मों में आवर्तिता", "p-ब्लॉक के तत्व", "d- और f-ब्लॉक के तत्व", "उपसहसंयोजन यौगिक", "कार्बनिक यौगिकों का शोधन और अभिलक्षणन", "कार्बनिक रसायन के कुछ मूल सिद्धांत", "हाइड्रोकार्बन", "हैलोजन युक्त कार्बनिक यौगिक", "ऑक्सीजन युक्त कार्बनिक यौगिक", "नाइट्रो जन युक्त कार्बनिक यौगिक", "जैव अणु", "प्रायोगिक रसायन से संबंधित सिद्धांत"],
        botany: ["जीव जगत", "जीव जगत का वर्गीकरण", "वनस्पति जगत", "पुष्पी पादपों की आकारिकी", "पुष्पी पादपों का शारीर", "कोशिका: जीवन की इकाई", "कोशिका चक्र और कोशिका विभाजन", "उच्च पादपों में प्रकाश संश्लेषण", "पादपों में श्वसन", "पादप वृद्धि एवं परिवर्धन", "पौधों में परिवहन", "खनिज पोषण", "पुष्पी पादपों में लैंगिक जनन", "वंशागति तथा विविधता के सिद्धांत", "वंशागति का आणविक आधार", "विकास", "मानव कल्याण में सूक्ष्मजीव", "जैव प्रौद्योगिकी - सिद्धांत व प्रक्रम", "जैव प्रौद्योगिकी एवं उसके उपयोग", "जीव और समष्टियाँ", "पारितंत्र", "जैव विविधता एवं संरक्षण", "पर्यावरण के मुद्दे"],
        zoology: ["प्राणि जगत", "प्राणियों में संरचनात्मक संगठन", "पाचन एवं अवशोषण", "श्वसन और गैसों का विनिमय", "शरीर द्रव तथा परिसंचरण", "उत्सर्जी उत्पाद एवं उनका निष्कासन", "गमन एवं संचलन", "तंत्रिकीय नियंत्रण एवं समन्वय", "रासायनिक समन्वय तथा एकीकरण", "जैव अणु", "मानव जनन", "जनन स्वास्थ्य", "आनुवंशिकी तथा विकास", "मानव स्वास्थ्य तथा रोग", "प्रतिरक्षा विज्ञान (मानव स्वास्थ्य तथा रोग का हिस्सा)"]
    };

    // --- Core Functions ---
    const showScreen = (screenToShow) => screens.forEach(s => s.classList.toggle('active', s === screenToShow));
    const showLoader = (text) => {
        document.getElementById('loader-text').textContent = text;
        loader.classList.add('active');
    };
    const hideLoader = () => loader.classList.remove('active');

    function resetQuizState() {
        stylePromptInput.value = '';
        subjectSelect.value = '';
        populateChapterSelect();
        showScreen(quizSetupScreen);
    }

    // --- Event Listeners and Logic ---
    toggleHindiBtn.addEventListener('click', () => {
        currentLanguage = (currentLanguage === 'english') ? 'hindi' : 'english';
        localStorage.setItem('quizLanguage', currentLanguage);
        updateLanguageDisplay();
        populateChapterSelect();
    });

    function updateLanguageDisplay() {
        // This function remains the same and correctly translates the UI
        const isHindi = currentLanguage === 'hindi';
        document.body.classList.toggle('hindi-medium', isHindi);
        toggleHindiBtn.textContent = isHindi ? 'Switch to English Medium' : 'Switch to Hindi Medium';
        document.querySelector('h1').textContent = isHindi ? 'वीआईपीक्विज़' : 'VIPQuizs';
        document.title = isHindi ? 'वीआईपीक्विज़' : 'VIPQuizs';
        document.querySelector('label[for="subject-select"]').textContent = isHindi ? 'विषय चुनें' : 'Select Subject';
        document.querySelector('label[for="chapter-select"]').textContent = isHindi ? 'अध्याय चुनें' : 'Select Chapter';
        document.querySelector('label[for="question-limit"]').textContent = isHindi ? 'प्रश्नों की संख्या' : 'Number of Questions';
        document.querySelector('label[for="style-prompt"]').textContent = isHindi ? 'प्रश्न शैली (वैकल्पिक)' : 'Question Style (Optional)';
        startQuizBtn.innerHTML = isHindi ? 'क्विज़ प्रारंभ करें' : 'Start Quiz';
    }
    
    function populateChapterSelect() {
        const selectedSubject = subjectSelect.value;
        chapterSelect.innerHTML = `<option value="">-- ${(currentLanguage === 'hindi' ? 'अध्याय चुनें' : 'Choose Chapter')} --</option>`;
        chapterSelect.disabled = true;
        const currentChaptersList = (currentLanguage === 'hindi') ? chaptersHindi : chaptersEnglish;
        if (selectedSubject && currentChaptersList[selectedSubject]) {
            const englishChapters = chaptersEnglish[selectedSubject];
            currentChaptersList[selectedSubject].forEach((chapter, index) => {
                const option = document.createElement('option');
                option.value = englishChapters[index];
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });
            chapterSelect.disabled = false;
        }
        updateStartButtonState();
    }

    const updateStartButtonState = () => startQuizBtn.disabled = !(subjectSelect.value && chapterSelect.value);
    subjectSelect.addEventListener('change', populateChapterSelect);
    chapterSelect.addEventListener('change', updateStartButtonState);

    startQuizBtn.addEventListener('click', async () => {
        if (backendUrl.includes("your-render-backend-url-goes-here")) {
            alert("CRITICAL ERROR: The backendUrl in script.js has not been set. Please edit the file and replace the placeholder with your live Render URL.");
            return;
        }
        const selectedSubject = subjectSelect.options[subjectSelect.selectedIndex].text;
        const selectedChapter = chapterSelect.value;
        const questionLimit = parseInt(questionLimitInput.value);
        const stylePrompt = stylePromptInput.value.trim();

        showLoader((currentLanguage === 'hindi') ? 'आपका क्विज़ बन रहा है...' : 'Generating Your Quiz...');
        
        try {
            const response = await fetch(`${backendUrl}/generate_quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: selectedSubject, chapter: selectedChapter, limit: questionLimit, language: currentLanguage, style_prompt: stylePrompt
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            currentQuiz = data.questions;
            if (!currentQuiz || currentQuiz.length === 0) {
                 throw new Error("AI failed to generate questions. Please try a different prompt or chapter.");
            }
            currentQuestionIndex = 0;
            userAnswers = [];
            quizTitle.textContent = selectedSubject;
            displayQuestion(currentQuestionIndex);
            showScreen(quizAreaScreen);
        } catch (error) {
            console.error("Fetch Error Details:", error);
            const errorMessage = (currentLanguage === 'hindi') ? `क्विज़ उत्पन्न करने में विफल: ${error.message}। कृपया सुनिश्चित करें कि बैकएंड सर्वर चल रहा है।` : `Failed to generate quiz: ${error.message}. Please ensure the backend server is running.`;
            alert(errorMessage);
        } finally {
            hideLoader();
        }
    });

    exitQuizBtn.addEventListener('click', () => {
        const exitMessage = currentLanguage === 'hindi' ? 'क्या आप वाकई बाहर निकलना चाहते हैं? आपकी प्रगति खो जाएगी।' : 'Are you sure you want to exit? Your progress will be lost.';
        if (confirm(exitMessage)) {
            resetQuizState();
        }
    });

    function displayQuestion(index) {
        selectedOptionValue = null;
        const question = currentQuiz[index];
        currentQuestionNumber.textContent = `${(currentLanguage === 'hindi' ? 'प्रश्न' : 'Question')} ${index + 1} / ${currentQuiz.length}`;
        questionText.innerHTML = question.question;
        optionsContainer.innerHTML = '';
        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
        shuffledOptions.forEach(optionText => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerHTML = optionText;
            button.addEventListener('click', () => {
                optionsContainer.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                selectedOptionValue = button.innerHTML;
            });
            optionsContainer.appendChild(button);
        });
        nextQuestionBtn.style.display = (index === currentQuiz.length - 1) ? 'none' : 'block';
        submitQuizBtn.style.display = (index === currentQuiz.length - 1) ? 'block' : 'none';
    }
    
    function recordAnswer() {
        userAnswers.push({
            questionId: currentQuiz[currentQuestionIndex].id,
            selectedAnswer: selectedOptionValue,
            correctAnswer: currentQuiz[currentQuestionIndex].correctAnswer,
        });
    }

    function handleNextOrSubmit() {
        if (selectedOptionValue === null) {
            alert((currentLanguage === 'hindi') ? 'कृपया आगे बढ़ने से पहले एक विकल्प चुनें।' : 'Please select an option before proceeding.');
            return;
        }
        recordAnswer();
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.length) {
            displayQuestion(currentQuestionIndex);
        } else {
            submitQuiz();
        }
    }

    nextQuestionBtn.addEventListener('click', handleNextOrSubmit);
    submitQuizBtn.addEventListener('click', handleNextOrSubmit);
    
    async function submitQuiz() {
        showScreen(resultAreaScreen);
        detailedResultsDiv.innerHTML = '';
        showLoader((currentLanguage === 'hindi') ? 'परिणामों का विश्लेषण किया जा रहा है...' : 'Analyzing Results...');
        try {
            // Simplified for stability, full data can be added back if needed
            const analysisResponse = await fetch(`${backendUrl}/analyze_results`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quiz: currentQuiz, userAnswers: userAnswers, language: currentLanguage })
            });
            if (!analysisResponse.ok) throw new Error('AI analysis failed.');
            
            const analysisData = await analysisResponse.json();
            let score = analysisData.score;
            let scorePercentage = Math.round((score / currentQuiz.length) * 100);
            
            scoreDisplay.textContent = `${scorePercentage}%`;
            scoreSummary.textContent = `${(currentLanguage === 'hindi' ? 'आपने' : 'You answered')} ${score} ${(currentLanguage === 'hindi' ? 'में से' : 'out of')} ${currentQuiz.length} ${(currentLanguage === 'hindi' ? 'प्रश्न सही किए।' : 'questions correctly.')}`;
            
            if (analysisData.overallFeedback) {
                const feedbackDiv = document.createElement('div');
                feedbackDiv.classList.add('result-item');
                feedbackDiv.innerHTML = `<p>${analysisData.overallFeedback}</p>`;
                detailedResultsDiv.appendChild(feedbackDiv);
            }
        } catch (error) {
            console.error("Error fetching detailed analysis:", error);
            let score = 0;
            userAnswers.forEach((answer, i) => { if (answer.selectedAnswer === currentQuiz[i].correctAnswer) score++; });
            let scorePercentage = Math.round((score / currentQuiz.length) * 100);
            scoreDisplay.textContent = `${scorePercentage}%`;
            scoreSummary.textContent = `${(currentLanguage === 'hindi' ? 'आपने' : 'You answered')} ${score} ${(currentLanguage === 'hindi' ? 'में से' : 'out of')} ${currentQuiz.length} ${(currentLanguage === 'hindi' ? 'प्रश्न सही किए।' : 'questions correctly.')}`;
        } finally {
            hideLoader();
        }
    }

    restartQuizBtn.addEventListener('click', resetQuizState);

    // --- INITIALIZE APP ---
    updateLanguageDisplay();
    populateChapterSelect();
    updateStartButtonState();
    showScreen(quizSetupScreen);
});
