import React, { useState } from "react";
import DatePicker from "react-datepicker";
import CartItem from "../CartItem/CartItem";
import "./CartMainSection.css";

const CartMainSection = (props) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 달력 열림/닫힘 상태
  const {
    currentDate,
    onDateChange,
    onDatePickerChange,
    getDateStr,
    getApiDate,
    inputValue,
    setInputValue,
    onSearch,
    onAdd,
    isLoading,
    searchResults,
    onMoveDate,
    searchError,
    items,
    searchTarget,
    onMark,
    onDelete,
    onToggleFav,
  } = props;

  // 로딩 중에는 필터링을 풀어서 이전 데이터가 화면에 남아있게 함 (깜빡임 방지)
  const displayedItems = isLoading
    ? items.filter((i) => i.shoppingDate !== null)
    : items.filter((i) => i.shoppingDate === getApiDate(currentDate));

  // 유효한 날짜 결과 필터링
  const datedResults = searchResults.filter((res) => res.shoppingDate);
  const uniqueDates = Array.from(
    new Set(datedResults.map((r) => r.shoppingDate))
  ).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="pixel-card cart-main-card">
      <h3 className="cart-main-title">오늘의 장바구니🛍️</h3>

      <div className="cart-main-date-picker">
        <button
          className="cart-main-date-btn"
          onClick={() => onDateChange(-1)}
        >
          ◀
        </button>
        <div style={{ width: "200px", display: "flex", justifyContent: "center" }}>
          <DatePicker
            selected={currentDate}
            onChange={(date) => {
              onDatePickerChange(date);
              setIsDatePickerOpen(false);
            }}
            open={isDatePickerOpen}
            onInputClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            onClickOutside={() => setIsDatePickerOpen(false)}
            dateFormat="yyyy년 MM월 dd일 eeee"
            customInput={
              <span 
                className="cart-main-date-input"
                onClick={(e) => {
                  setIsDatePickerOpen(!isDatePickerOpen);
                  if (e) e.stopPropagation();
                }}
              >
                {getDateStr(currentDate)} 📅
              </span>
            }
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
        </div>
        <button
          className="cart-main-date-btn"
          onClick={() => onDateChange(1)}
        >
          ▶
        </button>
      </div>

      <div className="input-group cart-main-input-group">
        <input
          className="pixel-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onAdd(inputValue)}
          placeholder="구매할 물건 입력..."
        />
        <button
          className="pixel-btn cart-main-search-btn"
          onClick={onSearch}
        >
          검색
        </button>
        <button className="pixel-btn" onClick={() => onAdd(inputValue)}>
          추가
        </button>
      </div>

      {uniqueDates.length >= 2 && (
        <div className="cart-main-date-selector">
          <span className="cart-main-date-selector-label">
            여러 번 구매했네요! 날짜 선택:
          </span>
          {uniqueDates.map((date, idx) => (
            <button
              key={idx}
              className="cart-main-date-selector-btn"
              onClick={() => onMoveDate(date, inputValue)}
            >
              {date}
            </button>
          ))}
        </div>
      )}

      {(searchError ||
        (inputValue &&
          searchResults.length > 0 &&
          uniqueDates.length === 0)) && (
        <div className="cart-main-error">
          ⚠️ {searchError || "검색 결과가 없습니다."}
        </div>
      )}

      <div className="cart-main-item-list">
        {displayedItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            searchTarget={searchTarget}
            onMark={onMark}
            onDelete={onDelete}
            onToggleFav={onToggleFav}
          />
        ))}
      </div>
    </div>
  );
};

export default CartMainSection;
