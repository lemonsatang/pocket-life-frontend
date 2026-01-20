import React, { useState, useEffect } from "react";
import "./LedgerPage.css";
import DashboardView from "./DashboardView";
import TransactionView from "./TransactionView";
import dataApi from "../../api/api"; // 경로 확인 필요

const LedgerPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);

  // [1. 서버에서 test1의 기록 불러오기]
  const fetchTransactions = async () => {
    try {
      // 백엔드 컨트롤러의 @GetMapping("/api/tx")와 일치시킴
      // 현재 날짜 기준 연/월 파라미터를 보낼 수도 있지만, 일단 전체 조회로 시작합니다.
      const response = await dataApi.get("/api/tx");

      /* 백엔드 데이터(Tx)를 프론트엔드 UI용 데이터 형식으로 변환 */
      const mappedData = response.data.map((t) => ({
        id: t.id,
        date: t.txDate.replace(/-/g, ".").slice(5), // "2026-01-25" -> "01.25"
        item: t.title, // 백엔드의 title -> 프론트의 item
        category: t.category,
        memo: t.memo,
        amount: t.amount,
        type: t.type === "INCOME" ? "수입" : "지출", // 백엔드 Enum 대응
        isIn: t.type === "INCOME",
        rawDate: t.txDate, // 원본 날짜 저장
      }));

      setTransactions(mappedData);
    } catch (error) {
      console.error("기록 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // [2. 새로운 내역 추가]
  const handleAddTransaction = async (formData) => {
    try {
      // 백엔드 TxDTO.TxRequest 형식에 맞게 데이터 가공
      const requestData = {
        txDate: formData.date, // "YYYY-MM-DD" 형태여야 함
        title: formData.item,
        category: formData.category,
        memo: formData.memo || "",
        amount: parseInt(formData.amount),
        type: formData.type === "수입" ? "INCOME" : "EXPENSE",
      };

      await dataApi.post("/api/tx", requestData);
      await fetchTransactions(); // 저장 후 새로고침
      setActiveTab("dashboard");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  // [3. 내역 삭제]
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
        <aside className="sidebar">
          <h2 className="brand-logo">Pocket Life</h2>
          <nav className="side-nav">
            <button
              className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              대시보드
            </button>
            <button
              className={`nav-btn ${activeTab === "transaction" ? "active" : ""}`}
              onClick={() => setActiveTab("transaction")}
            >
              거래내역
            </button>
          </nav>
        </aside>

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
