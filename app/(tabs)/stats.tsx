import GroupBarChart from '@/components/GroupBarChart';
import { Colors } from '@/constants/colors';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const getLastSixMonths = () => {
  const months: string[] = [];
  const currentDate = new Date();
  for (let i = 0; i < 6; i++) {
    const month = new Date(currentDate);
    month.setMonth(currentDate.getMonth() - i);
    months.push(`${month.getMonth() + 1}월`);
  }
  return months.reverse();
};

const LineChartComponent = () => {
  const raw = [10, 20, 15, 30, 40, 25];
  const data = raw.map(v => ({ value: v }));
  const labels = getLastSixMonths();

  return (
    <View style={{ flexDirection: 'row', padding: 10 }}>
      <View style={{ flex: 1, marginLeft: 15, marginRight: 15 }}>
        <LineChart
          initialSpacing={20}
          data={data}
          width={screenWidth-120}
          height={200}
          thickness={2}
          color="rgba(255, 145, 145, 1)"
          hideRules={true}         
          showVerticalLines={false}        
          xAxisLabelTexts={labels}
          xAxisLabelTextStyle={{ fontSize: 12, color: 'black', marginTop: 4,  }}
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
  container: { backgroundColor: Colors.white,},
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 13, paddingBottom: 13,},
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
  monthgoal: { paddingTop:20, marginTop: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20,},
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
