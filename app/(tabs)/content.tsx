import { Colors } from '@/constants/colors';
import { getItem } from '@/hooks/storage';
// import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Keyword {
  keywordName: string;
  keywordDesc: string;
  keywordLink: string;
}

interface QuizItem {
  question: string;
  answer: string;
  choices: string[];
}
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
     const token = await getItem("accessToken");

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
};

export default function Content() {
  const [keyword, setKeyword] = useState<Keyword | null>(null);
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<"keyword" | "quiz" | "result">("keyword");

  const fetchKeyword = async () => {
    try {
      const data = await apiFetch("/edu/keyword/random", { method: "GET" });
      setKeyword(data);
    } catch (err) {
      console.error("Keyword fetch error:", err);
    }
  };

  const fetchQuiz = async () => {
    try {
      const data = await apiFetch("/edu/keyword/quiz", { method: "GET" });
      setQuizList(data);
      setMode("quiz");
    } catch (err) {
      console.error("Quiz fetch error:", err);
    }
  };

  useEffect(() => {
    fetchKeyword();
  }, []);

  const handleSelect = (choice: string) => setSelected(choice);

  const handleNext = () => {
    if (!selected) return;
    const currentQuiz = quizList[current];
    if (selected === currentQuiz.answer) setScore((prev) => prev + 1);

    if (current < quizList.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
    } else {
      setMode("result");
    }
  };

  //키워드 화면
  if (mode === "keyword" && keyword)
    return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
        <Text style={styles.title}>용어 구급 상자</Text>
          <Image
            source={require("@/assets/images/bg_content_word.png")}
            style={styles.content}
          />
          {/* 카드 */}
          <View style={styles.cardContainer}>
            <Image
              source={require("@/assets/images/img_edu_card.png")}
              style={styles.cardBackground}
              resizeMode="contain"
            />
            <View style={styles.cardContent}>
              <Text style={styles.keywordTitle}>{keyword.keywordName}</Text>
              <Text style={styles.keywordDesc}>{keyword.keywordDesc}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(keyword.keywordLink)}>
                <Text style={styles.source}>📘 자세히 보기</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Image
            source={require("@/assets/images/img_doctor_content.png")}
            style={styles.imagedoctor}
            resizeMode="contain"
          />
          {/* 버튼 */}
          <TouchableOpacity onPress={fetchKeyword}>
            <Image
              source={require("@/assets/images/img_edu_btn_next.png")}
              style={styles.nextBtn}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchQuiz}>
            <Image
              source={require("@/assets/images/img_edu_btn_quiz.png")}
              style={styles.quizBtn}
              resizeMode="contain"
          />
        </TouchableOpacity>
      </SafeAreaView>
    );

  // 퀴즈 화면
  if (mode === "quiz" && quizList.length > 0) {
    const quiz = quizList[current];
    const isCorrect = selected && selected === quiz.answer;
    return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>용어 구급 상자</Text>
        <Image
          source={require("@/assets/images/bg_content_quiz.png")}
          style={styles.content}
        />
        {/* 카드 */}
        <View style={styles.cardContainer}>
          <Image
            source={require("@/assets/images/img_edu_card.png")}
            style={styles.cardBackground}
            resizeMode="contain"
          />
          <View style={styles.cardContent}>
            <Text style={styles.question}>{quiz.question}</Text>
          </View>
        </View>

        {/* 선택지 */}
        <View style={styles.choiceContainer}>
          {quiz.choices.map((c, i) => {
            const isSelected = selected === c;
            const bg =
              !selected
                ? "#FFFFFF"
                : isSelected && isCorrect
                ? "#FFFF00"
                : isSelected
                ? "#E0E0E0"
                : "#FFFFFF";
                return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSelect(c)}
                  disabled={!!selected}
                  style={[styles.choice, { backgroundColor: bg }]}
                >
                <Text style={styles.choiceText}>
                  ({i + 1}) {c}
                </Text>
              </TouchableOpacity>
              );
            })}
          </View>
          {/* 정답 표시 */}
          {selected && (
            <Text style={[styles.resultText, { color: "#FF5050" }]}>
              {isCorrect ? "정답" : "오답"}
            </Text>
          )}

          {/* 다음 버튼 */}
          <TouchableOpacity onPress={handleNext}
            style={[styles.nextBtn, { alignSelf: "center", marginTop: 30,}]}
          >
            <View style={styles.nextto}>
            <Text style={styles.next}>
              {current === quizList.length - 1 ? "점수확인" : "다음문제"}
            </Text>
            </View>
          </TouchableOpacity>
      </SafeAreaView>
    );
  }

  //결과 화면
  if (mode === "result")
    return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>용어 구급 상자</Text>
      <ScrollView>
        <Image
          source={require("@/assets/images/bg_content_word.png")}
          style={styles.content}
        />
        <View style={styles.cardContainer}>
          <Image
            source={require("@/assets/images/img_edu_card.png")}
            style={styles.cardBackground}
            resizeMode="contain"
          />
        <View style={styles.cardContent}>
          <Text style={{ fontSize: 35, fontWeight: "bold", textAlign: "center", marginTop: 15}}>
            총 점수
          </Text>         
           <Text style={{ fontSize: 35, fontWeight: "bold", textAlign: "center", marginTop: 15,  color: "#0088FF" }}>
            {score * 20}점
          </Text>
          <Text style={{ textAlign: "center", marginTop: 30, fontSize: 20, fontWeight: "bold"}}>
            나의 경제지식은 {score*20}점 입니다.{"\n"}총 5문제 중 {score}문제를 맞혔어요!
          </Text>
        </View>
      </View>
      <Image
        source={require("@/assets/images/img_doctor_result.png")}
        style={styles.imagedoctor}
        resizeMode="contain"
      />
      <TouchableOpacity
        onPress={() => {
          setMode("keyword");
          setScore(0);
          setCurrent(0);
          setSelected(null);
        }}
        style={[styles.nextto, { marginBottom: 30, marginStart: 130}]}
      >        
      <Text style={styles.next}>다시하기</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    );

  return null;
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#A9D5E8",flex:1},
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop:15, paddingBottom: 15,backgroundColor : Colors.white},  
  content: {alignItems: "center", justifyContent: 'center', width: '100%', position: 'relative'},
  header: { fontSize: 22, fontWeight: "900", marginVertical: 12 },
  titleImage: { width: width * 0.8, height: 40, resizeMode: "contain", marginTop: 30},
  cardContainer: { width: width * 0.9, minHeight: 360, alignItems: "center", marginTop: 30, position: "absolute", top: 50,left: '50%', transform: [{ translateX: -width * 0.45 }], zIndex: 1,},  
  cardBackground: { width: "100%", height: "100%", position: "absolute" },
  cardContent: { padding: 25, marginTop: 40 },
  keywordTitle: { fontSize: 25, fontWeight: "bold", textAlign: "center"},
  keywordDesc: { fontSize: 15, textAlign: "justify", fontWeight: "600", lineHeight: 20, padding: 25 },
  source: { color: "#3086FF", textAlign: "right", marginEnd: 10,fontWeight: "bold", },
  imagedoctor: { width:250, height:360, position: 'absolute', bottom: -30, left: 0, zIndex: 2, },
  nextBtn: { width: 120,  position: 'absolute', bottom: 85, right: 30, zIndex: 2 },
  quizBtn: { width: 120,  position: 'absolute', bottom: 20, right: 30, zIndex: 2 },
  question: {fontSize: 15, textAlign: "justify", fontWeight: "600", lineHeight: 20, padding: 25, marginTop: 20},
  choiceContainer: { width: "60%", zIndex: 2, position: 'absolute', bottom: 60, left: 50,},
  choice: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, marginVertical: 5, borderWidth: 1, borderColor: "#D0D0D0",},
  choiceText: { fontSize: 15, fontWeight: "bold" },
  resultText: { fontSize: 60, fontWeight: "900", textAlign: "center", position: 'absolute', bottom: 300, left: '40%', zIndex :2},
  nextText: { fontSize: 18, fontWeight: "700", textAlign: "center" , backgroundColor : '#D3F1FE',},
  nextto :{ width: 80, height: 30, borderRadius: 10, justifyContent: "center", backgroundColor: '#D3F1FE', position: 'absolute', bottom: 20, left: '40%', zIndex :2},
  next: { fontSize: 18, fontWeight: "700", textAlign: "center" },
});