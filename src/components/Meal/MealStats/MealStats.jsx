// [Layout] 식단 통계 컴포넌트 - 칼로리 요약 및 추천
import React from "react";
import "./MealStats.css";

const MealStats = ({ totalCalories, dailyGoal, displayRecs, onRecClick, isCheating, hasEatenCheatMeal, isStrictCheating, onOpenMenu, onDetailClick }) => {
  // [Logic] 목표 칼로리 초과 여부
  const isOver = totalCalories > dailyGoal;
  const progressPercent = (totalCalories / dailyGoal) * 100;
  const [isRevealed, setIsRevealed] = React.useState(false);

  // [Logic] 블러 처리 여부
  const shouldBlur = isStrictCheating && !isRevealed;

  return (
    <div className="meal-stats-container">
      <div className="meal-stats-card-wrapper">
        {/* [수정 2026-01-XX] 누가: 효민, 무엇을: 상세보기 버튼을 클릭 핸들러로 변경, 어디서: MealStats.jsx 19-21번째 줄, 어떻게: Link를 button으로 변경하고 onDetailClick 호출, 왜: MealReport 컴포넌트를 MealPage에서 표시하기 위해 */}
        <button onClick={onDetailClick} className="meal-stats-detail-btn">
          상세보기 →
        </button>
        {/* [수정 2026-01-19] 누가: 효민, 무엇을: 카드의 overflow를 visible로 변경, 어디서: MealStats.jsx 22번째 줄, 어떻게: 인라인 스타일에서 overflow: 'hidden'을 제거, 왜: 버튼이 카드 영역 바깥에 위치해도 보이도록 하기 위해 */}
        <div className="pixel-card meal-stats-card" style={{ position: 'relative', overflow: 'visible' }}>
          <h3>📊 영양 요약</h3>
        
        {/* [Logic] 블러 처리될 컨텐츠 영역 */}
        <div className={`meal-stats-content ${shouldBlur ? "blurred-content" : ""}`}>
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

        {/* [Logic] 블러 시 나타날 오버레이 버튼 */}
        {shouldBlur && (
          <div className="meal-stats-overlay">
            <button 
              className="meal-stats-reveal-btn"
              onClick={() => setIsRevealed(true)}
            >
              궁금한가요?
            </button>
          </div>
        )}
        </div>
      </div>
      <div className="pixel-card meal-stats-recommend-card">
        <h3 className="meal-stats-recommend-title">
            <span onClick={onOpenMenu} style={{cursor: 'pointer'}} title="전체 메뉴 보기">📋</span> 추천 식단
        </h3>
        <p className="meal-stats-recommend-desc">
          {isCheating 
            ? "오늘은 치팅데이! 마음껏 즐기세요 😋"
            : hasEatenCheatMeal
              ? "혹시...오늘이 치팅데이 인가요?"
              : isOver 
                ? "가벼운 한 끼 어떠세요?" 
                : "이런 든든한 식단은 어때요?"}
        </p>
        <ul className="meal-stats-recommend-list">
          {displayRecs.map((item, idx) => (
            <li key={idx} className="meal-stats-recommend-item">
              ✨{" "}
              <span
                className="meal-stats-recommend-text clickable"
                onClick={() => onRecClick && onRecClick(item)}
                style={{ cursor: "pointer" }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MealStats;
