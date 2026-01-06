import React from "react";
import DatePicker from "react-datepicker";
import CartItem from "../CartItem/CartItem";
import "./CartMainSection.css";

const CartMainSection = (props) => {
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
        <DatePicker
          selected={currentDate}
          onChange={onDatePickerChange}
          dateFormat="yyyy년 MM월 dd일 eeee"
          customInput={
            <span className="cart-main-date-input">
              {getDateStr(currentDate)} 📅
            </span>
          }
        />
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
