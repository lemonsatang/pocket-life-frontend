// [Layout] 인증 레이아웃 컴포넌트 - 로그인/회원가입 화면 래퍼
import React from "react";
import LoginPage from "../../../pages/LoginPage/LoginPage";
import SignupPage from "../../../pages/SignupPage/SignupPage";
import "./Auth.css";

const AuthLayout = ({ view, onGoLogin, onGoSignup, onLoginSuccess }) => {
  return (
    <div className="authBg">
      <div className="authWrap">
        <div className="brand">Pocket Life</div>
        <div className="topBar"></div>
        <div className="auth-card">
          <div className="banner">
            <svg className="drop" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M32 6C24 18 16 26 16 38a16 16 0 0 0 32 0C48 26 40 18 32 6z" />
            </svg>
          </div>
          <div className="panel">
            {view === "signup" ? (
              <SignupPage onGoLogin={onGoLogin} />
            ) : (
              <LoginPage onGoSignup={onGoSignup} onLoginSuccess={onLoginSuccess} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;


