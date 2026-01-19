import React, { useState } from "react";
import dataApi from "../../api/api"; // 삭제/수정 통신을 위해 필요합니다.

// LedgerPage(부모)로부터 필요한 데이터와 함수들을 상속받습니다.
const TransactionView = ({ txs, fetchTx, incomeSum, expenseSum }) => {
  // --- [1. 상태 관리: 거래내역 화면 안에서만 쓰는 변수들] ---
  const [filter, setFilter] = useState("ALL"); // 전체/수입/지출 필터
  const [sortOrder, setSortOrder] = useState("DESC"); // 최신순/과거순 정렬
  const [editingId, setEditingId] = useState(null); // 수정 중인 항목의 ID
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const itemsPerPage = 7; // 한 페이지에 보여줄 줄 수

  // 입력창(Form)에 타이핑되는 내용을 담는 바구니
  const [form, setForm] = useState({
    txDate: new Date().toISOString().split("T")[0],
    title: "",
    category: "",
    memo: "",
    amount: "",
    type: "EXPENSE",
  });

  // --- [2. 기능 함수: 수정, 삭제, 저장] ---

  // (1) 저장 버튼 클릭 (추가 또는 수정)
  const handleSave = async () => {
    if (!form.amount || !form.title)
      return alert("항목과 금액을 입력해주세요!");
    try {
      const sendData = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await dataApi.put(`/api/tx/${editingId}`, sendData); // 수정
      } else {
        await dataApi.post("/api/tx", sendData); // 새로 저장
      }
      resetForm();
      fetchTx(); // 부모가 가진 목록 새로고침 함수 호출
    } catch (err) {
      alert("저장 실패");
    }
  };

  // (2) 삭제 버튼 클릭
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await dataApi.delete(`/api/tx/${id}`);
      fetchTx();
    } catch (err) {
      alert("삭제 실패");
    }
  };

  // (3) 입력창 초기화
  const resetForm = () => {
    setEditingId(null);
    setForm({
      txDate: new Date().toISOString().split("T")[0],
      title: "",
      category: "",
      memo: "",
      amount: "",
      type: "EXPENSE",
    });
  };

  // --- [3. 데이터 가공: 필터링 및 정렬] ---
  const getProcessedTxs = () => {
    let result = txs.filter((t) =>
      filter === "ALL" ? true : t.type === filter
    );
    result.sort((a, b) => {
      const dateA = new Date(a.txDate);
      const dateB = new Date(b.txDate);
      return sortOrder === "DESC" ? dateB - dateA : dateA - dateB;
    });
    return result;
  };

  const processedTxs = getProcessedTxs();
  const totalPages = Math.ceil(processedTxs.length / itemsPerPage) || 1;
  const currentItems = processedTxs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="tx-view-wrapper" style={{ display: "flex", gap: "20px" }}>
      {/* 📋 왼쪽: 거래 내역 목록 메인 영역 */}
      <div className="pocket-main">
        <div className="main-header">
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>
            가계부 거래내역
          </span>
          <div className="month-badge">2026년 1월</div>
        </div>

        {/* 필터 및 정렬 버튼 */}
        <div className="control-row">
          <div className="filter-row">
            {["ALL", "INCOME", "EXPENSE"].map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => {
                  setFilter(f);
                  setCurrentPage(1);
                }}
              >
                {f === "ALL" ? "전체" : f === "INCOME" ? "수입" : "지출"}
              </button>
            ))}
          </div>
          <select
            className="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="DESC">내림차순</option>
            <option value="ASC">오름차순</option>
          </select>
        </div>

        {/* 거래 목록 테이블 */}
        <table className="tx-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>항목</th>
              <th>카테고리</th>
              <th>비고</th>
              <th>금액</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((t) => (
              <tr key={t.id}>
                <td>{t.txDate.substring(5).replace("-", ".")}</td>
                <td>{t.title}</td>
                <td>
                  <span className="cate-tag">{t.category}</span>
                </td>
                <td>{t.memo || "-"}</td>
                <td className={t.type === "INCOME" ? "txt-plus" : "txt-minus"}>
                  {t.type === "INCOME" ? "+" : "-"}
                  {t.amount.toLocaleString()}원
                </td>
                <td>
                  <button
                    className="btn-row-edit"
                    onClick={() => {
                      setEditingId(t.id);
                      setForm(t);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="btn-row-del"
                    onClick={() => handleDelete(t.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ✍️ 오른쪽: 거래 입력 및 요약 현황 */}
      <aside className="pocket-right">
        {/* 입력 카드 */}
        <div className="card-box">
          <h4 style={{ textAlign: "center", marginTop: 0 }}>거래 내용</h4>
          <div className="type-tabs">
            <button
              className={form.type === "INCOME" ? "active" : ""}
              onClick={() => setForm({ ...form, type: "INCOME" })}
            >
              수입
            </button>
            <button
              className={form.type === "EXPENSE" ? "active" : ""}
              onClick={() => setForm({ ...form, type: "EXPENSE" })}
            >
              지출
            </button>
          </div>
          <input
            type="text"
            placeholder="항목명"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="number"
            placeholder="금액"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            type="text"
            placeholder="카테고리"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            type="date"
            value={form.txDate}
            onChange={(e) => setForm({ ...form, txDate: e.target.value })}
          />
          <input
            type="text"
            placeholder="메모"
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
          />
          <button className="btn-save-main" onClick={handleSave}>
            {editingId ? "수정" : "저장"}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              style={{ width: "100%", marginTop: "5px", cursor: "pointer" }}
            >
              수정 취소
            </button>
          )}
        </div>

        {/* 요약 카드 */}
        <div className="card-box">
          <h4 style={{ textAlign: "center", marginTop: 0 }}>월간 요약</h4>
          <div className="summary-line">
            <span>수입</span>
            <span className="txt-plus">+{incomeSum.toLocaleString()}원</span>
          </div>
          <div className="summary-line">
            <span>지출</span>
            <span className="txt-minus">-{expenseSum.toLocaleString()}원</span>
          </div>
          <div className="summary-line total">
            <span>잔액</span>
            <span>{(incomeSum - expenseSum).toLocaleString()}원</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default TransactionView;
