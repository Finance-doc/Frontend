import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 샘플 데이터
type TransactionItem = {
  id: string;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  time: string;
};

const sampleTransactions: TransactionItem[] = [
  { id: '1', category: '생활용품', description: '바디워시', amount: 7800, type: 'expense', time: '18:45' },
  { id: '2', category: '식비', description: '점심', amount: 12000, type: 'expense', time: '10:00' },
  { id: '3', category: '교통/차량', description: '교통카드', amount: 55000, type: 'expense', time: '11:45' },
  { id: '4', category: '수입', description: '급여', amount: 620145, type: 'income', time: '10:00' },
  // ... 추가 내역
];

const formatMoney = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 지출/수입 항목 렌더링 컴포넌트
const TransactionListItem = ({ item }: { item: TransactionItem }) => {
  const isIncome = item.type === 'income';
  const sign = isIncome ? '+' : '-';
  const color = isIncome ? '#A4A5FF' : '#FF4545';
  const router = useRouter();

  const handlePress = () => {
    // 항목을 눌렀을 때 change.tsx로 이동하며 기록 ID 전달
    router.push({
      pathname: '/change',
      params: { recordId: item.id, type: item.type, amount: item.amount, description: item.description, category: item.category },
    });
  };

  return (
    <Pressable style={styles.transactionItem} onPress={handlePress}> 
      <View style={styles.transactionTextContainer}>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        <Text style={styles.transactionDescription}>{item.description}</Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text style={styles.transactionTime}>{item.time}</Text>
        <Text style={[styles.transactionAmount, { color }]}>
          {sign} {formatMoney(item.amount)}원
        </Text>
      </View>
    </Pressable>
  );
};

export default function DateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedDate = (params.date as string) || '2025년 8월 8일 금요일'; // 홈에서 넘겨받은 날짜 사용
  
  // 총 수입 및 지출 계산
  const totalIncome = sampleTransactions
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = sampleTransactions
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <SafeAreaView style={styles.container}>

      {/* 날짜 및 요약 */}
      <View style={styles.summaryContainer}>
        <Text style={styles.dateText}>{selectedDate}</Text>
        <View style={styles.amountBox}>
          <Text style={styles.incomeText}>수입 {formatMoney(totalIncome)}원</Text>
          <Text style={styles.expenseText}>지출 {formatMoney(totalExpense)}원</Text>
        </View>
      </View>
      
      {/* 내역 목록 (FlatList) */}
      <FlatList
        data={sampleTransactions.sort((a, b) => a.time.localeCompare(b.time))} // 시간 순으로 정렬
        renderItem={({ item }) => <TransactionListItem item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>이 날짜에 기록된 내역이 없습니다.</Text>
        )}
      />

      {/* '+ 버튼' (세 번째 화면으로 이동) */}
      <Pressable
        style={styles.addButton}
        onPress={() => 
          router.push({ pathname: '/input' }) // 객체 형태로 수정
      } // 입력 화면으로 이동
      >
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 34, // 백버튼과 동일한 너비로 중앙 정렬 유지
  },
  summaryContainer: {
    padding: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  incomeText: {
    fontSize: 16,
    color: '#A4A5FF',
    fontWeight: '600',
  },
  expenseText: {
    fontSize: 16,
    color: '#FF4545',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80, // FAB 때문에 하단 여백 추가
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  transactionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 80, // 카테고리 너비 고정
  },
  transactionDescription: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
    flexShrink: 1,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A4A5FF', // 파란색 동그라미
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Android 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});