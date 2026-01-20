import React, { useState, useEffect } from "react";
import "./LedgerPage.css";
import DashboardView from "./DashboardView";
import TransactionView from "./TransactionView";
import dataApi from "../../api/api"; // 경로 확인 필요

const LedgerPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);

  // [1. 서버에서 거래 기록 불러오기]
  const fetchTransactions = async () => {
    try {
      // 백엔드 전체 조회 API 호출
      const response = await dataApi.get("/api/tx");

      /* 백엔드 데이터를 프론트엔드 UI 형식으로 변환 */
      const mappedData = response.data.map((t) => ({
        id: t.id,
        date: t.txDate.replace(/-/g, ".").slice(5), // "2026-01-25" -> "01.25"
        item: t.title,
        category: t.category,
        memo: t.memo,
        amount: t.amount,
        type: t.type === "INCOME" ? "수입" : "지출",
        isIn: t.type === "INCOME",
        rawDate: t.txDate,
      }));

      setTransactions(mappedData);
    } catch (error) {
      console.error("기록 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // [2. 새로운 내역 추가 함수]
  const handleAddTransaction = async (formData) => {
    try {
      const requestData = {
        txDate: formData.date,
        title: formData.item,
        category: formData.category,
        memo: formData.memo || "",
        amount: parseInt(formData.amount),
        type: formData.type === "수입" ? "INCOME" : "EXPENSE",
      };

      await dataApi.post("/api/tx", requestData);
      await fetchTransactions(); // 저장 후 목록 새로고침
      setActiveTab("dashboard"); // 저장 후 대시보드로 이동
    } catch (error) {
      console.error("저장 실패:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  // [3. 내역 삭제 함수]
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await dataApi.delete(`/api/tx/${id}`);
      await fetchTransactions();
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  return (
    <div className="ledger-wrapper">
      <div className="ledger-container">
        {/* --- 왼쪽 사이드바 영역 --- */}
        <aside className="sidebar">
          <h2 className="brand-logo">Pocket Life</h2>
          <nav className="side-nav">
            {/* [📍 스타일 수정 포인트] 
               선택됨(active): 하얀 바탕 + 보라색 글자
               선택 안됨: 보라색 바탕 + 하얀 글자 
            */}
            <button
              className={`nav-btn ${activeTab === "dashboard" ? "active-white" : "inactive-purple"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              대시보드
            </button>
            <button
              className={`nav-btn ${activeTab === "transaction" ? "active-white" : "inactive-purple"}`}
              onClick={() => setActiveTab("transaction")}
            >
              거래내역
            </button>
          </nav>
        </aside>

        {/* --- 오른쪽 메인 콘텐츠 영역 --- */}
        <main className="main-board">
          <div className="header-single-bar">
            <h1 className="view-title">
              {activeTab === "dashboard" ? "가계부 대시보드" : "거래내역 기록"}
            </h1>
            <div className="date-badge">2026년 1월</div>
          </div>

          <div className="view-content">
            {activeTab === "dashboard" ? (
              <DashboardView transactions={transactions} />
            ) : (
              <TransactionView
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LedgerPage;
