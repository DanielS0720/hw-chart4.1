export type ChartMode = 'bar' | 'line';
export type ColorScheme = 'default' | 'ssd';

export interface ChartConfig {
  title: string;
  componentName: string;
  yUnit: string;
  xUnit: string;
  legendVal1: string;
  legendVal2: string;
  y1AxisName: string;
  y2AxisName: string;
  mode: ChartMode;
  colorScheme: ColorScheme;
}

export interface DataRow {
  id: string;
  label: string;
  value1: number | null;
  value2: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ChartDataState {
  columns: string[];
  rows: DataRow[];
  xCol: string;
  y1Col: string;
  y2Col: string;
}

export interface AppState {
  config: ChartConfig;
  data: ChartDataState;
}
