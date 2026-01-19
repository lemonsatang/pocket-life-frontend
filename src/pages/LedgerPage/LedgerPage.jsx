import React, { useEffect, useState } from "react";
import dataApi from "../../api/api"; // 서버와 통신하기 위한 axios 설정 파일
import "./LedgerPage.css";

const LedgerPage = () => {
  // --- [1. 상태 관리: 화면에 변하는 데이터를 저장하는 곳] ---
  const [activeMenu, setActiveMenu] = useState("dashboard"); // 왼쪽 메뉴 (대시보드 / 거래내역) 전환용
  const [txs, setTxs] = useState([]); // 서버에서 받아온 전체 거래 내역 목록
  const [filter, setFilter] = useState("ALL"); // 수입/지출/전체 필터링 기준
  const [sortOrder, setSortOrder] = useState("DESC"); // 정렬 순서 (최신순 / 과거순)
  const [editingId, setEditingId] = useState(null); // 수정 중인 항목의 ID (null이면 새 글 작성)
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const itemsPerPage = 7; // 한 페이지에 보여줄 항목 수

  // 입력 폼에 들어가는 데이터 (사용자가 타이핑하는 내용)
  const [form, setForm] = useState({
    txDate: new Date().toISOString().split("T")[0], // 오늘 날짜를 기본값(YYYY-MM-DD)으로 설정
    title: "", // 항목명
    category: "", // 카테고리
    memo: "", // 메모 (비고)
    amount: "", // 금액
    type: "EXPENSE", // 기본값은 '지출'
  });

  // --- [2. 서버 통신: 데이터를 가져오고 보내는 함수들] ---

  // (1) 데이터 불러오기: 서버에서 2026년 1월 데이터를 가져와서 txs 상태에 저장
  const fetchTx = () => {
    dataApi
      .get(`/api/tx?year=2026&month=1`)
      .then((res) => setTxs(res.data || [])) // 성공하면 목록 업데이트
      .catch((err) => console.error(err)); // 에러 나면 콘솔에 출력
  };

  // 컴포넌트가 처음 화면에 나타날 때 딱 한 번 실행
  useEffect(() => {
    fetchTx();
  }, []);

  // (2) 저장/수정하기: 저장 버튼 클릭 시 실행
  const handleSave = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    if (!form.amount || !form.title)
      return alert("항목과 금액을 입력해주세요!"); // 필수 입력값 체크

    try {
      const sendData = { ...form, amount: Number(form.amount) }; // 금액을 숫자 타입으로 변환

      if (editingId) {
        // 수정 모드일 때 (PUT 요청)
        await dataApi.put(`/api/tx/${editingId}`, sendData);
      } else {
        // 신규 작성 모드일 때 (POST 요청)
        await dataApi.post("/api/tx", sendData);
      }

      resetForm(); // 입력 칸 초기화
      fetchTx(); // 저장 후 목록 새로고침
    } catch (err) {
      console.error(err);
      alert("저장 실패 (서버 로그를 확인하세요)");
    }
  };

  // (3) 삭제하기
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return; // 한 번 더 확인
    try {
      await dataApi.delete(`/api/tx/${id}`);
      fetchTx(); // 삭제 후 목록 새로고침
    } catch (err) {
      alert("삭제 실패");
    }
  };

  // (4) 입력 폼 초기화: 수정 중이었거나 저장 후에 빈 칸으로 되돌림
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

  // --- [3. 데이터 가공: 필터링, 정렬, 페이징 계산] ---

  const getProcessedTxs = () => {
    // 1단계: 필터링 (전체인 경우 그대로, 아니면 수입/지출 타입에 맞는 것만 남김)
    let result = txs.filter((t) =>
      filter === "ALL" ? true : t.type === filter
    );

    // 2단계: 정렬 (DESC는 최신순, ASC는 과거순)
    result.sort((a, b) => {
      const dateA = new Date(a.txDate);
      const dateB = new Date(b.txDate);
      return sortOrder === "DESC" ? dateB - dateA : dateA - dateB;
    });
    return result;
  };

  const processedTxs = getProcessedTxs(); // 가공된 전체 목록
  const totalPages = Math.ceil(processedTxs.length / itemsPerPage) || 1; // 총 페이지 수 계산

  // 3단계: 페이징 (현재 페이지에 해당하는 데이터만 잘라내기)
  const currentItems = processedTxs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 합계 계산 (수입 총합 / 지출 총합)
  const incomeSum = txs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expenseSum = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  // --- [4. 화면 렌더링: HTML 구조 정의] ---
  return (
    <div className="pocket-container">
      {/* 사이드바 메뉴 */}
      <aside className="pocket-sidebar">
        <div className="side-title">Pocket Life</div>
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

      {/* 대시보드 메뉴가 선택되었을 때만 보여주는 화면 */}
      {activeMenu === "dashboard" ? (
        <>
          {/* 중앙 메인: 내역 목록 */}
          <main className="pocket-main">
            <div className="main-header">
              <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                가계부
              </span>
              <div className="month-badge">2026년 1월</div>
            </div>

            {/* 필터 버튼들 및 정렬 선택창 */}
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

            {/* 거래 내역 테이블 */}
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
                    <td>{t.txDate.substring(5).replace("-", ".")}</td>{" "}
                    {/* MM.DD 형식으로 변환 */}
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

            {/* 하단 페이지네이션 번호 */}
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

          {/* 오른쪽 사이드바: 입력 폼 및 월간 요약 */}
          <aside className="pocket-right">
            <div className="card-box">
              <h4 style={{ textAlign: "center", marginTop: 0 }}>거래 내용</h4>
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

            {/* 요약 박스 */}
            <div className="card-box">
              <h4 style={{ textAlign: "center", marginTop: 0 }}>월간 통계</h4>
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
        /* 거래내역 메뉴 선택 시 보여줄 빈 화면 */
        <main
          className="pocket-main"
          style={{ textAlign: "center", padding: "100px" }}
        >
          <h2 style={{ fontSize: "24px", color: "#8e8efc" }}>
            📋 상세 거래내역 페이지
          </h2>
        </main>
      )}
    </div>
  );
};

export default LedgerPage;
