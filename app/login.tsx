import { Colors } from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as AuthSession from 'expo-auth-session';
import { useAuthRequest } from "expo-auth-session";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Redirect URI (Expo 개발 환경용)
const redirectUri = AuthSession.makeRedirectUri({
 scheme: "financedoc",
  // projectNameForProxy: "finance-doc", 
});

console.log("등록해야 할 Redirect URI:", redirectUri);

// 카카오 REST API 키
const KAKAO_CLIENT_ID = "ecaeda093cbe23fb23a3a1abfc3e1512";

// 이미지 리소스
const IMG_ICON = require("../assets/images/img_icon.png");
const IC_KAKAO = require("../assets/images/ic_kakao.png");
const IMG_BOX_YELLOW = require("../assets/images/img_box_yellow.png");

export default function Login() {
  const { width, height } = useWindowDimensions();
  const topOffset = Math.max(0, height * 0.2);
  const logoSize = Math.round(Math.min(120, height * 0.12));
  const btnWidth = Math.round(width * 0.85);
  const router = useRouter();

  // 카카오 OAuth 설정
  const kakaoDiscovery = {
    authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
    tokenEndpoint: "https://kauth.kakao.com/oauth/token",
  };

  // 로그인 요청 생성
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: KAKAO_CLIENT_ID,
      redirectUri,
      responseType: "code",
    },
    kakaoDiscovery
  );

  // 버튼 클릭 시 로그인 시작
  const handleKakaoLogin = async () => {
    if (request) {
      try {
        console.log("카카오 로그인 요청 시작");
        const result = await promptAsync();
        console.log("카카오 로그인 결과:", result);
      } catch (error) {
        console.error("로그인 에러:", error);
        alert("로그인 처리 중 오류가 발생했습니다.");
      }
    } else {
      console.log("로그인 요청이 로드되지 않았습니다.");
    }
  };

  // 로그인 성공 후 백엔드 연결
  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      console.log("카카오 로그인 성공 — code:", code);

      axios
        .post(
          "https://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com/user/auth/kakao",
          { code }
        )
        .then(async (res) => {
          console.log("백엔드 응답:", res.data);
          const data = res.data;

          if (data.accessToken && data.refreshToken) {
            // 토큰 저장
            await AsyncStorage.setItem("accessToken", data.accessToken);
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
            console.log("토큰 저장 완료 ✅");

            // 홈 화면으로 이동
            router.replace("/(tabs)/home");
          } else {
            alert("로그인 실패: " + (data.message || "서버 응답 오류"));
          }
        })
        .catch((err) => {
          console.error("백엔드 요청 에러:", err);
          alert("로그인 처리 중 오류가 발생했습니다.");
        });
    }
  }, [response]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={{ height: topOffset }} />
      <View style={styles.brand}>
        <Image
          source={IMG_ICON}
          style={[{ width: logoSize, height: logoSize }]}
          resizeMode="contain"
        />
        <Text style={styles.title}>파이낸스닥</Text>
        <Text style={styles.subtitle}>나만의 재무관리 의사 선생님</Text>
      </View>

      <View style={styles.actions}>
        {/* 카카오 로그인 버튼 */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleKakaoLogin}>
          <ImageBackground
            source={IMG_BOX_YELLOW}
            style={[styles.btnBg, { width: btnWidth, alignSelf: "center" }]}
            imageStyle={[styles.btnBgImage, { borderRadius: 25 }]}
          >
            <Image source={IC_KAKAO} style={styles.leftIcon} />
            <Text style={styles.kakaoText}>카카오로 시작하기</Text>
            <View style={{ width: 24 }} />
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7DD8FF",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  brand: { alignItems: "center" },
  title: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 10,
    letterSpacing: 1,
  },
  subtitle: { color: Colors.white, marginTop: 10, fontSize: 20 },
  actions: { marginTop: 50, gap: 30 },
  btnBg: {
    height: 50,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 60,
  },
  btnBgImage: { borderRadius: 28, resizeMode: "stretch" },
  leftIcon: { width: 28, height: 28, marginRight: 12, resizeMode: "contain" },
  kakaoText: {
    flex: 1,
    textAlign: "center",
    color: "#111",
    fontSize: 18,
    fontWeight: "bold",
  },
});
