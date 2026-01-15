// src/api/api.js
import axios from "axios";

const dataApi = axios.create({ baseURL: "http://localhost:8080" });

dataApi.interceptors.request.use((config) => {
  // [수정 2026-01-14 12:50] 403 에러 해결:
  // 이유: 로그인 페이지는 sessionStorage를 사용하나 API는 localStorage만 확인. 또한 소셜 로그인(mock_token) 미지원.
  // 방법: sessionStorage 우선 확인 및 일반 토큰(token)과 소셜 토큰(mock_token) 모두 체크하도록 로직 확장.
  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("mock_token") ||
    localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default dataApi;
