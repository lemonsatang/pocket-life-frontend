// [Layout] 일정 페이지 컴포넌트
import React, { useState } from "react";
import PlaceholderPage from "../PlaceholderPage/PlaceholderPage";
import "./SchedulePage.css";

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const [currentDate, setCurrentDate] = useState(new Date()); // 오늘 날짜

  // 이전달로 이동
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );

  // 다음달로 이동
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );

  // 캘린더 생성
  const createCalendar = () => {
    const year = currentDate.getFullYear(); // 년도
    const month = currentDate.getMonth(); // 월

    // 이번 달의 1일 요일 (0: 일요일 ~ 6: 토요일)
    const startDay = new Date(year, month, 1).getDay();
    // 이번 달의 마지막 날짜
    const lastDay = new Date(year, month + 1, 0).getDate();

    const days = [];
    // 첫날 앞부분만큼 null 입력
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // null 입력 이후 날짜들 입력
    for (let d = 1; d <= lastDay; d++) {
      days.push(d);
    }

    return days;
  };
  const days = createCalendar();

  const createTodo = () => {
    console.log("추가");
  };

  return (
    <div className="schedule-container">
      {/* 왼쪽: 달력 영역 */}
      <div className="calendar-card">
        <div className="calendar-header">
          <button onClick={prevMonth} className="nav-btn">
            {"<"}
          </button>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          <button onClick={nextMonth} className="nav-btn">
            {">"}
          </button>
        </div>

        <div className="calendar-grid">
          {weekDays.map((w) => (
            <div key={w} className="weekday">
              {w}
            </div>
          ))}
          {days.map((d, i) => (
            <div
              key={i}
              className={`day ${d === selectedDate ? "selected" : ""} ${
                d === null ? "empty" : ""
              }`}
              onClick={() => d && setSelectedDate(d)}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽: 일정 영역 */}
      <div className="todo-card">
        <div className="todo-header">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월{" "}
          {selectedDate}일
        </div>
        <div className="todo-input-row">
          <input type="text" placeholder="일정을 입력하세요" />
          <button className="add-btn" onClick={createTodo}>
            추가
          </button>
        </div>
        {/* 임시 할 일 목록 */}
        <div className="todo-list">
          <div className="todo-item">
            <span>콜라 마시기</span>
            <butto>삭제</butto>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
