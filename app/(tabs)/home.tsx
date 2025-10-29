import DayCell from '@/components/DayCell';
import { Colors } from '@/constants/colors';
import * as d3 from "d3-shape";
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Line, Path, Text as SvgText } from "react-native-svg";

const screenWidth = Dimensions.get('window').width;
const IMG_CIRCLE = require('../../assets/images/img_circle_blue.png');
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'
  ],
  monthNamesShort: [
    '1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'
  ],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';
const today = new Date().toISOString().split('T')[0];

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

];

const sampleData = [
  { id: '1', percent: '20%', name: '식비', amount: '10,000원' },
  { id: '2', percent: '30%', name: '문화생활', amount: '15,000원' },
  { id: '3', percent: '50%', name: '생활용품크크', amount: '250,000원' },
];

const dayLedger: Ledger = {       
  '2025-10-08': { income: 620145, expense: 250000 },
  '2025-10-15': { income: 0, expense: 123000 },
};
type Ledger = Record<string, { income?: number; expense?: number }>;

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
  const [selected, setSelected] = useState<String>(today);
  const tabs = useMemo(() => ['달력', '통계'], []);
  const router = useRouter();
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

  const [savingInput, setSavingInput] = useState('');
  const [savingSaves, setSavingsSaves] = useState<number>();

  const [expenseInput, setExpenseInput] = useState('');
  const [expenseSaves, setExpenseSaves] = useState<number>();

  const formatWitCommas = (s:string) =>
    s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const handleChangeSaving = (txt: string)=>{
    const digits = txt.replace(/[^\d]/g, ''); 
    setSavingInput(formatWitCommas(digits));
  }
  const handleChangeExpense = (txt: string)=>{
    const digits = txt.replace(/[^\d]/g, ''); 
    setExpenseInput(formatWitCommas(digits));
  }
  const applySaving = ()=>{
    const n = Number((savingInput||'0').replace(/,/g,''));
    if (!isNaN(n)) setSavingsSaves(n);
  }
  const applyExpense = ()=>{
    const n = Number((savingInput||'0').replace(/,/g,''));
    if (!isNaN(n)) setExpenseSaves(n);
  }

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
    <ScrollView>
      <View style={styles.calendarpage}>
        <Calendar
          current={today}
          monthFormat="yyyy년 M월"
          dayComponent={(props: any) => (
            <DayCell
              {...props}
              ledger={dayLedger}
              onPress={(date) => {
                router.replace('/date');
              }}
            />
          )}
        />
        <View style={{ alignItems: 'center', width: screenWidth, marginBottom: 30 }}>
          <Image
            source={require('../../assets/images/img_line_grey.png')}
            style={{ height: 2,  }}  
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.entergoal}>
          <Text style={{fontSize: 20, color: Colors.black, fontWeight: 'bold', marginStart: 40, }}>
            이번달 목표 저축 금액 : 
          </Text>
          <View style={styles.goalInputBox}>
            <TextInput
              style={styles.goalInput}
              value={savingInput}
              onChangeText={handleChangeSaving}
              placeholder="0"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={applySaving}  //엔터 눌렀을 때 적용
              onEndEditing={applySaving}     // (안드로이드 숫자패드 대비)
            />
            <Text style={styles.unit}>원</Text>
          </View>
        </View>
        <View style={styles.entergoal}>
          <Text style={{fontSize: 20, color: Colors.black, fontWeight: 'bold', marginStart: 40}}>
            이번달 목표 지출 금액 : 
          </Text>
            <View style={styles.goalInputBox}>
              <TextInput
                style={styles.goalInput}
                value={expenseInput}
                onChangeText={handleChangeExpense}
                placeholder="0"
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={applyExpense}  //엔터 눌렀을 때 적용
                onEndEditing={applyExpense}     // (안드로이드 숫자패드 대비)
              />
            <Text style={styles.unit}>원</Text>
          </View>
        </View>
      </View>
    </ScrollView>
    {/* 통계 페이지 */}
    <View style={[styles.page, { width: screenWidth }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={{ fontSize: 20, color: Colors.textgray, fontWeight: 'bold', marginTop: 30, marginStart: 30, }}>
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
                const path = arcGenerator({
                  ...slice,
                  innerRadius,
                  outerRadius: slice.data.name === activeId ? outerRadius + 10 : outerRadius,
                  
                })
                ;
                const [lineStartX, lineStartY] = arcGenerator.centroid({
                  ...slice,
                  innerRadius,
                  outerRadius: outerRadius + 50,
                });
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
                    <Line
                      x1={lineStartX}
                      y1={lineStartY}
                      x2={lineEndX}
                      y2={lineEndY}
                      stroke="#333"
                      strokeWidth={1}
                    />
                    <SvgText
                      x={lineEndX}
                      y={lineEndY}
                      fill="#000"
                      fontSize={15}   
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
  container: { backgroundColor: Colors.white,},
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
  calendarpage: {
    width: screenWidth
  },
  entergoal: {    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  goalInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4D4D4' ,
    backgroundColor: '#EEEEEE',
    borderRadius: 10,
    height: 40,
    width: 150,
    paddingHorizontal: 10,
    marginRight: 40
  },
  goalInput: {
    flex: 1,
    fontSize: 18,
    color: Colors.black,
    paddingVertical: 0,
    textAlign: 'right', 
  },
  unit: {
    marginLeft: 6,
    fontSize: 16,
  },
});
