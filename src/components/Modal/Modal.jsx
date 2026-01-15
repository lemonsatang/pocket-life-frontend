// [Layout] 모달 컴포넌트 - 확인/취소 다이얼로그
import React from "react";
import "./Modal.css";

export default function Modal({
  open,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  showCancel = false,
  onConfirm,
  onCancel,
  type = "success", // [수정 2026-01-15 09:35] 성공/실패 구분 (success | warning) - 기본값: success
}) {
  if (!open) return null;

  return (
    <div className="modalDim" role="dialog" aria-modal="true">
      <div className="modalCard">
        {title && <div className="modalTitle">{title}</div>}
        {/* [수정 2026-01-15 09:35] type에 따라 클래스 추가 (성공: 초록, 실패/경고: 빨강) */}
        <div className={`modalMsg ${type}`}>{message}</div>
        <div className="modalBtns">
          {showCancel && (
            <button type="button" className="modalBtn ghost" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className="modalBtn primary"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
