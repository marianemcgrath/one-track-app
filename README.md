# OneTrack

> *One Habit. On Track.*

**Module:** Web Services & Applications  
**Programme:** HDip in Computing in Data Analytics  
**Institution:** ATU Galway-Mayo  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [The Brand](#2-the-brand)
   - 2.1 [Rationale](#21-rationale)
   - 2.2 [Name & Visual Identity](#22-name--visual-identity)
   - 2.3 [Tagline](#23-tagline)
3. [The Science](#3-the-scientific-background)
   - 3.1 [The 28-Day Rule](#31-the-28-day-rule)
   - 3.2 [One Habit at a Time](#32-one-habit-at-a-time)
4. [Features](#4-features)
5. [Tech Stack](#5-tech-stack)
6. [File Descriptions](#6-file-descriptions)
   - 6.1 [Python Files](#61-python-files)
   - 6.2 [Frontend Files](#62-frontend-files)
7. [How to Run](#7-how-to-run)
8. [Future Features](#8-future-features)

---

## 1. Introduction

OneTrack is a habit-breaking web application built with Flask, SQLite, and JavaScript. It gives users a focused, structured way to break one bad habit at a time — tracking their progress over 28 days, celebrating milestones, and setting rewards to keep motivation high.

The app was built as the main project submission for the Web Services & Applications module at ATU Galway-Mayo. It demonstrates a fully functional RESTful API with CRUD operations across multiple database tables, wired to a dynamic frontend via JavaScript (AJAX).

---

## 2. About OneTrack App

### 2.1 Rationale

While most habit tracking apps try to do everything — they track sleep, steps, water intake, screen time, achieving world peace and 367 other things simultaneously. The result is an overwhelming dashboard that becomes another thing to feel guilty about opening.

OneTrack was built on a different premise: **less is more powerful.**

The core idea came from personal experience using habit-tracking tools while quitting smoking. What actually worked was a single, visible commitment with a clear end date. OneTrack is designed to replicate that clarity for anyone breaking any habit.

The app doesn not let you add a second bad habit to quit until you have completed 28 days on your first one. That constraint is the main intention, you need to commit that you will stick with it.

It is not a limitation — it is the product.

Source: https://lighthousebhsolutions.com/the-first-30-days-of-recovery-what-happens-and-how-to-prepare/ 

Source: https://www.victoriasincredibleedibles.ie/blog/28-days-to-a-new-you-making-or-breaking-habits

Source: https://www.worklifepsych.com/why-cant-i-stick-to-my-new-habits/

Source: https://www.helpguide.org/mental-health/wellbeing/how-to-break-bad-habits-and-change-negative-behaviors

### 2.2 Name & Visual Identity

The name **OneTrack** is a deliberate double meaning:

- **One Track** — you are focused on a single habit, one track at a time.
- **On Track** — you are making progress, you are moving forward.

The visual identity reflects this focus:

| Element | Choice | Rationale |
|---|---|---|
| Colour palette | Black & Gold | Authority, discipline, reward |
| Logo | Maze | The journey of breaking a bad habit is rarely straight, but there is always a way out |
| Typography | Clean, minimal | Keeping user focused on what matters |

**Colour Palette (Black & Gold):**

Source: https://mailchimp.com/resources/color-psychology/ (Colour Psychology in Branding)

Source: https://www.colorpsychology.org/blog/color-of-justice-the-psychology-of-black-in-authority-and-power/ (Psychology of Black — Authority and Power)

Source: https://pratibodh.org/index.php/pratibodh/article/view/154/165 (Colour Psychology in UX/UI Design)

**Logo (Maze):**

Source: https://symbolixe.com/maze-symbolism/ (Maze Symbolism)

Source: https://symbolopedia.com/maze-symbolism-meaning/ (Maze Symbolism and Meaning)

**Typography (Clean, Minimal):**

Source: https://618media.com/en/blog/why-minimalist-typography-is-still-trending/ (Minimalist Typography and UX)

Source: https://uitop.design/blog/design/minimalist-ux/ (Minimalist UX Design Principles)

### 2.3 Tagline

> *One Habit. On Track.*

Short enough to remember and a play with the application name.

---

## 3. The Scientific Background

### 3.1 The 28-Day Rule

For many years, there were popular claims that new habits (or habit breaks) could be done in 21 days. However, this myth was recently busted, as researchers found that for new behaviour to become routine (automacity) — took anywhere from 18 to 254 days, with a median of **66 days**.

So, why does OneTrack use 28 days, rather than 66 or even 21?

The 28-day window is a **meaningful first threshold**, not the finish line. And for most habits, the consistency of 28 days or 4 weeks, indicates you'll be more likely to:

- Break the physical dependency cycle for most (non-opioid) substances
- Rewire the immediate the habitual trigger-response loop
- Build enough evidence of change to sustain motivation

**Completing 28 days is not the full finishing line. But it is the point that the user shows commitment to earn the right to begin a new habit break.**

Source: https://www.theguardian.com/lifeandstyle/2009/oct/10/change-your-life-habit-28-day-rule (28-Day Habit Rule)

Source: https://pubmed.ncbi.nlm.nih.gov/35690891/ (Habit Formation Research)

Source: https://www.facebook.com/watch/?v=1082379843295875 (Habit Formation Video)

Source: https://www.citizensinformation.ie/en/health/health-services/addiction-treatment-services/drug-alcohol-addiction-services/ (Drug & Alcohol Addiction Services)

Source: https://lighthousebhsolutions.com/the-first-30-days-of-recovery-what-happens-and-how-to-prepare/ (First 30 Days of Recovery)

Source: https://www.victoriasincredibleedibles.ie/blog/28-days-to-a-new-you-making-or-breaking-habits (28 Days to a New You)


### 3.2 One Habit at a Time

The decision to restrict users to one active habit at a time is grounded in research on cognitive load and self-regulation. Studies suggest that willpower operates as a finite resource; when people attempt multiple behavioural changes simultaneously, they rely in this limited self-control, increasing the chances of failure to competing goals.

Focusing on a single habit reduces decision fatigue, improves consistency, and increases the likelihood that behavioural change will become sustainable over time.

Research also indicates that incremental change is more effective than attempting several transformations at once, as success with one habit builds confidence and momentum for tackling the next.

**OneTrack intentionally enforces a one-habit-at-a-time approach, removing the burden of overcommitting from the user and guiding them toward a more focused and achievable path to change.** 

Source: https://www.worklifepsych.com/why-cant-i-stick-to-my-new-habits/ (Habit Consistency & Cognitive Load)

Source: https://www.helpguide.org/mental-health/wellbeing/how-to-break-bad-habits-and-change-negative-behaviors (Breaking Bad Habits)


### 3.3 Behavioural Principles Used in the App

The app draws from:

 - Habit loop theory (cue-routine-reward)

 - Identity-based habit formation

 - Small wins theory

 - Positive reinforcement through streaks

 - Loss aversion through money saved tracking

**Habit Loop Theory (Cue-Routine-Reward):**

Source: https://thedecisionlab.com/reference-guide/psychology/car-model (Cue-Action-Reward Model)

Source: https://www.tougherminds.co.uk/2024/08/27/understanding-the-habit-loop-cue-routine-reward/ (Understanding the Habit Loop)


**Identity-Based Habit Formation:**

Source: https://jamesclear.com/identity-based-habits (Identity-Based Habits — James Clear)


**Small Wins Theory:**

Source: https://icap2018.com/small-wins-momentum-psychology/ (Small Wins & Psychological Momentum)

Source: https://youngvibrant.wordpress.com/2025/01/24/the-psychology-of-small-wins/ (Psychology of Small Wins)


**Positive Reinforcement Through Streaks:**

Source: https://uxmag.medium.com/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame-3dde153f239c (Psychology of Streaks in Design)


**Loss Aversion Through Money Saved Tracking:**

Source: https://www.behavioraleconomics.com/resources/mini-encyclopedia-of-be/loss-aversion/ (Loss Aversion — Behavioural Economics)

Source: https://thedecisionlab.com/biases/loss-aversion (Loss Aversion — The Decision Lab)

---

## 4. Features

### 4.1 Current Features

- **Single active habit tracking** — enforced at both application and database level
- **28-day progress tracking** — days elapsed, days remaining, and a visual progress bar
- **Money saved calculator** — based on the user's daily cost input, updated in real time
- **Milestones** — custom day-targets with an "achieve" action to mark them done
- **Rewards** — user-defined treats unlocked at specific day targets, with a claim action
- **Full CRUD via REST API** — all data operations handled via AJAX calls to Flask endpoints
- **Cascading deletes** — removing a habit automatically removes its milestones and rewards
- **Two-state dashboard** — shows a creation form when no habit is active; shows full progress view when one is

#### 4.2 User Journey
1. User selects a quit goal
2. Sets a quit date
3. Tracks daily progress
4. Views time and money recovered
5. Reaches 28-day milestone
6. User is allowed to select a second quit goal

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, Flask |
| Database | SQLite 3 |
| ORM / DAO | Custom DAO layer (`onetrack_dao.py`) |
| Frontend | Vanilla HTML, CSS, JavaScript (ES6) |
| API Style | RESTful (GET, POST, PUT, PATCH, DELETE) |
| CORS | Flask-CORS |
| Dev Environment | GitHub Codespaces |
| Deployment | Render *(planned)* |

---

## 6. File Descriptions

### 6.1 Python Files

#### `onetrack_server.py`
The Flask application entry point. Defines all API routes and maps them to DAO functions. CORS is enabled to allow requests from the frontend. Handles request validation and returns structured JSON responses with appropriate HTTP status codes.

**Endpoints:**

| Method | Route | Description |
|---|---|---|
| POST | `/api/user` | Register a new user |
| GET | `/api/habit?user_id=` | Get the active habit (with milestones & rewards) |
| POST | `/api/habit` | Create a new habit |
| PUT | `/api/habit/<id>` | Update habit name, cost, or reason |
| DELETE | `/api/habit/<id>` | Delete a habit (cascades to milestones & rewards) |
| POST | `/api/reward` | Add a reward to a habit |
| PATCH | `/api/reward/<id>/claim` | Mark a reward as claimed |
| DELETE | `/api/reward/<id>` | Delete a reward |
| POST | `/api/milestone` | Add a milestone to a habit |
| PATCH | `/api/milestone/<id>/achieve` | Mark a milestone as achieved |

#### `onetrack_dao.py`
The Data Access Object layer. All direct SQLite interactions are handled here — no SQL lives in the server file. Includes guard logic (e.g. the 28-day check before allowing a new habit, duplicate claim/achieve prevention) and returns clean dictionaries to the server layer.

#### `onetrack_database.py`
Creates the SQLite database and all tables if they do not exist. Run this once before starting the server. Includes a unique partial index to enforce the one-active-habit-per-user rule at the database level.

### 6.2 Frontend Files

#### `index.html` (Dashboard)
The main page. Handles two states: a habit creation form when no habit is active, and a full progress dashboard when one is. Displays days elapsed, days remaining, money saved, a progress bar, milestones list, and rewards list — all populated dynamically via AJAX.

#### `rewards.html`
Dedicated rewards management page.

#### `support.html`
Intelligent support chat interface.

#### `static/js/app.js`
All AJAX functions — one per API endpoint. Each function handles the fetch call, sets headers, checks the response status, and throws meaningful errors. This file has no DOM logic; it is purely the API communication layer.

#### `static/js/dashboard.js`
All DOM logic for `index.html`. Wires event listeners to forms and buttons, calls functions from `app.js`, and renders habit data, milestones, and rewards into the page.

#### `static/css/style.css`
Global styles. Black and gold colour scheme, card-based layout, progress bar, responsive design.

---

## 7. How to Run

### Prerequisites

Ensure the following are installed:

```bash
pip install flask flask-cors
```

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/marianemcgrath/WSAA-project
cd WSAA-project
```

**2. Create the database**

```bash
python onetrack_database.py
```

You should see: `✅ Database upgraded successfully!`

**3. Start the Flask server**

```bash
python onetrack_server.py

```
The server runs at: http://127.0.0.1:5000


**4. Open the frontend**

Open `index.html` in your browser, or visit the live deployment at: `https://marirmcgrath.pythonanywhere.com/`

---

# 8. References

Sources used to create this project (including AI prompts) were placed throughout the documents, below the section it was required.

---

*Built by Mari McGrath — HDip in Computing in Data Analytics, ATU Galway-Mayo*