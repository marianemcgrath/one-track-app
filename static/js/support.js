// OneTrack — Support Page (Coach)

console.log("support.js loaded");

let supportHabit = null;
let timerInterval = null;

// Initialise

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof sessionReady !== 'undefined') {
        await sessionReady;
    }
    await loadSupportHabit();
    wireSupportMessages();
    displayDailyEncouragement();
    startLiveTimer();

    const logoutBtn =
        document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener(
            "click",
            logoutUser
        );
    }
});

// Load Habit and Stats

async function loadSupportHabit() {

    try {
        await sessionReady;
        if (!CURRENT_USER) {
            console.log("No logged-in user");
            document.getElementById(
                "loading-msg"
            ).style.display = "none";
            document.getElementById(
                "no-habit-msg"
            ).style.display = "block";
            return;
        }

        supportHabit = await getActiveHabit();
        const habitNameSpan =
            document.getElementById("pill-text");
        if (habitNameSpan) {
            habitNameSpan.textContent =
                supportHabit
                    ? supportHabit.name
                    : "No active habit";
        }

        // Hide Loading

        document.getElementById(
            "loading-msg"
        ).style.display = "none";

        // No Habit

        if (!supportHabit) {
            document.getElementById(
                "no-habit-msg"
            ).style.display = "block";
            return;
        }

        // Show Support UI

        document.getElementById(
            "support-wrap"
        ).style.display = "flex";

        // Initial welcome message

        const stats =
            await getCurrentStats();
        addChatMessage(
            "support",
            `Welcome back. You're ${stats.days} days free from ${stats.habitName}. How are you feeling today?`
        );
    } catch (err) {
        console.error(
            "loadSupportHabit error:",
            err
        );
    }
}


// Wire imputs and buttons
function wireSupportMessages() {
    const sendBtn =
        document.getElementById("send-btn");
    const messageInput =
        document.getElementById("chat-input");
    if (sendBtn) {
        sendBtn.addEventListener(
            "click",
            sendMessage
        );
    }

    if (messageInput) {
        messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}


// Send Message and Generate Response
async function sendMessage() {

    const input =
        document.getElementById("chat-input");
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;
    addChatMessage("user", message);
    input.value = "";
    showTypingIndicator();
    setTimeout(async () => {
        hideTypingIndicator();
        const stats = await getCurrentStats();
        const response =
            generateSupportResponse(message, stats);
        addChatMessage("support", response);
    }, 600);
}

function sendQuick(text) {
    const input =
        document.getElementById("chat-input");
    input.value = text;
    sendMessage();
}


// Current Stats Calculation
async function getCurrentStats() {
    if (!supportHabit) return null;
    const timeElapsed =
        getTimeElapsed(supportHabit.start_date);
    const daysElapsed = timeElapsed.days;
    const moneySaved =
        (daysElapsed *
            supportHabit.cost_per_day
        ).toFixed(2);

    return {
        habitName: supportHabit.name,
        days: daysElapsed,
        hours: timeElapsed.hours,
        minutes: timeElapsed.minutes,
        money: moneySaved,
        startDate: supportHabit.start_date
    };
}


// Support Response Generation
function generateSupportResponse(message, stats) {
    const lowerMsg = message.toLowerCase();
    const habitName =
        stats?.habitName || "your habit";

    // STRUGGLING
    if (
        lowerMsg.includes("struggl") ||
        lowerMsg.includes("hard") ||
        lowerMsg.includes("difficult")
    ) {
        const responses = [
            `I hear you. Breaking ${habitName} is difficult, but you've already made it ${stats?.days || 0} days. That's real progress. 💪`,
            `Struggling doesn't mean failing. It means you're pushing through change. One hour at a time.`,
            `This feeling will pass. Every urge resisted weakens the old habit loop.`,
            `You've already survived every difficult day so far. You can survive this one too.`
        ];
        return randomReply(responses);
    }

    
    // MOTIVATION
    if (
        lowerMsg.includes("motivate") ||
        lowerMsg.includes("encourag") ||
        lowerMsg.includes("keep going") ||
        lowerMsg.includes("inspiring")
    ) {

        const responses = [
            `You're already ${stats?.days || 0} days free from ${habitName}. That's huge progress.`,
            `€${stats?.money || 0} saved already. Your future self will thank you.`,
            `You're building freedom one day at a time. Keep going. 🎯`,
            `The hardest days are usually at the beginning — and you've already made it this far.`
        ];
        return randomReply(responses);
    }

    // STATS
        if (
        lowerMsg.includes("stats") ||
        lowerMsg.includes("progress") ||
        lowerMsg.includes("how am i doing")
    ) {
        if (!stats) {

            return `
Create a habit first on the Dashboard
and then I can track your progress.
            `;
        }

        return `
📊 Your Progress

• ${stats.days} days
• ${stats.hours} hours
• ${stats.minutes} minutes
• €${stats.money} saved

🎯 ${Math.min(
            100,
            Math.floor((stats.days / 28) * 100)
        )}% of your 28-day goal completed.
        `;
    }


    // BODY / RECOVERY
    if (
        lowerMsg.includes("body") ||
        lowerMsg.includes("recovery") ||
        lowerMsg.includes("health") ||
        lowerMsg.includes("healing")
    ) {
        return getRecoveryMessage(stats?.days || 0);
    }


    // CRAVINGS
    if (
        lowerMsg.includes("craving") ||
        lowerMsg.includes("urge") ||
        (
            lowerMsg.includes("want to") &&
            (
                lowerMsg.includes("give in") ||
                lowerMsg.includes("relapse")
            )
        )
    ) {

        const responses = [
            `Urges usually peak and fade within a few minutes. Breathe slowly and let it pass.`,
            `Try changing your environment for five minutes — even standing outside can help.`,
            `The urge will pass whether you act on it or not. Let it pass without giving in.`,
            `Drink some water, stretch, or walk for a minute. Cravings lose power when you interrupt them.`
        ];

        return randomReply(responses);
    }


    // BOREDOM
    if (
        lowerMsg.includes("bored") ||
        lowerMsg.includes("nothing to do")
    ) {
        const responses = [
            `Boredom is a common trigger. Try movement, music, or a quick distraction task.`,
            `Changing your environment can help reset your brain. Step outside for a minute.`,
            `Your brain is looking for stimulation. Replace the old habit with something healthier.`
        ];
        return randomReply(responses);
    }

    // STRESS / ANXIETY
    if (
        lowerMsg.includes("stress") ||
        lowerMsg.includes("anxious") ||
        lowerMsg.includes("worry")
    ) {
        const responses = [
            `Take five slow breaths. In for 4 seconds. Out for 6 seconds.`,
            `Stress is temporary. The habit only masks it briefly — it doesn't solve it.`,
            `Try a short break away from screens and noise. Your nervous system needs calm.`
        ];

        return randomReply(responses);
    }

    // RELAPSE

    if (
        lowerMsg.includes("relapse") ||
        lowerMsg.includes("slipped") ||
        lowerMsg.includes("failed") ||
        lowerMsg.includes("mess up")
    ) {
        const responses = [
            `One difficult moment does not erase your progress.`,
            `Recovery is not perfection. What matters is getting back on track quickly.`,
            `You've still learned and improved. Keep moving forward.`
        ];
        return randomReply(responses);
    }


    // DEFAULT
    const defaults = [
        `You're doing well with ${habitName}. How can I support you today?`,
        `Remember — every day away from ${habitName} is progress.`,
        `Type "stats", "motivate", or "struggling" if you need support.`,
        `OneTrack Coach is here whenever you need support. 💛`
    ];

    return randomReply(defaults);
}

// RECOVERY TIMELINE
function getRecoveryMessage(days) {
    if (days < 1) {
        return `
Your body has already started recovering.

Heart rate and oxygen levels begin stabilising
within the first 24 hours.
        `;
    }

    if (days < 7) {

        return `
The first week is often the toughest.

Your body is adjusting to life without the habit,
and cravings may still feel strong — but this phase passes.
        `;
    }
    if (days < 14) {
        return `
By week two many people notice:

• clearer thinking
• better sleep
• improved energy
• fewer automatic cravings

You're making real progress.
        `;
    }
    if (days < 28) {

        return `
You're now building long-term habit change.

The old routines are weakening,
and healthier patterns are becoming stronger.
        `;
    }

    return `
🎉 You've passed 28 days.

You've built serious momentum and proven
that change is possible. Protect your progress.
    `;
}


// Chat UI Functions

function addChatMessage(sender, text) {

    const messagesContainer =
        document.getElementById("chat-window");
    if (!messagesContainer) return;
    const messageDiv =
        document.createElement("div");
    messageDiv.className =
    sender === "user"
        ? "msg user"
        : "msg ai";
    messageDiv.innerHTML = `
        <p>
            ${escapeHtml(text).replace(/\n/g, "<br>")}
        </p>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const container =
        document.getElementById("chat-window");
    if (!container) return;
    const typingDiv =
        document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className =
        "msg ai";
    typingDiv.innerHTML = `
        <p>
            Coach is typing...
        </p>
    `;

    container.appendChild(typingDiv);
    container.scrollTop =
        container.scrollHeight;
}

function hideTypingIndicator() {
    const typing =
        document.getElementById("typing-indicator");
    if (typing) {
        typing.remove();
    }
}


// Daily Encouragement

function displayDailyEncouragement() {
    const messages = [
        "💪 Every day without the habit is a victory.",
        "🌟 You're stronger than today's urges.",
        "🎯 One day at a time.",
        "💰 You're saving money and improving your health.",
        "🧠 Your brain is learning new patterns.",
        "🏆 Small wins become major life changes."
    ];
    const encouragementDiv =
        document.getElementById(
            "daily-encouragement"
        );
    if (encouragementDiv) {
        encouragementDiv.textContent =
            randomReply(messages);
    }
}

// Live Timer
function startLiveTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    updateLiveTimer();
    timerInterval = setInterval(
        updateLiveTimer,
        60000
    );
}

async function updateLiveTimer() {
    if (!supportHabit) return;
    const stats = await getCurrentStats();
    const timer =
        document.getElementById("live-timer");
    if (!timer) return;
    timer.textContent =
        `${stats.days}d ${stats.hours}h ${stats.minutes}m free`;
}


// Utilities
function randomReply(arr) {
    return arr[
        Math.floor(Math.random() * arr.length)
    ];
}
function getTimeElapsed(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffMs = now - start;
    const days =
        Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours =
        Math.floor(
            (diffMs % 86400000) /
            (1000 * 60 * 60)
        );
    const minutes =
        Math.floor(
            (diffMs % 3600000) /
            (1000 * 60)
        );
    return {
        days,
        hours,
        minutes
    };
}
function getDaysElapsed(startDate) {
    return getTimeElapsed(startDate).days;
}
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}