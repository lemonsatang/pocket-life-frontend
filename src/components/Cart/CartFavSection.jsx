import React from "react";

const CartFavSection = ({ uniqueFavorites, onAdd, onToggleFav }) => {
  return (
    <div
      className="pixel-card"
      style={{
        flex: 0.6,
        padding: "20px",
        minWidth: "250px",
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ fontSize: "1.3rem", marginBottom: "15px" }}>
        <span style={{ color: "#fbc02d" }}>★</span> 즐겨찾기
      </h3>
      <ul style={{ listStyle: "none", padding: 0, width: "100%", margin: 0 }}>
        {uniqueFavorites.map((fav) => (
          <li
            key={fav.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              border: "1px dashed #edf2f7",
              borderRadius: "12px",
              marginBottom: "8px",
              backgroundColor: "#fff",
            }}
          >
            <div
              onClick={() => onAdd(fav.text)}
              style={{
                cursor: "pointer",
                flex: 1,
                color: "#4a5568",
                fontWeight: "500",
              }}
            >
              <span style={{ color: "#fbc02d", marginRight: "5px" }}>★</span>{" "}
              {fav.text}
            </div>
            <button
              className="fav-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFav(fav);
              }}
              style={{ fontSize: "1.1rem", padding: "0 5px" }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      {uniqueFavorites.length === 0 && (
        <p
          style={{
            color: "#cbd5e0",
            fontSize: "0.85rem",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          별을 눌러 추가해보세요!
        </p>
      )}
    </div>
  );
};
export default CartFavSection;
