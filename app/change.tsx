// import { Colors } from '@/constants/colors';
// import { Ionicons } from '@expo/vector-icons';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
// import React, { useEffect, useState } from 'react';
// import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const API_BASE_URL = 'http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com';
// const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
//   try {
//     const token = await SecureStore.getItemAsync("accessToken");

//     const headers = {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...options.headers,
//     };

//     const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

//     if (!res.ok) {
//       const errorText = await res.text();
//       throw new Error(errorText);
//     }

//     return await res.json();
//   } catch (err) {
//     throw err;
//   }
// };

// // 통화 형식으로 변환
// const formatWithCommas = (s: string) => {
//   const digits = s.replace(/[^\d]/g, '');
//   return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// };
// const formatKoreanDate = (dateString: string) => {
//   const date = new Date(dateString);
//   const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
//   return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${dayNames[date.getDay()]})`;
// };

// // 금액을 콤마 없이 숫자로 변환
// const cleanAmount = (s: string) => Number(s.replace(/[^\d]/g, ''));

// export default function ChangeScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
  
//   // 파라미터에서 초기값 추출
//   const initialAmount = params.amount ? formatWithCommas(String(params.amount)) : '';
//   const initialDescription = params.description ? String(params.description) : '';
//   const initialCategory = params.category ? String(params.category) : '식비';
//   const initialType = params.type === 'income' ? 'income' : params.type === 'saving' ? 'saving' : 'expense';

//   const [type, setType] = useState<'income' | 'expense' | 'saving'>(initialType);
//   const [category, setCategory] = useState<string>(initialCategory);
//   const [amountInput, setAmountInput] = useState<string>(initialAmount);
//   const [description, setDescription] = useState<string>(initialDescription);

//   const [date, setDate] = useState<string>(
//   params.date && typeof params.date === 'string'
//     ? formatKoreanDate(params.date)
//     : '날짜 정보 없음'
// );
  
//   // category.tsx에서 선택된 카테고리 파라미터를 받아와 상태 업데이트
//   useEffect(() => {
//     if (params.selectedCategory && typeof params.selectedCategory === 'string') {
//       setCategory(params.selectedCategory);
//       router.setParams({ selectedCategory: undefined });
//     }
//   }, [params.selectedCategory]);

//   const handleChangeAmount = (txt: string) => {
//     setAmountInput(formatWithCommas(txt));
//   };
  
//   const handleUpdate = () => {
//     console.log(`기록 ID ${params.recordId} 업데이트:`, {
//       type, category, amount: cleanAmount(amountInput), description
//     });
//     router.back();
//   };

//   const handleDelete = () => {
//     console.log(`기록 ID ${params.recordId} 삭제`);
//     // 삭제 후 이전 화면으로 돌아가기
//     router.back(); 
//   };
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         {/* 헤더 */}
//         <View style={styles.header}>
//           <Pressable onPress={() => router.back()} style={styles.backButton}>
//             <Ionicons name="chevron-back" size={24} color="black" />
//           </Pressable>
//           <Text style={styles.headerTitle}>기록 수정하기</Text>
//           <View style={styles.placeholder} />
//         </View>

//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* 수입/소비/저축 탭 */}
//           <View style={styles.typeSelector}>
//             <Pressable
//               style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
//               onPress={() => setType('income')}
//             >
//               <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>수입</Text>
//             </Pressable>
//             <Pressable
//               style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
//               onPress={() => setType('expense')}
//             >
//               <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>소비</Text>
//             </Pressable>
//             <Pressable
//               style={[styles.typeButton, type === 'saving' && styles.typeButtonActive]}
//               onPress={() => setType('saving')}
//             >
//               <Text style={[styles.typeText, type === 'saving' && styles.typeTextActive]}>저축</Text>
//             </Pressable>
//           </View>

//           {/* 카테고리 */}
//           <View style={styles.row}>
//             <Text style={styles.label}>카테고리</Text>
//             <Pressable
//               style={styles.categorySelectBox}
//               onPress={() => router.push({ pathname: '/category', params: { currentCategory: category } })} // category.tsx로 이동
//             >
//               <Text style={styles.categoryTextDisplay}>{category}</Text>
//               <Ionicons name="chevron-forward" size={20} color="#888" />
//             </Pressable>
//           </View>

//           {/* 날짜 */}
//           <View style={styles.row}>
//             <Text style={styles.label}>날짜</Text>
//             <Text style={styles.dateText}>{date}</Text> 
//           </View>

//           {/* 금액 */}
//           <View style={styles.row}>
//             <Text style={styles.label}>금액</Text>
//             <View style={styles.amountInputContainer}>
//               <TextInput
//                 style={styles.amountInput}
//                 value={amountInput}
//                 onChangeText={handleChangeAmount}
//                 placeholder="0"
//                 keyboardType="number-pad"
//               />
//               <Text style={styles.unit}>원</Text>
//             </View>
//           </View>

//           {/* 설명 */}
//           <View style={styles.row}>
//             <Text style={styles.label}>설명</Text>
//             <TextInput
//               style={styles.descriptionInput}
//               value={description}
//               onChangeText={setDescription}
//               placeholder="내용을 입력하세요"
//               returnKeyType="done"
//             />
//           </View>
//         </ScrollView>
        
//         {/* 하단 삭제/확인 버튼 */}
//         <View style={styles.footer}>
//             <Pressable style={[styles.footerButton, styles.deleteButton]} onPress={handleDelete}>
//                 <Text style={styles.deleteButtonText}>삭제</Text>
//             </Pressable>
//             <Pressable style={[styles.footerButton, styles.confirmButton]} onPress={handleUpdate}>
//                 <Text style={styles.confirmButtonText}>확인</Text>
//             </Pressable>
//         </View>

//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.white, },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc', },
//   headerTitle: { fontSize: 18, fontWeight: 'bold', },
//   backButton: { padding: 5, },
//   placeholder: { width: 34, },
//   scrollContent: { padding: 20, paddingBottom: 100, }, // 하단 footer 공간 확보
  
//   typeSelector: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 20, marginBottom: 20, height: 40, },
//   typeButton: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20, },
//   typeButtonActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, },
//   typeText: { fontSize: 16, color: '#888', fontWeight: 'bold' },
//   typeTextActive: { color: '#7A7BE6', },
  
//   row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee', },
//   label: { fontSize: 16, fontWeight: 'bold', color: Colors.black, width: 80, },

//   // 카테고리 선택 버튼 스타일
//   categorySelectBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 15,
//     backgroundColor: '#f0f0f0',
//   },
//   categoryTextDisplay: {
//     fontSize: 16,
//     color: Colors.black,
//     fontWeight: 'bold',
//     marginRight: 5,
//   },

//   dateText: { fontSize: 16, color: Colors.black, },
//   amountInputContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end', },
//   amountInput: { fontSize: 24, fontWeight: 'bold', color: Colors.black, textAlign: 'right', minWidth: 100, padding: 0, },
//   unit: { fontSize: 18, color: Colors.black, marginLeft: 5, },
//   descriptionInput: { flex: 1, fontSize: 16, color: Colors.black, textAlign: 'right', padding: 0, },

//   // 하단 footer 및 버튼 스타일
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: '#ccc',
//     backgroundColor: Colors.white,
//   },
//   footerButton: {
//     flex: 1,
//     paddingVertical: 15,
//     alignItems: 'center',
//   },
//   deleteButton: {
//     backgroundColor: Colors.white,
//     borderRightWidth: StyleSheet.hairlineWidth,
//     borderRightColor: '#ccc',
//   },
//   deleteButtonText: {
//     color: '#FF4545', // 삭제는 빨간색 계열
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   confirmButton: {
//     backgroundColor: '#7A7BE6', // 확인은 보라색 계열
//   },
//   confirmButtonText: {
//     color: Colors.white,
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });
