// Rewards.html

const USER_ID = 1;
let currentHabit = null;

// Initialise

document.addEventListener("DOMContentLoaded", () => {
    loadRewardsPage();
    wireAddRewardForm();
});

async function loadRewardsPage() {
    try {
        const habit = await getActiveHabit(USER_ID);
        hide("loading-msg");

        if (!habit) {
            show("no-habit-msg");
            return;
        }

        currentHabit = habit;
        renderHabitSummary(habit);
        renderRewards(habit.rewards || []);
        show("rewards-wrap");

    } catch (err) {
        hide("loading-msg");
        showError("reward-error", "Could not load rewards. Is the server running?");
    }
}

// Habit summary

function getHabitStats(habit) {

    const daysElapsed = getDaysElapsed(habit.start_date);

    return {
        daysElapsed,
        daysRemaining: Math.max(0, 28 - daysElapsed),
        moneySaved: (daysElapsed * habit.cost_per_day).toFixed(2),
        progress: Math.min(100, (daysElapsed / 28) * 100)
    };
}

function renderHabitSummary(habit) {

    const stats = getHabitStats(habit);

    document.getElementById("summary-habit-name").textContent = habit.name;

    document.getElementById("summary-habit-reason").textContent =
        habit.reason || "";

    document.getElementById("summary-day-label").textContent =
        `Day ${stats.daysElapsed} of 28`;

    document.getElementById("summary-pct").textContent =
        `${Math.round(stats.progress)}%`;

    document.getElementById("summary-progress-bar").style.width =
        `${stats.progress}%`;

    document.getElementById("summary-days").textContent =
        stats.daysElapsed;

    document.getElementById("summary-remaining").textContent =
        stats.daysRemaining;

    document.getElementById("summary-saved").textContent =
        `€${stats.moneySaved}`;
}

// Rewards list

function renderRewards(rewards) {
    const list = document.getElementById("rewards-list");
    list.innerHTML = "";

    if (rewards.length === 0) {
        list.innerHTML = "<li class='empty-msg'>No rewards yet — add one below.</li>";
        return;
    }

    // Sort: unclaimed first, then claimed
    const sorted = [...rewards].sort((a, b) => a.claimed - b.claimed);

    sorted.forEach(r => {
        const li = document.createElement("li");
        li.className = `reward-item ${r.claimed ? "claimed" : ""}`;
        li.innerHTML = `
            <div>
                <div class="reward-title">${r.title}</div>
                <div class="reward-day">Unlock at day ${r.days_target}</div>
            </div>
            <div class="reward-item-actions">
                ${r.claimed
                    ? `<span class="badge">✓ Claimed</span>`
                    : `<button onclick="handleClaimReward(${r.id})">Claim</button>
                       <button class="btn-danger" onclick="handleDeleteReward(${r.id})">Delete</button>`
                }
            </div>
        `;
        list.appendChild(li);
    });
}

// Add reward

function wireAddRewardForm() {
    document.getElementById("add-reward-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("reward-title").value.trim();
        const daysTarget = parseInt(document.getElementById("reward-days").value);

        try {
            await addReward(currentHabit.id, title, daysTarget);
            document.getElementById("add-reward-form").reset();
            hide("reward-error");
            await loadRewardsPage();
        } catch (err) {
            showError("reward-error", err.message);
        }
    });
}

// Claim + Delete

async function handleClaimReward(rewardId) {
    try {
        await claimReward(rewardId);
        await loadRewardsPage();
    } catch (err) {
        showError("reward-error", err.message);
    }
}

async function handleDeleteReward(rewardId) {
    if (!confirm("Delete this reward?")) return;
    try {
        await deleteReward(rewardId);
        await loadRewardsPage();
    } catch (err) {
        showError("reward-error", err.message);
    }
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