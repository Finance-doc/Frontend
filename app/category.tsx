//category.tsx
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
const fetchCategories = async () => {
  try {
    const data = await apiFetch(`/report/api/categories`, { method: 'GET' });
      if (Array.isArray(data)) {
        return data.map((item: any) => item.name);
      }
      return [];
  } catch (err) {
    console.error('카테고리 목록 조회 실패:', err);
    return [];
  }
};

export default function CategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userCategories, setUserCategories] = useState<string[]>([]);  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const categories = await fetchCategories();
      setUserCategories(categories);
      setLoading(false);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (params.newCategory && typeof params.newCategory === 'string') {
      const newCat = params.newCategory;
      if (!userCategories.includes(newCat)) {
        setUserCategories(prev => [...prev, newCat]);
        setSelectedCategory(newCat); // 새로 추가된 항목을 바로 선택
      }
      router.setParams({ newCategory: undefined });
    }
  }, [params.newCategory]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
  };
  
  const handleConfirm = () => {
    if (selectedCategory) {
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>카테고리 선택</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoryGrid}>
        {userCategories.map((cat) => (
          <React.Fragment key={cat}> 
            {renderCategoryItem({ item: cat })}
          </React.Fragment>
          ))}          
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },  
  headerTitle: { fontSize: 18, fontWeight: 'bold', },
  backButton: { padding: 5, },
  placeholder: { width: 34, },
  scrollContent: { padding: 20, },
  
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    width:60,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  categoryTagActive: {
    backgroundColor: '#A4A5FF', // 이미지의 보라색 계열
  },
  categoryText: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold'
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