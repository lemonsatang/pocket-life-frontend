import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale";
import DashboardCard from "../components/DashboardCard"; // 경로 확인 필요 (components/Cart/DashboardCard.jsx 인지 확인)
import "react-datepicker/dist/react-datepicker.css";
import "../Retro.css";

registerLocale("ko", ko);

const Home = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // [수정 1] shoppingItems -> cartItems로 이름 통일
  const [dashboardData, setDashboardData] = useState({
    meals: [],
    cartItems: [],
    todos: [],
    income: 0,
    expense: 0,
  });

  const dummyTodos = [
    {
      todoid: "d1",
      content: "🏃 조깅하기",
      isDone: false,
      dodate: "2026-01-01",
    },
    {
      todoid: "d2",
      content: "📚 리액트 공부",
      isDone: true,
      dodate: "2026-01-01",
    },
  ];

  const getDateStr = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <span
      onClick={onClick}
      ref={ref}
      style={{
        fontWeight: "bold",
        color: "#2d3748",
        cursor: "pointer",
        fontSize: "1.1rem",
        outline: "none",
      }}
    >
      {value} 📅
    </span>
  ));

  useEffect(() => {
    const dateStr = getDateStr(currentDate);
    const userId = "testUser";
    const fetchUrl = (path) => `http://localhost:8080/api/${path}`;

    Promise.all([
      fetch(fetchUrl(`meals?date=${dateStr}`)).then((res) =>
        res.json().catch(() => [])
      ),
      // [수정 2] shopping -> cart (백엔드 URL 변경 반영)
      fetch(fetchUrl(`cart?date=${dateStr}`)).then((res) =>
        res.json().catch(() => [])
      ),
      fetch(fetchUrl(`todo?userId=${userId}&date=${dateStr}`)).then((res) =>
        res.json().catch(() => [])
      ),
      fetch(fetchUrl(`tx?userId=${userId}&date=${dateStr}`)).then((res) =>
        res.json().catch(() => [])
      ),
    ])
      .then(([meals, cartData, todos, txs]) => {
        const income = (txs || [])
          .filter((t) => t.txType === "INCOME")
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const expense = (txs || [])
          .filter((t) => t.txType === "EXPENSE")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        // [수정 3] 받아온 데이터 변수명도 cartData로 취급
        const todayCartItems = (cartData || []).filter(
          (item) => item.shoppingDate === dateStr
        );
        const uniqueCartItems = todayCartItems.filter(
          (item, index, self) =>
            index === self.findLastIndex((t) => t.text === item.text)
        );

        const combinedTodos = [...dummyTodos, ...(todos || [])].filter(
          (t) => t.dodate === dateStr
        );

        setDashboardData({
          meals: meals || [],
          cartItems: uniqueCartItems, // [수정] State 키와 일치시킴
          todos: combinedTodos,
          income,
          expense,
        });
      })
      .catch((err) => console.error("로딩 실패", err));
  }, [currentDate]);

  const totalCalories = dashboardData.meals.reduce(
    (sum, m) => sum + (Number(m.calories) || 0),
    0
  );

  // [수정] 변수명 일치 (shoppingItems -> cartItems)
  const hasUnconfirmedItems = dashboardData.cartItems.some(
    (item) => !item.isBought
  );

  const btnStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#AAB7EC",
    fontSize: "1.5rem",
    outline: "none",
    boxShadow: "none",
    padding: "0 10px",
  };

  return (
    <div
      className="home-container"
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "-40px",
      }}
    >
      <header style={{ marginBottom: "50px", textAlign: "center" }}>
        <h2
          style={{ fontSize: "2.5rem", color: "#2d3748", marginBottom: "15px" }}
        >
          👛 POCKET DASHBOARD
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 1);
              setCurrentDate(d);
            }}
            style={btnStyle}
          >
            ◀
          </button>
          <DatePicker
            locale="ko"
            selected={currentDate}
            onChange={(date) => setCurrentDate(date)}
            dateFormat="yyyy년 MM월 dd일 eeee"
            customInput={<CustomInput />}
          />
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 1);
              setCurrentDate(d);
            }}
            style={btnStyle}
          >
            ▶
          </button>
        </div>
      </header>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "25px",
          justifyContent: "center",
          paddingBottom: "40px",
        }}
      >
        <DashboardCard
          title="일정 📅"
          list={dashboardData.todos}
          emptyMsg="할 일이 없어요!"
          linkTo="/schedule"
          btnText="자세히 보기"
          isTodo={true}
        />
        <DashboardCard
          title="오늘의 식단 🍚"
          list={dashboardData.meals}
          emptyMsg="기록이 없어요!"
          linkTo="/meal"
          btnText="기록하러 가기"
          isMeal={true}
          totalCalories={totalCalories}
        />
        <DashboardCard
          title="장바구니 🛍️"
          // [핵심 수정] 이제 dashboardData.cartItems가 존재하므로 정상 작동
          list={dashboardData.cartItems}
          emptyMsg="구매 목록이 비어있어요!"
          linkTo="/cart"
          btnText="목록 확인"
          isCart={true} // 아까 수정한 DashboardCard Props와 일치
          hasUnconfirmedItems={hasUnconfirmedItems}
        />
        <DashboardCard
          title="가계부 💰"
          isAccount={true}
          income={dashboardData.income}
          expense={dashboardData.expense}
          linkTo="/account"
          btnText="가계부 보기"
        />
      </div>
    </div>
  );
};

export default Home;
