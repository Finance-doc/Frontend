import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const api = axios.create({
  baseURL: "https://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com",
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터 — 모든 요청마다 accessToken 자동 추가
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 — 토큰 만료 / 재로그인 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const res = error.response;
    if (!res) return Promise.reject(error);

    if (res.data?.refreshValidity === false || res.status === 401) {
      console.log("🔒 토큰 만료 — 재로그인 필요");
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      router.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default api;