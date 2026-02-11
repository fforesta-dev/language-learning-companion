import { getFavorites, clearFavorites } from "../favorites.mjs";
import { getQuizStats, getQuizHistory, clearQuizHistory } from "../quiz.mjs";

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
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--border);">
          <div>
            <p style="margin: 0 0 4px; font-weight: 600; color: var(--text);">${dateStr} at ${timeStr}</p>
            <p style="margin: 0; font-size: 13px; color: var(--muted);">${quiz.total} questions</p>
          </div>
          <p style="color: ${scoreColor}; font-weight: 700; font-size: 20px; margin: 0;">${quiz.percentage}%</p>
        </div>
      `;
    })
    .join("");

  viewRoot.innerHTML = `
    <section>
      <!-- Stats Card -->
      <div class="progress-stats-card">
        <h2>Your Progress</h2>
        
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">${favorites.length}</div>
            <div class="stat-label">Words Saved</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-value">${quizStats.totalQuizzes}</div>
            <div class="stat-label">Quizzes Completed</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-value">${quizStats.totalQuestionsAnswered}</div>
            <div class="stat-label">Questions Answered</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-value">${quizStats.averageScore}%</div>
            <div class="stat-label">Average Score</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-value">${quizStats.bestScore}%</div>
            <div class="stat-label">Best Score</div>
          </div>
        </div>
      </div>

      <!-- Reset Actions Card -->
      <div class="progress-actions-card">
        <button class="reset-btn" id="resetProgressBtn" type="button">
          Reset All Progress
        </button>
        <span class="reset-warning">
          This will clear all saved words and quiz history. This cannot be undone.
        </span>
      </div>

      <!-- Quiz History Card -->
      <div class="quiz-history-card">
        <h2>Recent Quiz History</h2>
        ${quizHistory.length > 0
          ? `<div style="margin-top: 16px;">${recentQuizzes}</div>`
          : `<div class="empty-state"><p>No quizzes completed yet. Start a quiz to track your progress!</p></div>`
        }
      </div>
    </section>
  `;

  // Reset all progress button
  const resetBtn = viewRoot.querySelector("#resetProgressBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset ALL progress?\n\nThis will delete:\n• All saved favorite words\n• All quiz history and stats\n\nThis action cannot be undone.")) {
        clearFavorites();
        clearQuizHistory();
        // Also clear daily cache
        localStorage.removeItem('llc-daily');
        renderProgress(viewRoot);
      }
    });
  }
}
