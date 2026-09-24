import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Zap, Activity, BarChart3, TrendingUp, TrendingDown, Gauge, Thermometer, Waves, Wind, ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import DemoExplainer from '@/components/hmi/DemoExplainer';
import DemoPagerNav from '@/components/DemoPagerNav';
import AdvancedFilters, { FilterConfig } from '@/components/charts/AdvancedFilters';
import CorrelationChart from '@/components/charts/CorrelationChart';
import MultiAxisChart from '@/components/charts/MultiAxisChart';
import TrendAnalysis from '@/components/charts/TrendAnalysis';
import StatisticalSummary from '@/components/charts/StatisticalSummary';
import AnomalyChart from '@/components/charts/AnomalyChart';
import HeatmapChart from '@/components/charts/HeatmapChart';
import DataTable from '@/components/charts/DataTable';
import ComparisonOverlay from '@/components/charts/ComparisonOverlay';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Brush, ReferenceArea
} from 'recharts';

// Enhanced data generation with more variables and realistic seasonal patterns
const generateHistoricalData = (days: number) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    
    const seasonalWave = Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
    const weatherCycle = Math.sin(i / 5) * 0.3 + Math.sin(i / 13) * 0.2;
    
    const waveHeight = Math.max(0.3, 2.5 + seasonalWave * 1.2 + weatherCycle * 0.8 + (Math.random() - 0.5) * 0.6);
    const windSpeed = Math.max(1, 12 + seasonalWave * 4 + weatherCycle * 3 + (Math.random() - 0.5) * 4);
    const seaTemp = 10 - seasonalWave * 5 + (Math.random() - 0.5) * 1.5;
    const currentSpeed = Math.max(0.1, 1.2 + Math.sin(i / 8) * 0.4 + (Math.random() - 0.5) * 0.3);
    
    const basePower = (waveHeight * 120 + windSpeed * 15);
    const wg1_power = Math.max(0, basePower + (Math.random() - 0.5) * 80 + Math.sin(i / 10) * 30);
    const wg2_power = Math.max(0, basePower * 0.92 + (Math.random() - 0.5) * 90 + Math.sin(i / 8) * 25);
    const wg3_power = Math.max(0, basePower * 1.05 + (Math.random() - 0.5) * 70 + Math.sin(i / 12) * 35);
    const wg4_power = Math.max(0, basePower * 0.97 + (Math.random() - 0.5) * 85 + Math.sin(i / 15) * 28);
    const total_power = wg1_power + wg2_power + wg3_power + wg4_power;
    
    const efficiency = Math.min(98, Math.max(55, 82 + (waveHeight > 3.5 ? -8 : 0) + (windSpeed > 18 ? -5 : 0) + (Math.random() - 0.5) * 6));
    const vibration = 2.5 + waveHeight * 0.8 + (Math.random() < 0.03 ? Math.random() * 8 : (Math.random() - 0.5) * 1.2);
    const bearingTemp = 45 + total_power / 200 + (Math.random() - 0.5) * 5 + (Math.random() < 0.02 ? Math.random() * 15 : 0);

    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      wg1_power: +wg1_power.toFixed(1),
      wg2_power: +wg2_power.toFixed(1),
      wg3_power: +wg3_power.toFixed(1),
      wg4_power: +wg4_power.toFixed(1),
      total_power: +total_power.toFixed(1),
      wave_height: +waveHeight.toFixed(2),
      wind_speed: +windSpeed.toFixed(1),
      sea_temp: +seaTemp.toFixed(1),
      current_speed: +currentSpeed.toFixed(2),
      efficiency: +efficiency.toFixed(1),
      vibration: +vibration.toFixed(2),
      bearing_temp: +bearingTemp.toFixed(1),
    });
  }
  return data;
};

const performanceData = [
  { name: 'WG-1', efficiency: 87.3, uptime: 94.2, energy: 2.31, availability: 96.1, mtbf: 312 },
  { name: 'WG-2', efficiency: 83.7, uptime: 91.4, energy: 2.08, availability: 93.5, mtbf: 287 },
  { name: 'WG-3', efficiency: 89.1, uptime: 96.3, energy: 2.44, availability: 97.8, mtbf: 345 },
  { name: 'WG-4', efficiency: 85.2, uptime: 93.0, energy: 2.19, availability: 95.2, mtbf: 298 },
];

const radarData = [
  { metric: 'Efficiency', WG1: 87, WG2: 84, WG3: 89, WG4: 85 },
  { metric: 'Uptime', WG1: 94, WG2: 91, WG3: 96, WG4: 93 },
  { metric: 'Availability', WG1: 96, WG2: 94, WG3: 98, WG4: 95 },
  { metric: 'Reliability', WG1: 88, WG2: 82, WG3: 91, WG4: 86 },
  { metric: 'Output', WG1: 85, WG2: 80, WG3: 90, WG4: 83 },
];

const maintenanceData = [
  { name: 'Planned', value: 15, color: 'hsl(142, 71%, 45%)' },
  { name: 'Predictive', value: 8, color: 'hsl(217, 91%, 60%)' },
  { name: 'Emergency', value: 3, color: 'hsl(0, 84%, 60%)' },
  { name: 'Completed', value: 42, color: 'hsl(215, 14%, 50%)' },
];

const maintenanceLog = [
  { date: 'Tomorrow', item: 'WG-1 Blade Inspection', type: 'Planned', severity: 'low' },
  { date: 'In 3 days', item: 'WG-3 Generator Bearing Replacement', type: 'Predictive', severity: 'medium' },
  { date: 'Next Week', item: 'WG-2 Gearbox Oil Analysis', type: 'Planned', severity: 'low' },
  { date: 'Yesterday', item: 'WG-4 Hydraulic Pump Seal', type: 'Emergency', severity: 'high' },
  { date: '3 days ago', item: 'WG-2 Vibration Sensor Calibration', type: 'Completed', severity: 'low' },
  { date: '1 week ago', item: 'WG-1 Control System Update', type: 'Completed', severity: 'medium' },
];

function KPICard({ label, value, unit, icon: Icon, delta, deltaLabel }: {
  label: string; value: string; unit?: string; icon: LucideIcon; delta?: number; deltaLabel?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1 font-mono tabular-nums">{value}<span className="text-sm font-normal font-sans text-muted-foreground ml-1">{unit}</span></p>
            {delta !== undefined && (
              <div className={`flex items-center gap-0.5 mt-1 text-xs font-medium ${delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(delta).toFixed(1)}% {deltaLabel || 'vs prev. period'}
              </div>
            )}
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const UNIT_MAP: Record<string, string> = {
  total_power: 'kW', wg1_power: 'kW', wg2_power: 'kW', wg3_power: 'kW', wg4_power: 'kW',
  efficiency: '%', wave_height: 'm', wind_speed: 'm/s', vibration: 'mm/s',
  bearing_temp: '°C', sea_temp: '°C', current_speed: 'm/s',
};

export default function DataAnalysis() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterConfig>({
    timeRange: '90',
    turbines: [],
    metrics: ['power'],
    correlationPair: { x: 'wave_height', y: 'total_power' },
    trendMetric: 'total_power',
    comparisonMetric: 'total_power',
  });

  // Zoom state for Power chart
  const [zoomLeft, setZoomLeft] = useState<string | null>(null);
  const [zoomRight, setZoomRight] = useState<string | null>(null);
  const [zoomArea, setZoomArea] = useState<{ left: string; right: string } | null>(null);

  const allData = useMemo(() => generateHistoricalData(parseInt(filters.timeRange)), [filters.timeRange]);

  // Apply custom date filter
  const historicalData = useMemo(() => {
    if (!filters.customDateFrom && !filters.customDateTo) return allData;
    return allData.filter(d => {
      const t = new Date(d.date).getTime();
      if (filters.customDateFrom && t < filters.customDateFrom.getTime()) return false;
      if (filters.customDateTo && t > filters.customDateTo.getTime()) return false;
      return true;
    });
  }, [allData, filters.customDateFrom, filters.customDateTo]);

  // Apply zoom
  const zoomedData = useMemo(() => {
    if (!zoomArea) return historicalData;
    const li = historicalData.findIndex(d => d.date === zoomArea.left);
    const ri = historicalData.findIndex(d => d.date === zoomArea.right);
    if (li >= 0 && ri >= 0) return historicalData.slice(Math.min(li, ri), Math.max(li, ri) + 1);
    return historicalData;
  }, [historicalData, zoomArea]);

  const filteredData = useMemo(() => {
    if (filters.turbines.length === 0) return zoomedData;
    return zoomedData.map(item => {
      const selectedPower = filters.turbines.reduce((sum, turbine) => {
        return sum + ((item as Record<string, number>)[`${turbine}_power`] || 0);
      }, 0);
      return { ...item, filtered_power: selectedPower };
    });
  }, [zoomedData, filters.turbines]);

  // Split data for comparison: first half vs second half
  const { currentPeriod, previousPeriod } = useMemo(() => {
    const half = Math.floor(historicalData.length / 2);
    return { currentPeriod: historicalData.slice(half), previousPeriod: historicalData.slice(0, half) };
  }, [historicalData]);

  const stats = useMemo(() => {
    const totalEnergy = historicalData.reduce((acc, item) => acc + item.total_power, 0) / 1000;
    const avgEff = historicalData.reduce((acc, item) => acc + item.efficiency, 0) / historicalData.length;
    const peakPower = Math.max(...historicalData.map(d => d.total_power));
    const avgVibration = historicalData.reduce((acc, item) => acc + item.vibration, 0) / historicalData.length;
    const avgBearingTemp = historicalData.reduce((acc, item) => acc + item.bearing_temp, 0) / historicalData.length;
    const avgWave = historicalData.reduce((acc, item) => acc + item.wave_height, 0) / historicalData.length;
    
    const halfLen = Math.floor(historicalData.length / 2);
    const firstHalf = historicalData.slice(0, halfLen);
    const secondHalf = historicalData.slice(halfLen);
    const effDelta = ((secondHalf.reduce((s, d) => s + d.efficiency, 0) / secondHalf.length) - 
                     (firstHalf.reduce((s, d) => s + d.efficiency, 0) / firstHalf.length));
    const powerDelta = ((secondHalf.reduce((s, d) => s + d.total_power, 0) / secondHalf.length) - 
                       (firstHalf.reduce((s, d) => s + d.total_power, 0) / firstHalf.length)) / 
                       (firstHalf.reduce((s, d) => s + d.total_power, 0) / firstHalf.length) * 100;

    return { totalEnergy, avgEff, peakPower, avgVibration, avgBearingTemp, avgWave, effDelta, powerDelta };
  }, [historicalData]);

  const multiAxisMetrics = useMemo(() => [
    { key: 'total_power', name: 'Total Power', type: 'bar' as const, color: 'hsl(var(--primary))', yAxisId: 'left' as const },
    { key: 'wave_height', name: 'Wave Height', type: 'line' as const, color: 'hsl(0, 84%, 60%)', yAxisId: 'right' as const },
    { key: 'wind_speed', name: 'Wind Speed', type: 'line' as const, color: 'hsl(217, 91%, 60%)', yAxisId: 'right' as const },
    { key: 'efficiency', name: 'Efficiency', type: 'line' as const, color: 'hsl(142, 71%, 45%)', yAxisId: 'left' as const }
  ], []);

  const statMetrics = useMemo(() => [
    { key: 'total_power', label: 'Total Power', unit: 'kW', decimals: 0 },
    { key: 'efficiency', label: 'Efficiency', unit: '%', decimals: 1 },
    { key: 'wave_height', label: 'Wave Height', unit: 'm', decimals: 2 },
    { key: 'wind_speed', label: 'Wind Speed', unit: 'm/s', decimals: 1 },
    { key: 'vibration', label: 'Vibration', unit: 'mm/s', decimals: 2 },
    { key: 'bearing_temp', label: 'Bearing Temp', unit: '°C', decimals: 1 },
    { key: 'sea_temp', label: 'Sea Temp', unit: '°C', decimals: 1 },
    { key: 'current_speed', label: 'Current Speed', unit: 'm/s', decimals: 2 },
  ], []);

  const tableColumns = useMemo(() => [
    { key: 'date', label: 'Date', decimals: 0 },
    { key: 'wg1_power', label: 'WG-1', unit: 'kW', decimals: 0 },
    { key: 'wg2_power', label: 'WG-2', unit: 'kW', decimals: 0 },
    { key: 'wg3_power', label: 'WG-3', unit: 'kW', decimals: 0 },
    { key: 'wg4_power', label: 'WG-4', unit: 'kW', decimals: 0 },
    { key: 'total_power', label: 'Total', unit: 'kW', decimals: 0 },
    { key: 'efficiency', label: 'Eff.', unit: '%', decimals: 1 },
    { key: 'wave_height', label: 'Wave', unit: 'm', decimals: 2 },
    { key: 'wind_speed', label: 'Wind', unit: 'm/s', decimals: 1 },
    { key: 'vibration', label: 'Vibration', unit: 'mm/s', decimals: 2 },
    { key: 'bearing_temp', label: 'Bear. T', unit: '°C', decimals: 1 },
  ], []);

  const exportData = () => {
    const headers = tableColumns.map(c => `${c.label}${c.unit ? ` (${c.unit})` : ''}`);
    const csv = [
      headers.join(','),
      ...historicalData.map(item =>
        tableColumns.map(c => {
          const v = (item as Record<string, number | string>)[c.key];
          return typeof v === 'number' ? v.toFixed(c.decimals ?? 2) : v;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turbine_data_${filters.timeRange}d_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Drag-to-zoom handlers for Power chart
  const handleMouseDown = (e: { activeLabel?: string } | null) => {
    if (e?.activeLabel) setZoomLeft(e.activeLabel);
  };
  const handleMouseMove = (e: { activeLabel?: string } | null) => {
    if (zoomLeft && e?.activeLabel) setZoomRight(e.activeLabel);
  };
  const handleMouseUp = () => {
    if (zoomLeft && zoomRight && zoomLeft !== zoomRight) {
      setZoomArea({ left: zoomLeft, right: zoomRight });
    }
    setZoomLeft(null);
    setZoomRight(null);
  };
  const resetZoom = () => { setZoomArea(null); setZoomLeft(null); setZoomRight(null); };

  const compMetric = filters.comparisonMetric || 'total_power';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="pointer-events-none fixed inset-0 z-30 hmi-scanlines" />

        {/* Top status bar */}
        <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                {t('dataAnalysis.statusBar')}
              </span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
              {t('dataAnalysis.station')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-wider hidden sm:inline">
              <span className="text-muted-foreground">{t('dataAnalysis.samples')} </span>
              <span className="text-primary tabular-nums">{historicalData.length} d</span>
            </span>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <button
              onClick={exportData}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
            >
              <Download className="h-3 w-3" />
              {t('dataAnalysis.exportCsv')}
            </button>
          </div>
        </div>

      <div className="container mx-auto px-4 py-6">
        {/* Page intro */}
        <div className="text-center max-w-3xl mx-auto pt-2 pb-1 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('dataAnalysis.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dataAnalysis.subtitle')}</p>
        </div>

        <div className="mb-6">
          <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <KPICard label="Total Energy" value={stats.totalEnergy.toFixed(1)} unit="MWh" icon={Zap} delta={stats.powerDelta} />
          <KPICard label="Avg Efficiency" value={stats.avgEff.toFixed(1)} unit="%" icon={Gauge} delta={stats.effDelta} />
          <KPICard label="Peak Power" value={stats.peakPower.toFixed(0)} unit="kW" icon={TrendingUp} />
          <KPICard label="Avg Vibration" value={stats.avgVibration.toFixed(1)} unit="mm/s" icon={Activity} />
          <KPICard label="Bearing Temp" value={stats.avgBearingTemp.toFixed(1)} unit="°C" icon={Thermometer} />
          <KPICard label="Avg Wave Ht." value={stats.avgWave.toFixed(2)} unit="m" icon={Waves} />
        </div>

        <Tabs defaultValue="power" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-background/40 border border-border/40 rounded-md p-1">
            {[
              ['power', 'Power'],
              ['comparison', 'Comparison'],
              ['correlation', 'Correlation'],
              ['trends', 'Trends'],
              ['multiaxis', 'Multi-Axis'],
              ['anomaly', 'Anomaly'],
              ['heatmap', 'Heatmap'],
              ['stats', 'Statistics'],
              ['performance', 'Performance'],
              ['maintenance', 'Maintenance'],
              ['rawdata', 'Raw Data'],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="font-mono text-[11px] uppercase tracking-wider data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Power — with drag-to-zoom + Brush */}
          <TabsContent value="power">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Power Generation — Stacked Area
                  {zoomArea && (
                    <Button variant="outline" size="sm" onClick={resetZoom}>Reset Zoom</Button>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">Click and drag on the chart to zoom in. Use the brush slider below to pan.</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={420}>
                  <AreaChart
                    data={filteredData}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'kW', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                    <Tooltip />
                    <Legend />
                    {filters.turbines.length === 0 ? (
                      <>
                        <Area type="monotone" dataKey="wg1_power" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.7} name="WG-1" />
                        <Area type="monotone" dataKey="wg2_power" stackId="1" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.6} name="WG-2" />
                        <Area type="monotone" dataKey="wg3_power" stackId="1" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.6} name="WG-3" />
                        <Area type="monotone" dataKey="wg4_power" stackId="1" stroke="hsl(32, 95%, 50%)" fill="hsl(32, 95%, 50%)" fillOpacity={0.6} name="WG-4" />
                      </>
                    ) : (
                      <Area type="monotone" dataKey="filtered_power" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="Selected" />
                    )}
                    {zoomLeft && zoomRight && (
                      <ReferenceArea x1={zoomLeft} x2={zoomRight} strokeOpacity={0.3} fill="hsl(var(--primary))" fillOpacity={0.1} />
                    )}
                    <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" travellerWidth={8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Period Comparison */}
          <TabsContent value="comparison">
            <ComparisonOverlay
              currentData={currentPeriod}
              previousData={previousPeriod}
              metric={compMetric}
              metricLabel={compMetric.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              unit={UNIT_MAP[compMetric] || ''}
              currentLabel="Second Half"
              previousLabel="First Half"
            />
          </TabsContent>

          {/* Correlation */}
          <TabsContent value="correlation">
            {filters.correlationPair && (
              <CorrelationChart
                data={historicalData}
                xKey={filters.correlationPair.x}
                yKey={filters.correlationPair.y}
                title={`Correlation: ${filters.correlationPair.x.replace(/_/g, ' ')} vs ${filters.correlationPair.y.replace(/_/g, ' ')}`}
                xLabel={filters.correlationPair.x.replace(/_/g, ' ')}
                yLabel={filters.correlationPair.y.replace(/_/g, ' ')}
              />
            )}
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends">
            {filters.trendMetric && (
              <TrendAnalysis
                data={historicalData}
                dataKey={filters.trendMetric}
                title={`Trend Analysis: ${filters.trendMetric.replace(/_/g, ' ')}`}
                unit={UNIT_MAP[filters.trendMetric] || ''}
              />
            )}
          </TabsContent>

          {/* Multi-Axis */}
          <TabsContent value="multiaxis">
            <MultiAxisChart
              data={historicalData}
              title="Multi-Axis: Power vs Environmental Factors"
              metrics={multiAxisMetrics}
              leftAxisLabel="Power (kW) / Efficiency (%)"
              rightAxisLabel="Wave (m) / Wind (m/s)"
            />
          </TabsContent>

          {/* Anomaly Detection */}
          <TabsContent value="anomaly">
            <div className="grid grid-cols-1 gap-6">
              <AnomalyChart data={historicalData} dataKey="vibration" title="Vibration Anomaly Detection" unit="mm/s" sensitivity={2} />
              <AnomalyChart data={historicalData} dataKey="bearing_temp" title="Bearing Temperature Anomaly Detection" unit="°C" sensitivity={2.5} />
            </div>
          </TabsContent>

          {/* Heatmap */}
          <TabsContent value="heatmap">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HeatmapChart data={historicalData} title="Power Output Heatmap (Day × Hour)" metric="total_power" unit="kW" />
              <HeatmapChart data={historicalData} title="Efficiency Heatmap (Day × Hour)" metric="efficiency" unit="%" />
            </div>
          </TabsContent>

          {/* Statistical Summary */}
          <TabsContent value="stats">
            <StatisticalSummary data={historicalData} metrics={statMetrics} />
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Turbine Performance Comparison</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="efficiency" fill="hsl(var(--primary))" name="Efficiency %" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="uptime" fill="hsl(217, 91%, 60%)" name="Uptime %" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="availability" fill="hsl(142, 71%, 45%)" name="Availability %" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Turbine Radar Profile</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={90} domain={[70, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="WG-1" dataKey="WG1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="WG-3" dataKey="WG3" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} strokeWidth={2} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Energy Output & MTBF</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" label={{ value: 'Energy (MWh)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'MTBF (hours)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="energy" fill="hsl(32, 95%, 50%)" name="Energy (MWh)" radius={[3, 3, 0, 0]} />
                      <Bar yAxisId="right" dataKey="mtbf" fill="hsl(var(--primary))" name="MTBF (hrs)" radius={[3, 3, 0, 0]} fillOpacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Maintenance */}
          <TabsContent value="maintenance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Maintenance Activity Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={maintenanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        innerRadius={50}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {maintenanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Maintenance Schedule & Log</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {maintenanceLog.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{item.item}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                        <Badge
                          variant={item.severity === 'high' ? 'destructive' : item.type === 'Completed' ? 'secondary' : 'default'}
                          className="ml-2 shrink-0"
                        >
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Raw Data Table */}
          <TabsContent value="rawdata">
            <DataTable data={historicalData} columns={tableColumns} title="Raw Sensor Data" />
          </TabsContent>
        </Tabs>

        {/* Explainer */}
        <div className="mt-6">
          <DemoExplainer
            title={t('dataAnalysis.explainer.title')}
            items={[
              { title: t('dataAnalysis.explainer.exploreTitle'), body: t('dataAnalysis.explainer.exploreBody') },
              { title: t('dataAnalysis.explainer.anomalyTitle'), body: t('dataAnalysis.explainer.anomalyBody') },
              { title: t('dataAnalysis.explainer.maintTitle'), body: t('dataAnalysis.explainer.maintBody') },
            ]}
          />
          <DemoPagerNav />
        </div>
      </div>
      </div>
    </div>
  );
}
