import GroupBarChart from '@/components/GroupBarChart';
import { Colors } from '@/constants/colors';
// import * as SecureStore from 'expo-secure-store';
import { getItem } from '@/hooks/storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = "http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com";

const screenWidth = Dimensions.get('window').width;
const IMG_ARROW_LEFT = require('../../assets/images/ic_arrow_left.png');
const IMG_ARROW_LEFT_CHOSEN = require('../../assets/images/ic_arrow_left_choose.png');
const IMG_ARROW_RIGHT = require('../../assets/images/ic_arrow_right.png');
const IMG_ARROW_RIGHT_CHOSEN = require('../../assets/images/ic_arrow_right_choose.png');

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getItem("accessToken");
    const headers = {
      'Content-Type': 'application/json',
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

const fetchMonthlyExpense = async (year: number, month: number) => {
  try {
    const data = await apiFetch(`/report/api/summary/report?year=${year}&month=${month}`, { method: 'GET' });

    if (Array.isArray(data.last6Months)) {
      return data;
    } else {
      console.error('last6Months 데이터가 배열이 아닙니다:', data.last6Months);
      return null;
    }
  } catch (err) {
    console.error('월 총 지출 API 호출 중 오류 발생:', err);
    return null;
  }
};
const fetchGoals = async () => {
  try {
    const data = await apiFetch('/report/api/goal', { method: 'GET' });

    console.log('Expense Goal:', data.expenseGoal);
    console.log('Income Goal:', data.incomeGoal);

    return data;
  } catch (err) {
    console.error('목표 API 호출 중 오류 발생:', err);
    return null;
  }
};
const LineChartComponent = ({ year, month }: { year: number, month: number }) => {
  const [chartData, setChartData] = useState<any[]>([]); // Chart 데이터를 저장할 상태
  const [labels, setLabels] = useState<string[]>([]); // X축 레이블 (월)

  useEffect(() => {
const loadLast6MonthsData = async () => {
      const expenseData = await fetchMonthlyExpense(year, month);
      
      if (expenseData && Array.isArray(expenseData.last6Months)) {
        const last6Months = expenseData.last6Months; 
        
        const formattedData = last6Months.map((item: any) => ({
          value: item.expense, 
        }));
        setChartData(formattedData);
        const months = last6Months.map((item: any) => `${item.month}월`);
        setLabels(months);
      } else {
        console.error("6개월 데이터 배열을 찾을 수 없습니다.");
        // 데이터가 없을 경우 차트 초기화 (선택 사항)
        setChartData([]);
        setLabels([]);
      }
    };

    loadLast6MonthsData();
  }, [year, month]);

  return (
    <View style={{ flexDirection: 'row', padding: 10 }}>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <LineChart
          initialSpacing={20}
          data={chartData} // 차트 데이터
          width={screenWidth - 120} // 화면 크기에 맞게 차트 크기 설정
          height={200}
          thickness={2}
          color="rgba(255, 145, 145, 1)"
          hideRules={true}
          showVerticalLines={false}
          xAxisLabelTexts={labels} // x축 레이블로 월을 사용
          xAxisLabelTextStyle={{ fontSize: 12, color: 'black', marginTop: 4 }}
          xAxisThickness={1}
          yAxisThickness={1}
          dataPointsRadius={4}
          dataPointsColor="rgba(255, 145, 145, 1)"
          noOfSections={4}
          disableScroll
        />
      </View>
    </View>
  );
};

export default function Stats() {
  const handlePress = () => {
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 1500);
  };
  const [month, setMonth] = useState<number>(10); // 현재 월 저장
  const [year, setYear] = useState<number>(2025);

  const [isVisible, setIsVisible] = useState(false);
  
  const [targetValues, setTargetValues] = useState([0, 0]); // 목표 지출과 저축 값
  const [actualValues, setActualValues] = useState([0, 0]); // 목표 지출과 저축 값

  const [categories, setCategories] = useState<any[]>([]); // 카테고리별 지출 저장
  const [totalExpense, setTotalExpense] = useState<number | null>(null); // 월 총 지출 저장

  const [financialScore, setFinancialScore] = useState<number | null>(null); // 금융 점수 저장

  const [chartData, setChartData] = useState<any[]>([]); // Chart 데이터를 저장할 상태


// 좌우 화살표 버튼의 활성화/선택 상태를 관리하는 상태 추가
const [leftArrowPressed, setLeftArrowPressed] = useState(false);
const [rightArrowPressed, setRightArrowPressed] = useState(false);

const handlePreviousMonth = () => {
    setLeftArrowPressed(true);
    setTimeout(() => setLeftArrowPressed(false), 200);

    if (month === 1) {
        setMonth(12);
        setYear((prevYear: number) => prevYear - 1);
    } else {
        setMonth((prevMonth: number) => prevMonth - 1);
    }
};
const handleNextMonth = () => {
    setRightArrowPressed(true);
    setTimeout(() => setRightArrowPressed(false), 200);

    if (month === 12) {
        setMonth(1);
        setYear((prevYear: number) => prevYear + 1);
    } else {
        setMonth((prevMonth: number) => prevMonth + 1);
    }
};
useEffect(() => {
    const loadMonthlyData = async () => {
        const data = await fetchMonthlyExpense(year, month);
        
        if (data !== null) {
            setTotalExpense(data.totalExpense); 
            setCategories(data.categoryExpenses); 
            setFinancialScore(data.financialScore);
            setActualValues([data.totalExpense, data.totalIncome]);
            setChartData(data.last6Months.map((item: any) => ({
                value: item.expense,
                label: `${item.month}월`,
            })));
            
        }
    };

    loadMonthlyData();
}, [year, month]); // [year, month] 변경 시 모든 월별 데이터 갱신

  useEffect(() => {
    const loadGoals = async () => {
      const goalData = await fetchGoals();
      if (goalData !== null) {
        const { expenseGoal, incomeGoal } = goalData;
        setTargetValues([expenseGoal, incomeGoal]); // incomeGoal과 expenseGoal을 targetValues에 설정
      }
    };
    loadGoals();

    const loadActual = async () => {
      const ActualData = await fetchMonthlyExpense(year, month);
      if (ActualData !== null) {
        const { totalExpense, totalSaving } = ActualData;
        setActualValues([totalExpense, totalSaving]); // incomeGoal과 expenseGoal을 targetValues에 설정
      }
    };
    loadActual();
  }, []); 
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>재무 진단서</Text>
        <View style={styles.monthContainer}> 
          <Pressable onPress={handlePreviousMonth} style={styles.arrowButton}>
            <Image
              source={leftArrowPressed ? IMG_ARROW_LEFT_CHOSEN : IMG_ARROW_LEFT}
              style={styles.arrowIcon}
              resizeMode="contain"              
            />
          </Pressable>

          <Text style={styles.monthText}>
            {year}년 {month}월
          </Text>

          <Pressable onPress={handleNextMonth} style={styles.arrowButton}>
            <Image
              source={rightArrowPressed ? IMG_ARROW_RIGHT_CHOSEN : IMG_ARROW_RIGHT}
              style={styles.arrowIcon}
              resizeMode="contain"
              />
          </Pressable>
        </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* 첫 번째 분석 */}      
        <View style={styles.totalExpense}>
          <Text style={styles.analysis}>
            {month}월 총 지출은 {totalExpense ? totalExpense.toLocaleString() : '로딩 중...'} 원입니다.
          </Text>          
          <View style={styles.expenselists}> 
            {categories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryDetails}>
                  {/* <Image style={styles.categoryimg} source={require('../../assets/images/img_stats_category.png')} /> */}
                  <Text style={styles.categoryname}>{category.categoryName}</Text>
                  <Text style={styles.categoryexpense}>
                    {category.amount.toLocaleString()}원
                  </Text>
                </View>
              </View>
          ))}
          </View>
        </View>

        <Text style={styles.analysis}>이번 달에는 목표에 얼마나 가까워졌을까요?</Text>
        <View style={styles.monthgoal}>
          <GroupBarChart  actualValues={actualValues} targetValues={targetValues} />
          <View style={styles.goalname}>
            <Text style={{ fontSize: 15, color: Colors.black, fontWeight: 'bold', left: -80, top: -10}}>
              지출
            </Text>
            <Text style={{ fontSize: 15, color: Colors.black, fontWeight: 'bold', left: 95, top: -25}}>
              저축
            </Text>
          </View>
          <View style={styles.goalname}>
            <Image
            source={require('../../assets/images/img_circle_blue.png')}
            style={{width: 13, height:13, top: 3, left: -155}}
            />
            <Text style={{ fontSize: 15, color: Colors.mint, fontWeight: 'bold', top: -10,left: -135}}>
              목표금액
            </Text>
            <Image
            source={require('../../assets/images/img_circle_purple.png')}
            style={{width: 13, height:13, top: -23, left: -75}}
            />
            <Text style={{ fontSize: 15, color: Colors.purple, fontWeight: 'bold',top: -36, left: -55}}>
              실제금액
            </Text>
          </View>
        </View>

        <Text style={styles.analysis}>최근 6개월 간의 지출입니다.</Text>
        <View style={styles.monthgoal}>
          <LineChartComponent year={year} month={month} />
        </View>

        <View style={styles.score}>
          <View style={styles.scorebox}>
            <Image
              source={require('../../assets/images/img_box_grey.png')}
              style={{ width: 346, height: 58, position: 'absolute' }}
              resizeMode="contain"
              />
            <TouchableOpacity onPress={handlePress}>
              <Image
                source={require('../../assets/images/ic_question.png')}
                style={[styles.questionbox, { opacity: 0 }]} 
              />
            </TouchableOpacity>
            {isVisible && (
              <View style={styles.functionbox}>
                <View style={styles.function}>
                  <Image
                    source={require('../../assets/images/ic_box_function.png')}
                    style={styles.functionimg}
                  />
                  <Text style={styles.functiontext}>점수 계산 공식</Text>
                  </View>
                </View>
                )}
                <Text style={styles.scoreText}>이번달 재무 건강 점수</Text>
                <View style={styles.scoreNumberContainer}>
                <Text style={styles.scoreScoreText}>{financialScore}</Text>
              <Text style={styles.scoreEndText}>점</Text>
            </View>
          </View>
        </View>   
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.white,},
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 13, paddingBottom: 13,},
  scrollContainer: { paddingBottom: 20 },
  totalExpense: {marginBottom: 50},
  month: {fontSize: 19, fontWeight: 'bold', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop:10, paddingBottom: 10, },
  analysis: {fontSize: 19, fontWeight: 'bold', paddingTop: 40, marginStart: 20, },
  expenselists: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, marginStart: 20, marginEnd: 30 },
  categoryDetails: { flexDirection: 'row', alignItems: 'center', },
  categoryItem: { width: '48%', marginBottom: 15},
  // categoryimg: {width: 23, height: 23, marginRight: 10},
  categoryname: {fontSize: 14, fontWeight: '500',marginRight: 10},
  categoryexpense: { fontSize: 14, fontWeight: '500', paddingRight: 20, flex: 1, textAlign: 'right',},
  goalname: { },
  monthgoal: { paddingTop:20, marginTop: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20,},
  subanalysis: {fontSize: 15, fontWeight: '500',paddingTop: 20, marginStart: 20},
  score: {alignItems: 'center',justifyContent: 'center', marginBottom: 100},
  scorebox: {width: 346, height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20,},
  questionbox: {width: 16, height: 16, position: 'absolute', top: -20, left: 8,},
  functionbox: {width: 200, position: 'absolute', top: -70, left: 30,resizeMode: 'contain'},
  function: { position: 'relative', justifyContent: 'center', alignItems: 'center', width: 150, height: 150, },
  functionimg: { width: 180, resizeMode: 'contain',},
  functiontext: { position: 'absolute', fontSize: 12, fontWeight: '400',textAlign: 'center',},
  scoreNumberContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  scoreText: { fontSize: 15, fontWeight: 'bold',left: -40},
  scoreScoreText:{ fontSize: 25, fontWeight: '800', marginRight: 15, },
  scoreEndText: { fontSize: 15, fontWeight: 'bold', color: Colors.gray},

monthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
},
monthText: {
    fontSize: 24, // 기존 월 텍스트 크기
    fontWeight: 'bold',
    marginHorizontal: 15,
    color: Colors.black, // 색상 정의에 따라 수정
},
arrowButton: {
    padding: 10,
},
arrowIcon: {
    width: 20, // 이미지 크기 설정
    height: 20,
},
});
