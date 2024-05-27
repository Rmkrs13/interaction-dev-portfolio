const startBtn = document.getElementById('start-btn');
const quizScreen = document.getElementById('quiz-screen');
const startScreen = document.getElementById('start-screen');
const endScreen = document.getElementById('end-screen');
const questionElement = document.getElementById('question');
const spokenTextElement = document.getElementById('spoken-text');
const skipBtn = document.getElementById('skip-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById('score');
const questionNumberElement = document.getElementById('question-number');
const totalQuestionsElement = document.getElementById('total-questions');
const currentScoreElement = document.getElementById('current-score');
const correctAnswersElement = document.getElementById('correct-answers');
const incorrectAnswersElement = document.getElementById('incorrect-answers');
const retryCorrectAnswersElement = document.getElementById('retry-correct-answers');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let retry = false;
let correctAnswers = 0;
let incorrectAnswers = 0;
let retryCorrectAnswers = 0;

fetch('data/questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        totalQuestionsElement.textContent = questions.length;
    });

startBtn.addEventListener('click', startQuiz);
skipBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartQuiz);

function startQuiz() {
    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    retryCorrectAnswers = 0;
    nextQuestion();
}

function restartQuiz() {
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

function nextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    retry = false;
    const currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;
    spokenTextElement.textContent = '';
    questionNumberElement.textContent = currentQuestionIndex + 1;
    currentScoreElement.textContent = score;

    speakQuestion(currentQuestion.question);
}

function endQuiz() {
    quizScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    scoreElement.textContent = score;
    correctAnswersElement.textContent = correctAnswers;
    incorrectAnswersElement.textContent = incorrectAnswers;
    retryCorrectAnswersElement.textContent = retryCorrectAnswers;
}

function speakQuestion(question) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = 'nl-NL';
    synth.speak(utterance);

    utterance.onend = () => {
        startRecognition();
    };
}

function startRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'nl-NL';
    recognition.start();

    recognition.onresult = event => {
        const transcript = event.results[0][0].transcript;
        spokenTextElement.textContent = transcript;
        checkAnswer(transcript);
    };

    recognition.onerror = event => {
        console.error(event.error);
    };
}

function checkAnswer(answer) {
    const currentQuestion = questions[currentQuestionIndex];
    if (answer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
        if (retry) {
            score += 1;
            retryCorrectAnswers += 1;
        } else {
            score += 2;
            correctAnswers += 1;
        }
        currentQuestionIndex++;
        nextQuestion();
    } else {
        if (retry) {
            score -= 1;
            incorrectAnswers += 1;
            currentQuestionIndex++;
            nextQuestion();
        } else {
            retry = true;
            speakQuestion("Probeer opnieuw.");
        }
    }
}