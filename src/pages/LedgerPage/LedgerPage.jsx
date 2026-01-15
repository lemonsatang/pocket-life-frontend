// [Page] 가계부 페이지
import React, { useEffect, useState } from "react";
// import txApi from "../../api/txapi"; // [Deleted]
import dataApi from "../../api/api"; // [New]

const LedgerPage = () => {
  const [list, setList] = useState([]);

  useEffect(() => {
    // [수정] txApi 대신 dataApi 사용
    dataApi
      .get("/api/tx/latest")
      .then((res) => {
        console.log("✅ 최신 거래 조회 성공", res.data);
        setList(res.data); // ← 화면에 쓸 데이터 저장
      })
      .catch((err) => {
        console.error("❌ 가계부 조회 실패", err);
      });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>💰 가계부 페이지</h2>

      {list.length === 0 ? (
        <p>거래 내역이 없습니다.</p>
      ) : (
        list.map((tx) => (
          <div
            key={tx.id}
            style={{
              borderBottom: "1px solid #ddd",
              padding: "12px 0",
            }}
          >
            <div>{tx.txDate}</div>
            <div>{tx.title}</div>
            <div>{tx.amount}</div>
            <div>{tx.category}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default LedgerPage;
