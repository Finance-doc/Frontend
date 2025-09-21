import { Colors } from '@/constants/colors';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  color: () => `rgb(0, 4, 255)`, 
  barPercentage: 1.8,
  useShadowColorFromDataset: false,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const GoalChat = () => (
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
    <View style={{
      position: 'absolute',
      bottom: 38,
      left: 0,
      width: 280,
      height: 3, 
      marginStart: 65,
      backgroundColor: 'rgba(238, 238, 238,1)'
    }} />
  </View>
);

const getLastSixMonths = () => {
  const months = [];
  const currentDate = new Date();

  for (let i = 0; i < 6; i++) {
    const month = new Date(currentDate);
    month.setMonth(currentDate.getMonth() - i); // 6개월 전까지의 월을 계산
    const monthLabel = `${month.getMonth() + 1}월`;
    months.push(monthLabel);
  }

  return months.reverse(); 
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
  const [isVisible, setIsVisible] = useState(false);

  const handlePress = () => {
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 1500);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>재무 진단서</Text>

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
          <GoalChat /> 
          <View style={styles.goalname}>
            <Image
            source={require('../../assets/images/img_circle_blue.png')}
            style={{width: 13, height:13, top: -50, left: -165}}
            />
            <Text style={{ fontSize: 15, color: Colors.mint, fontWeight: 'bold',top: -63, left: -145}}>
              목표금액
            </Text>
            <Image
            source={require('../../assets/images/img_circle_purple.png')}
            style={{width: 13, height:13, top: -76, left: -85}}
            />
            <Text style={{ fontSize: 15, color: Colors.purple, fontWeight: 'bold',top: -89, left: -65}}>
              실제금액
            </Text>
          </View>
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
            <TouchableOpacity onPress={handlePress}>
              <Image
                source={require('../../assets/images/ic_question.png')}
                style={styles.questionbox}
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
                <Text style={styles.scoreScoreText}>80</Text>
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
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop:15, paddingBottom: 15,},
  scrollContainer: { paddingBottom: 20 },
  totalExpense: {marginBottom: 50},
  month: {fontSize: 19, fontWeight: 'bold', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop:10, paddingBottom: 10,},
  analysis: {fontSize: 19, fontWeight: 'bold',paddingTop: 40, marginStart: 20},
  expenselists: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginStart: 30, marginEnd: 30 },
  categoryDetails: { flexDirection: 'row', alignItems: 'center', },
  categoryItem: { width: '53%'},
  categoryimg: {width: 23, height: 23, marginRight: 10},
  categoryname: {fontSize: 15, fontWeight: '500',marginRight: 20},
  categoryexpense: { fontSize: 15, fontWeight: '500', paddingRight: 20, flex: 1, textAlign: 'right',},
  goalname: { },
  monthgoal: { marginTop: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 50},
  subanalysis: {fontSize: 15, fontWeight: '500',paddingTop: 20, marginStart: 20},
  chartContainer: { marginTop: 20, alignItems: 'center', justifyContent: 'center', position: 'relative', },
  score: {alignItems: 'center',justifyContent: 'center'},
  scorebox: {width: 346, height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20,},
  questionbox: {width: 16, height: 16, position: 'absolute', top: -20, left: 8,},
  functionbox: {width: 200, position: 'absolute', top: -70, left: 30,resizeMode: 'contain'},
  function: { position: 'relative', justifyContent: 'center', alignItems: 'center', width: 150, height: 150, },
  functionimg: { width: 180, resizeMode: 'contain',},
  functiontext: { position: 'absolute', fontSize: 12, fontWeight: '400',textAlign: 'center',},
  scoreNumberContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  scoreText: { fontSize: 15, fontWeight: 'bold',left: -40},
  scoreScoreText:{ fontSize: 25, fontWeight: '800', marginRight: 15, },
  scoreEndText: { fontSize: 15, fontWeight: 'bold', color: Colors.gray}
});
