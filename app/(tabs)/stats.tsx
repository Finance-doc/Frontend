import GroupBarChart from '@/app/GroupBarChart';
import { Colors } from '@/constants/colors';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle } from 'react-native-svg';
import { Grid, LineChart, XAxis } from 'react-native-svg-charts';

const screenWidth = Dimensions.get('window').width;

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

interface DecoratorProps {
    data?: number[]; // data를 선택적으로 변경
    x?: (index: number) => number; // x를 선택적으로 변경
    y?: (value: number) => number; // y를 선택적으로 변경
}

const Decorator: React.FC<DecoratorProps> = ({ data, x, y }) => {
    if (!data || !x || !y) return null;

    return data.map((value, index) => (
        <Circle
            key={index}
            cx={x(index)}
            cy={y(value)} 
            r={4} 
            stroke={'rgba(255, 145, 145, 1)'}
            fill={'rgba(255, 145, 145, 1)'} 
            strokeWidth={2} 
        />
    ));
};

const LineChartComponent = () => {
  const data = [10, 20, 15, 30, 40, 25];
  const labels = getLastSixMonths();
  const xAxisInset = { left: 20, right: 20 };

  return (
    <View style={{ flexDirection: 'row', padding: 10 }}>
      <View style={{ flex: 1, marginLeft: 15, marginRight: 15 }}>
        {/* 라인 차트 */}
        <LineChart
          style={{ height: 200, width: screenWidth - 60 }}
          data={data}
          svg={{ stroke: 'rgba(255, 145, 145, 1)', strokeWidth: 2 }}
          contentInset={{ top: 20, bottom: 20, ...xAxisInset }}
        >
          <Grid />
          <Decorator /> 
        </LineChart>

        <XAxis
          style={{ marginTop: 10 }}
          data={data}
          formatLabel={(value, index) => labels[index]}
          contentInset={{ left: 10, right: 10 }}
          svg={{ fontSize: 12, fill: 'black' }}
        />
      </View>
    </View>
  );
};

export default function Stats() {
  const actualValues  = [40,50]
  const targetValues  = [100,60]
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
          <GroupBarChart  actualValues={actualValues} targetValues={targetValues} />
          <View style={styles.goalname}>
            <Image
            source={require('../../assets/images/img_circle_blue.png')}
            style={{width: 13, height:13, top: -2, left: -165}}
            />
            <Text style={{ fontSize: 15, color: Colors.mint, fontWeight: 'bold',top: -15, left: -145}}>
              목표금액
            </Text>
            <Image
            source={require('../../assets/images/img_circle_purple.png')}
            style={{width: 13, height:13, top: -28, left: -85}}
            />
            <Text style={{ fontSize: 15, color: Colors.purple, fontWeight: 'bold',top: -41, left: -65}}>
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
  analysis: {fontSize: 19, fontWeight: 'bold', paddingTop: 40, marginStart: 20, },
  expenselists: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginStart: 30, marginEnd: 30 },
  categoryDetails: { flexDirection: 'row', alignItems: 'center', },
  categoryItem: { width: '53%'},
  categoryimg: {width: 23, height: 23, marginRight: 10},
  categoryname: {fontSize: 15, fontWeight: '500',marginRight: 20},
  categoryexpense: { fontSize: 15, fontWeight: '500', paddingRight: 20, flex: 1, textAlign: 'right',},
  goalname: { },
  monthgoal: { marginTop: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 50},
  subanalysis: {fontSize: 15, fontWeight: '500',paddingTop: 20, marginStart: 20},
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
  scoreEndText: { fontSize: 15, fontWeight: 'bold', color: Colors.gray},
});
