// AJAX calls to the Flask API

const API_BASE = "https://mariRmcgrath.pythonanywhere.com";

//User functions

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

//Habit functions

async function getActiveHabit(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/habit?user_id=${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get habit");
    return data.habit; // null if none active
  } catch (err) {
    console.error("getActiveHabit:", err.message);
    throw err;
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
      body: JSON.stringify(fields) // only what changed: { name, cost_per_day, reason }
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

//Reward functions

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


//Milestone functions

// Milestone functions

async function addMilestone() {
    const weekSelect = document.getElementById('milestone-week');
    const daysTarget = parseInt(weekSelect.value);
    
    const rewardInput = document.getElementById('reward-prize');
    const title = rewardInput.value.trim();
    
    const messageDiv = document.getElementById('milestone-message');
    
    // Validation
    if (!title) {
        showMessage('Please enter a reward for your milestone!', 'error');
        return;
    }
    
    // Get current habit
    const habit = await getActiveHabit(USER_ID);
    if (!habit) {
        showMessage('Please create a habit first', 'error');
        return;
    }
    
    // Map days to week display
    const weekNumber = daysTarget / 7;
    const weekText = weekNumber === 1 ? 'Week 1' : `Week ${weekNumber}`;
    
    try {
        const response = await fetch('/api/reward', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                habit_id: habit.id,
                title: title,
                days_target: daysTarget
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to set milestone');
        }
        
        // Success
        showMessage(`🎉 Milestone set: ${weekText} - ${title}`, 'success');
        rewardInput.value = ''; // Clear input
        loadMilestones(); // Refresh the list
        
    } catch (error) {
        console.error('Error setting milestone:', error);
        showMessage(error.message, 'error');
    }
}

async function loadMilestones() {
    const habit = await getActiveHabit(USER_ID);
    if (!habit) return;
    
    try {
        const response = await fetch(`/api/rewards?habit_id=${habit.id}`);
        const milestones = await response.json();
        
        const container = document.getElementById('milestones-container');
        
        if (!milestones || milestones.length === 0) {
            container.innerHTML = '<p class="no-milestones">No milestones set yet. Create your first milestone above!</p>';
            return;
        }
        
        // Sort by days_target
        milestones.sort((a, b) => a.days_target - b.days_target);
        
        container.innerHTML = milestones.map(milestone => {
            const weekNumber = milestone.days_target / 7;
            const weekName = weekNumber === 1 ? 'Week 1' : `Week ${weekNumber}`;
            const isClaimed = milestone.claimed;
            const currentDays = calcDaysElapsed(habit.start_date);
            const isAchieved = currentDays >= milestone.days_target && !isClaimed;
            
            return `
                <div class="milestone-card ${isClaimed ? 'claimed' : ''} ${isAchieved ? 'achieved' : ''}">
                    <div class="milestone-header">
                        <span class="milestone-week">${weekName}</span>
                        <span class="milestone-days">(${milestone.days_target} days)</span>
                    </div>
                    <div class="milestone-reward">🎁 ${escapeHtml(milestone.title)}</div>
                    <div class="milestone-status">
                        ${isClaimed ? 
                            '✅ Claimed!' : 
                            (isAchieved ? 
                                '<button onclick="claimMilestone(' + milestone.id + ')" class="claim-btn">🎉 Claim Your Reward!</button>' : 
                                `<span class="pending">🔒 Complete ${milestone.days_target} days to unlock</span>`
                            )
                        }
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading milestones:', error);
    }
}

async function claimMilestone(rewardId) {
    try {
        const response = await fetch(`/api/reward/${rewardId}/claim`, {
            method: 'PATCH'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to claim reward');
        }
        
        showMessage('🎊 Congratulations! Enjoy your reward! 🎊', 'success');
        loadMilestones(); // Refresh the list
        
    } catch (error) {
        console.error('Error claiming milestone:', error);
        showMessage(error.message, 'error');
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('milestone-message');
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

// Add event listener when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const setBtn = document.getElementById('set-milestone-btn');
    if (setBtn) {
        setBtn.addEventListener('click', addMilestone);
    }
    
    // Load milestones if habit exists
    loadMilestones();
});
