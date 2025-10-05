import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ChatMessage 타입 정의
type ChatMessage = {
  id: string;
  type: 'ai' | 'user' | 'options'; 
  message: string;
  options?: string[] | null;
};

const OptionsRow = ({ options, onPress }: { options: string[]; onPress: (o: string) => void }) => {
  return (
    <View style={styles.optionsRow}>
      {options.map((opt, idx) => (
        <TouchableOpacity key={idx} style={styles.optionPill} onPress={() => onPress(opt)} hitSlop={{top:6,bottom:6,left:6,right:6}}>
          <Text style={styles.optionText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// AI 메시지 컴포넌트
const AIMessage = ({ message }: { message: ChatMessage }) => {
  return (
    <View style={styles.aiMessageRow}>
      <View style={styles.shadowWrapper}>
        <Image source={require('@/assets/images/img_doctor_profile.png')} style={styles.profileImage} />
      </View>      
      <View style={styles.aiBubbleContainer}>
        <Text style={styles.aiName}>꼬꼬쌤</Text>
        <View style={styles.chatshadowWrapper}>
          <View style={styles.aiMessageBubble}>
            <Text style={styles.aiText}>{message.message}</Text>
          </View>
        </View>
        <Text style={styles.aitime}>10:53 AM</Text>
      </View>
    </View>
  );
};

const UserMessage = ({ message }: { message: ChatMessage }) => {
  return (
    <View style={styles.userMessageRow}>
      <View style={styles.userMessageGroup}>
        <View style={styles.chatshadowWrapper}>
          <LinearGradient
            colors={[Colors.mint, Colors.purple]}
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }}
            style={styles.userMessageBubbleGradient}
          >
          <Text style={styles.userText}>{message.message}</Text>
          </LinearGradient>
          </View>
          <Text style={styles.usertime}>10:53 AM</Text>
        </View>
      </View>
  );
};

export default function Chat() {
  const flatListRef = useRef<FlatList<ChatMessage>>(null); 

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      type: 'ai',
      message: '안녕하세요! 돈 관리가 어려우셨다고요?\n잘오셨어요!\n\n저와 함께 소비성향을 파악하고 그에 맞는 투자 상품을 찾아보아요!\n\n소비성향 진단은 5문항으로 구성되어 있으며, 약 3분이 소요될 예정입니다.',
      options: ['소비성향 진단빋기'],
    },
  ]);
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);
  const handleOptionPress = (option: string) => {
    // 1. 사용자가 선택한 메시지를 즉시 화면에 추가
    setChatMessages((prev) => {
      // 이전 AI 메시지의 옵션 숨기기
      const idx = [...prev].reverse().findIndex((m) => m.type === 'ai' && m.options?.length);
      const next = [...prev];
      if (idx !== -1) {
        next[next.length - 1 - idx] = { ...next[next.length - 1 - idx], options: null };
      }
      next.push({
        id: Math.random().toString(),
        type: 'user',
        message: option,
        options: null,
      });

      return next;
    });
    // 다음 AI 응답
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        option === '소비성향 진단받기' 
          ? {
              id: Math.random().toString(),
              type: 'ai',
              message: 'Q1. SNS 광고로 본 신상! 홀딱 반해버린 당신, 가장 먼저 떠오른 생각은 무엇인가요?',
              options: ['사고 싶지만 안 쓰게 될 것 같은데...', '더 늦기 전에 당장 구매해!', '할인하는 사이트 없나? 찾아보자.', '오 매출이랑 주가 상승하겠는데?'],
            }
          : option === '다른 선택지' 
          ? {
              id: Math.random().toString(),
              type: 'ai',
              message: '다른 선택지에 대한 응답입니다.',
              options: ['새로운 분석 시작', '메인 화면으로 돌아가기', '추가'],
            }
          : { 
              id: Math.random().toString(),
              type: 'ai',
              message: '선택하신 옵션에 대한 심리 분석 결과...',
              options: null,
            }
      ]);
    }, 800);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'ai') {
      return (
        <>
          <AIMessage message={item} />
          {item.options && <OptionsRow options={item.options} onPress={handleOptionPress} />}
        </>
      );
    }
    if (item.type === 'user') return <UserMessage message={item} />;
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>진료실</Text>
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatListContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edf9ff',},
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop:15, paddingBottom: 15, backgroundColor: Colors.white},
  chatListContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  shadowWrapper: {
    width: 38,
    height: 38,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: Colors.white, 
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  chatshadowWrapper: {
    backgroundColor: 'transparent', 
    borderRadius: 15,
    maxWidth: '90%',
    
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 20,
    marginRight: 10,
  },
  aiName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 5,
    marginTop:5
  },
  aiBubbleContainer: { maxWidth: '95%', },
  aiMessageBubble: {
    backgroundColor: '#F2F2F7',
    borderRadius: 15,
    padding: 12,
  },
  aiText: {
    fontSize: 15,
  },
  userMessageGroup: {
    maxWidth: '100%',
    alignItems: 'flex-end',
  },
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  userMessageBubble: {
    backgroundColor: Colors.mint,
    borderRadius: 15,
    padding: 12,
    minWidth: '50%',         
    alignSelf: 'flex-end',  
    flexShrink: 1,     
  },
  userText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: 'bold'
  },
  optionText: {
    fontSize: 15,
    color: '#000',
    fontWeight: 'bold'
  },
  optionsRow: {
    alignSelf: 'flex-end',    
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '90%',
    marginTop: 6,
    marginBottom: 6,
    backgroundColor: 'transparent' 
  },
  optionPill: {
    backgroundColor: Colors.white, 
    borderWidth: 1,
    borderColor: Colors.mint,      
    borderRadius: 13,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    marginTop: 8,
  },
  aitime: {
    alignSelf: 'flex-end', 
    marginRight: 30,
    color: Colors.gray,
    fontSize: 10,
    marginTop: 10,
  },
  usertime: {
    marginRight: 5,
    color: Colors.gray,
    fontSize: 10,
    marginTop: 10,
  },
  userMessageBubbleGradient: {
    borderRadius: 15,
    padding: 12,
    minWidth: '50%',
    alignSelf: 'flex-end',
    flexShrink: 1,
  },
});
