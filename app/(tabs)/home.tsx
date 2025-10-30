import DayCell from '../../components/DayCell';
import { Colors } from '../../constants/colors';
import { useFocusEffect } from '@react-navigation/native';
import * as d3 from "d3-shape";
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Line, Path, Text as SvgText } from "react-native-svg";

const API_BASE_URL = 'http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com';
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
};
const screenWidth = Dimensions.get('window').width;
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
type Ledger = Record<string, { income?: number; expense?: number }>;

/* ---------- API ---------- */
const fetchExpenseData = async (date: string) => {
  try {
    const data = await apiFetch(`/report/api/expense?date=${date}`, { method: "GET" });
    const totalExpense = Array.isArray(data)
      ? data.reduce((sum, item) => sum + (item.amount || 0), 0)
      : 0;

    return { date, expense: totalExpense };
  } catch (err) {
    console.error(`[${date}] 지출 데이터 가져오기 실패:`, err);
    return { date, expense: 0 };
  }
};

const fetchIncomeData = async (date: string) => {
  try {
    const data = await apiFetch(`/report/api/income?date=${date}`, { method: "GET" });
    const totalIncome = Array.isArray(data)
      ? data.reduce((sum, item) => sum + (item.amount || 0), 0)
      : 0;

    return { date, income: totalIncome };
  } catch (err) {
    console.error(`[${date}] 수입 데이터 가져오기 실패:`, err);
    return { date, income: 0 };
  }
};

const getDaysInMonth = (dateString: string): string[] => {
    const [year, month] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const days: string[] = [];
    while (date.getMonth() === month - 1) {
        const dayString = new Date(date).toISOString().substring(0, 10);
        days.push(dayString);
        date.setDate(date.getDate() + 1);
    }
    return days;
};

const fetchGoals = async () => {
  try {
    return await apiFetch(`/report/api/goal`, { method: "GET" });
  } catch (err) {
    console.error("목표 금액 조회 실패:", err);
    return null;
  }
};
const applyIncomeGoal = async (
  savingInput: string,
  setSavingsSaves: (n: number) => void
) => {
  const cleanInput = (savingInput || '0').replace(/,/g, ''); // 쉼표 제거
  const goalAmount = Number(cleanInput);

  if (isNaN(goalAmount)) {
    console.warn("저축 목표 금액이 유효한 숫자가 아닙니다.");
    return;
  }

  try {
    await apiFetch(`/report/api/goal`, {
      method: "POST",
      body: JSON.stringify({ incomeGoal: goalAmount }),
    });
    console.log(`저축 목표 금액 (${goalAmount}원) 설정 성공`);
    setSavingsSaves(goalAmount);
  } catch (err) {
    console.error("저축 목표 API 오류:", err);
  }
};

const applyExpenseGoal = async (
  expenseInput: string,
  setExpenseSaves: (n: number) => void
) => {
  const cleanInput = (expenseInput || '0').replace(/,/g, ''); // 쉼표 제거
  const goalAmount = Number(cleanInput);

  if (isNaN(goalAmount)) {
    console.warn("지출 목표 금액이 유효한 숫자가 아닙니다.");
    return;
  }

  try {
    await apiFetch(`/report/api/goal`, {
      method: "POST",
      body: JSON.stringify({ expenseGoal: goalAmount }),
    });
    console.log(`지출 목표 금액 (${goalAmount}원) 설정 성공`);
    setExpenseSaves(goalAmount);
  } catch (err) {
    console.error("지출 목표 API 오류:", err);
  }
};

const fetchTotalExpense = async (year: number, month: number) => {
  try {
    const data = await apiFetch(`/report/api/summary/month?year=${year}&month=${month}`, { method: "GET" });
    return data.totalExpense || 0;
  } catch (err) {
    console.error("총 지출 조회 실패:", err);
    return null;
  }
};
const fetchCategoryExpenses = async (year: number, month: number) => {
  try {
    const data = await apiFetch(`/report/api/summary/month?year=${year}&month=${month}`, { method: "GET" });
    return data.categoryExpenses || [];
  } catch (err) {
    console.error("카테고리별 지출 조회 실패:", err);
    return null;
  }
};
const fetchCategoryRatios = async (year: number, month: number) => {
  try {
    const data = await apiFetch(`/report/api/categories/ratios?year=${year}&month=${month}`, { method: "GET" });
    return data;
  } catch (err) {
    return null;
  }
};

/* ---------- 기타 ---------- */
const generatedColors: Set<string> = new Set();
const getRandomColor = (): string => {
  let color: string;

  // 중복되지 않는 색상 생성
  do {
    color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  } while (generatedColors.has(color)); 
  generatedColors.add(color);

  return color;
};
const PieChartComponent = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
  const outerRadius = 115;
  const innerRadius = 40;

  const pieGenerator = d3.pie<any>().value((d: any) => d.value);
  const arcData = pieGenerator(data); 

  const [activeId, setActiveId] = useState<string | null>(null); 

  return (
    <View style={{ alignItems: "center", marginTop: 20, overflow: "visible" }}>
      <Svg width={screenWidth} height={outerRadius * 2 + 120}>
        <G x={screenWidth / 2} y={outerRadius + 40}>
          {arcData.map((slice) => {
            const arcGenerator = d3.arc<any>().cornerRadius(5);
            const path = arcGenerator({
              ...slice,
              innerRadius,
              outerRadius: slice.data.name === activeId ? outerRadius + 10 : outerRadius, // 클릭된 항목 강조
            });

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
                  stroke="#000"
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
  );
};
const ListItem = ({ name, amount, percent }: { name: string; amount: number; percent: number}) => (
  <View style={styles.listItem}>
    <View style={[styles.circle, { backgroundColor: Colors.mint }]} />  
    <Text style={styles.percent}>{percent.toFixed(1)}%</Text>
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.amount}>{amount.toLocaleString()} 원</Text>
  </View>
);


export default function Home() {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0); // 0: 달력, 1: 통계
  const scrollX = useRef(new Animated.Value(0)).current;
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

  const [totalExpense, setTotalExpense] = useState<number | null>(null);
  const [savingInput, setSavingInput] = useState('');
  const [expenseInput, setExpenseInput] = useState('');
  const [savingSaves, setSavingsSaves] = useState<number>();
  const [expenseSaves, setExpenseSaves] = useState<number>();
  const [incomeGoal, setIncomeGoal] = useState<number | null>(null);
  const [expenseGoal, setExpenseGoal] = useState<number | null>(null);
  const [categoryExpenses, setCategoryExpenses] = useState<any[]>([]); // 카테고리별 지출 합계 저장
  const [categoryRatios, setCategoryRatios] = useState<any[]>([]);

  const [dayLedger, setDayLedger] = useState<Ledger>({}); 
  const currentMonth = today.substring(0, 7); 
  const year = parseInt(currentMonth.substring(0, 4)); 
  const month = parseInt(currentMonth.substring(5, 7)); 
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // "2025-10" 등

  useFocusEffect(
    useCallback(() => {
      const loadStatsData = async () => {
        const [expense, expenses, ratios] = await Promise.all([
          fetchTotalExpense(year, month),
          fetchCategoryExpenses(year, month),
          fetchCategoryRatios(year, month),
        ]);        
        if (expense !== null) {
          setTotalExpense(expense);
        }

        if (expenses !== null) {
          setCategoryExpenses(expenses);
        }
        if (ratios) {
          setCategoryRatios(ratios);
          }
        };

        loadStatsData();

    }, [year, month]) 
);
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const goals = await fetchGoals();
          if (goals) {
            setIncomeGoal(goals.incomeGoal);
            setExpenseGoal(goals.expenseGoal);
            setSavingInput(goals.incomeGoal?.toString() || '');
            setExpenseInput(goals.expenseGoal?.toString() || '');
          }

          const daysOfMonth = getDaysInMonth(today);
          const [expenseResults, incomeResults] = await Promise.all([
            Promise.all(daysOfMonth.map(fetchExpenseData)),
            Promise.all(daysOfMonth.map(fetchIncomeData)),
          ]);

          const newLedger: Ledger = {};
          daysOfMonth.forEach((date) => {
            const expense = expenseResults.find((e) => e.date === date)?.expense || 0;
            const income = incomeResults.find((i) => i.date === date)?.income || 0;
            newLedger[date] = { income, expense };
          });

          setDayLedger(newLedger);
        } catch (err) {
          console.error('데이터 로딩 중 오류:', err);
        }
      };

      loadData();
    }, [])
  );
  useEffect(() => {
    const loadMonthLedger = async () => {
      try {
        const daysOfMonth = getDaysInMonth(selectedMonth);

        const [expenseResults, incomeResults] = await Promise.all([
          Promise.all(daysOfMonth.map(fetchExpenseData)),
          Promise.all(daysOfMonth.map(fetchIncomeData)),
        ]);

        const newLedger: Ledger = {};
        daysOfMonth.forEach((date) => {
          const expense = expenseResults.find((e) => e.date === date)?.expense || 0;
          const income = incomeResults.find((i) => i.date === date)?.income || 0;
          newLedger[date] = { income, expense };
        });

        setDayLedger(newLedger); 
      } catch (err) {
        console.error('월별 데이터 로딩 중 오류:', err);
      }
    };

    loadMonthLedger();
  }, [selectedMonth]);

  useEffect(() => {
    const loadTotalExpense = async () => {
      const expense = await fetchTotalExpense(year, month);
      if (expense !== null) {
        setTotalExpense(expense); // 총 지출 금액을 상태에 저장
      }
    };
    loadTotalExpense();

    const loadCategoryExpenses = async () => {
      const expenses = await fetchCategoryExpenses(year, month);
      if (expenses !== null) {
        setCategoryExpenses(expenses); // 카테고리별 지출 합계를 상태에 저장
      }
    };

    loadCategoryExpenses();
    
    const loadCategoryRatios = async () => {
      const data = await fetchCategoryRatios(year, month);
      if (data) {
        setCategoryRatios(data);
      }
    };
    loadCategoryRatios();
  }, [year, month]); 

  const handleChangeSaving = (txt: string) => {
    const digits = txt.replace(/[^\d]/g, ''); // 숫자만 필터링
    setSavingInput(digits); // 입력값 업데이트
  };

  const handleChangeExpense = (txt: string) => {
    const digits = txt.replace(/[^\d]/g, ''); // 숫자만 필터링
    setExpenseInput(digits); // 입력값 업데이트
  };

  const handleApplySaving = () => {
    applyIncomeGoal(savingInput, setSavingsSaves); // incomeGoal 저장
  };

  const handleApplyExpense = () => {
    applyExpenseGoal(expenseInput, setExpenseSaves); // expenseGoal 저장
  };
  const pieChartData = categoryExpenses.map((item) => ({
    name: item.category,
    value: item.amount,
    color: item.color || getRandomColor(), 
  })
  );
  const totalAmount = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);

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
          current={currentMonth + '-01'}
          monthFormat="yyyy년 M월"
          onMonthChange={(monthDate) => {
          const newMonth = monthDate.dateString.substring(0, 7); // 예: "2025-11"
          setSelectedMonth(newMonth); // ✅ 선택된 월 갱신
          }}
          dayComponent={(props: any) => (
            <DayCell
              {...props}
              ledger={dayLedger} 
              onPress={(date) => {
                router.push({
                  pathname: '/date',
                  params: { date: date.dateString }, 
                });
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
              onSubmitEditing={handleApplySaving}
              onEndEditing={handleApplySaving}  
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
                onSubmitEditing={handleApplyExpense}  
                onEndEditing={handleApplySaving} 
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
          {totalExpense ? totalExpense.toLocaleString() : '로딩 중...'} 원
        </Text>
        <View style={{ alignItems: "center", marginTop: 20, overflow: "visible" }}>
          <PieChartComponent data={pieChartData} />
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
          {categoryExpenses.map((item, index) => {
            const percent = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
            return (
              <ListItem
                key={index}
                name={item.category}
                amount={item.amount}
                percent={percent}
              />
              );
              })}
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
  listItem: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginLeft: 35, marginRight: 35 },
  circle: { width: 13, height: 13, marginStart: 15, borderRadius: 20 },
  percent: { width: 50, fontSize: 16, color: Colors.black, marginRight: 12, marginLeft: 7 },
  name: { fontSize: 16, flex: 1,color: Colors.black, fontWeight: 'bold', marginStart: 20, },
  amount: { fontSize: 16, color: '#333', fontWeight: 'bold', marginEnd: 20 },
  calendarpage: { width: screenWidth },
  entergoal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,},
  goalInputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D4D4D4', backgroundColor: '#EEEEEE', borderRadius: 10, height: 40, width: 150,
    paddingHorizontal: 10, marginRight: 40 },
  goalInput: { flex: 1, fontSize: 18, color: Colors.black, paddingVertical: 0, textAlign: 'right', },
  unit: { marginLeft: 6,fontSize: 16, },
});
