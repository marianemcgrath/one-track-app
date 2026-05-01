// AI Support chat powered by Claude API

const USER_ID = 1;
const API_URL = "https://api.anthropic.com/v1/messages";

let habitContext = null;
let conversationHistory = [];

// Initialise

document.addEventListener("DOMContentLoaded", async () => {
    await loadHabitContext();
    setupInputAutoResize();
    setupEnterToSend();
});

async function loadHabitContext() {
    try {
        const habit = await getActiveHabit(USER_ID);

        hide("loading-msg");

        if (!habit) {
            show("no-habit-msg");
            return;
        }

        habitContext = habit;
        const daysElapsed = calcDaysElapsed(habit.start_date);
        const moneySaved = (daysElapsed * habit.cost_per_day).toFixed(2);

        // Update context pill
        document.getElementById("pill-text").textContent =
            `Day ${daysElapsed} — ${habit.name}`;

        show("support-wrap");

        // Opening message from AI
        appendMessage("ai",
            `Hi! I'm here to support you on your journey. You're on day ${daysElapsed} of breaking your ${habit.name.toLowerCase()} habit — that's real progress. 💛\n\nHow are you feeling today?`
        );

    } catch (err) {
        hide("loading-msg");
        appendMessage("ai", "Couldn't connect to the server. Make sure Flask is running and try again.");
    }
}


// Send message
// Quick send buttons for common prompts
function sendQuick(text) {
    document.getElementById("chat-input").value = text;
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    input.style.height = "44px";

    appendMessage("user", text);
    setLoading(true);

    // Build conversation history
    conversationHistory.push({ role: "user", content: text });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1000,
                system: buildSystemPrompt(),
                messages: conversationHistory
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "API error");
        }

        const reply = data.content[0].text;
        conversationHistory.push({ role: "assistant", content: reply });

        setLoading(false);
        appendMessage("ai", reply);

    } catch (err) {
        setLoading(false);
        appendMessage("ai", "Sorry, I couldn't get a response right now. Try again in a moment.");
        console.error("AI Support error:", err.message);
    }
}

// System prompt builder
// This provides context to the AI about the user's habit-breaking journey, so it can give more personalized and relevant support.
function buildSystemPrompt() {
    if (!habitContext) {
        return `You are a warm, encouraging habit-breaking coach called OneTrack AI. 
                Keep responses concise, human, and supportive.`;
    }

    const daysElapsed = calcDaysElapsed(habitContext.start_date);
    const daysRemaining = Math.max(0, 28 - daysElapsed);
    const moneySaved = (daysElapsed * habitContext.cost_per_day).toFixed(2);
    const milestones = habitContext.milestones || [];
    const achieved = milestones.filter(m => m.achieved).length;

return `You are a warm, encouraging habit-breaking coach called OneTrack AI, built into the OneTrack app.

The user is currently breaking the following habit: ${habitContext.name}.
- They started on: ${habitContext.start_date}
- Days elapsed: ${daysElapsed} out of 28
- Days remaining: ${daysRemaining}
- Money saved so far: €${moneySaved}
- Their reason for quitting: ${habitContext.reason || "not specified"}
- Milestones achieved: ${achieved} out of ${milestones.length}

// ADD GUIDELINES FOR SUPPORTIVE RESPONSES ABOVE;
`;

}

// UI Helpers

// Append message to chat
function appendMessage(sender, text) {
    const chat = document.getElementById("chat");
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

// Set loading state on send button
function setLoading(isLoading) {
    const btn = document.getElementById("send-btn");
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "..." : "Send";
}

// Show/hide elements
function show(id) {
    document.getElementById(id).style.display = "block";
}

// Hide element by ID
function hide(id) {
    document.getElementById(id).style.display = "none";
}

// Input auto-resize and Enter-to-send
function setupInputAutoResize() {
    const input = document.getElementById("chat-input");
    input.addEventListener("input", () => {
        input.style.height = "44px";
        input.style.height = input.scrollHeight + "px";
    });
}

// Send message on Enter key (without Shift)
function setupEnterToSend() {
    const input = document.getElementById("chat-input");
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Utility to calculate days elapsed since start date
function calcDaysElapsed(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.max(0, now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Show/hide elements by ID
function show(id) {
    document.getElementById(id).style.display = "";
}

// Hide element by ID
function hide(id) {
    document.getElementById(id).style.display = "none";
}
