import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Content() {
  const [keyword, setKeyword] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchKeyword = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com/edu/keyword/random",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIeWVyaW0ga2ltIiwic3ViIjoiMSIsImlhdCI6MTc2MDc2NjU4NCwiZXhwIjoxNzYxOTc2MTg0fQ.jpDSg5pGzaPgDQPqBjbK_oqfWvwpMf3wkaGpMGMHez4",
          },
        }
      );
      const data = await response.json();
      setKeyword(data);
    } catch (error) {
      console.error("❌ Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeyword();
  }, []);

  if (!keyword) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 상단 제목 */}
        <Text style={styles.header}>용어 구급상자</Text>
        <Image source={require('@/assets/images/img_edu_title.png')} style={styles.titleImage} />

        {/* 본문 카드 */}
        <View style={styles.cardContainer}>
          <Image
            source={require('@/assets/images/img_edu_card.png')}
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

        {/* 닭 이미지 + 말풍선 */}
        <View style={styles.kokoContainer}>
          <Image source={require('@/assets/images/img_edu_koko_1.png')} style={styles.koko} />
          <Image source={require('@/assets/images/img_edu_bubble.png')} style={styles.bubble} />
        </View>

        {/* 코인 좌우 */}
        <Image source={require('@/assets/images/img_edu_coin_left.png')} style={styles.coinLeft} />
        <Image source={require('@/assets/images/img_edu_coin_right.png')} style={styles.coinRight} />

        {/* 버튼 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={fetchKeyword}>
            <Image source={require('@/assets/images/img_edu_btn_next.png')} style={styles.nextBtn} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('퀴즈 페이지로 이동')}>
            <Image source={require('@/assets/images/img_edu_btn_quiz.png')} style={styles.quizBtn} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E7F1FF' },
  scrollContainer: { alignItems: 'center', paddingBottom: 100 },
  header: { fontSize: 22, fontWeight: '900', marginVertical: 12 },
  titleImage: { width: width * 0.8, height: 40, resizeMode: 'contain' },

  // 카드 크기 키움
  cardContainer: {
    width: width * 0.9,
    height: 360,
    marginTop: 10,
    alignItems: 'center',
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardContent: { padding: 25, marginTop: 20 },
  keywordTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  keywordDesc: { fontSize: 14, textAlign: 'justify', lineHeight: 20 },
  source: { color: '#2969FF', textAlign: 'right', marginTop: 12 },

  // 닭, 말풍선
  kokoContainer: { marginTop: 10, alignItems: 'center' },
  koko: { width: 180, height: 200 },
  bubble: { position: 'absolute', top: -40, right: 80, width: 110, height: 70 },

  // 코인
  coinLeft: { position: 'absolute', left: 15, bottom: 140, width: 60, height: 60 },
  coinRight: { position: 'absolute', right: 15, bottom: 140, width: 60, height: 60 },

  // 버튼
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.8,
    marginTop: 10,
  },
  nextBtn: { width: 130, height: 60, resizeMode: 'contain' },
  quizBtn: { width: 150, height: 60, resizeMode: 'contain' },
});
