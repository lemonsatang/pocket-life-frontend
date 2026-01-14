// [Layout] 로그인 페이지 - 사용자 인증
import React, { useState } from "react";
// 경로에 맞춰 수정 (같은 폴더면 "./Modal", components 폴더면 "../components/Modal")
import Modal from "../../components/Modal/Modal";
import axios from "axios";
import "./LoginPage.css";

export default function LoginPage({ onGoSignup, onLoginSuccess }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [m, setM] = useState({
    open: false,
    title: "",
    msg: "",
    showCancel: false,
    confirmText: "확인",
    cancelText: "취소",
    onConfirm: null,
    onCancel: null,
  });

  // [Logic] 모달 닫기
  const close = () => setM((s) => ({ ...s, open: false }));

  // [Logic] 회원가입 안내 모달
  const openAskSignup = () => {
    setM({
      open: true,
      title: "로그인 실패",
      msg: "아이디/비밀번호가 없거나 맞지 않습니다.\n회원이 아니시라면 가입 하시겠습니까?",
      showCancel: true,
      confirmText: "회원가입",
      cancelText: "취소",
      onConfirm: () => {
        close();
        onGoSignup?.();
      },
      onCancel: close,
    });
  };

  // [Logic] 확인 모달
  const openOk = (msg, after) => {
    setM({
      open: true,
      title: "안내",
      msg,
      showCancel: false,
      confirmText: "확인",
      cancelText: "취소",
      onConfirm: () => {
        close();
        after?.();
      },
      onCancel: close,
    });
  };

  const login = async (e) => {
    e.preventDefault();

    // 로그인에 사용할 formData 생성
    const formData = new FormData();
    formData.append("username", id);
    formData.append("password", pw);

    try {
      // 서버에 로그인 요청
      const response = await axios.post(
        "http://localhost:8080/login",
        formData
      );
      console.log(response);

      // 토큰 추출
      const token = response.headers["authorization"];

      if (token) {
        // [수정 2026-01-13 12:40] sessionStorage로 변경 - 브라우저 종료 시 로그아웃 처리
        sessionStorage.setItem("token", token);
        // [수정 2026-01-14 12:50] 403 에러 해결 (토큰 충돌 방지):
        // 이유: 소셜 로그인 후 일반 로그인 시, api.js가 만료된 소셜 토큰을 참조하는 문제 발생.
        // 방법: 일반 로그인 성공 시 기존의 소셜 토큰(mock_token)을 명시적으로 삭제.
        sessionStorage.removeItem("mock_token");

        openOk("로그인 성공", () => {
          setId("");
          setPw("");
          onLoginSuccess?.();
        });
      }
    } catch (e) {
      console.error("로그인 에러: ", e);
      openOk("로그인 정보를 확인해주세요.");
    }
  };

  // [Logic] 소셜 로그인 처리
  const handleSocialLogin = (provider) => {
    // [수정 2026-01-14 12:50] 403 에러 해결 (토큰 충돌 방지):
    // 이유: 일반 로그인 후 소셜 로그인 시, api.js가 기존 일반 토큰을 우선 참조하는 문제 발생.
    // 방법: 소셜 로그인 시도 시 기존의 일반 토큰(token)을 명시적으로 삭제.
    sessionStorage.removeItem("token");
    sessionStorage.setItem(
      "mock_token",
      "mock-social-" + provider + "-" + Date.now()
    );
    openOk(`${provider} 계정으로 로그인되었습니다.`, () => {
      onLoginSuccess?.();
    });
  };

  return (
    <>
      <form onSubmit={login} className="form">
        <div className="panelTitle">로그인</div>

        <div className="field">
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
            </svg>
          </span>
          <input
            className="input login-input"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디"
          />
        </div>

        <div className="field">
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M17 10h-1V8a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4Z" />
            </svg>
          </span>
          <input
            className="input login-input"
            type={showPw ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="login-password-toggle-btn"
          >
            {showPw ? (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4.01.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            )}
          </button>
        </div>

        <button className="primaryBtn" type="submit">
          로그인
        </button>

        <div className="miniLinks">
          <button type="button" className="miniLink">
            아이디 찾기
          </button>
          <span className="dot" />
          <button type="button" className="miniLink">
            비밀번호 찾기
          </button>
          <span className="dot" />
          <button type="button" className="miniLink" onClick={onGoSignup}>
            회원가입
          </button>
        </div>

        <div className="dividerRow">
          <div className="hr" />
          <div className="or">또는</div>
          <div className="hr" />
        </div>

        <div className="socialRow">
          <button
            type="button"
            className="social google"
            aria-label="Google"
            onClick={() => handleSocialLogin("Google")}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              alt="Google"
              className="login-social-img"
            />
          </button>
          <button
            type="button"
            className="social naver"
            aria-label="Naver"
            onClick={() => handleSocialLogin("Naver")}
          >
            N
          </button>
        </div>

        <div className="bottomLink">
          계정이 없으신가요?{" "}
          <button type="button" className="bottomBtn" onClick={onGoSignup}>
            회원가입 &gt;
          </button>
        </div>
      </form>

      <Modal
        open={m.open}
        title={m.title}
        message={m.msg}
        showCancel={m.showCancel}
        confirmText={m.confirmText}
        cancelText={m.cancelText}
        onConfirm={m.onConfirm}
        onCancel={m.onCancel}
      />
    </>
  );
}
