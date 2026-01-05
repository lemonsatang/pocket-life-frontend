import React from "react";

const CartItem = ({ item, searchTarget, onMark, onDelete, onToggleFav }) => {
  return (
    <div
      className="item-row"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        animation:
          searchTarget === item.text ? "highlightBlink 0.8s infinite" : "none",
        padding: "8px 10px",
        marginBottom: "5px",
        borderRadius: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          onClick={() => onToggleFav(item)}
          style={{
            cursor: "pointer",
            fontSize: "1.2rem",
            color: item.isFavorite ? "#fbc02d" : "#cbd5e0",
          }}
        >
          {item.isFavorite ? "★" : "☆"}
        </span>
        <span
          style={{
            textDecoration: item.isBought ? "line-through" : "none",
            color: item.isBought ? "#cbd5e0" : "#4a5568",
            fontWeight: "500",
            fontSize: "1rem",
          }}
        >
          {item.text}
          {item.count > 1 && (
            <span
              style={{
                color: "#5e72e4",
                marginLeft: "5px",
                fontWeight: "bold",
              }}
            >
              {item.count}개
            </span>
          )}
        </span>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        {item.isBought ? (
          <span
            style={{
              color: "#48bb78",
              fontWeight: "bold",
              padding: "5px 10px",
            }}
          >
            구매완료!
          </span>
        ) : (
          <button
            onClick={() => onMark(item)}
            style={{
              background: "#48bb78",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "15px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            구매완료
          </button>
        )}
        <button
          className="pixel-btn delete"
          onClick={() => onDelete(item)}
          style={{
            padding: "6px 15px",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default CartItem;
