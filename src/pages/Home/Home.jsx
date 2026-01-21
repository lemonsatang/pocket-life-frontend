import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import "react-datepicker/dist/react-datepicker.css";
import "./Home.css";
import dataApi from "../../api/api";

registerLocale("ko", ko);

const Home = () => {
  /* [1. 상태 관리 - 기존 유지] */
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    meals: [],
    cartItems: [],
    todos: [],
    income: 0,
    expense: 0,
  });

  /* [2. 날짜 변환 로직 - 기존 유지] */
  const getDateStr = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <span onClick={onClick} ref={ref} className="home-date-input">
      {value} 📅
    </span>
  ));

  /* [3. 데이터 로딩 및 정확한 금액 계산] */
  useEffect(() => {
    const dateStr = getDateStr(currentDate);
    const currentYearMonth = dateStr.substring(0, 7); // "2026-01"

    Promise.all([
      dataApi
        .get(`/api/meals?date=${dateStr}`)
        .then((res) => res.data)
        .catch(() => []),
      dataApi
        .get(`/api/cart?date=${dateStr}`)
        .then((res) => res.data)
        .catch(() => []),
      dataApi
        .get(`/api/todo/getList?date=${dateStr}`)
        .then((res) => res.data)
        .catch(() => []),
      /* 📍 [수정] 가계부 API 주소를 /api/tx/latest에서 /api/tx로 변경 */
      dataApi
        .get(`/api/tx`)
        .then((res) => res.data)
        .catch(() => []),
    ])
      .then(([meals, cartData, todos, txs]) => {
        /* 📍 [가계부 필드 매칭 및 합산] */
        let incomeSum = 0;
        let expenseSum = 0;

        if (Array.isArray(txs)) {
          txs.forEach((t) => {
            // 가계부 페이지 로직 반영: 날짜는 t.txDate에 들어있음
            const txDate = t.txDate || "";

            // 현재 선택된 달(currentYearMonth)과 일치하는지 확인
            if (txDate.startsWith(currentYearMonth)) {
              const amount = Number(t.amount) || 0;
              // 가계부 페이지 로직 반영: t.type === "INCOME" 이면 수입
              if (t.type === "INCOME") {
                incomeSum += amount;
              } else {
                expenseSum += amount;
              }
            }
          });
        }

        /* --- 기존 기능(식단/장바구니 등) 로직 보존 --- */
        const todayCartItems = (cartData || []).filter(
          (item) => item.shoppingDate === dateStr,
        );
        const uniqueCartItems = todayCartItems.filter(
          (item, index, self) =>
            index === self.findLastIndex((t) => t.text === item.text),
        );

        setDashboardData({
          meals: meals || [],
          cartItems: uniqueCartItems,
          todos: (todos || []).map((t) => ({ ...t, text: t.content })),
          income: incomeSum,
          expense: expenseSum,
        });
      })
      .catch((err) => console.error("데이터 로딩 실패", err));
  }, [currentDate]);

  /* [4. 요약 계산 - 기존 유지] */
  const totalCalories = dashboardData.meals.reduce(
    (sum, m) => sum + (Number(m.calories) || 0),
    0,
  );

  const hasUnconfirmedItems = dashboardData.cartItems.some(
    (item) => !item.isBought,
  );

  return (
    <div className="home-container">
      <header className="home-header">
        <h2 className="home-title">👛 POCKET DASHBOARD</h2>
        <div className="home-date-picker-container">
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 1);
              setCurrentDate(d);
            }}
            className="home-date-btn"
          >
            ◀
          </button>
          <DatePicker
            locale="ko"
            selected={currentDate}
            onChange={(date) => setCurrentDate(date)}
            dateFormat="yyyy년 MM월 dd일 eeee"
            customInput={<CustomInput />}
            renderCustomHeader={({
              date,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div className="react-datepicker__header" style={{ position: "relative", textAlign: "center", output: "visible" }}>
                <button
                  type="button"
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                  className="date-nav-btn"
                  aria-label="이전 달"
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                    width: "32px",
                    height: "32px",
                    background: "none",
                    border: "none",
                    cursor: prevMonthButtonDisabled ? "not-allowed" : "pointer",
                    padding: 0,
                    outline: "none",
                    color: prevMonthButtonDisabled ? "#cbd5e0" : "#5e72e4",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  ◀
                </button>
                <h2 className="react-datepicker__current-month" style={{ margin: 0 }}>
                  {date.getFullYear()}년 {String(date.getMonth() + 1).padStart(2, "0")}월
                </h2>
                <button
                  type="button"
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                  className="date-nav-btn"
                  aria-label="다음 달"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                    width: "32px",
                    height: "32px",
                    background: "none",
                    border: "none",
                    cursor: nextMonthButtonDisabled ? "not-allowed" : "pointer",
                    padding: 0,
                    outline: "none",
                    color: nextMonthButtonDisabled ? "#cbd5e0" : "#5e72e4",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  ▶
                </button>
              </div>
            )}
          />
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 1);
              setCurrentDate(d);
            }}
            className="home-date-btn"
          >
            ▶
          </button>
        </div>
      </header>

      <div className="home-cards-container">
        <DashboardCard
          title="오늘의 일정 📅"
          list={dashboardData.todos}
          emptyMsg="할 일이 없어요!"
          linkTo="/schedule"
          btnText="자세히 보기"
        />
        <DashboardCard
          title="오늘의 식단 🍚"
          list={dashboardData.meals}
          emptyMsg="기록이 없어요!"
          linkTo="/meal"
          btnText="기록하러 가기"
          isMeal
          totalCalories={totalCalories}
        />
        <DashboardCard
          title="장바구니 🛍️"
          list={dashboardData.cartItems}
          emptyMsg="구매 목록이 비어있어요!"
          linkTo="/cart"
          btnText="목록 확인"
          isCart
          hasUnconfirmedItems={hasUnconfirmedItems}
        />
        <DashboardCard
          title="가계부 💰"
          isAccount
          income={dashboardData.income}
          expense={dashboardData.expense}
          linkTo="/ledger"
          btnText="가계부 보기"
        />
      </div>
    </div>
  );
};

export default Home;
