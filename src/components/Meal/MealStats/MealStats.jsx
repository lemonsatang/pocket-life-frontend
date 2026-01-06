// [Layout] 식단 통계 컴포넌트 - 칼로리 요약 및 추천
import React from "react";
import "./MealStats.css";

const MealStats = ({ totalCalories, dailyGoal, displayRecs }) => {
  // [Logic] 목표 칼로리 초과 여부
  const isOver = totalCalories > dailyGoal;
  const progressPercent = Math.min((totalCalories / dailyGoal) * 100, 100);

  return (
    <div className="meal-stats-container">
      <div className="pixel-card meal-stats-card">
        <h3>📊 영양 요약</h3>
        <div className="meal-stats-title">
          <div className="meal-stats-label">오늘 총 섭취량</div>
          <div className={`meal-stats-calories ${isOver ? "over" : "normal"}`}>
            {totalCalories}{" "}
            <span className="meal-stats-goal">/ {dailyGoal} kcal</span>
          </div>
        </div>
        <div className="meal-stats-progress-bar">
          <div
            className={`meal-stats-progress-fill ${isOver ? "over" : "normal"}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={`meal-stats-status ${isOver ? "over" : "normal"}`}>
          <span
            className={`meal-stats-status-text ${isOver ? "over" : "normal"}`}
          >
            {isOver ? "⚠️ 칼로리 초과!" : "✅ 아주 좋아요!"}
          </span>
        </div>
      </div>
      <div className="pixel-card meal-stats-recommend-card">
        <h3 className="meal-stats-recommend-title">💡 추천 식단</h3>
        <p className="meal-stats-recommend-desc">
          {isOver ? "가벼운 한 끼 어떠세요?" : "이런 든든한 식단은 어때요?"}
        </p>
        <ul className="meal-stats-recommend-list">
          {displayRecs.map((item, idx) => (
            <li key={idx} className="meal-stats-recommend-item">
              ✨ {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MealStats;
