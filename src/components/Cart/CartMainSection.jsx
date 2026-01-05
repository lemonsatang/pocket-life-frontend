import React from "react";
import DatePicker from "react-datepicker";
import CartItem from "./CartItem";

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
    <div
      className="pixel-card"
      style={{
        flex: 1.2,
        padding: "25px",
        minWidth: "500px",
        boxSizing: "border-box",
        transition: "opacity 0.2s",
      }}
    >
      <h3 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>
        오늘의 장바구니🛍️
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => onDateChange(-1)}
          style={{ background: "none", color: "#5e72e4", fontSize: "1.2rem" }}
        >
          ◀
        </button>
        <DatePicker
          selected={currentDate}
          onChange={onDatePickerChange}
          dateFormat="yyyy년 MM월 dd일 eeee"
          customInput={
            <span
              style={{
                fontWeight: "bold",
                cursor: "pointer",
                color: "#4a5568",
              }}
            >
              {getDateStr(currentDate)} 📅
            </span>
          }
        />
        <button
          onClick={() => onDateChange(1)}
          style={{ background: "none", color: "#5e72e4", fontSize: "1.2rem" }}
        >
          ▶
        </button>
      </div>

      <div className="input-group" style={{ marginBottom: "20px" }}>
        <input
          className="pixel-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onAdd(inputValue)}
          placeholder="구매할 물건 입력..."
        />
        <button
          className="pixel-btn"
          onClick={onSearch}
          style={{ background: "#5e72e4" }}
        >
          검색
        </button>
        <button className="pixel-btn" onClick={() => onAdd(inputValue)}>
          추가
        </button>
      </div>

      {uniqueDates.length >= 2 && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            background: "#f8f9fa",
            borderRadius: "10px",
            fontSize: "0.85rem",
          }}
        >
          <span style={{ color: "#718096", marginRight: "10px" }}>
            여러 번 구매했네요! 날짜 선택:
          </span>
          {uniqueDates.map((date, idx) => (
            <button
              key={idx}
              onClick={() => onMoveDate(date, inputValue)}
              style={{
                color: "#5e72e4",
                cursor: "pointer",
                marginRight: "8px",
                background: "none",
                textDecoration: "underline",
              }}
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
        <div
          style={{ color: "#f56565", marginBottom: "15px", fontWeight: "bold" }}
        >
          ⚠️ {searchError || "검색 결과가 없습니다."}
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxHeight: "400px",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "0 5px",
          boxSizing: "border-box",
        }}
      >
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
