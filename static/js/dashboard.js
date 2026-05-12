// OneTrack — Dashboard JavaScript

let currentHabit = null;
let timerInterval = null;

// Initialise
document.addEventListener("DOMContentLoaded", async () => {
    if (typeof sessionReady !== 'undefined') {
        await sessionReady;
    }
    wireProfileForm();
    wireAddHabitForm();
    wireEditHabit();

    await loadDashboard();

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

        await sessionReady;

        if (!CURRENT_USER) {

            hide("loading-msg");
            show("profile-section");
            hide("no-habit-section");
            hide("active-habit-section");
            return;
        }

        const habit = await getActiveHabit();
        if (habit && habit.id) {
            currentHabit = habit;
            showActiveHabit(habit);
        } else {
            showNoHabit();
        }
    } catch (err) {
        console.error(
            "loadDashboard error:",
            err
        );
        showError(
            "loading-msg",
            "Could not load dashboard. Is the server running?"
        );
    }
}

function wireProfileForm() {

    const form =
        document.getElementById("create-profile-form");

    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const username =
            document.getElementById("profile-name")
            .value
            .trim();

        if (!username) {
            alert("Please enter a name");
            return;
        }

        try {

            const user = await addUser(
                username,
                `${username}@onetrack.app`,
                "demo"
            );
            
            await loadDashboard();

        } catch (err) {

            console.error(err);

            alert("Could not create profile");
        }
    });
}

function showNoHabit() {

    hide("loading-msg");
    hide("profile-section");
    hide("active-habit-section");

    show("no-habit-section");
}

function showActiveHabit(habit) {

    hide("loading-msg");
    hide("profile-section");
    hide("no-habit-section");

    show("active-habit-section");

    const nameDisplay =
        document.getElementById("habit-name-display");

    const reasonDisplay =
        document.getElementById("habit-reason-display");

    if (nameDisplay) {
        nameDisplay.textContent = habit.name;
    }

    if (reasonDisplay) {
        reasonDisplay.textContent = habit.reason || "";
    }

    const timeElapsed =
        getTimeElapsed(habit.start_date);

    const daysElapsed =
        timeElapsed.days;

    const daysRemaining =
        Math.max(0, 28 - daysElapsed);

    const moneySaved =
        (daysElapsed * habit.cost_per_day).toFixed(2);

    const progress =
        Math.min(100, (daysElapsed / 28) * 100);

    const daysElapsedEl =
        document.getElementById("days-elapsed");

    const daysRemainingEl =
        document.getElementById("days-remaining");

    const moneySavedEl =
        document.getElementById("money-saved");

    const progressBar =
        document.getElementById("progress-bar");

    if (daysElapsedEl) {
        daysElapsedEl.textContent =
            `${timeElapsed.days} days • ${timeElapsed.hours} hours • ${timeElapsed.minutes} minutes`;
    }

    if (daysRemainingEl) {
        daysRemainingEl.textContent =
            daysRemaining;
    }

    if (moneySavedEl) {
        moneySavedEl.textContent =
            `€${moneySaved}`;
    }

    if (progressBar) {
        progressBar.style.width =
            `${progress}%`;
    }

    const editName =
        document.getElementById("edit-habit-name");

    const editCost =
        document.getElementById("edit-habit-cost");

    const editReason =
        document.getElementById("edit-habit-reason");

    if (editName) {
        editName.value = habit.name;
    }

    if (editCost) {
        editCost.value = habit.cost_per_day;
    }

    if (editReason) {
        editReason.value = habit.reason || "";
    }
}

// Start live timer update once
if (!timerInterval) {
    timerInterval = setInterval(() => {
        if (currentHabit) {
            const updatedTime = getTimeElapsed(currentHabit.start_date);

            const daysElapsedEl = document.getElementById("days-elapsed");

            if (daysElapsedEl) {
                daysElapsedEl.textContent =
                    `${updatedTime.days} days • ${updatedTime.hours} hours • ${updatedTime.minutes} minutes`;
            }
        }
    }, 60000);
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

function wireAddHabitForm() {

    const form =
        document.getElementById("add-habit-form");

    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        let name =
            document.getElementById("habit-name")
            .value
            .trim();

        const otherName =
            document.getElementById("habit-name-other");

        if (
            name === "Other" &&
            otherName &&
            otherName.value.trim()
        ) {
            name = otherName.value.trim();
        }

        if (!name || name === "Other") {
            showError(
                "add-habit-error",
                "Please enter a habit name"
            );
            return;
        }

        const cost = parseFloat(
            document.getElementById("habit-cost").value
        );

        if (isNaN(cost) || cost < 0) {
            showError(
                "add-habit-error",
                "Please enter a valid daily cost"
            );
            return;
        }

        const reason =
            document.getElementById("habit-reason")
            .value
            .trim();

        const startDate =
            new Date()
            .toISOString()
            .split("T")[0];

        try {

            await addHabit(
                name,
                startDate,
                cost,
                reason
            );

            hide("add-habit-error");

            await loadDashboard();

        } catch (err) {

            showError(
                "add-habit-error",
                err.message
            );
        }
    });
}

function wireEditHabit() {

    const editBtn =
        document.getElementById("edit-habit-btn");

    const cancelBtn =
        document.getElementById("cancel-edit-btn");

    const editForm =
        document.getElementById("edit-habit-form");

    const deleteBtn =
        document.getElementById("delete-habit-btn");

    if (editBtn) {
        editBtn.addEventListener("click", () => {
            show("edit-habit-section");
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            hide("edit-habit-section");
        });
    }

    if (editForm) {

        editForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const name =
                document.getElementById("edit-habit-name")
                .value
                .trim();

            const cost_per_day = parseFloat(
                document.getElementById("edit-habit-cost")
                .value
            );

            const reason =
                document.getElementById("edit-habit-reason")
                .value
                .trim();

            try {

                await updateHabit(
                    currentHabit.id,
                    {
                        name,
                        cost_per_day,
                        reason
                    }
                );

                hide("edit-habit-section");

                await loadDashboard();

            } catch (err) {

                alert(err.message);
            }
        });
    }

    if (deleteBtn) {

        deleteBtn.addEventListener("click", async () => {

            if (!confirm(
                "Delete this habit? This cannot be undone."
            )) return;

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