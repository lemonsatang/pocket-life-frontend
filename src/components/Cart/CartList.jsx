// [Logic] 장바구니 리스트 컨테이너 - 상태 관리 및 API 호출
import React, { useState, useEffect } from "react";
import CartView from "./CartView/CartView";
import Modal from "../Modal/Modal";
import dataApi from "../../api/api";

const CartList = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTarget, setSearchTarget] = useState("");

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

  // [Logic] 날짜를 YYYY-MM-DD 형식으로 변환
  const getApiDate = (dateObj) =>
    `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(dateObj.getDate()).padStart(2, "0")}`;

  // [Logic] 즐겨찾기 목록 로드
  const fetchFavorites = () => {
    dataApi.get("/api/cart/favorites")
      .then((res) => setFavorites(res.data))
      .catch((e) => console.log("즐겨찾기 로드 실패(혹은 API 없음):", e));
  };

  // [Logic] 장바구니 아이템 로드
  const fetchItems = () => {
    setIsLoading(true);
    dataApi.get(`/api/cart?date=${getApiDate(currentDate)}`)
      .then((res) => {
        setItems(
          res.data.map((i) => ({
            ...i,
            isFavorite: i.isFavorite || false,
            count: i.count || 1,
          }))
        );
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  // [Logic] 날짜 변경 시 데이터 재로드
  useEffect(() => {
    fetchItems();
    fetchFavorites();
  }, [currentDate]);

  // [Logic] 즐겨찾기 토글
  const handleToggleFav = (item) => {
    const newFavStatus = !item.isFavorite;

    setItems((prev) =>
      prev.map((i) =>
        i.text === item.text ? { ...i, isFavorite: newFavStatus } : i
      )
    );

    if (newFavStatus) {
      setFavorites((prev) => {
        if (prev.some((f) => f.text === item.text)) return prev;
        return [...prev, { ...item, isFavorite: true }];
      });
    } else {
      setFavorites((prev) => prev.filter((f) => f.text !== item.text));
    }

    const updated = { ...item, isFavorite: newFavStatus };
    dataApi.put(`/api/cart/${item.id}`, updated);
  };

  // [Logic] 아이템 삭제
  const handleDelete = (item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    dataApi.delete(`/api/cart/${item.id}`)
      .catch(() => fetchItems());
  };

  // [Logic] 날짜 문자열 포맷팅
  const getDateStr = (dateObj) => {
    const days = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    return `${dateObj.getFullYear()}년 ${String(
      dateObj.getMonth() + 1
    ).padStart(2, "0")}월 ${String(dateObj.getDate()).padStart(2, "0")}일 ${
      days[dateObj.getDay()]
    }`;
  };

  return (
    <>
      <CartView
      currentDate={currentDate}
      items={items}
      isLoading={isLoading}
      inputValue={inputValue}
      setInputValue={setInputValue}
      searchError={searchError}
      searchResults={searchResults}
      searchTarget={searchTarget}
      uniqueFavorites={favorites}
      onDateChange={(n) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + n);
        setCurrentDate(d);
      }}
      onDatePickerChange={setCurrentDate}
      onSearch={() => {
        if (!inputValue.trim()) {
          openAlert("검색할 물건을 입력해 주세요!");
          return;
        }
        dataApi.get(`/api/cart/search?text=${encodeURIComponent(inputValue)}`)
          .then((res) => {
            const data = res.data;
            setSearchResults(data);
            const dated = data.filter((r) => r.shoppingDate);
            if (dated.length > 0) {
              const [y, m, d] = dated[0].shoppingDate.split("-").map(Number);
              setCurrentDate(new Date(y, m - 1, d));
              setSearchTarget(inputValue);
              setTimeout(() => setSearchTarget(""), 5000);
            }
            setSearchError(data.length === 0 ? "검색 결과가 없습니다." : "");
          })
          .catch(err => {
             console.error(err);
             setSearchError("검색 중 오류가 발생했습니다.");
          });
      }}
      onAdd={(text) => {
        if (!text || !text.trim()) {
          openAlert("추가할 물건을 입력해 주세요!");
          return;
        }
        dataApi.post("/api/cart", {
            text,
            isBought: false,
            shoppingDate: getApiDate(currentDate),
            isFavorite: false,
            count: 1,
        })
          .then((res) => {
            const saved = res.data;
            setItems((prev) => {
              const idx = prev.findIndex((i) => i.id === saved.id);
              if (idx !== -1) {
                return prev.map((i) => (i.id === saved.id ? saved : i));
              } else {
                return [...prev, saved];
              }
            });
          });
      }}
      onMoveDate={(dateStr, text) => {
        const [y, m, d] = dateStr.split("-").map(Number);
        setCurrentDate(new Date(y, m - 1, d));
        setSearchTarget(text);
        setTimeout(() => setSearchTarget(""), 5000);
      }}
      onMark={(item) => {
        const updated = { ...item, isBought: true };
        dataApi.put(`/api/cart/${item.id}`, updated)
          .then(() =>
            setItems(items.map((i) => (i.id === item.id ? updated : i)))
          );
      }}
      onDelete={handleDelete}
      onToggleFav={handleToggleFav}
      getDateStr={getDateStr}
      getApiDate={getApiDate}
    />
      <Modal
        open={modalState.open}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
      />
    </>
  );
};

export default CartList;
