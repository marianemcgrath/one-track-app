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
