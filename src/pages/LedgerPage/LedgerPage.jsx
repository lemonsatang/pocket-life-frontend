// [Page] 가계부 페이지
// - 로그인 후 JWT가 localStorage에 있어야 정상 동작
// - /api/tx/latest 는 파라미터 없이 최신 10건 조회
// - /api/tx 는 year, month 필수라 여기서는 latest만 사용

import React, { useEffect } from "react";
import txApi from "../../api/txapi";

const LedgerPage = () => {
  useEffect(() => {
    // ✅ 최신 거래 조회 (파라미터 필요 없음)
    txApi
      .get("/latest")
      .then((res) => {
        console.log("✅ 최신 거래 조회 성공", res.data);
      })
      .catch((err) => {
        console.error("❌ 가계부 조회 실패", err);
      });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>💰 가계부 페이지</h2>
      <p>콘솔에 최신 거래 데이터가 찍히면 정상입니다.</p>
    </div>
  );
};

export default LedgerPage;
