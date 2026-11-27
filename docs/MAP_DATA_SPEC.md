# India: Statecraft — Map & Geographic Data Specification

## 1. Map Architecture & Visual Language

The geographic map is the central interaction surface of **India: Statecraft**. The visual language follows a crisp, high-readability aesthetic inspired by *OpenFront.io* and *Dummynation*.

### 1.1 Core Layers
1. **Global Overview Base Layer**:
   - World boundaries showing India's geopolitical placement in South Asia and the Indian Ocean.
   - Interactive zoom triggers focus transition from world view into the subcontinent.
2. **Indian National & State Boundaries**:
   - Precise vector geometry covering all **28 States** and **8 Union Territories**.
   - Distinct boundary stroke with border glow when selected or hovered.
3. **Hydrological Network (Rivers, Lakes & Coastlines)**:
   - Line vectors for major river systems: Ganga, Yamuna, Brahmaputra, Godavari, Krishna, Narmada, Tapti, Kaveri, Mahanadi, Sutlej, Beas, Ravi, Jhelum, Chenab.
   - Polygon geometries for lakes/reservoirs (e.g., Chilika, Vembanad, Wular, Nagarjuna Sagar, Sardar Sarovar, Hirakud).
4. **Physical Topography & Biomes**:
   - Shaded relief rendering for Himalayan mountain ranges, Western & Eastern Ghats, Vindhya/Satpura ranges.
   - Land cover biomes: Indo-Gangetic fertile plains, Thar desert, Deccan plateau, northeastern temperate/rainforests, coastal wetlands/Sundarbans.
5. **Urban & Infrastructure Nodes**:
   - Tier-1 and Tier-2 city hubs, major seaports (e.g., JNPT Mumbai, Mundra, Chennai, Visakhapatnam, Kolkata/Haldia, Cochin), airports, and dedicated freight corridors.

---

## 2. Dynamic Map Visualization Modes

The map supports 12 synchronized thematic visualization modes. Each mode binds directly to state simulation properties and provides dynamic choropleth fills, tooltips, and interactive legends.

| Map Mode | Metric Visualized | Legend / Color Scale | Source Property |
| :--- | :--- | :--- | :--- |
| **1. Terrain** | Topography, biomes, rivers, elevation relief | Natural satellite / biome shades (greens, browns, snow whites) | Base vector/raster tiles |
| **2. Economy** | Gross State Domestic Product (GSDP), per-capita income | Deep Purple to Emerald Green | `state.economy.gsdp` |
| **3. Population** | Population density (people/km²) | Pale Yellow to Crimson Red | `state.demographics.density` |
| **4. Industry** | Manufacturing output, SEZ density, industrial corridor nodes | Light Slate to Vibrant Orange | `state.industry.output` |
| **5. Agriculture** | Foodgrain production, irrigated area %, soil fertility | Dry Ochre to Rich Forest Green | `state.agriculture.production` |
| **6. Natural Resources** | Mineral wealth (coal, iron ore, bauxite, limestone), solar/wind potential | Bronze / Amber heat scale | `state.resources.index` |
| **7. Infrastructure** | Highway density, power grid reliability, logistics speed | Dim Grey to Electric Cyan | `state.infrastructure.score` |
| **8. Happiness** | Quality of life, healthcare index, clean water, literacy | Coral Pink to Bright Teal | `state.society.happiness` |
| **9. Research** | R&D institutions, patents, university density, tech clusters | Indigo to Bright Violet | `state.research.index` |
| **10. Military Contribution**| Armed forces recruitment, defense manufacturing corridors, civil defense | Muted Olive to Steel Blue | `state.defense.contribution` |
| **11. Trade** | Inter-state freight volume, export value, port throughput | Light Sky Blue to Deep Cobalt | `state.trade.volume` |
| **12. Water Resources** | Groundwater index, reservoir storage capacity %, annual rainfall | Desiccated Sand to Deep Azure | `state.water.stressIndex` |

*Future expandable modes*: Employment Rate, Renewable Energy Share, Air Quality / Pollution Index, Political Stability.

---

## 3. Data Sources & Integrity
- **Boundary Geometry**: Legal, official Survey of India boundary configurations conforming strictly to Indian statutory norms for national cartography.
- **Starting Baselines**: Derived from official public statistics (Ministry of Statistics and Programme Implementation - MoSPI, Reserve Bank of India - RBI State Finances, Census & NITI Aayog SDG Index).
- **Placeholder Rule**: All data entries in code are explicitly marked as `ESTABLISHED_BASELINE`, `SIMULATED_DYNAMIC`, or `DEVELOPMENT_PLACEHOLDER` so no numbers are fabricated without explicit labelling.
