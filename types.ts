
export type WeightingType = 'A' | 'C' | 'Z';

export interface FrequencyData {
  [frequency: string]: number;
}

export interface Measurement {
  id: string;
  name: string;
  originalName: string;
  data: FrequencyData;
  visible: boolean;
  color: string;
  originalColor: string;
}

export interface ChartSettings {
  yAxisLabel: string;
  xAxisLabel: string;
  showValues: boolean;
  yAxisStart: string;
  yAxisEnd: string;
  backgroundColor: string;
  gridColor: string;
  textColor: string;
  showXAxisLabel?: boolean;
  showYAxisLabel?: boolean;
}

export interface ChartDataPoint {
  name: string; // Frequency band name
  [measurementName: string]: string | number | null;
}
