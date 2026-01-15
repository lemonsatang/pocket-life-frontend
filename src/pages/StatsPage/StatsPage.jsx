// [Layout] 통계 페이지 - 방사형 차트 및 분석 요약
import React, { useState, useEffect } from "react";
import { useMealContext } from "../../context/MealContext.jsx"; // [New]
import dataApi from "../../api/api";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import "./StatsPage.css";

// Chart.js 컴포넌트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const StatsPage = () => {
  // [State] 현재 조회 중인 날짜 (기본값: 오늘/이번 달)
  const [currentDate, setCurrentDate] = useState(new Date());

  // [Logic] 달 변경 핸들러
  const handleMonthChange = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // 날짜 표시 (선택기용)
  const displayYear = currentDate.getFullYear();
  const displayMonth = currentDate.getMonth() + 1;

  // 차트 데이터 기준 (선택된 달의 기록)
  const currentLabel = `${displayMonth}월 활동 기록`;

  // [State] 실제 데이터 상태
  const [statsData, setStatsData] = useState([0, 0, 0, 0, 0]); // [식비, 저축, 일정, 장바구니, 건강]
  const [hasData, setHasData] = useState(false); // 해당 월에 데이터가 있는지 여부

  // [Context] 실시간 업데이트 감지
  const { updateKey } = useMealContext();

  // [Logic] 실제 데이터 가져오기 (updateKey 변경 시 재조회)
  useEffect(() => {
    const fetchData = async () => {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0"); // [Fix] 일자 추가
      const yearMonth = `${year}-${month}`;
      const dateStr = `${year}-${month}-${day}`; // [Fix] dateStr 정의
      const today = new Date();

      // 1. 미래 날짜 체크 (현재보다 미래면 데이터 조회 X)
      const nextMonthOfCurrent = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const viewMonthStart = new Date(year, currentDate.getMonth(), 1);

      if (viewMonthStart >= nextMonthOfCurrent) {
        setHasData(false);
        setStatsData([0, 0, 0, 0, 0]);
        return;
      }

      // [Config] 소비율 기준 (월 50만원) - 변경 용이하도록 상수화
      const CONSUMPTION_TARGET = 500000;

      try {
        // [Logic] 병렬 API 호출 (사용자 요청: /api/stats/meal, /api/stats/cart, /api/todo, /api/tx)
        // 각각 실패해도 전체가 멈추지 않도록 개별 catch 처리
        const [resMeal, resCart, resTodo, resTx] = await Promise.all([
            // 1. 식단 (GET /api/stats/meal)
            dataApi.get(`/api/stats/meal?date=${dateStr}`).catch(() => ({ data: null })),
            // 2. 장바구니 (GET /api/stats/cart)
            dataApi.get(`/api/stats/cart?date=${dateStr}`).catch(() => ({ data: null })),
            // 3. 일정 (GET /api/todo) - 팀원 API
            dataApi.get(`/api/todo`).catch(() => ({ data: [] })),
            // 4. 가계부 (GET /api/tx) - 팀원 API
            dataApi.get(`/api/tx`).catch(() => ({ data: [] }))
        ]);

        let dietScore = 0;
        let cartScore = 0;
        let scheduleScore = 0;
        let consumptionScore = 0;
        let savingScore = 0;

        // (1) 식단 관리: (totalCalories / targetCalories) * 100
        if (resMeal.data) {
            const { totalCalories = 0, targetCalories = 2000 } = resMeal.data;
            if (targetCalories > 0) {
                // 100% 넘어가면 100점으로 제한
                dietScore = Math.min(Math.floor((totalCalories / targetCalories) * 100), 100);
            }
        }

        // (2) 장바구니: purchaseRate 그대로 반영
        if (resCart.data) {
            const { purchaseRate = 0 } = resCart.data;
            cartScore = Math.floor(purchaseRate);
        }

        // (3) 일정 달성: is_done 비율 (팀원 API 방어적 코딩)
        if (resTodo.data && Array.isArray(resTodo.data)) {
            // 이번 달 데이터만 필터링 (dodate 혹은 writedate 기준? 명세 없으므로 전체 혹은 날짜 필터링)
            // 명세: /api/todo (파라미터 없음 -> 전체) -> 여기서 날짜 필터링 필수
            // 데이터 구조 가정: { dodate: "YYYY-MM-DD", is_done: boolean, ... }
            const monthTodos = resTodo.data.filter(todo => todo.dodate && todo.dodate.startsWith(yearMonth));
            
            if (monthTodos.length > 0) {
                const doneCount = monthTodos.filter(t => t.isDone || t.is_done).length;
                scheduleScore = Math.floor((doneCount / monthTodos.length) * 100);
            }
        }

        // (4) 소비율/저축률: 가계부 (팀원 API 방어적 코딩)
        if (resTx.data && Array.isArray(resTx.data)) {
            // 이번 달 데이터 필터링
            const monthTxs = resTx.data.filter(tx => tx.txDate && tx.txDate.startsWith(yearMonth));
            
            const income = monthTxs
                .filter(t => t.type === 'INCOME')
                .reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
            
            const expense = monthTxs
                .filter(t => t.type === 'EXPENSE')
                .reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
            
            // 소비율: (총 지출 / 기준값) * 100
            consumptionScore = Math.min(Math.floor((expense / CONSUMPTION_TARGET) * 100), 100);

            // 저축률: (수입 - 지출) / 수입 (수입이 있을 때만)
            if (income > 0) {
                 const profit = income - expense;
                 savingScore = profit > 0 ? Math.floor((profit / income) * 100) : 0;
            }
        }

        setHasData(true);
        setStatsData([
            consumptionScore,
            savingScore,
            scheduleScore,
            cartScore,
            dietScore
        ]);
        
        // [Fix] 점수가 모두 0점이어도, 미래가 아니면 차트를 보여준다 (빈 차트라도 내 기록임)
        setHasData(true);

      } catch (e) {
        console.error("통계 데이터 로드 실패", e);
        // 에러가 나도 차트는 보여주기 위해 hasData true 시도 (단, 데이터는 0)
        setStatsData([0, 0, 0, 0, 0]);
        // 현재/과거 달이라면 true로 설정
        const isFuture = viewMonthStart >= nextMonthOfCurrent;
        setHasData(!isFuture);
      }
    };

    fetchData();
  }, [currentDate, updateKey]); // updateKey 의존성 추가

  // [Data] 2030 평균 데이터 (Mock Data: 2025.12 ~ 2026.12) - 분포 다양화
  const average2030Data = {
    "2025-12": [80, 40, 60, 40, 80], // 저장/건강 중심
    "2026-01": [50, 80, 50, 80, 50],  // 저축/장바구니 중심
    "2026-02": [90, 30, 90, 30, 90],
    "2026-03": [40, 60, 40, 60, 40],
    "2026-04": [70, 70, 70, 70, 70],
    "2026-05": [30, 90, 30, 90, 30],
    "2026-06": [60, 50, 80, 40, 70],
    "2026-07": [50, 50, 50, 50, 50],
    "2026-08": [80, 80, 30, 30, 80],
    "2026-09": [30, 30, 80, 80, 30],
    "2026-10": [65, 65, 65, 65, 65],
    "2026-11": [40, 80, 40, 80, 40],
    "2026-12": [90, 20, 90, 20, 90],
  };

  // 현재 보고 있는 달의 키
  const currentKey = `${displayYear}-${String(displayMonth).padStart(2, "0")}`;
  
  // 2. 2030 데이터 가져오기
  const current2030Data = average2030Data[currentKey] || [60, 50, 70, 50, 60];

  // [Logic] 2030 차트 공개 여부 (해당 월 15일 이후 공개)
  const unlockDate = new Date(displayYear, displayMonth - 1, 15);
  const today = new Date();
  const isUnlocked = today >= unlockDate;

  // [Data] 차트 데이터 설정
  const data = {
    labels: ["소비률", "저축률", "일정 달성", "장바구니", "식단 관리"],
    datasets: [
      // 나의 활동 기록 (데이터가 있을 때만 렌더링)
      ...(hasData
        ? [
            {
              label: currentLabel,
              data: statsData, // 실제(계산된) 데이터 사용
              backgroundColor: "rgba(94, 114, 228, 0.2)",
              borderColor: "#5e72e4",
              pointBackgroundColor: "#5e72e4",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "#5e72e4",
            },
          ]
        : []),
      
      // 2030 평균 (잠금 해제되었을 때만 렌더링)
      ...(isUnlocked
        ? [
            {
              label: "2030 평균",
              data: current2030Data,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "#ff6384",
              pointBackgroundColor: "#ff6384",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "#ff6384",
            },
          ]
        : []),
    ],
  };

  // [Config] 차트 옵션
  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: "#f1f5f9",
        },
        grid: {
          color: "#e2e8f0",
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: "transparent", // 레이블 배경 투명
        },
        pointLabels: {
          font: {
            size: 14,
            family: "'Pretendard', sans-serif",
            weight: "bold",
          },
          color: "#4a5568",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'Pretendard', sans-serif",
          },
          usePointStyle: true,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="stats-container">
      <header className="stats-header">
        <h2 className="stats-title">📊 나의 생활 리포트</h2>
        <p className="stats-subtitle">지난 한 달간의 활동을 분석했어요</p>
      </header>
      
      {/* 달력(월 선택기) 영역 */}
      <div className="stats-date-picker-container">
        <button className="stats-date-nav-btn" onClick={() => handleMonthChange(-1)}>
          ◀
        </button>
        <span className="stats-date-text">
          {displayYear}년 {String(displayMonth).padStart(2, "0")}월 📅
        </span>
        <button className="stats-date-nav-btn" onClick={() => handleMonthChange(1)}>
          ▶
        </button>
      </div>

      <div className="stats-main-content">
        {/* 메인 차트 영역 */}
        <div className="stats-chart-wrapper">
          <Radar data={data} options={options} />
        </div>

        {/* 요약 카드 영역 */}
        <div className="stats-summary-grid">
          <div className="stats-summary-card">
            <div className="stats-icon-box bg-blue">
              💰
            </div>
            <div className="stats-text-box">
              <span className="stats-card-title">소비률</span>
              <span className="stats-card-desc">
                {statsData[0] > 0 ? (
                  <>지출이 발생했습니다. <span style={{color: '#f57c00'}}>{statsData[0]}점</span></>
                ) : (
                   <>아직 소비 내역이 <span style={{color: '#2196f3'}}>없습니다</span></>
                )}
              </span>
            </div>
          </div>

          <div className="stats-summary-card">
            <div className="stats-icon-box bg-green">
              🥗
            </div>
            <div className="stats-text-box">
              <span className="stats-card-title">식단 관리</span>
              <span className="stats-card-desc">
                {statsData[4] > 50 ? (
                  <>건강한 식단 <span style={{color: '#4caf50'}}>잘 지키고</span> 있어요</>
                ) : (
                  <>조금 더 <span style={{color: '#f57c00'}}>분발</span>해 볼까요?</>
                )}
              </span>
            </div>
          </div>

          <div className="stats-summary-card">
            <div className="stats-icon-box bg-purple">
              📅
            </div>
            <div className="stats-text-box">
              <span className="stats-card-title">일정 달성</span>
              <span className="stats-card-desc">
                계획한 일정을 <span style={{color: '#9c27b0'}}>{statsData[2]}점</span> 달성!
              </span>
            </div>
          </div>

          <div className="stats-summary-card">
            <div className="stats-icon-box bg-yellow">
              🛒
            </div>
            <div className="stats-text-box">
              <span className="stats-card-title">장바구니</span>
              <span className="stats-card-desc">
                 {statsData[3] > 0 ? (
                    <>구매율 <span style={{color: '#fbc02d'}}>{statsData[3]}%</span> 달성!</>
                 ) : (
                    <>필요한 물건을 <span style={{color: '#fbc02d'}}>꼼꼼히</span> 챙겼어요</>
                 )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
