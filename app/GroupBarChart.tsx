import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { G, Rect, Text as SvgText } from 'react-native-svg';
import { BarChart, XAxis } from 'react-native-svg-charts';

const GroupBarChart = ({
  actualValues,
  targetValues,
}: {
  actualValues: number[];
  targetValues: number[];
}) => {
  const categories = ['지출', '저축'];

  const maxValue = Math.max(...targetValues, ...actualValues);
  const [selected, setSelected] = useState<{ index: number; value: number } | null>(null);
  const BarsOverlay = ({ x, y, bandwidth }: any) => (
    <G>
      {actualValues.map((value, index) => (
        <Rect
          key={index}
          x={x(index)}
          y={0}
          width={bandwidth}
          height={y(0)}
          fill="transparent"
          onPressIn={() => setSelected({ index, value })}
        />
      ))}

      {/* 툴팁 */}
      {selected && (
        <G>
          <SvgText
            x={x(selected.index) + bandwidth / 2}
            y={y(selected.value) - 10} // 막대 위에 위치
            fontSize={14}
            fill="black"
            textAnchor="middle"
          >
            {selected.value}
          </SvgText>
        </G>
      )}
    </G>
  );
  return (
    <View style={styles.container}>
      {/* 목표값 (연한 파랑) */}
      <BarChart
        style={styles.chart}
        data={targetValues}
        svg={{ fill: 'rgba(125,216,255,0.5)' }}
        yMin={0}              
        yMax={maxValue}    
        spacingInner={0.5}  
        spacingOuter={0.3} 
      >
      <BarsOverlay />
      </BarChart>

      <BarChart
        style={[styles.chart, StyleSheet.absoluteFill]}
        data={actualValues}
        svg={{ fill: 'rgba(192,193,255,0.7)' }}
        yMin={0}     
        yMax={maxValue}
        spacingInner={0.5}  
        spacingOuter={0.3} 
        contentInset={{ bottom: 20 }}
      />
      {/* X축 */}
      <XAxis
        style={{ marginTop: 8 }}
        data={targetValues}
        formatLabel={(value, index) => categories[index]}
        contentInset={{ left: 78, right: 78 }}
        svg={{ fontSize: 14, fill: 'black' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: 300,
    marginBottom: 20
  },
  chart: {
    flex: 1,
  },

});

export default GroupBarChart;
