# India: Statecraft — Simulation Rules & Mathematical Model

## 1. Simulation Clock & Time Scale
- **Tick Unit**: 1 Month per simulation tick.
- **Electoral Mandate**: 5 in-game years = 60 ticks.
- **Speed Settings**:
  - `PAUSED`: Simulation clock halted; player can inspect metrics and issue orders.
  - `NORMAL (1x)`: 1 tick every 2 seconds (~2 minutes per 5-year term).
  - `FAST (3x)`: 1 tick every 0.67 seconds (~40 seconds per 5-year term).

---

## 2. Fiscal & Economic Mechanics

### 2.1 State Revenue Accounting
State budgets operate strictly according to Indian public finance frameworks:
$$\text{Total Monthly Revenue} = R_{\text{SGST}} + R_{\text{Excise}} + R_{\text{Stamp}} + R_{\text{Vehicle}} + R_{\text{Electricity}} + R_{\text{NonTax}} + T_{\text{Union}}$$

1. **State GST ($R_{\text{SGST}}$)**: Levied on intra-state value addition and consumer consumption.
2. **State Excise ($R_{\text{Excise}}$)**: Duties on potable alcohol and spirits.
3. **Stamp Duty & Registration ($R_{\text{Stamp}}$)**: Real estate transactions, industrial land deeds.
4. **Motor Vehicle Taxes ($R_{\text{Vehicle}}$)**: Commercial and passenger vehicle registrations.
5. **Electricity Duty ($R_{\text{Electricity}}$)**: Industrial, commercial, and residential consumption tariffs.
6. **Union Transfers ($T_{\text{Union}}$)**:
   - Statutory devolution from central divisible pool (formula based on population, area, income distance, forest cover).
   - Scheme grants (healthcare, education, rural development).
7. **No Personal Income Tax**: Personal income tax is non-existent in state revenue calculation as it is constitutionally assigned to the Union.

### 2.2 Expenditure & Fiscal Responsibility
$$\text{Total Monthly Expenditure} = E_{\text{Salaries}} + E_{\text{Pensions}} + E_{\text{DebtService}} + E_{\text{Subsidies}} + E_{\text{CapEx}}$$

- **Fiscal Deficit Cap**: Fiscal Responsibility and Budget Management (FRBM) guidelines establish target deficit limits of ~3% of GSDP. Excess borrowing increases bond yields (borrowing cost) and reduces credit rating.
- **Capital Expenditure (CapEx)**: Drives infrastructure score, industrial attraction, and future GSDP expansion.

---

## 3. Production, Industry & Hydrology

### 3.1 Factory & Industrial Growth Constraints
A factory node cannot produce output without meeting threshold inputs:
- $\text{Labor}$: Requires available workforce within commuting radius.
- $\text{Power}$: Grid uptime must exceed 90% or industrial clusters experience output decay.
- $\text{Water}$: Proximity to river basins, canals, or desalination infrastructure.
- $\text{Land & Logistics}$: Connected highway/freight rail access to transit nodes or ports.

### 3.2 River Basins & Dams
- Rivers flow from upstream elevation to downstream sea outlets.
- Dam construction stores water ($V_{\text{reservoir}}$) and generates hydroelectric energy ($P_{\text{hydro}}$).
- **Downstream Water Stress**: Impounding excess water reduces downstream river discharge, causing agricultural stress in downstream states and escalating inter-state tribunal disputes.

---

## 4. Politics, Elections & Victory Conditions

### 4.1 Citizen Approval Metric
Approval ($A \in [0, 100]$) is computed monthly across key pillars:
$$A = 0.25 \cdot A_{\text{jobs}} + 0.20 \cdot A_{\text{prices}} + 0.20 \cdot A_{\text{health/edu}} + 0.15 \cdot A_{\text{infrastructure}} + 0.20 \cdot A_{\text{governance}}$$

- If approval is $< 45\%$ at Tick 60, the incumbent state government faces high probability of electoral defeat.
- If approval is $\ge 50\%$, the administration secures re-election for another 5-year mandate.

### 4.2 State Prosperity Index (SPI)
Overall progress is evaluated across:
1. GSDP per capita.
2. Multidimensional poverty reduction.
3. Environmental sustainability and water security.
4. Infrastructure density.
5. High-tech research and industrial output.
