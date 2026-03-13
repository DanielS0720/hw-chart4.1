import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppState, ChartConfig, ChartDataState, DataRow } from '../types';

interface ChartContextType {
  state: AppState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateConfig: (key: keyof ChartConfig, value: any) => void;
  updateData: (data: Partial<ChartDataState>) => void;
  updateRow: (id: string, updatedRow: Partial<DataRow>) => void;
  addRow: () => void;
  removeRow: (id: string) => void;
  setColumns: (cols: string[]) => void;
}

const defaultState: AppState = {
  config: {
    title: 'Media 15 Juegos 1080p',
    componentName: 'RTX 4080 Super',
    yUnit: 'FPS',
    xUnit: 'None',
    legendVal1: 'AVG FPS',
    legendVal2: '1% Low',
    y1AxisName: 'Frecuencia',
    y2AxisName: 'Temperatura',
    mode: 'bar',
    colorScheme: 'default'
  },
  data: {
    columns: ['Juego', 'AVG FPS', '1% Low'],
    rows: [
      { id: '1', label: 'Cyberpunk 2077', value1: 85, value2: 60 },
      { id: '2', label: 'RDR2', value1: 120, value2: 95 },
    ],
    xCol: 'Juego',
    y1Col: 'AVG FPS',
    y2Col: '1% Low'
  }
};

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export const ChartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateConfig = (key: keyof ChartConfig, value: any) => {
    setState(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const updateData = (data: Partial<ChartDataState>) => {
    setState(prev => {
      const nextData = { ...prev.data, ...data };

      // If column mappings changed, update the rows to reflect new labels and values
      if (data.xCol !== undefined || data.y1Col !== undefined || data.y2Col !== undefined) {
        nextData.rows = nextData.rows.map(row => ({
          ...row,
          label: row[nextData.xCol]?.toString() || '',
          value1: Number(row[nextData.y1Col]) || 0,
          value2: nextData.y2Col ? Number(row[nextData.y2Col]) : null
        }));
      }

      return { ...prev, data: nextData };
    });
  };

  const updateRow = (id: string, updatedRow: Partial<DataRow>) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        rows: prev.data.rows.map(row => row.id === id ? { ...row, ...updatedRow } : row)
      }
    }));
  };

  const addRow = () => {
    const newId = Date.now().toString();
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        rows: [...prev.data.rows, { id: newId, label: 'Nuevo', value1: 0, value2: 0 }]
      }
    }));
  };

  const removeRow = (id: string) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        rows: prev.data.rows.filter(row => row.id !== id)
      }
    }));
  };

  const setColumns = (cols: string[]) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        columns: cols
      }
    }));
  }

  return (
    <ChartContext.Provider value={{ state, updateConfig, updateData, updateRow, addRow, removeRow, setColumns }}>
      {children}
    </ChartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChartContext = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChartContext must be used within a ChartProvider');
  }
  return context;
};