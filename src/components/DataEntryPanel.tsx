import React, { useRef } from 'react';
import Papa from 'papaparse';
import { useChartContext } from '../context/ChartContext';
import { Upload, Plus, Trash2 } from 'lucide-react';
import type { DataRow } from '../types';

export const DataEntryPanel: React.FC = () => {
  const { state, updateData, setColumns, updateRow, addRow, removeRow } = useChartContext();
  const { data } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const firstRow = results.data[0] as Record<string, any>;
            const cols = Object.keys(firstRow);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows: DataRow[] = results.data.map((row: any, i) => ({
              id: Date.now().toString() + i,
              label: row[cols[0]]?.toString() || '',
              value1: Number(row[cols[1]]) || 0,
              value2: cols[2] ? Number(row[cols[2]]) : null,
              ...row
            }));

            setColumns(cols);
            updateData({
              rows,
              xCol: cols[0],
              y1Col: cols[1],
              y2Col: cols[2] || cols[1]
            });
          }
        }
      });
    } else if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cols = Object.keys(parsed[0]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows: DataRow[] = parsed.map((row: any, i) => ({
              id: Date.now().toString() + i,
              label: row[cols[0]]?.toString() || '',
              value1: Number(row[cols[1]]) || 0,
              value2: cols[2] ? Number(row[cols[2]]) : null,
              ...row
            }));

            setColumns(cols);
            updateData({
              rows,
              xCol: cols[0],
              y1Col: cols[1],
              y2Col: cols[2] || cols[1]
            });
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }

    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-6 pb-4 border-b shrink-0 z-10 sticky top-0 bg-white">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Entrada de Datos</h2>

        {/* Upload Button */}
        <div className="mb-4">
          <input
            type="file"
            accept=".csv,.json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-[#f8fafc] border-2 border-dashed border-slate-300 hover:border-[#03D6B3] text-slate-600 hover:text-[#03D6B3] py-4 rounded-lg transition-colors"
          >
            <Upload size={20} />
            <span className="font-medium">Subir CSV o JSON</span>
          </button>
        </div>

        {/* Column Mapping */}
        {data.columns.length > 0 && (
          <div className="flex flex-col gap-3 mb-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mapeo de Columnas</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-700 w-16">Eje X</label>
                <select
                  value={data.xCol}
                  onChange={e => updateData({ xCol: e.target.value })}
                  className="flex-1 border border-slate-300 rounded text-sm p-1 ml-2 focus:ring-[#03D6B3]"
                >
                  {data.columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-700 w-16">Eje Y1</label>
                <select
                  value={data.y1Col}
                  onChange={e => updateData({ y1Col: e.target.value })}
                  className="flex-1 border border-slate-300 rounded text-sm p-1 ml-2 focus:ring-[#03D6B3]"
                >
                  {data.columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-700 w-16">Eje Y2</label>
                <select
                  value={data.y2Col}
                  onChange={e => updateData({ y2Col: e.target.value })}
                  className="flex-1 border border-slate-300 rounded text-sm p-1 ml-2 focus:ring-[#03D6B3]"
                >
                  {data.columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Data Table */}
      <div className="flex-1 overflow-y-auto p-6 pt-2">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Editor Manual</h3>
          <button
            onClick={addRow}
            className="flex items-center gap-1 text-xs bg-[#03D6B3] hover:bg-[#02b395] text-white px-2 py-1 rounded transition-colors"
          >
            <Plus size={14} /> Fila
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center bg-slate-100 p-2 rounded text-xs font-semibold text-slate-600">
            <div>Etiqueta (X)</div>
            <div>Valor 1 (Y1)</div>
            <div>Valor 2 (Y2)</div>
            <div className="w-6"></div>
          </div>

          {/* Rows */}
          {data.rows.map(row => (
            <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center group">
              <input
                type="text"
                value={row.label}
                onChange={e => updateRow(row.id, { label: e.target.value })}
                className="w-full border border-slate-200 rounded p-1 text-sm focus:border-[#03D6B3] focus:ring-1 focus:ring-[#03D6B3] outline-none"
              />
              <input
                type="number"
                value={row.value1 === null ? '' : row.value1}
                onChange={e => updateRow(row.id, { value1: e.target.value ? Number(e.target.value) : null })}
                className="w-full border border-slate-200 rounded p-1 text-sm focus:border-[#03D6B3] focus:ring-1 focus:ring-[#03D6B3] outline-none"
              />
              <input
                type="number"
                value={row.value2 === null ? '' : row.value2}
                onChange={e => updateRow(row.id, { value2: e.target.value ? Number(e.target.value) : null })}
                className="w-full border border-slate-200 rounded p-1 text-sm focus:border-[#03D6B3] focus:ring-1 focus:ring-[#03D6B3] outline-none"
              />
              <button
                onClick={() => removeRow(row.id)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Eliminar fila"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
