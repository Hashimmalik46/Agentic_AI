# Design Specification: Authentication (Login & Signup)

## 1. Overview
The Authentication pages (Login and Create Account) serve as the entry point to the Lead Scraper application. They must perfectly mirror the deep-space, high-tech glassmorphism aesthetic established in the onboarding pipeline, providing a seamless transition for the user.

## 2. Visual & Aesthetic Theme
* **Background:** Deep navy/black (`#060e20`).
* **Ambient Glow:** A subtle radial gradient at the center or top-center using `#8455ef/15` fading into `#060e20` to spotlight the auth card.
* **Auth Card (Container):** Glassmorphic. Deep blue semi-transparent (`#091328/60`) with heavy backdrop blur (`backdrop-blur-[20px]`). 
* **Card Borders:** Asymmetric subtle borders (Top: `#ba9eff/20`, Bottom: `#699cff/10`, Sides: transparent). Drop shadow: `shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)]`.
* **Typography:** * Headings (e.g., "Welcome Back", "Create Workspace"): Clean, sans-serif, semi-bold, text color `#dee5ff`.
    * Subtitles: Text color `#a3aac4`.
    * Accents: Text transparent with background clip gradient (`from-[#ba9eff] to-[#699cff]`).

## 3. Layout Structure
* **Container:** `min-h-screen` flexbox, perfectly centering the auth card both vertically and horizontally.
* **Max Width:** The auth card should be narrower than the onboarding wizard (e.g., `max-w-md` or `max-w-lg`) to maintain focus.
* **Header:** App Logo (if applicable) followed by a primary H1 greeting and a brief subtitle.
* **Form:** Vertically stacked input fields with comfortable spacing (`gap-6`).
* **Footer:** A subtle text link to toggle between the Login and Signup states (e.g., "Don't have an account? **Sign up**").

## 4. UI Components

### A. Input Fields (Email, Password, Name)
* **Labels:** Small, uppercase, tracking wide (`text-[11px] tracking-[0.1em]`), colored `#ba9eff`.
* **Inputs:** * Background: Transparent.
    * Border: Bottom border only (`border-b border-[#40485d]/50`).
    * Text: `#dee5ff`, size `text-lg`.
    * Placeholder: `#a3aac4/50`.
    * Focus State: Outline removed, bottom border transitions to `#699cff` with a smooth duration (`transition-all duration-300`).

### B. Primary Buttons (Log In / Sign Up)
* **Style:** Pill or slightly rounded rectangle (`rounded-xl`).
* **Background:** Gradient from deep purple to light lavender (`bg-gradient-to-r from-[#8455ef] to-[#ba9eff]`).
* **Text:** Black (`#000000`), bold, tracking wide.
* **Hover State:** Slight upward translation (`-translate-y-0.5`), glowing drop shadow (`hover:shadow-[0_0_20px_0_rgba(186,158,255,0.3)]`).
* **Loading State:** Replaces text with a CSS spinner, changes background to disabled gray/blue (`#a3aac4`), reduces opacity.

### C. Secondary Actions / Social Auth (Optional)
* If using Google/GitHub auth, use a translucent button style.
* **Background:** `#060e20/50`.
* **Border:** `border border-[#40485d]/40`.
* **Hover State:** Background lightens slightly, text brightens.

## 5. View Configurations

### View 1: Login
* **Inputs:** Email, Password.
* **Extras:** "Forgot Password?" link aligned to the right above the password field (Text `#a3aac4`, hover `#dee5ff`).
* **CTA:** "Access Workspace" or "Log In".
* **Toggle:** "New to LeadScraper? **Create an account**".

### View 2: Sign Up
* **Inputs:** Full Name, Email, Password.
* **Extras:** Password strength indicator (optional, using colored bars: red, yellow, green depending on regex match).
* **CTA:** "Initialize Workspace" or "Sign Up".
* **Toggle:** "Already have a workspace? **Log in**".

## 6. Animations
* **Mounting:** The auth card should fade and slide in slightly upon page load (`animate-in fade-in slide-in-from-bottom-4 duration-500`).
* **Page Transitions:** Smooth cross-fade when toggling between Login and Signup states to avoid jarring jumps in layout height.