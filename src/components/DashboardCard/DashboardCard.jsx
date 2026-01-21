import React from "react";
import { Link } from "react-router-dom";
import "./DashboardCard.css";
// [Data] 치팅 식단 데이터 가져오기 (치팅 여부 판단용)
import { cheatMeals } from "../../features/Meal/data/recommendedMeals";

const DashboardCard = ({
  title,
  list,
  emptyMsg,
  linkTo,
  btnText,
  isMeal,
  isAccount, // ✅ 가계부 카드 여부 (true면 수입/지출 요약 표시)
  isCart,
  isTodo,
  income, // ✅ 대시보드에서 /api/tx/summary로 받아온 수입
  expense, // ✅ 대시보드에서 /api/tx/summary로 받아온 지출
  totalCalories,
}) => {
  // ✅ 숫자가 안 넘어올 경우를 대비한 안전 처리
  const safeIncome = Number(income) || 0;
  const safeExpense = Number(expense) || 0;
  const totalBalance = safeIncome - safeExpense;

  const safeCalories = Number(totalCalories) || 0;
  const isOver = safeCalories > 2000;

  // [Logic] 치팅 식단 포함 여부 확인
  const hasCheatMeal = isMeal && list?.some((item) => 
    cheatMeals.some((cheat) => (item.text || item.menuName || "").includes(cheat.name))
  );

  // [Logic] 치팅 데이 조건: 칼로리 2000 초과 AND 치팅 식단 포함
  const isCheatingDay = isOver && hasCheatMeal;

  // [Logic] 미확인 장바구니 아이템 확인
  const hasUnconfirmedItems =
    isCart && list?.length > 0 && list.some((item) => !item.isBought);

  // ✅ 가계부 카드일 경우 항상 /ledger로 이동
  const finalLink = isAccount ? "/ledger" : linkTo;

  return (
    <div className="card dashboard-card">
      <h3 className="dashboard-card-title">{title}</h3>

      <div className="dashboard-card-content">
        {isAccount ? (
          /* ================= 가계부 카드 영역 ================= */
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
              <p className="dashboard-card-account-summary-label">
                오늘의 합계
              </p>
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
              list.slice(0, 5).map((item, idx) => {
                const isCompleted = item.isBought || item.isDone;
                return (
                  <li
                    key={idx}
                    className={`dashboard-card-list-item ${
                      isCompleted ? "completed" : "active"
                    }`}
                  >
                    <span className="dashboard-card-list-item-text">
                      {isCart
                        ? item.isBought
                          ? "✅ "
                          : "🛒 "
                        : item.isDone
                        ? "✅ "
                        : "• "}
                      {isMeal && item.mealType && (
                      <strong className="dashboard-card-list-item-meal-type">
                        [{item.mealType}]
                      </strong>
                    )}
                    {item.text || item.menuName}
                  </span>
                  {/* [Logic] 치팅 데이(2000kcal 초과 + 치팅메뉴)가 아닐 때만 칼로리 표시 */}
                  {isMeal && item.calories !== undefined && !isCheatingDay && (
                    <span className="dashboard-card-list-item-calories">
                      {item.calories} kcal
                    </span>
                  )}
                </li>
                );
              })
            ) : (
              <p className="dashboard-card-empty-list">{emptyMsg}</p>
            )}
          </ul>
        )}
      </div>

      {/* 식단 카드일 때만 칼로리 요약 표시 */}
      {isMeal && (
        <div className="dashboard-card-calories">
          {!isCheatingDay && <p className="dashboard-card-calories-label">오늘 총 칼로리</p>}
          <span
            className={`dashboard-card-calories-value ${
              isOver ? "over" : "normal"
            }`}
          >
            {/* [Logic] 치팅 데이 조건 충족 시 문구 변경 */}
            {isCheatingDay ? "치팅데이!" : `${safeCalories.toLocaleString()} kcal`}
          </span>
        </div>
      )}

      {hasUnconfirmedItems && (
        <div className="dashboard-card-warning">⚠️ 구매완료 해주세요!</div>
      )}

      <Link to={finalLink} className="dashboard-card-link">
        <button className="pixel-btn dashboard-card-button">{btnText}</button>
      </Link>
    </div>
  );
};

export default DashboardCard;
