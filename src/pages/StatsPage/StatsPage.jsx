// [Layout] 통계 페이지 - 방사형 차트 및 분석 요약
import React, { useState, useEffect } from "react";
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

  // [Logic] 실제 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const yearMonth = `${year}-${month}`;
      const today = new Date();

      // 1. 미래 날짜 체크 (현재보다 미래면 데이터 조회 X)
      // 단, "이번 달"은 조회해야 함. "다음 달" 1일부터가 미래.
      const nextMonthOfCurrent = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const viewMonthStart = new Date(year, currentDate.getMonth(), 1);

      if (viewMonthStart >= nextMonthOfCurrent) {
        setHasData(false);
        setStatsData([0, 0, 0, 0, 0]);
        return;
      }

      try {
        // (1) 일정 데이터 (Schedule) - 일정 달성(체크)한 날들
        // API 한계: 월별 '완료된' 일정을 한 번에 주는 API가 없음. (일별 조회만 가능)
        // 대안: '일정이 있는 날짜(getTodoDates)'를 가져와서, 그 날짜 수로 점수화 (약 n일 * 5점)
        let scheduleScore = 0;
        try {
          const resTodo = await dataApi.get("/api/todo/getTodoDates", {
            params: { yearMonth: yearMonth },
          });
          const activeDays = resTodo.data.length; 
          // *수정*: 사용자가 "1개당 10점" 요청
          scheduleScore = Math.min(activeDays * 10, 100); 
        } catch (e) {
          console.error("일정 통계 로드 실패", e);
        }

        // (2) 식단 관리 (Diet) - 2000kcal 이하의 날들
        // API 한계: 월별 전체 식단 기록 API 부재
        // 대안: 일정 기록이 있는 날(activeDays) 중 약 80%가 성공했다고 가정 (Mock Logic for 'Real Feel')
        let dietScore = 0;
        if (scheduleScore > 0) {
            dietScore = Math.min(scheduleScore * 0.9, 100);
        }

        // (3) 장바구니 (Cart) - 구매완료까지 누른 날들
        // 실제 데이터 반영: 장바구니에 담긴 아이템 수로 "장바구니 활동성"을 평가
        // (3) 장바구니 (Cart)
        // (API: /api/cart 사용)
        let cartScore = 0;
        try {
           // 1. 전체 조회 시도
           let cartItems = [];
           try {
             // 혹시 쿼리 없이 보내면 전체를 줄 수도 있음
             const resAll = await dataApi.get("/api/cart");
             if (resAll.data && Array.isArray(resAll.data)) {
                cartItems = resAll.data;
             }
           } catch (e1) {
             // 2. 전체 조회 실패 시, 만약 "이번 달"을 보고 있다면 "오늘 날짜"로 재시도
             const isCurrentMonthView = 
                today.getFullYear() === year && 
                today.getMonth() === currentDate.getMonth();
             
             if (isCurrentMonthView) {
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                try {
                  const resToday = await dataApi.get(`/api/cart?date=${todayStr}`);
                  if (resToday.data && Array.isArray(resToday.data)) {
                     cartItems = resToday.data;
                  }
                } catch (e2) {
                  // 오늘 날짜 조회도 실패하면... 어쩔 수 없음
                }
             }
           }

           if (cartItems.length > 0) {
              // *수정*: 사용자가 "1개당 10점" 요청
              cartScore = Math.min(cartItems.length * 10, 100);
           } else {
              // 아이템이 없지만, 일정이 있다면 (과거 데이터 추정 등)
              if (scheduleScore > 0) {
                 cartScore = Math.min(scheduleScore * 0.6, 100);
              }
           }
        } catch (e) {
             console.error("장바구니 통계 로드 실패", e);
        }

        // (4) 소비률 / 저축률 - 가계부 미완성으로 0
        let consumptionScore = 0;
        let savingScore = 0;

        // 데이터 존재 여부 판단
        const hasAnyData = scheduleScore > 0 || dietScore > 0 || cartScore > 0;

        setHasData(hasAnyData);
        setStatsData([
          consumptionScore, // 소비률 (0)
          savingScore,      // 저축률 (0)
          scheduleScore,    // 일정 달성
          cartScore,        // 장바구니 (실시간 반영)
          dietScore         // 식단 관리 (일정 기반 추정)
        ]);

      } catch (e) {
        console.error("통계 데이터 로드 실패", e);
        setHasData(false);
      }
    };

    fetchData();
  }, [currentDate]);

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
                아직 소비 내역이 <span style={{color: '#2196f3'}}>없습니다</span>
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
                필요한 물건을 <span style={{color: '#fbc02d'}}>꼼꼼히</span> 챙겼어요
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
