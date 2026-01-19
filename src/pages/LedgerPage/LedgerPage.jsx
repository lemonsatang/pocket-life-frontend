import React, { useEffect, useState } from "react";
import dataApi from "../../api/api";
import "./LedgerPage.css";

const LedgerPage = () => {
  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [form, setForm] = useState({
    txDate: "2026-01-19",
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

  const filteredTxs = txs.filter((t) =>
    filter === "ALL" ? true : t.type === filter
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = filteredTxs.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId)
        await dataApi.put(`/api/tx/${editingId}`, {
          ...form,
          amount: Number(form.amount),
        });
      else
        await dataApi.post("/api/tx", { ...form, amount: Number(form.amount) });
      setEditingId(null);
      setForm({
        txDate: "2026-01-19",
        title: "",
        category: "",
        memo: "",
        amount: "",
        type: "EXPENSE",
      });
      fetchTx();
    } catch (err) {
      alert("저장 실패");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm(item);
  };

  const incomeSum = txs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expenseSum = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="pocket-container">
      {/* 1. 사이드바 */}
      <aside className="pocket-sidebar">
        <div className="side-title">Pocket Life</div>
        <button className="side-btn">대시보드</button>
        <button className="side-btn active">거래내역</button>
      </aside>

      {/* 2. 메인 거래내역 박스 */}
      <main className="pocket-main">
        <div className="main-header">
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>가계부</span>
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
              <th>수정/삭제</th>
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
                  <button className="btn-row-edit" onClick={() => startEdit(t)}>
                    수정
                  </button>
                  <button
                    className="btn-row-del"
                    onClick={() => {
                      if (window.confirm("삭제하시겠습니까?"))
                        dataApi.delete(`/api/tx/${t.id}`).then(fetchTx);
                    }}
                  >
                    삭제
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

      {/* 3. 오른쪽 패널 */}
      <aside className="pocket-right">
        <div className="card-box">
          <h4 style={{ textAlign: "center", marginTop: 0 }}>거래내용</h4>
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
          <input
            type="text"
            placeholder="메모"
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
          />
          <button className="btn-save-main" onClick={handleSave}>
            저장(수정)
          </button>
        </div>

        <div className="card-box">
          <h4 style={{ textAlign: "center", marginTop: 0 }}>요약</h4>
          <div className="summary-line">
            <span>이번달 수입</span>
            <span className="txt-plus">+{incomeSum.toLocaleString()}원</span>
          </div>
          <div className="summary-line">
            <span>이번달 지출</span>
            <span className="txt-minus">-{expenseSum.toLocaleString()}원</span>
          </div>
          <div className="summary-line total">
            <span>남은금액</span>
            <span>+{(incomeSum - expenseSum).toLocaleString()}원</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LedgerPage;
