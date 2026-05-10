// OneTrack — support.js
// AI Support chat

const USER_ID = 1;

let habitContext = null;
let conversationHistory = [];

// Initialise

document.addEventListener("DOMContentLoaded", async () => {
    await loadHabitContext();
    setupInputAutoResize();
    setupEnterToSend();
});

// Load habit context

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

        document.getElementById("pill-text").textContent =
            `Day ${daysElapsed} — ${habit.name}`;

        show("support-wrap");

        appendMessage(
            "ai",
            `Hi! I'm here to support you on your journey. You're making real progress breaking your ${habit.name.toLowerCase()} habit. 💛\n\nHow are you feeling today?`
        );

    } catch (err) {

        hide("loading-msg");

        appendMessage(
            "ai",
            "Couldn't connect to the server. Please try again later."
        );

        console.error(err);
    }
}

// Quick prompts

function sendQuick(text) {
    document.getElementById("chat-input").value = text;
    sendMessage();
}

// Send message

async function sendMessage() {

    const input = document.getElementById("chat-input");

    const text = input.value.trim();

    if (!text) return;

    input.value = "";
    input.style.height = "44px";

    appendMessage("user", text);

    setLoading(true);

    conversationHistory.push({
        role: "user",
        content: text
    });

    try {

        const response = await fetch(`/api/support`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: text,
                system_prompt: buildSystemPrompt()
            })
        });

        const data = await response.json();

        setLoading(false);

        if (!response.ok) {

            throw new Error(
                typeof data.error === "string"
                    ? data.error
                    : JSON.stringify(data.error)
            );
        }

        appendMessage("ai", data.reply);

        conversationHistory.push({
            role: "assistant",
            content: data.reply
        });

    } catch (err) {

        setLoading(false);

        console.error("FULL ERROR:", err);

        appendMessage(
            "ai",
            `ERROR: ${err.message}`
        );
    }
}

// Build system prompt

function buildSystemPrompt() {

    if (!habitContext) {
        return `
            You are a warm and supportive AI coach helping users break bad habits.
            Keep responses concise, encouraging, and human.
        `;
    }

    const daysElapsed = calcDaysElapsed(habit.start_date);

    document.getElementById("pill-text").textContent =
        `${habit.name}`;

    startLiveTimer(habit.start_date);

    const daysRemaining = Math.max(0, 28 - daysElapsed);

    const moneySaved =
        (daysElapsed * habitContext.cost_per_day).toFixed(2);

    return `
        You are OneTrack AI, a supportive habit-breaking coach.

        User habit:
        ${habitContext.name}

        Days completed:
        ${daysElapsed}

        Days remaining:
        ${daysRemaining}

        Money saved:
        €${moneySaved}

        User reason:
        ${habitContext.reason || "Not specified"}

        Guidelines:
        - Be encouraging and human
        - Keep replies concise
        - Never sound robotic
        - Offer supportive behavioural advice
        - Celebrate progress naturally
        - Avoid bullet points
    `;
}

// Message rendering

function appendMessage(role, text) {

    const chat = document.getElementById("chat-window");

    const msg = document.createElement("div");

    msg.className = `msg ${role}`;

    msg.textContent = text;

    chat.appendChild(msg);

    chat.scrollTop = chat.scrollHeight;
}


// Loading state

function setLoading(isLoading) {

    const btn = document.getElementById("send-btn");

    btn.disabled = isLoading;

    const existing = document.getElementById("thinking-msg");

    if (isLoading && !existing) {

        const thinking = document.createElement("div");

        thinking.className = "msg ai thinking";

        thinking.id = "thinking-msg";

        thinking.textContent = "Thinking...";

        document.getElementById("chat-window")
            .appendChild(thinking);

    } else if (!isLoading && existing) {

        existing.remove();
    }

    const chat = document.getElementById("chat-window");

    chat.scrollTop = chat.scrollHeight;
}

// Helpers

function startLiveTimer(startDate) {

    function updateTimer() {

        const start = new Date(startDate);

        const now = new Date();

        const diff = now - start;

        const days = Math.floor(
            diff / (1000 * 60 * 60 * 24)
        );

        const hours = Math.floor(
            (diff / (1000 * 60 * 60)) % 24
        );

        const minutes = Math.floor(
            (diff / (1000 * 60)) % 60
        );

        const timer = document.getElementById("live-timer");

        if (timer) {

            timer.textContent =
                `${days} days • ${hours} hours • ${minutes} minutes smoke-free`;
        }
    }

    updateTimer();

    setInterval(updateTimer, 60000);
}

function calcDaysElapsed(startDate) {

    const start = new Date(startDate);

    const today = new Date();

    const diff = Math.floor(
        (today - start) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, diff);
}

function setupInputAutoResize() {

    const input = document.getElementById("chat-input");

    input.addEventListener("input", function () {

        this.style.height = "44px";

        this.style.height =
            Math.min(this.scrollHeight, 120) + "px";
    });
}

function setupEnterToSend() {

    document.getElementById("chat-input")
        .addEventListener("keydown", function (e) {

            if (e.key === "Enter" && !e.shiftKey) {

                e.preventDefault();

                sendMessage();
            }
        });
}

function show(id) {
    document.getElementById(id).style.display = "";
}

function hide(id) {
    document.getElementById(id).style.display = "none";
}