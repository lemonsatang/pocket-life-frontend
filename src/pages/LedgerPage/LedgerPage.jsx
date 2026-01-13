// 가계부 페이지
import React, { useEffect, useState } from "react";
import txApi from "../../api/txapi";

const LedgerPage = () => {
  // 가계부 거래 목록 상태
  const [txList, setTxList] = useState([]);

  useEffect(() => {
    // 최신 거래 10개 조회
    txApi
      .get("/latest")
      .then((res) => {
        // 받아온 데이터를 상태에 저장
        setTxList(res.data);
      })
      .catch((err) => {
        console.error("가계부 조회 실패", err);
      });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>💰 가계부</h2>

      {/* 거래 목록 출력 */}
      <ul>
        {txList.map((tx) => (
          <li key={tx.id}>
            {/* 날짜 / 제목 / 금액만 우선 표시 */}
            {tx.txDate} | {tx.title} | {tx.amount.toLocaleString()}원
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LedgerPage;
