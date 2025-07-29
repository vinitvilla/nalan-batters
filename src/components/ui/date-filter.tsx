"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import moment from "moment";

interface DateFilterProps {
  dateFilter: {
    startDate: string;
    endDate: string;
    quickFilter: string;
  };
  onDateFilterChange: (filter: {
    startDate: string;
    endDate: string;
    quickFilter: string;
  }) => void;
  className?: string;
}

export function DateFilter({ dateFilter, onDateFilterChange, className = "" }: DateFilterProps) {
  // Date filter utilities using Moment.js
  const getDateString = (date: moment.Moment) => {
    return date.format('YYYY-MM-DD');
  };

  const handleQuickFilterChange = (quickFilter: string) => {
    const today = moment();
    let startDate = '';
    let endDate = getDateString(today);

    switch (quickFilter) {
      case 'today':
        startDate = getDateString(today);
        break;
      case 'yesterday':
        const yesterday = moment().subtract(1, 'day');
        startDate = getDateString(yesterday);
        endDate = getDateString(yesterday);
        break;
      case 'week':
        const weekStart = moment().subtract(7, 'days');
        startDate = getDateString(weekStart);
        break;
      case 'month':
        const monthStart = moment().subtract(1, 'month');
        startDate = getDateString(monthStart);
        break;
      case 'quarter':
        const quarterStart = moment().subtract(3, 'months');
        startDate = getDateString(quarterStart);
        break;
      case 'year':
        const yearStart = moment().subtract(1, 'year');
        startDate = getDateString(yearStart);
        break;
      case 'all':
      default:
        startDate = '';
        endDate = '';
        break;
    }

    onDateFilterChange({ startDate, endDate, quickFilter });
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onDateFilterChange({
      ...dateFilter,
      [field]: value,
      quickFilter: 'custom',
    });
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label className="text-sm font-medium mb-2">Date Range</label>
      
      {/* Quick date filter dropdown */}
      <Select
        value={dateFilter.quickFilter}
        onValueChange={handleQuickFilterChange}
      >
        <SelectTrigger className="w-full md:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="week">Last 7 Days</SelectItem>
          <SelectItem value="month">Last 30 Days</SelectItem>
          <SelectItem value="quarter">Last 3 Months</SelectItem>
          <SelectItem value="year">Last Year</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom date range inputs */}
      {dateFilter.quickFilter === 'custom' && (
        <div className="flex flex-col space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Label htmlFor="start-date" className="text-xs text-gray-600">From:</Label>
            <Input
              id="start-date"
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="w-32 h-8 text-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Label htmlFor="end-date" className="text-xs text-gray-600">To:</Label>
            <Input
              id="end-date"
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="w-32 h-8 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
