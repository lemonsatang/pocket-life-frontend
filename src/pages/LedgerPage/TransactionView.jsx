import React, { useState } from "react";
import "./TransactionView.css";

/* 가계부 거래 내역을 보여주고, 필터링 및 정렬 기능을 제공하는 컴포넌트입니다. */
const TransactionView = ({
  transactions = [],
  onAddTransaction,
  onDeleteTransaction,
}) => {
  /* [1. 입력 필드 상태 관리] */
  const [type, setType] = useState("지출");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  /* [2. 조회 조건 상태 관리] */
  const [filter, setFilter] = useState("전체"); // 필터: 전체/수입/지출
  const [sortOrder, setSortOrder] = useState("desc"); // 정렬: 최신순(desc)/오래된순(asc)

  /* [3. 페이징 상태 관리] */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 한 페이지에 노출할 행 수

  /* [4. 필터링 로직] - 사용자가 선택한 버튼(전체/수입/지출)에 따라 데이터 선별 */
  const filteredTransactions = transactions.filter((t) => {
    if (filter === "수입") return t.isIn === true;
    if (filter === "지출") return t.isIn === false;
    return true;
  });

  /* [5. 정렬 로직] - 날짜를 기준으로 사용자가 선택한 순서대로 정렬 */
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  /* [6. 페이징 처리] - 필터링 및 정렬이 완료된 데이터에서 현재 페이지 분량만 추출 */
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const currentItems = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* [7. 새로운 거래 저장 함수] */
  const handleSave = () => {
    if (!amount || !category || !date || !title) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    onAddTransaction({
      date,
      item: title,
      category,
      memo: memo || "-",
      amount: parseInt(amount),
      type,
    });
    // 저장 후 입력창 초기화
    setAmount("");
    setCategory("");
    setDate("");
    setTitle("");
    setMemo("");
  };

  /* [8. 요약 수치 계산] */
  const totalIncome = transactions
    .filter((t) => t.isIn)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => !t.isIn)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="transaction-view-container">
      {/* --- 왼쪽 패널: 내역 목록 --- */}
      <div className="left-transaction-panel">
        {/* 📍 상단 바: 정렬창과 필터 버튼을 같은 높이(위치)의 왼편에 배치 */}
        <div className="table-top-bar">
          <div className="top-controls-left-group">
            {/* 정렬 선택 (가장 왼쪽에 위치) */}
            <select
              className="top-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">최신순</option>
              <option value="asc">오래된순</option>
            </select>

            {/* 필터 버튼들 (정렬창 바로 오른쪽에 위치) */}
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === "전체" ? "active" : ""}`}
                onClick={() => {
                  setFilter("전체");
                  setCurrentPage(1);
                }}
              >
                전체
              </button>
              <button
                className={`filter-btn ${filter === "수입" ? "active" : ""}`}
                onClick={() => {
                  setFilter("수입");
                  setCurrentPage(1);
                }}
              >
                수입
              </button>
              <button
                className={`filter-btn ${filter === "지출" ? "active" : ""}`}
                onClick={() => {
                  setFilter("지출");
                  setCurrentPage(1);
                }}
              >
                지출
              </button>
            </div>
          </div>
        </div>

        <div className="transaction-list-card">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>항목</th>
                <th>카테고리</th>
                <th>비고</th>
                <th>금액</th>
                <th>수정/삭제</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((t) => (
                <tr key={t.id}>
                  <td className="td-narrow">{t.date}</td>
                  <td className="text-bold td-narrow">{t.item}</td>
                  <td className="td-narrow">
                    <span className="category-badge">{t.category}</span>
                  </td>
                  <td className="text-memo td-narrow">{t.memo}</td>
                  <td
                    className={`text-bold td-narrow ${t.isIn ? "plus-color" : "minus-color"}`}
                  >
                    {t.isIn ? "+" : "-"}
                    {t.amount.toLocaleString()}원
                  </td>
                  <td className="td-narrow">
                    <div className="action-button-group">
                      <button className="pill-btn edit-pill">수정</button>
                      <button
                        className="pill-btn delete-pill"
                        onClick={() => onDeleteTransaction(t.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이징 네비게이션 */}
          <div className="pagination-container">
            <button
              className="page-nav-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-num-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-nav-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* --- 오른쪽 패널: 입력 및 요약 --- */}
      <div className="right-input-panel">
        <div className="side-card input-section">
          <h3 className="card-header-title">거래내용</h3>
          <div className="type-selector">
            <button
              className={type === "수입" ? "active" : ""}
              onClick={() => setType("수입")}
            >
              수입
            </button>
            <button
              className={type === "지출" ? "active" : ""}
              onClick={() => setType("지출")}
            >
              지출
            </button>
          </div>
          <div className="input-form">
            <input
              type="number"
              placeholder="금액"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              type="text"
              placeholder="항목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="카테고리"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="메모"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
          <button className="submit-save-btn" onClick={handleSave}>
            저장하기
          </button>
        </div>

        <div className="side-card summary-section">
          <h3 className="card-header-title">요약</h3>
          <div className="summary-row">
            <span>수입</span>
            <span className="plus-color">
              +{totalIncome.toLocaleString()}원
            </span>
          </div>
          <div className="summary-row">
            <span>지출</span>
            <span className="minus-color">
              -{totalExpense.toLocaleString()}원
            </span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total-row">
            <span>남은금액</span>
            <span className="text-bold">
              {(totalIncome - totalExpense).toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionView;
