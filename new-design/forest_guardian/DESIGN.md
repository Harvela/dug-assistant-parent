# Design System Strategy: The Supportive Sentinel

## 1. Overview & Creative North Star
The creative North Star for this design system is **"The Editorial Guardian."** 

Parenting is often chaotic; the interface must be the antithesis of that chaos. We are moving away from the "app-as-a-tool" aesthetic and toward an "app-as-a-concierge" experience. By utilizing high-end editorial typography, intentional white space, and a sophisticated, layered approach to surfaces, we create an environment that feels authoritative yet deeply supportive. 

This system rejects the rigid, boxy constraints of standard Material Design. Instead, it embraces **Asymmetric Balance**: using varying card heights, staggered information blocks, and floating action elements to guide the eye naturally. The goal is to make data-heavy parenting insights feel like reading a premium lifestyle magazine—legible, curated, and calm.

## 2. Colors
Our palette is rooted in nature and stability, utilizing high-contrast tones to ensure critical information is never missed.

*   **Primary Branding:** `primary` (#13423D) and `primary_container` (#2D5A54). Use these for the "Identity Layer"—logos, active states, and primary CTAs.
*   **The Foundation:** `surface` (#F4FBF8). A soft mint that reduces eye strain compared to pure white.
*   **The Signal System:** 
    *   **Urgent:** `secondary` (#A33B3D) for critical fees or alerts.
    *   **Caution:** `tertiary_fixed_dim` (#E7C268) for medium-risk warnings.

### The "No-Line" Rule
**Strict Prohibition:** 1px solid borders are forbidden for sectioning or card containment. 
Boundaries must be defined through background color shifts. A `surface_container_low` card sitting on a `surface` background provides all the separation a user needs. This keeps the UI "breathable" and premium.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
*   **Level 0 (Base):** `surface`
*   **Level 1 (Sections):** `surface_container_low`
*   **Level 2 (Active Cards):** `surface_container_lowest` (Pure White)
By placing Level 2 on Level 1, we create a natural "lift" that guides the user’s focus toward actionable data without visual clutter.

### Signature Textures
To add "soul," use a subtle linear gradient on primary action buttons or header backgrounds, transitioning from `primary` (#13423D) to `primary_container` (#2D5A54) at a 135-degree angle.

## 3. Typography
We utilize a pairing of **Manrope** (Display/Headlines) and **Work Sans** (Body/Labels) to balance character with utility.

*   **Display & Headlines (Manrope):** These are your "Editorial Voice." Large scales (`display-lg` at 3.5rem) should be used for milestone data or empty states to provide a bold, confident personality.
*   **Title & Body (Work Sans):** Chosen for its exceptional legibility at smaller scales. Use `title-lg` for card headers to maintain a professional, trustworthy tone.
*   **The Hierarchy Goal:** Typography shouldn't just label; it should direct. Use the contrast between the geometric Manrope and the functional Work Sans to separate "Insights" from "Instructions."

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** and light physics, not heavy shadows.

*   **The Layering Principle:** Stack `surface_container` tiers to create hierarchy. A "High" tier container should hold the most critical data summary, while "Low" tiers are for background context.
*   **Ambient Shadows:** If an element must float (e.g., a bottom navigation bar or a floating action button), use a shadow with a blur radius of 24px and an opacity of 6%, tinted with `primary` (#13423D). This creates an "organic" lift rather than a digital drop-shadow.
*   **The "Ghost Border" Fallback:** In rare accessibility cases where a border is needed, use `outline_variant` (#C0C8C6) at **15% opacity**.
*   **Glassmorphism:** For overlays or navigation headers, use `surface` at 80% opacity with a `backdrop-filter: blur(12px)`. This keeps the parent feeling connected to the content beneath the "glass."

## 5. Components

### Buttons
*   **Primary:** Solid `primary_container`, `xl` (1.5rem) roundedness. Text in `on_primary`. 
*   **Secondary:** `surface_container_highest` background with `primary` text. No border.
*   **Tertiary:** Text-only in `primary`, bold weight, for low-emphasis actions.

### Cards & Lists
*   **The Divider Rule:** Divider lines are strictly prohibited. Use 24px or 32px of vertical white space to separate list items. 
*   **Contextual Cards:** Cards must use `lg` (1rem) or `xl` (1.5rem) corner radii. To indicate status (e.g., a "Medium Risk" alert), place a 4px vertical accent bar of `tertiary` color on the far left edge of the card, rather than coloring the whole card.

### Input Fields
*   **Styling:** Use `surface_container_low` as the fill color. On focus, shift the background to `surface_container_lowest` and add a "Ghost Border."
*   **Supportive Text:** Helper text should always use `body-sm` in `outline` color to provide a gentle guiding hand.

### Additional Signature Components
*   **Status Pills:** High-contrast capsules for "Medium" or "Urgent" risks. Use `secondary_fixed` for the background and `on_secondary_container` for text to ensure the "Warning" feels integrated into the palette, not "stuck on."
*   **Insight Tiles:** Small, square `surface_container_lowest` tiles for quick stats (e.g., "Attendance: 98%"). Use `display-sm` for the number to make it the hero of the tile.

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. If you have two cards, try making one 60% width and the other 40% to create editorial interest.
*   **Do** prioritize white space. If a screen feels "full," it is failing the parent.
*   **Do** use `on_surface_variant` for secondary information to create a clear visual hierarchy against the primary `on_surface` text.

### Don't
*   **Don't** use 100% black. Always use `on_background` (#161D1B) for text to maintain the "soft" sophisticated feel.
*   **Don't** use sharp corners. Everything in this system must feel "safe" and "supportive"—keep corners between `md` and `xl`.
*   **Don't** crowd the edges. Maintain a minimum of 24px padding on all screen edges to ensure the "Editorial" breathing room.