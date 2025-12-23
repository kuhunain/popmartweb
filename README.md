# 🧸 Pop Mart Collection Tracker

A full-stack web application for Pop Mart collectors to track their figurine collections, earn scores based on rarity and collection depth, and compare their progress with other users.

This project combines data processing, authentication, cloud storage, and custom scoring logic to create a competitive and personalized collecting experience.

---

## ✨ Features

### 👤 User Accounts
- Secure authentication using Supabase Auth
- Each user has a personal collection tied to their account
- Persistent cloud-based storage across sessions

### 🧩 Figurine Collection Management
- Add and remove Pop Mart figurines from your personal collection
- Each figurine includes:
  - Name
  - Category / Series
  - Image
  - Date acquired
  - Secret / non-secret status
- Secret figurines are marked with a **SECRET** badge

### 🏆 Scoring System
User scores are calculated dynamically using the following rules:

- Non-secret figurine: **+10 points**
- Secret figurine: **+50 points**
- Category bonus: **+5 points** for every 10 figurines in the same category
- Collection bonus: **+20 points** for every 15 figurines from the same Pop Mart series

Scores automatically update when figurines are added or removed and are saved to the database.

### 📊 Rankings (Leaderboard-Ready)
- Each user's score is stored in Supabase
- Designed to support global user rankings and comparisons

---

## 🧠 Data Processing

Pop Mart figurine data is preprocessed using Python:

- Reads figurine data from a CSV file
- Automatically assigns categories based on keyword matching
- Sorts and exports cleaned data for frontend usage

This allows the app to scale to hundreds or thousands of figurines without manual categorization.

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript (Vanilla JS)

### Backend / Cloud
- Supabase
  - Authentication
  - PostgreSQL database
  - Row Level Security (RLS)
- Supabase JavaScript client

### Data Processing
- Python
- CSV parsing and data normalization

---

## 🗄️ Database Schema (Simplified)

### `users`
- `user_id` (Supabase Auth ID)
- `display_name`
- `score`

### `figurines`
- `id`
- `user_id`
- `name`
- `category`
- `image_url`
- `secret` (boolean)
- `date_acquired`

All database operations are scoped to the authenticated user.

---

## 🔐 Security
- Supabase Row Level Security (RLS)
- Users can only access and modify their own data
- Client-side and database-level protections

---

## 🚧 Future Improvements
- Global leaderboard page
- Updated figurine scraping direct from PopMart website
- Advanced collection analytics and statistics
- Admin tools for managing figurine data
- Server-side score calculation for improved performance

---

## 📌 Project Highlights
This project demonstrates:
- Full-stack web development
- Real-world authentication and user management
- Cloud-hosted data persistence
- Custom scoring and business logic
- Data preprocessing with Python
- Secure multi-user systems

---

## 📄 License
This project is for educational and personal use.


