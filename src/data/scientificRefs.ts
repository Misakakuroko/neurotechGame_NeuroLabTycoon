
// This file contains scientific citations and facts based on the provided literature:
// 1. "In vivo imaging of the human brain with the Iseult 11.7-T MRI scanner"
// 2. "Proposal for local SAR safety margin in pediatric neuro-imaging using 7 T MRI and parallel transmission"
// 3. "Blue Playful Human Neuron Group Project Presentation"

export interface ScientificRefData {
    id: string;
    term: string;
    fact: string;
    source: string;
}

export const SCIENCE_REFS: Record<string, ScientificRefData> = {
    '11.7T': {
        id: 'iseult_11.7t',
        term: '11.7T Iseult Magnet',
        fact: 'The Iseult 11.7T scanner is the world\'s most powerful whole-body MRI, enabling in vivo human brain imaging at mesoscopic resolution (down to 0.2mm) for unprecedented structural detail.',
        source: 'In vivo imaging of the human brain with the Iseult 11.7-T MRI scanner (Nature, 2024)'
    },
    '7T': {
        id: '7t_mri',
        term: '7T Ultra-High Field',
        fact: '7T MRI offers higher Signal-to-Noise Ratio (SNR) but introduces challenges like RF heating (SAR) and B1+ inhomogeneity, requiring advanced safety monitoring.',
        source: 'Proposal for local SAR safety margin in pediatric neuro-imaging (2024)'
    },
    'VOP': {
        id: 'vop_safety',
        term: 'Virtual Observation Points (VOP)',
        fact: 'VOPs are computational points used to estimate local Specific Absorption Rate (SAR) in real-time. Increasing the number of VOPs (N) reduces the safety overestimation, allowing for higher transmit power while ensuring patient safety.',
        source: 'Proposal for local SAR safety margin in pediatric neuro-imaging using 7 T MRI'
    },
    'SAR': {
        id: 'sar_safety',
        term: 'Specific Absorption Rate (SAR)',
        fact: 'SAR measures the rate at which energy is absorbed by the human body when exposed to an RF electromagnetic field. High-field MRI (7T+) requires strict local SAR monitoring to prevent tissue heating.',
        source: 'Proposal for local SAR safety margin in pediatric neuro-imaging (2024)'
    },
    'pTx': {
        id: 'ptx_tools',
        term: 'Parallel Transmission (pTx)',
        fact: 'Parallel transmission uses multiple independent transmit channels to correct B1+ field inhomogeneity, which is critical for obtaining uniform images at ultra-high magnetic fields (7T and 11.7T).',
        source: 'In vivo imaging of the human brain with the Iseult 11.7-T MRI scanner'
    },
    'Pediatric': {
        id: 'pediatric_safety',
        term: 'Pediatric Imaging',
        fact: 'Imaging children at 7T requires specific safety margins. Their smaller head size and different tissue conductivity properties necessitate dedicated SAR safety models compared to adults.',
        source: 'Proposal for local SAR safety margin in pediatric neuro-imaging using 7 T MRI'
    },
    'Superfluid': {
        id: 'superfluid_cooling',
        term: 'Superfluid Helium (1.8K)',
        fact: 'To achieve the stable 11.7T field, the Iseult magnet coils are cooled with superfluid helium at 1.8 Kelvin. This state allows for superconductivity with exceptional heat transfer properties preventing magnet quench.',
        source: 'In vivo imaging of the human brain with the Iseult 11.7-T MRI scanner'
    },
    'Gradient': {
        id: 'gradient_perf',
        term: 'High-Performance Gradients',
        fact: 'Strong gradient systems (high mT/m and slew rate) are essential for ultra-high field imaging to encode spatial information rapidly and reduce geometric distortions in EPI sequences.',
        source: 'General MRI Physics / Iseult Specs'
    },
    'Shimming': {
        id: 'b0_shimming',
        term: 'B0 Field Shimming',
        fact: 'At ultra-high fields (7T+), magnetic susceptibility differences in the human head cause severe field distortions. Precise B0 shimming is mandatory to prevent image artifacts and signal loss.',
        source: 'In vivo imaging of the human brain with the Iseult 11.7-T MRI scanner'
    },
    'Mesoscopic': {
        id: 'mesoscopic_res',
        term: 'Mesoscopic Resolution',
        fact: 'The primary goal of 11.7T MRI is to reach "mesoscopic" resolution (0.1-0.2mm), bridging the gap between standard MRI (~1mm) and microscopy, revealing cortical layers and columnar structures in vivo.',
        source: 'In vivo imaging of the human brain with the Iseult 11.7-T MRI scanner'
    },
    'EPI': {
        id: 'epi_seq',
        term: 'Echo Planar Imaging (EPI)',
        fact: 'EPI is a fast imaging technique used for fMRI and diffusion. At high fields, it suffers from geometric distortions, requiring strong gradients and parallel imaging (pTx) to correct.',
        source: 'General MRI Physics'
    }
};
