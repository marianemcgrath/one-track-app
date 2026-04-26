// AJAX calls to the Flask API

const API_BASE = "http://127.0.0.1:5000";

//------User functions-----------------------------------

async function addUser(username, email, password) {
  try {const res = await fetch(`${API_BASE}/api/user`, 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add user");
    return data;} catch (err)

//------Habit functions----------------------------------

//------Reward functions---------------------------------

//------Milestone functions------------------------------

//------AI Support functions-----------------------------
