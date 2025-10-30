import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

type Props = { actualValues: number[]; targetValues: number[]; };

const w = Dimensions.get('window').width;

const GroupBarChart: React.FC<Props> = ({ actualValues, targetValues }) => {

  const data = useMemo(() => {
    const t0 = targetValues?.[0] ?? 0;
    const a0 = actualValues?.[0] ?? 0;
    const t1 = targetValues?.[1] ?? 0;
    const a1 = actualValues?.[1] ?? 0;

    return [
      { value: t0, frontColor: 'rgba(125,216,255,0.95)', label: '', showToolTip: true, toolTipLabel: `목표: ${t0}`},
      { value: a0, frontColor: 'rgba(192,194,255,0.95)', label: '', spacing: 50, showToolTip: true, toolTipLabel: `실제: ${a0}`},

      { value: t1, frontColor: 'rgba(125,216,255,0.95)', label: '', spacing: 16, showToolTip: true, toolTipLabel: `목표: ${t1}`},
      { value: a1, frontColor: 'rgba(192,194,255,0.95)', label: '', showToolTip: true, toolTipLabel: `실제: ${a1}`},
    ];
  }, [actualValues, targetValues]);

  const maxValue = Math.max(1, ...data.map(d => d.value));
  const chartWidth = Math.max(260, Math.min(w - 48, 300));

  return (
  <View style={{ marginLeft: -65, width: chartWidth }}> 
    <BarChart
      data={data}
      width={chartWidth}
      height={230}
      barWidth={50}
      spacing={18} 
      barBorderRadius={8}
      maxValue={maxValue}
      noOfSections={5}
      showVerticalLines
      xAxisThickness={6} 
      xAxisColor={'#EEEEEE'} 
      yAxisThickness={0}
      hideRules={true} 
      isAnimated
      initialSpacing={16}
      endSpacing={30}
      disableScroll
      renderTooltip={(item: any) => (
      <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>
        {item?.toolTipLabel ?? item?.value ?? 0}
      </Text>
      </View>
      )}
    />    
    </View>
  );
};
const styles = StyleSheet.create({
    tooltip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#333', 
        borderRadius: 6,
    },
    tooltipText: { 
        fontSize: 12, 
        color: 'white',
        fontWeight: 'bold', 
    },
});


export default GroupBarChart;
