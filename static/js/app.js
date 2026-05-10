// AJAX calls to the Flask API
const API_BASE = "https://mariRmcgrath.pythonanywhere.com";


// User ID management
let USER_ID = null;
let sessionReady = initSession();  // Start loading session

async function initSession() {
    const res = await fetch(`${API_BASE}/api/session`);
    const data = await res.json();
    USER_ID = data.user_id;
    console.log('Session ready, USER_ID:', USER_ID);
    return USER_ID;
}

// User functions
async function addUser(username, email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add user");
    return data;
  } catch (err) {
    console.error("addUser:", err.message);
    throw err;
  }
}

// Habit functions
async function getActiveHabit(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/habit?user_id=${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get habit");
    return data.habit; // null if none active
  } catch (err) {
    console.error("getActiveHabit:", err.message);
    return null; // Return null instead of throwing
  }
}

async function addHabit(userId, name, startDate, costPerDay, reason = "") {
  try {
    const res = await fetch(`${API_BASE}/api/habit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        name,
        start_date: startDate,
        cost_per_day: costPerDay,
        reason
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add habit");
    return data.habit;
  } catch (err) {
    console.error("addHabit:", err.message);
    throw err;
  }
}

async function updateHabit(habitId, fields = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/habit/${habitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update habit");
    return data.habit;
  } catch (err) {
    console.error("updateHabit:", err.message);
    throw err;
  }
}

async function deleteHabit(habitId) {
  try {
    const res = await fetch(`${API_BASE}/api/habit/${habitId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete habit");
    return data;
  } catch (err) {
    console.error("deleteHabit:", err.message);
    throw err;
  }
}

// Reward functions
async function addReward(habitId, title, daysTarget) {
  try {
    const res = await fetch(`${API_BASE}/api/reward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habit_id: habitId,
        title,
        days_target: daysTarget
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add reward");
    return data.reward;
  } catch (err) {
    console.error("addReward:", err.message);
    throw err;
  }
}

async function claimReward(rewardId) {
  try {
    const res = await fetch(`${API_BASE}/api/reward/${rewardId}/claim`, {
      method: "PATCH"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to claim reward");
    return data;
  } catch (err) {
    console.error("claimReward:", err.message);
    throw err;
  }
}

async function deleteReward(rewardId) {
  try {
    const res = await fetch(`${API_BASE}/api/reward/${rewardId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete reward");
    return data;
  } catch (err) {
    console.error("deleteReward:", err.message);
    throw err;
  }
}

// Helper: Calculate days elapsed since start date
function getDaysElapsed(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

// Milestone functions
async function addMilestone() {
  const weekSelect = document.getElementById('milestone-week');
  const daysTarget = parseInt(weekSelect.value);
  const rewardInput = document.getElementById('reward-prize');
  const title = rewardInput.value.trim();

  if (!title) {
    showMessage('Please enter a reward for your milestone!', 'error');
    return;
  }

  const habit = await getActiveHabit(USER_ID);
  if (!habit) {
    showMessage('Please create a habit first', 'error');
    return;
  }

  try {
    await addReward(habit.id, title, daysTarget);
    showMessage(`🎉 Milestone set: ${title} at ${daysTarget} days`, 'success');
    rewardInput.value = '';
    loadMilestones();
  } catch (error) {
    console.error('Error setting milestone:', error);
    showMessage(error.message, 'error');
  }
}

// Main loadMilestones function (only ONE definition)
async function loadMilestones() {
  const habit = await getActiveHabit(USER_ID);
  if (!habit) return;

  const container = document.getElementById('milestones-container');
  if (!container) {
    console.warn('Milestones container not found on this page');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/reward?habit_id=${habit.id}`);
    const milestones = await response.json();

    // Sort by days target
    milestones.sort((a, b) => a.days_target - b.days_target);
    const currentDays = getDaysElapsed(habit.start_date);

    container.innerHTML = milestones.map(milestone => {
      const weekNumber = milestone.days_target / 7;
      const weekName = weekNumber === 1 ? 'Week 1' : `Week ${weekNumber}`;
      const isClaimed = milestone.claimed === 1;
      const isAchieved = currentDays >= milestone.days_target && !isClaimed;

      return `
        <div class="milestone-card ${isClaimed ? 'claimed' : ''} ${isAchieved ? 'achieved' : ''}">
          <div class="milestone-header">
            <span class="milestone-week">${weekName}</span>
            <span class="milestone-days">(${milestone.days_target} days)</span>
          </div>
          <div class="milestone-reward">🎁 ${escapeHtml(milestone.title)}</div>
          <div class="milestone-status">
            ${
              isClaimed
                ? '✅ Claimed!'
                : isAchieved
                  ? `<button onclick="claimMilestone(${milestone.id})" class="claim-btn">🎉 Claim Your Reward!</button>`
                  : `<span class="pending">🔒 Complete ${milestone.days_target} days to unlock</span>`
            }
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading milestones:', error);
    const container = document.getElementById('milestones-container');
    if (container) container.innerHTML = '<div class="error">Failed to load milestones</div>';
  }
}

async function claimMilestone(rewardId) {
  try {
    await claimReward(rewardId);
    showMessage('🎊 Congratulations! Enjoy your reward! 🎊', 'success');
    loadMilestones();
  } catch (error) {
    console.error('Error claiming milestone:', error);
    showMessage(error.message, 'error');
  }
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('milestone-message');
  if (!messageDiv) return;
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  setTimeout(() => {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load events - wait for session first
document.addEventListener('DOMContentLoaded', async () => {
    await sessionReady;  // CRITICAL: Wait for USER_ID to be set
    
    console.log('DOM ready, USER_ID =', USER_ID);  // Should show 1
    
    const setBtn = document.getElementById('set-milestone-btn');
    if (setBtn) {
        setBtn.addEventListener('click', addMilestone);
    }
    
    // Load dashboard or milestones depending on page
    if (document.getElementById('milestones-container')) {
        loadMilestones();
    }
});