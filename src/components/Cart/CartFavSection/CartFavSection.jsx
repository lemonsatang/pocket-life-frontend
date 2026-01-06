import React from "react";
import "./CartFavSection.css";

const CartFavSection = ({ uniqueFavorites, onAdd, onToggleFav }) => {
  return (
    <div className="pixel-card cart-fav-card">
      <h3 className="cart-fav-title">
        <span className="cart-fav-star">★</span> 즐겨찾기
      </h3>
      <ul className="cart-fav-list">
        {uniqueFavorites.map((fav) => (
          <li key={fav.id} className="cart-fav-item">
            <div
              className="cart-fav-item-content"
              onClick={() => onAdd(fav.text)}
            >
              <span className="cart-fav-item-star">★</span> {fav.text}
            </div>
            <button
              className="cart-fav-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFav(fav);
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      {uniqueFavorites.length === 0 && (
        <p className="cart-fav-empty">별을 눌러 추가해보세요!</p>
      )}
    </div>
  );
};
export default CartFavSection;
