import { Colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
import { setItem } from '@/hooks/storage';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com';

export default function InputAccount() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('입력 오류', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/user/test/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`로그인 실패: ${res.status} - ${errorText}`);
        Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      const data = await res.json();

      // accessToken, refreshToken 저장
      // (원하면 SecureStore 또는 AsyncStorage에 저장 가능)
      const { accessToken, refreshToken, user } = data;

      await setItem('accessToken', accessToken);
      await setItem('refreshToken', refreshToken);
      await setItem('nickname', user.nickname);
      Alert.alert('로그인 성공', `${user.nickname}님 환영합니다!`);
      console.log('AccessToken:', accessToken);
      console.log('RefreshToken:', refreshToken);

      router.replace('/(tabs)/home');
    } catch (err) {
      console.error('로그인 요청 중 오류:', err);
      Alert.alert('네트워크 오류', '서버와의 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>계정 로그인</Text>

      <View style={styles.form}>
        <Text style={styles.label}>아이디</Text>
        <TextInput
          style={styles.input}
          placeholder="아이디를 입력하세요"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>로그인</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#A4A5FF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 60,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
