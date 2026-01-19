import React, { useEffect, useState } from "react";
import dataApi from "../../api/api";
import "./LedgerPage.css";

const LedgerPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [editingId, setEditingId] = useState(null);

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
      .get(`/api/tx?year=${year}&month=${month}`)
      .then((res) => setTxs(res.data || []))
      .catch((err) => console.error("데이터 로드 실패", err));
  };

  useEffect(() => {
    fetchTx();
  }, [year, month]);

  const handleSave = async (e) => {
    e.preventDefault();
    const sendData = { ...form, amount: Number(form.amount) };
    try {
      if (editingId) await dataApi.put(`/api/tx/${editingId}`, sendData);
      else await dataApi.post("/api/tx", sendData);
      resetForm();
      fetchTx();
    } catch (err) {
      alert("저장 실패");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item, memo: item.memo || "" });
  };

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

  const handleDelete = async (id) => {
    if (window.confirm("삭제하시겠습니까?")) {
      await dataApi.delete(`/api/tx/${id}`);
      fetchTx();
    }
  };

  const income = txs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expense = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const filteredTxs = txs.filter((t) =>
    filter === "ALL" ? true : t.type === filter
  );

  return (
    <div className="pocket-container">
      {/* 1. 왼쪽 사이드바 */}
      <aside className="pocket-sidebar">
        <h3>포켓 라이프</h3>
        <button className="side-btn">대시보드</button>
        <button className="side-btn active">거래내역</button>
      </aside>

      {/* 2. 메인 거래내역 영역 */}
      <main className="pocket-main">
        <header className="main-header">
          <span>가계부 거래내역</span>
          <div className="month-badge">
            {year}년 {month}월
          </div>
        </header>

        <div className="filter-row">
          <button
            className={filter === "ALL" ? "active" : ""}
            onClick={() => setFilter("ALL")}
          >
            전체
          </button>
          <button
            className={filter === "INCOME" ? "active" : ""}
            onClick={() => setFilter("INCOME")}
          >
            수입
          </button>
          <button
            className={filter === "EXPENSE" ? "active" : ""}
            onClick={() => setFilter("EXPENSE")}
          >
            지출
          </button>
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
            {filteredTxs.map((t) => (
              <tr key={t.id}>
                <td>{t.txDate.substring(5)}</td>
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
                  <button className="btn-edit" onClick={() => startEdit(t)}>
                    수정
                  </button>
                  <button
                    className="btn-del"
                    onClick={() => handleDelete(t.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* 3. 오른쪽 입력 및 요약 영역 */}
      <aside className="pocket-right">
        <div className="card-input">
          <h4>거래내용</h4>
          <div className="type-toggle">
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
          <button className="btn-save" onClick={handleSave}>
            {editingId ? "수정하기" : "저장(기록)"}
          </button>
        </div>

        <div className="card-summary">
          <h4>요약</h4>
          <div className="sum-item">
            이번달 수입{" "}
            <span className="txt-plus">+{income.toLocaleString()}원</span>
          </div>
          <div className="sum-item">
            이번달 지출{" "}
            <span className="txt-minus">-{expense.toLocaleString()}원</span>
          </div>
          <div className="sum-item total">
            남은금액 <span>+{(income - expense).toLocaleString()}원</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LedgerPage;
