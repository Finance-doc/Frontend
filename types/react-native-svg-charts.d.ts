// src/types/react-native-svg-charts.d.ts
declare module 'react-native-svg-charts' {
  import * as React from 'react';

  export interface ChartCommonProps {
    style?: object;
    data: Array<any>;
    svg?: object;
    contentInset?: { top?: number; bottom?: number; left?: number; right?: number };

    children?: React.ReactNode | ((props: { 
      x: (index: number) => number; 
      y: (value: number) => number; 
      data: any[] 
    }) => React.ReactNode);
  }

  export interface BarChartProps extends ChartCommonProps {
    spacingInner?: number;
    spacingOuter?: number;
    yMin?: number;  
    yMax?: number;   
  }

  export class BarChart extends React.Component<BarChartProps> {}
  export class LineChart extends React.Component<ChartCommonProps> {}
  export class PieChart extends React.Component<ChartCommonProps> {}

  export interface StackedBarChartProps extends ChartCommonProps {
    keys: string[];
    colors: string[];
    showGrid?: boolean;
  }
  export class StackedBarChart extends React.Component<StackedBarChartProps> {}

  export interface AxisProps {
    style?: object;
    data: any[];
    formatLabel?: (value: any, index: number) => string;
    contentInset?: { left?: number; right?: number; top?: number; bottom?: number };
    svg?: object;
  }
  export class XAxis extends React.Component<AxisProps> {}
  export class YAxis extends React.Component<AxisProps> {}

  export const Grid: React.ComponentType<any>;
}
