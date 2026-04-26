// AJAX calls to the Flask API

const API_BASE = "http://127.0.0.1:5000";

//------User functions-----------------------------------

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

//------Habit functions----------------------------------

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
      body: JSON.stringify(fields) // pass only what changed: { name, cost_per_day, reason }
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

//------Reward functions---------------------------------

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


//------Milestone functions------------------------------

async function addMilestone(habitId, daysRequired, label) {
  try {
    const res = await fetch(`${API_BASE}/api/milestone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habit_id: habitId,
        days_required: daysRequired,
        label
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add milestone");
    return data.milestone;
  } catch (err) {
    console.error("addMilestone:", err.message);
    throw err;
  }
}

async function achieveMilestone(milestoneId) {
  try {
    const res = await fetch(`${API_BASE}/api/milestone/${milestoneId}/achieve`, {
      method: "PATCH"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to achieve milestone");
    return data;
  } catch (err) {
    console.error("achieveMilestone:", err.message);
    throw err;
  }
}
