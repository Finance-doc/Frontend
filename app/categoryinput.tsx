//categoryinput.tsx
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
const addCategory = async (categoryName: string) => {
  try {
    const res = await apiFetch(`/report/api/categories`, {
      method: 'POST',
      body: JSON.stringify({ name: categoryName }),
    });
    console.log('카테고리 추가 성공:', res);
    return res;
  } catch (err) {
    console.error('카테고리 추가 실패:', err);
    throw err;
  }
};

export default function CategoryInputScreen() {
  const router = useRouter();
  const [newCategoryName, setNewCategoryName] = useState('');
  const params = useLocalSearchParams(); 
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('입력 오류', '카테고리명을 입력해주세요.');
      return;
    }

    try {
      console.log('카테고리 추가 요청:', newCategoryName);
      const result = await addCategory(newCategoryName.trim());

      Alert.alert('완료', '새 카테고리가 추가되었습니다.');
      console.log('응답 데이터:', result);

      router.navigate({
        pathname: '/category',
        params: { 
          newCategory: newCategoryName.trim(),
          date: params.date, 
        },
      });

    } catch (err) {
      Alert.alert('오류', '카테고리 추가 중 문제가 발생했습니다.');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>카테고리 추가하기</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="추가할 카테고리명 입력 (예: 대중교통)"
          returnKeyType="done"
          onSubmitEditing={handleAddCategory}
        />
        <Pressable 
          style={styles.addButton} 
          onPress={handleAddCategory}
          disabled={!newCategoryName.trim()}
        >
          <Text style={styles.addButtonText}>추가하기</Text>
        </Pressable>
      </View>
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
  content: {
    padding: 20,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    marginBottom: 20,
    marginTop: 80
  },
  addButton: {
    backgroundColor: '#6A6DFF', // 보라색 버튼
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});