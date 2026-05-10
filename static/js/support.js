// OneTrack — Support Page (Coach)

let supportHabit = null;

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof sessionReady !== 'undefined') {
        await sessionReady;
    }
    await loadSupportHabit();
    wireSupportMessages();
    displayDailyEncouragement();
});

async function loadSupportHabit() {
    try {
        if (typeof USER_ID === 'undefined' || !USER_ID) {
            setTimeout(loadSupportHabit, 100);
            return;
        }
        supportHabit = await getActiveHabit(USER_ID);
        
        const habitNameSpan = document.getElementById("support-habit-name");
        if (habitNameSpan) {
            habitNameSpan.textContent = supportHabit ? supportHabit.name : "No active habit";
        }
        
        if (!supportHabit) {
            const messagesDiv = document.getElementById("support-messages");
            if (messagesDiv) {
                messagesDiv.innerHTML = `
                    <div class="support-message">
                        <p>👋 Welcome to OneTrack Coach!</p>
                        <p>Create a habit on the Dashboard first — whether it's drinking, smoking, vaping, gambling, screen time, or any habit you want to break — then I can help you stay on track!</p>
                        <a href="/" class="btn">Go to Dashboard</a>
                    </div>
                `;
            }
        }
    } catch (err) {
        console.error('loadSupportHabit error:', err);
    }
}

function wireSupportMessages() {
    const sendBtn = document.getElementById("send-message");
    const messageInput = document.getElementById("support-input");
    
    if (sendBtn) {
        sendBtn.addEventListener("click", sendSupportMessage);
    }
    if (messageInput) {
        messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendSupportMessage();
        });
    }
}

async function sendSupportMessage() {
    const input = document.getElementById("support-input");
    const message = input.value.trim();
    if (!message) return;
    
    addChatMessage("user", message);
    input.value = "";
    showTypingIndicator();
    
    setTimeout(async () => {
        hideTypingIndicator();
        const stats = await getCurrentStats();
        const response = generateSupportResponse(message, stats);
        addChatMessage("support", response);
    }, 500);
}

async function getCurrentStats() {
    if (!supportHabit) return null;
    
    const timeElapsed = getTimeElapsed(supportHabit.start_date);
    const daysElapsed = timeElapsed.days;
    const moneySaved = (daysElapsed * supportHabit.cost_per_day).toFixed(2);
    
    return {
        habitName: supportHabit.name,
        days: daysElapsed,
        hours: timeElapsed.hours,
        minutes: timeElapsed.minutes,
        money: moneySaved,
        startDate: supportHabit.start_date
    };
}

function generateSupportResponse(message, stats) {
    const lowerMsg = message.toLowerCase();
    const habitName = stats?.habitName || "your habit";
    
    // Struggling / difficult
    if (lowerMsg.includes("struggl") || lowerMsg.includes("hard") || lowerMsg.includes("difficult")) {
        const responses = [
            `I hear you. Breaking any habit is tough, but you've already made it ${stats?.days || 0} days. That's real progress. Take it one hour at a time. You've got this. 💪`,
            `Struggling means you're fighting for something better. That takes courage. Remember why you wanted to break ${habitName} in the first place.`,
            `This moment will pass. Every urge you resist makes the next one easier. Have a glass of water, go for a short walk, or call a friend. You'll feel different soon.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Motivation / encouragement
    if (lowerMsg.includes("motivate") || lowerMsg.includes("encourag") || lowerMsg.includes("keep going") || lowerMsg.includes("inspiring")) {
        const responses = [
            `You're already ${stats?.days || 0} days free from ${habitName}! That's ${stats?.hours || 0} hours of progress. Every day gets a little easier. 🎯`,
            `You're not giving something up — you're gaining freedom, better health, and €${stats?.money || 0} back in your pocket. Keep going!`,
            `One day at a time. You've done ${stats?.days || 0} days already — you can absolutely do today. I believe in you.`,
            `Think about how far you've come. The first few days are the hardest, and you've already survived them. You're stronger than you know.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Stats / progress
    if (lowerMsg.includes("stats") || lowerMsg.includes("progress") || lowerMsg.includes("how am i doing") || lowerMsg.includes("show me")) {
        if (!stats) return `Create a habit on the Dashboard first (like "Drinking" or "Smoking"), then I can show you your stats!`;
        return `📊 Here are your current stats for "${habitName}":\n• ${stats.days} days, ${stats.hours} hours, ${stats.minutes} minutes free\n• €${stats.money} saved\n• ${Math.min(100, Math.floor((stats.days / 28) * 100))}% of your 28-day goal. Well done!`;
    }
    
    // Body / recovery / health
    if (lowerMsg.includes("body") || lowerMsg.includes("recovery") || lowerMsg.includes("health") || lowerMsg.includes("healing")) {
        const days = stats?.days || 0;
        if (days < 1) {
            return "Within hours of stopping, your body begins to recover. Heart rate starts to normalise and energy levels begin to stabilise. You're already on the right track!";
        }
        if (days < 7) {
            return "The first week is often the hardest. Your body is adjusting to life without the habit. Sleep and energy might be affected, but this passes. You're doing brilliantly to get this far.";
        }
        if (days < 14) {
            return "By week two, many people notice better sleep, clearer thinking, and more stable energy throughout the day. Your body is adapting to its new normal. Keep going!";
        }
        if (days < 28) {
            return "You're past the worst of it. Most withdrawal symptoms have faded, and you're building new, healthier patterns. This is where real change happens.";
        }
        return "Congratulations on reaching 28 days! You've proven you can do this. Your body has made significant progress, and you've built incredible momentum. Keep protecting your progress.";
    }
    
    // Cravings / urges
    if (lowerMsg.includes("craving") || lowerMsg.includes("urge") || lowerMsg.includes("want to") && (lowerMsg.includes("give in") || lowerMsg.includes("relapse"))) {
        return "Urges usually last only 3–5 minutes. Try this: take 10 deep breaths, drink a cold glass of water, or do 10 jumping jacks. The urge will pass whether you give in or not — so why not let it pass without? You've got this.";
    }
    
    // Boredom
    if (lowerMsg.includes("bored") || lowerMsg.includes("nothing to do")) {
        const responses = [
            `Boredom is a common trigger. Can you go for a short walk, call a friend, listen to a podcast, or start a small task around the house? Keeping your hands and mind busy really helps.`,
            `Boredom passes. Try learning something new on your phone, doing some stretching, or even just changing your environment — go to a different room or step outside for a minute.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Stress / anxiety
    if (lowerMsg.includes("stress") || lowerMsg.includes("anxious") || lowerMsg.includes("worry")) {
        const responses = [
            `Stress is a major trigger for many people. Before reaching for the habit, try this: take five slow, deep breaths. Breathe in for 4 seconds, hold for 4, out for 6. Do this five times. How do you feel now?`,
            `It's completely normal to feel stressed. The habit won't actually reduce the stress — it just delays it. Try a 5-minute break away from screens, some fresh air, or making a cup of tea.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Relapse / slipped up
    if (lowerMsg.includes("relapse") || lowerMsg.includes("slipped") || lowerMsg.includes("failed") || lowerMsg.includes("mess up")) {
        const responses = [
            `A slip doesn't erase your progress. You've still gone ${stats?.days || 0} days without ${habitName}. That counts for a lot. The important thing is what you do next. Get straight back on track. You haven't failed — you're learning.`,
            `One moment doesn't define your journey. Look at how far you've come. Take a deep breath, forgive yourself, and recommit. You can absolutely do this.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Default responses (fallback)
    const defaults = [
        `Thanks for checking in. You're doing great with "${habitName}". Type "stats" to see your progress, "motivate" for encouragement, or "struggling" if you need support.`,
        `I'm here for you. How are you feeling about ${habitName} right now?`,
        `Every day you stay on track is a win. What can I help you with today?`,
        `Remember: you're building a better version of yourself, one day at a time. How can I support you right now?`
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}

function addChatMessage(sender, text) {
    const messagesContainer = document.getElementById("support-messages");
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    // Preserve line breaks in stats messages
    messageDiv.innerHTML = `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById("support-messages");
    if (!container) return;
    
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "message support";
    typingDiv.innerHTML = "<p>Coach is typing<span>.</span><span>.</span><span>.</span></p>";
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
}

function displayDailyEncouragement() {
    const messages = [
        "💪 Every day without your habit is a victory.",
        "🌟 You're stronger than any urge you'll face today.",
        "🎯 One day at a time. You've got this.",
        "💰 Every day you save money AND improve your health.",
        "🌅 Today is a fresh opportunity to stay on track.",
        "🧠 You're rewiring your brain for freedom. Keep going.",
        "🏆 Small daily wins add up to huge change."
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const encouragementDiv = document.getElementById("daily-encouragement");
    if (encouragementDiv) {
        encouragementDiv.textContent = randomMsg;
    }
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}