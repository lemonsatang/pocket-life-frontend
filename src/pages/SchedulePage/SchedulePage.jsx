// [Layout] 일정 페이지 컴포넌트
import React, { useEffect, useState } from "react";
import PlaceholderPage from "../PlaceholderPage/PlaceholderPage";
import Modal from "../../components/Modal/Modal";
import "./SchedulePage.css";
import axios from "axios";
import dataApi from "../../api/api";

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate()); // 선택 날짜
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const [currentDate, setCurrentDate] = useState(new Date()); // 오늘 날짜
  const [textInput, setTextInput] = useState(""); // 일정 입력 텍스트
  const token = localStorage.getItem("token"); // 토큰 가져오기
  const [todoList, setTodoList] = useState([]); // 일정리스트
  const [editId, setEditId] = useState(null); // 수정모드인지 구분용 아이디
  const [editText, setEditText] = useState(""); // 일정 수정 텍스트
  const [todoDates, setTodoDates] = useState([]);

  // [State] 모달 상태
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
  };

  const openAlert = (message) => {
    setModalState({
      open: true,
      title: "알림",
      message,
      onConfirm: closeModal,
      confirmText: "확인",
    });
  };

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
      const list = await dataApi.get("/api/todo/getList", {
        params: {
          date: formattedDate, // 3. 백엔드에서 요구하는 파라미터명 (date)
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
      openAlert("일정을 입력해주세요.");
      return;
    }

    let domonth = (currentDate.getMonth() + 1).toString(); // 월 문자화(자릿수 확인 위해)
    let doday = selectedDate.toString();

    if (domonth.length == 1) {
      domonth = "0" + domonth; // 월이 한자리 수 일시 앞에 0붙이기
    }

    if (doday.length == 1) {
      doday = "0" + doday; // 일이 한자리 수 일시 앞에 0붙이기
    }

    let dodate = currentDate.getFullYear() + "-" + domonth + "-" + doday;

    try {
      await dataApi.post("/api/todo/create", {
        content: textInput,
        doDate: dodate,
      });
      await getTodoList();
      setTextInput("");
      getTodoDates();
    } catch (e) {
      console.error("에러 발생: ", e);
    }
  };

  // 수정버튼 => 저장 버튼 변경
  const handleEdit = (todo) => {
    setEditId(todo.todoId);
    setEditText(todo.content);
  };

  // 일정 수정
  const updateTodo = async (todoId) => {
    try {
      await dataApi.put("/api/todo/update", {
        content: editText,
        todoId: todoId,
      });
      setEditId(null);
      getTodoList();
    } catch (e) {
      console.error(e);
    }
  };

  // 삭제 요청 (모달 띄우기)
  const requestDelete = (id) => {
    setModalState({
      open: true,
      title: "알림",
      message: "삭제하시겠습니까?",
      confirmText: "확인",
      cancelText: "취소",
      showCancel: true,
      onConfirm: () => confirmDelete(id),
      onCancel: closeModal,
    });
  };

  // 실제 삭제 실행
  const confirmDelete = async (id) => {
    try {
      await dataApi.delete(`/api/todo/delete/${id}`);
      openAlert("일정이 삭제되었습니다.");
      await getTodoList();
      getTodoDates();
    } catch (e) {
      console.error(e);
      closeModal(); // 에러 시 닫기
    }
  };

  // 할일 체크박스 토글
  const toggleDone = async (todoId) => {
    try {
      await dataApi.put("/api/todo/toggleDone", {
        todoId: todoId,
      });
      getTodoList();
    } catch (e) {
      console.error(e);
    }
  };
  // 일정있는 날짜만 가져오기(달력에 표시용도)
  const getTodoDates = async () => {
    let domonth = (currentDate.getMonth() + 1).toString(); // 월 문자화(자릿수 확인 위해)

    if (domonth.length == 1) {
      domonth = "0" + domonth; // 월이 한자리 수 일시 앞에 0붙이기
    }
    let yearMonth = currentDate.getFullYear() + "-" + domonth;

    try {
      const res = await dataApi.get("/api/todo/getTodoDates", {
        params: { yearMonth: yearMonth },
      });

      setTodoDates(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // 페이지 로딩 or 날짜 변경시 호출
  useEffect(() => {
    getTodoList();
    getTodoDates();
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
              {d && todoDates.includes(d) && <div className="todo-dot"></div>}
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
              <div key={i} className="todo-item-card">
                <div className="todo-content-area">
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    onChange={() => toggleDone(todo.todoId)}
                    checked={todo.isDone || false}
                  />
                  {editId === todo.todoId ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                  ) : (
                    <span>{todo.content}</span>
                  )}
                </div>
                <div className="todo-btn-group">
                  {editId === todo.todoId ? (
                    <button
                      className="save-btn"
                      onClick={() => updateTodo(todo.todoId)}
                    >
                      저장
                    </button>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(todo)}
                    >
                      수정
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => requestDelete(todo.todoId)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-todo">일정이 없습니다.</div>
          )}
        </div>
      </div>
      <Modal
        open={modalState.open}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
        onCancel={modalState.onCancel}
      />
    </div>
  );
};

export default SchedulePage;
