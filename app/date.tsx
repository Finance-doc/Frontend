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
  { id: '2', category: '식비', description: '점심', amount: 12000, type: 'expense', time: '12:03' },
  { id: '3', category: '교통/차량', description: '교통카드', amount: 55000, type: 'expense', time: '11:45' },
  { id: '4', category: '수입', description: '급여', amount: 620145, type: 'income', time: '10:00' },
];

const formatMoney = (amount: number) => {
  return amount.toLocaleString();
};

//  리스트 아이템 컴포넌트
const TransactionListItem = ({ item }: { item: TransactionItem }) => {
  const router = useRouter();
  const isIncome = item.type === 'income';
  const color = isIncome ? Colors.mint : '#FF4545';
  const sign = isIncome ? '+' : '-';

  const handlePress = () => {
    router.push({
      pathname: '/change',
      params: {
        recordId: item.id,
        type: item.type,
        amount: item.amount,
        description: item.description,
        category: item.category,
      },
    });
  };

  return (
    <Pressable style={styles.transactionItem} onPress={handlePress}>
      <View style={styles.leftSection}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.descText}>{item.description}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={[styles.amountText, { color }]}>
          {sign}
          {formatMoney(item.amount)}원
        </Text>
      </View>
    </Pressable>
  );
};

// ✅ 메인 화면
export default function DateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedDate = (params.date as string) || '2025년 8월 8일 금요일';

  const totalIncome = sampleTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = sampleTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSaving = totalIncome - totalExpense;

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 날짜 및 요약 */}
      <View style={styles.summaryBox}>
        <Text style={styles.dateText}>{selectedDate}</Text>
        <View style={styles.summaryAmounts}>
          <Text style={[styles.amountLabel, { color: '#A4A5FF' }]}>
            수입 {formatMoney(totalIncome)}원
          </Text>
          <Text style={[styles.amountLabel, { color: '#FF4545' }]}>
            지출 {formatMoney(totalExpense)}원
          </Text>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 내역 목록 */}
      <FlatList
        data={sampleTransactions.filter((t) => t.type !== 'income')} // 수입 제외 (카테고리 지출 리스트만)
        renderItem={({ item }) => <TransactionListItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>기록이 없습니다.</Text>}
      /> 

      {/* + 버튼 */}
      <Pressable style={styles.addButton} onPress={() => router.push('/input')}>
        <Ionicons name="add" size={34} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}

// ✅ 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  summaryBox: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 15,
  },
  dateText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 12,
  },
  summaryAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 25,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 100,
  },
  descText: {
    fontSize: 16,
    color: '#555',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#A4A5FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 5,
  },
});