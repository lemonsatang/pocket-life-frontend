import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useMealData } from "../hooks/useMealData";
import MealStats from "../components/MealStats";
import MealList from "../components/MealList"; // 새로 만든 리스트 컴포넌트
import "../Retro.css";

const Meal = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealType, setMealType] = useState("아침");
  const [inputValue, setInputValue] = useState("");
  const [calorieInput, setCalorieInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingCalories, setEditingCalories] = useState("");
  const [displayRecs, setDisplayRecs] = useState([]);

  const {
    meals,
    addMeal,
    deleteMeal,
    updateMeal,
    errorMessage,
    setErrorMessage,
  } = useMealData(currentDate);
  const totalCalories = meals.reduce(
    (sum, m) => sum + (Number(m.calories) || 0),
    0
  );

  useEffect(() => {
    const base =
      totalCalories > 2000
        ? ["연어 샐러드", "두부 포케", "구운 야채"]
        : ["불고기 덮밥", "고등어 정식", "비빔밥"];
    setDisplayRecs([...base].sort(() => Math.random() - 0.5).slice(0, 3));
  }, [totalCalories]);

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <span
      onClick={onClick}
      ref={ref}
      style={{
        fontWeight: "bold",
        color: "#4a5568",
        cursor: "pointer",
        fontSize: "1.1rem",
      }}
    >
      {value} 📅
    </span>
  ));

  return (
    <div
      className="main-content"
      style={{
        display: "flex",
        gap: "30px",
        alignItems: "flex-start",
        justifyContent: "center",
        width: "100%",
        maxWidth: "1600px",
        margin: "100px auto 0",
        padding: "0 40px",
        boxSizing: "border-box",
      }}
    >
      <div className="pixel-card" style={{ flex: "0 1 700px", minWidth: "0" }}>
        <h3>🥗 오늘의 식단 기록</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <button
            className="date-nav-btn"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setDate(currentDate.getDate() - 1))
              )
            }
          >
            ◀
          </button>
          <DatePicker
            locale="ko"
            selected={currentDate}
            onChange={setCurrentDate}
            dateFormat="yyyy년 MM월 dd일 eeee"
            customInput={<CustomInput />}
          />
          <button
            className="date-nav-btn"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setDate(currentDate.getDate() + 1))
              )
            }
          >
            ▶
          </button>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "15px",
            flexWrap: "wrap",
          }}
        >
          {["아침", "점심", "저녁", "간식"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setMealType(type);
                setErrorMessage("");
              }}
              style={{
                background: mealType === type ? "#5e72e4" : "#edf2f7",
                color: mealType === type ? "#fff" : "#4a5568",
                padding: "8px 16px",
                borderRadius: "15px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {type}
            </button>
          ))}
        </div>
        <div
          className="input-group"
          style={{ marginBottom: errorMessage ? "5px" : "20px" }}
        >
          <input
            className="pixel-input"
            placeholder="음식명"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ flex: 3 }}
          />
          <input
            className="pixel-input"
            placeholder="kcal"
            value={calorieInput}
            onChange={(e) => setCalorieInput(e.target.value.replace(/\D/g, ""))}
            style={{ width: "70px" }}
          />
          <button
            className="pixel-btn"
            onClick={() =>
              addMeal({
                text: inputValue,
                mealType,
                calories: calorieInput,
              }).then(() => {
                setInputValue("");
                setCalorieInput("");
              })
            }
          >
            추가
          </button>
        </div>
        {errorMessage && (
          <div
            style={{
              color: "#f56565",
              fontSize: "0.85rem",
              marginBottom: "15px",
              fontWeight: "bold",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}
        <MealList
          meals={meals}
          editingId={editingId}
          setEditingId={setEditingId}
          editingText={editingText}
          setEditingText={setEditingText}
          editingCalories={editingCalories}
          setEditingCalories={setEditingCalories}
          updateMeal={updateMeal}
          deleteMeal={deleteMeal}
        />
      </div>
      <MealStats
        totalCalories={totalCalories}
        dailyGoal={2000}
        displayRecs={displayRecs}
      />
    </div>
  );
};
export default Meal;
