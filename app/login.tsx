import { Colors } from '@/constants/colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthRequest } from 'expo-auth-session';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from './navigation'; // app/navigation.ts 경로를 상대경로로 가져오기

const KAKAO_CLIENT_ID = 'ecaeda093cbe23fb23a3a1abfc3e1512'; // 카카오 클라이언트 ID 입력
const redirectUri = 'https://auth.expo.io/@minnnj/finance-doc'; 

const IMG_ICON = require('../assets/images/img_icon.png');
const IC_KAKAO = require('../assets/images/ic_kakao.png');
const IC_GOOGLE = require('../assets/images/ic_google.png');
const IMG_BOX_YELLOW = require('../assets/images/img_box_yellow.png');
const IMG_BOX_WHITE = require('../assets/images/img_box_white.png');


type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
const { width, height } = useWindowDimensions();
  const topOffset = Math.max(0, height * 0.2);  
  const logoSize = Math.round(Math.min(120, height * 0.12));
  const btnWidth = Math.round(width * 0.85); 
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const kakaoDiscovery = {
  authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
  tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
};

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: KAKAO_CLIENT_ID,
      redirectUri,
      responseType: 'code',
    },
    kakaoDiscovery 
  );
  
const handleKakaoLogin = async () => {
  if (request) {
    try {
      console.log('카카오 로그인 요청 시작');
      const result = await promptAsync(); // 로그인 요청
      console.log('카카오 로그인 결과:', result); // 결과 로그
    } catch (error) {
      console.error('로그인 에러:', error); 
      alert('로그인 처리 중 오류가 발생했습니다.');
    }
  } else {
    console.log('로그인 요청이 로드되지 않았습니다.');
  }
};

useEffect(() => {
  if (response) {
    console.log('response 객체:', response); // 응답 객체 전체 확인
    // 로그인 성공 시
    if (response?.type === 'success') {
      const { code } = response.params;
      console.log('카카오 로그인 성공:', code); 
      navigation.navigate('Home'); // 화면 전환
    } 
    
    // 로그인 실패 시
    else if (response?.type === 'error') {
      console.error('카카오 로그인 에러:', response.error);
      alert('로그인 실패. 다시 시도해주세요.');
    }
  }
}, [response]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={{ height: topOffset }} />
      <View style={styles.brand}>
        <Image source={IMG_ICON} style={[{ width: logoSize, height: logoSize }]} resizeMode="contain" />
        <Text style={styles.title}>파이낸스닥</Text>
        <Text style={styles.subtitle}>나만의 재무관리 의사 선생님</Text>
      </View>

      <View style={styles.actions}>
        {/* 카카오 시작하기 */}
      <TouchableOpacity activeOpacity={0.9} onPress={handleKakaoLogin}>
        <ImageBackground
          source={IMG_BOX_YELLOW}
          style={[styles.btnBg, { width: btnWidth, alignSelf: 'center' }]}
          imageStyle={[styles.btnBgImage, { borderRadius: 25 }]}
        >
          <Image source={IC_KAKAO} style={styles.leftIcon} />
          <Text style={styles.kakaoText}>카카오로 시작하기</Text>
          <View style={{ width: 24 }} />
        </ImageBackground>
      </TouchableOpacity>

        {/* 구글 시작하기 */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => {}}>
          <ImageBackground
            source={IMG_BOX_WHITE}
            style={[styles.btnBg, { width: btnWidth, alignSelf: 'center' }]}
            imageStyle={[styles.btnBgImage, { borderRadius: 25 }]}
          >
            <Image source={IC_GOOGLE} style={styles.leftIcon} />
            <Text style={styles.googleText}>구글로 시작하기</Text>
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
    backgroundColor: '#7DD8FF', 
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  brand: { alignItems: 'center', },
  title: { color: Colors.white, fontSize: 32, fontWeight: 'bold', marginTop: 10, letterSpacing: 1 },
  subtitle: { color: Colors.white, marginTop: 10, fontSize: 20 },
  actions: { marginTop: 50, gap: 30 },

  btnBg: {
    height: 50,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  btnBgImage: { borderRadius: 28, resizeMode: 'stretch'},
  leftIcon: { width: 28, height: 28, marginRight: 12, resizeMode: 'contain' },
  kakaoText: { flex: 1, textAlign: 'center', color: '#111', fontSize: 18, fontWeight: 'bold' },
  googleText: { flex: 1, textAlign: 'center', color: '#111', fontSize: 18, fontWeight: 'bold' },
});
