import { Colors } from '../constants/colors';
import * as AuthSession from 'expo-auth-session';
import { useAuthRequest } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const redirectUri = AuthSession.makeRedirectUri({ useProxy: true, } as any);
const KAKAO_CLIENT_ID = 'ecaeda093cbe23fb23a3a1abfc3e1512'; 

const IMG_ICON = require('../assets/images/img_icon.png');
const IC_KAKAO = require('../assets/images/ic_kakao.png');
const IMG_BOX_YELLOW = require('../assets/images/img_box_yellow.png');
const IMG_BOX_WHITE = require('../assets/images/img_box_white.png');


export default function Login() {
const { width, height } = useWindowDimensions();
  const topOffset = Math.max(0, height * 0.2);  
  const logoSize = Math.round(Math.min(120, height * 0.12));
  const btnWidth = Math.round(width * 0.85); 
  const router = useRouter();
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
  try {
    const result = await promptAsync();
    if (result?.type === "success") {
      console.log("카카오 로그인 성공:", result.params.code);
    }
  } catch (e) {
    console.error(e);
  }
};

useEffect(() => {
  if (response?.type === 'success') {
    const { code } = response.params;
    console.log('카카오 로그인 성공:', code); 

    fetch('http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com/user/auth/kakao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

      .then(res => res.json())
      .then(async data => {
        if (data.success) {
          console.log('백엔드 로그인 성공:', data);
          router.replace('/(tabs)/home');
        } else {
          alert('로그인 실패: ' + data.message);
        }
      })
      .catch(err => {
        console.error('백엔드 요청 에러:', err);
        alert('로그인 처리 중 오류가 발생했습니다.');
      });
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

      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => router.replace('/inputaccount')}
        style={[styles.startBtn, { width: btnWidth, alignSelf: 'center' }]} 
      >
      <Text style={styles.startText}>시작하기</Text> 
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
    startBtn: { 
    height: 50,
    backgroundColor: Colors.white, 
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  startText: { 
    color: Colors.black, 
    fontSize: 18, 
    fontWeight: 'bold',
  },
});
