import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import "react-datepicker/dist/react-datepicker.css";
import "./Home.css";
import dataApi from "../../api/api";

registerLocale("ko", ko);

const Home = () => {
  /* [1. 상태 관리 - 기존 팀원 코드 유지] */
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    meals: [],
    cartItems: [],
    todos: [],
    income: 0,
    expense: 0,
  });

  /* [2. 더미 할 일 데이터 - 기존 팀원 코드 유지] */
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

  /* [3. 날짜 포맷팅 함수 - 기존 팀원 코드 유지] */
  const getDateStr = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /* [4. 데이트피커 커스텀 입력창 - 기존 팀원 코드 유지] */
  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <span onClick={onClick} ref={ref} className="home-date-input">
      {value} 📅
    </span>
  ));

  /* [5. 📍 데이터 로딩 및 가계부 금액 계산 (수정 영역)] */
  useEffect(() => {
    const dateStr = getDateStr(currentDate);
    // 현재 대시보드에서 보고 있는 달 (예: "2026-01")
    const currentYearMonth = dateStr.substring(0, 7);

    Promise.all([
      /* 식단/장바구니/할 일 API - 기존 엔드포인트 유지 */
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

      /* 📍 가계부 API: 405 에러 방지를 위해 기존에 작동하던 /latest 주소로 복구 */
      dataApi
        .get(`/api/tx/latest`)
        .then((res) => res.data)
        .catch(() => []),
    ])
      .then(([meals, cartData, todos, txs]) => {
        /* 📍 가계부 금액 필터링 및 합산 로직 */
        // 최신 내역 중 현재 선택된 달(currentYearMonth)과 일치하는 데이터만 골라냅니다.
        const monthlyTxs = (txs || []).filter((t) => {
          // 날짜 형식이 2026.01.01인 경우를 위해 점(.)을 대시(-)로 바꿔서 비교합니다.
          const txDate = t.date ? t.date.replace(/\./g, "-") : "";
          return txDate.startsWith(currentYearMonth);
        });

        // 수입 합산: 숫자가 아닐 경우를 대비해 Number() 처리
        const income = monthlyTxs
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        // 지출 합산: 숫자가 아닐 경우를 대비해 Number() 처리
        const expense = monthlyTxs
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        /* --- 식단, 장바구니, 할 일 데이터 처리 로직 (기존 코드 100% 유지) --- */
        const todayCartItems = (cartData || []).filter(
          (item) => item.shoppingDate === dateStr,
        );
        const uniqueCartItems = todayCartItems.filter(
          (item, index, self) =>
            index === self.findLastIndex((t) => t.text === item.text),
        );

        const validDummyTodos = dummyTodos.filter((t) => t.dodate === dateStr);
        const validServerTodos = (todos || []).map((t) => ({
          ...t,
          text: t.content,
        }));

        // 상태 업데이트
        setDashboardData({
          meals: meals || [],
          cartItems: uniqueCartItems,
          todos: [...validDummyTodos, ...validServerTodos],
          income,
          expense,
        });
      })
      .catch((err) => console.error("데이터 로딩 실패", err));
  }, [currentDate]);

  /* [6. 칼로리 및 장바구니 요약 계산 - 기존 팀원 코드 유지] */
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
        {/* 일정 카드 - 기존 유지 */}
        <DashboardCard
          title="오늘의 일정 📅"
          list={dashboardData.todos}
          emptyMsg="할 일이 없어요!"
          linkTo="/schedule"
          btnText="자세히 보기"
        />

        {/* 식단 카드 - 기존 유지 */}
        <DashboardCard
          title="오늘의 식단 🍚"
          list={dashboardData.meals}
          emptyMsg="기록이 없어요!"
          linkTo="/meal"
          btnText="기록하러 가기"
          isMeal
          totalCalories={totalCalories}
        />

        {/* 장바구니 카드 - 기존 유지 */}
        <DashboardCard
          title="장바구니 🛍️"
          list={dashboardData.cartItems}
          emptyMsg="구매 목록이 비어있어요!"
          linkTo="/cart"
          btnText="목록 확인"
          isCart
          hasUnconfirmedItems={hasUnconfirmedItems}
        />

        {/* 📍 가계부 카드 - 수정된 수입/지출 데이터 적용 */}
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
