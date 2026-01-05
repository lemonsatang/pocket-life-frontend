import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Meal from "./pages/Meal";
import Cart from "./pages/Cart";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// [CSS] 두 파일 모두 import
import "./Retro.css";
import "./Auth.css";

function Nav({ onLogout }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="pixel-nav-container">
      <div className="pixel-nav-bar">
        {/* 로고 */}
        <Link
          to="/"
          className="nav-logo-small"
          style={{ textDecoration: "none" }}
        >
          <span className="logo-text">Pocket Life</span>
        </Link>

        {/* 메뉴 구성: 대시보드 / 식단 관리 / 장바구니 / 일정 / 가계부 */}
        <div className="nav-tabs">
          <Link to="/" className={`nav-tab ${path === "/" ? "active" : ""}`}>
            대시보드
          </Link>
          <div className="nav-divider"></div>

          <Link
            to="/meal"
            className={`nav-tab ${path === "/meal" ? "active" : ""}`}
          >
            식단 관리
          </Link>
          <div className="nav-divider"></div>

          <Link
            to="/cart"
            className={`nav-tab ${path === "/cart" ? "active" : ""}`}
          >
            장바구니
          </Link>
          <div className="nav-divider"></div>

          <Link
            to="/schedule"
            className={`nav-tab ${path === "/schedule" ? "active" : ""}`}
          >
            일정
          </Link>
          <div className="nav-divider"></div>

          <Link
            to="/ledger"
            className={`nav-tab ${path === "/ledger" ? "active" : ""}`}
          >
            가계부
          </Link>
        </div>

        {/* 우측 유저 정보 및 로그아웃 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="nav-user-info">효민님 반갑습니다.</div>
          <button className="logoutBtn" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  // 로그인 상태 관리 (테스트를 위해 기본값을 true로 설정하거나, localStorage 확인)
  const [authed, setAuthed] = useState(!!localStorage.getItem("mock_token"));
  const [view, setView] = useState("login"); // login or signup

  const logout = () => {
    localStorage.removeItem("mock_token");
    setAuthed(false);
    setView("login");
    // [핵심] 로그아웃 시에도 URL을 / (대시보드)로 초기화
    window.history.pushState(null, "", "/");
  };

  // 1. 로그인이 안 된 경우 -> 로그인/회원가입 화면 (Auth.css 적용)
  if (!authed) {
    return (
      <div className="authBg">
        <div className="authWrap">
          <div className="brand">Pocket Life</div>

          <div className="topBar"></div>

          {/* [중요] auth-card 클래스 유지 (로그인 UI 깨짐 방지) */}
          <div className="auth-card">
            <div className="banner">
              <svg className="drop" viewBox="0 0 64 64" aria-hidden="true">
                <path d="M32 6C24 18 16 26 16 38a16 16 0 0 0 32 0C48 26 40 18 32 6z" />
              </svg>
            </div>

            <div className="panel">
              {view === "signup" ? (
                <SignupPage onGoLogin={() => setView("login")} />
              ) : (
                <LoginPage
                  onGoSignup={() => setView("signup")}
                  onLoginSuccess={() => {
                    setAuthed(true);
                    // [핵심] 로그인 성공 시 무조건 URL을 / (대시보드)로 변경
                    window.history.pushState(null, "", "/");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 로그인이 된 경우 -> 대시보드 (Retro.css 적용)
  return (
    <BrowserRouter>
      <Nav onLogout={logout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meal" element={<Meal />} />
          <Route path="/cart" element={<Cart />} />

          {/* 일정, 가계부 라우트 - 글자색(color) 추가됨 */}
          <Route
            path="/schedule"
            element={
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  fontFamily: "Jua",
                  color: "#6f76a1",
                }}
              >
                <h2>📅 일정 페이지</h2>
                <p>아직 준비 중입니다.</p>
              </div>
            }
          />
          <Route
            path="/ledger"
            element={
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  fontFamily: "Jua",
                  color: "#6f76a1",
                }}
              >
                <h2>💰 가계부 페이지</h2>
                <p>아직 준비 중입니다.</p>
              </div>
            }
          />

          <Route
            path="*"
            element={
              <div
                style={{
                  padding: "50px",
                  textAlign: "center",
                  color: "#6f76a1",
                }}
              >
                <h2>페이지를 찾을 수 없습니다.</h2>
              </div>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
