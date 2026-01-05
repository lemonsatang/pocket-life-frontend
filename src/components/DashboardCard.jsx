import React from "react";
import { Link } from "react-router-dom";

const DashboardCard = ({
  title,
  list,
  emptyMsg,
  linkTo,
  btnText,
  isMeal,
  isAccount,
  isCart, // [수정] isShopping -> isCart
  isTodo,
  income,
  expense,
  totalCalories,
}) => {
  const cardStyle = {
    flex: "1",
    minWidth: "300px",
    maxWidth: "320px",
    height: "450px",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  };

  const safeIncome = Number(income) || 0;
  const safeExpense = Number(expense) || 0;
  const totalBalance = safeIncome - safeExpense;
  const safeCalories = Number(totalCalories) || 0;
  const isOver = safeCalories > 2000;

  // [수정] 변수명 isCart로 변경
  const hasUnconfirmedItems =
    isCart && list?.length > 0 && list.some((item) => !item.isBought);

  return (
    <div className="card" style={cardStyle}>
      <h3
        style={{
          fontSize: "1.4rem",
          borderBottom: "1px solid #edf2f7",
          width: "100%",
          paddingBottom: "15px",
          textAlign: "center",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          width: "100%",
          flex: 1,
          textAlign: "left",
          padding: "20px 10px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isAccount ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#a0aec0" }}>수입</span>
              <span style={{ color: "#5e72e4", fontWeight: "bold" }}>
                +{safeIncome.toLocaleString()}원
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#a0aec0" }}>지출</span>
              <span style={{ color: "#f5365c", fontWeight: "bold" }}>
                -{safeExpense.toLocaleString()}원
              </span>
            </div>
            <div
              style={{
                borderTop: "2px solid #f8fafc",
                marginTop: "10px",
                paddingTop: "15px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 5px 0",
                  fontSize: "0.85rem",
                  color: "#a0aec0",
                }}
              >
                오늘의 합계
              </p>
              <span
                style={{
                  fontSize: "1.8rem",
                  color: totalBalance >= 0 ? "#2d3748" : "#f5365c",
                  fontWeight: "bold",
                }}
              >
                {totalBalance.toLocaleString()}원
              </span>
            </div>
          </div>
        ) : isTodo ? (
          <p style={{ color: "#cbd5e0", textAlign: "center", margin: "auto" }}>
            {emptyMsg}
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {list?.length > 0 ? (
              list.slice(0, 5).map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    marginBottom: "12px",
                    fontSize: "0.95rem",
                    color: item.isBought ? "#cbd5e0" : "#4a5568",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {/* [수정] 아이콘 표시 로직 isCart 사용 */}
                    {isCart ? (item.isBought ? "✅ " : "🛒 ") : "• "}
                    {isMeal && item.mealType && (
                      <strong style={{ color: "#5e72e4", marginRight: "6px" }}>
                        [{item.mealType}]
                      </strong>
                    )}
                    {item.text || item.menuName}
                  </span>
                  {isMeal && item.calories !== undefined && (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#a0aec0",
                        marginLeft: "8px",
                        flexShrink: 0,
                      }}
                    >
                      {item.calories} kcal
                    </span>
                  )}
                </li>
              ))
            ) : (
              <p
                style={{
                  color: "#cbd5e0",
                  textAlign: "center",
                  marginTop: "60px",
                }}
              >
                {emptyMsg}
              </p>
            )}
          </ul>
        )}
      </div>

      {isMeal && (
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <p
            style={{
              margin: "0 0 5px 0",
              fontSize: "0.85rem",
              color: "#a0aec0",
            }}
          >
            오늘 총 칼로리
          </p>
          <span
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: isOver ? "#f5365c" : "#48bb78",
            }}
          >
            {safeCalories.toLocaleString()} kcal
          </span>
        </div>
      )}

      {hasUnconfirmedItems && (
        <div
          style={{
            width: "100%",
            marginBottom: "15px",
            textAlign: "center",
            color: "#f5365c",
            fontSize: "0.85rem",
            fontWeight: "bold",
            backgroundColor: "#fff5f5",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          ⚠️ 구매완료 해주세요!
        </div>
      )}

      <Link to={linkTo} style={{ width: "100%", outline: "none" }}>
        <button
          className="pixel-btn"
          style={{
            width: "100%",
            padding: "12px",
            outline: "none",
            border: "none",
          }}
        >
          {btnText}
        </button>
      </Link>
    </div>
  );
};
export default DashboardCard;
