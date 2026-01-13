// 가계부 페이지
import React, { useEffect } from "react";
import txApi from "../../api/txapi"; // 우리가 만든 axios

const LedgerPage = () => {
  useEffect(() => {
    txApi
      .get("/latest")
      .then((res) => {
        console.log("최신 거래", res.data);
      })
      .catch((err) => {
        console.error("가계부 조회 실패", err);
      });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>💰 가계부 페이지</h2>
      <p>콘솔에 데이터 찍히는지 확인</p>
    </div>
  );
};

export default LedgerPage;
