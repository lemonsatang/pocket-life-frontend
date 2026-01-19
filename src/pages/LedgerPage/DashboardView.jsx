import React from "react";
// ✅ 그래프를 그리기 위한 도구들을 가져옵니다.
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// LedgerPage(부모)로부터 필요한 데이터(txs, incomeSum 등)를 받아옵니다.
const DashboardView = ({ txs, incomeSum, expenseSum }) => {
  // --- [1. 데이터 가공하기] ---

  // (1) 남은 금액(합계) 계산
  const totalBalance = incomeSum - expenseSum;

  // (2) 최근 거래 내역 4건만 뽑기
  const recentTxs = [...txs]
    .sort((a, b) => new Date(b.txDate) - new Date(a.txDate)) // 날짜순 정렬
    .slice(0, 4); // 앞에서 4개만 싹둑!

  // (3) 그래프용 데이터 만들기 (날짜별 지출 합계)
  const chartData = txs
    .filter((t) => t.type === "EXPENSE") // 지출만 골라내서
    .reduce((acc, cur) => {
      const date = cur.txDate.substring(8, 10); // "2026-01-15"에서 "15"일만 가져오기
      const found = acc.find((item) => item.date === date);
      if (found) found.amount += cur.amount; // 같은 날짜가 있으면 금액 더하기
      else acc.push({ date, amount: cur.amount }); // 없으면 새로 추가
      return acc;
    }, [])
    .sort((a, b) => a.date - b.date); // 날짜순으로 그래프 정렬

  return (
    <div className="dashboard-wrapper">
      <div className="main-header">
        <span style={{ fontSize: "20px", fontWeight: "bold" }}>
          가계부 대시보드
        </span>
        <div className="month-badge">2026년 1월</div>
      </div>

      {/* 💳 상단 요약 카드 영역 (시안의 수입/지출/합계 박스) */}
      <div className="dash-card-row">
        <div className="dash-card">
          <span className="card-label">수입</span>
          <div className="card-value">+{incomeSum.toLocaleString()}원</div>
          <span className="card-sub">이번달</span>
        </div>
        <div className="dash-card">
          <span className="card-label">지출</span>
          <div className="card-value">-{expenseSum.toLocaleString()}원</div>
          <span className="card-sub">이번달</span>
        </div>
        <div className="dash-card highlight-card">
          <span className="card-label">합계</span>
          <div className="card-value">+{totalBalance.toLocaleString()}원</div>
          <span className="card-sub">남은금액</span>
        </div>
      </div>

      {/* 📊 하단 영역 (그래프와 최근 거래) */}
      <div className="dash-bottom-row">
        {/* 왼쪽: 월간 지출 그래프 */}
        <div className="dash-chart-box">
          <h4>월간 지출</h4>
          <p className="chart-desc">날짜별 지출 흐름을 확인하세요</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                {/* 시안의 붉은색 곡선을 그리는 부분 */}
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#ff4d4d"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#333" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 오른쪽: 최근 거래 목록 */}
        <div className="dash-recent-box">
          <h4>최근 거래</h4>
          <table className="recent-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>항목</th>
                <th>구분</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {recentTxs.map((t) => (
                <tr key={t.id}>
                  <td>{t.txDate.substring(5).replace("-", ".")}</td>
                  <td>{t.title}</td>
                  <td>
                    <span
                      className={`mini-tag ${
                        t.type === "INCOME" ? "is-in" : "is-out"
                      }`}
                    >
                      {t.type === "INCOME" ? "수입" : "지출"}
                    </span>
                  </td>
                  <td
                    className={t.type === "INCOME" ? "txt-plus" : "txt-minus"}
                  >
                    {t.amount.toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
