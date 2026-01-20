import React, { useState } from "react";
import "./LedgerPage.css"; // 전체 레이아웃 스타일
import DashboardView from "./DashboardView"; // 대시보드 화면
import TransactionView from "./TransactionView"; // 내역을 입력할 수 있는 새로운 화면

const LedgerPage = () => {
  /* [1. 화면 전환 상태 관리] 
    - activeTab이 'dashboard'이면 대시보드 화면을 보여줍니다.
    - activeTab이 'transaction'이면 거래내역 입력 화면을 보여줍니다.
  */
  const [activeTab, setActiveTab] = useState("dashboard");

  /* [2. 전체 가계부 데이터 저장소] 
    - 이 데이터가 대시보드와 입력창 양쪽으로 전달됩니다.
    - 여기서 데이터를 관리해야 입력창에서 저장한 데이터가 대시보드에 바로 반영됩니다.
  */
  const [transactions, setTransactions] = useState([
    { date: "01.10", item: "용돈", type: "수입", amount: 1575000, isIn: true },
    { date: "01.15", item: "교통비", type: "지출", amount: 38000, isIn: false },
    { date: "01.17", item: "식비", type: "지출", amount: 100000, isIn: false },
    { date: "01.20", item: "편의점", type: "지출", amount: 20000, isIn: false },
  ]);

  /* [3. 새로운 내역 추가 함수] 
    - TransactionView(입력창)에서 '저장'을 누르면 실행되는 함수입니다.
    - newData: 사용자가 입력한 새로운 수입/지출 정보
  */
  const handleAddTransaction = (newData) => {
    // 1. 기존 데이터(transactions) 앞에 새로운 데이터(newData)를 붙여서 업데이트합니다.
    setTransactions([newData, ...transactions]);

    // 2. 저장이 완료되면 사용자가 결과를 바로 볼 수 있게 '대시보드' 화면으로 강제 이동시킵니다.
    setActiveTab("dashboard");
  };

  return (
    <div className="ledger-wrapper">
      <div className="ledger-container">
        {/* --- 왼쪽 사이드바 영역 (메뉴 선택) --- */}
        <aside className="sidebar">
          <h2 className="brand-logo">Pocket Life</h2>

          <nav className="side-nav">
            {/* [대시보드 버튼] 
              - 현재 activeTab이 'dashboard'라면 'active' 클래스를 붙여서 보라색으로 강조합니다.
              - 클릭하면 화면 모드를 'dashboard'로 바꿉니다.
            */}
            <button
              className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              대시보드
            </button>

            {/* [거래내역 버튼] 
              - 클릭하면 화면 모드를 'transaction'으로 바꿉니다.
            */}
            <button
              className={`nav-btn ${activeTab === "transaction" ? "active" : ""}`}
              onClick={() => setActiveTab("transaction")}
            >
              거래내역
            </button>
          </nav>
        </aside>

        {/* --- 오른쪽 메인 보드 영역 (내용 표시) --- */}
        <main className="main-board">
          {/* 상단 타이틀 바: 현재 어떤 화면인지 제목을 보여줍니다. */}
          <div className="header-single-bar">
            <h1 className="view-title">
              {activeTab === "dashboard" ? "가계부 대시보드" : "거래내역 기록"}
            </h1>
            <div className="date-badge">2026년 1월</div>
          </div>

          {/* 메인 뷰 내용 영역: activeTab 값에 따라 보여주는 컴포넌트가 달라집니다. */}
          <div className="view-content">
            {activeTab === "dashboard" ? (
              /* [대시보드 모드] 
                - 위에서 만든 'transactions' 데이터를 props로 전달합니다. 
                - 대시보드는 이 데이터를 받아서 합계와 그래프를 그립니다.
              */
              <DashboardView transactions={transactions} />
            ) : (
              /* [거래내역 모드] 
                - 데이터를 추가할 수 있는 'handleAddTransaction' 함수를 전달합니다.
              */
              <TransactionView onAddTransaction={handleAddTransaction} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LedgerPage;
