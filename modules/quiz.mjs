/**
 * Quiz management module
 * Handles quiz generation, scoring, and history
 */

const QUIZ_HISTORY_KEY = 'llc-quiz-history';

/**
 * Generate a quiz from favorite words
 * @param {Array<Object>} favorites - Array of favorite word objects
 * @param {number} questionCount - Number of questions to generate
 * @returns {Array<Object>} Array of quiz questions with shuffled options
 */
export function generateQuiz(favorites, questionCount = 5) {
    if (!favorites || favorites.length < 2) {
        throw new Error('Need at least 2 favorites to generate a quiz');
    }

    const maxQuestions = Math.min(questionCount, favorites.length);
    const shuffled = favorites.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, maxQuestions);

    return selected.map((correctWord) => {
        // Get 3 incorrect answers from other favorites
        const incorrectAnswers = favorites
            .filter((fav) => fav.word !== correctWord.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((fav) => ({
                word: fav.word,
                definition: fav.definition,
                correct: false,
            }));

        // Combine correct + incorrect answers
        const allAnswers = [
            {
                word: correctWord.word,
                definition: correctWord.definition,
                correct: true,
            },
            ...incorrectAnswers,
        ];

        // Shuffle answers
        const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

        return {
            word: correctWord.word,
            phonetic: correctWord.phonetic,
            partOfSpeech: correctWord.partOfSpeech,
            question: `What is the definition of "${correctWord.word}"?`,
            answers: shuffledAnswers,
            correctAnswer: correctWord.definition,
        };
    });
}

/**
 * Score quiz answers
 * @param {Array<Object>} questions - Array of quiz questions
 * @param {Array<string>} userAnswers - Array of user's selected definitions (index-matched to questions)
 * @returns {Object} Score result with score, total, and details
 */
export function scoreQuiz(questions, userAnswers) {
    let score = 0;
    const details = [];

    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;

        if (isCorrect) {
            score++;
        }

        details.push({
            word: question.word,
            userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
        });
    });

    return {
        score,
        total: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        details,
    };
}

/**
 * Get quiz history from localStorage
 * @returns {Array<Object>} Array of past quiz results
 */
export function getQuizHistory() {
    try {
        const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Save quiz result to history
 * @param {Object} result - Quiz result object (score, total, percentage, etc.)
 * @returns {boolean} True if saved successfully
 */
export function saveQuizResult(result) {
    try {
        const history = getQuizHistory();
        history.push({
            ...result,
            completedAt: new Date().toISOString(),
        });
        localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(history));
        return true;
    } catch {
        return false;
    }
}

/**
 * Clear all quiz history
 * @returns {boolean} True if cleared successfully
 */
export function clearQuizHistory() {
    try {
        localStorage.removeItem(QUIZ_HISTORY_KEY);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get quiz statistics
 * @returns {Object} Stats including total quizzes, average score, etc.
 */
export function getQuizStats() {
    const history = getQuizHistory();

    if (history.length === 0) {
        return {
            totalQuizzes: 0,
            averageScore: 0,
            bestScore: 0,
            totalQuestionsAnswered: 0,
        };
    }

    const totalQuestionsAnswered = history.reduce((sum, quiz) => sum + quiz.total, 0);
    const totalScore = history.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = Math.round((totalScore / totalQuestionsAnswered) * 100);
    const bestScore = Math.max(...history.map((quiz) => quiz.percentage));

    return {
        totalQuizzes: history.length,
        averageScore,
        bestScore,
        totalQuestionsAnswered,
    };
}
