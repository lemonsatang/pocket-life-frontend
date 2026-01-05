import React from "react";

export default function Modal({
  open,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  showCancel = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modalDim" role="dialog" aria-modal="true">
      <div className="modalCard">
        {title && <div className="modalTitle">{title}</div>}
        <div className="modalMsg">{message}</div>

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
