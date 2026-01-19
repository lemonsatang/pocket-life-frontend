// [Page] 가계부 페이지
import React, { useEffect, useState } from "react";
import dataApi from "../../api/api";
import "./LedgerPage.css";

const LedgerPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const fetchTx = () => {
    dataApi
      .get(`/api/tx?year=${year}&month=${month}`)
      .then((res) => setTxs(res.data || []));
  };

  useEffect(() => {
    fetchTx();
  }, []);

  const income = txs
    .filter((t) => t.txType === "INCOME")
    .reduce((s, t) => s + t.amount, 0);

  const expense = txs
    .filter((t) => t.txType === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  const filteredTxs = txs.filter((t) =>
    filter === "ALL" ? true : t.txType === filter
  );

  return (
    <div className="ledger-wrap">
      <h2 className="ledger-title">💰 가계부</h2>

      <div className="ledger-month">
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>

        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </select>

        <button onClick={fetchTx}>조회</button>
      </div>

      <div className="ledger-summary">
        <div>
          수입 <span className="plus">+{income.toLocaleString()}원</span>
        </div>
        <div>
          지출 <span className="minus">-{expense.toLocaleString()}원</span>
        </div>
        <div>
          합계 <b>{(income - expense).toLocaleString()}원</b>
        </div>
      </div>

      <div className="ledger-filter">
        <button onClick={() => setFilter("ALL")}>전체</button>
        <button onClick={() => setFilter("INCOME")}>수입</button>
        <button onClick={() => setFilter("EXPENSE")}>지출</button>
      </div>

      <ul className="ledger-list">
        {filteredTxs.map((t) => (
          <li key={t.id} className={t.txType === "INCOME" ? "in" : "out"}>
            [{t.txDate}] {t.title} / {t.amount.toLocaleString()}원
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LedgerPage;
