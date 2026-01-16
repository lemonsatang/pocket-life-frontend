import axios from "axios";

const txApi = axios.create({
  baseURL: "http://localhost:8080/api/tx",
});

txApi.interceptors.request.use(
  (config) => {
    // 1. 저장된 토큰 꺼내기
    const token = sessionStorage.getItem("token");

    // 2. 토큰이 있다면 규격에 맞게(Bearer ) 헤더에 넣어주기
    if (token) {
      // 만약 localStorage에 저장된 토큰에 이미 "Bearer "가 포함되어 있다면 그대로 넣고,
      // 토큰 값만 들어있다면 아래처럼 `Bearer ${token}`으로 넣어줘야 합니다.
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }

    // 3. ★가장 중요★ 수정한 설정(config)을 반드시 다음 단계로 넘겨줘야 합니다!
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default txApi;
