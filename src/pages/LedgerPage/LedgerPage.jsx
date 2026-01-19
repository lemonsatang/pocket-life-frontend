import React, { useState } from "react";
import "./LedgerPage.css";
import DashboardView from "./DashboardView";
import TransactionView from "./TransactionView";

const LedgerPage = () => {
  const [view, setView] = useState("dashboard");

  return (
    <div className="ledger-wrapper">
      <div className="ledger-container">
        <aside className="sidebar">
          <h2 className="brand-logo">포켓 라이프</h2>
          <nav className="side-nav">
            <button
              className={`nav-btn ${view === "dashboard" ? "active" : ""}`}
              onClick={() => setView("dashboard")}
            >
              대시보드
            </button>
            <button
              className={`nav-btn ${view === "transaction" ? "active" : ""}`}
              onClick={() => setView("transaction")}
            >
              거래내역
            </button>
          </nav>
        </aside>

        <main className="main-board">
          {/* 📍 긴 흰색 한 칸 헤더 유지 */}
          <div className="header-single-bar">
            <h1 className="view-title">
              {view === "dashboard" ? "가계부 대시보드" : "가계부 거래내역"}
            </h1>
            <div className="date-badge">2026년 1월</div>
          </div>

          <div className="view-content">
            {view === "dashboard" ? <DashboardView /> : <TransactionView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LedgerPage;
