import React, { useState, useEffect } from "react";
import CartView from "./CartView";

const CartList = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTarget, setSearchTarget] = useState("");

  const getApiDate = (dateObj) =>
    `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(dateObj.getDate()).padStart(2, "0")}`;

  const fetchFavorites = () => {
    // [변경] api/shopping -> api/cart
    fetch("http://localhost:8080/api/cart/favorites")
      .then((res) => res.json())
      .then((data) => setFavorites(data))
      .catch((e) => console.log("즐겨찾기 로드 실패(혹은 API 없음):", e));
  };

  const fetchItems = () => {
    setIsLoading(true);
    // [변경] api/shopping -> api/cart
    fetch(`http://localhost:8080/api/cart?date=${getApiDate(currentDate)}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(
          data.map((i) => ({
            ...i,
            isFavorite: i.isFavorite || false,
            count: i.count || 1,
          }))
        );
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchItems();
    fetchFavorites();
  }, [currentDate]);

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
    // [변경] api/shopping -> api/cart
    fetch(`http://localhost:8080/api/cart/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).then(() => {
      // fetchItems();
    });
  };

  const handleDelete = (item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    // [변경] api/shopping -> api/cart
    fetch(`http://localhost:8080/api/cart/${item.id}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) fetchItems();
    });
  };

  return (
    <CartView
      {...{
        currentDate,
        items,
        isLoading,
        inputValue,
        setInputValue,
        searchError,
        searchResults,
        searchTarget,
      }}
      uniqueFavorites={favorites}
      onDateChange={(n) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + n);
        setCurrentDate(d);
      }}
      onDatePickerChange={setCurrentDate}
      onSearch={() => {
        if (!inputValue.trim()) return;
        // [변경] api/shopping -> api/cart
        fetch(
          `http://localhost:8080/api/cart/search?text=${encodeURIComponent(
            inputValue
          )}`
        )
          .then((res) => res.json())
          .then((data) => {
            setSearchResults(data);
            const dated = data.filter((r) => r.shoppingDate);
            if (dated.length > 0) {
              const [y, m, d] = dated[0].shoppingDate.split("-").map(Number);
              setCurrentDate(new Date(y, m - 1, d));
              setSearchTarget(inputValue);
              setTimeout(() => setSearchTarget(""), 5000);
            }
            setSearchError(data.length === 0 ? "검색 결과가 없습니다." : "");
          });
      }}
      onAdd={(text) => {
        if (!text || !text.trim()) return;
        // [변경] api/shopping -> api/cart
        fetch("http://localhost:8080/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            isBought: false,
            shoppingDate: getApiDate(currentDate),
            isFavorite: false,
            count: 1,
          }),
        })
          .then((res) => res.json())
          .then((saved) => {
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
        // [변경] api/shopping -> api/cart
        fetch(`http://localhost:8080/api/cart/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }).then(() =>
          setItems(items.map((i) => (i.id === item.id ? updated : i)))
        );
      }}
      onDelete={handleDelete}
      onToggleFav={handleToggleFav}
      getDateStr={(dateObj) => {
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
      }}
      getApiDate={getApiDate}
    />
  );
};
export default CartList;
