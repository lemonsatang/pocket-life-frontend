import React from "react";

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
    <div style={{ width: "100%", maxHeight: "500px", overflowY: "auto" }}>
      {meals.map((meal) => (
        <div
          className="item-row"
          key={meal.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ flex: 1 }}>
            {editingId === meal.id ? (
              <div style={{ display: "flex", gap: "5px" }}>
                <input
                  className="pixel-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  style={{ height: "35px" }}
                />
                <input
                  className="pixel-input"
                  value={editingCalories}
                  onChange={(e) =>
                    setEditingCalories(e.target.value.replace(/\D/g, ""))
                  }
                  style={{ width: "60px", height: "35px" }}
                />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* [수정] 식사 종류에 파란색 강조 스타일 추가 */}
                <strong style={{ color: "#5e72e4", marginRight: "8px" }}>
                  [{meal.mealType}]
                </strong>
                <span style={{ color: "#2d3748" }}>{meal.text}</span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#a0aec0",
                    marginLeft: "8px",
                  }}
                >
                  ({meal.calories || 0} kcal)
                </span>
              </div>
            )}
          </span>
          <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
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
