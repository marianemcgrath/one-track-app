// AJAX calls to the Flask API
const API_BASE = "https://marirmcgrath.pythonanywhere.com";


// Session management

let CURRENT_USER = null;
let sessionReady = initUser();

// Check logged-in session

async function initUser() {

    try {

        const res = await fetch(
            `${API_BASE}/api/current-user`,
            {
                credentials: "include"
            }
        );

        if (!res.ok) {
            console.log("No active session");
            CURRENT_USER = null;
            return null;
        }

        const user = await res.json();

        CURRENT_USER = user;
        console.log(
            "Logged in as:",
            CURRENT_USER.username
        );

        return CURRENT_USER;

    } catch (err) {
        console.error(
            "initUser:",
            err.message
        );

        CURRENT_USER = null;

        return null;
    }
}


// User functions

async function addUser(
    username,
    email,
    password
) {

    try {
        const res = await fetch(
            `${API_BASE}/api/user`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(
                data.error || "Failed to add user"
            );
        }

        return data;

    } catch (err) {
        console.error(
            "addUser:",
            err.message
        );

        throw err;
    }
}

// Login function

async function loginUser(
    email,
    password
) {
    try {
        const res = await fetch(
            `${API_BASE}/api/login`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );
        const data = await res.json();
        if (!res.ok) {
            throw new Error(
                data.error || "Login failed"
            );
        }
        CURRENT_USER = data.user;
        return data.user;
    } catch (err) {
        console.error(
            "loginUser:",
            err.message
        );

        throw err;
    }
}

// Logout function

async function logoutUser() {
    try {
        await fetch(
            `${API_BASE}/api/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        CURRENT_USER = null;
        window.location.href = "index.html";

    } catch (err) {

        console.error(
            "logoutUser:",
            err.message
        );
    }
}

// Habit functions
async function getActiveHabit() {
  try {
    const res = await fetch(`${API_BASE}/api/habit`, {
    credentials: "include"});
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get habit");
    return data.habit; // null if none active
  } catch (err) {
    console.error("getActiveHabit:", err.message);
    return null;
      }
    }

async function addHabit(name, startDate, costPerDay, reason = ""){
  try {
    const res = await fetch(`${API_BASE}/api/habit`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      credentials: "include",
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
      method: "DELETE",
      credentials: "include"
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