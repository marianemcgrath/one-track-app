// rewards.js
// OneTrack — Rewards Page

console.log('rewards.js loaded');
console.log('USER_ID:', USER_ID);
console.log('API_BASE:', API_BASE);

let currentHabit = null;

// Initialise
document.addEventListener("DOMContentLoaded", async () => {
    
    if (typeof sessionReady !== 'undefined') {
        await sessionReady;
    }
    
    // USER_ID to be defined
    if (typeof USER_ID === 'undefined' || !USER_ID) {
        console.log('Waiting for USER_ID...');
        setTimeout(() => {
            loadRewardsPage();
            wireAddRewardForm();
        }, 100);
        return;
    }
    
    loadRewardsPage();
    wireAddRewardForm();
});

async function loadRewardsPage() {
    try {
        // Double-check USER_ID is available
        if (typeof USER_ID  ==='undefined' || !USER_ID) {
            console.log('No USER_ID yet, retrying...');
            setTimeout(loadRewardsPage, 100);
            return;
        }
        
        const habit = await getActiveHabit(USER_ID);
        hide("loading-msg");

        if (!habit || !habit.id) {
            show("no-habit-msg");
            hide("rewards-wrap");
            return;
        }

        currentHabit = habit;
        renderHabitSummary(habit);
        
        // Use rewards from habit object (includes claimed status)
        const rewards = habit.rewards || [];
        renderRewards(rewards);
        
        show("rewards-wrap");
        hide("no-habit-msg");

    } catch (err) {
        console.error('loadRewardsPage error:', err);
        hide("loading-msg");
        
        // Show a more helpful error message
        const noHabitMsg = document.getElementById("no-habit-msg");
        if (noHabitMsg) {
            noHabitMsg.innerHTML = `
                <p>❌ Could not load rewards. Is the server running?</p>
                <p style="font-size: 12px; margin-top: 10px;">Error: ${err.message}</p>
                <a href="index.html">Go to Dashboard</a>
            `;
            show("no-habit-msg");
        }
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
    
    const habitNameEl = document.getElementById("summary-habit-name");
    const habitReasonEl = document.getElementById("summary-habit-reason");
    const dayLabelEl = document.getElementById("summary-day-label");
    const pctEl = document.getElementById("summary-pct");
    const progressBar = document.getElementById("summary-progress-bar");
    const daysEl = document.getElementById("summary-days");
    const remainingEl = document.getElementById("summary-remaining");
    const savedEl = document.getElementById("summary-saved");
    
    if (habitNameEl) habitNameEl.textContent = habit.name;
    if (habitReasonEl) habitReasonEl.textContent = habit.reason || "";
    if (dayLabelEl) dayLabelEl.textContent = `Day ${stats.daysElapsed} of 28`;
    if (pctEl) pctEl.textContent = `${Math.round(stats.progress)}%`;
    if (progressBar) progressBar.style.width = `${stats.progress}%`;
    if (daysEl) daysEl.textContent = stats.daysElapsed;
    if (remainingEl) remainingEl.textContent = stats.daysRemaining;
    if (savedEl) savedEl.textContent = `€${stats.moneySaved}`;
}

// Rewards list

function renderRewards(rewards) {
    const list = document.getElementById("rewards-list");
    if (!list) return;
    
    list.innerHTML = "";

    if (!rewards || rewards.length === 0) {
        list.innerHTML = "<li class='empty-msg'>No rewards yet — add one below.</li>";
        return;
    }

    // Sort: unclaimed first, then claimed
    const sorted = [...rewards].sort((a, b) => (a.claimed || 0) - (b.claimed || 0));

    sorted.forEach(r => {
        const li = document.createElement("li");
        li.className = `reward-item ${r.claimed ? "claimed" : ""}`;
        li.innerHTML = `
            <div>
                <div class="reward-title">${escapeHtml(r.title)}</div>
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
    const form = document.getElementById("add-reward-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (!currentHabit || !currentHabit.id) {
            showError("reward-error", "No active habit found");
            return;
        }
        
        const title = document.getElementById("reward-title").value.trim();
        const daysTarget = parseInt(document.getElementById("reward-days").value);

        if (!title) {
            showError("reward-error", "Please enter a reward title");
            return;
        }

        if (isNaN(daysTarget) || daysTarget < 1 || daysTarget > 28) {
            showError("reward-error", "Days must be between 1 and 28");
            return;
        }

        try {
            await addReward(currentHabit.id, title, daysTarget);
            document.getElementById("add-reward-form").reset();
            hide("reward-error");
            await loadRewardsPage();
        } catch (err) {
            console.error('Add reward error:', err);
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
        console.error('Claim reward error:', err);
        showError("reward-error", err.message);
    }
}

async function handleDeleteReward(rewardId) {
    if (!confirm("Delete this reward? This cannot be undone.")) return;
    try {
        await deleteReward(rewardId);
        await loadRewardsPage();
    } catch (err) {
        console.error('Delete reward error:', err);
        showError("reward-error", err.message);
    }
}

// Helpers

function getDaysElapsed(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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