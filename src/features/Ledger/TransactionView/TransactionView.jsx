import React, { useState } from "react";
import "./TransactionView.css";
import dataApi from "../../../api/api";

const TransactionView = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  // [1. 상태 관리]
  const [filter, setFilter] = useState("전체"); // 필터 상태 (전체/수입/지출)
  const [sortOrder, setSortOrder] = useState("latest"); // 정렬 상태 (최신순/과거순)
  const [editingId, setEditingId] = useState(null); // 수정 중인 항목 ID (null이면 신규 입력)
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const itemsPerPage = 10; // 한 페이지에 보여줄 내역 수

  // 입력 폼 상태 (이미지 UI에 맞춰 필드 구성)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    item: "",
    category: "",
    amount: "",
    type: "지출", // 기본은 '지출' 버튼 활성화
    memo: "",
  });

  // [2. 수정 버튼 클릭 시 실행: 선택한 데이터를 폼으로 가져오기]
  const handleEditClick = (tx) => {
    setEditingId(tx.id); // 수정 모드 전환
    setFormData({
      date: tx.rawDate, // YYYY-MM-DD 원본 날짜
      item: tx.item,
      category: tx.category,
      amount: tx.amount.toString(),
      type: tx.type, // '수입' 또는 '지출'
      memo: tx.memo || "",
    });
  };

  // [3. 폼 입력값 변경 핸들러]
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // [4. 저장(수정/추가) 실행 함수]
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.amount) {
      alert("항목과 금액을 입력해주세요.");
      return;
    }

    try {
      if (editingId) {
        // --- 📍 수정 모드일 때 (PUT 요청) ---
        const updateData = {
          txDate: formData.date,
          title: formData.item,
          category: formData.category,
          memo: formData.memo,
          amount: parseInt(formData.amount),
          type: formData.type === "수입" ? "INCOME" : "EXPENSE",
        };
        await dataApi.put(`/api/tx/${editingId}`, updateData);
        alert("수정이 완료되었습니다.");
        setEditingId(null);
        window.location.reload(); // 데이터 갱신을 위해 새로고침
      } else {
        // --- 📍 신규 입력 모드일 때 ---
        await onAddTransaction(formData);
      }
      // 폼 초기화
      setFormData({
        date: new Date().toISOString().split("T")[0],
        item: "",
        category: "",
        amount: "",
        type: "지출",
        memo: "",
      });
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    }
  };

  // [5. 데이터 필터링 및 정렬]
  const filteredData = transactions
    .filter((t) => (filter === "전체" ? true : t.type === filter))
    .sort((a, b) => {
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  // [6. 📍 페이징 계산 (사라졌던 기능 복구)]
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // [7. 📍 요약 정보 계산 (사라졌던 하단 요약 복구)]
  const totalIncome = filteredData
    .filter((t) => t.type === "수입")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = filteredData
    .filter((t) => t.type === "지출")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="transaction-view-container">
      {/* --- 왼쪽 패널: 리스트 및 페이징 --- */}
      <div className="left-transaction-panel">
        <div className="table-top-bar">
          <div className="top-controls-left-group">
            <select
              className="top-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="oldest">과거순</option>
            </select>
            <div className="filter-buttons">
              {["전체", "수입", "지출"].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => {
                    setFilter(f);
                    setCurrentPage(1);
                  }}
                >
                  {f}
                </button>
              ))}
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
                  <td className="td-narrow text-bold">{t.item}</td>
                  <td className="td-narrow">
                    <span className="category-badge">{t.category}</span>
                  </td>
                  <td className="td-narrow text-memo">{t.memo}</td>
                  <td
                    className={`td-narrow text-bold ${t.isIn ? "plus-color" : "minus-color"}`}
                  >
                    {t.isIn
                      ? `+${t.amount.toLocaleString()}`
                      : `-${t.amount.toLocaleString()}`}
                  </td>
                  <td className="td-narrow">
                    <div className="action-button-group">
                      <button
                        className="pill-btn edit-pill"
                        onClick={() => handleEditClick(t)}
                      >
                        수정
                      </button>
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

          {/* 📍 페이징 버튼 영역 복구 */}
          <div className="pagination-container">
            <button
              className="page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-num-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* --- 오른쪽 패널: 입력 폼 및 요약 --- */}
      <div className="right-input-panel">
        <div className="side-card">
          <h3 className="card-header-title">
            {editingId ? "내역 수정하기 ✏️" : "거래내용"}
          </h3>
          <div className="type-selector">
            <button
              className={formData.type === "수입" ? "active" : ""}
              onClick={() => setFormData({ ...formData, type: "수입" })}
            >
              수입
            </button>
            <button
              className={formData.type === "지출" ? "active" : ""}
              onClick={() => setFormData({ ...formData, type: "지출" })}
            >
              지출
            </button>
          </div>
          <form className="input-form" onSubmit={handleSubmit}>
            <input
              type="number"
              name="amount"
              placeholder="금액"
              value={formData.amount}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="item"
              placeholder="항목 (예: 이자, 편의점)"
              value={formData.item}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="category"
              placeholder="카테고리"
              value={formData.category}
              onChange={handleInputChange}
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="memo"
              placeholder="메모"
              value={formData.memo}
              onChange={handleInputChange}
            />
            <button type="submit" className="submit-save-btn">
              {editingId ? "수정하기" : "저장하기"}
            </button>
            {editingId && (
              <button
                type="button"
                className="submit-save-btn"
                style={{ backgroundColor: "#bbb", marginTop: "5px" }}
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    date: new Date().toISOString().split("T")[0],
                    item: "",
                    category: "",
                    amount: "",
                    type: "지출",
                    memo: "",
                  });
                }}
              >
                취소
              </button>
            )}
          </form>
        </div>

        {/* 📍 하단 요약(Summary) 영역 복구 */}
        <div className="side-card">
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
          <div className="summary-row total-row text-bold">
            <span>남은금액</span>
            <span>{(totalIncome - totalExpense).toLocaleString()}원</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionView;
