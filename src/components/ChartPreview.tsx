import React, { useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { Download, Video } from 'lucide-react';
import { useChartContext } from '../context/ChartContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export const ChartPreview: React.FC = () => {
  const { state } = useChartContext();
  const { config, data } = state;
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null); // Ref to the chartjs instance for redrawing
  const [isRecording, setIsRecording] = useState(false);

  // Define brand colors based on scheme
  const isDefault = config.colorScheme === 'default';
  const color1 = isDefault ? 'rgba(3, 214, 179, 0.8)' : 'rgba(143, 5, 232, 0.8)'; // Nvidiaish/PSU vs SSD Primary
  const color1Border = isDefault ? 'rgba(3, 214, 179, 1)' : 'rgba(143, 5, 232, 1)';

  const color2 = isDefault ? 'rgba(48, 48, 48, 0.8)' : 'rgba(255, 166, 23, 0.8)'; // Dark vs SSD Secondary
  const color2Border = isDefault ? 'rgba(48, 48, 48, 1)' : 'rgba(255, 166, 23, 1)';

  // Process data for ChartJS
  const labels = data.rows.map(r => r.label);

  const datasets = [];

  if (config.mode === 'bar') {
    datasets.push({
      label: config.legendVal1 || 'Value 1',
      data: data.rows.map(r => r.value1),
      backgroundColor: color1,
      borderColor: color1Border,
      borderWidth: 1,
    });
    // Add second bar if data exists
    if (data.rows.some(r => r.value2 !== null)) {
      datasets.push({
        label: config.legendVal2 || 'Value 2',
        data: data.rows.map(r => r.value2),
        backgroundColor: color2,
        borderColor: color2Border,
        borderWidth: 1,
      });
    }
  } else {
    // Line Chart (Thermal/SSD)
    datasets.push({
      label: config.y1AxisName || 'Value 1',
      data: data.rows.map(r => r.value1),
      borderColor: color1Border,
      backgroundColor: color1,
      yAxisID: 'y',
      tension: 0, // CRITICAL FIX: No bezier curves
      pointRadius: 0, // CRITICAL FIX: Hide points
      borderWidth: 2,
    });

    if (data.rows.some(r => r.value2 !== null)) {
      datasets.push({
        label: config.y2AxisName || 'Value 2',
        data: data.rows.map(r => r.value2),
        borderColor: color2Border,
        backgroundColor: color2,
        yAxisID: 'y1',
        tension: 0, // CRITICAL FIX: No bezier curves
        pointRadius: 0, // CRITICAL FIX: Hide points
        borderWidth: 2,
      });
    }
  }

  const chartData: ChartData<'bar' | 'line'> = {
    labels,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    datasets: datasets as any
  };

  const chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#303030',
          font: {
            family: "'Segoe UI', Roboto, sans-serif",
            size: 13,
            weight: 'bold'
          }
        }
      },
      title: {
        display: false, // Using HTML title instead for better export control
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: config.mode === 'bar' ? {
      // Horizontal Bar Config
      x: {
        title: {
          display: config.xUnit !== 'None',
          text: config.xUnit,
          color: '#64748b'
        },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      y: {
        title: {
          display: config.yUnit !== 'None',
          text: config.yUnit,
          color: '#64748b'
        },
        grid: { display: false }
      }
    } : {
      // Line Config with Dual Y-Axis
      x: {
        title: {
          display: config.xUnit !== 'None',
          text: config.xUnit,
          color: '#64748b'
        },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: `${config.y1AxisName} (${config.yUnit})`,
          color: color1Border
        },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      y1: {
        type: 'linear' as const,
        display: data.rows.some(r => r.value2 !== null),
        position: 'right' as const,
        title: {
          display: true,
          text: `${config.y2AxisName}`,
          color: color2Border
        },
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
    },
  };

  // Switch index axis for horizontal bars
  if (config.mode === 'bar') {
      chartOptions.indexAxis = 'y';
  }

  const downloadImage = async () => {
    if (!chartWrapperRef.current) return;

    try {
      // Small timeout to ensure rendering is complete
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(chartWrapperRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `psu_gang_${config.title.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Error exporting image:', err);
      alert('Hubo un error al exportar la imagen.');
    }
  };

  const downloadVideo = () => {
    if (!chartRef.current) return;
    setIsRecording(true);

    try {
      const chartInstance = chartRef.current;
      const canvas = chartInstance.canvas;

      // Update chart to reset animation state
      chartInstance.update('none');

      // Start capturing stream from canvas at 60fps
      const stream = canvas.captureStream(60);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `psu_gang_anim_${config.title.replace(/\s+/g, '_').toLowerCase()}.webm`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      mediaRecorder.start();

      // Trigger standard update to start animation
      chartInstance.update();

      // Record for 2.5 seconds (covers 1.5s animation + 1s hold)
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 2500);

    } catch (err) {
      console.error('Error exporting video:', err);
      alert('Hubo un error al exportar el video. Asegúrate que tu navegador soporta captureStream.');
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="p-4 border-b bg-white flex justify-between items-center z-10 sticky top-0">
        <h2 className="text-xl font-bold text-slate-800">Vista Previa</h2>
        <div className="flex gap-2">
          <button
            onClick={downloadImage}
            className="flex items-center gap-2 bg-[#03D6B3] hover:bg-[#02b395] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
          >
            <Download size={16} />
            Descargar Imagen
          </button>

          <button
            onClick={downloadVideo}
            disabled={isRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm ${
              isRecording
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#303030] hover:bg-[#1a1a1a] text-white'
            }`}
          >
            <Video size={16} />
            {isRecording ? 'Grabando...' : 'Exportar Video'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 flex justify-center items-center bg-[#f1f5f9]">
        {/* Export Target Wrapper */}
        <div
          ref={chartWrapperRef}
          className="w-full max-w-[1200px] aspect-[16/9] bg-white rounded-xl shadow-lg border border-slate-200 p-8 flex flex-col relative"
        >
          {/* Branding Watermark */}
          <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none opacity-5">
            <h1 className="text-6xl font-black uppercase tracking-widest text-[#303030] rotate-[-15deg]">PSU GANG</h1>
            <h2 className="text-4xl font-black uppercase tracking-widest text-[#303030] rotate-[-15deg]">BENCHMARKS</h2>
          </div>

          <div className="absolute top-4 right-6 text-xs text-slate-400 font-medium">
            psugang.com
          </div>

          {/* Titles */}
          <div className="mb-6 text-center z-10 relative">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{config.title}</h1>
            <h2 className="text-xl font-bold text-[#03D6B3] mt-1">{config.componentName}</h2>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 relative w-full h-full z-10">
            {config.mode === 'bar' ? (
              <Bar
                ref={chartRef}
                data={chartData as ChartData<'bar'>}
                options={chartOptions as ChartOptions<'bar'>}
              />
            ) : (
              <Line
                ref={chartRef}
                data={chartData as ChartData<'line'>}
                options={chartOptions as ChartOptions<'line'>}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
