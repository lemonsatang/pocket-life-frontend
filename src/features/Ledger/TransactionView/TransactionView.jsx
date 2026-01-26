import React, { useState, useEffect } from "react";
import "./TransactionView.css";
import dataApi from "../../../api/api";
import Modal from "../../../components/Modal/Modal";
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "../../../styles/DatePicker.css";

registerLocale("ko", ko);

const TransactionView = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  viewDate,
}) => {
  // [1. 상태 관리]
  const [filter, setFilter] = useState("전체"); // 필터 상태 (전체/수입/지출)
  const [sortOrder, setSortOrder] = useState("latest"); // 정렬 상태 (최신순/과거순)
  const [editingId, setEditingId] = useState(null); // 수정 중인 항목 ID (null이면 신규 입력)
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const itemsPerPage = 10; // 한 페이지에 보여줄 내역 수
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false); // 정렬 드롭다운 열림/닫힘 상태

  // [모달 상태 관리]
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    message: "",
    type: "success",
    onConfirm: null,
  });

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
  };

  const openAlert = (message, type = "warning") => {
    setModalState({
      open: true,
      title: "알림",
      message,
      type: type,
      onConfirm: closeModal,
      confirmText: "확인",
    });
  };

  // 입력 폼 상태 (이미지 UI에 맞춰 필드 구성)
  const [formData, setFormData] = useState({
    date: new Date(), // Date 객체로 변경
    item: "",
    category: "",
    amount: "",
    type: "지출", // 기본은 '지출' 버튼 활성화
    memo: "",
  });

  // 📍 달력 열림/닫힘 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // [월 선택 동기화] 위에서 월을 선택하면 아래 날짜도 같은 월의 1일로 설정
  useEffect(() => {
    if (viewDate) {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const today = new Date();
      const isSameMonth =
        today.getFullYear() === year && today.getMonth() === month;
      const targetDate = isSameMonth
        ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
        : new Date(year, month, 1);

      setFormData((prev) => ({
        ...prev,
        date: targetDate,
      }));
    }
  }, [viewDate]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSortDropdownOpen &&
        !event.target.closest(".custom-dropdown-wrapper")
      ) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  // 날짜 포맷팅 함수: "2026년 01월 21일 수요일" 형식으로 변환
  const formatDateWithDay = (date) => {
    if (!date) return "날짜 선택";

    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return "날짜 선택";

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const dayNames = [
        "일요일",
        "월요일",
        "화요일",
        "수요일",
        "목요일",
        "금요일",
        "토요일",
      ];
      const dayName = dayNames[dateObj.getDay()];

      return `${year}년 ${month}월 ${day}일 ${dayName}`;
    } catch (e) {
      return "날짜 선택";
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = (days) => {
    const newDate = new Date(formData.date);
    newDate.setDate(newDate.getDate() + days);
    setFormData({ ...formData, date: newDate });
  };

  // DatePicker 커스텀 입력 컴포넌트
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => {
    return (
      <div
        ref={ref}
        onClick={(e) => {
          if (e.target.tagName !== "BUTTON") {
            setIsDatePickerOpen(!isDatePickerOpen);
            onClick(e);
          }
        }}
        style={{
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          padding: "10px 8px",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          background: "#fff",
          fontSize: "14px",
          color: "#2d3748",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDateChange(-1);
          }}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            color: "#6f76a1",
            cursor: "pointer",
            padding: "2px 6px",
            outline: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ‹
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            flex: 1,
            justifyContent: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <span role="img" aria-label="calendar" style={{ flexShrink: 0 }}>
            📅
          </span>
          <span
            style={{
              whiteSpace: "nowrap",
              display: "inline-block",
              width: "145px",
              textAlign: "center",
            }}
          >
            {formatDateWithDay(formData.date)}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDateChange(1);
          }}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            color: "#6f76a1",
            cursor: "pointer",
            padding: "2px 6px",
            outline: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ›
        </button>
      </div>
    );
  });

  // [2. 수정 버튼 클릭 시 실행: 선택한 데이터를 폼으로 가져오기]
  const handleEditClick = (tx) => {
    setEditingId(tx.id); // 수정 모드 전환
    setFormData({
      date: new Date(tx.rawDate), // Date 객체로 변환
      item: tx.item,
      category: tx.category,
      amount: tx.amount.toString(),
      type: tx.type, // '수입' 또는 '지출'
      memo: tx.memo || "",
    });
  };

  // [3. 폼 입력값 변경 핸들러]
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // [4. 저장(수정/추가) 실행 함수]
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.amount) {
      openAlert("항목과 금액을 입력해주세요.", "warning");
      return;
    }

    try {
      // 날짜를 YYYY-MM-DD 형식으로 변환
      const dateStr =
        formData.date instanceof Date
          ? formData.date.toISOString().split("T")[0]
          : formData.date;

      if (editingId) {
        // --- 📍 수정 모드일 때 (PUT 요청) ---
        const updateData = {
          txDate: dateStr,
          title: formData.item,
          category: formData.category,
          memo: formData.memo,
          amount: parseInt(formData.amount),
          type: formData.type === "수입" ? "INCOME" : "EXPENSE",
        };
        await dataApi.put(`/api/tx/${editingId}`, updateData);
        openAlert("수정이 완료되었습니다.", "success");
        setEditingId(null);
        window.location.reload(); // 데이터 갱신을 위해 새로고침
      } else {
        // --- 📍 신규 입력 모드일 때 ---
        await onAddTransaction({ ...formData, date: dateStr });
      }
      // 폼 초기화
      setFormData({
        date: new Date(),
        item: "",
        category: "",
        amount: "",
        type: "지출",
        memo: "",
      });
    } catch (error) {
      console.error("저장 실패:", error);
      openAlert("저장에 실패했습니다.", "warning");
    }
  };

  // [5. 데이터 필터링 및 정렬]
  const filteredData = transactions
    .filter((t) => (filter === "전체" ? true : t.type === filter))
    .sort((a, b) => {
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  // [6. 📍 페이징 계산 (사라졌던 기능 복구)]
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // [7. 📍 요약 정보 계산 (사라졌던 하단 요약 복구)]
  const totalIncome = filteredData
    .filter((t) => t.type === "수입")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = filteredData
    .filter((t) => t.type === "지출")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="transaction-view-container">
      {/* --- 왼쪽 패널: 리스트 및 페이징 --- */}
      <div className="left-transaction-panel">
        <div className="table-top-bar">
          <div className="top-controls-left-group">
            <div className="custom-dropdown-wrapper">
              <button
                className="custom-dropdown-button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                type="button"
              >
                <span>{sortOrder === "latest" ? "최신순" : "과거순"}</span>
                <span className="dropdown-arrow">▾</span>
              </button>
              {isSortDropdownOpen && (
                <div className="custom-dropdown-menu">
                  <button
                    className={`custom-dropdown-option ${sortOrder === "latest" ? "selected" : ""}`}
                    onClick={() => {
                      setSortOrder("latest");
                      setIsSortDropdownOpen(false);
                    }}
                    type="button"
                  >
                    최신순
                  </button>
                  <button
                    className={`custom-dropdown-option ${sortOrder === "oldest" ? "selected" : ""}`}
                    onClick={() => {
                      setSortOrder("oldest");
                      setIsSortDropdownOpen(false);
                    }}
                    type="button"
                  >
                    과거순
                  </button>
                </div>
              )}
            </div>
            <div className="filter-buttons">
              {["전체", "수입", "지출"].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => {
                    setFilter(f);
                    setCurrentPage(1);
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="transaction-list-card">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>항목</th>
                <th>카테고리</th>
                <th>비고</th>
                <th>금액</th>
                <th>수정/삭제</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((t) => (
                <tr key={t.id}>
                  <td className="td-narrow">{t.date}</td>
                  <td className="td-narrow text-bold">{t.item}</td>
                  <td className="td-narrow">
                    <span className="category-badge">{t.category}</span>
                  </td>
                  <td className="td-narrow text-memo">{t.memo}</td>
                  <td
                    className={`td-narrow text-bold ${t.isIn ? "plus-color" : "minus-color"}`}
                  >
                    {t.isIn
                      ? `+${t.amount.toLocaleString()}`
                      : `-${t.amount.toLocaleString()}`}
                  </td>
                  <td className="td-narrow">
                    <div className="action-button-group">
                      <button
                        className="pill-btn edit-pill"
                        onClick={() => handleEditClick(t)}
                      >
                        수정
                      </button>
                      <button
                        className="pill-btn delete-pill"
                        onClick={() => onDeleteTransaction(t.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 📍 페이징 버튼 영역 복구 */}
          <div className="pagination-container">
            <button
              className="page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-num-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* --- 오른쪽 패널: 입력 폼 및 요약 --- */}
      <div className="right-input-panel">
        <div className="side-card">
          <h3 className="card-header-title">
            {editingId ? "내역 수정하기 ✏️" : "거래내용"}
          </h3>
          <div className="type-selector">
            <button
              className={formData.type === "수입" ? "active" : ""}
              onClick={() => setFormData({ ...formData, type: "수입" })}
            >
              수입
            </button>
            <button
              className={formData.type === "지출" ? "active" : ""}
              onClick={() => setFormData({ ...formData, type: "지출" })}
            >
              지출
            </button>
          </div>
          <form className="input-form" onSubmit={handleSubmit}>
            {/* 📍 수정됨: 금액 입력 필드 - 7자리 제한 */}
            <input
              type="number"
              name="amount"
              placeholder="금액"
              value={formData.amount}
              onChange={handleInputChange}
              onInput={(e) => {
                if (e.target.value.length > 7)
                  e.target.value = e.target.value.slice(0, 7);
              }}
            />
            {/* 📍 수정됨: 항목 입력 필드 - 7자 제한 */}
            <input
              type="text"
              name="item"
              placeholder="항목 (예: 이자, 편의점)"
              value={formData.item}
              onChange={handleInputChange}
              maxLength={7}
            />
            {/* 📍 수정됨: 카테고리 입력 필드 - 7자 제한 */}
            <input
              type="text"
              name="category"
              placeholder="카테고리"
              value={formData.category}
              onChange={handleInputChange}
              maxLength={7}
            />
            <DatePicker
              selected={formData.date}
              onChange={(date) => {
                setFormData({ ...formData, date });
                setIsDatePickerOpen(false);
              }}
              open={isDatePickerOpen}
              onCalendarOpen={() => setIsDatePickerOpen(true)}
              onCalendarClose={() => setIsDatePickerOpen(false)}
              dateFormat="yyyy년 M월 d일"
              locale="ko"
              customInput={<CustomDateInput />}
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div
                  className="react-datepicker__header"
                  style={{ position: "relative", textAlign: "center" }}
                >
                  <h2 className="react-datepicker__current-month">
                    {date.getFullYear()}년{" "}
                    {String(date.getMonth() + 1).padStart(2, "0")}월
                  </h2>
                </div>
              )}
            />
            {/* 📍 수정됨: 메모 입력 필드 - 7자 제한 */}
            <input
              type="text"
              name="memo"
              placeholder="메모"
              value={formData.memo}
              onChange={handleInputChange}
              maxLength={7}
            />
            <button type="submit" className="submit-save-btn">
              {editingId ? "수정하기" : "저장하기"}
            </button>
            {editingId && (
              <button
                type="button"
                className="submit-save-btn"
                style={{ backgroundColor: "#bbb", marginTop: "5px" }}
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    date: new Date(),
                    item: "",
                    category: "",
                    amount: "",
                    type: "지출",
                    memo: "",
                  });
                }}
              >
                취소
              </button>
            )}
          </form>
        </div>

        {/* 📍 하단 요약(Summary) 영역 복구 */}
        <div className="side-card">
          <h3 className="card-header-title">요약</h3>
          <div className="summary-row">
            <span>수입</span>
            <span className="plus-color">
              +{totalIncome.toLocaleString()}원
            </span>
          </div>
          <div className="summary-row">
            <span>지출</span>
            <span className="minus-color">
              -{totalExpense.toLocaleString()}원
            </span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total-row text-bold">
            <span>남은금액</span>
            <span>{(totalIncome - totalExpense).toLocaleString()}원</span>
          </div>
        </div>
      </div>
      <Modal
        open={modalState.open}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText || "확인"}
      />
    </div>
  );
};

export default TransactionView;
