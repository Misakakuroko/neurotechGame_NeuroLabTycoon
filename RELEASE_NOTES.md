# NeuroLab Tycoon - Release Notes

## Version 2.0.0 - The "Principal Investigator" Update
**Release Date:** December 2, 2024  
**Type:** Major Feature Release

### 📝 Overview
This major update transforms NeuroLab Tycoon from a linear simulation prototype into a full-fledged management strategy game. Version 2.0 introduces a persistent career loop, a prestige-based progression system, and significantly deepens the MRI physics simulation mechanics. Players now manage a lab over multiple in-game days, balancing grants, research reputation, and complex acquisition parameters.

### ✨ New Features

#### 1. Endless Career Loop & Progression
- **Cycle Mechanics:** The game now operates on a continuous loop (Day 1, Day 2...) rather than ending after a single experiment.
- **Resource Management:** Introduced **Prestige** and **Grant Money** as persistent resources.
- **Unlock System (Tech Tree):**
  - **3T Magnet:** Unlocked by default.
  - **7T Magnet:** Requires 50 Prestige.
  - **11.7T Iseult Magnet:** Requires 200 Prestige.
- **Mission Selection:** Added a "Research Target" selector in the shop:
  - *Phantom* (0.5x Rewards, Low Risk)
  - *Adult* (1.0x Rewards)
  - *Pediatric* (2.0x Rewards)
  - *Neonate* (4.0x Rewards, Extreme Difficulty)

#### 2. Advanced Physics Simulation Engine
- **Pulse Sequence Design:** Players can now choose between GRE (Gradient Echo), SE (Spin Echo), and EPI (Echo Planar Imaging) sequences, each affecting SNR and scan time differently.
- **Interactive B0 Shimming:** Added X/Y/Z gradient sliders. Players must manually minimize field inhomogeneity (ΔHz) to prevent geometric distortion.
- **Dynamic Visual Feedback:** Implemented a real-time MRI simulator in the Safety Console that visually degrades the brain image based on:
  - Low Resolution (Blur)
  - Low SNR (Darkness/Noise)
  - Bad Shimming (Distortion)
  - Missing pTx (RF "Black Hole" Artifacts)

#### 3. Enhanced UI/UX
- **Start Screen:** A new immersive main menu with animated background and "Mission Briefing" modal.
- **Log Terminal:** The Experiment Review screen now features a retro-style scrolling terminal log to display the simulation steps.
- **Visual Aids:** Added tooltips and dynamic color indicators for SNR predictions and safety warnings.

### 🔧 Scientific Accuracy Improvements
- **VOP Algorithm Refinement:** Updated the `rASF` calculation logic based on *[cite: 1137]* to strictly enforce power clamping when Model Count (N) is low.
- **Motion Artifacts:** Added a stochastic failure mechanic where scan durations > 10 minutes significantly increase the risk of patient motion artifacts.

### 🐛 Bug Fixes
- Fixed JSX syntax errors (unescaped `>` characters) in `MagnetShop.tsx` and `ExperimentReview.tsx`.
- Resolved TypeScript type inference issues in `SafetyConsole.tsx` chart data generation.
- Fixed an issue where the experiment result log would not scroll correctly.

---

## Version 1.0.0 - MVP (Prototype)
**Release Date:** December 2, 2024  
**Type:** Initial Release

### 📝 Overview
The initial release of NeuroLab Tycoon, designed as an educational simulation to demonstrate the challenges of Ultra-High Field (UHF) MRI, specifically focusing on the Iseult 11.7T project constraints.

### ✨ Core Features

#### 1. Hardware Procurement System
- **Shop Interface:** Allows purchasing of Magnets (3T, 7T, 11.7T), Cooling Systems, and RF Coils.
- **Budget Validation:** Basic check to prevent negative spending from the initial $10M budget.

#### 2. Safety Console (VOP Implementation)
- **Variable N Slider:** Implemented the core trade-off mechanic between the Number of Virtual Models (N) and the relaxed Anatomical Safety Factor (rASF).
- **Recharts Integration:** Real-time visualization of the rASF vs. N curve.
- **Safety Checklist:** Mandatory pre-scan checklist (Physiological, Vestibular, Genotoxicity).

#### 3. Experiment Logic Engine
- **Hard Constraints:**
  - 11.7T Magnet fails without 1.8K Superfluid Cooling *[cite: 460]*.
  - 11.7T Magnet fails without Parallel Transmission (pTx) *[cite: 311]*.
  - Pediatric scans fail if N < 10 due to excessive safety margins *[cite: 1237]*.

#### 4. Tech Stack
- **Frontend:** React 18, TypeScript, Vite.
- **Styling:** Tailwind CSS.
- **State Management:** Zustand.
- **Icons:** Lucide React.

