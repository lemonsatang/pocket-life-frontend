// [Layout] 일정 페이지 컴포넌트
import React, { useEffect, useState } from "react";
import PlaceholderPage from "../PlaceholderPage/PlaceholderPage";
import "./SchedulePage.css";
import axios from "axios";

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate()); // 선택 날짜
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const [currentDate, setCurrentDate] = useState(new Date()); // 오늘 날짜
  const [textInput, setTextInput] = useState(""); // 일정 입력텍스트
  const token = localStorage.getItem("token"); // 토큰 가져오기
  const [todoList, setTodoList] = useState([]); // 일정리스트

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

  // 날짜 변경시 호출
  const getTodoList = async () => {
    const formattedDate = `${currentDate.getFullYear()}-${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${selectedDate.toString().padStart(2, "0")}`;

    try {
      const list = await axios.get("http://localhost:8080/api/todo/getList", {
        params: {
          date: formattedDate, // 3. 백엔드에서 요구하는 파라미터명 (date)
        },

        headers: {
          Authorization: token, //헤더에 토큰 포함
        },
      });
      setTodoList(list.data); // 가져온 데이터 저장
    } catch (e) {
      console.error("리스트를 불러오던 도중 오류가 발생했습니다.: " + e);
    }
  };

  // 일정 추가
  const createTodo = async () => {
    if (!textInput) {
      openOk("일정을 입력해주세요.");
      return;
    }

    let domonth = (currentDate.getMonth() + 1).toString(); // 월 문자화(자릿수 확인 위해)

    if (domonth.length == 1) {
      domonth = "0" + domonth; // 월이 한자리 수 일시 앞에 0붙이기
    }
    let dodate = currentDate.getFullYear() + "-" + domonth + "-" + selectedDate;

    try {
      const response = await axios.post(
        "http://localhost:8080/api/todo/create",
        { content: textInput, doDate: dodate },
        {
          headers: {
            Authorization: token, //헤더에 토큰 포함
          },
        }
      );
      await getTodoList();
    } catch (e) {
      console.error("에러 발생: ", e);
    }
  };

  // 페이지 로딩 or 날짜 변경시 호출
  useEffect(() => {
    getTodoList();
  }, [selectedDate, currentDate]);

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
          <input
            type="text"
            placeholder="일정을 입력하세요"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button className="add-btn" onClick={createTodo}>
            추가
          </button>
        </div>
        {/* 할 일 목록 */}
        <div className="todo-list">
          {todoList.length > 0 ? (
            todoList.map((todo, i) => (
              <div key={i} className="todo-item">
                <span>{todo.content}</span>
                <button className="delete-btn">삭제</button>
              </div>
            ))
          ) : (
            <div className="no-todo">일정이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
