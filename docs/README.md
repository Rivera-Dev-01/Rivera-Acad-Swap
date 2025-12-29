# Rivera Acad Swap (Rivera-Cyclops-UnifiedMarket)

A unified, university-based marketplace platform tailored for college students. This platform allows students to securely buy, sell, and swap academic items, post specific requests, and coordinate meetups for exchanges.

## 🚀 Features

### 🛒 Marketplace & Dashboard
- **User Dashboard**: Comprehensive view of selling stats, items sold, total earnings, and reputation score.
- **Glassmorphism Design**: Modern UI with animated backgrounds, frozen glass effects, and smooth transitions.
- **Reputation System**: Tiered reputation scoring (Common to Mythic) based on user activity.
- **Quick Actions**: Easy access to list items, browse, or manage requests.

### 📋 Request Board (New!)
A Reddit-style forum for students to find what they need.
- **Threaded Discussions**: Post requests and reply to others in expandable threads.
- **Categories**: Organize requests by Books, Electronics, Clothing, etc.
- **Interaction**: Like posts and replies to boost visibility.

### 📅 Meetup Scheduler (New!)
Integrated tools to coordinate safe exchanges.
- **Appointment Management**: Schedule upcoming meetups with buyers/sellers.
- **Smart Notifications**: System tracks time and alerts users 24h before meetups.
- **Status Tracking**: Track active, upcoming, and completed exchanges.

### 🔐 Security & Auth
- **University Verification**: Registration restricted to `.edu` or `.edu.ph` emails.
- **Secure Auth**: Powered by Supabase with automatic password hashing.
- **Profile Management**: Detailed student profiles with course and year levels.

---

## 🛠️ Tech Stack

**Frontend**
- **Framework**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS + Glassmorphism effects
- **Icons**: Lucide React
- **Routing**: React Router

**Backend**
- **Server**: Flask (Python)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

---

## ⚡ Getting Started

### Prerequisites
- Node.js & npm
- Python 3.8+
- Supabase Account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rivera-acad-swap
