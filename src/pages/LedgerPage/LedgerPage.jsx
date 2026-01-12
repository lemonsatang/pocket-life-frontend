// [LedgerPage]
// 가계부 페이지 전용 컴포넌트
// 실제 가계부 UI를 PlaceholderPage 안에 끼워 넣는 구조

import React from "react";
// 공통 임시 화면 컴포넌트 (레이아웃 유지용)
import PlaceholderPage from "../PlaceholderPage/PlaceholderPage";

const LedgerPage = () => {
  return (
    // 공통 레이아웃 재사용 (제목, 아이콘 담당)
    <PlaceholderPage title="가계부" emoji="💰">
      {/* 
        가계부 페이지 전용 영역
        나중에 이 안에:
        - 가계부 목록
        - 금액 합계
        - 추가/수정/삭제 UI
        를 단계적으로 붙일 예정
      */}
      <div>
        {/* 가계부 내역 추가 버튼 (아직 동작 X, UI만 존재) */}
        <button>＋ 내역 추가</button>

        {/* 가계부 데이터가 없을 때 보여줄 안내 문구 */}
        <p>아직 가계부 내역이 없습니다.</p>
      </div>
    </PlaceholderPage>
  );
};

export default LedgerPage;
