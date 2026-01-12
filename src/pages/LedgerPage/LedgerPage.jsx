import React from "react";
import PlaceholderPage from "../PlaceholderPage/PlaceholderPage";

const LedgerPage = () => {
  return (
    <PlaceholderPage title="가계부" emoji="💰">
      <div>
        <button>＋ 내역 추가</button>
        <p>아직 가계부 내역이 없습니다.</p>
      </div>
    </PlaceholderPage>
  );
};

export default LedgerPage;
