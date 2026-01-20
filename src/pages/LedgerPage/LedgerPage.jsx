import React from "react";
import "./LedgerPage.css"; // 가계부 페이지 전체 레이아웃 스타일링 시트
import DashboardView from "./DashboardView"; // 중앙에 보여줄 대시보드 화면 컴포넌트

const LedgerPage = () => {
  return (
    /* 1. 최상위 컨테이너: 배경색 및 화면 전체 높이 설정 */
    <div className="ledger-wrapper">
      {/* 2. 메인 컨텐츠 영역: 사이드바와 메인 보드를 가로로 배치 */}
      <div className="ledger-container">
        {/* --- 왼쪽 사이드바 영역 --- */}
        <aside className="sidebar">
          {/* 브랜드 로고 */}
          <h2 className="brand-logo">Pocket Life</h2>

          {/* 메뉴 버튼 리스트 */}
          <nav className="side-nav">
            {/* 현재 선택된 메뉴에 'active' 클래스를 주어 강조 표시 */}
            <button className="nav-btn active">대시보드</button>
            <button className="nav-btn">거래내역</button>
          </nav>
        </aside>

        {/* --- 오른쪽 메인 보드 영역 --- */}
        <main className="main-board">
          {/* 상단 타이틀 바: 제목과 날짜 정보가 들어있는 하얀색 바 */}
          <div className="header-single-bar">
            {/* 현재 페이지 이름 (수정하신 18px 폰트 크기 적용 지점) */}
            <h1 className="view-title">가계부 대시보드</h1>

            {/* 날짜 표시 배지 (수정하신 보라색 배지 부분) */}
            <div className="date-badge">2026년 1월</div>
          </div>

          {/* 메인 뷰 내용 영역: 실제 데이터(수입/지출/거래내역 등)가 표시됨 */}
          <div className="view-content">
            {/* 이 자리에 이전에 작업한 DashboardView.jsx의 내용이 렌더링됩니다. */}
            <DashboardView />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LedgerPage;
