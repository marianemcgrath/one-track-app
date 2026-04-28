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

function showActiveHabit(habit) {
    hide("loading-msg");
    hide("no-habit-section");
    show("active-habit-section");

    document.getElementById("habit-name-display").textContent = habit.name;
    document.getElementById("habit-reason-display").textContent = habit.reason || "";

    const daysElapsed = calcDaysElapsed(habit.start_date);
    const daysRemaining = Math.max(0, 28 - daysElapsed);
    const moneySaved = (daysElapsed * habit.cost_per_day).toFixed(2);
    const progress = Math.min(100, (daysElapsed / 28) * 100);

    document.getElementById("days-elapsed").textContent = daysElapsed;
    document.getElementById("days-remaining").textContent = daysRemaining;
    document.getElementById("money-saved").textContent = `€${moneySaved}`;
    document.getElementById("progress-bar").style.width = `${progress}%`;

    // Pre-fill edit form
    document.getElementById("edit-habit-name").value = habit.name;
    document.getElementById("edit-habit-cost").value = habit.cost_per_day;
    document.getElementById("edit-habit-reason").value = habit.reason || "";

    renderMilestones(habit.milestones || []);
    renderRewards(habit.rewards || []);
}

function calcDaysElapsed(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
}

// Milestones

function renderMilestones(milestones) {
    const list = document.getElementById("milestones-list");
    list.innerHTML = "";

    if (milestones.length === 0) {
        list.innerHTML = "<li class='empty-msg'>No milestones yet.</li>";
        return;
    }

    milestones.forEach(m => {
        const li = document.createElement("li");
        li.className = m.achieved ? "achieved" : "";
        li.innerHTML = `
            <span>${m.label} (day ${m.days_required})</span>
            <div class="item-actions">
                ${!m.achieved
                    ? `<button onclick="handleAchieveMilestone(${m.id})">Achieve</button>`
                    : `<span class="badge">✓ Done</span>`
                }
            </div>
        `;
        list.appendChild(li);
    });
}

function wireAddMilestoneForm() {
    document.getElementById("add-milestone-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const daysRequired = parseInt(document.getElementById("milestone-days").value);
        const label = document.getElementById("milestone-label").value.trim();

        try {
            await addMilestone(currentHabit.id, daysRequired, label);
            document.getElementById("add-milestone-form").reset();
            hide("milestone-error");
            await loadDashboard();
        } catch (err) {
            showError("milestone-error", err.message);
        }
    });
}

async function handleAchieveMilestone(milestoneId) {
    try {
        await achieveMilestone(milestoneId);
        await loadDashboard();
    } catch (err) {
        showError("milestone-error", err.message);
    }
}

// Rewards

function renderRewards(rewards) {
    const list = document.getElementById("rewards-list");
    list.innerHTML = "";

    if (rewards.length === 0) {
        list.innerHTML = "<li class='empty-msg'>No rewards yet.</li>";
        return;
    }

    rewards.forEach(r => {
        const li = document.createElement("li");
        li.className = r.claimed ? "claimed" : "";
        li.innerHTML = `
            <span>${r.title} (day ${r.days_target})</span>
            <div class="item-actions">
                ${!r.claimed
                    ? `<button onclick="handleClaimReward(${r.id})">Claim</button>
                       <button class="btn-danger" onclick="handleDeleteReward(${r.id})">Delete</button>`
                    : `<span class="badge">✓ Claimed</span>`
                }
            </div>
        `;
        list.appendChild(li);
    });
}

function wireAddRewardForm() {
    document.getElementById("add-reward-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("reward-title").value.trim();
        const daysTarget = parseInt(document.getElementById("reward-days").value);

        try {
            await addReward(currentHabit.id, title, daysTarget);
            document.getElementById("add-reward-form").reset();
            hide("reward-error");
            await loadDashboard();
        } catch (err) {
            showError("reward-error", err.message);
        }
    });
}

async function handleClaimReward(rewardId) {
    try {
        await claimReward(rewardId);
        await loadDashboard();
    } catch (err) {
        showError("reward-error", err.message);
    }
}

async function handleDeleteReward(rewardId) {
    if (!confirm("Delete this reward?")) return;
    try {
        await deleteReward(rewardId);
        await loadDashboard();
    } catch (err) {
        showError("reward-error", err.message);
    }
}

// Add habit

function wireAddHabitForm() {
    document.getElementById("add-habit-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("habit-name").value.trim();
        const cost = parseFloat(document.getElementById("habit-cost").value);
        const reason = document.getElementById("habit-reason").value.trim();
        const startDate = new Date().toISOString().split("T")[0]; // today

        try {
            await addHabit(USER_ID, name, startDate, cost, reason);
            hide("add-habit-error");
            await loadDashboard();
        } catch (err) {
            showError("add-habit-error", err.message);
        }
    });
}


// Edit habit

function wireEditHabit() {
    document.getElementById("edit-habit-btn").addEventListener("click", () => {
        show("edit-habit-section");
    });

    document.getElementById("cancel-edit-btn").addEventListener("click", () => {
        hide("edit-habit-section");
    });

    document.getElementById("edit-habit-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("edit-habit-name").value.trim();
        const cost_per_day = parseFloat(document.getElementById("edit-habit-cost").value);
        const reason = document.getElementById("edit-habit-reason").value.trim();

        try {
            await updateHabit(currentHabit.id, { name, cost_per_day, reason });
            hide("edit-habit-section");
            await loadDashboard();
        } catch (err) {
            alert(err.message);
        }
    });

    document.getElementById("delete-habit-btn").addEventListener("click", async () => {
        if (!confirm("Delete this habit? This cannot be undone.")) return;
        try {
            await deleteHabit(currentHabit.id);
            currentHabit = null;
            await loadDashboard();
        } catch (err) {
            alert(err.message);
        }
    });
}


// Helpers

function show(id) {
    document.getElementById(id).style.display = "";
}

function hide(id) {
    document.getElementById(id).style.display = "none";
}

function showError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.style.display = "block";
}