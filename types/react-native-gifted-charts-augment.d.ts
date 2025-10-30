// TS가 아직 barGroups를 모를 때 최소 보강
import 'react-native-gifted-charts';

declare module 'react-native-gifted-charts' {
  export interface BarGroupItem {
    label: string;
    bars: { value: number; label?: string; frontColor?: string }[];
  }

  // 설치 버전에 따라 props 타입 이름이 다를 수 있어 넓게 보강합니다.
  interface BarChartPropsType {
    barGroups?: BarGroupItem[];
    spacing?: number;
    barBorderRadius?: number;
    maxValue?: number;
    noOfSections?: number;
    initialSpacing?: number;
    endSpacing?: number;
    showVerticalLines?: boolean;
    xAxisThickness?: number;
    yAxisThickness?: number;
    xAxisLabelTextStyle?: any;
    renderTooltip?: (item: any) => React.ReactNode;
    width?: number;
    height?: number;
  }
}
