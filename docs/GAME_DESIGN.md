# India: Statecraft — Game Design Document (GDD)

## 1. Executive Summary & Vision
**India: Statecraft** is a browser-first, real-time geopolitical and socio-economic strategy game inspired by titles like *OpenFront.io* and *Dummynation*. 

In **India: Statecraft**, the player assumes the office of Chief Minister (CM) of one of India's 28 states. The remaining 27 states (and 8 Union Territories) are governed by realistic AI agents in single-player mode. The game simulates the complex governance, economic development, public finance, resource management, and cooperative-federal dynamics of modern India within its constitutional framework.

---

## 2. Core Pillars & Constitutional Boundaries

### 2.1 The Constitutional Principle of Cooperative & Competitive Federalism
Unlike traditional grand strategy or map-painter games, **Indian states cannot declare war on or conquer each other**. 
- The Constitution of India defines India as a *Union of States*. The Union Government holds exclusive sovereignty over external defense, foreign relations, atomic energy, currency, and international trade treaties (Union List).
- State Governments govern subjects under the State List (public order, police, public health, agriculture, water supplies, land) and share Concurrent List responsibilities (education, electricity, economic planning).
- **Victory Condition**: Victory is not military subjugation. Success is measured by the **State Prosperity & Human Development Index (SP-HDI)**, economic resilience, sustainability, fiscal stability, voter trust, and contributions to national development over multi-year electoral mandates.

### 2.2 Realistic Constitutional Boundaries
- **No Private State Militias**: States do not possess independent armed forces. States contribute to national security via state police modernization, recruitment drives for the Indian Armed Forces, border infrastructure assistance, and civil defense.
- **No Independent Treaties**: States cannot sign bilateral defense treaties or sovereign foreign pacts. However, they can engage in *commercial diplomacy*—attracting foreign direct investment (FDI), establishing international trade promotion offices, hosting global investor summits, and entering technological partnerships approved by the Union.
- **Port & Transit Cooperation**: Landlocked states (e.g., Madhya Pradesh, Bihar, Haryana) must negotiate transit agreements, dry port linkages, and freight corridors with coastal states (e.g., Gujarat, Maharashtra, Andhra Pradesh, Tamil Nadu, Odisha) to export goods efficiently.

---

## 3. Player Experience & Game Loop

### 3.1 The 5-Year Electoral Cycle
Every in-game month represents a tick of progress, with an election occurring every **5 in-game years (60 ticks)**.
1. **Assessment & Budgeting (Quarterly/Annual Cycle)**:
   - Review state revenue receipts (SGST collections, State Excise, Stamp Duty, Motor Vehicle Taxes, Non-Tax Revenues, and Union Finance Commission transfers).
   - Formulate the Annual State Budget: balance capital expenditure (CapEx) against revenue expenditure (salaries, pensions, subsidies, debt servicing).
2. **Infrastructure, Industry & Policy Directives**:
   - Zone industrial corridors, agro-processing parks, knowledge/IT hubs, and logistics nodes.
   - Invest in water conservation, multi-purpose river dams, canal networks, and renewable energy grids.
   - Upgrade transport infrastructure: state highways, district roads, bus transit systems, and inter-modal freight nodes.
3. **Crises, Federal Negotiations & Events**:
   - Respond to dynamic events: monsoons, droughts, floods, health emergencies, industrial disputes, or inter-state river water disputes.
   - Negotiate inter-state water sharing (e.g., Cauvery, Krishna, Godavari basins) or power-trading pacts.
4. **Elections (Every 5 Years)**:
   - Public approval depends on employment rates, inflation, public healthcare, school outcomes, electricity reliability, and fiscal health.
   - If public trust drops below threshold, the player's administration loses the election, resulting in an electoral defeat and game over (or option to enter an opposition/new state role).

---

## 4. Key Gameplay Systems

### 4.1 Economy & State Finances
- **Realistic Revenue Structure**:
  - *Own Tax Revenue*: State Goods and Services Tax (SGST), State Excise (alcohol duties), Stamp Duty and Registration Fees, Taxes on Vehicles, Electricity Duty.
  - *No Personal Income Tax*: Indian states do NOT levy personal income taxes (this is constitutionally collected by the Union government).
  - *Union Transfers*: Devolution of central taxes based on Finance Commission recommendations, plus centrally sponsored schemes (e.g., national rural employment, highways, health missions).
- **GDP (Value-Added Method)**:
  - State GDP measures net value-added across Agriculture & Allied, Manufacturing & Heavy Industry, Construction, and Services (IT, Financial, Tourism, Logistics).
  - Avoids double-counting intermediate consumption.

### 4.2 Resources, Water, and Ecology
- **Hydrological Networks**: Major river basins (Ganga, Brahmaputra, Godavari, Krishna, Narmada, Mahanadi, Kaveri, Indus tributaries) connect upstream and downstream states.
- **Dams & Water Security**: Building a dam or reservoir provides irrigation and hydroelectric power but impacts downstream water flow and triggers inter-state negotiations or tribunal disputes.
- **Agriculture**: Crop yields depend on monsoon rainfall, canal irrigation, groundwater depth, and soil fertility (e.g., Indo-Gangetic alluvium vs. Deccan black soil).

### 4.3 Demographics, Labor & Migration
- Natural population growth, urbanization rates, and workforce participation.
- **Inter-State Migration**: Workers dynamically migrate to states with higher wages, industrial jobs, better safety, and superior public services.

### 4.4 Research & Innovation
- Investment in universities, IITs/NITs/IIMs, state innovation councils, incubation hubs, and agricultural research institutes unlocks productivity multipliers across industry and green energy.

---

## 5. User Interface & Visual Aesthetics
- **Visual Style**: Clean, modern, high-contrast cartography inspired by *OpenFront.io* and *Dummynation*.
- **The World-to-India Zoom**:
  - The game opens with a global view highlighting the subcontinent.
  - Selecting India initiates an animated camera zoom into the Indian Union, revealing all 28 states and 8 Union Territories with clear political boundaries, natural topography, rivers, and coastal waters.
  - Selecting an individual state opens the dedicated Chief Minister statecraft dashboard.
- **Switchable Map Overlays**: A seamless map mode switch bar allowing one-click transitions between Terrain, Economy, Population, Industry, Agriculture, Natural Resources, Infrastructure, Happiness, Research, Defense Contribution, Trade, and Water.

---

## 6. Target Audience & Accessibility
- Designed for strategy gamers, geography enthusiasts, public policy students, and casual browser players.
- Frictionless guest onboarding with zero mandatory signups. Optional cloud sync via Google OAuth.
- Runs smoothly on desktop browsers and scales cleanly to mobile and tablet viewports.
