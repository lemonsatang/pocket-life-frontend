import React from "react";

const MealStats = ({ totalCalories, dailyGoal, displayRecs }) => {
  const isOver = totalCalories > dailyGoal;

  return (
    <div
      style={{
        flex: "0 0 320px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        position: "sticky",
        top: "115px",
      }}
    >
      <div
        className="pixel-card"
        style={{ padding: "25px", margin: 0, width: "100%" }}
      >
        <h3>📊 영양 요약</h3>
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "#718096",
              textAlign: "center",
            }}
          >
            오늘 총 섭취량
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: isOver ? "#f56565" : "#48bb78",
            }}
          >
            {totalCalories}{" "}
            <span style={{ fontSize: "0.9rem", color: "#a0aec0" }}>
              / {dailyGoal} kcal
            </span>
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: "10px",
            backgroundColor: "#edf2f7",
            borderRadius: "5px",
            overflow: "hidden",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              width: `${Math.min((totalCalories / dailyGoal) * 100, 100)}%`,
              height: "100%",
              backgroundColor: isOver ? "#f56565" : "#48bb78",
              transition: "width 0.5s",
            }}
          />
        </div>
        <div
          style={{
            padding: "12px",
            borderRadius: "10px",
            backgroundColor: isOver ? "#fff5f5" : "#f0fff4",
            border: `1px solid ${isOver ? "#feb2b2" : "#9ae6b4"}`,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontWeight: "bold",
              fontSize: "0.95rem",
              color: isOver ? "#c53030" : "#2f855a",
            }}
          >
            {isOver ? "⚠️ 칼로리 초과!" : "✅ 아주 좋아요!"}
          </span>
        </div>
      </div>
      <div
        className="pixel-card"
        style={{
          padding: "20px",
          margin: 0,
          width: "105%",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "1.3rem", marginBottom: "-15px" }}>
          💡 추천 식단
        </h3>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#718096",
            marginBottom: "30px",
          }}
        >
          {isOver ? "가벼운 한 끼 어떠세요?" : "이런 든든한 식단은 어때요?"}
        </p>
        <ul style={{ padding: 0, listStyle: "none", width: "100%" }}>
          {displayRecs.map((item, idx) => (
            <li
              key={idx}
              style={{
                padding: "8px 0",
                fontSize: "0.95rem",
                color: "#4a5568",
              }}
            >
              ✨ {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default MealStats;
