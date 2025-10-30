'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
type RangeType = 'day' | 'week' | 'month' | 'year';

interface DataPoint {
  label: string;
  value1: number;
  value2: number;
  value3: number;
}
function DistributionOfApplicationCases() {
  return <div>DistributionOfApplicationCases</div>;
}

export default DistributionOfApplicationCases;
