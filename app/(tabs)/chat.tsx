import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
// import * as SecureStore from 'expo-secure-store';
import { getItem } from '@/hooks/storage';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
/* ---------- Types ---------- */
type ChatMessage = {
  id: string;
  type: 'ai' | 'user';
  message: string;
  options?: string[] | null;
};

type QuestionResponse = {
  id: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
};

/* ---------- API ---------- */
/**
 * 통합 API Fetch 함수
 * - 자동 토큰 추가
 * - ai-report일 경우 text 응답으로 처리
 * - 에러 로그 강화
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getItem("accessToken");
    if (!token) console.warn('No access token found in SecureStore');

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error [${endpoint}]`, errorText);
      throw new Error(errorText);
    }

    if (endpoint.includes('/recommend/ai-report')) {
      return await res.text();
    }

    return await res.json();
  } catch (err) {
    console.error(`Fetch failed [${endpoint}]:`, err);
    throw err;
  }
};

/* ---------- Recommend Options ---------- */
const INCOME_OPTS = ['200만원 이하', '300만원', '400만원', '500만원 이상'];
const SAVING_OPTS = ['5%', '10%', '15%', '20% 이상'];
const INTEREST_OPTS = ['목돈 마련', '공격 투자', '내 집 마련'];

/* 추천 질문 단계 */
type RecStep = 0 | 1 | 2 | 3 | 4;

export default function Chat() {
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  /* 설문 상태 */
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [qIndex, setQIndex] = useState<number>(-1);
  const [answers, setAnswers] = useState<number[]>([]);

  /* 추천 상태 */
  const [recStep, setRecStep] = useState<RecStep>(0);
  const [income, setIncome] = useState<string | null>(null);
  const [savingRate, setSavingRate] = useState<string | null>(null);
  const [interest, setInterest] = useState<string | null>(null);

  /* 채팅 메시지 */
  const initialGreeting: ChatMessage = {
    id: 'greet',
    type: 'ai',
    message:
      '안녕하세요! 돈 관리가 어려우셨다고요?\n잘오셨어요!\n\n저와 함께 소비성향을 파악하고 그에 맞는 투자 상품을 찾아보아요!\n\n소비성향 진단은 5문항으로 구성되어 있으며, 약 3분 정도 소요됩니다.\n\n진단을 시작해볼까요?',
    options: ['소비성향 진단받기'],
  };
  const [chat, setChat] = useState<ChatMessage[]>([initialGreeting]);

  /* ---------- Helpers ---------- */
  const scrollToEnd = () => flatListRef.current?.scrollToEnd({ animated: true });
  useEffect(scrollToEnd, [chat]);

  const pushAI = (message: string, options?: string[] | null) =>
    setChat(prev => [...prev, { id: Math.random().toString(), type: 'ai', message, options: options ?? null }]);

  const pushUser = (message: string) =>
    setChat(prev => [...prev, { id: Math.random().toString(), type: 'user', message }]);

  const hideLastOptions = () =>
    setChat(prev => {
      const rIdx = [...prev].reverse().findIndex(m => m.type === 'ai' && m.options?.length);
      if (rIdx === -1) return prev;
      const realIdx = prev.length - 1 - rIdx;
      const copy = [...prev];
      copy[realIdx] = { ...copy[realIdx], options: null };
      return copy;
    });

  const resetSurveyState = () => {
    setQuestions([]);
    setQIndex(-1);
    setAnswers([]);
  };

  const resetRecommendState = () => {
    setRecStep(0);
    setIncome(null);
    setSavingRate(null);
    setInterest(null);
  };

  const softRestartToSurvey = () => {
    resetSurveyState();
    resetRecommendState();
    pushAI('다시 처음부터 시작해볼게요. 소비성향 진단을 진행할까요?', ['소비성향 진단받기']);
  };

  /* ---------- API Calls ---------- */
  const fetchQuestions = async () => {
    try {
      const data = await apiFetch('/recommend/questions', { method: 'GET' });
      setQuestions(data);
      return true;
    } catch (e) {
      pushAI('질문을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return false;
    }
  };

  const submitSurvey = async () => {
    try {
      const data = await apiFetch('/recommend/survey', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      return data as {
        personalityType: string;
        totalScore: number;
        description: string;
      };
    } catch (e) {
      pushAI('진단 결과를 가져오지 못했어요.');
      return null;
    }
  };

  const submitAiReport = async (i: string, s: string, it: string) => {
    try {
      const result = await apiFetch('/recommend/ai-report', {
        method: 'POST',
        body: JSON.stringify({ income: i, savingRate: s, interest: it }),
      });

      if (typeof result === 'string') return result;
      if (result && typeof result.message === 'string') return result.message;
      return 'AI 추천 결과를 불러오지 못했어요.';
    } catch (e) {
      console.error('AI report error:', e);
      pushAI('추천 리포트를 불러오지 못했어요.');
      return null;
    }
  };

  /* ---------- 첫 질문 표시 ---------- */
  useEffect(() => {
    if (questions.length > 0 && qIndex === 0) {
      const q = questions[0];
      pushAI(q.question, [q.option1, q.option2, q.option3, q.option4, q.option5]);
    }
  }, [questions, qIndex]);

  /* ---------- 추천 단계 ---------- */
  const startRecommendFlow = () => {
    resetRecommendState();
    setRecStep(1);
    pushAI('월 소득을 선택해주세요.', [...INCOME_OPTS]);
  };

  const proceedRecommend = async (picked: string) => {
    if (recStep === 1 && INCOME_OPTS.includes(picked)) {
      setIncome(picked);
      setRecStep(2);
      pushAI('저축률을 선택해주세요.', [...SAVING_OPTS]);
      return;
    }

    if (recStep === 2 && SAVING_OPTS.includes(picked)) {
      setSavingRate(picked);
      setRecStep(3);
      pushAI('관심 분야를 선택해주세요.', [...INTEREST_OPTS]);
      return;
    }

    if (recStep === 3 && INTEREST_OPTS.includes(picked)) {
      setInterest(picked);
      setRecStep(4);
      pushAI('생각중...');

      const text = await submitAiReport(income ?? '', savingRate ?? '', picked);
      if (text) pushAI(text);

      pushAI('추가 상담을 원하시나요?', ['재진단하기', '처음으로']);
      setRecStep(0);
    }
  };

  /* ---------- 옵션 클릭 ---------- */
  const onOption = async (opt: string) => {
    hideLastOptions();
    pushUser(opt);

    if (opt === '소비성향 진단받기') {
      resetSurveyState();
      const ok = await fetchQuestions();
      if (ok) setQIndex(0);
      return;
    }

    if (qIndex >= 0 && qIndex < questions.length) {
      const cur = questions[qIndex];
      const score = [cur.option1, cur.option2, cur.option3, cur.option4, cur.option5].indexOf(opt) + 1;
      setAnswers(prev => [...prev, score]);

      if (qIndex < questions.length - 1) {
        const next = qIndex + 1;
        setQIndex(next);
        const nq = questions[next];
        pushAI(nq.question, [nq.option1, nq.option2, nq.option3, nq.option4, nq.option5]);
      } else {
        setQIndex(-1);
        pushAI('분석중...');
        const result = await submitSurvey();
        if (result) {
          pushAI(`당신은 ${result.personalityType} 투자자입니다!\n\n${result.description}`, ['추천받기']);
        }
      }
      return;
    }

    if (opt === '추천받기' || opt === '재진단하기') {
      startRecommendFlow();
      return;
    }

    if (opt === '처음으로') {
      softRestartToSurvey();
      return;
    }

    if (recStep > 0) {
      await proceedRecommend(opt);
      return;
    }
  };

  /* ---------- Render ---------- */
  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'ai') {
      return (
        <>
          <AIMessage message={item} />
          {item.options && <OptionsRow options={item.options} onPress={onOption} />}
        </>
      );
    }
    return <UserMessage message={item} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>진료실</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={chat}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatListContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* ---------- UI ---------- */
const OptionsRow = ({ options, onPress }: { options: string[]; onPress: (o: string) => void }) => (
  <View style={styles.optionsColumn}>
    {options.map((o, i) => (
      <TouchableOpacity key={i} style={styles.optionBlock} onPress={() => onPress(o)}>
        <Text style={styles.optionText}>{o}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const AIMessage = ({ message }: { message: ChatMessage }) => (
  <View style={styles.aiMessageRow}>
    <View style={styles.profileShadow}>
      <Image source={require('@/assets/images/img_doctor_profile.png')} style={styles.profileImage} />
    </View>
    <View style={styles.aiBubbleContainer}>
      <Text style={styles.aiName}>꼬꼬쌤</Text>
      <View style={styles.aiMessageBubble}>
        <Text style={styles.aiText}>{message.message}</Text>
      </View>
    </View>
  </View>
);

const UserMessage = ({ message }: { message: ChatMessage }) => (
  <View style={styles.userMessageRow}>
    <View style={styles.userMessageBubble}>
      <LinearGradient
        colors={[Colors.mint, Colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.userMessageGradient}
      >
        <Text style={styles.userText}>{message.message}</Text>
      </LinearGradient>
    </View>
  </View>
);

/* ---------- Styles ---------- */
const HEADER_HEIGHT = 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf9ff',
  },
  header: {
    height: HEADER_HEIGHT,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  chatListContent: {
    paddingHorizontal: 15,
    paddingTop: HEADER_HEIGHT + 10,
    paddingBottom: 100,
  },
  aiMessageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    maxWidth: '92%',
  },
  aiBubbleContainer: { maxWidth: '80%' },
  aiName: { fontSize: 14, marginBottom: 4, fontWeight: 'bold' },
  aiMessageBubble: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiText: { fontSize: 15 },
  profileShadow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 3 },
    }),
  },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 14,
    paddingLeft: 60,
  },
  userMessageBubble: { maxWidth: '78%' },
  userMessageGradient: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  userText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
  optionsColumn: {
    marginTop: 6,
    alignSelf: 'stretch',
  },
  optionBlock: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  optionText: {
    fontSize: 14,
    color: Colors.black,
  },
});
