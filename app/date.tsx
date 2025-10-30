import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
// 샘플 데이터
type TransactionItem = {
  id: string;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
};
type IncomeItem = {
  id: number;
  date: string;
  amount: number;
  description: string;
};

const fetchIncome = async (date: string) => {
  try {
    const data = await apiFetch(`/report/api/income?date=${date}`, { method: 'GET' });
    console.log('수입 목록 조회 성공:', data);
    return data;
  } catch (err: any) {
    console.error('수입 목록 조회 실패:');
    console.log('에러 전체 내용:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    return [];
  }
};
const fetchExpense = async (date: string) => {
  try {
    const data = await apiFetch(`/report/api/expense?date=${date}`, { method: 'GET' });
    console.log('소비 목록 조회 성공:', data);
    return data;
  } catch (err: any) {
    console.error('소비 목록 조회 실패:');
    console.log('에러 전체 내용:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    return [];
  }
};
const fetchIncomeList = async (date: string) => {
  try {
    const data = await apiFetch(`/report/api/income?date=${date}`, { method: 'GET' });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('수입 목록 조회 실패:', err);
    return [];
  }
};
const fetchSaving = async (date: string) => {
  try {
    const [year, month] = date.split('-'); // "2025", "10"
    const data = await apiFetch(`/report/api/saving?year=${year}&month=${month}`, { method: 'GET' });
    console.log(`저축 목록 조회 성공 (${year}-${month}):`, data);
    return Array.isArray(data) ? data : [];
  } catch (err: any) {
    console.error('저축 목록 조회 실패:', err);
    return [];
  }
};

const fetchExpenseList = async (date: string) => {
  try {
    const data = await apiFetch(`/report/api/expense?date=${date}`, { method: 'GET' });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('지출 목록 조회 실패:', err);
    return [];
  }
};

const formatMoney = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatKoreanDate = (dateString: string) => {
  const date = new Date(dateString);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${dayNames[date.getDay()]})`;
};

// 지출/수입 항목 렌더링 컴포넌트
const TransactionItem = ({ item, type }: { item: any; type: 'income' | 'expense' }) => {
  const color =
    type === 'income'
      ? '#004DFF'
      : type === 'expense'
      ? '#FF0004'
      : '#009688'; 

  const sign =
    type === 'income'
      ? '+'
      : type === 'expense'
      ? '-'
      : '💰';
  return (
    <Pressable style={styles.transactionItem} > 
      <View style={styles.transactionTextContainer}>
        <Text style={styles.transactionCategory}>
          {item.category || item.categoryName || ''}
        </Text>
        <Text style={styles.transactionDescription}>{item.description}</Text>
      </View>
      <View style={styles.transactionAmountContainer}>
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
  const selectedDate =
  params.date && typeof params.date === 'string'
    ? formatKoreanDate(params.date)
    : '날짜를 선택하세요';

  const [incomeList, setIncomeList] = useState<IncomeItem[]>([]);
  const [expenseList, setExpenseList] = useState<IncomeItem[]>([]);
  const [savingList, setSavingList] = useState<IncomeItem[]>([]);

  const [loading, setLoading] = useState(false);

  const rawDate =
    params.date && typeof params.date === 'string'
      ? params.date
      : new Date().toISOString().split('T')[0];
  const dateParam = typeof params.date === 'string' ? params.date : new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      if (!rawDate) return;
      setLoading(true);
      try {
        const [incomeData, expenseData, savingData] = await Promise.all([
          fetchIncome(rawDate),
          fetchExpense(rawDate),
          fetchSaving(rawDate),
        ]);

      const filteredSaving = savingData.filter(
        (item: any) => item.date === rawDate
      );
        setIncomeList(incomeData || []);
        setExpenseList(expenseData || []);
        setSavingList(filteredSaving  || []); 
      } catch (err) {
        console.error("날짜별 내역 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [rawDate]);
    useEffect(() => {
    const loadLists = async () => {
      try {
        setLoading(true);
        const [incomes, expenses] = await Promise.all([
          fetchIncomeList(dateParam),
          fetchExpenseList(dateParam),
        ]);

        setIncomeList(incomes);
        setExpenseList(expenses);
      } catch (err) {
        console.error('내역 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, [dateParam]);

  const totalIncome = incomeList.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseList.reduce((sum, item) => sum + item.amount, 0);
  const combinedList = [
    ...incomeList.map((i) => ({ ...i, type: 'income' })),
    ...expenseList.map((e) => ({ ...e, type: 'expense' })),
    ...savingList.map((s) => ({ ...s, type: 'saving' })),
  ];

  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color="#333" />
      </Pressable>
      <Text style={styles.title}>날짜별 리스트</Text>
            <View style={styles.placeholder} />
    </View>
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
          data={combinedList}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <TransactionItem item={item} type={item.type as 'income' | 'expense'} />
          )}          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>이 날짜에 내역이 없습니다.</Text>
          )}
          contentContainerStyle={styles.listContent}
          
        />
      {/* '+ 버튼' (세 번째 화면으로 이동) */}
    <Pressable
      style={styles.addButton}
      onPress={() => 
        router.push({ pathname: '/input', params: { date: rawDate } }) 
      }
    >
      <Ionicons name="add" size={32} color="white" />
    </Pressable>

        </SafeAreaView>
      );
    }

const styles = StyleSheet.create({
container: { backgroundColor: Colors.white,},
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', },
  scrollContainer: { paddingBottom: 20 },
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
    backgroundColor: Colors.white
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  incomeText: {
    fontSize: 16,
    color: '#004DFF',
    fontWeight: '600',
  },
  expenseText: {
    fontSize: 16,
    color: '#FF0004',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80, // FAB 때문에 하단 여백 추가
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    alignItems: 'center',
    
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
    justifyContent: 'center',  
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
    right: 40,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A4A5FF', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});