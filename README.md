# FlavorHub - Universal Menu Catalog

<div align="center">
  <img width="1200" height="475" alt="PAYPYA Cafe Banner" src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" />
</div>

## Overview

**FlavorHub** is a premium digital menu catalog solution designed for **PAYPYA Cafe (Coffee & Eatery)**. It provides a seamless experience for customers to browse the menu, manage their carts, and send orders directly via WhatsApp. It also features a robust admin dashboard for managing products, categories, and orders.

## ✨ Key Features

- 🍽️ **Digital Menu**: Beautifully categorized menu items with high-quality images and detailed descriptions.
- 🛒 **Smart Cart**: Interactive cart management with easy table number entry.
- 📲 **WhatsApp Ordering**: Direct order submission to staff via WhatsApp for quick service.
- 📍 **Location Mastery**: Integrated store information with direct Google Maps navigation.
- 📊 **Admin Dashboard**: Secure management system to update categories, products, and track orders in real-time.
- 🌓 **Dark Mode**: Premium glassmorphism UI with full light/dark theme support.

## 🛠️ Tech Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS for a premium, responsive UI
- **Backend & Auth**: Supabase (PostgreSQL, Authentication)
- **Icons & Graphics**: Google Material Symbols, Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd flavorhub---universal-menu-catalog
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

- `/components`: Reusable UI components (Menu, Cart, locationPage, etc.)
- `/dashboard`: Admin dashboard application logic and pages
- `/services`: API integration services (Supabase, Auth, location)
- `/lib`: Library configurations (Supabase client, types)
- `/assets`: Static assets like images and icons

---

<div align="center">
  <p>Built with ❤️ for <b>PAYPYA Cafe</b></p>
</div>
