import React from "react";
import "./DashboardView.css";

const DashboardView = () => {
  /* [데이터 관리] 실제 테이블과 그래프에 표시될 거래 내역입니다. */
  const transactions = [
    { date: "01.10", item: "용돈", type: "수입", amount: 1575000, isIn: true },
    { date: "01.15", item: "교통비", type: "지출", amount: 38000, isIn: false },
    { date: "01.17", item: "식비", type: "지출", amount: 100000, isIn: false },
    { date: "01.20", item: "편의점", type: "지출", amount: 20000, isIn: false },
  ];

  /* [금액 계산] 상단 카드에 들어갈 합산 수치들입니다. */
  const totalIncome = transactions
    .filter((t) => t.isIn)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => !t.isIn)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  /* [숫자 포맷] 세 자리마다 콤마를 찍어줍니다. */
  const formatNumber = (num) => num.toLocaleString();

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
            <div className="card-value">+{formatNumber(totalBalance)}원</div>
            {/* 시안 요청대로 '남은금액' 라벨 유지 */}
            <span className="card-sub-label">남은금액</span>
          </div>
        </div>
      </div>

      {/* --- [하단 컨텐츠 영역] 칸 사이즈 280px 절대 유지 --- */}
      <div className="bottom-content-area">
        {/* 왼쪽: 월간 지출 분석 섹션 */}
        <div className="content-column">
          <div className="outside-header header-left">
            <h3 className="header-title">월간 지출</h3>
            {/* 📍 요청사항: 서브텍스트 글자 크기는 CSS에서 .header-subtitle로 줄였습니다. */}
            <p className="header-subtitle">카테고리 합계를 날짜별로 보기</p>
          </div>
          <div className="content-card">
            <div className="inner-pink-box">
              {/* 📍 핑크 박스 내부: 곡선이 점을 정확히 통과하도록 좌표를 정밀 매칭했습니다. */}
              <svg
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%" }}
              >
                {/* 배경 가이드 라인 (연한 핑크) */}
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
                {/* 📍 곡선(Path): 각 데이터 점(Circle)의 좌표를 부드럽게 연결하도록 설계 */}
                <path
                  d="M 50,170 C 100,50 150,130 215,85 C 250,60 260,140 285,125 C 310,110 340,30 370,50"
                  fill="none"
                  stroke="#ff0000"
                  strokeWidth="3"
                />
                {/* 📍 데이터 포인트 (검은 점): 위 path 경로의 굴곡점과 100% 일치시킴 */}
                <circle cx="50" cy="170" r="5" fill="black" /> {/* 점 1 */}
                <circle cx="120" cy="100" r="5" fill="black" /> {/* 점 2 */}
                <circle cx="215" cy="85" r="5" fill="black" /> {/* 점 3 */}
                <circle cx="285" cy="125" r="5" fill="black" /> {/* 점 4 */}
                <circle cx="370" cy="50" r="5" fill="black" /> {/* 점 5 */}
              </svg>
            </div>
          </div>
        </div>

        {/* 오른쪽: 최근 거래 목록 섹션 */}
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
                {transactions.map((item, index) => (
                  <tr key={index}>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
