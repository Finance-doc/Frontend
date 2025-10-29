import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIeWVyaW0ga2ltIiwic3ViIjoiMSIsImlhdCI6MTc2MDc2NjU4NCwiZXhwIjoxNzYxOTc2MTg0fQ.jpDSg5pGzaPgDQPqBjbK_oqfWvwpMf3wkaGpMGMHez4";

const API_BASE_URL = "http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com";

const screenWidth = Dimensions.get('window').width;

// 숫자 입력 시 콤마 추가
const formatWithCommas = (s: string) => {
  const digits = s.replace(/[^\d]/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 공통 API 금액 등록 함수
const postFinanceData = async (
  type: 'income' | 'expense' | 'saving',
  body: any
) => {
  let endpoint = '';

  if (type === 'expense') endpoint = '/report/api/expense';
  if (type === 'income') endpoint = '/report/api/income';
  if (type === 'saving') endpoint = '/report/api/saving';

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`${type} 등록 실패: ${res.status} - ${errorText}`);
      Alert.alert('등록 실패', errorText);
      return null;
    }

    const data = await res.json();
    console.log(`${type} 등록 성공:`, data);
    return data;
  } catch (err) {
    console.error(`🚨 ${type} 등록 중 오류 발생:`, err);
    Alert.alert('네트워크 오류', '서버 통신 중 문제가 발생했습니다.');
    return null;
  }
};

export default function InputScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [type, setType] = useState<'income' | 'expense' | 'saving'>('income');
  const [category, setCategory] = useState<string>('카테고리 추가');
  const [date, setDate] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  //  category.tsx에서 선택된 카테고리를 받아옴
  useEffect(() => {
    if (params.selectedCategory && typeof params.selectedCategory === 'string') {
      setCategory(params.selectedCategory);
      router.setParams({ selectedCategory: undefined }); // 중복 방지
    }
  }, [params.selectedCategory]);

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
      payload.category = category;
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
                    params: { currentCategory: category },
                  })
                }
              >
                <Text style={styles.categoryText}>{category}</Text>
              </Pressable>
            </View>
          )}

          {/* 날짜 */}
          <View style={styles.row}>
            <Text style={styles.label}>날짜</Text>
            <Text style={styles.dateText}>{date}</Text>
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