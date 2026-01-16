// src/api/api.js
import axios from "axios";

const dataApi = axios.create({ baseURL: "http://localhost:8080" });

dataApi.interceptors.request.use((config) => {
  // [수정 2026-01-14 12:50] 403 에러 해결:
  // 이유: 로그인 페이지는 sessionStorage를 사용하나 API는 localStorage만 확인. 또한 소셜 로그인(mock_token) 미지원.
  // 방법: sessionStorage 우선 확인 및 일반 토큰(token)과 소셜 토큰(mock_token) 모두 체크하도록 로직 확장.
  // 1. 저장된 토큰 꺼내기 (기존 로직 유지: 세션 -> 목 -> 로컬 순)
  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("mock_token") ||
    localStorage.getItem("token");

  // 2. 토큰이 있다면 규격에 맞게(Bearer ) 헤더에 넣어주기
  if (token) {
    // 만약 localStorage에 저장된 토큰에 이미 "Bearer "가 포함되어 있다면 그대로 넣고,
    // 토큰 값만 들어있다면 아래처럼 `Bearer ${token}`으로 넣어줘야 합니다.
    config.headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;

    console.log("DEBUG: Final Header:", config.headers.Authorization);
  }
  return config;
});

export default dataApi;
