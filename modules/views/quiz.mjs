import { getFavorites } from "../favorites.mjs";
import { generateQuiz, scoreQuiz, saveQuizResult, getQuizStats } from "../quiz.mjs";
import { triggerConfetti } from "../confetti.mjs";

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[ch] || ch;
  });
}

let currentQuiz = null;
let currentAnswers = [];
let currentQuestionIndex = 0;
let quizState = 'start';

function renderStart(viewRoot) {
  const favorites = getFavorites();
  const stats = getQuizStats();

  if (favorites.length < 2) {
    viewRoot.innerHTML = `
      <div class="card">
        <h2>Quiz</h2>
        <p class="meta">You need at least 2 favorite words to start a quiz.</p>
        <p class="meta">Save words from the Daily Word page to build your collection!</p>
      </div>
    `;
    return;
  }

  const statsHtml =
    stats.totalQuizzes > 0
      ? `
        <div class="quiz-stats">
          <h3>Your Stats</h3>
          <ul class="list">
            <li><strong>Quizzes Completed:</strong> ${stats.totalQuizzes}</li>
            <li><strong>Average Score:</strong> ${stats.averageScore}%</li>
            <li><strong>Best Score:</strong> ${stats.bestScore}%</li>
            <li><strong>Total Questions Answered:</strong> ${stats.totalQuestionsAnswered}</li>
          </ul>
        </div>
      `
      : '<p class="meta">No quizzes completed yet. Start your first quiz!</p>';

  viewRoot.innerHTML = `
    <section class="quiz-container">
      <article class="card">
        <h2>Quiz</h2>
        <p class="meta">Test your knowledge with questions based on your favorite words (${favorites.length} available).</p>

        <div class="quiz-settings">
          <label for="questionCount">Number of questions:</label>
          <select id="questionCount" class="select">
            <option value="5">5 Questions</option>
            <option value="10">10 Questions</option>
            <option value="15">15 Questions</option>
            <option value="20">All (${favorites.length})</option>
          </select>
        </div>

        <button class="btn btn--primary" id="startBtn" type="button">Start Quiz</button>
      </article>

      <article class="card">
        ${statsHtml}
      </article>
    </section>
  `;

  viewRoot.querySelector("#startBtn")?.addEventListener("click", () => {
    const questionCount = parseInt(viewRoot.querySelector("#questionCount").value) || 5;
    startQuiz(viewRoot, questionCount);
  });
}

function startQuiz(viewRoot, questionCount) {
  const favorites = getFavorites();

  try {
    currentQuiz = generateQuiz(favorites, questionCount);
    currentAnswers = new Array(currentQuiz.length).fill(null);
    currentQuestionIndex = 0;
    quizState = 'question';
    renderQuestion(viewRoot);
  } catch (err) {
    viewRoot.innerHTML = `
      <div class="card">
        <h3>Error Starting Quiz</h3>
        <p class="meta">${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function renderQuestion(viewRoot) {
  const question = currentQuiz[currentQuestionIndex];
  const selectedAnswer = currentAnswers[currentQuestionIndex];
  const answerLetters = ['A', 'B', 'C', 'D'];

  const answersHtml = question.answers
    .map(
      (answer, index) => `
        <button 
          class="quiz-answer-btn ${selectedAnswer === answer.definition ? 'selected' : ''}" 
          type="button"
          data-answer-index="${index}"
        >
          <span class="answer-letter">${answerLetters[index]}</span>
          <span class="answer-text">${escapeHtml(answer.definition)}</span>
        </button>
      `
    )
    .join("");

  const progressPercent = Math.round(((currentQuestionIndex + 1) / currentQuiz.length) * 100);

  viewRoot.innerHTML = `
    <section class="quiz-container">
      <article class="card">
        <div class="quiz-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <p class="meta">Question ${currentQuestionIndex + 1} of ${currentQuiz.length}</p>
        </div>

        <h3>
          <strong>${escapeHtml(question.word)}</strong>
          ${question.phonetic ? `<span class="meta" style="font-size: 14px;">/${escapeHtml(question.phonetic)}/</span>` : ""}
        </h3>
        <p class="meta" style="font-size: 12px; margin-top: 4px;">${escapeHtml(question.partOfSpeech || "—")}</p>

        <p style="margin: 16px 0; font-weight: 500;">${escapeHtml(question.question)}</p>

        <div class="quiz-answers">
          ${answersHtml}
        </div>

        <div class="quiz-nav" style="margin-top: 24px; display: flex; gap: 12px;">
          ${currentQuestionIndex > 0
      ? `<button class="btn btn--secondary" id="prevBtn" type="button">← Previous</button>`
      : ""
    }
          ${currentQuestionIndex < currentQuiz.length - 1
      ? `<button class="btn btn--primary" id="nextBtn" type="button" ${!selectedAnswer ? "disabled" : ""}>Next →</button>`
      : `<button class="btn btn--primary" id="submitBtn" type="button" ${!selectedAnswer ? "disabled" : ""}>Submit Quiz</button>`
    }
        </div>
      </article>
    </section>
  `;

  // Answer selection
  viewRoot.querySelectorAll(".quiz-answer-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const answerIndex = parseInt(btn.dataset.answerIndex);
      const definition = question.answers[answerIndex].definition;
      currentAnswers[currentQuestionIndex] = definition;
      renderQuestion(viewRoot);
    });
  });

  viewRoot.querySelector("#prevBtn")?.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion(viewRoot);
    }
  });

  viewRoot.querySelector("#nextBtn")?.addEventListener("click", () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
      currentQuestionIndex++;
      renderQuestion(viewRoot);
    }
  });

  viewRoot.querySelector("#submitBtn")?.addEventListener("click", () => {
    submitQuiz(viewRoot);
  });
}

function submitQuiz(viewRoot) {
  const result = scoreQuiz(currentQuiz, currentAnswers);
  saveQuizResult(result);
  quizState = 'results';
  renderResults(viewRoot, result);
}

function renderResults(viewRoot, result) {
  const scoreColor = result.percentage >= 80 ? "#1e8449" : result.percentage >= 60 ? "#f39c12" : "#c0392b";

  const detailsHtml = result.details
    .map(
      (detail) => `
        <div class="quiz-result-item ${detail.isCorrect ? "correct" : "incorrect"}">
          <h4>${escapeHtml(detail.word)}</h4>
          <div>
            <p><strong>Your answer:</strong> <span class="meta">${escapeHtml(detail.userAnswer || "—")}</span></p>
            <p><strong>Correct answer:</strong> <span class="meta">${escapeHtml(detail.correctAnswer)}</span></p>
          </div>
          <p class="result-badge">${detail.isCorrect ? "✓ Correct" : "✗ Incorrect"}</p>
        </div>
      `
    )
    .join("");

  viewRoot.innerHTML = `
    <section class="quiz-container">
      <article class="card">
        <h2>Quiz Complete!</h2>
        
        <div class="quiz-score">
          <div class="score-circle" style="border-color: ${scoreColor};">
            <p class="score-percentage" style="color: ${scoreColor};">${result.percentage}%</p>
            <p class="score-text">${result.score} / ${result.total} correct</p>
          </div>
        </div>

        <div style="margin-top: 24px;">
          <h3>Results</h3>
          <div class="quiz-details">
            ${detailsHtml}
          </div>
        </div>

        <div class="quiz-nav" style="margin-top: 24px; display: flex; gap: 12px;">
          <button class="btn btn--secondary" id="retakeBtn" type="button">Retake Quiz</button>
          <button class="btn btn--primary" id="homeBtn" type="button">Back to Start</button>
        </div>
      </article>
    </section>
  `;

  viewRoot.querySelector("#retakeBtn")?.addEventListener("click", () => {
    quizState = 'start';
    renderStart(viewRoot);
  });

  viewRoot.querySelector("#homeBtn")?.addEventListener("click", () => {
    quizState = 'start';
    renderStart(viewRoot);
  });

  if (result.percentage >= 80) {
    setTimeout(() => {
      triggerConfetti();
    }, 300);
  }
}

export async function renderQuiz(viewRoot) {
  if (quizState === 'start') {
    renderStart(viewRoot);
  } else if (quizState === 'question') {
    renderQuestion(viewRoot);
  } else if (quizState === 'results') {
    quizState = 'start';
    renderStart(viewRoot);
  }
}