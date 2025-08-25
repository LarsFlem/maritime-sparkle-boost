import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Zap, Activity, BarChart3, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import AdvancedFilters, { FilterConfig } from '@/components/charts/AdvancedFilters';
import CorrelationChart from '@/components/charts/CorrelationChart';
import MultiAxisChart from '@/components/charts/MultiAxisChart';
import TrendAnalysis from '@/components/charts/TrendAnalysis';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Generate demo historical data
const generateHistoricalData = (days: number) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      wg1_power: Math.random() * 500 + 300 + Math.sin(i / 10) * 100,
      wg2_power: Math.random() * 500 + 280 + Math.sin(i / 8) * 120,
      wg3_power: Math.random() * 500 + 320 + Math.sin(i / 12) * 90,
      wg4_power: Math.random() * 500 + 290 + Math.sin(i / 15) * 110,
      total_power: 0,
      wave_height: Math.random() * 3 + 1.5 + Math.sin(i / 7) * 0.5,
      wind_speed: Math.random() * 15 + 8 + Math.sin(i / 9) * 3,
      efficiency: Math.random() * 20 + 75 + Math.sin(i / 6) * 5,
    });
  }
  
  // Calculate total power
  data.forEach(item => {
    item.total_power = item.wg1_power + item.wg2_power + item.wg3_power + item.wg4_power;
  });
  
  return data;
};

const performanceData = [
  { name: 'WG-1', efficiency: 87, uptime: 94, energy: 2.3 },
  { name: 'WG-2', efficiency: 83, uptime: 91, energy: 2.1 },
  { name: 'WG-3', efficiency: 89, uptime: 96, energy: 2.4 },
  { name: 'WG-4', efficiency: 85, uptime: 93, energy: 2.2 },
];

const maintenanceData = [
  { name: 'Planned', value: 15, color: '#22c55e' },
  { name: 'Predictive', value: 8, color: '#3b82f6' },
  { name: 'Emergency', value: 3, color: '#ef4444' },
  { name: 'Completed', value: 42, color: '#6b7280' },
];

export default function DataAnalysis() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterConfig>({
    timeRange: '30',
    turbines: [],
    metrics: ['power'],
    correlationPair: { x: 'wave_height', y: 'total_power' },
    trendMetric: 'total_power'
  });
  
  const historicalData = useMemo(() => generateHistoricalData(parseInt(filters.timeRange)), [filters.timeRange]);
  
  const filteredData = useMemo(() => {
    let data = historicalData;
    
    // Filter by turbines if specific ones are selected
    if (filters.turbines.length > 0) {
      data = data.map(item => {
        const filteredItem = { ...item };
        // Keep only selected turbine data
        const selectedPower = filters.turbines.reduce((sum, turbine) => {
          return sum + (item[`${turbine}_power` as keyof typeof item] as number || 0);
        }, 0);
        filteredItem.filtered_power = selectedPower;
        return filteredItem;
      });
    }
    
    return data;
  }, [historicalData, filters.turbines]);

  const totalEnergyGenerated = useMemo(() => {
    return historicalData.reduce((acc, item) => acc + item.total_power, 0) / 1000; // Convert to MWh
  }, [historicalData]);

  const avgEfficiency = useMemo(() => {
    return historicalData.reduce((acc, item) => acc + item.efficiency, 0) / historicalData.length;
  }, [historicalData]);

  // Multi-axis chart configuration
  const multiAxisMetrics = useMemo(() => [
    { key: 'total_power', name: 'Total Power', type: 'bar' as const, color: 'hsl(var(--primary))', yAxisId: 'left' as const },
    { key: 'wave_height', name: 'Wave Height', type: 'line' as const, color: 'hsl(var(--destructive))', yAxisId: 'right' as const },
    { key: 'wind_speed', name: 'Wind Speed', type: 'line' as const, color: 'hsl(var(--secondary))', yAxisId: 'right' as const },
    { key: 'efficiency', name: 'Efficiency', type: 'line' as const, color: 'hsl(var(--accent))', yAxisId: 'left' as const }
  ], []);

  const exportData = () => {
    const csv = [
      ['Date', 'WG-1 Power', 'WG-2 Power', 'WG-3 Power', 'WG-4 Power', 'Total Power', 'Wave Height', 'Wind Speed', 'Efficiency'].join(','),
      ...historicalData.map(item => [
        item.date,
        item.wg1_power.toFixed(2),
        item.wg2_power.toFixed(2),
        item.wg3_power.toFixed(2),
        item.wg4_power.toFixed(2),
        item.total_power.toFixed(2),
        item.wave_height.toFixed(2),
        item.wind_speed.toFixed(2),
        item.efficiency.toFixed(2)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turbine_data_${filters.timeRange}days.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t('dataAnalysis.title')}</h1>
            <p className="text-muted-foreground">{t('dataAnalysis.subtitle')}</p>
          </div>
          <Button onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('dataAnalysis.exportData')}
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className="mb-6">
          <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('dataAnalysis.totalEnergy')}</p>
                  <p className="text-2xl font-bold">{totalEnergyGenerated.toFixed(1)} MWh</p>
                </div>
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('dataAnalysis.avgEfficiency')}</p>
                  <p className="text-2xl font-bold">{avgEfficiency.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('dataAnalysis.activeTurbines')}</p>
                  <p className="text-2xl font-bold">4/4</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('dataAnalysis.dataPoints')}</p>
                  <p className="text-2xl font-bold">{historicalData.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="power" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="power">{t('dataAnalysis.powerGeneration')}</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="multiaxis">Multi-Axis</TabsTrigger>
            <TabsTrigger value="performance">{t('dataAnalysis.performance')}</TabsTrigger>
            <TabsTrigger value="maintenance">{t('dataAnalysis.maintenance')}</TabsTrigger>
          </TabsList>

          <TabsContent value="power">
            <Card>
              <CardHeader>
                <CardTitle>{t('dataAnalysis.powerGenerationTrends')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {filters.turbines.length === 0 ? (
                      <>
                        <Area type="monotone" dataKey="wg1_power" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="WG-1" />
                        <Area type="monotone" dataKey="wg2_power" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} name="WG-2" />
                        <Area type="monotone" dataKey="wg3_power" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} name="WG-3" />
                        <Area type="monotone" dataKey="wg4_power" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} name="WG-4" />
                      </>
                    ) : (
                      <Area type="monotone" dataKey="filtered_power" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="Selected Turbines" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlation">
            {filters.correlationPair && (
              <CorrelationChart
                data={historicalData}
                xKey={filters.correlationPair.x}
                yKey={filters.correlationPair.y}
                title={`Correlation: ${filters.correlationPair.x} vs ${filters.correlationPair.y}`}
                xLabel={filters.correlationPair.x}
                yLabel={filters.correlationPair.y}
              />
            )}
          </TabsContent>

          <TabsContent value="trends">
            {filters.trendMetric && (
              <TrendAnalysis
                data={historicalData}
                dataKey={filters.trendMetric}
                title={`Trend Analysis: ${filters.trendMetric}`}
                unit={filters.trendMetric.includes('power') ? 'kW' : 
                      filters.trendMetric === 'efficiency' ? '%' :
                      filters.trendMetric === 'wave_height' ? 'm' :
                      filters.trendMetric === 'wind_speed' ? 'm/s' : ''}
              />
            )}
          </TabsContent>

          <TabsContent value="multiaxis">
            <MultiAxisChart
              data={historicalData}
              title="Multi-Axis Analysis: Power vs Environmental Factors"
              metrics={multiAxisMetrics}
              leftAxisLabel="Power (kW) / Efficiency (%)"
              rightAxisLabel="Environmental (m, m/s)"
            />
          </TabsContent>

          <TabsContent value="environmental">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dataAnalysis.waveHeightTrends')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="wave_height" stroke="hsl(var(--primary))" strokeWidth={2} name="Wave Height (m)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dataAnalysis.windSpeedAnalysis')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="wind_speed" stroke="hsl(var(--secondary))" strokeWidth={2} name="Wind Speed (m/s)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dataAnalysis.turbinePerformanceComparison')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="efficiency" fill="hsl(var(--primary))" name="Efficiency %" />
                      <Bar dataKey="uptime" fill="hsl(var(--secondary))" name="Uptime %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dataAnalysis.energyOutputByTurbine')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="energy" fill="hsl(var(--accent))" name="Energy (MWh)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dataAnalysis.maintenanceActivityDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={maintenanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
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
                <CardHeader>
                  <CardTitle>{t('dataAnalysis.maintenanceSchedule')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">WG-1 Blade Inspection</p>
                        <p className="text-sm text-muted-foreground">Scheduled: Tomorrow</p>
                      </div>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">WG-3 Generator Service</p>
                        <p className="text-sm text-muted-foreground">Due: Next Week</p>
                      </div>
                      <Badge variant="default">Predictive</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">WG-2 Gearbox Check</p>
                        <p className="text-sm text-muted-foreground">Completed: Yesterday</p>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}