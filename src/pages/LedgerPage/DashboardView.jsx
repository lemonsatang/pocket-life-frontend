import React from "react";
import "./DashboardView.css";

/* 📍 부모(LedgerPage)로부터 실시간 데이터를 받아옵니다. */
const DashboardView = ({ transactions = [] }) => {
  /* [로직 1] 상단 카드용 합계 계산 */
  const totalIncome = transactions
    .filter((t) => t.isIn)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => !t.isIn)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  const formatNumber = (num) => num.toLocaleString();

  /* [로직 2] 최근 거래 4건만 추출 (수정 포인트)
     - 원본 배열을 복사([...transactions])하여 날짜/ID 순으로 정렬합니다.
     - .slice(0, 4)를 사용하여 상위 4개만 가져옵니다.
  */
  const recentTransactions = [...transactions]
    .sort((a, b) => {
      // 날짜가 같으면 id 기준 내림차순, 다르면 날짜 기준 내림차순
      if (b.date === a.date) return (b.id || 0) - (a.id || 0);
      return b.date.localeCompare(a.date);
    })
    .slice(0, 4);

  return (
    <div className="dash-container">
      {/* --- [상단 통계 영역] --- */}
      <div className="stat-row">
        <div className="stat-column">
          <div className="stat-label-outside">수입</div>
          <div className="stat-card">
            <div className="card-value">+{formatNumber(totalIncome)}원</div>
            <span className="card-sub-label">이번달</span>
          </div>
        </div>

        <div className="stat-column">
          <div className="stat-label-outside">지출</div>
          <div className="stat-card">
            <div className="card-value">-{formatNumber(totalExpense)}원</div>
            <span className="card-sub-label">이번달</span>
          </div>
        </div>

        <div className="stat-column">
          <div className="stat-label-outside">합계</div>
          <div className="stat-card">
            <div className="card-value">
              {totalBalance >= 0 ? "+" : ""}
              {formatNumber(totalBalance)}원
            </div>
            <span className="card-sub-label">남은금액</span>
          </div>
        </div>
      </div>

      {/* --- [하단 컨텐츠 영역] --- */}
      <div className="bottom-content-area">
        {/* 왼쪽: 월간 지출 분석 섹션 (SVG 그래프) */}
        <div className="content-column">
          <div className="outside-header header-left">
            <h3 className="header-title">월간 지출</h3>
            <p className="header-subtitle">카테고리 합계를 날짜별로 보기</p>
          </div>
          <div className="content-card">
            <div className="inner-pink-box">
              <svg
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%" }}
              >
                {[40, 80, 120, 160].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="400"
                    y2={y}
                    stroke="#f4b5c1"
                    strokeWidth="1"
                  />
                ))}
                <path
                  d="M 50,170 C 100,50 150,130 215,85 C 250,60 260,140 285,125 C 310,110 340,30 370,50"
                  fill="none"
                  stroke="#ff0000"
                  strokeWidth="3"
                />
                <circle cx="50" cy="170" r="5" fill="black" />
                <circle cx="120" cy="100" r="5" fill="black" />
                <circle cx="215" cy="85" r="5" fill="black" />
                <circle cx="285" cy="125" r="5" fill="black" />
                <circle cx="370" cy="50" r="5" fill="black" />
              </svg>
            </div>
          </div>
        </div>

        {/* 오른쪽: 최근 거래 목록 섹션 (여기서 4건만 노출) */}
        <div className="content-column">
          <div className="outside-header" style={{ height: "32px" }}></div>
          <div className="content-card">
            <div className="inner-card-header">
              <h3 className="header-title">최근 거래</h3>
            </div>
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
                {recentTransactions.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.date}</td>
                    <td className="txt-bold">{item.item}</td>
                    <td>
                      <span className={item.isIn ? "tag-in" : "tag-ex"}>
                        {item.type}
                      </span>
                    </td>
                    <td
                      className="txt-bold"
                      style={{ color: item.isIn ? "#34a853" : "#ea4335" }}
                    >
                      {item.isIn ? "+" : "-"}
                      {formatNumber(item.amount)}
                    </td>
                  </tr>
                ))}
                {/* 데이터가 4개보다 적을 때 레이아웃 유지를 위한 빈 행 처리 (선택) */}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ color: "#ccc", padding: "20px" }}>
                      거래 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
