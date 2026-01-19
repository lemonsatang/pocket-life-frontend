// [Page] 가계부 상세 페이지
import React, { useEffect, useState } from "react";
import dataApi from "../../api/api";
import "./LedgerPage.css";

const LedgerPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState("ALL");

  // ✅ [수정] 백엔드 TxDTO 구조와 100% 일치시킴 (category, memo 추가)
  const [form, setForm] = useState({
    txDate: new Date().toISOString().split("T")[0],
    title: "",
    category: "기타", // 백엔드 TxDTO의 category 필드 대응
    memo: "", // 백엔드 TxDTO의 memo 필드 대응
    amount: "",
    type: "EXPENSE", // 백엔드 Enum 타입 (INCOME 또는 EXPENSE)
  });

  // [기능] 데이터 불러오기
  const fetchTx = () => {
    dataApi
      .get(`/api/tx?year=${year}&month=${month}`)
      .then((res) => setTxs(res.data || []))
      .catch((err) => console.error("조회 실패:", err));
  };

  useEffect(() => {
    fetchTx();
  }, [year, month]);

  /**
   * ✅ [중요] 백엔드 TxController 주소에 맞게 수정
   */
  const handleAddTx = async (e) => {
    e.preventDefault();

    if (!form.title || !form.amount) {
      alert("내용과 금액을 입력해주세요!");
      return;
    }

    // 백엔드 TxRequest record 형식에 맞게 데이터 가공
    const sendData = {
      txDate: form.txDate,
      title: form.title,
      category: form.category || "기타",
      memo: form.memo || "",
      amount: Number(form.amount), // long 타입 대응
      type: form.type, // INCOME 혹은 EXPENSE
    };

    try {
      // ✅ [주소 수정] /api/tx/add 가 아니라 /api/tx 로 보내야 함
      await dataApi.post("/api/tx", sendData);
      alert("성공적으로 기록되었습니다!");

      setForm({ ...form, title: "", amount: "", memo: "" });
      fetchTx();
    } catch (error) {
      console.error("추가 실패:", error.response?.data);
      alert("저장에 실패했습니다. 데이터 형식을 확인해주세요.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ✅ [수정] 백엔드 필드명 t.type으로 합계 계산
  const income = txs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expense = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const filteredTxs = txs.filter((t) =>
    filter === "ALL" ? true : t.type === filter
  );

  return (
    <div className="ledger-wrap">
      <h2 className="ledger-title">💰 My Pocket Ledger</h2>

      {/* [상단] 입력 영역 (이미지 이름 반영) */}
      <div className="ledger-input-box">
        <form onSubmit={handleAddTx} className="ledger-form">
          <input
            type="date"
            name="txDate"
            value={form.txDate}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="title"
            placeholder="항목(내용)"
            value={form.title}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="category"
            placeholder="카테고리"
            value={form.category}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="amount"
            placeholder="금액"
            value={form.amount}
            onChange={handleInputChange}
          />
          <select name="type" value={form.type} onChange={handleInputChange}>
            <option value="EXPENSE">지출</option>
            <option value="INCOME">수입</option>
          </select>
          <button type="submit" className="pixel-btn">
            저장(기록)
          </button>
        </form>
      </div>

      <div className="ledger-summary">
        <span>
          수입 <b className="plus">+{income.toLocaleString()}원</b>
        </span>
        <span>
          지출 <b className="minus">-{expense.toLocaleString()}원</b>
        </span>
        <span>
          합계 <b>{(income - expense).toLocaleString()}원</b>
        </span>
      </div>

      {/* [하단] 상세 리스트 */}
      <ul className="ledger-list">
        {filteredTxs.map((t) => (
          <li key={t.id} className={t.type === "INCOME" ? "in" : "out"}>
            <div className="item-main">
              <span className="date">{t.txDate}</span>
              <span className="title">{t.title}</span>
              <span className="cate">({t.category})</span>
            </div>
            <span className="amt">
              {t.type === "INCOME" ? "+" : "-"} {t.amount.toLocaleString()}원
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LedgerPage;
