import { useState, useEffect } from "react";

export const useMealData = (currentDate) => {
  const [meals, setMeals] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const getDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchMeals = () => {
    const dateStr = getDateStr(currentDate);
    fetch(`http://localhost:8080/api/meals?date=${dateStr}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setMeals)
      .catch(console.error);
  };

  useEffect(() => {
    fetchMeals();
    setErrorMessage("");
  }, [currentDate]);

  const addMeal = (meal) => {
    // 중복 체크 로직
    if (
      meal.mealType !== "간식" &&
      meals.some((m) => m.mealType === meal.mealType)
    ) {
      setErrorMessage(`${meal.mealType}은 이미 기록했어요! 수정을 부탁드려요`);
      return Promise.reject();
    }

    return fetch("http://localhost:8080/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...meal, mealDate: getDateStr(currentDate) }),
    })
      .then((res) => res.json())
      .then((saved) => {
        setMeals((prev) => [...prev, saved]);
        setErrorMessage("");
      });
  };

  const deleteMeal = (id) => {
    fetch(`http://localhost:8080/api/meals/${id}`, { method: "DELETE" }).then(
      () => {
        setMeals((prev) => prev.filter((m) => m.id !== id));
        setErrorMessage("");
      }
    );
  };

  const updateMeal = (id, updatedData) => {
    const meal = meals.find((m) => m.id === id);
    return fetch(`http://localhost:8080/api/meals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...meal, ...updatedData }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMeals((prev) => prev.map((m) => (m.id === id ? data : m)));
      });
  };

  return {
    meals,
    addMeal,
    deleteMeal,
    updateMeal,
    errorMessage,
    setErrorMessage,
  };
};
