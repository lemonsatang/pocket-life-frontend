// [Layout] 식단 관리 페이지 - 식사 기록 및 통계
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useMealData } from "../../hooks/useMealData";
import MealStats from "../../components/Meal/MealStats/MealStats";
import MealList from "../../components/Meal/MealList/MealList";
import "./MealPage.css";

const MealPage = () => {
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

  // [Logic] 총 칼로리 계산
  const totalCalories = meals.reduce(
    (sum, m) => sum + (Number(m.calories) || 0),
    0
  );

  // [Logic] 칼로리에 따른 추천 식단 생성
  useEffect(() => {
    const base =
      totalCalories > 2000
        ? ["연어 샐러드", "두부 포케", "구운 야채"]
        : ["불고기 덮밥", "고등어 정식", "비빔밥"];
    setDisplayRecs([...base].sort(() => Math.random() - 0.5).slice(0, 3));
  }, [totalCalories]);

  // [Layout] DatePicker 커스텀 입력 컴포넌트
  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <span onClick={onClick} ref={ref} className="meal-date-input">
      {value} 📅
    </span>
  ));

  // [Logic] 날짜 변경 핸들러
  const handleDateChange = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  return (
    <div className="main-content meal-container">
      <div className="pixel-card meal-card">
        <h3>🥗 오늘의 식단 기록</h3>
        <div className="meal-date-picker-container">
          <button
            className="date-nav-btn"
            onClick={() => handleDateChange(-1)}
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
            onClick={() => handleDateChange(1)}
          >
            ▶
          </button>
        </div>
        <div className="meal-type-buttons">
          {["아침", "점심", "저녁", "간식"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setMealType(type);
                setErrorMessage("");
              }}
              className={`meal-type-btn ${
                mealType === type ? "active" : "inactive"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div
          className={`input-group meal-input-group ${
            errorMessage ? "has-error" : ""
          }`}
        >
          <input
            className="pixel-input meal-food-input"
            placeholder="음식명"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <input
            className="pixel-input meal-calorie-input"
            placeholder="kcal"
            value={calorieInput}
            onChange={(e) => setCalorieInput(e.target.value.replace(/\D/g, ""))}
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
          <div className="meal-error-message">⚠️ {errorMessage}</div>
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

export default MealPage;
