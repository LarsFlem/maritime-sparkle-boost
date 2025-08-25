import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface FilterConfig {
  timeRange: string;
  turbines: string[];
  metrics: string[];
  correlationPair?: {
    x: string;
    y: string;
  };
  trendMetric?: string;
}

interface AdvancedFiltersProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
}

const METRIC_OPTIONS = [
  { value: 'power', label: 'Power Generation' },
  { value: 'efficiency', label: 'Efficiency' },
  { value: 'wave_height', label: 'Wave Height' },
  { value: 'wind_speed', label: 'Wind Speed' },
  { value: 'total_power', label: 'Total Power' }
];

const TURBINE_OPTIONS = [
  { value: 'wg1', label: 'WG-1' },
  { value: 'wg2', label: 'WG-2' },
  { value: 'wg3', label: 'WG-3' },
  { value: 'wg4', label: 'WG-4' }
];

export default function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const { t } = useLanguage();

  const updateFilters = (updates: Partial<FilterConfig>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleTurbine = (turbine: string) => {
    const newTurbines = filters.turbines.includes(turbine)
      ? filters.turbines.filter(t => t !== turbine)
      : [...filters.turbines, turbine];
    updateFilters({ turbines: newTurbines });
  };

  const toggleMetric = (metric: string) => {
    const newMetrics = filters.metrics.includes(metric)
      ? filters.metrics.filter(m => m !== metric)
      : [...filters.metrics, metric];
    updateFilters({ metrics: newMetrics });
  };

  const clearFilters = () => {
    onFiltersChange({
      timeRange: '30',
      turbines: [],
      metrics: ['power'],
      correlationPair: undefined,
      trendMetric: undefined
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
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Range */}
        <div className="space-y-2">
          <Label>Time Range</Label>
          <Select value={filters.timeRange} onValueChange={(value) => updateFilters({ timeRange: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Turbine Selection */}
        <div className="space-y-2">
          <Label>Turbines</Label>
          <div className="flex flex-wrap gap-2">
            {TURBINE_OPTIONS.map(turbine => (
              <Badge
                key={turbine.value}
                variant={filters.turbines.includes(turbine.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTurbine(turbine.value)}
              >
                {turbine.label}
                {filters.turbines.includes(turbine.value) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="space-y-2">
          <Label>Metrics to Analyze</Label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.map(metric => (
              <Badge
                key={metric.value}
                variant={filters.metrics.includes(metric.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleMetric(metric.value)}
              >
                {metric.label}
                {filters.metrics.includes(metric.value) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Correlation Analysis */}
        <div className="space-y-2">
          <Label>Correlation Analysis</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select 
              value={filters.correlationPair?.x || ''} 
              onValueChange={(value) => updateFilters({ 
                correlationPair: { 
                  x: value, 
                  y: filters.correlationPair?.y || 'power' 
                } 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="X-Axis" />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map(metric => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.correlationPair?.y || ''} 
              onValueChange={(value) => updateFilters({ 
                correlationPair: { 
                  x: filters.correlationPair?.x || 'wave_height', 
                  y: value 
                } 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Y-Axis" />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map(metric => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="space-y-2">
          <Label>Trend Analysis</Label>
          <Select 
            value={filters.trendMetric || ''} 
            onValueChange={(value) => updateFilters({ trendMetric: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select metric for trend analysis" />
            </SelectTrigger>
            <SelectContent>
              {METRIC_OPTIONS.map(metric => (
                <SelectItem key={metric.value} value={metric.value}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}