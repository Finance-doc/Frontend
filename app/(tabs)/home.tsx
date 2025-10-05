import { Colors } from '@/constants/colors';
import * as d3 from "d3-shape";
import React, { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Line, Path, Text as SvgText } from "react-native-svg";

const screenWidth = Dimensions.get('window').width;
const IMG_CIRCLE = require('../../assets/images/img_circle_blue.png');

const piedata = [
  {
    "name": "python",
    "value": 149,
    "color": "hsl(190, 70%, 50%)"
  },
  {
    "name": "erlang",
    "value": 157,
    "color": "hsl(169, 70%, 50%)"
  },
  {
    "name": "java",
    "value": 306,
    "color": "hsl(138, 70%, 50%)"
  },
  {
    "name": "lisp",
    "value": 87,
    "color": "hsl(3, 70%, 50%)"
  },
  {
    "name": "haskell",
    "value": 112,
    "color": "hsl(237, 70%, 50%)"
  },
  {
    "name": "ruby",
    "value": 157,
    "color": "hsl(202, 70%, 50%)"
  },
  {
    "name": "make",
    "value": 260,
    "color": "hsl(336, 70%, 50%)"
  },
];

const sampleData = [
  { id: '1', percent: '20%', name: '식비', amount: '10,000원' },
  { id: '2', percent: '30%', name: '문화생활', amount: '15,000원' },
  { id: '3', percent: '50%', name: '생활용품크크', amount: '250,000원' },
];

const ListItem = ({ percent, name, amount }: { percent: string; name: string; amount: string }) => (
  <View style={styles.listItem}>
    <Image source={IMG_CIRCLE} style={styles.circle} />
    <Text style={styles.percent}>{percent}</Text>
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.amount}>{amount}</Text>
  </View>
);

const sortedPiedata = piedata.sort((a, b) => b.value - a.value);  // value 기준 내림차순 정렬

const pieChartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  color: (opacity = 1) => `rgba(164, 165, 255, ${opacity})`, // 기본 색상 정의
  style: {
    borderRadius: 16,
  },
};

type PieChartComponentProps = {
  data: { name: string; value: number; color: string }[];
  activeId: string | null;
};

export const PieChartComponent = ({ data, activeId }: PieChartComponentProps) => {
  // activeId를 반영해서 data 가공
  const chartData = sortedPiedata.map((d) => ({
    name: d.name,
    population: d.value,
    color: d.color,
    legendFontColor: "#543131ff",
    legendFontSize: 12,
  }));

  return (
    <View>
      <PieChart
        data={chartData}
        width={screenWidth}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        chartConfig={pieChartConfig}
        paddingLeft="16"
        hasLegend={true}
      />
    </View>
  );
};
export default function Home() {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0); // 0: 달력, 1: 통계
  const scrollX = useRef(new Animated.Value(0)).current;

  const tabs = useMemo(() => ['달력', '통계'], []);

  const handleTabPress = (i: number) => {
    setIndex(i);
    scrollRef.current?.scrollTo({ x: i * screenWidth, animated: true });
  };

  const onMomentumEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setIndex(newIndex);
  };

  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [0, screenWidth / tabs.length],
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  const pieGenerator = d3.pie<any>().value((d) => d.value);
  const arcData = pieGenerator(piedata);

  const outerRadius = 100;
  const innerRadius = 50;

  return (
  <SafeAreaView style={styles.container} edges={['bottom']}>
    <View style={styles.title}>
      <View style={styles.tabBarInHeader}>
        {tabs.map((t, i) => {
          const isActive = index === i;
          return (              
          <Pressable key={t} style={styles.tab} onPress={() => handleTabPress(i)}>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{t}</Text>
          </Pressable>
          );
        })}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: screenWidth / tabs.length,    
              transform: [{ translateX: indicatorTranslateX }],
            },            
          ]}
        />
      </View>
    </View>
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={onMomentumEnd}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }        
      )}
      scrollEventThrottle={16}
    >

    {/* 달력 페이지 */}
    <View style={[styles.page, { width: screenWidth }]}>
      <Text style={styles.pageTitle}>달력 화면</Text>
    </View>

    {/* 통계 페이지 */}
    <View style={[styles.page, { width: screenWidth }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={{ fontSize: 20, color: Colors.textgray, fontWeight: 'bold', marginTop: 30, marginStart: 30}}>
          총 지출
        </Text>
        <Text style={{ fontSize: 30, color: Colors.black, fontWeight: 'bold', marginTop: 15, marginStart: 30}}>
          1,000,000 원
        </Text>
        <View style={{ alignItems: "center", marginTop: 20, overflow: "visible" }}>
          <Svg width={screenWidth} height={outerRadius * 2 + 120}>
            <G x={screenWidth / 2} y={outerRadius + 40}>
              {arcData.map((slice) => {
                const arcGenerator = d3.arc<any>()
                .cornerRadius(5);
                // Path
                const path = arcGenerator({
                  ...slice,
                  innerRadius,
                  outerRadius: slice.data.name === activeId ? outerRadius + 10 : outerRadius,
                  
                })
                ;
                // 선 시작점 (조각 끝)
                const [lineStartX, lineStartY] = arcGenerator.centroid({
                  ...slice,
                  innerRadius,
                  outerRadius: outerRadius + 50,
                });

                // 선 끝점 (조각 밖)
                const [lineEndX, lineEndY] = arcGenerator.centroid({
                  ...slice,
                  innerRadius,
                  outerRadius: outerRadius + 110,
                });

                return (
                  <G key={slice.data.name}>
                    <Path
                      d={path!}
                      fill={slice.data.color}
                      fillOpacity={slice.data.name === activeId ? 1 : 0.8}
                      onPress={() => setActiveId(slice.data.name)}
                    />

                    {/* 라벨 연결선 */}
                    <Line
                      x1={lineStartX}
                      y1={lineStartY}
                      x2={lineEndX}
                      y2={lineEndY}
                      stroke="#333"
                      strokeWidth={1}
                    />

                    {/* 라벨 */}
                    <SvgText
                      x={lineEndX}
                      y={lineEndY}
                      fill="#000"
                      fontSize={15}   // 숫자로 쓰는게 TS-friendly
                      textAnchor={lineEndX > 0 ? "start" : "end"}
                      alignmentBaseline="middle"
                    >
                      {slice.data.name}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </Svg>
        </View>
        <View style={{ marginTop: 3, alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/img_line_grey.png')}
            style={{ height: 2 }}  
            resizeMode="cover"
          />
        </View>
        <View>
          <View style={{ marginTop: 5 }}>
            {sampleData.map((item) => (
              <ListItem
                key={item.id}
                percent={item.percent}
                name={item.name}
                amount={item.amount}
              />
            ))}
          </View>
        </View>
      </ScrollView> 
    </View>
    </Animated.ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white,},
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop:15, paddingBottom: 15,},
  tabBar: { flexDirection: 'row', position: 'relative',borderBottomWidth: StyleSheet.hairlineWidth,},
  tabBarInHeader: { flexDirection: 'row', position: 'relative',},
  tab: { width: screenWidth / 2, alignItems: 'center',justifyContent: 'center',},
  tabText: { fontSize: 20, color: '#9AA0A6', fontWeight: '900' },
  tabTextActive: { color: '#000' },
  indicator: {position: 'absolute', height: 1.2, backgroundColor: Colors.black ,marginTop: 32},
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 18, fontWeight: '700' },
  chartContainer: { marginTop: 20, alignItems: 'center', justifyContent: 'center', position: 'relative', },
  scrollContainer: { paddingBottom: 20 },
  
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 35,
    marginRight: 35
  },
  circle: {
    width: 13,
    height: 13,
    marginRight: 12,
  },
  percent: {
    width: 50,
    fontSize: 16,
    color: Colors.black,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    flex: 1,
    color: Colors.black,
    fontWeight: 'bold',
    marginRight: 90,
  },
  amount: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold'   
  },
});
