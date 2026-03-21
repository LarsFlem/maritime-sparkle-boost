import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import DateRangePicker from './DateRangePicker';

export interface FilterConfig {
  timeRange: string;
  turbines: string[];
  metrics: string[];
  correlationPair?: { x: string; y: string };
  trendMetric?: string;
  customDateFrom?: Date;
  customDateTo?: Date;
  comparisonMetric?: string;
}

interface AdvancedFiltersProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
}

const DATA_KEYS = [
  { value: 'total_power', label: 'Total Power (kW)' },
  { value: 'wg1_power', label: 'WG-1 Power (kW)' },
  { value: 'wg2_power', label: 'WG-2 Power (kW)' },
  { value: 'wg3_power', label: 'WG-3 Power (kW)' },
  { value: 'wg4_power', label: 'WG-4 Power (kW)' },
  { value: 'efficiency', label: 'Efficiency (%)' },
  { value: 'wave_height', label: 'Wave Height (m)' },
  { value: 'wind_speed', label: 'Wind Speed (m/s)' },
  { value: 'vibration', label: 'Vibration (mm/s)' },
  { value: 'bearing_temp', label: 'Bearing Temp (°C)' },
  { value: 'sea_temp', label: 'Sea Temp (°C)' },
  { value: 'current_speed', label: 'Current Speed (m/s)' },
];

const TURBINE_OPTIONS = [
  { value: 'wg1', label: 'WG-1' },
  { value: 'wg2', label: 'WG-2' },
  { value: 'wg3', label: 'WG-3' },
  { value: 'wg4', label: 'WG-4' },
];

export default function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const updateFilters = (updates: Partial<FilterConfig>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleTurbine = (turbine: string) => {
    const newTurbines = filters.turbines.includes(turbine)
      ? filters.turbines.filter(t => t !== turbine)
      : [...filters.turbines, turbine];
    updateFilters({ turbines: newTurbines });
  };

  const clearFilters = () => {
    onFiltersChange({
      timeRange: '30',
      turbines: [],
      metrics: ['power'],
      correlationPair: { x: 'wave_height', y: 'total_power' },
      trendMetric: 'total_power',
      customDateFrom: undefined,
      customDateTo: undefined,
      comparisonMetric: 'total_power',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters}>Clear All</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: Time + Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Preset Range</Label>
            <Select value={filters.timeRange} onValueChange={(v) => updateFilters({ timeRange: v, customDateFrom: undefined, customDateTo: undefined })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Custom Date Range</Label>
            <DateRangePicker
              from={filters.customDateFrom}
              to={filters.customDateTo}
              onRangeChange={(from, to) => updateFilters({ customDateFrom: from, customDateTo: to })}
            />
          </div>
        </div>

        {/* Row 2: Turbines */}
        <div className="space-y-2">
          <Label>Turbines</Label>
          <div className="flex flex-wrap gap-2">
            {TURBINE_OPTIONS.map(t => (
              <Badge
                key={t.value}
                variant={filters.turbines.includes(t.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTurbine(t.value)}
              >
                {t.label}
                {filters.turbines.includes(t.value) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </div>

        {/* Row 3: Correlation + Trend + Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Correlation X vs Y</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.correlationPair?.x || 'wave_height'}
                onValueChange={(v) => updateFilters({ correlationPair: { x: v, y: filters.correlationPair?.y || 'total_power' } })}
              >
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{DATA_KEYS.map(k => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select
                value={filters.correlationPair?.y || 'total_power'}
                onValueChange={(v) => updateFilters({ correlationPair: { x: filters.correlationPair?.x || 'wave_height', y: v } })}
              >
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{DATA_KEYS.map(k => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Trend Metric</Label>
            <Select value={filters.trendMetric || 'total_power'} onValueChange={(v) => updateFilters({ trendMetric: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DATA_KEYS.map(k => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Comparison Metric</Label>
            <Select value={filters.comparisonMetric || 'total_power'} onValueChange={(v) => updateFilters({ comparisonMetric: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DATA_KEYS.map(k => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
