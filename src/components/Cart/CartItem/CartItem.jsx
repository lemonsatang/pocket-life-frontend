import React from "react";
import "./CartItem.css";

const CartItem = ({ item, searchTarget, onMark, onDelete, onToggleFav }) => {
  return (
    <div
      className={`item-row cart-item-row ${
        searchTarget === item.text ? "highlight" : ""
      }`}
    >
      <div className="cart-item-content">
        <span
          onClick={() => onToggleFav(item)}
          className={`cart-item-favorite ${
            item.isFavorite ? "active" : "inactive"
          }`}
        >
          {item.isFavorite ? "★" : "☆"}
        </span>
        <span
          className={`cart-item-text ${
            item.isBought ? "bought" : "not-bought"
          }`}
        >
          {item.text}
          {item.count > 1 && (
            <span className="cart-item-count">{item.count}개</span>
          )}
        </span>
      </div>
      <div className="cart-item-actions">
        {item.isBought ? (
          <span className="cart-item-complete-badge">구매완료!</span>
        ) : (
          <button
            className="cart-item-complete-btn"
            onClick={() => onMark(item)}
          >
            구매완료
          </button>
        )}
        <button
          className="pixel-btn delete cart-item-delete-btn"
          onClick={() => onDelete(item)}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default CartItem;
