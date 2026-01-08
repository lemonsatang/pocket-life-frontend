// [Layout] 메인 앱 컴포넌트 - 라우팅 및 인증 상태 관리
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import MealPage from "./pages/MealPage/MealPage";
import Cart from "./pages/Cart";
import SchedulePage from "./pages/SchedulePage/SchedulePage";
import LedgerPage from "./pages/LedgerPage/LedgerPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import AuthLayout from "./components/Layout/AuthLayout/AuthLayout";

// [Style] 전역 스타일 import
import "./styles/Common.css";
import "./styles/DatePicker.css";

// [Logic] 메인 App 컴포넌트
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState("login");

  // 로그인 유지
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuthed(true); // 토큰이 있다면 로그인 유지
    }
  }, []);

  // [Logic] 로그아웃 처리
  const logout = () => {
    localStorage.removeItem("token");
    setAuthed(false);
    setView("login");
    window.history.pushState(null, "", "/");
  };

  // [Logic] 로그인 성공 핸들러
  const handleLoginSuccess = () => {
    setAuthed(true);
    window.history.pushState(null, "", "/");
  };

  // [Layout] 미인증 상태 - 인증 레이아웃 표시
  if (!authed) {
    return (
      <AuthLayout
        view={view}
        onGoLogin={() => setView("login")}
        onGoSignup={() => setView("signup")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // [Layout] 인증 상태 - 메인 애플리케이션
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meal" element={<MealPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
