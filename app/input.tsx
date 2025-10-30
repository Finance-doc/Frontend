import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
import { getItem } from '@/hooks/storage';
import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const API_BASE_URL = 'http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com';
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getItem("accessToken");
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

const formatWithCommas = (s: string) => {
  const digits = s.replace(/[^\d]/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const formatKoreanDate = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${year}년 ${month}월 ${day}일`;
};

const postFinanceData = async (
  type: 'income' | 'expense' | 'saving',
  body: any
) => {
  let endpoint = '';

  if (type === 'expense') endpoint = '/report/api/expense';
  if (type === 'income') endpoint = '/report/api/income';
  if (type === 'saving') endpoint = '/report/api/saving';

  try {
    const data = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    console.log(`${type} 등록 성공:`, data);
    return data;
  } catch (err: any) {
    console.error(`🚨 ${type} 등록 중 오류 발생:`, err);
    Alert.alert('등록 실패', err.message || '서버 통신 중 문제가 발생했습니다.');
    return null;
  }
};

export default function InputScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [type, setType] = useState<'income' | 'expense' | 'saving'>('income');
  const [category, setCategory] = useState<{ id: number | null; name: string }>({
    id: null,
    name: '카테고리 추가',
  });
  const [date, setDate] = useState<string>('');
  const [displayDate, setDisplayDate] = useState<string>(''); 
  const [amountInput, setAmountInput] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      if (params.date && typeof params.date === 'string') {
        setDate(params.date);
        setDisplayDate(formatKoreanDate(params.date));
      }

      if (
        typeof params.selectedCategoryId === 'string' &&
        typeof params.selectedCategoryName === 'string'
      ) {
        setCategory({
          id: Number(params.selectedCategoryId),
          name: params.selectedCategoryName,
        });
      }
    }, [params.date, params.selectedCategoryId, params.selectedCategoryName])
  );

  const handleChangeAmount = (txt: string) => {
    setAmountInput(formatWithCommas(txt));
  };

  // 저장 버튼 클릭 시
  const handleSave = async () => {
    const amount = Number(amountInput.replace(/,/g, ''));

    if (!amount || amount <= 0) {
      Alert.alert('입력 오류', '금액을 입력하세요.');
      return;
    }

    const payload: any = {
      amount,
      description,
      date,
    };

    if (type === 'expense') {
      if (!category.id) {
        Alert.alert('입력 오류', '카테고리를 선택하세요.');
        return;
      }
      payload.categoryId = category.id; 
    }

    const result = await postFinanceData(type, payload);

    if (result) {
      Alert.alert('등록 완료', `${type === 'expense' ? '소비' : type === 'income' ? '수입' : '저축'}이 등록되었습니다.`);
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </Pressable>
          <Text style={styles.headerTitle}>기록하기</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* 수입 / 소비 / 저축 선택 탭 */}
          <View style={styles.typeSelector}>
            <Pressable
              style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
              onPress={() => setType('income')}
            >
              <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
                수입
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
              onPress={() => setType('expense')}
            >
              <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
                소비
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, type === 'saving' && styles.typeButtonActive]}
              onPress={() => setType('saving')}
            >
              <Text style={[styles.typeText, type === 'saving' && styles.typeTextActive]}>
                저축
              </Text>
            </Pressable>
          </View>

          {/* “소비”일 때만 카테고리 표시 */}
          {type === 'expense' && (
            <View style={styles.row}>
              <Text style={styles.label}>카테고리</Text>
              <Pressable
                style={styles.categoryButton}
                onPress={() =>
                  router.push({
                    pathname: '/category',
                    params: {
                      currentCategoryId: category.id ? category.id.toString() : '',
                      currentCategoryName: category.name,
                      date,
                    },
                  })
                }
              >
                <Text style={styles.categoryText}>
                  {category.name || '카테고리 선택'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* 날짜 */}
          <View style={styles.row}>
            <Text style={styles.label}>날짜</Text>
            <Text style={styles.dateText}>{displayDate}</Text>
          </View>

          {/* 금액 */}
          <View style={styles.row}>
            <Text style={styles.label}>금액</Text>
            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                value={amountInput}
                onChangeText={handleChangeAmount}
                placeholder="0"
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Text style={styles.unit}>원</Text>
            </View>
          </View>

          {/* 설명 */}
          <View style={styles.row}>
            <Text style={styles.label}>설명</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="내용을 입력하세요"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 5 },
  placeholder: { width: 34 },
  scrollContent: { padding: 20, paddingBottom: 80 },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 20,
    marginBottom: 20,
    height: 40,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  typeButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  typeText: { fontSize: 16, color: '#888', fontWeight: 'bold' },
  typeTextActive: { color: '#7A7BE6' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  label: { fontSize: 16, fontWeight: 'bold', color: Colors.black, width: 80 },

  // ✅ 카테고리 버튼
  categoryButton: {
    borderWidth: 1,
    borderColor: '#7A7BE6',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  categoryText: { color: '#7A7BE6', fontSize: 16, fontWeight: '600' },

  dateText: { fontSize: 16, color: Colors.black },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'right',
    minWidth: 100,
    padding: 0,
  },
  unit: { fontSize: 18, color: Colors.black, marginLeft: 5 },
  descriptionInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    textAlign: 'right',
    padding: 0,
  },
  saveButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#7A7BE6',
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});