import React from "react";
import "./DashboardView.css";
// 📍 그래프 가로선을 위한 CartesianGrid 포함
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const DashboardView = ({ transactions }) => {
  // [1. 그래프용 데이터 계산: 날짜별 지출 합산]
  const chartData = transactions
    .filter((t) => t.type === "지출")
    .reduce((acc, t) => {
      const found = acc.find((item) => item.date === t.date);
      if (found) found.amount += t.amount;
      else acc.push({ date: t.date, amount: t.amount });
      return acc;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date));

  // [2. 상단 요약 수치 계산]
  const income = transactions
    .filter((t) => t.type === "수입")
    .reduce((s, t) => s + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "지출")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="dash-container">
      {/* --- 상단 수치 섹션 --- */}
      <div className="stat-row">
        <div className="stat-group">
          <span className="outside-label">수입</span>
          <div className="stat-card">
            <div className="card-value">+{income.toLocaleString()}원</div>
            <span className="card-sub-label">이번달</span>
          </div>
        </div>

        <div className="stat-group">
          <span className="outside-label">지출</span>
          <div className="stat-card">
            <div className="card-value">-{expense.toLocaleString()}원</div>
            <span className="card-sub-label">이번달</span>
          </div>
        </div>

        <div className="stat-group">
          <span className="outside-label">합계</span>
          <div className="stat-card">
            <div className="card-value">
              {(income - expense).toLocaleString()}원
            </div>
            <span className="card-sub-label">남은금액</span>
          </div>
        </div>
      </div>

      {/* --- 하단 콘텐츠 영역 --- */}
      <div className="bottom-content-area">
        {/* 월간 지출 그래프 섹션 */}
        <div className="content-section">
          <div className="outside-header">
            <h3>월간 지출</h3>
            <span className="header-subtitle">
              카테고리 합계를 날짜별로 보기
            </span>
          </div>
          <div className="inner-pink-box">
            <div className="graph-white-card">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 25, right: 30, left: 30, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="0"
                      vertical={false}
                      stroke="#eee"
                    />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip formatter={(val) => `${val.toLocaleString()}원`} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#ff4d4f"
                      strokeWidth={4}
                      dot={{ r: 6, fill: "#000", strokeWidth: 0 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* 📍 최근 거래 섹션: 제목을 하얀 카드 내부 상단 중앙으로 이동 */}
        <div className="content-section">
          {/* 하얀 카드 시작 */}
          <div className="content-card">
            {/* 📍 제목을 카드 내부 상단 중앙에 배치 */}
            <h3 className="inner-card-title">최근 거래</h3>

            <table className="transaction-table">
              <thead>
                <tr className="table-header-row">
                  <th>날짜</th>
                  <th>항목</th>
                  <th>구분</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 4).map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td className="txt-bold">{t.item}</td>
                    <td>
                      <span className={t.type === "수입" ? "tag-in" : "tag-ex"}>
                        {t.type}
                      </span>
                    </td>
                    <td
                      className={
                        t.type === "수입" ? "plus-color" : "minus-color"
                      }
                    >
                      {t.type === "수입" ? "+" : "-"}
                      {t.amount.toLocaleString()}
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
