// AJAX calls to the Flask API
const API_BASE = "https://mariRmcgrath.pythonanywhere.com";


// User ID management
let USER_ID = null;
let sessionReady = initUser();

async function initUser() {

    const storedUser =
        localStorage.getItem("activeUserId");

    if (storedUser) {

        USER_ID = parseInt(storedUser);

        console.log(
            "Active user loaded:",
            USER_ID
        );

        return USER_ID;
    }

    USER_ID = null;

    console.log("No active user selected");

    return null;
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

// Helper: Calculate days elapsed since start date
function getDaysElapsed(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}