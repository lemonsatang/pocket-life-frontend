import axios from "axios";

/**
 * 가계부 전용 axios 인스턴스
 * - 모든 요청에 JWT 토큰을 자동으로 붙여줌
 * - 백엔드 SecurityConfig와 정확히 대응
 */
const txApi = axios.create({
  baseURL: "http://localhost:8080/api/tx",
});

/**
 * 요청 인터셉터
 * - 요청 보내기 직전에 실행됨
 * - localStorage에 저장된 JWT를 그대로 Authorization 헤더에 추가
 * - ⚠️ Bearer를 다시 붙이면 안 됨 (이미 포함되어 있음)
 */
txApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // 토큰이 있으면 그대로 헤더에 세팅
    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default txApi;
