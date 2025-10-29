//categoryinput.tsx
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoryInputScreen() {
  const router = useRouter();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      // 카테고리 목록을 업데이트하는 로직 (실제 앱에서는 전역 상태 관리 필요)
      // 여기서는 예시로 router.back() 시 파라미터를 넘겨서 이전 화면에서 처리하도록 구현
      router.navigate({
        pathname: '/category', // 돌아갈 화면 경로
        params: { newCategory: newCategoryName.trim() },
      });
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
  },
  addButton: {
    backgroundColor: '#7A7BE6', // 보라색 버튼
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