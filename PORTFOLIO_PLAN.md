# Davo's Portfolio — Planning Doc

> Read this in full before doing anything. The working style section is non-negotiable.

---

## Who you're working with

**Davo** (David Bunton), UX/software designer at Atlassian, based in Newtown, Sydney. New to coding but uses Claude Code for LLM-assisted development. Casual tone, direct. Enjoys sparring on ideas. Strong design instincts — trust them.

---

## Working style — strictly follow this, every session

### Before any code is written
At the start of every session, go back and forth with Davo to fully understand and shape exactly what's going to be worked on. Do not start planning or asking design questions until he signals he's ready. Follow his lead on pacing entirely.

### Session structure
1. **Plan upfront first.** Discuss and align on what's being built before writing a single line of code. Make sure the right thing is being built before building it.
2. **Break work into small, testable phases.** Once the plan is agreed, decompose into the smallest possible discrete chunks. Share the full phased plan back with Davo for review and sign-off before starting any work.
3. **Test thoroughly before moving on.** Davo tests each phase fully before the next begins. Nothing moves forward until the current phase is confirmed working. Baby steps all the way.

**Why:** Rushing ahead creates fragile foundations and a debugging spiral. Baby steps with thorough testing keeps the codebase and UI solid throughout.

---

**Site:** https://davidbunton.design/
**Repo:** davobunton/davobunton.github.io
**Status:** index.html is currently a bare `<h1>Coming soon</h1>`. BubbleBlitz is live at /bubbleblitz.
**Repo not yet cloned locally.** Clone into `/Users/davidbunton/Code-n-shit/Folio/` — that's where everything lives.
**No `gh` CLI** — use `curl` + GitHub API or `git` for repo operations.

---

## Build scope (near-term)

Over the next week or so: build the **skeleton framework** only. Most content goes in after Davo's Apex performance review in June — that's when his narrative will be written and tight. The folio UI should be built to receive that content, not dependent on it.

---

## Information Architecture

### Pages

| Page | Nav label | Notes |
|------|-----------|-------|
| Projects | `Projects` | 3 case studies with sandbox experiences |
| AI Lab | `AI Lab` | Agent vision work + BubbleBlitz |
| About | `About` | Personal bio, contact, CV |

### Projects (case studies)
1. **Recurring Work in Jira** — introduced and led design; includes Jira's first contextual, inline configurable automation
2. **Formula Fields in Jira** — calculated fields based on other field data (numbers, text, dates); introduced and led design
3. **Guest Access in Jira** — introduced and finished design

### AI Lab
- Agent vision work — viewing, managing and orchestrating agents in Jira spaces; understanding and analysing agent and work data
- BubbleBlitz — browser bubble shooter game built in ~1hr with Claude Code

---

## Navigation

### Header (sticky)

**Left:** `Projects` (with hover/focus flyout) · `AI Lab` · `About`
**Right:** `Get in touch` (popover) · `CV ↓` (download)

### Projects hover/focus flyout
Hovering or focusing `Projects` reveals a floating flyout panel listing the 3 case studies — name + one-liner — for quick skimming and direct navigation. Clicking `Projects` itself goes to the full Projects page.

**Keyboard behaviour (accessibility):**
- `Tab` → focus on `Projects`, flyout appears
- `Enter` → navigate to Projects page
- `↓` (Down arrow) → enter flyout, navigate items with arrow keys
- `Tab` (again, while focused on `Projects`) → flyout closes, focus moves to next nav item (`AI Lab`)
- `Escape` → close flyout, focus returns to `Projects`
- Rationale: mirrors mouse hover experience for keyboard users. More discoverable than Apple's chevron pattern (which requires a separate focusable element and hides the flyout behind it).

### Get in touch (popover — right side of header)
Opens a simple popover with email and LinkedIn link.

### CV download (right side of header)
Inline download link styled as: `CV [download icon]`

### Footer (non-sticky)
Content TBD. Likely: copyright, LinkedIn, "designed & built by Davo" or similar. Keep minimal.

---

## Project Deep Dive Page Structure

Each deep dive follows the same **principles** but not a rigid template — structure flexes to serve each project's bespoke story. No over-optimising for literal consistency at the cost of narrative quality.

**Shared principles (every deep dive has these):**
1. **Hero** — project name, Davo's role, 1-2 killer stats upfront
2. **The challenge** — what problem existed, what the opportunity was
3. **[Bespoke middle chapters]** — flex to fit the story. Examples:
   - Recurring Work: "Jira's first contextual inline automation" + "The pivot" (both are centrepieces, equal billing)
   - Formula Fields: navigating an incredibly complex problem space, Jira constraints, how Davo solved them
   - Guest Access: has its own pivot beat
4. **The process** — frameworks, prototypes, research inputs, craft decisions
5. **Research** — SEQ testing, usability scores, what was validated and informed
6. **The outcome** — impact metrics, what shipped
7. **Try it** — MVP sandbox experience with simple guided tasks for the user

**Sandbox:** Minimum viable — interactive recreation of the feature, guided tasks. Scope each one deliberately when we get there.

---

## AI Lab Page Structure

*TBD — to be discussed.*

---

## About Page

Likely includes:
- Short personal bio
- Email + LinkedIn (contact)
- CV download link
- *Anything else TBD*

---

## UI Philosophy & Visual Direction

**Vibe:** Apple / Google product page energy. Pinterest-level thematic inspo — don't take every detail literal, it's the interaction, animation, and overall look and feel. Cinematic, high production value, scroll-driven, breathing room, short punchy copy.

**Inspo references (saved locally in `apple_google_examples/`):**
- Apple homepage — centered hero layout reference
- Apple MacBook Neo deep dive — project deep dive structure and scroll animation reference
- Apple iPhone 17 Pro deep dive — narrative chapter structure reference
- Google Pixel 10 Pro deep dive — similar energy, slightly warmer tone

---

### Core principles (derived from Apple/Google code analysis)

**Scroll is the controller.**
Scroll position drives everything — media playback, section reveals, animation triggers. Nothing autoplays on load. Nothing triggers on hover. The user's scroll is the remote control.

**Named section chapters.**
Each section is a discrete, self-contained moment. A project deep dive is a sequence of chapters, not a long scroll of mixed content. Each chapter has one job and one cinematic moment.

**Scroll-triggered media playback.**
Hero videos/GIFs start playing the moment they enter the viewport and stop when they exit. Precise keyframe triggers based on scroll position. Static start/end frame images as graceful fallbacks.

**StaggeredFadeIn.**
As a section enters view, headline → subtext → supporting elements fade/slide in sequentially. Gives rhythm and life. Never all at once.

**Pinned/sticky media.**
Key visuals lock to the screen while text scrolls alongside them. The media "holds" while the story moves past it.

**Visual interest comes from content, not decoration.**
Screenshots, GIFs, sandbox demos carry the visual weight. The layout and UI chrome get out of the way. No decorative flourishes.

**Typography that breathes.**
Large headlines. Generous whitespace. Short, punchy copy — one idea per line. Nothing crowded.

**Tonal backgrounds, no hard borders.**
Near-white base (Apple uses `#f5f5f7`). Sections alternate between light and slightly darker tones for separation. No visible borders between sections.

---

### Projects overview page layout

Each project is a centered, full-width moment. Same pattern, repeat for each project as you scroll:

```
[Hook — most surprising stat or selling point]
[One-line description]
[CTA: "See the story →"]
[Hero GIF / hero shot]
```

Everything center-aligned. Clean. Confident. Scannable.

---

### Project deep dive page layout

Scroll-driven chapters. Each section is a named, discrete moment.

**In-page sticky local nav** (appears after scrolling past hero, like Apple product pages):
- Lets users jump between: Challenge → Process → Research → Outcome → Try It
- Disappears above the hero, appears on scroll

**Chapter structure (flex per project — see Project Deep Dive Page Structure above):**
- Hero: project name, role, 1-2 killer stats. Big, cinematic.
- Each chapter: section title fades in → key visual pins/locks → supporting text slides in alongside → scroll → next chapter begins
- Final chapter: Try It sandbox

---

## Colour Palette & Typography

### Mode
Dark mode only. Opinionated. No toggle.

### Surface depth tokens
```
--color-sunken:         #080809  ← darker than bg, for inset surfaces (sandbox containers, inputs)
--color-bg:             #0d0d0f  ← base background (near black, subtle cool tint)
--color-surface:        #141416  ← lifted cards, sections
--color-surface-raised: #1c1c20  ← even more elevated elements
--color-overlay:        #242428  ← popovers, modals, sidebars (Get in touch, nav flyout)
```

### Text
```
--color-text-headline:  #e8e8ee  ← cool off-white, not harsh pure white
--color-text-body:      #c4c4cc  ← light metallic grey
--color-text-muted:     #8a8a92  ← secondary / muted text
```

### Borders & dividers
```
--color-border:         #2a2a2e  ← subtle industrial separation
```

### Accent
```
--color-accent:         #b31b3a  ← deep cinematic crimson, signature colour
```
One signature accent only. Used sparingly and deliberately. Grey scale does the heavy lifting everywhere else. No second accent — keeps it from looking cluttered or festive.

### Inspo references (saved locally in `screenshots/colorpaletteinspoexamples/`)
5 dark portfolio/UI examples showing: near-black bases, bold single accents (gold, purple, red), industrial metallic greys, high contrast.

---

## Typography

- **Headlines:** `Space Grotesk` — geometric, slightly engineered, distinctive. Fits the industrial dark vibe.
- **Body:** `Inter` — bulletproof legibility on dark backgrounds.
- Both free via Google Fonts, no licensing needed.

---

## Tech Stack

Vanilla HTML, CSS, JavaScript. No frameworks, no build tools, no dependencies.
- GitHub Pages is static hosting — no server needed
- Keeps the codebase simple and readable
- Scroll animations via native Intersection Observer API + CSS transitions
- Deploys directly, nothing to configure

---

## Session log

| Date | What was covered |
|------|-----------------|
| 2026-05-24 | Full IA, nav structure, flyout pattern, keyboard accessibility, page list, project list, AI Lab framing, UI philosophy fully locked, project deep dive structure locked, projects overview layout locked, colour palette locked, typography locked, tech stack locked |
