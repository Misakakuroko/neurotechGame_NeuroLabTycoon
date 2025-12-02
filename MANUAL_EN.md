# NeuroLab Tycoon - Beginner's Guide

Welcome to **NeuroLab Tycoon**! This is a hardcore simulation game about managing an MRI research laboratory. As the Lab Director, your goal is to design and execute MRI scanning experiments, accumulate **Money** and **Prestige**, and ultimately build a world-class **11.7T Laboratory**.

This guide will help you master the game from scratch.

---

## Core Game Loop

The game consists of three main phases that cycle:

1.  **Lab Management (Procurement & Strategy)**: Choose your research target and purchase hardware.
2.  **Safety Console (Experiment Execution)**: Adjust scanning parameters to ensure safety and image quality.
3.  **Experiment Review (Results)**: Review the experiment results and earn rewards.

---

## Phase 1: Lab Management

Here, you decide what to study and what equipment to use.

### 1. Select Research Target
The left panel is your Mission Board.
*   **Phantom (Model)**: **Must-pick for beginners.** No prestige requirement, lowest difficulty. Recommended for the first few rounds.
*   **Adult**: Requires 20 Prestige. Standard rewards.
*   **Pediatric / Neonate**: High difficulty, high risk, high reward. Requires top-tier hardware and precise operation.

### 2. Hardware Shop
The right panel is the Shop. **Note: You cannot start an experiment until you own a Magnet, Cooling System, and RF Coil.**

*   **Main Magnet**: The core component.
    *   **3T**: Entry-level, cheap, safe.
    *   **7T / 11.7T**: High-end equipment. Stronger signal (**Higher SNR**), but harder to control.
    *   *WARNING: Before upgrading to 7T or 11.7T, ensure you have enough money for Advanced Cooling and pTx Tools!*
*   **Cooling**:
    *   **Standard**: For 3T only.
    *   **Superfluid**: **Mandatory for 7T and 11.7T**. Without it, the magnet will "Quench" (overheat), causing instant failure.
*   **Gradients**:
    *   Determines how fine (**Resolution**) and how fast (**Sequence**) you can scan.
    *   If high resolution causes "Overload", you need to upgrade this.
*   **Upgrades**:
    *   **pTx Tools**: **Mandatory for 7T and 11.7T** to fix "black hole" artifacts in the image caused by B1+ inhomogeneity.

---

## Phase 2: Safety Console

This is the most technical part. You need to adjust parameters to maximize **SNR (Signal-to-Noise Ratio)** while ensuring **Safety**.

### Key Metrics (Top Right & Center)
*   **Predicted SNR**: **Must be > 20**. Below this, the image is just noise, and the experiment fails. Higher is better (multiplies your money reward).
*   **Gradient Load**: **Must be < 100%**. If overloaded, decrease Resolution (make mm larger) or upgrade Gradients in the shop.
*   **PNS Risk (Peripheral Nerve Stimulation)**: **Must be < 100%**. If too high, the subject feels pain and the scan aborts.

### Parameter Guide
1.  **Pulse Sequence**:
    *   **GRE**: Standard, balanced.
    *   **SE**: Good signal, but slow.
    *   **EPI**: Very fast, but puts huge stress on hardware (Gradients). Prone to overloading.
2.  **Resolution**:
    *   Smaller number (e.g., 0.5mm) = clearer image, but **SNR drops cubically** (due to voxel volume) and hardware load spikes.
    *   *Beginner Tip: Keep it around 1.5mm - 2.0mm. 0.5mm requires elite hardware.*
3.  **Duration (Scan Time)**:
    *   Longer time = Higher SNR (cleaner image).
    *   *WARNING: If > **10 minutes**, the subject might move (**Motion Artifact**), giving a 50% chance of failure! Keep it under 10 mins for safety.*
4.  **VOP Safety Model (N)**:
    *   Number of Virtual Observation Points for safety calculation.
    *   **Increasing N** = More precise safety check = Allows more power = **Higher SNR**.
    *   Slide this up as much as you safely can.
5.  **B0 Shimming -- CRITICAL STEP!**
    *   See the **Delta: xx Hz** in the bottom left? If it's RED (>60Hz), the experiment fails.
    *   **How to play**: Drag the x, y, z sliders until the number is **as close to 0 as possible** (turns GREEN). This simulates real MRI field homogeneity adjustment.
6.  **Checklist**:
    *   Three checkboxes at the bottom right (Physiological, Vestibular, Metallic Implants).
    *   **Must check all of them** to enable the "Acquire Data" button. Metallic Implants Check is crucial as MRI magnets can rip metal out of the body.

---

## Phase 3: Experiment Review

Click "Acquire Data" to enter. You will see the console logs scrolling.

*   **Success**: Earn Money and Prestige.
*   **Failure Reasons**:
    *   *Quench Detected* -> You used a high-field magnet with low-tier cooling.
    *   *B1+ Inhomogeneity* -> You used a high-field magnet without pTx tools.
    *   *Shimming failed* -> You didn't adjust the Shimming sliders to under 60Hz.
    *   *Gradient Failure* -> Gradient overloaded. Upgrade hardware or lower resolution.
    *   *Motion Artifacts* -> Scan duration was too long (>10 mins) and subject moved.

---

## Roadmap to Victory (Beginner Strategy)

1.  **The Startup (Day 1-5)**:
    *   Stick with the **3T** Magnet.
    *   Target: **Phantom**.
    *   Settings: **9 minutes** duration (Safe & High SNR).
    *   **Always adjust Shimming carefully!**
    *   Save up to $5,000,000+.

2.  **Expansion (Day 6-15)**:
    *   **Buy Accessories First**: Buy **Superfluid Cooling** (2M) and **pTx Tools** (1.5M).
    *   **Then Buy Magnet**: Upgrade to **7T** (3M).
    *   Target: Try **Adult**.
    *   SNR will skyrocket, and you'll make money much faster.

3.  **The Pinnacle (Day 15+)**:
    *   Reach 200 Prestige to unlock **11.7T**.
    *   Ensure you have **Connectome Gradients** (2.5M) to handle it.
    *   Challenge **Neonate** scans for the ultimate scientific achievement!

Good luck, and become a legend in the field of Neuroscience!
