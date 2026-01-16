// [Page] 가계부 페이지 - 최신 거래 목록 + 합계 표시
import React, { useEffect, useState } from "react";

const LedgerPage = () => {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    txApi
      .get("/latest")
      .then((res) => {
        setTxs(res.data || []);
      })
      .catch((err) => {
        console.error("가계부 조회 실패", err);
      });
  }, []);

  const income = txs
    .filter((t) => t.txType === "INCOME")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const expense = txs
    .filter((t) => t.txType === "EXPENSE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div style={{ padding: "40px" }}>
      <h2>💰 가계부</h2>

      <div style={{ marginBottom: "20px" }}>
        <p>수입: +{income.toLocaleString()}원</p>
        <p>지출: -{expense.toLocaleString()}원</p>
        <p>합계: {(income - expense).toLocaleString()}원</p>
      </div>

      <ul>
        {txs.length === 0 && <p>거래 내역이 없습니다.</p>}
        {txs.map((t) => (
          <li key={t.id}>
            [{t.txDate}] {t.title} / {t.txType} / {t.amount.toLocaleString()}원
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LedgerPage;
