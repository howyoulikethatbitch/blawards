# BL AWARDS — WINDOWS DESKTOP APPLICATION

## MASTER IMPLEMENTATION PROMPT FOR REPLIT AI

You are building a complete, production-ready Windows desktop application called:

# BL Awards

This is a personal, permanent annual and legacy BL awards application.

The application is NOT intended to be hosted as a normal website.

It must be built as an **installable Windows desktop application (.exe)** using Electron, while the UI itself is built with React.

The application will be developed inside a **blank GitHub repository imported into Replit**.

You must create the complete project structure, source code, configuration, database layer, UI, business logic, Electron shell, updater system, testing, and Windows packaging.

---

# 1. MOST IMPORTANT INSTRUCTIONS

## 1.1 Build for permanence

This application is intended to be used for many years.

It must support:

- BL Awards 2026
- BL Awards 2027
- BL Awards 2028
- future annual seasons
- unlimited custom Legacy seasons

Do NOT hard-code the application around 2026.

2026 is simply the initial/default annual season.

The application architecture must remain usable for future years without rebuilding the application.

---

# 2. SOURCE OF TRUTH

The supplied:

**BL Awards Technical Design V2.1 Final**

is the original technical reference for the application's award system, evaluation system, season lifecycle, hidden rankings, eligibility, IndexedDB philosophy, import/export, and Awards Night concept.

However, this prompt contains the **updated product requirements**.

Therefore:

### Priority order

1. This prompt's updated requirements
2. BL Awards Technical Design V2.1
3. Reasonable implementation decisions necessary to make the application production-ready

Do not blindly preserve an old architecture when it conflicts with the updated requirements.

---

# 3. APPLICATION CONCEPT

BL Awards is a personal awards platform inspired by the presentation style of major awards ceremonies such as the Oscars and Grammys.

It is NOT:

- a public voting platform
- a social network
- a streaming service
- a review website
- a multi-user application
- a cloud database
- a subscription service

It is a private, single-user application for maintaining a personal BL database, evaluating titles, generating award nominees/winners, and conducting a cinematic personal Awards Night.

---

# 4. TECHNOLOGY STACK

Use:

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Dexie.js
- IndexedDB
- Framer Motion
- Lucide React
- Sonner or equivalent lightweight notification system
- electron-builder
- pnpm

Use modern stable versions compatible with each other.

Package manager MUST be:

# pnpm

Do not use npm or yarn.

All documentation and scripts should use pnpm commands.

---

# 5. ELECTRON ARCHITECTURE

Use a secure Electron architecture.

Requirements:

- contextIsolation: true
- nodeIntegration: false
- preload bridge where native functionality is required
- renderer must not have unrestricted Node.js access
- secure IPC
- no unnecessary filesystem access from renderer
- no remote code execution
- no unsafe webview usage

The renderer should behave like a normal React application.

Electron is responsible for:

- desktop window
- application lifecycle
- native update functionality
- packaging
- application version
- controlled native APIs

---

# 6. LOCAL-FIRST DATA ARCHITECTURE

The application must remain primarily local.

Use:

# IndexedDB + Dexie.js

Database:

`bl_awards_db`

Store locally:

- titles
- actors
- characters
- couples
- scenes
- evaluations
- award seasons
- nominations
- winners
- settings
- application state

Do NOT use:

- Firebase
- Supabase
- MySQL
- PostgreSQL
- MongoDB
- Replit Database
- cloud authentication
- cloud synchronization

There is no account system.

There is no login.

There is one user: the owner of the application.

The application must continue working offline.

---

# 7. CRITICAL NEW ARCHITECTURE:

# TITLE IS THE ONE SOURCE OF TRUTH

This is one of the most important changes.

## The Title database is the ONLY editable source of truth for title-related information.

The user should primarily manage BL information from:

# Database → Titles

The Title entry contains the complete information for that BL.

Other database tabs are derived/view-only representations of the Title data.

---

# 8. DATABASE NAVIGATION

The primary application navigation must contain these sections:

## 1. Overview

## 2. Database

- Titles
- Actors
- Characters
- Couples
- Scenes

## 3. Evaluations

## 4. Awards

- Awards Dashboard
- Awards Night
- Eligibility

## 5. Hall of Fame

## 6. Settings

The exact visual navigation can be adapted for desktop while remaining responsive on smaller screens.

---

# 9. LOADING / WELCOME PAGE

When the application launches, show a dedicated loading/welcome page.

Display:

# BL Awards 2026

Subtitle:

# Your personal BL awards platform

Primary button:

# Continue

The year displayed here should dynamically use the current/default active annual season rather than permanently hard-coding 2026.

Example:

BL Awards 2027

when the active annual season becomes 2027.

The page should feel polished and cinematic.

Use subtle animation.

Do not make it unnecessarily slow.

---

# 10. ONE SOURCE OF TRUTH — TITLE DATABASE

The Titles tab is the main database management interface.

It should support:

- Add Title
- Edit Title
- Delete Title
- Search
- filtering
- sorting
- poster display
- title details
- evaluation status
- award eligibility status

The Title form is the central data-entry form.

---

# 11. ADD TITLE FORM

The Add/Edit Title form must contain:

## Poster

Label:

Poster

Allow:

- Add from device
- Drag and drop

Supported:

- JPG
- JPEG
- PNG
- WEBP

Store the image locally in IndexedDB.

Preserve the poster's natural aspect ratio.

Do NOT distort posters.

Poster display should use:

`object-fit: cover` or another appropriate crop strategy only when necessary for a fixed UI container, while preserving the original source image.

---

## Title

Text input.

Required.

---

## Title Type

Options:

- Series
- Movie

Required.

---

## Year

Release year.

Required.

This determines Annual Awards eligibility.

Example:

BL Awards 2026

only considers titles released in 2026.

Legacy seasons do not have this restriction.

---

## Country

Use a searchable country dropdown.

Store a standardized country value.

The country is used by the Regional Excellence Awards.

---

## Genre

Allow one or multiple genres.

Use a predefined genre system.

The user must be able to select genres efficiently.

Do not make genre management unnecessarily complicated.

---

# 12. MAIN ACTORS + CHARACTERS

Each Title must support:

## Main Actor 1

## Character 1

## Main Actor 2

## Character 2

Actor names and character names should use:

# First name only

for this title-level relationship display.

Example:

Actor:\
Tee

Character:\
Duang

Actor:\
Por

Character:\
Qinn

The underlying Actor records may contain the actor's complete real name.

---

# 13. ACTOR DATA

When an actor is selected/entered from a Title:

- reuse an existing Actor record when one already exists
- avoid duplicate actors
- store the relationship between the Title, Actor, and Character
- preserve the actor's canonical full name separately from the title's first-name presentation

The Title remains the source of truth for the relationship.

---

# 14. ACTOR PHOTO

Actors can have an actor photo.

Allow:

- JPG
- JPEG
- PNG
- WEBP
- drag and drop

Store the photo in IndexedDB.

Actor photo is the source of truth for actor visuals.

Actor photos MUST always display as:

# PERFECT CIRCLES

Requirements:

- square rendering container
- border-radius: 50%
- object-fit: cover
- center crop
- never stretch
- never distort

The original aspect ratio of the source image must not cause an oval or rectangular display.

---

# 15. CHARACTER DATA

Characters are derived from Title entries.

The Characters tab is:

# VIEW ONLY

The user must NOT manually create an independent character record from the Characters tab.

Instead, character records are created/updated from Title entries.

Characters should display:

- character name
- actor
- actor circular thumbnail
- title
- character type
- relevant relationships

Character information must remain synchronized with its Title source.

---

# 16. ACTORS TAB

The Actors tab is:

# VIEW ONLY

Do not allow independent editing of title relationships here.

Display derived actor information.

Suggested presentation:

Spotify-style artist layout.

Each actor can display:

- circular photo
- full actor name
- country if available
- number of linked characters
- linked titles
- linked characters

If an actor's photo or canonical metadata requires editing, provide a controlled path back to the relevant source Title or actor metadata mechanism without breaking the one-source-of-truth rule.

Do not create conflicting duplicate actor information.

---

# 17. COUPLES

The Title form must contain the primary couple information.

Fields:

## Couple Name

The user may:

- manually enter a couple name
- leave it blank for automatic generation

If blank:

Automatically generate using the two actor first names.

Example:

Tee × Por

The application should also derive the character label:

Duang × Qinn

---

# 18. COUPLE VISUALS

Couple visuals must NOT rely on a single actor image.

A couple consists of two actors.

Display the two actor photos together in an overlapping:

# Venn-style layout

Requirements:

- two circular actor photos
- slight overlap
- balanced composition
- visually connected
- no stretching
- both photos remain circles

Example:

[Actor Photo 1] overlaps [Actor Photo 2]

Couple cards should display:

Actor Label:\
Tee × Por

Character Label:\
Duang × Qinn

Couple Type:\
Primary / Supporting

The couple visual is derived from the linked actors.

Do not duplicate actor image data unnecessarily.

---

# 19. COUPLES TAB

The Couples tab is:

# VIEW ONLY

Display:

- couple visual
- actor label
- character label
- title
- couple type

Do not create a separate competing source of truth.

Couple relationships originate from the Title.

---

# 20. SCENES

The Title form must include:

# Scene

Allow:

- Scene photo upload
- Drag and drop
- Scene title

Scene photo supports:

- JPG
- JPEG
- PNG
- WEBP

Scene images must be stored locally.

Scene images should be displayed as:

# 16:9 horizontal images

Use:

`object-fit: cover`

when displayed in a fixed 16:9 frame.

Do not stretch or distort the scene.

---

# 21. SCENES TAB

The Scenes tab is:

# VIEW ONLY

Display:

- scene image
- scene title
- linked BL title
- release year
- relevant metadata

Scene data originates from the Title.

---

# 22. TITLE DATABASE CARD

Each Title card should prominently show:

- poster
- title
- type
- year
- country
- genre
- actors
- characters
- couple
- scene availability
- evaluation status

Use a clean cinematic card design.

Avoid overcrowding.

---

# 23. AUTOCOMPLETE / PREDICTIVE SEARCH

Where relationships need to be selected, use autocomplete instead of large dropdowns.

Autocomplete must support:

- partial matching
- real-time filtering
- keyboard navigation
- Arrow Up
- Arrow Down
- Enter
- Escape
- Tab

Relevant searchable entities:

- Titles
- Actors
- Characters

Use IDs internally.

Never store only display text when a database relationship should exist.

---

# 24. OTHER TABS ARE DERIVED VIEWS

Actors, Characters, Couples, and Scenes must behave as database views generated from Title relationships.

They should not become independent conflicting databases.

If a Title is deleted:

- its related characters disappear
- its related couple relationship is cleaned
- its scene disappears
- derived actor relationships are updated

If a Title is edited:

all related views update automatically.

This is a critical data-integrity requirement.

---

# 25. DATA INTEGRITY

Use stable IDs.

Never rely on names as primary keys.

Implement safe cascading behavior.

Examples:

Deleting Title:

→ remove title relationship data

→ remove or safely orphan only data that is no longer referenced

→ preserve shared actor records when other titles still use them

Editing a Title:

→ update all derived relationships

→ do not create duplicates

---

# 26. EVALUATIONS

Evaluation is performed after the user has completed a title.

The user must never be shown predicted winners before Awards Night.

Evaluation uses:

# 1–10 ratings

for each applicable criterion.

Automatically calculate weighted scores according to the approved technical design.

Do not invent a different scoring system.

---

# 27. HIDDEN SCORES

Before Awards Night:

DO NOT display:

- individual criterion scores
- weighted scores
- total scores
- rankings
- predicted winners
- nominee ranking
- winner predictions

The user may only see:

# Evaluated

or equivalent status.

Scores remain locked/quarantined until the appropriate Awards Night reveal.

This requirement must be enforced in both:

- UI
- data/business logic

Do not merely hide scores with CSS.

---

# 28. EVALUATION PRESETS

Support the approved evaluation preset system:

## Standard Mode

## Full Academy Mode

Preset selection must follow the approved technical design.

The preset used for a season should be stored and locked appropriately.

---

# 29. AWARD CATEGORIES

Implement exactly these 28 categories.

## MAIN AWARDS

1. BL Of The Year
2. Best BL Series
3. Best BL Movie
4. Best Couple
5. Best Supporting Couple

## STORY AWARDS

6. Best Storyline
7. Best Originality
8. Best Ending

## CHARACTER AWARDS

9. Best Main Character
10. Best Green Flag
11. Best Red Flag

## COUPLE AWARDS

12. Best Chemistry
13. Best Kiss Scene
14. Hottest Couple Of The Year
15. Most Attractive Couple Of The Year

## PRODUCTION AWARDS

16. Best Acting
17. Best Lead Performance
18. Best Supporting Performance
19. Best Cinematography
20. Best OST
21. Best Scene

## REGIONAL EXCELLENCE AWARDS

22. Best Thai BL
23. Best Korean BL
24. Best Japanese BL
25. Best Taiwanese BL
26. Best Chinese BL
27. Best International BL

## SPECIAL

28. People's Choice

---

# 30. PEOPLE'S CHOICE

People's Choice is NOT score-based.

It is manually selected by the user.

It must support:

- Title
- Character
- Couple

The user selects their personal favorite.

Display the appropriate visual:

Title → poster

Character → actor photo + character name

Couple → two-actor Venn-style visual

---

# 31. ANNUAL AWARD SEASONS

Annual seasons follow:

# BL Awards {YEAR}

Example:

BL Awards 2026

Eligibility:

Only titles whose release year matches the annual award year.

Therefore:

BL Awards 2026

→ eligible titles must have Year = 2026.

---

# 32. LEGACY AWARD SEASONS

Support unlimited custom Legacy seasons.

Examples:

- BL Awards All-Time
- BL Awards Thai Favorites
- BL Awards Hall of Fame
- BL Awards Personal Favorites

Legacy seasons:

- have custom names
- can use titles from any release year
- do not require a release-year match

---

# 33. NOMINATION SYSTEM

Use the approved nomination system from the technical design.

Default:

# Top 5 nominees

Handle ties at the cutoff according to the approved design.

Do not expose hidden ranking information before the ceremony.

---

# 34. TIE / CLOSE COMPETITION

Use a configurable:

# Tie Threshold

If the score difference between leading candidates is within the configured threshold:

mark the category:

# CLOSE COMPETITION

During Awards Night, allow the user to manually select the winner.

Otherwise:

winner is automatically determined.

Do not reveal the close competition state prematurely if doing so would spoil the ceremony.

---

# 35. EMPTY CATEGORIES

If a category has no valid nominees:

# SKIP THE CATEGORY

Do not force an invalid nominee.

The ceremony should automatically proceed to the next category.

---

# 36. AWARDS DASHBOARD

Create an Awards Dashboard before the ceremony.

Display:

- total eligible titles
- evaluated titles
- unevaluated titles
- category readiness
- ready categories
- at-risk categories
- empty categories
- current season
- evaluation progress

Status examples:

# READY

# AT RISK

# EMPTY

Provide a clear path to:

# Begin Awards Night

---

# 37. AWARDS NIGHT

# THIS IS THE CROWN JEWEL OF THE APPLICATION

Awards Night must feel fundamentally different from normal database management.

It should feel like a real personal awards ceremony.

Do not display the normal management sidebar prominently during the ceremony.

Use a dedicated immersive ceremony mode.

---

# 38. AWARDS NIGHT VISUAL PHILOSOPHY

Style:

# Cinematic Luxury + Modern Minimalism

Palette:

- black
- charcoal
- deep theater red
- muted gold
- warm white

Typography:

- Playfair Display for major ceremonial headings
- Inter for interface/supporting text

Use:

- subtle gradients
- soft shadows
- gold highlights
- cinematic spacing
- elegant motion
- restrained particle effects if appropriate

Do NOT make it look like a generic dashboard.

---

# 39. AWARDS NIGHT ASSET HIERARCHY

Photos do NOT revolve only around actors.

The correct visual asset depends on the award category.

## TITLE-BASED AWARDS

Use the BL title's:

# POSTER

For:

- BL Of The Year
- Best BL Series
- Best BL Movie
- Best Storyline
- Best Originality
- Best Ending
- Best Cinematography
- Best OST
- Regional Excellence awards

Posters should preserve their aspect ratio.

---

## CHARACTER AWARDS

Use:

# ACTOR PHOTO

plus:

- character name
- actor name
- linked title

Examples:

Best Main Character

Best Green Flag

Best Red Flag

The actor photo is circular.

---

## COUPLE AWARDS

Use:

# TWO ACTOR PHOTOS

in the overlapping Venn-style layout.

Show:

Actor Label

Character Label

Linked Title where appropriate.

Use for:

- Best Couple
- Best Supporting Couple
- Best Chemistry
- Best Kiss Scene
- Hottest Couple Of The Year
- Most Attractive Couple Of The Year

---

## ACTING AWARDS

Use:

# ACTOR PROFILE PHOTO

Display:

- actor photo
- actor name
- linked BL title
- relevant character if available

Use for:

- Best Acting
- Best Lead Performance
- Best Supporting Performance

---

## SCENE AWARD

Use:

# SCENE IMAGE

Display:

- 16:9 scene image
- scene title
- linked BL title

For:

# Best Scene

---

## PEOPLE'S CHOICE

Visual depends on selected entity.

Title:

→ title poster

Character:

→ actor photo + character

Couple:

→ couple Venn-style visual

---

# 40. NOMINEE CARDS

Nominee cards must NOT be text-only whenever an appropriate visual exists.

Each nominee should use the correct visual hierarchy.

Examples:

Title:

Poster + title

Character:

Actor photo + character

Couple:

Two actor photos + couple name

Actor:

Actor photo + name

Scene:

Scene image + scene title

No giant empty image placeholders.

If an asset genuinely does not exist, use a tasteful designed fallback rather than leaving a broken image area.

---

# 41. AWARDS NIGHT CEREMONY FLOW

Use this sequence:

## Opening

Dark screen.

Subtle cinematic animation.

Display:

# BL AWARDS

Then:

# BL Awards 2026

or current season.

Then a short elegant opening transition.

---

## Optional Red Carpet

Allow an optional red-carpet/nominee introduction sequence.

This can be skipped.

---

## Category Introduction

Display:

# AND THE NOMINEES ARE...

Then show the category name.

Example:

# BEST CHEMISTRY

---

## Nominee Reveal

Reveal nominees:

# ONE AT A TIME

Use suspenseful transitions.

Do not dump all nominees instantly.

Each nominee receives:

- visual
- name
- title/context

---

# 42. SUSPENSE

Before winner reveal:

Display:

# ...

Then:

# AND THE WINNER IS...

Pause.

Then reveal the winner.

Timing should be controlled by:

# Animation Speed

in Settings.

---

# 43. WINNER REVEAL

Winner reveal must be dramatically different from nominee cards.

Use:

- gold glow
- gold border
- trophy animation
- winner badge
- elegant scale/fade animation
- large visual
- winner name
- category name

Winner's appropriate asset should become the focal point.

---

# 44. CLOSE COMPETITION

If category is within Tie Threshold:

Display a subtle:

# CLOSE COMPETITION

state only when appropriate during the ceremony.

Allow the user to choose:

# SELECT WINNER

from the finalists.

Do not reveal hidden numerical scores.

The user should choose based on their personal judgment without being shown the ranking numbers.

---

# 45. BL OF THE YEAR

# BL OF THE YEAR

must be the grand finale.

It should have the most prestigious presentation.

Use:

- longest suspense
- strongest cinematic transition
- largest visual treatment
- gold lighting
- trophy animation
- dramatic winner reveal

Do not reveal this category too early.

The user should feel like they are watching the final award of the ceremony.

---

# 46. CEREMONY ENDING

After BL Of The Year:

Show an elegant closing sequence.

Example structure:

# CONGRATULATIONS

Then:

# BL AWARDS {YEAR}

Then provide:

# View Winners

# View Hall of Fame

# Return to Dashboard

The ceremony should transition naturally into the historical results system.

---

# 47. HALL OF FAME

Hall of Fame should preserve historical results.

Display:

- most awarded titles
- most nominated titles
- highest win rate
- most awarded couples
- most awarded actors
- most awarded countries
- category history
- season history

Organize by:

- Annual seasons
- Legacy seasons
- category
- year

Do not destroy old ceremony results when starting a new annual season.

---

# 48. OVERVIEW

Overview should provide a concise dashboard.

Display:

- current award season
- total titles
- evaluated
- unevaluated
- eligibility status
- season status
- recent activity
- quick actions

Quick actions:

# Start Evaluating

# View Eligibility

# View Awards

# Begin Ceremony

---

# 49. SETTINGS

Settings must include:

## Appearance

- theme
- dark/light/system if implemented

## Ceremony

- animation speed

## Awards

- tie threshold
- evaluation preset defaults

## Data

- export
- import
- storage information
- delete all data

## Application

- current version
- update status
- check for updates

---

# 50. IMPORT / EXPORT

The application must support complete JSON export/import.

Export ALL important application data:

- titles
- posters
- actors
- actor photos
- characters
- couples
- scenes
- scene images
- evaluations
- award seasons
- nominations
- winners
- settings
- relevant application state

Images must be serialized safely.

Use a versioned export format.

Example:

`schemaVersion: "2.x"`

The import system must support older exports.

If an older export does not contain:

- actorPhoto
- poster
- scenePhoto
- other newly introduced fields

the application must safely assign defaults rather than fail.

Never silently destroy existing data.

---

# 51. DATABASE MIGRATIONS

Use explicit IndexedDB/Dexie database versioning.

Future application updates may change:

- fields
- relationships
- settings
- award categories
- season structures

The application must migrate old local data safely.

Never simply delete and recreate the database during an application update.

User data must survive:

- application restart
- application update
- new version installation

---

# 52. CRITICAL FEATURE:

# IN-APP APPLICATION UPDATE SYSTEM

The installed Windows application must be capable of updating itself when a newer official release is available.

Use Electron-compatible automatic updating, preferably:

# electron-updater

with:

# GitHub Releases

as the update provider.

---

# 53. UPDATE SOURCE

The official GitHub repository is the release source.

IMPORTANT:

A normal GitHub commit/push is NOT automatically treated as a released desktop version.

For an installed application to update reliably:

1. Developer changes source code
2. Changes are pushed to GitHub
3. A new version number is created
4. A GitHub Release is created
5. Electron Builder produces the Windows installer/update artifacts
6. The installed application checks the GitHub Release
7. If a newer version exists, show the update modal

Document this workflow clearly.

---

# 54. VERSIONING

Use semantic versioning:

Example:

`1.0.0`

`1.0.1`

`1.1.0`

`2.0.0`

The Electron application version must come from the package/application version.

Never hard-code the version separately in multiple places.

---

# 55. UPDATE CHECK

The application should check for updates:

- when launching, after the app is ready
- optionally periodically while the application remains open
- manually through Settings → Check for Updates

Do not repeatedly spam the user.

If offline:

Do nothing disruptive.

The application must continue functioning normally.

---

# 56. UPDATE MODAL

When an update is available, show a polished modal.

Example:

# A New Version Is Available

**BL Awards 1.1.0**

Your BL Awards application has a new update available.

Current version:\
1.0.0

New version:\
1.1.0

Optional release notes:

- Improved Awards Night
- Added new database features
- Performance improvements
- Bug fixes

Buttons:

# Update Now

# Later

Do not make the update modal look like a browser popup.

It should match the BL Awards visual identity.

---

# 57. UPDATE PROCESS

When the user clicks:

# Update Now

the application should:

1. begin downloading the update
2. show download progress
3. show an elegant progress indicator
4. prevent accidental interruption where appropriate
5. notify the user when the update is ready
6. allow restart/install

Use Electron's safe update mechanism.

Do NOT download arbitrary executable files from unknown URLs.

Only use the configured official GitHub release source.

---

# 58. UPDATE LATER

If the user chooses:

# Later

close the modal.

The application remains on the current version.

Do not repeatedly show the modal during the same session unless explicitly checking again.

A later launch may check again.

---

# 59. UPDATE FAILURE

If an update fails:

Show a friendly message:

# Update could not be completed

The existing application must continue working.

Never delete the existing installation because an update failed.

Provide:

# Try Again

and

# Continue Using BL Awards

---

# 60. UPDATE DATA SAFETY

Before applying an update:

# NEVER DELETE USER DATA.

The update must not reset IndexedDB.

The update must not remove:

- titles
- posters
- actors
- actor photos
- characters
- couples
- scenes
- scene photos
- evaluations
- awards
- settings
- Hall of Fame

Database migrations must preserve existing data.

---

# 61. GITHUB RELEASE WORKFLOW

Prepare the project so that the developer can:

```bash
pnpm install
pnpm dev
pnpm build
pnpm electron:build
```

and generate a Windows installer.

Use Electron Builder with a Windows NSIS installer.

Desired output example:

`BL-Awards-Setup-1.0.0.exe`

Configure the GitHub publishing/updating infrastructure appropriately.

Do not require Replit to remain running for the installed application.

After installation, the application should be independent of Replit.

---

# 62. IMPORTANT DISTINCTION:

# REPLIT IS DEVELOPMENT ENVIRONMENT ONLY

The finished Windows application must NOT depend on:

- Replit runtime
- Replit hosting
- Replit database
- Replit authentication
- Replit server

Replit is simply being used to develop the application.

The final application runs locally on Windows.

---

# 63. OFFLINE-FIRST BEHAVIOR

The application must work without internet for:

- database management
- evaluation
- viewing awards
- viewing Hall of Fame
- importing/exporting
- Awards Night
- settings

Internet is only needed for optional features such as:

# checking for application updates

Do not make normal application functionality dependent on an internet connection.

---

# 64. RESPONSIVE DESIGN

Primary target:

# Windows desktop

But the UI must also remain responsive for smaller screen sizes.

Use responsive layouts.

The application should not break when resized.

Awards Night should adapt elegantly to:

- desktop
- laptop
- smaller window sizes

---

# 65. PERFORMANCE

Optimize for a personal database that may eventually contain hundreds or thousands of titles and many images.

Requirements:

- IndexedDB for image storage
- avoid Base64 duplication where possible
- use Blob storage
- lazy-load large images when appropriate
- revoke object URLs when no longer needed
- avoid unnecessary React rerenders
- use memoization where beneficial
- avoid loading every image simultaneously
- keep Awards Night transitions smooth

Do not sacrifice reliability for micro-optimizations.

---

# 66. VISUAL DESIGN

Overall design:

# CINEMATIC DARK LUXURY

Colors:

- black
- charcoal
- deep theater red
- gold
- warm white

Typography:

# Playfair Display

for:

- award titles
- major headings
- ceremony moments

# Inter

for:

- navigation
- forms
- labels
- metadata
- buttons

Use gold primarily for:

- winners
- important highlights
- ceremony accents
- trophy elements

Do not turn every element gold.

---

# 67. MICRO-INTERACTIONS

Use subtle animation.

Examples:

- card hover
- poster hover
- page transitions
- modal transitions
- winner reveal
- trophy animation
- category transition
- progress indicators

Animations should feel:

# Elegant

not:

# flashy/gimmicky

---

# 68. NO UNNECESSARY FEATURES

Do NOT add:

- user accounts
- login
- social profiles
- public voting
- comments
- chat
- subscriptions
- advertisements
- cloud sync
- unnecessary backend
- unnecessary analytics
- unnecessary third-party services

This is a personal application.

Keep it focused.

---

# 69. DATA RELATIONSHIP PRINCIPLE

The most important data relationship is:

# TITLE → everything related to that BL

A Title is the central source.

From the Title:

→ Actors

→ Characters

→ Couple

→ Scene

→ Evaluation

→ Award eligibility

→ Awards

→ Hall of Fame relationships

Actors/Characters/Couples/Scenes are views/derived entities rather than independent competing sources of title information.

---

# 70. DO NOT DUPLICATE IMAGES

If an actor appears in:

- Actors
- Characters
- Couples
- Awards Night

do not create separate copies of the same actor image unnecessarily.

Use the canonical actor photo.

If a couple contains two actors:

derive the couple visual from the two canonical actor photos.

If a character belongs to an actor:

derive the character thumbnail from the actor photo.

---

# 71. AWARDS NIGHT IMAGE RULE

Always use the correct visual source.

Hierarchy:

TITLE AWARD\
→ Title Poster

CHARACTER AWARD\
→ Actor Photo + Character

COUPLE AWARD\
→ Two Actor Photos + Couple Labels

ACTING AWARD\
→ Actor Photo

SCENE AWARD\
→ Scene Photo

PEOPLE'S CHOICE\
→ visual based on selected entity

Do not force actor photos into awards where a title poster or scene image is the correct visual.

---

# 72. ERROR HANDLING

Every major operation must handle errors gracefully.

Examples:

- failed image import
- invalid JSON
- corrupted data
- failed migration
- duplicate relationship
- missing actor
- missing character
- missing poster
- missing scene image
- failed update
- failed packaging

Show user-friendly messages.

Do not expose raw stack traces to normal users.

---

# 73. EMPTY STATES

Create polished empty states.

Examples:

No Titles:

# Your BL database is empty.

Add your first BL title to begin building your Awards universe.

No Evaluations:

# No evaluations yet.

Complete a title evaluation to prepare for Awards Night.

No Awards:

# Awards Night isn't ready yet.

Complete the required evaluations first.

Do not use ugly blank screens.

---

# 74. ACCESSIBILITY

Implement:

- keyboard navigation
- visible focus states
- semantic buttons
- proper labels
- accessible dialogs
- accessible autocomplete
- sufficient contrast
- Escape-to-close modals where appropriate

---

# 75. TESTING

Before considering the application complete, test:

## Database

- add title
- edit title
- delete title
- duplicate prevention
- relationships
- image storage
- persistence after restart

## Derived views

- actor creation/association
- character association
- couple derivation
- scene derivation
- updates after title edit

## Evaluations

- scoring
- weighted calculation
- locking
- hidden rankings
- preset behavior

## Awards

- eligibility
- nomination generation
- tie threshold
- close competition
- winner determination
- empty category skipping

## Awards Night

- nominee reveal
- correct images
- winner reveal
- close competition
- BL Of The Year finale
- ceremony completion

## Import/Export

- export
- import
- images
- old-format import
- data integrity

## Application lifecycle

- close
- reopen
- restart Windows
- update
- database migration

## Update system

- no update available
- update available
- update modal
- update download
- update failure
- cancel/later
- restart after update

---

# 76. BUILD REQUIREMENTS

The final project must successfully support:

```bash
pnpm install
```

```bash
pnpm dev
```

```bash
pnpm build
```

```bash
pnpm electron:build
```

The Windows packaging process must produce an installable `.exe`.

The final installed application must launch independently of Replit.

---

# 77. PROJECT STRUCTURE

Use a clean maintainable architecture.

Suggested structure:

```text
src/
  components/
  pages/
  layouts/
  hooks/
  contexts/
  services/
  db/
  models/
  types/
  constants/
  utils/
  features/
    titles/
    actors/
    characters/
    couples/
    scenes/
    evaluations/
    awards/
    ceremony/
    hall-of-fame/
    settings/

electron/
  main/
  preload/
  updater/

public/

tests/

electron-builder.yml
package.json
pnpm-lock.yaml
vite.config.ts
tsconfig.json
```

You may improve this structure if there is a strong technical reason.

Do not create unnecessary layers.

---

# 78. CODE QUALITY

Write production-quality TypeScript.

Avoid:

- any abuse
- duplicated business logic
- giant components
- hard-coded award calculations throughout UI components
- hard-coded years
- duplicated image processing
- duplicated database queries
- unnecessary dependencies

Centralize:

- award definitions
- scoring logic
- eligibility logic
- season logic
- migration logic
- image handling
- updater logic

---

# 79. IMPORTANT: DO NOT CREATE A TEMPORARY MOCKUP

Do not build a fake prototype containing:

- placeholder buttons that do nothing
- fake database records
- fake Awards Night
- fake update modal
- fake evaluation scores
- static award results

All major functionality must be real.

If a feature cannot be fully implemented, identify the limitation rather than pretending it works.

---

# 80. IMPLEMENTATION ORDER

Because this repository is blank, implement in this order:

### Phase 1

Project setup

- pnpm
- React
- TypeScript
- Vite
- Tailwind
- Electron
- Electron Builder

### Phase 2

Secure Electron architecture

### Phase 3

Dexie database

### Phase 4

Database migration system

### Phase 5

Title source-of-truth system

### Phase 6

Derived Actors / Characters / Couples / Scenes views

### Phase 7

Image storage

### Phase 8

Evaluations

### Phase 9

Awards engine

### Phase 10

Awards Dashboard

### Phase 11

Awards Night

### Phase 12

Hall of Fame

### Phase 13

Import/Export

### Phase 14

Application updater

### Phase 15

Settings and polish

### Phase 16

Testing

### Phase 17

Windows packaging

#

# FINAL PRODUCT GOAL

The finished application should feel like:

# "My Personal BL Academy Awards"

It should combine:

- a beautiful BL database
- a serious evaluation system
- a personal awards engine
- a cinematic Awards Night
- a permanent historical archive
- a reliable Windows desktop application

The user should be able to install BL Awards once and continue using it for many years.

The application should feel polished enough that opening:

# BL Awards 2026

feels like opening a real personal awards archive.

Then, in future years:

# BL Awards 2027

# BL Awards 2028

and beyond should naturally become part of the same permanent application.

Build for longevity, data safety, maintainability, and ceremony-quality presentation.

DO NOT treat this as a disposable demo.

BUILD IT AS THE PERMANENT BL AWARDS APPLICATION.
