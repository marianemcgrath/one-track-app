// OneTrack — Dashboard JavaScript

let currentHabit = null;

// Initialise
document.addEventListener("DOMContentLoaded", async () => {
    if (typeof sessionReady !== 'undefined') {
        await sessionReady;
    }
    
    loadDashboard();
    wireAddHabitForm();
    wireEditHabit();
    wireAddMilestoneForm();
    wireAddRewardForm();

    const habitSelect = document.getElementById("habit-name");
    if (habitSelect) {
        habitSelect.addEventListener("change", function () {
            const otherInput = document.getElementById("habit-name-other");
            if (otherInput) {
                otherInput.style.display = this.value === "Other" ? "block" : "none";
                if (this.value !== "Other") otherInput.value = "";
            }
        });
    }
});

async function loadDashboard() {
    try {
        if (typeof USER_ID === 'undefined' || !USER_ID) {
            console.log('Waiting for USER_ID...');
            setTimeout(loadDashboard, 100);
            return;
        }
        
        const habit = await getActiveHabit(USER_ID);
        if (habit && habit.id) {
            currentHabit = habit;
            showActiveHabit(habit);
        } else {
            showNoHabit();
        }
    } catch (err) {
        console.error('loadDashboard error:', err);
        showError("loading-msg", "Could not load dashboard. Is the server running?");
    }
}

function showNoHabit() {
    hide("loading-msg");
    show("no-habit-section");
    hide("active-habit-section");
}

function showActiveHabit(habit) {
    hide("loading-msg");
    hide("no-habit-section");
    show("active-habit-section");

    const nameDisplay = document.getElementById("habit-name-display");
    const reasonDisplay = document.getElementById("habit-reason-display");
    if (nameDisplay) nameDisplay.textContent = habit.name;
    if (reasonDisplay) reasonDisplay.textContent = habit.reason || "";

    const timeElapsed = getTimeElapsed(habit.start_date);
    const daysElapsed = timeElapsed.days;
    const daysRemaining = Math.max(0, 28 - daysElapsed);
    const moneySaved = (daysElapsed * habit.cost_per_day).toFixed(2);
    const progress = Math.min(100, (daysElapsed / 28) * 100);

    const daysElapsedEl = document.getElementById("days-elapsed");
    const daysRemainingEl = document.getElementById("days-remaining");
    const moneySavedEl = document.getElementById("money-saved");
    const progressBar = document.getElementById("progress-bar");

    if (daysElapsedEl) daysElapsedEl.textContent = `${timeElapsed.days} days • ${timeElapsed.hours} hours • ${timeElapsed.minutes} minutes`;
    if (daysRemainingEl) daysRemainingEl.textContent = daysRemaining;
    if (moneySavedEl) moneySavedEl.textContent = `€${moneySaved}`;
    if (progressBar) progressBar.style.width = `${progress}%`;

    const editName = document.getElementById("edit-habit-name");
    const editCost = document.getElementById("edit-habit-cost");
    const editReason = document.getElementById("edit-habit-reason");
    
    if (editName) editName.value = habit.name;
    if (editCost) editCost.value = habit.cost_per_day;
    if (editReason) editReason.value = habit.reason || "";

    if (habit.milestones) renderMilestones(habit.milestones);
    if (habit.rewards) renderRewards(habit.rewards);
}

function getTimeElapsed(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffMs = now - start;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (86400000)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (3600000)) / (1000 * 60));
    
    return { days, hours, minutes };
}

function getDaysElapsed(startDate) {
    return getTimeElapsed(startDate).days;
}

function renderMilestones(milestones) {
    const list = document.getElementById("milestones-list");
    if (!list) return;
    
    list.innerHTML = "";

    if (!milestones || milestones.length === 0) {
        list.innerHTML = "<li class='empty-msg'>No milestones yet.</li>";
        return;
    }

    milestones.forEach(m => {
        const li = document.createElement("li");
        li.className = m.achieved ? "achieved" : "";
        li.innerHTML = `
            <span>${escapeHtml(m.label)} (day ${m.days_required})</span>
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

async function addMilestoneToHabit(habitId, label, daysRequired) {
    try {
        const res = await fetch(`${API_BASE}/api/milestone`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                habit_id: habitId,
                label: label,
                days_target: daysRequired
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add milestone");
        return data.milestone;
    } catch (err) {
        console.error("addMilestone:", err.message);
        throw err;
    }
}

function wireAddMilestoneForm() {
    const form = document.getElementById("add-milestone-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const daysRequired = parseInt(document.getElementById("milestone-days").value);
        const label = document.getElementById("milestone-label").value.trim();

        try {
            await addMilestoneToHabit(currentHabit.id, label, daysRequired);
            form.reset();
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

function renderRewards(rewards) {
    const list = document.getElementById("rewards-list");
    if (!list) return;
    
    list.innerHTML = "";

    if (!rewards || rewards.length === 0) {
        list.innerHTML = "<li class='empty-msg'>No rewards yet.</li>";
        return;
    }

    rewards.forEach(r => {
        const li = document.createElement("li");
        li.className = r.claimed ? "claimed" : "";
        li.innerHTML = `
            <span>${escapeHtml(r.title)} (day ${r.days_target})</span>
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
    const form = document.getElementById("add-reward-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("reward-title").value.trim();
        const daysTarget = parseInt(document.getElementById("reward-days").value);

        try {
            await addReward(currentHabit.id, title, daysTarget);
            form.reset();
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

function wireAddHabitForm() {
    const form = document.getElementById("add-habit-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        let name = document.getElementById("habit-name").value.trim();
        const otherName = document.getElementById("habit-name-other");
        if (name === "Other" && otherName && otherName.value.trim()) {
            name = otherName.value.trim();
        }
        
        const cost = parseFloat(document.getElementById("habit-cost").value);
        const reason = document.getElementById("habit-reason").value.trim();
        const startDate = new Date().toISOString().split("T")[0];

        try {
            await addHabit(USER_ID, name, startDate, cost, reason);
            hide("add-habit-error");
            await loadDashboard();
        } catch (err) {
            showError("add-habit-error", err.message);
        }
    });
}

function wireEditHabit() {
    const editBtn = document.getElementById("edit-habit-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");
    const editForm = document.getElementById("edit-habit-form");
    const deleteBtn = document.getElementById("delete-habit-btn");
    
    if (editBtn) {
        editBtn.addEventListener("click", () => show("edit-habit-section"));
    }
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => hide("edit-habit-section"));
    }
    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
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
    }
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
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
}

function show(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
}

function hide(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function showError(id, message) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = message;
        el.style.display = "block";
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}