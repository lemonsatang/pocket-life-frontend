// [Layout] 대시보드 홈 페이지 - 전체 데이터 요약 카드 표시
import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import "react-datepicker/dist/react-datepicker.css";
import "./Home.css";
import dataApi from "../../api/api";

registerLocale("ko", ko);

const Home = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    meals: [],
    cartItems: [],
    todos: [],
    income: 0,
    expense: 0,
  });

  // [Logic] 더미 할 일 데이터
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

  // [Logic] 날짜를 YYYY-MM-DD 형식으로 변환
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

  // [Logic] 대시보드 데이터 로드
  useEffect(() => {
    const dateStr = getDateStr(currentDate);

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

      // ✅ [가계부 수정 핵심]
      // 기존: /api/tx?date=... (백엔드에 없음)
      // 변경: 최신 10건 조회 API 사용
      dataApi
        .get(`/api/tx/latest`)
        .then((res) => res.data)
        .catch(() => []),
    ])
      .then(([meals, cartData, todos, txs]) => {
        // ✅ 백엔드 Tx 필드명 기준(type, amount)
        const income = (txs || [])
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const expense = (txs || [])
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const todayCartItems = (cartData || []).filter(
          (item) => item.shoppingDate === dateStr
        );
        const uniqueCartItems = todayCartItems.filter(
          (item, index, self) =>
            index === self.findLastIndex((t) => t.text === item.text)
        );

        const validDummyTodos = dummyTodos.filter((t) => t.dodate === dateStr);
        const validServerTodos = (todos || []).map((t) => ({
          ...t,
          text: t.content,
        }));

        setDashboardData({
          meals: meals || [],
          cartItems: uniqueCartItems,
          todos: [...validDummyTodos, ...validServerTodos],
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

  const hasUnconfirmedItems = dashboardData.cartItems.some(
    (item) => !item.isBought
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
