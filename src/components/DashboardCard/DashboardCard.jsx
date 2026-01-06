// [Layout] 대시보드 카드 컴포넌트 - 데이터 요약 카드
import React from "react";
import { Link } from "react-router-dom";
import "./DashboardCard.css";

const DashboardCard = ({
  title,
  list,
  emptyMsg,
  linkTo,
  btnText,
  isMeal,
  isAccount,
  isCart,
  isTodo,
  income,
  expense,
  totalCalories,
}) => {
  // [Logic] 안전한 숫자 변환
  const safeIncome = Number(income) || 0;
  const safeExpense = Number(expense) || 0;
  const totalBalance = safeIncome - safeExpense;
  const safeCalories = Number(totalCalories) || 0;
  const isOver = safeCalories > 2000;

  // [Logic] 미확인 장바구니 아이템 확인
  const hasUnconfirmedItems =
    isCart && list?.length > 0 && list.some((item) => !item.isBought);

  return (
    <div className="card dashboard-card">
      <h3 className="dashboard-card-title">{title}</h3>
      <div className="dashboard-card-content">
        {isAccount ? (
          <div className="dashboard-card-account">
            <div className="dashboard-card-account-row">
              <span className="dashboard-card-account-label">수입</span>
              <span className="dashboard-card-account-income">
                +{safeIncome.toLocaleString()}원
              </span>
            </div>
            <div className="dashboard-card-account-row">
              <span className="dashboard-card-account-label">지출</span>
              <span className="dashboard-card-account-expense">
                -{safeExpense.toLocaleString()}원
              </span>
            </div>
            <div className="dashboard-card-account-summary">
              <p className="dashboard-card-account-summary-label">오늘의 합계</p>
              <span
                className={`dashboard-card-account-summary-value ${
                  totalBalance >= 0 ? "positive" : "negative"
                }`}
              >
                {totalBalance.toLocaleString()}원
              </span>
            </div>
          </div>
        ) : isTodo ? (
          <p className="dashboard-card-empty">{emptyMsg}</p>
        ) : (
          <ul className="dashboard-card-list">
            {list?.length > 0 ? (
              list.slice(0, 5).map((item, idx) => (
                <li
                  key={idx}
                  className={`dashboard-card-list-item ${
                    item.isBought ? "bought" : "not-bought"
                  }`}
                >
                  <span className="dashboard-card-list-item-text">
                    {isCart ? (item.isBought ? "✅ " : "🛒 ") : "• "}
                    {isMeal && item.mealType && (
                      <strong className="dashboard-card-list-item-meal-type">
                        [{item.mealType}]
                      </strong>
                    )}
                    {item.text || item.menuName}
                  </span>
                  {isMeal && item.calories !== undefined && (
                    <span className="dashboard-card-list-item-calories">
                      {item.calories} kcal
                    </span>
                  )}
                </li>
              ))
            ) : (
              <p className="dashboard-card-empty-list">{emptyMsg}</p>
            )}
          </ul>
        )}
      </div>

      {isMeal && (
        <div className="dashboard-card-calories">
          <p className="dashboard-card-calories-label">오늘 총 칼로리</p>
          <span
            className={`dashboard-card-calories-value ${
              isOver ? "over" : "normal"
            }`}
          >
            {safeCalories.toLocaleString()} kcal
          </span>
        </div>
      )}

      {hasUnconfirmedItems && (
        <div className="dashboard-card-warning">⚠️ 구매완료 해주세요!</div>
      )}

      <Link to={linkTo} className="dashboard-card-link">
        <button className="pixel-btn dashboard-card-button">{btnText}</button>
      </Link>
    </div>
  );
};

export default DashboardCard;
