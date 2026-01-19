import React, { useEffect, useState } from "react";
import dataApi from "../../api/api"; // 서버(Back-end)와 통신하기 위한 도구
import "./LedgerPage.css";

const LedgerPage = () => {
  // --- [1. 상태 관리: 화면의 변화를 기록하는 변수들] ---
  // 시작하자마자 "거래내역(transaction)" 화면이 보이도록 초기값을 설정했습니다.
  const [activeMenu, setActiveMenu] = useState("transaction");

  const [txs, setTxs] = useState([]); // 서버에서 받아온 가계부 목록 전체 저장
  const [filter, setFilter] = useState("ALL"); // '전체', '수입', '지출' 중 무엇을 보여줄지 결정
  const [sortOrder, setSortOrder] = useState("DESC"); // '최신순(DESC)', '과거순(ASC)' 정렬 기준
  const [editingId, setEditingId] = useState(null); // 수정 버튼을 눌렀을 때 해당 데이터의 ID 저장
  const [currentPage, setCurrentPage] = useState(1); // 현재 몇 페이지를 보고 있는지 저장
  const itemsPerPage = 7; // 한 페이지에 7개씩만 보여주기로 약속!

  // 사용자가 입력창에 타이핑하는 내용을 실시간으로 담는 바구니(객체)
  const [form, setForm] = useState({
    txDate: new Date().toISOString().split("T")[0], // 오늘 날짜를 "2026-01-19" 형태로 자동 입력
    title: "", // 항목명 (예: 김치찌개)
    category: "", // 카테고리 (예: 식비)
    memo: "", // 비고/메모 (예: 친구랑 점심)
    amount: "", // 금액
    type: "EXPENSE", // 기본값은 '지출'로 설정
  });

  // --- [2. 함수: 서버와 대화하거나 데이터를 가공하는 로직] ---

  // (1) 서버에서 데이터 가져오기 (2026년 1월치)
  const fetchTx = () => {
    dataApi
      .get(`/api/tx?year=2026&month=1`)
      .then((res) => setTxs(res.data || [])) // 가져온 데이터를 txs 변수에 저장
      .catch((err) => console.error("데이터 로드 실패:", err));
  };

  // 컴포넌트(화면)가 처음 짠! 하고 나타날 때 fetchTx()를 실행해라!
  useEffect(() => {
    fetchTx();
  }, []);

  // (2) 저장 버튼 클릭 시 실행 (새로 만들기 or 수정하기)
  const handleSave = async (e) => {
    e.preventDefault(); // 버튼 클릭 시 페이지가 새로고침 되는 걸 막아줍니다.
    if (!form.amount || !form.title)
      return alert("항목과 금액을 입력해주세요!");

    try {
      const sendData = { ...form, amount: Number(form.amount) }; // 금액은 꼭 숫자로 바꿔서 보냅니다.

      if (editingId) {
        // 수정 모드: 이미 있는 ID가 있다면 PUT(수정) 요청을 보냅니다.
        await dataApi.put(`/api/tx/${editingId}`, sendData);
      } else {
        // 추가 모드: ID가 없다면 POST(등록) 요청을 보냅니다.
        await dataApi.post("/api/tx", sendData);
      }
      resetForm(); // 입력 칸을 다시 깨끗하게 비웁니다.
      fetchTx(); // 목록을 새로고침해서 방금 쓴 글이 보이게 합니다.
    } catch (err) {
      alert("저장 실패!");
    }
  };

  // (3) 삭제 버튼 클릭 시 실행
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return; // 실수 방지용 확인 창
    try {
      await dataApi.delete(`/api/tx/${id}`);
      fetchTx(); // 삭제 후 목록 새로고침
    } catch (err) {
      alert("삭제 실패");
    }
  };

  // (4) 입력 폼 초기화 함수 (수정 취소나 저장 후 사용)
  const resetForm = () => {
    setEditingId(null);
    setForm({
      txDate: new Date().toISOString().split("T")[0],
      title: "",
      category: "",
      memo: "",
      amount: "",
      type: "EXPENSE",
    });
  };

  // (5) 데이터 가공 로직: 필터링(수입/지출)하고 정렬(최신순)해서 최종 목록을 만듦
  const getProcessedTxs = () => {
    // 필터링 적용
    let result = txs.filter((t) =>
      filter === "ALL" ? true : t.type === filter
    );
    // 정렬 적용
    result.sort((a, b) => {
      const dateA = new Date(a.txDate);
      const dateB = new Date(b.txDate);
      return sortOrder === "DESC" ? dateB - dateA : dateA - dateB;
    });
    return result;
  };

  const processedTxs = getProcessedTxs(); // 최종 가공된 목록
  const totalPages = Math.ceil(processedTxs.length / itemsPerPage) || 1; // 전체 페이지 수 계산
  const currentItems = processedTxs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ); // 현재 페이지용 데이터만 싹둑!

  // 이번 달 수입/지출 총합 계산 (오른쪽 하단 요약용)
  const incomeSum = txs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expenseSum = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  // --- [3. 렌더링: 실제로 우리 눈에 보이는 HTML 구조] ---
  return (
    <div className="pocket-container">
      {/* 사이드바 메뉴 영역 */}
      <aside className="pocket-sidebar">
        <div className="side-title">Pocket Life</div>
        {/* 버튼을 누르면 activeMenu 상태가 바뀌며 화면이 전환됩니다. */}
        <button
          className={`side-btn ${activeMenu === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveMenu("dashboard")}
        >
          대시보드
        </button>
        <button
          className={`side-btn ${activeMenu === "transaction" ? "active" : ""}`}
          onClick={() => setActiveMenu("transaction")}
        >
          거래내역
        </button>
      </aside>

      {/* 메뉴 선택에 따른 화면 분기 처리 (삼항 연산자) */}
      {activeMenu === "transaction" ? (
        <>
          {/* [거래내역 메인 화면] */}
          <main className="pocket-main">
            <div className="main-header">
              <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                가계부 거래내역
              </span>
              <div className="month-badge">2026년 1월</div>
            </div>

            {/* 필터와 정렬 조절 영역 */}
            <div className="control-row">
              <div className="filter-row">
                {["ALL", "INCOME", "EXPENSE"].map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "active" : ""}
                    onClick={() => {
                      setFilter(f);
                      setCurrentPage(1);
                    }}
                  >
                    {f === "ALL" ? "전체" : f === "INCOME" ? "수입" : "지출"}
                  </button>
                ))}
              </div>
              <select
                className="sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="DESC">내림차순</option>
                <option value="ASC">오름차순</option>
              </select>
            </div>

            {/* 실제 내역이 들어가는 표(Table) */}
            <table className="tx-table">
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
                    <td>{t.txDate.substring(5).replace("-", ".")}</td>
                    <td>{t.title}</td>
                    <td>
                      <span className="cate-tag">{t.category}</span>
                    </td>
                    <td>{t.memo || "-"}</td>
                    <td
                      className={t.type === "INCOME" ? "txt-plus" : "txt-minus"}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {t.amount.toLocaleString()}원
                    </td>
                    <td>
                      {/* 수정 버튼을 누르면 해당 데이터(t)가 입력창으로 쏙 들어갑니다. */}
                      <button
                        className="btn-row-edit"
                        onClick={() => {
                          setEditingId(t.id);
                          setForm(t);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="btn-row-del"
                        onClick={() => handleDelete(t.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 페이지 번호 버튼들 */}
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </main>

          {/* [오른쪽 입력창 & 요약 영역] */}
          <aside className="pocket-right">
            <div className="card-box">
              <h4 style={{ textAlign: "center", marginTop: 0 }}>거래 내용</h4>
              {/* 수입/지출 탭 선택 */}
              <div className="type-tabs">
                <button
                  className={form.type === "INCOME" ? "active" : ""}
                  onClick={() => setForm({ ...form, type: "INCOME" })}
                >
                  수입
                </button>
                <button
                  className={form.type === "EXPENSE" ? "active" : ""}
                  onClick={() => setForm({ ...form, type: "EXPENSE" })}
                >
                  지출
                </button>
              </div>
              <input
                type="text"
                placeholder="항목명"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                type="number"
                placeholder="금액"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <input
                type="text"
                placeholder="카테고리"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                type="date"
                value={form.txDate}
                onChange={(e) => setForm({ ...form, txDate: e.target.value })}
              />
              <input
                type="text"
                placeholder="메모"
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
              />
              <button className="btn-save-main" onClick={handleSave}>
                {editingId ? "저장(수정)" : "저장(기록)"}
              </button>
            </div>

            {/* 요약 현황 박스 */}
            <div className="card-box">
              <h4 style={{ textAlign: "center", marginTop: 0 }}>월간 요약</h4>
              <div className="summary-line">
                <span>수입</span>
                <span className="txt-plus">
                  +{incomeSum.toLocaleString()}원
                </span>
              </div>
              <div className="summary-line">
                <span>지출</span>
                <span className="txt-minus">
                  -{expenseSum.toLocaleString()}원
                </span>
              </div>
              <div className="summary-line total">
                <span>잔액</span>
                <span>{(incomeSum - expenseSum).toLocaleString()}원</span>
              </div>
            </div>
          </aside>
        </>
      ) : (
        /* [대시보드 선택 시 나타날 화면 영역] */
        <main
          className="pocket-main"
          style={{ width: "1040px", textAlign: "center", padding: "100px" }}
        >
          <h2 style={{ fontSize: "30px", color: "#8e8efc" }}>📊 대시보드</h2>
          <p>화면 준비중 입니다.</p>
        </main>
      )}
    </div>
  );
};

export default LedgerPage;
