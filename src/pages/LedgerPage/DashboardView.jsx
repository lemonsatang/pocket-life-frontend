import React from "react";
import "./DashboardView.css"; // 대시보드 내부 요소들의 스타일을 담당하는 CSS

const DashboardView = () => {
  // 1. 샘플 데이터: 화면 하단 '최근 거래' 테이블에 표시될 목록입니다.
  const transactions = [
    {
      date: "01.13",
      item: "급여",
      type: "수입",
      amount: "+1,800,000",
      isIn: true, // 수입인지 지출인지 판별하는 기준 (true: 수입, false: 지출)
    },
    {
      date: "01.15",
      item: "교통",
      type: "지출",
      amount: "-30,000",
      isIn: false,
    },
    {
      date: "01.17",
      item: "식비",
      type: "지출",
      amount: "-45,000",
      isIn: false,
    },
    {
      date: "01.22",
      item: "보험",
      type: "지출",
      amount: "-120,000",
      isIn: false,
    },
  ];

  return (
    /* 전체 대시보드 컨텐츠를 감싸는 최상위 박스 */
    <div className="dash-container">
      {/* 2. 상단 통계 영역: 수입, 지출, 합계 카드 3개가 가로로 배치됨 */}
      <div className="stat-row">
        {/* --- 수입 카드 섹션 --- */}
        <div className="stat-column">
          <div className="stat-label-outside">수입</div>{" "}
          {/* 카드 밖 상단 제목 */}
          <div className="stat-card">
            <div className="card-value">+1,800,000원</div> {/* 메인 금액 */}
            <span className="card-sub-label">이번달</span>{" "}
            {/* 우측 하단 보조 라벨 */}
          </div>
        </div>

        {/* --- 지출 카드 섹션 --- */}
        <div className="stat-column">
          <div className="stat-label-outside">지출</div>
          <div className="stat-card">
            <div className="card-value">-1,450,670원</div>
            <span className="card-sub-label">이번달</span>
          </div>
        </div>

        {/* --- 합계 카드 섹션 --- */}
        <div className="stat-column">
          <div className="stat-label-outside">합계</div>
          <div className="stat-card">
            <div className="card-value">+450,670원</div>
            <span className="card-sub-label">남은금액</span>
          </div>
        </div>
      </div>

      {/* 3. 하단 컨텐츠 영역: 월간 지출 분석과 최근 거래 목록 배치 */}
      <div className="bottom-content-area">
        {/* --- 왼쪽: 월간 지출 섹션 --- */}
        <div className="content-column">
          <div className="outside-header header-left">
            <h3 className="header-title">월간 지출</h3>
            <p className="header-subtitle">카테고리 합계를 날짜별로 보기</p>
          </div>
          <div className="content-card">
            {/* 그래프가 들어갈 핑크색 배경 박스 */}
            <div className="inner-pink-box"></div>
          </div>
        </div>

        {/* --- 오른쪽: 최근 거래 섹션 --- */}
        <div className="content-column">
          {/* 월간 지출 제목과 높이를 맞추기 위한 빈 공간 헤더 */}
          <div className="outside-header" style={{ height: "32px" }}></div>

          <div className="content-card">
            {/* 최근 거래 제목 (하얀 카드 내부 상단 중앙) */}
            <div className="inner-card-header">
              <h3 className="header-title">최근 거래</h3>
            </div>

            {/* 거래 내역 테이블 */}
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>항목</th>
                  <th>구분</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                {/* transactions 배열을 하나씩 돌면서 행(tr)을 생성합니다. */}
                {transactions.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td> {/* 거래 날짜 */}
                    <td className="txt-bold">{item.item}</td>{" "}
                    {/* 항목명 (굵게) */}
                    <td>
                      {/* 수입/지출 여부에 따라 태그의 클래스명을 다르게 부여 (초록/빨강) */}
                      <span className={item.isIn ? "tag-in" : "tag-ex"}>
                        {item.type}
                      </span>
                    </td>
                    <td
                      className="txt-bold"
                      /* 수입이면 초록색(#34a853), 지출이면 빨간색(#ea4335)으로 글자색 지정 */
                      style={{ color: item.isIn ? "#34a853" : "#ea4335" }}
                    >
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
