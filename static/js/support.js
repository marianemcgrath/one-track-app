// OneTrack — support.js

const USER_ID = 1;

let habitContext = null;

// Initialise

document.addEventListener('DOMContentLoaded', async () => {
    await sessionReady;  // Critical: wait for USER_ID
    
    const setBtn = document.getElementById('set-milestone-btn');
    if (setBtn) {
        setBtn.addEventListener('click', addMilestone);
    }
    loadMilestones();
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

        document.getElementById("pill-text").textContent =
            `${habit.name}`;

        startLiveTimer(habit.start_date);

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

    setTimeout(() => {

    const reply = generateSupportReply(text);

    appendMessage("ai", reply);

    setLoading(false);

}, 700);
}

function generateSupportReply(message) {

    const text = message.toLowerCase();

    const daysElapsed =
        calcDaysElapsed(habitContext.start_date);

    const moneySaved =
        (daysElapsed * habitContext.cost_per_day).toFixed(2);

    if (text.includes("motivate")) {

        return `You're already ${daysElapsed} days into your journey — that's real progress. Every craving you resist is proof you're changing your life for the better 💛`;
    }

    if (text.includes("craving")) {

        return `Cravings usually peak and fade within a few minutes. Try distracting yourself briefly, drinking water, or taking a short walk. You've already come too far to reset now.`;
    }

    if (text.includes("stats")) {

        return `You've been smoke-free for ${daysElapsed} days and already saved €${moneySaved}. That's meaningful progress — both physically and financially.`;
    }

    if (text.includes("stress")) {

        return `Stress can make old habits feel comforting, but your brain is learning healthier coping patterns now. Progress isn't about perfection — it's about continuing.`;
    }

    if (text.includes("relapse")) {

    return `One setback does not erase your progress. Recovery is messy sometimes, but what matters most is getting back on track instead of giving up entirely.`;
    }

    if (text.includes("anxious")) {

        return `Anxiety can feel intense during habit change because your brain is adjusting. Try slowing things down for a few minutes and focus only on getting through today, not forever.`;
    }

    if (text.includes("body")) {

        return `Your body is already recovering from ${habitContext.name.toLowerCase()}. Circulation, lung function, sleep, and energy levels can all gradually improve over time.`;
    }
        return `You're doing better than you think. Recovery isn't linear, but every day away from ${habitContext.name.toLowerCase()} is a win worth recognising 💛`;
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

        thinking.textContent = "OneTrack Coach is typing...";

        document.getElementById("chat-window")
            .appendChild(thinking);

    } else if (!isLoading && existing) {

        existing.remove();
    }

    const chat = document.getElementById("chat-window");

    chat.scrollTop = chat.scrollHeight;
}

// Live timer

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

// Helpers

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