import React from "react";
import CartMainSection from "./CartMainSection";
import CartFavSection from "./CartFavSection";

const CartView = (props) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        alignItems: "flex-start",
        width: "100%",
        justifyContent: "center",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        /* 점 표시(before)와 기본 리스트 스타일 완벽 제거 */
        .item-row::before, .item-row span::before, .item-row div::before { content: none !important; }
        .item-row { list-style: none !important; }
        
        @keyframes highlightBlink { 0%, 100% { background-color: transparent; } 50% { background-color: #fff9c4; transform: scale(1.01); } }
        
        button:focus, input:focus, .pixel-btn:focus { outline: none !important; box-shadow: none !important; }
        button { border: none; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        
        .fav-delete-btn { background: transparent !important; color: #cbd5e0 !important; border: none !important; }
        .fav-delete-btn:hover { color: #f56565 !important; }
      `}</style>
      <CartMainSection {...props} />
      <CartFavSection
        uniqueFavorites={props.uniqueFavorites}
        onAdd={props.onAdd}
        onToggleFav={props.onToggleFav}
      />
    </div>
  );
};
export default CartView;
