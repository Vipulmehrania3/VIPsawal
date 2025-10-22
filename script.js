document.addEventListener('DOMContentLoaded', () => {
    // --- IMPORTANT: CONFIGURE YOUR BACKEND URL HERE ---
    const backendUrl = "https://quiz-second-time.onrender.com"; // Replace with your actual Render URL if different

    // Get all elements
    const subjectSelect = document.getElementById('subject-select');
    const chapterSelect = document.getElementById('chapter-select');
    const questionLimitInput = document.getElementById('question-limit');
    const stylePromptInput = document.getElementById('style-prompt'); // NEW: Get the prompt textarea
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const toggleHindiBtn = document.getElementById('toggle-hindi-btn');
    // ... (rest of the elements are the same)
    const quizSetupDiv = document.getElementById('quiz-setup');
    const quizAreaDiv = document.getElementById('quiz-area');
    const resultAreaDiv = document.getElementById('result-area');
    const currentQuestionNumber = document.getElementById('current-question-number');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const scoreDisplay = document.getElementById('score-display');
    const detailedResultsDiv = document.getElementById('detailed-results');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');


    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let questionStartTime;

    let currentLanguage = localStorage.getItem('quizLanguage') || 'english';
    updateLanguageDisplay();

    // --- (Syllabus chapters objects are the same, so they are omitted here for brevity) ---
    // Make sure you have the full chaptersEnglish and chaptersHindi objects from the previous version
    const chaptersEnglish = {
        physics: ["Physics and Measurement", "Kinematics", "Laws of Motion", "Work, Energy, and Power", "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves", "Electrostatics", "Current Electricity", "Magnetic Effects of Current and Magnetism", "Electromagnetic Induction and Alternating Currents", "Electromagnetic Waves", "Optics", "Dual Nature of Matter and Radiation", "Atoms and Nuclei", "Electronic Devices", "Experimental Skills"],
        chemistry: ["Some Basic Concepts in Chemistry", "Atomic Structure", "Chemical Bonding and Molecular Structure", "Chemical Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions and Electrochemistry", "Chemical Kinetics", "Classification of Elements and Periodicity in Properties", "p-Block Elements", "d- and f-Block Elements", "Co-ordination Compounds", "Purification and Characterisation of Organic Compounds", "Some Basic Principles of Organic Chemistry", "Hydrocarbons", "Organic Compounds Containing Halogens", "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen", "Biomolecules", "Principles Related to Practical Chemistry"],
        botany: ["The Living World", "Biological Classification", "Plant Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Cell: The Unit of Life", "Cell Cycle and Cell Division", "Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth and Development", "Transport in Plants", "Mineral Nutrition", "Sexual Reproduction in Flowering Plants", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution", "Microbes in Human Welfare", "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"],
        zoology: ["Animal Kingdom", "Structural Organisation in Animals", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination", "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration", "Biomolecules", "Human Reproduction", "Reproductive Health", "Genetics and Evolution", "Human Health and Disease", "Immunology (as part of Human Health and Disease)"]
    };
    const chaptersHindi = {
        physics: ["भौतिकी और मापन", "गतिकी", "गति के नियम", "कार्य, ऊर्जा और शक्ति", "घूर्णी गति", "गुरुत्वाकर्षण", "ठोस और तरल पदार्थों के गुण", "ऊष्मप्रवैगिकी", "गैसों का अणुगति सिद्धांत", "दोलन और तरंगें", "स्थिरवैद्युतिकी", "विद्युत धारा", "धारा और चुंबकत्व के चुंबकीय प्रभाव", "विद्युत चुंबकीय प्रेरण और प्रत्यावर्ती धाराएं", "विद्युत चुम्बकीय तरंगें", "प्रकाशिकी", "द्रव्य और विकिरण की द्वैत प्रकृति", "परमाणु और नाभिक", "इलेक्ट्रॉनिक उपकरण", "प्रायोगिक कौशल"],
        chemistry: ["रसायन विज्ञान की कुछ मूल अवधारणाएँ", "परमाणु संरचना", "रासायनिक आबंधन और आणविक संरचना", "रासायनिक ऊष्मप्रवैगिकी", "विलयन", "साम्यावस्था", "अपचयोपचय अभिक्रियाएँ और वैद्युतरसायन", "रासायनिक गतिकी", "तत्वों का वर्गीकरण और गुणधर्मों में आवर्तिता", "p-ब्लॉक के तत्व", "d- और f-ब्लॉक के तत्व", "उपसहसंयोजन यौगिक", "कार्बनिक यौगिकों का शोधन और अभिलक्षणन", "कार्बनिक रसायन के कुछ मूल सिद्धांत", "हाइड्रोकार्बन", "हैलोजन युक्त कार्बनिक यौगिक", "ऑक्सीजन युक्त कार्बनिक यौगिक", "नाइट्रोजन युक्त कार्बनिक यौगिक", "जैव अणु", "प्रायोगिक रसायन से संबंधित सिद्धांत"],
        botany: ["जीव जगत", "जीव जगत का वर्गीकरण", "वनस्पति जगत", "पुष्पी पादपों की आकारिकी", "पुष्पी पादपों का शारीर", "कोशिका: जीवन की इकाई", "कोशिका चक्र और कोशिका विभाजन", "उच्च पादपों में प्रकाश संश्लेषण", "पादपों में श्वसन", "पादप वृद्धि एवं परिवर्धन", "पौधों में परिवहन", "खनिज पोषण", "पुष्पी पादपों में लैंगिक जनन", "वंशागति तथा विविधता के सिद्धांत", "वंशागति का आणविक आधार", "विकास", "मानव कल्याण में सूक्ष्मजीव", "जैव प्रौद्योगिकी - सिद्धांत व प्रक्रम", "जैव प्रौद्योगिकी एवं उसके उपयोग", "जीव और समष्टियाँ", "पारितंत्र", "जैव विविधता एवं संरक्षण", "पर्यावरण के मुद्दे"],
        zoology: ["प्राणि जगत", "प्राणियों में संरचनात्मक संगठन", "पाचन एवं अवशोषण", "श्वसन और गैसों का विनिमय", "शरीर द्रव तथा परिसंचरण", "उत्सर्जी उत्पाद एवं उनका निष्कासन", "गमन एवं संचलन", "तंत्रिकीय नियंत्रण एवं समन्वय", "रासायनिक समन्वय तथा एकीकरण", "जैव अणु", "मानव जनन", "जनन स्वास्थ्य", "आनुवंशिकी तथा विकास", "मानव स्वास्थ्य तथा रोग", "प्रतिरक्षा विज्ञान (मानव स्वास्थ्य तथा रोग का हिस्सा)"]
    };


    // --- Event Listeners and Functions ---

    toggleHindiBtn.addEventListener('click', () => {
        currentLanguage = (currentLanguage === 'english') ? 'hindi' : 'english';
        localStorage.setItem('quizLanguage', currentLanguage);
        updateLanguageDisplay();
        populateChapterSelect();
    });

    function updateLanguageDisplay() {
        // This function remains the same as before
        if (currentLanguage === 'hindi') {
            document.body.classList.add('hindi-medium');
            toggleHindiBtn.textContent = 'Switch to English Medium';
            document.querySelector('h1').textContent = 'वीआईपीक्विज़';
            document.title = 'वीआईपीक्विज़';
            document.querySelector('label[for="subject-select"]').textContent = 'विषय चुनें:';
            document.querySelector('label[for="chapter-select"]').textContent = 'अध्याय चुनें:';
            document.querySelector('label[for="question-limit"]').textContent = 'प्रश्नों की संख्या:';
            document.querySelector('label[for="style-prompt"]').textContent = 'प्रश्न शैली प्रॉम्प्ट (वैकल्पिक):';
            startQuizBtn.textContent = 'क्विज़ प्रारंभ करें';
            nextQuestionBtn.textContent = 'अगला प्रश्न';
            submitQuizBtn.textContent = 'क्विज़ जमा करें';
            restartQuizBtn.textContent = 'नया क्विज़ शुरू करें';
            document.querySelector('p[style*="font-size: 0.9em;"]').textContent = 'गूगल एआई द्वारा संचालित';
        } else {
            document.body.classList.remove('hindi-medium');
            toggleHindiBtn.textContent = 'Switch to Hindi Medium';
            document.querySelector('h1').textContent = 'VIPQuizs';
            document.title = 'VIPQuizs';
            document.querySelector('label[for="subject-select"]').textContent = 'Select Subject:';
            document.querySelector('label[for="chapter-select"]').textContent = 'Select Chapter:';
            document.querySelector('label[for="question-limit"]').textContent = 'Number of Questions:';
            document.querySelector('label[for="style-prompt"]').textContent = 'Question Style Prompt (Optional):';
            startQuizBtn.textContent = 'Start Quiz';
            nextQuestionBtn.textContent = 'Next Question';
            submitQuizBtn.textContent = 'Submit Quiz';
            restartQuizBtn.textContent = 'Start New Quiz';
            document.querySelector('p[style*="font-size: 0.9em;"]').textContent = 'Powered by Google AI';
        }
        updateStartButtonState();
    }
    
    // The rest of the script is the same, but with one crucial change in the startQuizBtn listener
    
    // ... (populateChapterSelect, updateStartButtonState functions are unchanged) ...
    function populateChapterSelect() {
        const selectedSubject = subjectSelect.value;
        chapterSelect.innerHTML = '<option value="">-- Select Chapter --</option>';
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
    subjectSelect.addEventListener('change', populateChapterSelect);
    chapterSelect.addEventListener('change', updateStartButtonState);
    function updateStartButtonState() {
        const isSubjectSelected = subjectSelect.value !== '';
        const isChapterSelected = chapterSelect.value !== '';
        startQuizBtn.disabled = !(isSubjectSelected && isChapterSelected);
    }


    startQuizBtn.addEventListener('click', async () => {
        if (backendUrl.includes("your-render-backend-url-goes-here")) {
            alert("Configuration Error: Please update the backendUrl in script.js with your deployed Render URL.");
            return;
        }
        const selectedSubject = subjectSelect.value;
        const selectedChapter = chapterSelect.value;
        const questionLimit = parseInt(questionLimitInput.value);
        const stylePrompt = stylePromptInput.value.trim(); // NEW: Get the value from the textarea

        // ... (validation is the same) ...
        const alertMessage = (currentLanguage === 'hindi') ? "कृपया विषय, अध्याय और प्रश्नों की एक वैध संख्या का चयन करें।" : "Please select subject, chapter, and a valid number of questions.";
        if (!selectedSubject || !selectedChapter || isNaN(questionLimit) || questionLimit < 1) {
            alert(alertMessage);
            return;
        }

        startQuizBtn.textContent = (currentLanguage === 'hindi') ? 'क्विज़ बन रहा है...' : 'Generating Quiz...';
        startQuizBtn.disabled = true;

        try {
            const response = await fetch(`${backendUrl}/generate_quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: selectedSubject,
                    chapter: selectedChapter,
                    limit: questionLimit,
                    language: currentLanguage,
                    style_prompt: stylePrompt // NEW: Send the style prompt to the backend
                })
            });

            // ... (The rest of the function remains the same) ...
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            currentQuiz = data.questions;
            if (!currentQuiz || currentQuiz.length === 0) {
                 throw new Error("Empty quiz generated by AI. Please try again.");
            }
            currentQuestionIndex = 0;
            userAnswers = [];
            quizSetupDiv.style.display = 'none';
            quizAreaDiv.style.display = 'block';
            displayQuestion(currentQuestionIndex);

        } catch (error) {
            console.error("Error generating quiz:", error);
            const errorMessage = (currentLanguage === 'hindi') ? `क्विज़ उत्पन्न करने में विफल: ${error.message}। कृपया सुनिश्चित करें कि बैकएंड सर्वर चल रहा है।` : `Failed to generate quiz: ${error.message}. Please ensure the backend server is running.`;
            alert(errorMessage);
            startQuizBtn.textContent = (currentLanguage === 'hindi') ? 'क्विज़ प्रारंभ करें' : 'Start Quiz';
            startQuizBtn.disabled = false;
            updateStartButtonState();
        }
    });

    // --- All other functions (displayQuestion, recordAnswer, submitQuiz, etc.) remain exactly the same. ---
    // (You can copy them from the previous complete version of script.js)
    function displayQuestion(index) {
        if (index >= currentQuiz.length) {
            submitQuiz();
            return;
        }
        const question = currentQuiz[index];
        currentQuestionNumber.textContent = `${(currentLanguage === 'hindi' ? 'प्रश्न' : 'Question')} ${index + 1} ${(currentLanguage === 'hindi' ? 'में से' : 'of')} ${currentQuiz.length}`;
        questionText.innerHTML = question.question;
        optionsContainer.innerHTML = '';
        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
        shuffledOptions.forEach(option => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'question-option';
            radio.value = option;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(option));
            optionsContainer.appendChild(label);
        });
        if (index === currentQuiz.length - 1) {
            nextQuestionBtn.style.display = 'none';
            submitQuizBtn.style.display = 'block';
        } else {
            nextQuestionBtn.style.display = 'block';
            submitQuizBtn.style.display = 'none';
        }
        questionStartTime = Date.now();
    }
    function recordAnswer() {
        const selectedOption = document.querySelector('input[name="question-option"]:checked');
        const timeTaken = Date.now() - questionStartTime;
        userAnswers.push({
            questionId: currentQuiz[currentQuestionIndex].id,
            questionText: currentQuiz[currentQuestionIndex].question,
            selectedAnswer: selectedOption ? selectedOption.value : null,
            correctAnswer: currentQuiz[currentQuestionIndex].correctAnswer,
            timeTaken: timeTaken,
            solution: currentQuiz[currentQuestionIndex].solution
        });
    }
    nextQuestionBtn.addEventListener('click', () => {
        if (!document.querySelector('input[name="question-option"]:checked')) {
            alert((currentLanguage === 'hindi') ? 'अगले प्रश्न पर जाने से पहले कृपया एक विकल्प चुनें।' : 'Please select an option before moving to the next question.');
            return;
        }
        recordAnswer();
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    });
    submitQuizBtn.addEventListener('click', () => {
        if (!document.querySelector('input[name="question-option"]:checked')) {
            alert((currentLanguage === 'hindi') ? 'क्विज़ जमा करने से पहले कृपया एक विकल्प चुनें।' : 'Please select an option before submitting the quiz.');
            return;
        }
        recordAnswer();
        submitQuiz();
    });
    async function submitQuiz() {
        quizAreaDiv.style.display = 'none';
        resultAreaDiv.style.display = 'block';
        scoreDisplay.textContent = (currentLanguage === 'hindi') ? 'परिणामों का विश्लेषण किया जा रहा है...' : 'Analyzing results...';
        detailedResultsDiv.innerHTML = (currentLanguage === 'hindi') ? 'AI के साथ परिणामों का विश्लेषण किया जा रहा है...' : 'Analyzing results with AI...';
        try {
            const analysisResponse = await fetch(`${backendUrl}/analyze_results`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz: currentQuiz,
                    userAnswers: userAnswers,
                    language: currentLanguage
                })
            });
            if (!analysisResponse.ok) {
                throw new Error(`HTTP error! Status: ${analysisResponse.status}`);
            }
            const analysisData = await analysisResponse.json();
            detailedResultsDiv.innerHTML = '';
            let score = analysisData.score;
            userAnswers.forEach((answer, index) => {
                const isCorrect = answer.selectedAnswer === answer.correctAnswer;
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                resultItem.innerHTML = `<h4>${(currentLanguage === 'hindi' ? 'प्रश्न' : 'Question')} ${index + 1}: ${answer.questionText}</h4><p>${(currentLanguage === 'hindi' ? 'आपका उत्तर' : 'Your Answer')}: <span class="${isCorrect ? 'correct-answer' : 'wrong-answer'}">${answer.selectedAnswer || (currentLanguage === 'hindi' ? 'उत्तर नहीं दिया' : 'Not Answered')}</span></p><p>${(currentLanguage === 'hindi' ? 'सही उत्तर' : 'Correct Answer')}: <span class="correct-answer">${answer.correctAnswer}</span></p>${!isCorrect ? `<p><strong>${(currentLanguage === 'hindi' ? 'AI समाधान' : 'AI Solution')}:</strong> ${answer.solution || (currentLanguage === 'hindi' ? 'समाधान उपलब्ध नहीं है।' : 'Solution not available.')}</p>` : ''}<p>${(currentLanguage === 'hindi' ? 'लिया गया समय' : 'Time Taken')}: ${(answer.timeTaken / 1000).toFixed(1)} ${(currentLanguage === 'hindi' ? 'सेकंड' : 'seconds')}</p>`;
                detailedResultsDiv.appendChild(resultItem);
            });
            scoreDisplay.textContent = `${(currentLanguage === 'hindi' ? 'आपने' : 'You scored')} ${score} ${(currentLanguage === 'hindi' ? 'में से' : 'out of')} ${currentQuiz.length}${(currentLanguage === 'hindi' ? ' प्रश्न सही किए!' : '!')}`;
            if (analysisData.overallFeedback) {
                const feedbackDiv = document.createElement('div');
                feedbackDiv.classList.add('result-item');
                feedbackDiv.innerHTML = `<h3>${(currentLanguage === 'hindi' ? 'समग्र AI प्रतिक्रिया' : 'Overall AI Feedback')}:</h3><p>${analysisData.overallFeedback}</p>`;
                detailedResultsDiv.prepend(feedbackDiv);
            }
        } catch (error) {
            console.error("Error fetching detailed analysis:", error);
            detailedResultsDiv.innerHTML = `<p style="color: red;">${(currentLanguage === 'hindi') ? 'विस्तृत AI विश्लेषण प्राप्त करने में विफल। मूल परिणाम प्रदर्शित किए जा रहे हैं।' : 'Failed to get detailed AI analysis. Displaying basic results.'}</p>`;
            let score = 0;
            userAnswers.forEach((answer) => { if (answer.selectedAnswer === answer.correctAnswer) score++; });
            scoreDisplay.textContent = `${(currentLanguage === 'hindi' ? 'आपने' : 'You scored')} ${score} ${(currentLanguage === 'hindi' ? 'में से' : 'out of')} ${currentQuiz.length}${(currentLanguage === 'hindi' ? ' प्रश्न सही किए!' : '!')}`;
        }
        startQuizBtn.textContent = (currentLanguage === 'hindi') ? 'क्विज़ प्रारंभ करें' : 'Start Quiz';
        updateStartButtonState();
    }
    restartQuizBtn.addEventListener('click', () => {
        resultAreaDiv.style.display = 'none';
        quizSetupDiv.style.display = 'block';
        subjectSelect.value = '';
        chapterSelect.innerHTML = '<option value="">-- Select Chapter --</option>';
        chapterSelect.disabled = true;
        questionLimitInput.value = 10;
        stylePromptInput.value = ''; // Clear the prompt on restart
        updateLanguageDisplay();
    });

    populateChapterSelect();
    updateStartButtonState();
});