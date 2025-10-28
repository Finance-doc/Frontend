import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

export default function Content() {
  const [keyword, setKeyword] = useState<Keyword | null>(null);
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<"keyword" | "quiz" | "result">("keyword");

  const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIeWVyaW0ga2ltIiwic3ViIjoiMSIsImlhdCI6MTc2MDc2NjU4NCwiZXhwIjoxNzYxOTc2MTg0fQ.jpDSg5pGzaPgDQPqBjbK_oqfWvwpMf3wkaGpMGMHez4";

  const fetchKeyword = async () => {
    try {
      const res = await fetch(
        "http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com/edu/keyword/random",
        { headers: { Authorization: token } }
      );
      const data = await res.json();
      setKeyword(data);
    } catch (err) {
      console.error("❌ Keyword fetch error:", err);
    }
  };

  const fetchQuiz = async () => {
    try {
      const res = await fetch(
        "http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com/edu/keyword/quiz",
        { headers: { Authorization: token } }
      );
      const data: QuizItem[] = await res.json();
      setQuizList(data);
      setMode("quiz");
    } catch (err) {
      console.error("❌ Quiz fetch error:", err);
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

  // 📘 키워드 화면
  if (mode === "keyword" && keyword)
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>용어 구급상자</Text>
          <Image
            source={require("@/assets/images/img_edu_title.png")}
            style={styles.titleImage}
          />

          {/* 카드 */}
          <View style={styles.cardContainer}>
            <Image
              source={require("@/assets/images/img_edu_card.png")}
              style={styles.cardBackground}
              resizeMode="stretch"
            />
            <View style={styles.cardContent}>
              <Text style={styles.keywordTitle}>{keyword.keywordName}</Text>
              <Text style={styles.keywordDesc}>{keyword.keywordDesc}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(keyword.keywordLink)}>
                <Text style={styles.source}>📘 자세히 보기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 버튼 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={fetchKeyword}>
              <Image
                source={require("@/assets/images/img_edu_btn_next.png")}
                style={styles.nextBtn}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={fetchQuiz}>
              <Image
                source={require("@/assets/images/img_edu_btn_quiz.png")}
                style={styles.quizBtn}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );

  // 🧩 퀴즈 화면
  if (mode === "quiz" && quizList.length > 0) {
    const quiz = quizList[current];
    const isCorrect = selected && selected === quiz.answer;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.quizScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>꼬꼬쌤 경제 퀴즈</Text>

          {/* 문제 카드 */}
          <View style={styles.quizCard}>
            <Image
              source={require("@/assets/images/img_edu_card.png")}
              style={styles.quizCardBackground}
              resizeMode="stretch"
            />
            <View style={styles.quizContent}>
              <Text style={styles.question}>{quiz.question}</Text>
            </View>
          </View>

          {/* 선택지 */}
          <View style={styles.choiceContainer}>
            {quiz.choices.map((c, i) => {
              const isSelected = selected === c;
              const bg =
                !selected
                  ? "#F5F7FA"
                  : isSelected && isCorrect
                  ? "#FFE54D"
                  : isSelected
                  ? "#E0E0E0"
                  : "#F5F7FA";

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
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.nextBtn, { alignSelf: "center", marginTop: 30 }]}
          >
            <Text style={styles.nextText}>
              {current === quizList.length - 1 ? "점수확인" : "다음문제"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 🏁 결과 화면
  if (mode === "result")
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>총 점수</Text>
        <View style={styles.cardContainer}>
          <Image
            source={require("@/assets/images/img_edu_card.png")}
            style={styles.cardBackground}
          />
          <View style={styles.cardContent}>
            <Text style={{ fontSize: 26, fontWeight: "800", textAlign: "center" }}>
              {score * 20}점
            </Text>
            <Text style={{ textAlign: "center", marginTop: 10 }}>
              총 5문제 중 {score}문제를 맞혔어요!
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setMode("keyword");
            setScore(0);
            setCurrent(0);
            setSelected(null);
          }}
          style={styles.nextBtn}
        >
          <Text style={styles.nextText}>다시하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E7F1FF", alignItems: "center" },
  scrollContainer: { alignItems: "center", paddingBottom: 100 },
  header: { fontSize: 22, fontWeight: "900", marginVertical: 12 },
  titleImage: { width: width * 0.8, height: 40, resizeMode: "contain" },

  cardContainer: {
    width: width * 0.9,
    minHeight: 360,
    alignItems: "center",
    marginTop: 10,
  },
  cardBackground: { width: "100%", height: "100%", position: "absolute" },
  cardContent: { padding: 25, marginTop: 20 },
  keywordTitle: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  keywordDesc: { fontSize: 14, textAlign: "justify", lineHeight: 20 },
  source: { color: "#2969FF", textAlign: "right", marginTop: 12 },

  // QUIZ MODE
  quizScroll: { alignItems: "center", paddingHorizontal: 16, paddingBottom: 80 },
  quizCard: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "transparent",
    position: "relative",
    marginBottom: 20,
  },
  quizCardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  quizContent: {
    padding: 24,
    paddingBottom: 40,
    minHeight: 240,
    justifyContent: "center",
  },
  question: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "justify",
  },

  // 선택지
  choiceContainer: {
    width: "95%",
    marginTop: 4,
  },
  choice: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  choiceText: { fontSize: 15 },

  resultText: { fontSize: 42, fontWeight: "900", textAlign: "center", marginTop: 25 },

  // 버튼
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.8,
    marginTop: 10,
  },
  nextBtn: {
    backgroundColor: "#D8EBFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 25,
  },
  nextText: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  quizBtn: { width: 150, height: 60, resizeMode: "contain" },
});
