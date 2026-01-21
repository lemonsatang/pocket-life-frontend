// [Layout] 메인 앱 컴포넌트 - 라우팅 및 인증 상태 관리
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import MealPage from "./features/Meal/MealPage";
import Cart from "./features/Cart/CartPage";
import SchedulePage from "./pages/SchedulePage/SchedulePage";
import LedgerPage from "./pages/LedgerPage/LedgerPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import AuthLayout from "./components/Layout/AuthLayout/AuthLayout";
import OAuth2RedirectHandler from "./api/OAuth2RedirectHandler";

// [Style] 전역 스타일 import
import "./styles/Common.css";
import "./styles/DatePicker.css";

import { MealProvider } from "./features/Meal/context/MealContext.jsx"; // [New]

// [Logic] 메인 App 컴포넌트
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState("login");

  // 로그인 유지
  useEffect(() => {
    // [수정 2026-01-13 12:40] sessionStorage로 변경 - 브라우저 종료 시 로그아웃 처리
    const token = sessionStorage.getItem("token");

    if (token) {
      setAuthed(true); // 토큰이 있다면 로그인 유지
    }
  }, []);

  // [Logic] 로그아웃 처리
  const logout = () => {
    // [수정 2026-01-13 12:40] sessionStorage로 변경
    sessionStorage.removeItem("token");
    setAuthed(false);
    setView("login");
  };

  // [Logic] 로그인 성공 핸들러
  const handleLoginSuccess = () => {
    console.log("로그인 성공 상태 변경 중...");
    setAuthed(true);
  };

  // [Layout] 미인증 상태 - 인증 레이아웃 표시
  // if (!authed) {
  //   return (
  //     <AuthLayout
  //       view={view}
  //       onGoLogin={() => setView("login")}
  //       onGoSignup={() => setView("signup")}
  //       onLoginSuccess={handleLoginSuccess}
  //     />
  //   );
  // }

  // [Layout] 인증 상태 - 메인 애플리케이션
  return (
    <MealProvider>
      <BrowserRouter>
        {authed ? (
          <div className="app-layout">
            <Header onLogout={logout} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/meal" element={<MealPage onLogout={logout} />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/ledger" element={<LedgerPage />} />
                {/* 이미 로그인 된 상태에서 리다이렉트 페이지 오면 홈으로 보냄 */}
                <Route path="/oauth2/redirect" element={<Navigate to="/" />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        ) : (
          <Routes>
            {/* 로그인 안 된 상태에서만 리다이렉트 핸들러가 작동하도록 설정 */}
            <Route
              path="/oauth2/redirect"
              element={
                <OAuth2RedirectHandler onLoginSuccess={handleLoginSuccess} />
              }
            />
            <Route
              path="*"
              element={
                <AuthLayout
                  view={view}
                  onGoLogin={() => setView("login")}
                  onGoSignup={() => setView("signup")}
                  onLoginSuccess={handleLoginSuccess}
                />
              }
            />
          </Routes>
        )}
      </BrowserRouter>
    </MealProvider>
  );
}
