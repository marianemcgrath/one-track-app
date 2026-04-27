// OneTrack — Dashboard JavaScript

const USER_ID = 1;
let currentHabit = null;

// Initialise

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    wireAddHabitForm();
    wireEditHabit();
    wireAddMilestoneForm();
    wireAddRewardForm();

    // Habit dropdown - show text input if Other is selected
    document.getElementById("habit-name").addEventListener("change", function () {
        const otherInput = document.getElementById("habit-name-other");
        otherInput.style.display = this.value === "Other" ? "block" : "none";
        if (this.value !== "Other") otherInput.value = "";
    });
});

async function loadDashboard() {
    try {const habit = await getActiveHabit(USER_ID);
        if (habit) {
            currentHabit = habit;
            showActiveHabit(habit);}
            else {showNoHabit();}} 
    catch (err) {showError("loading-msg", "Could not load dashboard. Is the server running?");}
}

// State rendering

function showNoHabit() {
    hide("loading-msg");
    show("no-habit-section");
    hide("active-habit-section");
}