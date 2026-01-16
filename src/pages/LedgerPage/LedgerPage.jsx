// [Page] 가계부 페이지
import React, { useEffect, useState } from "react";
import dataApi from "../../api/api";
import "./LedgerPage.css";

const LedgerPage = () => {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    dataApi.get("/api/tx").then((res) => {
      setTxs(res.data || []);
    });
  }, []);

  const income = txs
    .filter((t) => t.txType === "INCOME")
    .reduce((s, t) => s + t.amount, 0);

  const expense = txs
    .filter((t) => t.txType === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="ledger-wrap">
      <h2 className="ledger-title">💰 가계부</h2>

      <div className="ledger-summary">
        <div className="summary-box income">
          수입 <b>+{income.toLocaleString()}원</b>
        </div>
        <div className="summary-box expense">
          지출 <b>-{expense.toLocaleString()}원</b>
        </div>
        <div className="summary-box total">
          합계 <b>{(income - expense).toLocaleString()}원</b>
        </div>
      </div>

      <ul className="ledger-list">
        {txs.map((t) => (
          <li
            key={t.id}
            className={`ledger-item ${
              t.txType === "INCOME" ? "income" : "expense"
            }`}
          >
            <span className="item-date">[{t.txDate}]</span>
            <span className="item-title">{t.title}</span>
            <span className="item-amount">{t.amount.toLocaleString()}원</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LedgerPage;
