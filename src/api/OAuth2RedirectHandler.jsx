import { useEffect } from "react"; // 여기서 한 번만 선언!
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuth2RedirectHandler({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // URL에서 토큰 추출
    const params = new URLSearchParams(
      location.search || window.location.search
    );
    let token = params.get("token");

    // 파라미터로 안 잡힐 경우 강제 파싱
    if (!token && window.location.href.includes("token=")) {
      token = window.location.href.split("token=")[1].split("&")[0];
    }

    if (token) {
      sessionStorage.setItem("token", "Bearer " + token);
      onLoginSuccess?.();
      navigate("/", { replace: true });
    } else {
      alert("로그인 정보를 가져오지 못했습니다.");
      navigate("/login");
    }
  }, [navigate, location, onLoginSuccess]);

  return <div>소셜 로그인 처리 중...</div>;
}
