import { Colors } from '@/constants/colors';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ["지출", "저축"],
  datasets: [
    {
      data: [100, 5], // 실제 금액
      color: () => 'rgb(164, 165, 255)', // 실제 금액 색상
      strokeWidth: 2,
    },
    {
      data: [80, 15], // 목표 금액 (목표 지출액, 목표 저축액)
      color: () => 'rgba(125, 216, 255, 1)', // 목표 금액 색상 (하늘색)
      strokeWidth: 2,
      withDots: true, // 점선 스타일
      dotColor: 'rgba(0, 200, 255, 1)', // 점선 색상
      strokeDasharray: [5, 5], // 점선 스타일
    }
  ]
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: () => `rgb(164, 165, 255)`, 
  barPercentage: 1.8,
  useShadowColorFromDataset: false,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const YourComponent = () => (
  <View style={styles.monthgoal}>
    <BarChart
      data={data}
      width={screenWidth}
      height={220}
      yAxisLabel=""
      chartConfig={chartConfig}
      verticalLabelRotation={0}
      fromZero={true}
      showBarTops={false}
      withInnerLines={false}
      showValuesOnTopOfBars={false}
      yAxisSuffix="" 
      withVerticalLabels={true} 
    />
  </View>
);

// 현재 날짜를 기준으로 6개월 동안의 월 구하기
const getLastSixMonths = () => {
  const months = [];
  const currentDate = new Date();

  for (let i = 0; i < 6; i++) {
    const month = new Date(currentDate);
    month.setMonth(currentDate.getMonth() - i); // 6개월 전까지의 월을 계산
    const monthLabel = `${month.getMonth() + 1}월`;
    months.push(monthLabel);
  }

  return months.reverse(); // 역순으로 배열을 반환
};

const lineData = {
  labels: getLastSixMonths(), // 동적으로 생성된 6개월 전의 월
  datasets: [
    {
      data: [10, 20, 15, 30, 40, 50], 
      strokeWidth: 2, // 선의 두께
      color: () => 'rgba(255, 145, 145, 1)', 
    }
  ],
};

const lineChartConfig = {
  backgroundColor: "#fff", 
  backgroundGradientFrom: "#fff", 
  backgroundGradientTo: "#fff", 
  fillShadowGradientFrom: "#fff",
  fillShadowGradientTo: "#fff",
  decimalPlaces: 0, 
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // 데이터 색상
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // 레이블 색상
  style: {
    borderRadius: 16, // 모서리 둥글게
  },
};

const LineChartComponent = () => (
  <View style={styles.chartContainer}>
    <LineChart
      data={lineData}
      width={screenWidth}
      height={220}
      chartConfig={lineChartConfig}
      verticalLabelRotation={0}
      fromZero={true}
      withInnerLines={false} 
    />
  </View>
);


export default function Stats() {
  const categories=[
    { img: require('../../assets/images/img_stats_category.png'), name: '식비', expense: 206513 },
    { img: require('../../assets/images/img_stats_category.png'), name: '식비', expense: 20651553 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>재무 진단서 </Text>

      <Text style={styles.month}>월</Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* 첫 번째 분석 */}      
        <View style={styles.totalExpense}>
          <Text style={styles.analysis}> 월 총 지출은 원입니다. </Text>
          {categories.map((category, index) => (
            <View key={index} style={styles.expenselists}>
              <View style={styles.categoryItem}>
                <View style={styles.categoryDetails}>
                  <Image style={styles.categoryimg} source={category.img} />
                  <Text style={styles.categoryname}>{category.name}</Text>
                  <Text style={styles.categoryexpense}>{category.expense.toLocaleString()}원</Text>
                </View>
              </View>
              <View style={styles.categoryItem}>
                <View style={styles.categoryDetails}>
                  <Image style={styles.categoryimg} source={category.img} />
                  <Text style={styles.categoryname}>{category.name}</Text>
                  <Text style={styles.categoryexpense}>{category.expense.toLocaleString()}원</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.analysis}>이번 달에는 목표에 얼마나 가까워졌을까요?</Text>

        <View style={styles.monthgoal}>
          <YourComponent /> 
        </View>

        <Text style={styles.analysis}>최근 6개월 간의 지출입니다.</Text>
        <Text style={styles.subanalysis}>평균 지출 금액은 월 -원입니다.</Text>

        <View style={styles.monthgoal}>
          <LineChartComponent /> 
        </View>
        <View style={styles.score}>
          <View style={styles.scorebox}>
            <Image
              source={require('../../assets/images/img_box_grey.png')}
              style={{ width: 346, height: 58, position: 'absolute' }}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/images/ic_question.png')}
              style={styles.questionbox}
            />
            <Text style={styles.scoreText}>이번달 재무 건강 점수</Text>
            <View style={styles.scoreNumberContainer}>
              <Text style={styles.scoreScoreText}>-</Text>
              <Text style={styles.scoreEndText}>점</Text>
              </View>
          </View>
        </View>   
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white,},
  title: { fontSize: 16.22, fontWeight: 'bold', textAlign: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop:15, paddingBottom: 15,},
  scrollContainer: { paddingBottom: 20 },
  totalExpense: {},
  month: {fontSize: 16, fontWeight: '600', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop:10, paddingBottom: 10,},
  analysis: {fontSize: 16.22, fontWeight: '600',paddingTop: 40, marginStart: 20},
  expenselists: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginStart: 30, marginEnd: 30 },
  categoryDetails: { flexDirection: 'row', alignItems: 'center', },
  categoryItem: { width: '53%'},
  categoryimg: {width:20, height: 20, marginRight: 10},
  categoryname: {fontSize:12, fontWeight: '400',marginRight: 20},
  categoryexpense: { fontSize: 12, fontWeight: '400', paddingRight: 20, flex: 1, textAlign: 'right',},
  monthgoal: { marginTop: 20, alignItems: 'center', justifyContent: 'center', },
  subanalysis: {fontSize: 12, fontWeight: '400',paddingTop: 20, marginStart: 20},
  chartContainer: { marginTop: 20, alignItems: 'center', justifyContent: 'center', position: 'relative', },
  score: {alignItems: 'center',justifyContent: 'center'},
  scorebox: {width: 346, height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20,},
  questionbox: {width: 16, height: 16, position: 'absolute', top: 8, left: 8,},
  scoreNumberContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  scoreText: { fontSize: 13, fontWeight: '600', left: 40},
  scoreScoreText:{ fontSize: 24, fontWeight: '600', marginRight: 15, },
  scoreEndText: { fontSize: 13, fontWeight: '600', color: Colors.gray}
});
