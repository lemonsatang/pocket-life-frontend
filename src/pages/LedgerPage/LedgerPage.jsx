// [LedgerPage]
// 가계부 페이지 진입용 컴포넌트
// 기존 PlaceholderPage 구조를 유지하면서
// 내부에 가계부 UI 뼈대를 삽입한다 (협업/충돌 방지 목적)

import React from "react";
import PlaceholderPage from "../PlaceholderPage/PlaceholderPage";

const LedgerPage = () => {
  return (
    <PlaceholderPage title="가계부 페이지" emoji="💰">
      {/* ================= 가계부 메인 영역 ================= */}

      {/* 가계부 요약 영역 (총 수입 / 총 지출 / 잔액 예정) */}
      <section>
        {/* 발표 설명용:
            이 영역은 월별 수입·지출 합계를 보여주는 공간 */}
        <h3>이번 달 요약</h3>
        <p>총 수입: -</p>
        <p>총 지출: -</p>
        <p>잔액: -</p>
      </section>

      {/* 거래 내역 리스트 영역 */}
      <section>
        {/* 발표 설명용:
            백엔드에서 받아온 거래 목록을
            최신순으로 나열할 예정 */}
        <h3>거래 내역</h3>
        <p>아직 거래 내역이 없습니다.</p>
      </section>

      {/* ==================================================== */}
    </PlaceholderPage>
  );
};

export default LedgerPage;
