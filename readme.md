# ⚡ Velocité — Native View Transition Micro-Patterns

A micro-gallery of modern **View Transitions API** techniques — built with plain HTML, CSS, and JavaScript.  
No frameworks, no GSAP, no external animation libs — just the new **browser-native animation pipeline**.

<img src="https://developer.chrome.com/docs/web-platform/view-transitions/cover.png" alt="View Transitions cover" width="640">

---

## 🧭 Overview

**Velocité** showcases several common motion patterns implemented with `startViewTransition()` and named transition regions:

| Pattern | Description |
|:--|:--|
| 🔄 **Card Morph** | Shared element swap (grid → detail) using matching IDs. |
| 🧭 **Command Menu** | Drawer overlay with backdrop + sheet transitions. |
| 🔔 **Toast** | Entry/exit animation with shared element region. |
| 🧩 **Tabs** | Partial transition scoped to the tab panel container. |

Each interaction uses **View Transitions**, with progressive fallback when unsupported.

---

## 🧱 Stack

| Layer | Tech |
|:--|:--|
| Markup | HTML5 templates (`<template>`) for routes |
| Style | CSS (Scoped tokens + View Transition names) |
| Logic | Vanilla JS (no dependencies) |
| Motion | `startViewTransition()` API |
| Fonts | [Bakbak One](https://fonts.google.com/specimen/Bakbak+One) + [Mulish](https://fonts.google.com/specimen/Mulish) |
| Icons | [Font Awesome 6.5](https://fontawesome.com/) |

---

## 🚀 Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/velocite.git
cd velocite

# Open in VS Code (optional)
code .

# Run a lightweight dev server (for example, using Python)
python3 -m http.server 8080
