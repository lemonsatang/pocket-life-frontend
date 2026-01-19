import React, { useEffect, useState } from "react";
import dataApi from "../../api/api"; // 서버와 통신하는 도구
import "./LedgerPage.css"; // 디자인 파일

// ✅ [중요] 아직 이 파일들을 안 만들었기 때문에, 지금은 에러가 날 수 있습니다.
// 다음 단계에서 이 파일들을 하나씩 만들 거예요!
import DashboardView from "./DashboardView";
import TransactionView from "./TransactionView";

const LedgerPage = () => {
  // --- [1. 상태 관리: 데이터와 화면 상태 저장] ---
  const [activeMenu, setActiveMenu] = useState("dashboard"); // 현재 선택된 메뉴 (기본: 대시보드)
  const [txs, setTxs] = useState([]); // 서버에서 받아온 전체 거래 내역 데이터

  // --- [2. 함수: 데이터 가져오기] ---
  // 서버에서 가계부 데이터를 가져오는 함수입니다.
  // 자식 컴포넌트(Dashboard, Transaction)들이 공통으로 쓰기 때문에 여기서 관리합니다.
  const fetchTx = () => {
    dataApi
      .get(`/api/tx?year=2026&month=1`)
      .then((res) => {
        setTxs(res.data || []); // 받아온 데이터를 txs에 저장
      })
      .catch((err) => console.error("데이터 로드 실패:", err));
  };

  // 화면이 처음 열릴 때 데이터를 한 번 가져옵니다.
  useEffect(() => {
    fetchTx();
  }, []);

  // --- [3. 계산: 수입/지출 합계 계산] ---
  // 이 계산값들도 두 화면 모두에서 쓰기 때문에 여기서 한 번만 계산해서 나눠줍니다.
  const incomeSum = txs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expenseSum = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  // --- [4. 렌더링: 화면 그리기] ---
  return (
    <div className="pocket-container">
      {/* 👈 사이드바: 메뉴 버튼들이 있는 곳 */}
      <aside className="pocket-sidebar">
        <div className="side-title">Pocket Life</div>

        {/* 대시보드 버튼 */}
        <button
          className={`side-btn ${activeMenu === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveMenu("dashboard")}
        >
          대시보드
        </button>

        {/* 거래내역 버튼 */}
        <button
          className={`side-btn ${activeMenu === "transaction" ? "active" : ""}`}
          onClick={() => setActiveMenu("transaction")}
        >
          거래내역
        </button>
      </aside>

      {/* 👉 메인 콘텐츠: 메뉴 상태에 따라 다른 파일을 보여줍니다 (조건부 렌더링) */}
      <main className="pocket-main-content">
        {activeMenu === "dashboard" ? (
          // 1. 대시보드 메뉴일 때 보여줄 화면
          <DashboardView
            txs={txs}
            incomeSum={incomeSum}
            expenseSum={expenseSum}
          />
        ) : (
          // 2. 거래내역 메뉴일 때 보여줄 화면
          <TransactionView
            txs={txs}
            fetchTx={fetchTx}
            incomeSum={incomeSum}
            expenseSum={expenseSum}
          />
        )}
      </main>
    </div>
  );
};

export default LedgerPage;
