import React from "react";
import "./TransactionView.css";

const TransactionView = () => {
  return (
    <div className="trans-root">
      <div className="trans-table-area white-card">
        <div className="filter-tabs">
          <button className="tab active">전체</button>
          <button className="tab">수입</button>
          <button className="tab">지출</button>
        </div>
        <table className="main-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>항목</th>
              <th>카테고리</th>
              <th>금액</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>01.19</td>
              <td>담배</td>
              <td>기타</td>
              <td>-5,000원</td>
              <td>수정/삭제</td>
            </tr>
            <tr>
              <td>01.19</td>
              <td>강아지용품</td>
              <td>반려용품</td>
              <td>-10,000원</td>
              <td>수정/삭제</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="trans-side-form">
        <div className="form-card white-card">
          <h4>거래 내용</h4>
          <input type="text" placeholder="항목명" />
          <input type="number" placeholder="금액" />
          <input type="text" placeholder="카테고리" />
          <textarea placeholder="메모"></textarea>
          <button className="save-btn">저장</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionView;
