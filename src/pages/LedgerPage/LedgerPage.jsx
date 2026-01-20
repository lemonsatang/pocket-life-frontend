import React, { useState, useEffect } from "react";
import "./LedgerPage.css";
import DashboardView from "./DashboardView";
import TransactionView from "./TransactionView";
import dataApi from "../../api/api";
// 📍 월 선택을 위한 DatePicker 라이브러리 추가 (이미 설치되어 있는 것 활용)
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("ko", ko);

const LedgerPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  // 📍 [추가] 현재 보고 있는 기준 월 상태 (기본값: 오늘 날짜의 월)
  const [viewDate, setViewDate] = useState(new Date());

  // [1. 서버에서 거래 기록 불러오기]
  const fetchTransactions = async () => {
    try {
      const response = await dataApi.get("/api/tx");

      const mappedData = response.data.map((t) => ({
        id: t.id,
        date: t.txDate.replace(/-/g, ".").slice(5),
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
      await fetchTransactions();
      setActiveTab("dashboard");
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

  // 📍 [4. 필터링 로직] 현재 선택된 월(viewDate)에 해당하는 데이터만 추출
  const currentMonthStr = viewDate.toISOString().substring(0, 7); // "2026-01" 형식
  const monthlyTransactions = transactions.filter((t) =>
    t.rawDate.startsWith(currentMonthStr),
  );

  return (
    <div className="ledger-wrapper">
      <div className="ledger-container">
        {/* 사이드바 영역 */}
        <aside className="sidebar">
          <h2 className="brand-logo">Pocket Life</h2>
          <nav className="side-nav">
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

        {/* 메인 콘텐츠 영역 */}
        <main className="main-board">
          <div className="header-single-bar">
            <h1 className="view-title">
              {activeTab === "dashboard" ? "가계부 대시보드" : "거래내역 기록"}
            </h1>

            {/* 📍 [수정] 날짜 배지를 클릭하면 월을 선택할 수 있는 기능 추가 */}
            <div className="date-badge-wrapper">
              <DatePicker
                selected={viewDate}
                onChange={(date) => setViewDate(date)}
                dateFormat="yyyy년 MM월"
                showMonthYearPicker // 월/년 선택 모드 활성화
                locale="ko"
                customInput={
                  <div className="date-badge" style={{ cursor: "pointer" }}>
                    {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월 ▾
                  </div>
                }
              />
            </div>
          </div>

          <div className="view-content">
            {activeTab === "dashboard" ? (
              // 📍 필터링된 월간 데이터를 하위 컴포넌트에 전달
              <DashboardView transactions={monthlyTransactions} />
            ) : (
              <TransactionView
                transactions={monthlyTransactions}
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
