//category.tsx
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const initialCategories = [
  '식비', '생활용품', '패션/미용', '교육', '교통/차량', '건강', '문화생활'
];

export default function CategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userCategories, setUserCategories] = useState<string[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // categoryinput.tsx에서 새 카테고리가 추가되었을 때 상태 업데이트
  useEffect(() => {
    if (params.newCategory && typeof params.newCategory === 'string') {
      const newCat = params.newCategory;
      if (!userCategories.includes(newCat)) {
        setUserCategories(prev => [...prev, newCat]);
        setSelectedCategory(newCat); // 새로 추가된 항목을 바로 선택
      }
      // 파라미터 제거 (이후 새로고침 시 중복 추가 방지)
      router.setParams({ newCategory: undefined });
    }
  }, [params.newCategory]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
  };
  
  const handleConfirm = () => {
    if (selectedCategory) {
      // 선택된 카테고리를 input.tsx로 전달하고 뒤로 돌아가기
      router.navigate({
        pathname: '/input', // 돌아갈 화면 경로
        params: { selectedCategory: selectedCategory },
      });
    } else {
      router.back(); // 선택 없으면 그냥 돌아가기
    }
  };

  const renderCategoryItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedCategory;
    return (
      <Pressable
        style={[styles.categoryTag, isSelected && styles.categoryTagActive]}
        onPress={() => handleSelectCategory(item)}
      >
        <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>{item}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>카테고리 선택</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoryGrid}>
          {userCategories.map(cat => renderCategoryItem({ item: cat }))}
          
          {/* 카테고리 추가 버튼 */}
          <Pressable
            style={styles.addCategoryButton}
            onPress={() => router.push('/categoryinput')} // categoryinput.tsx로 이동
          >
            <Ionicons name="add" size={24} color="#7A7BE6" />
          </Pressable>
        </View>
      </ScrollView>

      {/* 하단 버튼 영역 */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.confirmButton} 
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>확인</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, },
  header: { /* ... 스타일 생략 ... */ },
  headerTitle: { fontSize: 18, fontWeight: 'bold', },
  backButton: { padding: 5, },
  placeholder: { width: 34, },
  scrollContent: { padding: 20, },
  
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // 여러 줄로 표시
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  categoryTagActive: {
    backgroundColor: '#A4A5FF', // 이미지의 보라색 계열
    borderWidth: 1,
    borderColor: '#7A7BE6'
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  addCategoryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7A7BE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    padding: 10,
  },
  confirmButton: {
    backgroundColor: '#7A7BE6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});