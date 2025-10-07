import { FrequencyData } from './types';

export const FREQUENCY_BANDS: string[] = [
    "12,5Hz", "16Hz", "20Hz", "25Hz", "31,5Hz", "40Hz", "50Hz", "63Hz", "80Hz",
    "100Hz", "125Hz", "160Hz", "200Hz", "250Hz", "315Hz", "400Hz", "500Hz",
    "630Hz", "800Hz", "1kHz", "1,25kHz", "1,6kHz", "2kHz", "2,5kHz", "3,15kHz",
    "4kHz", "5kHz", "6,3kHz", "8kHz", "10kHz", "12,5kHz", "16kHz", "20kHz"
];

export const A_WEIGHTING: FrequencyData = {
    "12,5Hz": -63.4, "16Hz": -56.7, "20Hz": -50.5, "25Hz": -44.7, "31,5Hz": -39.4,
    "40Hz": -34.6, "50Hz": -30.2, "63Hz": -26.2, "80Hz": -22.5, "100Hz": -19.1,
    "125Hz": -16.1, "160Hz": -13.4, "200Hz": -10.9, "250Hz": -8.6, "315Hz": -6.6,
    "400Hz": -4.8, "500Hz": -3.2, "630Hz": -1.9, "800Hz": -0.8, "1kHz": 0.0,
    "1,25kHz": 0.6, "1,6kHz": 1.0, "2kHz": 1.2, "2,5kHz": 1.3, "3,15kHz": 1.2,
    "4kHz": 1.0, "5kHz": 0.5, "6,3kHz": -0.1, "8kHz": -1.1, "10kHz": -2.5,
    "12,5kHz": -4.3, "16kHz": -6.6, "20kHz": -9.3
};

export const C_WEIGHTING: FrequencyData = {
    "12,5Hz": -14.3, "16Hz": -11.2, "20Hz": -8.5, "25Hz": -6.2, "31,5Hz": -4.4,
    "40Hz": -3.0, "50Hz": -2.0, "63Hz": -1.3, "80Hz": -0.8, "100Hz": -0.5,
    "125Hz": -0.3, "160Hz": -0.2, "200Hz": -0.1, "250Hz": 0.0, "315Hz": 0.0,
    "400Hz": 0.0, "500Hz": 0.0, "630Hz": 0.0, "800Hz": 0.0, "1kHz": 0.0,
    "1,25kHz": 0.0, "1,6kHz": -0.1, "2kHz": -0.2, "2,5kHz": -0.3, "3,15kHz": -0.5,
    "4kHz": -0.8, "5kHz": -1.3, "6,3kHz": -2.0, "8kHz": -3.0, "10kHz": -4.4,
    "12,5kHz": -6.2, "16kHz": -8.5, "20kHz": -11.2
};

export const DEFAULT_COLORS: string[] = [
    '#22d3ee', // cyan-400
    '#f87171', // red-400
    '#4ade80', // green-400
    '#facc15', // yellow-400
    '#a78bfa', // violet-400
    '#fb923c', // orange-400
    '#f472b6', // pink-400
    '#60a5fa', // blue-400
];