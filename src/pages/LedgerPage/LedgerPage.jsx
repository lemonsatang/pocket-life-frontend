import React, { useEffect, useState } from "react";
import dataApi from "../../api/api";
import "./LedgerPage.css";

const LedgerPage = () => {
  // 1. 초기 메뉴를 "dashboard"로 설정하여 현재 만든 화면이 바로 뜨게 합니다.
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [form, setForm] = useState({
    txDate: new Date().toISOString().split("T")[0],
    title: "",
    category: "",
    memo: "",
    amount: "",
    type: "EXPENSE",
  });

  const fetchTx = () => {
    dataApi
      .get(`/api/tx?year=2026&month=1`)
      .then((res) => setTxs(res.data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTx();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount)
      return alert("내용과 금액을 입력해주세요!");
    try {
      const sendData = { ...form, amount: Number(form.amount) };
      if (editingId) await dataApi.put(`/api/tx/${editingId}`, sendData);
      else await dataApi.post("/api/tx", sendData);
      setEditingId(null);
      setForm({
        txDate: new Date().toISOString().split("T")[0],
        title: "",
        category: "",
        memo: "",
        amount: "",
        type: "EXPENSE",
      });
      fetchTx();
    } catch (err) {
      alert("작업 실패");
    }
  };

  const filteredTxs = txs.filter((t) =>
    filter === "ALL" ? true : t.type === filter
  );
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage) || 1;
  const currentItems = filteredTxs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const incomeSum = txs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expenseSum = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="pocket-container">
      {/* 1. 사이드바 - 메뉴 선택 시 activeMenu 상태 변경 */}
      <aside className="pocket-sidebar">
        <div className="side-title">Pocket Life</div>
        <button
          className={`side-btn ${activeMenu === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveMenu("dashboard")}
        >
          대시보드
        </button>
        <button
          className={`side-btn ${activeMenu === "transaction" ? "active" : ""}`}
          onClick={() => setActiveMenu("transaction")}
        >
          거래내역
        </button>
      </aside>

      {/* 2. 메뉴에 따른 화면 전환 */}
      {activeMenu === "dashboard" ? (
        // ✅ [대시보드 메뉴] 현재 구현된 가계부 입력/리스트 화면
        <>
          <main className="pocket-main">
            <div className="main-header">
              <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                가계부
              </span>
              <div className="month-badge">2026년 1월</div>
            </div>

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
                    <td
                      className={t.type === "INCOME" ? "txt-plus" : "txt-minus"}
                    >
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
          </main>

          <aside className="pocket-right">
            <div className="card-box">
              <h4 style={{ textAlign: "center", marginTop: 0 }}>빠른 기록</h4>
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
              <button className="btn-save-main" onClick={handleSave}>
                {editingId ? "수정" : "저장"}
              </button>
            </div>

            <div className="card-box">
              <h4 style={{ textAlign: "center", marginTop: 0 }}>월간 통계</h4>
              <div className="summary-line">
                <span>수입</span>
                <span className="txt-plus">
                  +{incomeSum.toLocaleString()}원
                </span>
              </div>
              <div className="summary-line">
                <span>지출</span>
                <span className="txt-minus">
                  -{expenseSum.toLocaleString()}원
                </span>
              </div>
              <div className="summary-line total">
                <span>잔액</span>
                <span>{(incomeSum - expenseSum).toLocaleString()}원</span>
              </div>
            </div>
          </aside>
        </>
      ) : (
        // ✅ [거래내역 메뉴] 새로 만들 빈 화면
        <main
          className="pocket-main"
          style={{ textAlign: "center", padding: "100px" }}
        >
          <h2 style={{ fontSize: "24px", color: "#8e8efc" }}>
            📋 상세 거래내역 페이지
          </h2>
          <p>페이지 준비중 입니다.</p>
        </main>
      )}
    </div>
  );
};

export default LedgerPage;
