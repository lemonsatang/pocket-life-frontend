// [Layout] 식단 리스트 컴포넌트 - 식사 목록 표시 및 편집
import React from "react";
import "./MealList.css";

const MealList = ({
  meals,
  editingId,
  setEditingId,
  editingText,
  setEditingText,
  editingCalories,
  setEditingCalories,
  updateMeal,
  deleteMeal,
}) => {
  return (
    <div className="meal-list-container">
      {meals.map((meal) => (
        <div className="item-row meal-list-item-row" key={meal.id}>
          <span className="meal-list-item-content">
            {editingId === meal.id ? (
              <div className="meal-list-edit-group">
                <input
                  className="pixel-input meal-list-edit-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <input
                  className="pixel-input meal-list-edit-calorie-input"
                  value={editingCalories}
                  onChange={(e) =>
                    setEditingCalories(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
            ) : (
              <div className="meal-list-display-group">
                <strong className="meal-list-meal-type">
                  [{meal.mealType}]
                </strong>
                <span className="meal-list-meal-text">{meal.text}</span>
                <span className="meal-list-meal-calories">
                  ({meal.calories || 0} kcal)
                </span>
              </div>
            )}
          </span>
          <div className="meal-list-button-group">
            {editingId === meal.id ? (
              <button
                className="pixel-btn edit"
                onClick={() =>
                  updateMeal(meal.id, {
                    text: editingText,
                    calories: editingCalories,
                  }).then(() => setEditingId(null))
                }
              >
                완료
              </button>
            ) : (
              <button
                className="pixel-btn edit"
                onClick={() => {
                  setEditingId(meal.id);
                  setEditingText(meal.text);
                  setEditingCalories(meal.calories);
                }}
              >
                수정
              </button>
            )}
            <button
              className="pixel-btn delete"
              onClick={() => deleteMeal(meal.id)}
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealList;
