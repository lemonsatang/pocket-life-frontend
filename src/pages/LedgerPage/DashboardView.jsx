import React from "react";
import "./DashboardView.css";

const DashboardView = () => {
  return (
    <div className="dash-container">
      {/* 상단 3개 카드 (디자인 유지) */}
      <div className="stat-row">
        <div className="stat-card-white">
          <span className="card-tag-top">수입</span>
          <div className="card-amount-black">+1,800,000원</div>
          <span className="card-tag-bottom">이번달</span>
        </div>
        <div className="stat-card-white">
          <span className="card-tag-top">지출</span>
          <div className="card-amount-black">-1,450,670원</div>
          <span className="card-tag-bottom">이번달</span>
        </div>
        <div className="stat-card-white">
          <span className="card-tag-top">합계</span>
          <div className="card-amount-black">+450,670원</div>
          <span className="card-tag-bottom">남은금액</span>
        </div>
      </div>

      {/* 하단 섹션: 텍스트 위치 수정 */}
      <div className="bottom-row">
        <div className="bottom-white-box">
          {/* 📍 텍스트를 칸의 최상단에 배치 */}
          <div className="section-header-text">
            <h3 className="section-title">월간 지출</h3>
            <p className="section-sub">카테고리 합계를 날짜별로 보기</p>
          </div>
          {/* 아래에 붉은 박스 배치 */}
          <div className="inner-red-box"></div>
        </div>

        <div className="bottom-white-box">
          <h3 className="section-title-center">최근 거래</h3>
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
              <tr>
                <td>01.13</td>
                <td>급여</td>
                <td>
                  <span className="badge-in">수입</span>
                </td>
                <td className="row-amount-black">+1,800,000</td>
              </tr>
              <tr>
                <td>01.15</td>
                <td>교통</td>
                <td>
                  <span className="badge-ex">지출</span>
                </td>
                <td className="row-amount-black">-30,000</td>
              </tr>
              <tr>
                <td>01.17</td>
                <td>식비</td>
                <td>
                  <span className="badge-ex">지출</span>
                </td>
                <td className="row-amount-black">-45,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
