# India: Statecraft

A browser-first, real-time geopolitical and socio-economic strategy game inspired by *OpenFront.io* and *Dummynation*.

Take the mantle of Chief Minister of any of India's 28 states. Manage public finances, direct industrial and agricultural development, construct water reservoirs, connect transit corridors with neighboring states, and lead your state through democratic 5-year electoral mandates within India's constitutional federal framework.

---

## 🏛️ Key Features

- **All 28 States & 8 Union Territories Playable**: Pick any Indian state from day one, from Kerala to Himachal Pradesh, Gujarat to Assam.
- **Deep Constitutional Realism**: Experience cooperative and competitive federalism—no state armies or state-on-state wars. Manage state revenues (SGST, excise, stamp duty, central transfers) without personal income tax.
- **Interactive MapLibre GIS Map**: High-performance WebGL map with crisp state borders, rivers, terrain relief, and 12 thematic visualization modes (Economy, Population, Industry, Agriculture, Water, Happiness, and more).
- **Decoupled Simulation Engine**: Pure TypeScript simulation engine running off the main thread in a Web Worker for single-player, ready for future authoritative multiplayer server sessions.
- **Guest-First & Cloud Ready**: Start instantly in guest mode with local IndexedDB saving. Optional Google authentication via Supabase with automatic save migration.

---

## 📂 Repository Structure

```text
india-statecraft/
├── apps/
│   ├── web/                     # React 18 + Vite + MapLibre GL frontend application
│   └── server/                  # Reserved for future multiplayer edge services
├── packages/
│   ├── shared-types/            # Canonical TypeScript interfaces (GameState, StateData, etc.)
│   ├── game-data/               # Real starting data for 28 states and 8 UTs (RBI/MoSPI baselines)
│   ├── map-data/                # Map layers, GeoJSON helpers, color scales, and mode styles
│   └── simulation/              # Headless, deterministic simulation engine
├── docs/                        # Complete technical and game design specs
│   ├── GAME_DESIGN.md           # Game vision, loop, and player mechanics
│   ├── TECHNICAL_ARCHITECTURE.md # Architecture, hosting, auth, and multiplayer roadmap
│   ├── MAP_DATA_SPEC.md         # Geographic data layers and 12 dynamic map modes
│   └── SIMULATION_RULES.md      # Economic, hydrological, and electoral rules
├── tests/                       # Automated unit and integration tests
├── package.json                 # Monorepo configuration
└── README.md                    # Project documentation & beginner guide
```

---

## 🚀 Beginner Quickstart Guide

### Prerequisites
1. **Node.js (LTS version 20 or higher)**: Check by opening PowerShell or Terminal and running:
   ```bash
   node -v
   npm -v
   ```
2. **Git**: Installed for version control.

### Step 1: Install Dependencies
From the root folder of the project, run:
```bash
npm install
```

### Step 2: Start the Local Development Server
To launch the game in your browser:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`. You will see the interactive map of India with live map mode switching, state selection, and simulation metrics.

### Step 3: Run Tests & Quality Checks
To verify that all simulation rules and state datasets pass validation:
```bash
npm test
```

### Step 4: Build for Production
To generate an optimized web bundle:
```bash
npm run build
```
The compiled files will be located in `apps/web/dist`.

---

## ☁️ Cloudflare Pages Deployment Setup

This project is configured out-of-the-box for **Cloudflare Pages**.

### Automatic Deployment via GitHub
1. Push this repository to your GitHub account:
   ```bash
   gh repo create india-statecraft --public --source=. --remote=origin --push
   ```
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
3. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
4. Select the `india-statecraft` repository.
5. Configure the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `apps/web/dist`
   - **Root directory**: `/`
6. Click **Save and Deploy**. Cloudflare will automatically build and publish your game to a live `.pages.dev` URL on every commit!

---

## 🔒 Security & Environment Configuration

Copy `.env.example` in `apps/web` to `.env` if using Supabase Cloud Sync:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```
> **Security Warning**: Never commit secret keys or `service_role` tokens to frontend client code or Git.

---

## 📜 License
MIT License. Open-source strategy gaming for education and entertainment.
