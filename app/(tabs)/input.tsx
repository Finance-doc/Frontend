import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons'; // 아이콘 사용을 위해 추가
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

// 통화 형식으로 변환
const formatWithCommas = (s: string) => {
  const digits = s.replace(/[^\d]/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 샘플 카테고리
const CATEGORIES = [
  '패션/미용', '식비', '교통', '생활용품', '문화생활', '기타'
];

export default function ListScreen() {
  const router = useRouter();
  const [type, setType] = useState<'income' | 'expense' | 'saving'>('expense'); // 수입/소비/저축
  const [category, setCategory] = useState<string>('패션/미용');
  const [date, setDate] = useState<string>('2025년 8월 31일 일요일'); // 실제 앱에서는 DatePicker 사용
  const [amountInput, setAmountInput] = useState<string>('');
  const [description, setDescription] = useState<string>('운동화 구매');

  const handleChangeAmount = (txt: string) => {
    setAmountInput(formatWithCommas(txt));
  };
  
  const handleSave = () => {
    // 실제 저장 로직 구현 (예: API 호출, 로컬 저장)
    console.log({
      type,
      category,
      date,
      amount: amountInput.replace(/,/g, ''),
      description,
    });
    // 저장 후 이전 화면으로 돌아가기
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
          {/* 수입/소비/저축 탭 */}
          <View style={styles.typeSelector}>
            <Pressable
              style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
              onPress={() => setType('income')}
            >
              <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>수입</Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
              onPress={() => setType('expense')}
            >
              <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>소비</Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, type === 'saving' && styles.typeButtonActive]}
              onPress={() => setType('saving')}
            >
              <Text style={[styles.typeText, type === 'saving' && styles.typeTextActive]}>저축</Text>
            </Pressable>
          </View>

          {/* 카테고리 */}
          <View style={styles.row}>
            <Text style={styles.label}>카테고리</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryTag,
                      category === cat && styles.categoryTagActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 날짜 */}
          <View style={styles.row}>
            <Text style={styles.label}>날짜</Text>
            <Pressable
              style={styles.datePicker}
              onPress={() => { /* 달력 모달 열기 로직 */ }}
            >
              <Text style={styles.dateText}>{date}</Text>
            </Pressable>
          </View>

          {/* 금액 */}
          <View style={styles.row}>
            <Text style={styles.label}>금액</Text>
            <View style={styles.amountInputContainer}>
              {/* 이미지에는 슬라이더가 있지만, 실제 입력 편의를 위해 TextInput으로 구현 */}
              <TextInput
                style={styles.amountInput}
                value={amountInput}
                onChangeText={handleChangeAmount}
                placeholder="0"
                keyboardType="number-pad"
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
            />
          </View>
        </ScrollView>
        
        {/* 저장 버튼 (키보드 위에 위치) */}
        <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>저장하기</Text>
        </Pressable>

      </KeyboardAvoidingView>
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
    width: 34,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80, // 저장 버튼 공간 확보
  },
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
  typeText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: '#7A7BE6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    width: 80, // 레이블 너비 고정
  },
  categoryContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryTagActive: {
    backgroundColor: '#A4A5FF', // 이미지의 보라색 계열
    borderWidth: 1,
    borderColor: '#7A7BE6'
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  datePicker: {
    paddingVertical: 5,
  },
  dateText: {
    fontSize: 16,
    color: Colors.black,
  },
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
  unit: {
    fontSize: 18,
    color: Colors.black,
    marginLeft: 5,
  },
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
    backgroundColor: '#7A7BE6', // 이미지의 파란색 저장 버튼
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});