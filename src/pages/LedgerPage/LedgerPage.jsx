import React from "react";
import "./LedgerPage.css";
import DashboardView from "./DashboardView";

const LedgerPage = () => {
  return (
    <div className="ledger-wrapper">
      <div className="ledger-container">
        <aside className="sidebar">
          <h2 className="brand-logo">Pocket Life</h2>
          <nav className="side-nav">
            <button className="nav-btn active">대시보드</button>
            <button className="nav-btn">거래내역</button>
          </nav>
        </aside>

        <main className="main-board">
          <div className="header-single-bar">
            <h1 className="view-title">가계부 대시보드</h1>
            <div className="date-badge">2026년 1월</div>
          </div>
          <div className="view-content">
            <DashboardView />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LedgerPage;
