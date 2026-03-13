import React from 'react';
import { useChartContext } from '../context/ChartContext';
import type { ChartMode, ColorScheme } from '../types';

export const ConfigurationPanel: React.FC = () => {
  const { state, updateConfig } = useChartContext();
  const { config } = state;

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Configuración</h2>

      {/* General Settings */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Título Principal</label>
          <input
            type="text"
            value={config.title}
            onChange={e => updateConfig('title', e.target.value)}
            className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
            placeholder="Ej: Media 15 Juegos 1080p"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Nombre del Componente</label>
          <input
            type="text"
            value={config.componentName}
            onChange={e => updateConfig('componentName', e.target.value)}
            className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
            placeholder="Ej: RTX 4080 Super"
          />
        </div>
      </div>

      {/* Modes & Themes */}
      <div className="flex flex-col gap-4 border-t pt-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Modo de Gráfico</label>
          <select
            value={config.mode}
            onChange={e => updateConfig('mode', e.target.value as ChartMode)}
            className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
          >
            <option value="bar">Barras Horizontales (Comparación)</option>
            <option value="line">Líneas (Análisis Térmico)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Esquema de Color</label>
          <select
            value={config.colorScheme}
            onChange={e => updateConfig('colorScheme', e.target.value as ColorScheme)}
            className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
          >
            <option value="default">NVIDIA / AMD / Intel</option>
            <option value="ssd">PSU Gang Especial SSD</option>
          </select>
        </div>
      </div>

      {/* Units & Axes */}
      <div className="flex flex-col gap-4 border-t pt-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Unidad Eje Y (Vertical)</label>
          <select
            value={config.yUnit}
            onChange={e => updateConfig('yUnit', e.target.value)}
            className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
          >
            <option value="FPS">FPS</option>
            <option value="MHz">MHz</option>
            <option value="dbA">dbA</option>
            <option value="Watts">Watts</option>
            <option value="ºC">ºC</option>
            <option value="GB">GB</option>
            <option value="MB/s">MB/s</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Unidad Eje X (Horizontal)</label>
          <select
            value={config.xUnit}
            onChange={e => updateConfig('xUnit', e.target.value)}
            className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
          >
            <option value="None">None</option>
            <option value="Segundos">Segundos</option>
            <option value="FPS">FPS</option>
          </select>
        </div>
      </div>

      {/* Legend Setup */}
      <div className="flex flex-col gap-4 border-t pt-4">
        {config.mode === 'bar' ? (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">Nombre Valor 1 (Leyenda)</label>
              <input
                type="text"
                value={config.legendVal1}
                onChange={e => updateConfig('legendVal1', e.target.value)}
                className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">Nombre Valor 2 (Leyenda)</label>
              <input
                type="text"
                value={config.legendVal2}
                onChange={e => updateConfig('legendVal2', e.target.value)}
                className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">Nombre Eje Y1 (Izquierdo)</label>
              <input
                type="text"
                value={config.y1AxisName}
                onChange={e => updateConfig('y1AxisName', e.target.value)}
                className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">Nombre Eje Y2 (Derecho)</label>
              <input
                type="text"
                value={config.y2AxisName}
                onChange={e => updateConfig('y2AxisName', e.target.value)}
                className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03D6B3]"
              />
            </div>
          </>
        )}
      </div>

    </div>
  );
};
