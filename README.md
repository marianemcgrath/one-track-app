# OneTrack  
### A Tracking Web Application to Help Users Quoit Bad Habits for Good

## Web Services and Applications Project  
**Author:** Mariane McGrath 
**Module:** Web Services and Applications

---

# Table of Contents
- [Introduction](#introduction)
- [The Problem This App Solves](#the-problem-this-app-solves)
- [Branding and Product Rationale](#branding-and-product-rationale)
- [Behavioural Science Behind the App](#behavioural-science-behind-the-app)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [How to Run the Project](#how-to-run-the-project)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)
- [References](#references)

---

# Introduction

**OneTrack** is a habit tracking application designed around one simple principle:

> **Quit one bad habit at a time. Track one day at a time. Change compounds.**

Unlike conventional habit trackers that promote managing multiple goals simultaneously, OneTrack focuses on reducing cognitive overload by helping users direct effort toward changing one behaviour at a time.

The project combines web application development with behavioural science principles to create a focused and sustainable approach to habit change.

---

# The Problem This App Solves

Many habit trackers assume:

- More goals lead to more progress  
- Motivation alone drives success  
- Willpower can support multiple simultaneous changes  

Behavioural research often suggests the opposite.

Common reasons people fail at behaviour change include:

- Too many simultaneous changes create friction  
- Relapse is treated as failure rather than feedback  
- Progress is often poorly visualised  
- Traditional trackers reward perfection over consistency  

OneTrack was designed to reduce these barriers.

---

# Branding and Product Rationale

## Why “OneTrack”?

The name reflects two ideas:

- Staying focused on **one track** of change  
- Remaining **on track** through small daily wins  

## Brand Philosophy

OneTrack is designed around:

- Simplicity over overwhelm  
- Progress over perfection  
- Identity change over streak obsession  

## Visual Branding

Branding choices were made to reinforce the product philosophy:

- **Minimalist interface** to reduce cognitive load   
- **Clean typography** to reinforce clarity and calm  
- Supportive, non-punitive tone throughout the application

---

# Behavioural Science Behind the App

## Why 28 Days?

The application uses a **28-day milestone model** because:

- Four weeks feels psychologically manageable  
- Repetition over this period supports behavioural reinforcement  
- It helps disrupt habitual cue-response loops  
- It creates an achievable challenge while still feeling meaningful

*Source: https://lighthousebhsolutions.com/the-first-30-days-of-recovery-what-happens-and-how-to-prepare/*
*Source: https://www.victoriasincredibleedibles.ie/blog/28-days-to-a-new-you-making-or-breaking-habits*

## Why One Habit At A Time?

The app follows a single-habit focus because:

- Fewer simultaneous goals reduce decision fatigue  
- Focus increases completion likelihood  
- Behaviour change tends to stick better when introduced incrementally

*Source: https://www.worklifepsych.com/why-cant-i-stick-to-my-new-habits/*
*Source: https://www.helpguide.org/mental-health/wellbeing/how-to-break-bad-habits-and-change-negative-behaviors*

## Behavioural Principles Used

The app draws from:

- Habit loop theory (cue-routine-reward)  
- Identity-based habit formation  
- Small wins theory  
- Positive reinforcement through streaks  
- Loss aversion through money saved tracking

---

# Core Features

## Current Features

- Habit quit tracker  
- Daily streak monitoring  
- Money saved tracker  
- 28-day milestone system  
- Relapse reset logic  
- User authentication  
- CRUD habit management  
- REST API endpoints

## Example User Journey

1. User creates a quit goal  
2. Sets a quit date  
3. Tracks daily progress  
4. Views time and money recovered  
5. Reaches 28-day milestone

---

# Technology Stack

## Frontend
- HTML5  
- CSS3  
- JavaScript  
- Bootstrap  

## Backend
- Python  
- Flask  
- REST APIs

## Database
- SQLite / MySQL

## Additional Tools
- Git  
- GitHub  
- PythonAnywhere (deployment)

---

# System Architecture


---

# Database Design

## Main Tables

## users
Stores:

- User credentials  
- Authentication data  
- Profile information

## habits
Stores:

- Habit name  
- Quit date  
- Streak count  
- Money saved  
- Milestone progress

## Design Rationale

The schema supports:

- Progress tracking  
- User-specific habit journeys  
- Relapse handling  
- Progress analytics

---

# How to Run the Project

## Clone Repository

```bash
git clone https://github.com/yourusername/one-track-app.git
cd one-track-app
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Application

```bash
python onetrack_server.py
```

Open in browser:

```text
http://127.0.0.1:5000
```

---

# API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /habits | Retrieve habits |
| POST | /habits | Create habit |
| PUT | /habits/{id} | Update habit |
| DELETE | /habits/{id} | Delete habit |
| GET | /users | Retrieve users |

---

# Project Structure


---

# Future Improvements

Planned features include:

- Craving logging  
- Trigger journaling  
- Progress visualisation dashboard  
- AI relapse risk nudges  
- Social section (for accountability)  
- Multi-habit journeys  
- Mobile-first version

---

# Design Principles

The product is guided by four principles:

- One habit at a time  
- Recovery, not punishment  
- Visible progress motivates persistence  
- Simplicity reduces dropout

---

# References

Behavioural Science:
- James Clear — *Atomic Habits*  
- Charles Duhigg — *The Power of Habit*  

Technical Sources:
- Flask Documentation  
- Bootstrap Documentation  
- REST API Design Resources

---
