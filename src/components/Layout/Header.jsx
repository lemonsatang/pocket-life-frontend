// [Layout] 헤더 컴포넌트 - 공통 네비게이션 바
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import { jwtDecode } from "jwt-decode";

const Header = ({ onLogout }) => {
  const location = useLocation();
  const path = location.pathname;
  const [username, setUsername] = useState("");

  useEffect(() => {
    // [수정 2026-01-13 12:40] sessionStorage로 변경
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        // Bearer 제외하고 토큰만 추출하여 해석
        const decoded = jwtDecode(token.replace("Bearer ", ""));
        setUsername(decoded.username);
      } catch (err) {
        console.error("토큰 해석 에러:", err);
      }
    } else {
      console.error("토큰 해석 에러:", err);
    }
  });

  return (
    <nav className="pixel-nav-container">
      <div className="pixel-nav-bar">
        <Link to="/" className="nav-logo-small">
          <span className="logo-text">Pocket Life</span>
        </Link>

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
          <div className="nav-divider"></div>
          <Link
            to="/stats"
            className={`nav-tab ${path === "/stats" ? "active" : ""}`}
          >
            통계
          </Link>
        </div>

        <div className="nav-user-actions">
          <div className="nav-user-info">
            {username ? `${username} 님` : "사용자 님"} 반갑습니다.
          </div>
          <button className="logoutBtn" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
