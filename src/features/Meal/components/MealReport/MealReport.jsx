// [Layout] 식단 상세 리포트 페이지 - 식단관리 차트 및 주/월 단위 통계
import React, { useState, useEffect, useMemo } from "react";
import { useMealContext } from "../../context/MealContext.jsx";
import dataApi from "../../../../api/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import "./MealReport.css";
import { formatDate, getPeriodRange, getWeekRange, getWeeksList } from "./utils/dateUtils";
import { calculateDietMealRate, calculateChangeRate } from "./utils/dietCalculationUtils";
import { createDietPieData } from "./utils/chartDataUtils";
import { dietPieOptions } from "./constants/chartConfig";

// [Locale] DatePicker 한국어 설정
registerLocale("ko", ko);

// [Component] 식단관리 차트 라벨 컴포넌트
// [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 차트 위에 라벨을 각 색깔 영역 중앙에 정확히 배치하고 호버 시 숨김 처리, 어디서: StatsPage.jsx 20-110번째 줄, 어떻게: Chart.js 파이 차트의 실제 렌더링 위치를 고려하여 각도 계산하고 호버 시 라벨 숨김, 왜: 사용자 요청에 따라 각 색깔 영역의 정확한 중앙에 라벨 배치하고 호버 시 툴팁과 겹치지 않도록 하기 위해
const DietChartLabels = ({ normalDays, overDays, underDays, chartData }) => {
  // [State] 호버 상태 관리
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 차트 호버 상태 state 추가, 어디서: StatsPage.jsx 19번째 줄, 어떻게: useState로 호버 상태 관리, 왜: 호버 시 라벨을 숨기기 위해
  const [isHovered, setIsHovered] = useState(false);
  // [Logic] 각 라벨의 위치 계산
  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 각 파이 조각의 중심 각도를 정확히 계산하여 중앙에 배치하고 0인 항목 제외, 어디서: StatsPage.jsx 25-65번째 줄, 어떻게: 각 데이터의 비율을 기반으로 정확한 각도 계산하고 차트 내부 중앙에 배치, 왜: 각 색깔 영역의 정확한 중앙에 라벨 배치하고 해당 항목이 없으면 표시하지 않기 위해
  const labelPositions = useMemo(() => {
    if (
      !chartData ||
      !chartData.datasets ||
      !chartData.datasets[0] ||
      !chartData.datasets[0].data
    ) {
      return [];
    }

    const data = chartData.datasets[0].data;
    const labels = chartData.labels || [];
    const colors = chartData.datasets[0].backgroundColor || [];

    // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 실제 일수로 조건부 표시 확인 및 색상 매핑, 어디서: StatsPage.jsx 30-40번째 줄, 어떻게: normalDays, overDays, underDays를 확인하여 0보다 큰 항목만 라벨 표시, 왜: 해당 색깔 영역이 없으면 라벨을 표시하지 않기 위해
    const statusMap = {
      정상: { days: normalDays, color: "#4caf50" }, // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨 문구 변경 '정상 범위' -> '정상', 어디서: StatsPage.jsx 34번째 줄, 어떻게: 키 값을 '정상 범위'에서 '정상'으로 변경, 왜: 사용자 요청에 따라 라벨 문구 간소화하기 위해
      초과: { days: overDays, color: "#f44336" }, // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨 문구 변경 '칼로리 초과' -> '초과', 어디서: StatsPage.jsx 35번째 줄, 어떻게: 키 값을 '칼로리 초과'에서 '초과'로 변경, 왜: 사용자 요청에 따라 라벨 문구 간소화하기 위해
      미달성: { days: underDays, color: "#ff9800" },
    };

    // Chart.js 파이 차트는 -90도(위쪽)에서 시작하고 시계 방향으로 진행
    let currentAngle = -90; // 시작 각도 (위쪽, 12시 방향)
    const positions = [];
    const chartSize = 180; // 차트 크기 (픽셀)
    const centerX = chartSize / 2; // 중심 x 좌표
    const centerY = chartSize / 2; // 중심 y 좌표
    const radius = chartSize * 0.3; // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨 위치 반경 조정, 어디서: StatsPage.jsx 42번째 줄, 어떻게: 25%에서 30%로 증가, 왜: 라벨이 조각 중앙에 더 잘 보이도록 하기 위해

    // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 차트 데이터 순서대로 각도 계산하여 라벨 배치, 어디서: StatsPage.jsx 44-80번째 줄, 어떻게: data 배열을 순회하면서 각 조각의 중심 각도 계산, 왜: 각 색상 영역의 정확한 중앙에 라벨 배치하기 위해
    // [참고] 차트 데이터는 이미 0인 항목이 제외되어 있으므로, 모든 항목에 대해 라벨을 표시
    data.forEach((value, index) => {
      const label = labels[index];
      const status = statusMap[label];

      // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 해당 항목의 일수가 0보다 클 때만 라벨 추가, 어디서: StatsPage.jsx 50-54번째 줄, 어떻게: status.days가 0보다 큰지 확인, 왜: 해당 색깔 영역이 없으면 라벨을 표시하지 않기 위해
      if (!status || status.days <= 0) {
        // 차트 데이터에 이미 0인 항목이 제외되어 있으므로 이 경우는 발생하지 않아야 함
        // 하지만 안전을 위해 각도만 업데이트
        currentAngle += value * 3.6;
        return;
      }

      // 각 조각의 중심 각도 계산
      // value는 퍼센트이므로 각도로 변환: value * 3.6 (100% = 360도)
      const sliceAngle = value * 3.6; // 조각의 각도
      const centerAngle = currentAngle + sliceAngle / 2; // 조각의 중심 각도

      // 라디안으로 변환
      const radian = (centerAngle * Math.PI) / 180;

      // 좌표 계산 (중심 기준, 반경 내부에 배치)
      const x = centerX + radius * Math.cos(radian);
      const y = centerY + radius * Math.sin(radian);

      positions.push({
        label,
        color: status.color,
        percentage: value, // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨에 퍼센트 정보 추가, 어디서: StatsPage.jsx 68번째 줄, 어떻게: value를 percentage로 저장, 왜: 라벨에 퍼센트를 함께 표시하기 위해
        x: `${x}px`,
        y: `${y}px`,
      });

      // 다음 조각 시작 각도 업데이트
      currentAngle += sliceAngle;
    });

    return positions;
  }, [chartData, normalDays, overDays, underDays]);

  // [Effect] 차트 호버 이벤트 리스너 등록
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 차트 영역 호버 이벤트 감지, 어디서: StatsPage.jsx 88-100번째 줄, 어떻게: useEffect로 차트 캔버스 요소에 이벤트 리스너 추가, 왜: 호버 시 라벨을 숨기기 위해
  useEffect(() => {
    const chartWrapper = document.querySelector(".stats-pie-chart-wrapper");
    if (!chartWrapper) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    chartWrapper.addEventListener("mouseenter", handleMouseEnter);
    chartWrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      chartWrapper.removeEventListener("mouseenter", handleMouseEnter);
      chartWrapper.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (labelPositions.length === 0) return null;

  return (
    <div className="stats-chart-labels">
      {labelPositions.map((pos, index) => (
        <div
          key={index}
          className="stats-chart-label"
          style={{
            color: "#ffffff", // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨 색상을 흰색으로 변경하여 가독성 개선, 어디서: StatsPage.jsx 95번째 줄, 어떻게: color를 '#ffffff'로 변경, 왜: 차트 색상과 대비되어 잘 보이도록 하기 위해
            position: "absolute",
            left: pos.x,
            top: pos.y,
            transform: "translate(-50%, -50%)",
            fontWeight: "bold",
            fontSize: "0.85rem",
            textShadow:
              "0 2px 4px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.8)", // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨 가독성을 위한 그림자 강화, 어디서: StatsPage.jsx 101번째 줄, 어떻게: textShadow 추가, 왜: 흰색 텍스트가 차트 위에서 잘 보이도록 하기 위해
            opacity: isHovered ? 0 : 1, // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 호버 시 라벨 숨김, 어디서: StatsPage.jsx 102번째 줄, 어떻게: isHovered 상태에 따라 opacity 조정, 왜: 호버 시 툴팁과 겹치지 않도록 하기 위해
            transition: "opacity 0.2s ease", // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨 숨김/표시 전환 애니메이션, 어디서: StatsPage.jsx 103번째 줄, 어떻게: transition 추가, 왜: 부드러운 전환 효과를 위해
          }}
        >
          <span style={{ display: "block" }}>{pos.label}</span>{" "}
          {/* [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨 텍스트를 블록 요소로 변경하여 줄바꿈 가능하게 함, 어디서: StatsPage.jsx 123번째 줄, 어떻게: span에 display: block 스타일 추가, 왜: 라벨과 퍼센트를 줄바꿈하여 표시하기 위해 */}
          <span style={{ display: "block" }}>{pos.percentage}%</span>{" "}
          {/* [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 퍼센트를 별도 블록 요소로 분리하여 줄바꿈 표시, 어디서: StatsPage.jsx 124번째 줄, 어떻게: span에 display: block 스타일 추가하고 별도 요소로 분리, 왜: 라벨 아래에 퍼센트를 표시하기 위해 */}
        </div>
      ))}
    </div>
  );
};

// Chart.js 컴포넌트 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const MealReport = () => {
  // [State] 기간 단위 선택 (주/월)
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 주 단위/월 단위 선택 state 추가, 어디서: StatsPage.jsx 22번째 줄, 어떻게: 'week' 또는 'month' 값을 가지는 state 생성, 왜: 사용자가 주 단위 또는 월 단위 통계를 선택할 수 있도록 하기 위해
  // [수정 2026-01-19] 누가: 효민, 무엇을: 통계 페이지 진입 시 기본 단위를 월 단위에서 주 단위로 변경, 어디서: StatsPage.jsx 145번째 줄, 어떻게: useState 초기값을 'month'에서 'week'로 변경, 왜: 사용자 요청에 따라 기본 진입 시 주 단위 통계를 보여주기 위해
  const [periodType, setPeriodType] = useState("week"); // 'week' 또는 'month'

  // [State] 현재 조회 중인 날짜 (기본값: 오늘)
  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: currentDate를 주 단위/월 단위 모두 지원하도록 유지, 어디서: StatsPage.jsx 25번째 줄, 어떻게: 기존 코드 유지, 왜: 주 단위와 월 단위 모두 같은 날짜 기준으로 계산하기 위해
  const [currentDate, setCurrentDate] = useState(new Date());

  // [State] 주 단위 목록 열림/닫힘 상태
  // [추가 2026-01-19] 누가: 효민, 무엇을: 주 단위 목록 드롭다운 열림/닫힘 state 추가, 어디서: StatsPage.jsx 151번째 줄, 어떻게: useState로 boolean 값 관리, 왜: 주 단위 목록 선택기를 토글하기 위해
  const [isWeekListOpen, setIsWeekListOpen] = useState(false);

  // [State] 월 필터 상태 (주 목록에서 표시할 월)
  // [추가 2026-01-19] 누가: 효민, 무엇을: 주 목록에서 필터링할 월 state 추가, 어디서: StatsPage.jsx 156번째 줄, 어떻게: useState로 선택된 월(0-11) 관리, null이면 전체 표시, 왜: 월별로 주를 필터링하고 해당 월의 주로 이동하기 위해
  const [selectedMonth, setSelectedMonth] = useState(null);

  // [State] 현재 기간 데이터 - 식단관리만
  const [currentDietScore, setCurrentDietScore] = useState(0); // 식단관리 점수
  const [currentDietDetail, setCurrentDietDetail] = useState({
    normalDays: 0,
    overDays: 0,
    underDays: 0,
    totalPeriodDays: 0,
    dateStatusMap: { normal: [], over: [], under: [], noRecord: [] },
  });

  // [State] 이전 기간 데이터 (증감 비교용) - 식단관리만
  const [prevDietScore, setPrevDietScore] = useState(0);
  const [prevDietDetail, setPrevDietDetail] = useState({
    normalDays: 0,
    overDays: 0,
    underDays: 0,
    totalPeriodDays: 0,
    dateStatusMap: { normal: [], over: [], under: [], noRecord: [] },
  });

  const [hasData, setHasData] = useState(false);

  // [Context] 실시간 업데이트 감지
  const { updateKey } = useMealContext();

  // [Logic] 실제 데이터 가져오기 (updateKey 변경 시 재조회)
  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기간 단위에 따른 데이터 조회 로직으로 변경, 어디서: StatsPage.jsx 88번째 줄부터, 어떻게: 주/월 단위에 따라 기간 범위 계산 후 API 호출, 왜: 주 단위와 월 단위 통계를 모두 지원하기 위해
  useEffect(() => {
    const fetchData = async () => {
      // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기간 범위 계산 로직으로 변경, 어디서: StatsPage.jsx 90-95번째 줄, 어떻게: getPeriodRange 함수를 사용하여 현재 기간과 이전 기간 계산, 왜: 주/월 단위에 맞는 기간 범위를 계산하기 위해
      const currentRange = getPeriodRange(new Date(currentDate), periodType);
      const prevRange = getPeriodRange(new Date(currentDate), periodType);

      // 이전 기간 계산
      // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 이전 기간 계산 로직 추가, 어디서: StatsPage.jsx 96-103번째 줄, 어떻게: periodType이 'week'이면 7일 전, 'month'이면 1개월 전으로 계산, 왜: 이전 기간 대비 증감률을 계산하기 위해
      if (periodType === "week") {
        prevRange.startDate.setDate(prevRange.startDate.getDate() - 7);
        prevRange.endDate.setDate(prevRange.endDate.getDate() - 7);
      } else {
        prevRange.startDate.setMonth(prevRange.startDate.getMonth() - 1);
        prevRange.endDate.setMonth(prevRange.endDate.getMonth() - 1);
        prevRange.endDate.setDate(0); // 이전 달의 마지막 날
      }

      const currentStart = formatDate(currentRange.startDate);
      const currentEnd = formatDate(currentRange.endDate);
      const prevStart = formatDate(prevRange.startDate);
      const prevEnd = formatDate(prevRange.endDate);

      // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 디버깅을 위한 로그 추가, 어디서: StatsPage.jsx 110-113번째 줄, 어떻게: 조회 기간과 날짜 범위를 콘솔에 출력, 왜: 식단 데이터가 통계에 반영되지 않는 문제를 디버깅하기 위해
      // console.log("DEBUG: 통계 조회 기간", {
      //   periodType,
      //   currentDate: formatDate(new Date(currentDate)),
      //   currentRange: { start: currentStart, end: currentEnd },
      //   prevRange: { start: prevStart, end: prevEnd },
      // });

      try {
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: API 호출을 fallback 방식으로 변경, 어디서: StatsPage.jsx 115-145번째 줄, 어떻게: 신규 API 실패 시 기존 API로 여러 날짜 조회 후 프론트에서 집계, 왜: 백엔드 신규 API가 아직 구현되지 않아 404 에러가 발생하기 때문에
        // 현재 기간 데이터 조회 (신규 API 시도 후 실패 시 fallback) - 식단관리만
        let resMealCurrent;

        try {
          // 신규 API 시도
          resMealCurrent = await dataApi
            .get(`/api/stats/meal/range`, {
              params: { startDate: currentStart, endDate: currentEnd },
            })
            .catch((e) => {
              console.error("식단 통계 API 실패:", e);
              return { data: null };
            });

          // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: API 응답 디버깅 로그 추가, 어디서: StatsPage.jsx 130-135번째 줄, 어떻게: 각 API 응답을 콘솔에 출력, 왜: 데이터가 제대로 조회되는지 확인하기 위해
          // console.log("DEBUG: 신규 API 응답", {
          //   meal: resMealCurrent?.data,
          //   cart: resCartCurrent?.data,
          //   todo: resTodoCurrent?.data,
          //   category: resCategoryCurrent?.data,
          // });
        } catch (e) {
          console.log("신규 API 실패, fallback 사용:", e);
        }

        // Fallback: 기존 API로 기간 내 모든 날짜 데이터 조회 - 식단관리만
        if (!resMealCurrent?.data) {
          const start = new Date(currentRange.startDate);
          const end = new Date(currentRange.endDate);

          // 기간 내 모든 날짜 순회
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            try {
              const meals = await dataApi
                .get(`/api/stats/meal`, { params: { date: dateStr } })
                .catch(() => ({ data: null }));

              // 식단 통계 데이터 처리
              if (meals.data && meals.data.totalCalories !== undefined) {
                if (!resMealCurrent || !resMealCurrent.data) {
                  resMealCurrent = {
                    data: { totalCalories: 0, targetCalories: 0 },
                  };
                }
                resMealCurrent.data.totalCalories +=
                  Number(meals.data.totalCalories) || 0;
                resMealCurrent.data.targetCalories +=
                  Number(meals.data.targetCalories) || 2000;
              }
            } catch (e) {
              console.error(`날짜 ${dateStr} 데이터 조회 실패:`, e);
            }
          }
        }

        // 이전 기간 데이터 조회 (동일한 fallback 로직 적용) - 식단관리만
        let resMealPrev;

        try {
          resMealPrev = await dataApi
            .get(`/api/stats/meal/range`, {
              params: { startDate: prevStart, endDate: prevEnd },
            })
            .catch(() => ({ data: null }));
        } catch (e) {
          console.log("이전 기간 신규 API 실패, fallback 사용:", e);
        }

        // 이전 기간 fallback
        if (!resMealPrev?.data) {
          const start = new Date(prevRange.startDate);
          const end = new Date(prevRange.endDate);

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            try {
              const meals = await dataApi
                .get(`/api/stats/meal`, { params: { date: dateStr } })
                .catch(() => ({ data: null }));

              if (meals.data && meals.data.totalCalories !== undefined) {
                if (!resMealPrev?.data) {
                  resMealPrev = {
                    data: { totalCalories: 0, targetCalories: 0 },
                  };
                }
                resMealPrev.data.totalCalories +=
                  Number(meals.data.totalCalories) || 0;
                resMealPrev.data.targetCalories +=
                  Number(meals.data.targetCalories) || 2000;
              }
            } catch (e) {
              console.error(`이전 기간 날짜 ${dateStr} 데이터 조회 실패:`, e);
            }
          }
        }

        // (1) 식단 관리 계산: 끼니 단위 달성률 + 칼로리 초과/정상/미달성 정보

        let currentDietResult = {
          mealRate: 0,
          normalDays: 0,
          overDays: 0,
          underDays: 0,
        };
        let prevDietResult = {
          mealRate: 0,
          normalDays: 0,
          overDays: 0,
          underDays: 0,
        };

        // 현재 기간 식단 달성률 계산
        currentDietResult = await calculateDietMealRate(
          currentRange.startDate,
          currentRange.endDate
        );

        // 이전 기간 식단 달성률 계산
        prevDietResult = await calculateDietMealRate(
          prevRange.startDate,
          prevRange.endDate
        );

        const currentDietValue = currentDietResult.mealRate;
        const prevDietValue = prevDietResult.mealRate;

        // State 업데이트 - 식단관리만
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: state 업데이트 로직 변경, 어디서: StatsPage.jsx 223-230번째 줄, 어떻게: 현재 기간과 이전 기간 데이터를 각각 state에 저장, 왜: 이전 기간 대비 증감률 계산 및 표시를 위해
        setCurrentDietScore(currentDietValue);
        setPrevDietScore(prevDietValue);
        setCurrentDietDetail({
          normalDays: currentDietResult.normalDays,
          overDays: currentDietResult.overDays,
          underDays: currentDietResult.underDays,
          totalPeriodDays: currentDietResult.totalPeriodDays || 0,
          dateStatusMap: currentDietResult.dateStatusMap || {
            normal: [],
            over: [],
            under: [],
            noRecord: [],
          },
        });
        setPrevDietDetail({
          normalDays: prevDietResult.normalDays,
          overDays: prevDietResult.overDays,
          underDays: prevDietResult.underDays,
          totalPeriodDays: prevDietResult.totalPeriodDays || 0,
          dateStatusMap: prevDietResult.dateStatusMap || {
            normal: [],
            over: [],
            under: [],
            noRecord: [],
          },
        });
        setHasData(true);
      } catch (e) {
        console.error("통계 데이터 로드 실패", e);
        setCurrentDietScore(0);
        setPrevDietScore(0);
        setCurrentDietDetail({
          normalDays: 0,
          overDays: 0,
          underDays: 0,
          totalPeriodDays: 0,
          dateStatusMap: { normal: [], over: [], under: [], noRecord: [] },
        });
        setPrevDietDetail({
          normalDays: 0,
          overDays: 0,
          underDays: 0,
          totalPeriodDays: 0,
          dateStatusMap: { normal: [], over: [], under: [], noRecord: [] },
        });
        setHasData(false);
      }
    };

    fetchData();
  }, [currentDate, periodType, updateKey]);

  // 식단관리 차트 데이터
  const chart01Data = createDietPieData(
    currentDietDetail.normalDays,
    currentDietDetail.overDays,
    currentDietDetail.underDays,
    currentDietDetail.dateStatusMap
  );

  // [Logic] 기간 표시 텍스트 생성
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기간 표시 텍스트 생성 함수 추가, 어디서: StatsPage.jsx 305-315번째 줄, 어떻게: periodType에 따라 주 단위 또는 월 단위로 표시, 왜: 사용자에게 현재 조회 중인 기간을 명확히 표시하기 위해
  // [수정 2026-01-19] 누가: 효민, 무엇을: 주 단위 날짜 표기를 한 줄 형식으로 변경, 어디서: StatsPage.jsx 1085-1095번째 줄, 어떻게: 줄바꿈 형식에서 한 줄 형식(yyyy-mm-dd ~ yyyy-mm-dd)으로 변경, 왜: 사용자 요청에 따라 주간 날짜를 한 줄로 표시하기 위해
  const getPeriodText = () => {
    const range = getPeriodRange(new Date(currentDate), periodType);
    if (periodType === "week") {
      return `${formatDate(range.startDate)} ~ ${formatDate(range.endDate)}`;
    } else {
      const year = range.startDate.getFullYear();
      const month = range.startDate.getMonth() + 1;
      return `${year}년 ${month}월`;
    }
  };

  // [Logic] 기간 변경 핸들러
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기간 단위 변경 핸들러 추가, 어디서: StatsPage.jsx 318-321번째 줄, 어떻게: periodType state를 'week' 또는 'month'로 변경, 왜: 사용자가 주/월 단위를 선택할 수 있도록 하기 위해
  const handlePeriodChange = (type) => {
    setPeriodType(type);
  };

  // [Logic] 기간 이동 핸들러
  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기간 이동 핸들러를 주/월 단위 모두 지원하도록 수정, 어디서: StatsPage.jsx 324-332번째 줄, 어떻게: periodType에 따라 주 단위는 7일, 월 단위는 1개월씩 이동, 왜: 선택한 기간 단위에 맞게 이전/다음 기간으로 이동하기 위해
  const handlePeriodMove = (offset) => {
    const newDate = new Date(currentDate);
    if (periodType === "week") {
      newDate.setDate(newDate.getDate() + offset * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + offset);
    }
    setCurrentDate(newDate);
  };


  // [Logic] 주 단위 목록에서 주 선택 핸들러
  // [추가 2026-01-19] 누가: 효민, 무엇을: 주 단위 목록에서 주를 선택하면 해당 주로 이동하는 핸들러 추가, 어디서: StatsPage.jsx 1167-1171번째 줄, 어떻게: 선택한 주의 시작일(월요일)로 currentDate 설정하고 목록 닫기, 왜: 사용자가 주 단위 목록에서 주를 선택하여 해당 주로 이동할 수 있도록 하기 위해
  const handleWeekSelect = (weekStartDate) => {
    setCurrentDate(weekStartDate);
    setIsWeekListOpen(false);
    setSelectedMonth(null); // 선택 후 필터 초기화
  };

  // [Logic] 월 선택 핸들러
  // [추가 2026-01-19] 누가: 효민, 무엇을: 월을 선택하면 해당 월의 첫 번째 주로 이동하는 핸들러 추가, 어디서: StatsPage.jsx 1173-1182번째 줄, 어떻게: 선택한 월의 첫 날로 currentDate 설정하고 해당 월로 필터링, 왜: 사용자가 원하는 월의 주로 빠르게 이동할 수 있도록 하기 위해
  const handleMonthSelect = (month) => {
    const year = 2026;
    const firstDay = new Date(year, month, 1);

    // 첫 날이 속한 주의 월요일 찾기
    const firstDayOfWeek = firstDay.getDay();
    const mondayOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    const weekMonday = new Date(year, month, 1 + mondayOffset);

    setCurrentDate(weekMonday);
    setSelectedMonth(month);
    setIsWeekListOpen(true); // 목록 열기
  };

  // [Logic] 외부 클릭 시 주 목록 닫기
  // [추가 2026-01-19] 누가: 효민, 무엇을: 외부 영역 클릭 시 주 단위 목록이 닫히도록 이벤트 리스너 추가, 어디서: StatsPage.jsx 1164-1177번째 줄, 어떻게: useEffect와 document.addEventListener를 사용하여 외부 클릭 감지, 왜: 사용자 경험 향상을 위해 외부 클릭 시 목록이 자동으로 닫히도록 하기 위해
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isWeekListOpen && !event.target.closest(".stats-week-selector")) {
        setIsWeekListOpen(false);
      }
    };

    if (isWeekListOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWeekListOpen]);

  // [Logic] 날짜 선택 핸들러 (월 단위만)
  // [수정 2026-01-19] 누가: 효민, 무엇을: DatePicker는 월 단위일 때만 사용하도록 수정, 어디서: StatsPage.jsx 1164-1171번째 줄, 어떻게: 주 단위 로직 제거하고 월 단위만 처리, 왜: 주 단위는 별도의 목록 선택기를 사용하기 위해
  const handleDatePickerChange = (date) => {
    if (!date) return;

    if (periodType === "month") {
      // 월 단위: 선택한 날짜가 포함된 월의 1일로 이동
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      setCurrentDate(firstDay);
    }
  };

  return (
    <div className="stats-container">
      <header className="stats-header">
        <h2 className="stats-title">📊 식단 상세 리포트</h2>
        <p className="stats-subtitle">기간별 식단 분석</p>
      </header>

      {/* [수정 2026-01-19] 누가: 효민, 무엇을: 주 단위/월 단위를 위에, 날짜 선택기를 아래에 세로 배치, 어디서: StatsPage.jsx 871-905번째 줄, 어떻게: 컨트롤 섹션을 세로 배치로 변경, 왜: 사용자 요청에 따라 주 단위/월 단위는 위, 날짜 선택기는 아래로 배치하기 위해 */}
      <div className="stats-controls-section">
        {/* 기간 단위 선택 토글 */}
        <div className="stats-period-toggle-container">
          <button
            className={`stats-period-toggle-btn ${
              periodType === "week" ? "active" : ""
            }`}
            onClick={() => handlePeriodChange("week")}
          >
            주 단위
          </button>
          <button
            className={`stats-period-toggle-btn ${
              periodType === "month" ? "active" : ""
            }`}
            onClick={() => handlePeriodChange("month")}
          >
            월 단위
          </button>
        </div>

        {/* 기간 선택기 영역 */}
        <div className="stats-date-picker-container">
          <button
            className="stats-date-nav-btn"
            onClick={() => handlePeriodMove(-1)}
          >
            ◀
          </button>
          {periodType === "week" ? (
            // 주 단위: 주 목록 선택기
            <div className="stats-week-selector">
              <span
                className="stats-date-text"
                onClick={() => setIsWeekListOpen(!isWeekListOpen)}
              >
                {getPeriodText()}
                <span className="stats-calendar-icon">📅</span>
              </span>
              {isWeekListOpen && (
                <div className="stats-week-list">
                  {/* 월별 선택 버튼 */}
                  <div className="stats-month-filter">
                    <button
                      className={`stats-month-btn ${
                        selectedMonth === null ? "active" : ""
                      }`}
                      onClick={() => setSelectedMonth(null)}
                    >
                      전체
                    </button>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) => (
                      <button
                        key={month}
                        className={`stats-month-btn ${
                          selectedMonth === month ? "active" : ""
                        }`}
                        onClick={() => handleMonthSelect(month)}
                      >
                        {month + 1}월
                      </button>
                    ))}
                  </div>

                  {/* 주 목록 */}
                  <div className="stats-week-items-container">
                    {getWeeksList(selectedMonth).map((week, index) => {
                      const weekStartStr = formatDate(week.startDate);
                      const weekEndStr = formatDate(week.endDate);
                      const isSelected =
                        formatDate(getWeekRange(currentDate).startDate) ===
                        weekStartStr;
                      return (
                        <div
                          key={index}
                          className={`stats-week-item ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => handleWeekSelect(week.startDate)}
                        >
                          {weekStartStr} ~ {weekEndStr}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 월 단위: DatePicker 사용
            <DatePicker
              selected={currentDate}
              onChange={handleDatePickerChange}
              dateFormat="yyyy년 MM월"
              showMonthYearPicker={true}
              locale="ko"
              calendarClassName="meal-report-month-calendar"
              popperClassName="meal-report-month-popper"
              customInput={
                <span className="stats-date-text">
                  {getPeriodText()}
                  <span className="stats-calendar-icon">📅</span>
                </span>
              }
            />
          )}
          <button
            className="stats-date-nav-btn"
            onClick={() => handlePeriodMove(1)}
          >
            ▶
          </button>
        </div>
      </div>

      <div className="stats-main-content">
        {/* 파이 차트 영역 - 식단관리만 */}
        <div className="stats-pie-charts-container">
          {/* CHART 01: 식단관리 */}
          {/* [수정 2026-01-19] 누가: 효민, 무엇을: 차트와 텍스트 정보를 좌우로 분리하여 배치, 어디서: StatsPage.jsx 910번째 줄, 어떻게: 차트 아이템을 flex-row로 변경하고 왼쪽에 차트, 오른쪽에 텍스트 정보 배치, 왜: 사용자가 요청한 이미지 레이아웃대로 배치하기 위해 */}
          <div className="stats-pie-chart-item stats-diet-layout">
            <div className="stats-diet-chart-section">
              <div className="stats-pie-chart-wrapper">
                <Pie data={chart01Data} options={dietPieOptions} />
                {/* [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 차트 위에 라벨을 각 색깔 영역에 맞게 배치하는 컴포넌트 사용, 어디서: StatsPage.jsx 856번째 줄, 어떻게: DietChartLabels 컴포넌트 사용, 왜: 사용자 요청에 따라 각 색깔 영역의 정확한 중앙에 라벨 배치하기 위해 */}
                <DietChartLabels
                  normalDays={currentDietDetail.normalDays}
                  overDays={currentDietDetail.overDays}
                  underDays={currentDietDetail.underDays}
                  chartData={chart01Data}
                />
              </div>
            </div>
            <div className="stats-diet-info-section">
              {/* [수정 2026-01-19] 누가: 효민, 무엇을: 제목과 증감률을 차트 중앙 높이에 배치하고 상세 내용은 그 아래에 배치, 어디서: StatsPage.jsx 923-935번째 줄, 어떻게: 빈 공간과 제목 섹션, 상세 내용을 flex로 배치하여 제목이 중앙에 오도록, 왜: 사용자 요청에 따라 차트와 제목을 나란히 가로 정렬하고 내용을 하단에 배치하기 위해 */}
              <div className="stats-diet-spacer"></div>
              <div className="stats-diet-title-section">
                <div className="stats-pie-chart-title">식단관리</div>
                {/* [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 증감률 앞에 기간 문구 추가, 어디서: StatsPage.jsx 647-650번째 줄, 어떻게: periodType에 따라 '지난주 대비' 또는 '지난달 대비' 문구 추가, 왜: 사용자가 어떤 기간과 비교하는지 명확히 알 수 있도록 하기 위해 */}
                <div className="stats-change-rate">
                  {periodType === "week" ? "지난주 대비 " : "지난달 대비 "}
                  {calculateChangeRate(currentDietScore, prevDietScore) > 0
                    ? "+"
                    : ""}
                  {calculateChangeRate(currentDietScore, prevDietScore)}%
                </div>
              </div>
              {/* [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 증감률 아래 일수 표시에 기록 없는 날 추가, 어디서: StatsPage.jsx 757-762번째 줄, 어떻게: currentDietDetail의 normalDays, overDays, underDays와 기록 없는 날 수를 텍스트로 표시, 왜: 사용자가 각 상태별 일수와 기록 없는 날을 명확히 파악할 수 있도록 하기 위해 */}
              <div className="stats-pie-chart-detail">
                {currentDietDetail.normalDays > 0 && (
                  <div className="stats-detail-item">
                    정상: {currentDietDetail.normalDays}일
                    {/* [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 정상 항목에 날짜 표시 추가, 어디서: StatsPage.jsx 943-948번째 줄, 어떻게: dateStatusMap.normal에서 날짜 추출하여 (n일, n일) 형식으로 표시, 왜: 사용자가 어떤 날짜가 정상 상태인지 확인할 수 있도록 하기 위해 */}
                    {currentDietDetail.dateStatusMap?.normal &&
                      currentDietDetail.dateStatusMap.normal.length > 0 && (
                        <div className="stats-detail-dates">
                          {/* [수정 2026-01-19] 누가: 효민, 무엇을: 날짜가 5개 이상일 경우 5개만 표시하고 나머지는 ...으로 요약, 어디서: StatsPage.jsx 926-933번째 줄, 어떻게: 날짜 배열을 slice하여 처음 5개만 표시하고 나머지가 있으면 ... 추가, 왜: 날짜가 너무 많을 경우 가독성을 위해 요약 표시하기 위해 */}
                          (
                          {(() => {
                            const dates = currentDietDetail.dateStatusMap.normal
                              .map((date) => {
                                const parts = date.split("-");
                                return parts.length === 3
                                  ? `${parts[2]}일`
                                  : "";
                              })
                              .filter(Boolean);
                            return dates.length > 5
                              ? dates.slice(0, 5).join(",") + ", ..."
                              : dates.join(",");
                          })()}
                          )
                        </div>
                      )}
                  </div>
                )}
                {currentDietDetail.overDays > 0 && (
                  <div className="stats-detail-item">
                    초과: {currentDietDetail.overDays}일
                    {/* [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 초과 항목에 날짜 표시 추가, 어디서: StatsPage.jsx 954-959번째 줄, 어떻게: dateStatusMap.over에서 날짜 추출하여 (n일, n일) 형식으로 표시, 왜: 사용자가 어떤 날짜가 초과 상태인지 확인할 수 있도록 하기 위해 */}
                    {currentDietDetail.dateStatusMap?.over &&
                      currentDietDetail.dateStatusMap.over.length > 0 && (
                        <div className="stats-detail-dates">
                          {/* [수정 2026-01-19] 누가: 효민, 무엇을: 날짜가 5개 이상일 경우 5개만 표시하고 나머지는 ...으로 요약, 어디서: StatsPage.jsx 940-947번째 줄, 어떻게: 날짜 배열을 slice하여 처음 5개만 표시하고 나머지가 있으면 ... 추가, 왜: 날짜가 너무 많을 경우 가독성을 위해 요약 표시하기 위해 */}
                          (
                          {(() => {
                            const dates = currentDietDetail.dateStatusMap.over
                              .map((date) => {
                                const parts = date.split("-");
                                return parts.length === 3
                                  ? `${parts[2]}일`
                                  : "";
                              })
                              .filter(Boolean);
                            return dates.length > 5
                              ? dates.slice(0, 5).join(",") + ", ..."
                              : dates.join(",");
                          })()}
                          )
                        </div>
                      )}
                  </div>
                )}
                {currentDietDetail.underDays > 0 && (
                  <div className="stats-detail-item">
                    미달성: {currentDietDetail.underDays}일
                    {/* [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 미달성 항목에 날짜 표시 추가, 어디서: StatsPage.jsx 965-970번째 줄, 어떻게: dateStatusMap.under에서 날짜 추출하여 (n일, n일) 형식으로 표시, 왜: 사용자가 어떤 날짜가 미달성 상태인지 확인할 수 있도록 하기 위해 */}
                    {currentDietDetail.dateStatusMap?.under &&
                      currentDietDetail.dateStatusMap.under.length > 0 && (
                        <div className="stats-detail-dates">
                          {/* [수정 2026-01-19] 누가: 효민, 무엇을: 날짜가 5개 이상일 경우 5개만 표시하고 나머지는 ...으로 요약, 어디서: StatsPage.jsx 954-961번째 줄, 어떻게: 날짜 배열을 slice하여 처음 5개만 표시하고 나머지가 있으면 ... 추가, 왜: 날짜가 너무 많을 경우 가독성을 위해 요약 표시하기 위해 */}
                          (
                          {(() => {
                            const dates = currentDietDetail.dateStatusMap.under
                              .map((date) => {
                                const parts = date.split("-");
                                return parts.length === 3
                                  ? `${parts[2]}일`
                                  : "";
                              })
                              .filter(Boolean);
                            return dates.length > 5
                              ? dates.slice(0, 5).join(",") + ", ..."
                              : dates.join(",");
                          })()}
                          )
                        </div>
                      )}
                  </div>
                )}
                {currentDietDetail.totalPeriodDays >
                  currentDietDetail.normalDays +
                    currentDietDetail.overDays +
                    currentDietDetail.underDays && (
                  <div
                    className="stats-detail-item"
                    style={{ color: "#9ca3af" }}
                  >
                    기록 없음:{" "}
                    {currentDietDetail.totalPeriodDays -
                      (currentDietDetail.normalDays +
                        currentDietDetail.overDays +
                        currentDietDetail.underDays)}
                    일
                    {/* [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기록없음 항목에 날짜 표시 추가, 어디서: StatsPage.jsx 958-964번째 줄, 어떻게: dateStatusMap.noRecord에서 날짜 추출하여 (n일, n일) 형식으로 표시, 왜: 사용자가 어떤 날짜가 기록없음 상태인지 확인할 수 있도록 하기 위해 */}
                    {currentDietDetail.dateStatusMap?.noRecord &&
                      currentDietDetail.dateStatusMap.noRecord.length > 0 && (
                        <div className="stats-detail-dates">
                          {/* [수정 2026-01-19] 누가: 효민, 무엇을: 날짜가 5개 이상일 경우 5개만 표시하고 나머지는 ...으로 요약, 어디서: StatsPage.jsx 968-975번째 줄, 어떻게: 날짜 배열을 slice하여 처음 5개만 표시하고 나머지가 있으면 ... 추가, 왜: 날짜가 너무 많을 경우 가독성을 위해 요약 표시하기 위해 */}
                          (
                          {(() => {
                            const dates =
                              currentDietDetail.dateStatusMap.noRecord
                                .map((date) => {
                                  const parts = date.split("-");
                                  return parts.length === 3
                                    ? `${parts[2]}일`
                                    : "";
                                })
                                .filter(Boolean);
                            return dates.length > 5
                              ? dates.slice(0, 5).join(",") + ", ..."
                              : dates.join(",");
                          })()}
                          )
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealReport;
