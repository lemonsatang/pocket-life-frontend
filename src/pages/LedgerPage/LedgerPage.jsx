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

      <ul className="ledger-list">
        {txs.map((t) => (
          <li key={t.id} className={t.txType === "INCOME" ? "in" : "out"}>
            [{t.txDate}] {t.title} / {t.amount.toLocaleString()}원
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LedgerPage;
