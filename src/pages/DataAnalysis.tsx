import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, TrendingUp, Zap, Activity, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
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
  const [timeRange, setTimeRange] = useState('30');
  const [selectedTurbine, setSelectedTurbine] = useState('all');
  
  const historicalData = useMemo(() => generateHistoricalData(parseInt(timeRange)), [timeRange]);
  
  const filteredData = useMemo(() => {
    if (selectedTurbine === 'all') return historicalData;
    return historicalData.map(item => ({
      ...item,
      filtered_power: item[`${selectedTurbine}_power` as keyof typeof item] as number
    }));
  }, [historicalData, selectedTurbine]);

  const totalEnergyGenerated = useMemo(() => {
    return historicalData.reduce((acc, item) => acc + item.total_power, 0) / 1000; // Convert to MWh
  }, [historicalData]);

  const avgEfficiency = useMemo(() => {
    return historicalData.reduce((acc, item) => acc + item.efficiency, 0) / historicalData.length;
  }, [historicalData]);

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
    a.download = `turbine_data_${timeRange}days.csv`;
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

        {/* Controls */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('dataAnalysis.selectTimeRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('dataAnalysis.last7days')}</SelectItem>
              <SelectItem value="30">{t('dataAnalysis.last30days')}</SelectItem>
              <SelectItem value="90">{t('dataAnalysis.last90days')}</SelectItem>
              <SelectItem value="365">{t('dataAnalysis.lastYear')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTurbine} onValueChange={setSelectedTurbine}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('dataAnalysis.selectTurbine')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dataAnalysis.allTurbines')}</SelectItem>
              <SelectItem value="wg1">WG-1</SelectItem>
              <SelectItem value="wg2">WG-2</SelectItem>
              <SelectItem value="wg3">WG-3</SelectItem>
              <SelectItem value="wg4">WG-4</SelectItem>
            </SelectContent>
          </Select>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="power">{t('dataAnalysis.powerGeneration')}</TabsTrigger>
            <TabsTrigger value="environmental">{t('dataAnalysis.environmental')}</TabsTrigger>
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
                    {selectedTurbine === 'all' ? (
                      <>
                        <Area type="monotone" dataKey="wg1_power" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="WG-1" />
                        <Area type="monotone" dataKey="wg2_power" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="WG-2" />
                        <Area type="monotone" dataKey="wg3_power" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="WG-3" />
                        <Area type="monotone" dataKey="wg4_power" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="WG-4" />
                      </>
                    ) : (
                      <Area type="monotone" dataKey="filtered_power" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name={selectedTurbine.toUpperCase()} />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
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
                      <Line type="monotone" dataKey="wave_height" stroke="#06b6d4" strokeWidth={2} name="Wave Height (m)" />
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
                      <Line type="monotone" dataKey="wind_speed" stroke="#8b5cf6" strokeWidth={2} name="Wind Speed (m/s)" />
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
                      <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                      <Bar dataKey="uptime" fill="#10b981" name="Uptime %" />
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
                      <Bar dataKey="energy" fill="#f59e0b" name="Energy (MWh)" />
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