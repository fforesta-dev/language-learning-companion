import { getFavorites } from "../favorites.mjs";
import { getQuizStats, getQuizHistory } from "../quiz.mjs";

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[ch] || ch;
  });
}

export async function renderProgress(viewRoot) {
  const favorites = getFavorites();
  const quizStats = getQuizStats();
  const quizHistory = getQuizHistory();

  const recentQuizzes = quizHistory
    .slice(-10)
    .reverse()
    .map((quiz) => {
      const date = new Date(quiz.completedAt);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const scoreColor = quiz.percentage >= 80 ? "#27ae60" : quiz.percentage >= 60 ? "#f39c12" : "#e74c3c";

      return `
        <div class="progress-quiz-item">
          <div>
            <p><strong>${dateStr}</strong> at ${timeStr}</p>
            <p class="meta">${quiz.total} questions</p>
          </div>
          <p style="color: ${scoreColor}; font-weight: 600; font-size: 18px;">${quiz.percentage}%</p>
        </div>
      `;
    })
    .join("");

  viewRoot.innerHTML = `
    <section class="progress-view">
      <article class="card">
        <h2>Your Progress</h2>
        
        <div class="progress-stats">
          <div class="stat-card">
            <p class="stat-value">${favorites.length}</p>
            <p class="stat-label">Words Saved</p>
          </div>
          
          <div class="stat-card">
            <p class="stat-value">${quizStats.totalQuizzes}</p>
            <p class="stat-label">Quizzes Completed</p>
          </div>
          
          <div class="stat-card">
            <p class="stat-value">${quizStats.totalQuestionsAnswered}</p>
            <p class="stat-label">Questions Answered</p>
          </div>
          
          <div class="stat-card">
            <p class="stat-value">${quizStats.averageScore}%</p>
            <p class="stat-label">Average Score</p>
          </div>
          
          <div class="stat-card">
            <p class="stat-value">${quizStats.bestScore}%</p>
            <p class="stat-label">Best Score</p>
          </div>
        </div>
      </article>

      ${quizHistory.length > 0
      ? `
            <article class="card">
              <h3>Recent Quiz History</h3>
              <div class="progress-quiz-list">
                ${recentQuizzes}
              </div>
            </article>
          `
      : `
            <article class="card">
              <h3>Recent Quiz History</h3>
              <p class="meta">No quizzes completed yet. Start a quiz to track your progress!</p>
            </article>
          `
    }
    </section>
  `;
}