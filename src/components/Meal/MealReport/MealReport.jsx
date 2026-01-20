// [Layout] 통계 페이지 - 4분할 파이 차트 및 주/월 단위 통계
// [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 통계 페이지를 4개 차트로 변경하고 주/월 단위 선택 기능 추가, 어디서: StatsPage.jsx, 어떻게: 기존 3개 차트를 4개로 변경하고 기간 선택 토글 추가, 왜: 사용자 요구사항 반영 (식단, 소비율, 장바구니, 일정 각각 별도 차트)
import React, { useState, useEffect, useMemo } from "react";
import { useMealContext } from "../../../context/MealContext.jsx";
import dataApi from "../../../api/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import "./MealReport.css";

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

  // [State] 현재 기간 데이터
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 현재 기간의 4개 차트 데이터 state 추가, 어디서: StatsPage.jsx 28-32번째 줄, 어떻게: 식단, 소비율, 장바구니, 일정 점수를 각각 state로 관리, 왜: 각 차트별로 독립적인 데이터 관리 및 이전 기간과 비교하기 위해
  const [currentDietScore, setCurrentDietScore] = useState(0); // 식단관리 점수
  const [currentDietDetail, setCurrentDietDetail] = useState({
    normalDays: 0,
    overDays: 0,
    underDays: 0,
    totalPeriodDays: 0,
    dateStatusMap: { normal: [], over: [], under: [], noRecord: [] },
  }); // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: dateStatusMap에 noRecord 추가, 어디서: StatsPage.jsx 154번째 줄, 어떻게: dateStatusMap 초기값에 noRecord 배열 추가, 왜: 기록없음 날짜를 표시하기 위해
  const [currentConsumptionData, setCurrentConsumptionData] = useState([]); // 소비율: 카테고리별 지출 데이터
  const [currentCartScore, setCurrentCartScore] = useState(0); // 장바구니 완료율
  const [currentScheduleScore, setCurrentScheduleScore] = useState(0); // 일정 달성률

  // [State] 이전 기간 데이터 (증감 비교용)
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 이전 기간 데이터 state 추가, 어디서: StatsPage.jsx 35-39번째 줄, 어떻게: 현재 기간과 동일한 구조의 state 생성, 왜: 이전 기간 대비 증감률을 계산하여 표시하기 위해
  const [prevDietScore, setPrevDietScore] = useState(0);
  const [prevDietDetail, setPrevDietDetail] = useState({
    normalDays: 0,
    overDays: 0,
    underDays: 0,
    totalPeriodDays: 0,
    dateStatusMap: { normal: [], over: [], under: [], noRecord: [] },
  }); // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: dateStatusMap에 noRecord 추가, 어디서: StatsPage.jsx 162번째 줄, 어떻게: dateStatusMap 초기값에 noRecord 배열 추가, 왜: 기록없음 날짜를 표시하기 위해
  const [prevConsumptionData, setPrevConsumptionData] = useState([]);
  const [prevCartScore, setPrevCartScore] = useState(0);
  const [prevScheduleScore, setPrevScheduleScore] = useState(0);

  const [hasData, setHasData] = useState(false);

  // [Context] 실시간 업데이트 감지
  const { updateKey } = useMealContext();

  // [Logic] 기간 계산 함수
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 주 단위/월 단위 기간 계산 함수 추가, 어디서: StatsPage.jsx 45-80번째 줄, 어떻게: periodType에 따라 주 단위(월~일) 또는 월 단위(1일~말일) 계산, 왜: 선택한 기간 단위에 맞는 시작일/종료일을 계산하기 위해
  const getPeriodRange = (date, type) => {
    // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 날짜 객체 직접 수정 문제 해결, 어디서: StatsPage.jsx 52-75번째 줄, 어떻게: date 객체를 복사하여 사용, 왜: 원본 date 객체가 변경되지 않도록 하기 위해
    const dateCopy = new Date(date);
    if (type === "week") {
      // 주 단위: 해당 날짜가 속한 주의 월요일~일요일
      const day = dateCopy.getDay();
      const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
      const monday = new Date(dateCopy);
      monday.setDate(diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        startDate: new Date(
          monday.getFullYear(),
          monday.getMonth(),
          monday.getDate()
        ),
        endDate: new Date(
          sunday.getFullYear(),
          sunday.getMonth(),
          sunday.getDate()
        ),
      };
    } else {
      // 월 단위: 해당 월의 1일~말일
      const year = dateCopy.getFullYear();
      const month = dateCopy.getMonth();
      return {
        startDate: new Date(year, month, 1),
        endDate: new Date(year, month + 1, 0),
      };
    }
  };

  // [Logic] 날짜를 YYYY-MM-DD 형식으로 변환
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: Date 객체를 문자열로 변환하는 함수 추가, 어디서: StatsPage.jsx 82-86번째 줄, 어떻게: getFullYear, getMonth+1, getDate를 사용하여 포맷팅, 왜: API 호출 시 날짜 파라미터를 문자열 형식으로 전달하기 위해
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
        // 현재 기간 데이터 조회 (신규 API 시도 후 실패 시 fallback)
        let resMealCurrent, resCartCurrent, resTodoCurrent, resCategoryCurrent;

        try {
          // 신규 API 시도
          [resMealCurrent, resCartCurrent, resTodoCurrent, resCategoryCurrent] =
            await Promise.all([
              dataApi
                .get(`/api/stats/meal/range`, {
                  params: { startDate: currentStart, endDate: currentEnd },
                })
                .catch((e) => {
                  console.error("식단 통계 API 실패:", e);
                  return { data: null };
                }),
              dataApi
                .get(`/api/stats/cart/range`, {
                  params: { startDate: currentStart, endDate: currentEnd },
                })
                .catch((e) => {
                  console.error("장바구니 통계 API 실패:", e);
                  return { data: null };
                }),
              dataApi
                .get(`/api/todo/stats`, {
                  params: { startDate: currentStart, endDate: currentEnd },
                })
                .catch((e) => {
                  console.error("일정 통계 API 실패:", e);
                  return { data: null };
                }),
              dataApi
                .get(`/api/tx/category-stats`, {
                  params: { startDate: currentStart, endDate: currentEnd },
                })
                .catch((e) => {
                  console.error("카테고리 통계 API 실패:", e);
                  return { data: { categories: [], totalExpense: 0 } };
                }),
            ]);

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

        // Fallback: 기존 API로 기간 내 모든 날짜 데이터 조회
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: fallback 로직의 API 엔드포인트 수정, 어디서: StatsPage.jsx 125-145번째 줄, 어떻게: /api/meals → /api/stats/meal, /api/cart → /api/stats/cart로 변경, 왜: 백엔드 응답에 따르면 /api/meals, /api/cart 엔드포인트가 존재하지 않기 때문에
        if (
          !resMealCurrent?.data ||
          !resCartCurrent?.data ||
          !resTodoCurrent?.data
        ) {
          const start = new Date(currentRange.startDate);
          const end = new Date(currentRange.endDate);
          const mealList = [];
          const cartList = [];
          const todoList = [];
          const txList = [];

          // 기간 내 모든 날짜 순회
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            try {
              const [meals, cart, todos, txs] = await Promise.all([
                // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단 API 엔드포인트 수정, 어디서: StatsPage.jsx 140번째 줄, 어떻게: /api/meals → /api/stats/meal?date=...로 변경, 왜: 백엔드 응답에 따르면 /api/meals는 존재하지 않고 /api/stats/meal을 사용해야 하기 때문에
                dataApi
                  .get(`/api/stats/meal`, { params: { date: dateStr } })
                  .catch(() => ({ data: null })),
                // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 장바구니 API 엔드포인트 수정, 어디서: StatsPage.jsx 141번째 줄, 어떻게: /api/cart → /api/stats/cart?date=...로 변경, 왜: 백엔드 응답에 따르면 /api/cart는 존재하지 않고 /api/stats/cart를 사용해야 하기 때문에
                dataApi
                  .get(`/api/stats/cart`, { params: { date: dateStr } })
                  .catch(() => ({ data: null })),
                dataApi
                  .get(`/api/todo/getList`, { params: { date: dateStr } })
                  .catch(() => ({ data: [] })),
                dataApi
                  .get(`/api/tx`, {
                    params: { year: d.getFullYear(), month: d.getMonth() + 1 },
                  })
                  .catch(() => ({ data: [] })),
              ]);

              // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: API 응답 구조에 맞게 데이터 처리 수정, 어디서: StatsPage.jsx 145-165번째 줄, 어떻게: /api/stats/meal은 통계 객체를 반환하므로 직접 사용, /api/stats/cart도 통계 객체를 반환하므로 직접 사용, 왜: 백엔드 API 응답 구조가 배열이 아닌 통계 객체이기 때문에
              // /api/stats/meal은 통계 객체 {totalCalories, targetCalories, ...}를 반환
              // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단 통계 데이터 처리 로직 수정, 어디서: StatsPage.jsx 155-162번째 줄, 어떻게: resMealCurrent가 없을 때 초기화하고, 각 날짜의 통계를 누적, 왜: 기간 내 모든 날짜의 식단 데이터를 집계하기 위해
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
                // console.log(
                //   `DEBUG: 날짜 ${dateStr} 식단 통계`,
                //   meals.data,
                //   "누적:",
                //   resMealCurrent.data
                // );
              }

              // /api/stats/cart는 통계 객체 {purchaseRate, totalQuantity, purchasedQuantity}를 반환
              // [수정 2026-01-19] 누가: 효민, 무엇을: 장바구니 통계 데이터 조회 디버깅 로그 추가 및 데이터 누적 처리 개선, 어디서: StatsPage.jsx 314-321번째 줄, 어떻게: 각 날짜별 장바구니 데이터를 콘솔에 출력하고 누적 처리, 왜: 통계 페이지에서 장바구니 데이터가 제대로 표시되지 않는 문제 디버깅을 위해
              // console.log(`DEBUG: 날짜 ${dateStr} 장바구니 통계`, cart.data);
              if (cart.data && cart.data.totalQuantity !== undefined) {
                if (!resCartCurrent?.data) {
                  resCartCurrent = {
                    data: {
                      purchaseRate: 0,
                      totalQuantity: 0,
                      purchasedQuantity: 0,
                    },
                  };
                }
                resCartCurrent.data.totalQuantity +=
                  Number(cart.data.totalQuantity) || 0;
                resCartCurrent.data.purchasedQuantity +=
                  Number(cart.data.purchasedQuantity) || 0;
                console.log(
                  `DEBUG: 날짜 ${dateStr} 장바구니 누적`,
                  resCartCurrent.data
                );
              } else {
                console.log(
                  `DEBUG: 날짜 ${dateStr} 장바구니 데이터 없음 또는 totalQuantity 없음`
                );
              }

              if (todos.data)
                todoList.push(...(Array.isArray(todos.data) ? todos.data : []));
              if (txs.data) {
                const filtered = Array.isArray(txs.data)
                  ? txs.data.filter((tx) => {
                      const txDate = tx.txDate || tx.date;
                      return txDate && txDate.startsWith(dateStr);
                    })
                  : [];
                txList.push(...filtered);
              }
            } catch (e) {
              console.error(`날짜 ${dateStr} 데이터 조회 실패:`, e);
            }
          }

          // 장바구니 구매율 계산
          // [수정 2026-01-19] 누가: 효민, 무엇을: 장바구니 구매율 계산 로직의 조건문 오류 수정, 어디서: StatsPage.jsx 336-340번째 줄, 어떻게: !resCartCurrent?.data를 resCartCurrent?.data로 수정하고 totalQuantity > 0 조건 추가, 왜: 기존 조건문이 논리적으로 실행되지 않아 purchaseRate가 계산되지 않는 문제 해결
          if (resCartCurrent?.data && resCartCurrent.data.totalQuantity > 0) {
            resCartCurrent.data.purchaseRate =
              (resCartCurrent.data.purchasedQuantity /
                resCartCurrent.data.totalQuantity) *
              100;
            console.log(
              "DEBUG: 장바구니 구매율 계산 완료",
              resCartCurrent.data
            );
          }

          if (!resTodoCurrent?.data && todoList.length > 0) {
            const totalTodos = todoList.length;
            const doneTodos = todoList.filter(
              (todo) => todo.isDone || todo.is_done
            ).length;
            const completionRate =
              totalTodos > 0 ? (doneTodos / totalTodos) * 100 : 0;
            resTodoCurrent = {
              data: { totalTodos, completedTodos: doneTodos, completionRate },
            };
          }

          // 카테고리별 지출 통계 계산
          if (
            !resCategoryCurrent?.data?.categories ||
            resCategoryCurrent.data.categories.length === 0
          ) {
            const categoryExpenses = {};
            const totalExpense = txList
              .filter((tx) => tx.type === "EXPENSE")
              .reduce((acc, tx) => {
                const amount = Math.abs(Number(tx.amount) || 0);
                const category = tx.category || "기타";
                if (!categoryExpenses[category]) {
                  categoryExpenses[category] = 0;
                }
                categoryExpenses[category] += amount;
                return acc + amount;
              }, 0);

            if (totalExpense > 0) {
              const categories = Object.entries(categoryExpenses)
                .map(([category, amount]) => ({
                  category,
                  amount,
                  percentage: Math.floor((amount / totalExpense) * 100),
                }))
                .sort((a, b) => b.amount - a.amount);
              resCategoryCurrent = { data: { categories, totalExpense } };
            } else {
              resCategoryCurrent = {
                data: { categories: [], totalExpense: 0 },
              };
            }
          }
        }

        // 이전 기간 데이터 조회 (동일한 fallback 로직 적용)
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 이전 기간 데이터 조회도 fallback 방식으로 변경, 어디서: StatsPage.jsx 147-220번째 줄, 어떻게: 신규 API 실패 시 기존 API로 조회 후 집계, 왜: 백엔드 API가 준비되지 않았을 때도 이전 기간 데이터를 조회하기 위해
        let resMealPrev, resCartPrev, resTodoPrev, resCategoryPrev;

        try {
          [resMealPrev, resCartPrev, resTodoPrev, resCategoryPrev] =
            await Promise.all([
              dataApi
                .get(`/api/stats/meal/range`, {
                  params: { startDate: prevStart, endDate: prevEnd },
                })
                .catch(() => ({ data: null })),
              dataApi
                .get(`/api/stats/cart/range`, {
                  params: { startDate: prevStart, endDate: prevEnd },
                })
                .catch(() => ({ data: null })),
              dataApi
                .get(`/api/todo/stats`, {
                  params: { startDate: prevStart, endDate: prevEnd },
                })
                .catch(() => ({ data: null })),
              dataApi
                .get(`/api/tx/category-stats`, {
                  params: { startDate: prevStart, endDate: prevEnd },
                })
                .catch(() => ({ data: { categories: [], totalExpense: 0 } })),
            ]);
        } catch (e) {
          console.log("이전 기간 신규 API 실패, fallback 사용:", e);
        }

        // 이전 기간 fallback
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 이전 기간 fallback 로직도 동일하게 수정, 어디서: StatsPage.jsx 200-240번째 줄, 어떻게: /api/meals → /api/stats/meal, /api/cart → /api/stats/cart로 변경하고 응답 구조에 맞게 처리, 왜: 백엔드 API 엔드포인트와 응답 구조에 맞게 수정하기 위해
        if (!resMealPrev?.data || !resCartPrev?.data || !resTodoPrev?.data) {
          const start = new Date(prevRange.startDate);
          const end = new Date(prevRange.endDate);
          const todoList = [];
          const txList = [];

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            try {
              const [meals, cart, todos, txs] = await Promise.all([
                dataApi
                  .get(`/api/stats/meal`, { params: { date: dateStr } })
                  .catch(() => ({ data: null })),
                dataApi
                  .get(`/api/stats/cart`, { params: { date: dateStr } })
                  .catch(() => ({ data: null })),
                dataApi
                  .get(`/api/todo/getList`, { params: { date: dateStr } })
                  .catch(() => ({ data: [] })),
                dataApi
                  .get(`/api/tx`, {
                    params: { year: d.getFullYear(), month: d.getMonth() + 1 },
                  })
                  .catch(() => ({ data: [] })),
              ]);

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

              // [수정 2026-01-19] 누가: 효민, 무엇을: 이전 기간 장바구니 통계 데이터 조회 디버깅 로그 추가, 어디서: StatsPage.jsx 426-432번째 줄, 어떻게: 각 날짜별 장바구니 데이터를 콘솔에 출력하고 누적 처리, 왜: 통계 페이지에서 장바구니 데이터가 제대로 표시되지 않는 문제 디버깅을 위해
              if (cart.data && cart.data.totalQuantity !== undefined) {
                if (!resCartPrev?.data) {
                  resCartPrev = {
                    data: {
                      purchaseRate: 0,
                      totalQuantity: 0,
                      purchasedQuantity: 0,
                    },
                  };
                }
                resCartPrev.data.totalQuantity +=
                  Number(cart.data.totalQuantity) || 0;
                resCartPrev.data.purchasedQuantity +=
                  Number(cart.data.purchasedQuantity) || 0;
              }

              if (todos.data)
                todoList.push(...(Array.isArray(todos.data) ? todos.data : []));
              if (txs.data) {
                const filtered = Array.isArray(txs.data)
                  ? txs.data.filter((tx) => {
                      const txDate = tx.txDate || tx.date;
                      return txDate && txDate.startsWith(dateStr);
                    })
                  : [];
                txList.push(...filtered);
              }
            } catch (e) {
              console.error(`이전 기간 날짜 ${dateStr} 데이터 조회 실패:`, e);
            }
          }

          // [수정 2026-01-19] 누가: 효민, 무엇을: 이전 기간 장바구니 구매율 계산 로직의 조건문 오류 수정, 어디서: StatsPage.jsx 447-449번째 줄, 어떻게: !resCartPrev?.data를 resCartPrev?.data로 수정하고 totalQuantity > 0 조건 추가, 왜: 기존 조건문이 논리적으로 실행되지 않아 purchaseRate가 계산되지 않는 문제 해결
          if (resCartPrev?.data && resCartPrev.data.totalQuantity > 0) {
            resCartPrev.data.purchaseRate =
              (resCartPrev.data.purchasedQuantity /
                resCartPrev.data.totalQuantity) *
              100;
          }

          if (!resTodoPrev?.data && todoList.length > 0) {
            const totalTodos = todoList.length;
            const doneTodos = todoList.filter(
              (todo) => todo.isDone || todo.is_done
            ).length;
            const completionRate =
              totalTodos > 0 ? (doneTodos / totalTodos) * 100 : 0;
            resTodoPrev = {
              data: { totalTodos, completedTodos: doneTodos, completionRate },
            };
          }

          if (
            !resCategoryPrev?.data?.categories ||
            resCategoryPrev.data.categories.length === 0
          ) {
            const categoryExpenses = {};
            const totalExpense = txList
              .filter((tx) => tx.type === "EXPENSE")
              .reduce((acc, tx) => {
                const amount = Math.abs(Number(tx.amount) || 0);
                const category = tx.category || "기타";
                if (!categoryExpenses[category]) {
                  categoryExpenses[category] = 0;
                }
                categoryExpenses[category] += amount;
                return acc + amount;
              }, 0);

            if (totalExpense > 0) {
              const categories = Object.entries(categoryExpenses)
                .map(([category, amount]) => ({
                  category,
                  amount,
                  percentage: Math.floor((amount / totalExpense) * 100),
                }))
                .sort((a, b) => b.amount - a.amount);
              resCategoryPrev = { data: { categories, totalExpense } };
            } else {
              resCategoryPrev = { data: { categories: [], totalExpense: 0 } };
            }
          }
        }

        // (1) 식단 관리 계산: 끼니 단위 달성률 + 칼로리 초과/정상/미달성 정보
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단 점수 계산 방식을 끼니 단위 달성률로 변경하고 칼로리 초과/정상/미달성 정보 추가, 어디서: StatsPage.jsx 358-420번째 줄, 어떻게: 기간 내 기록이 있는 날의 이상적 끼니 수와 실제 먹은 끼니 수를 비교하고, 각 날짜별 칼로리 초과 여부 확인, 왜: 사용자 요청에 따라 끼니 단위 통계와 칼로리 초과 정보를 함께 표시하기 위해
        // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 끼니 단위 달성률과 칼로리 초과 정보를 함께 계산하는 함수 추가, 어디서: StatsPage.jsx 365-420번째 줄, 어떻게: 기간 내 각 날짜별로 /api/meals와 /api/stats/meal 조회하여 끼니 수와 칼로리 초과 여부 확인, 왜: 끼니 달성률과 칼로리 초과 정보를 함께 제공하기 위해
        const calculateDietMealRate = async (startDate, endDate) => {
          const start = new Date(startDate);
          const end = new Date(endDate);
          let totalPeriodDays = 0; // 전체 기간 일수 (기록 유무와 관계없이)
          let recordedDays = 0; // 기록이 있는 날 수
          let totalMeals = 0; // 실제 먹은 끼니 수 (아침, 점심, 저녁만)
          let normalDays = 0; // 정상 범위 날 수 (목표 칼로리 달성)
          let overDays = 0; // 초과 날 수 (권장 칼로리 넘음)
          let underDays = 0; // 미달성 날 수 (목표 칼로리 미달)
          // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 각 날짜별 상태 정보를 저장하는 배열 추가, 어디서: StatsPage.jsx 371번째 줄, 어떻게: 날짜와 상태를 매핑하는 배열 생성, 왜: 차트 호버 시 날짜 정보를 표시하기 위해
          const dateStatusMap = {
            normal: [],
            over: [],
            under: [],
            noRecord: [],
          }; // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기록없음 날짜도 저장하도록 dateStatusMap에 noRecord 추가, 어디서: StatsPage.jsx 493번째 줄, 어떻게: dateStatusMap에 noRecord 배열 추가, 왜: 기록없음 항목에도 날짜를 표시하기 위해

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            totalPeriodDays++; // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 전체 기간 일수 카운트, 어디서: StatsPage.jsx 375번째 줄, 어떻게: 모든 날짜에 대해 카운트 증가, 왜: 기록이 없는 날도 포함하여 전체 기간 일수를 계산하기 위해
            const dateStr = formatDate(d);
            let hasRecord = false; // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기록 여부 확인 변수 추가, 어디서: StatsPage.jsx 497번째 줄, 어떻게: hasRecord 변수 선언, 왜: 기록이 없는 날짜를 추적하기 위해
            try {
              // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단 목록과 통계 API를 함께 조회하여 끼니 수와 칼로리 정보 확인, 어디서: StatsPage.jsx 375-395번째 줄, 어떻게: /api/meals와 /api/stats/meal을 함께 조회, 왜: 끼니별 기록 수와 칼로리 초과 여부를 모두 확인하기 위해
              const [mealRes, statsRes] = await Promise.all([
                dataApi
                  .get(`/api/meals`, { params: { date: dateStr } })
                  .catch(() => ({ data: [] })),
                dataApi
                  .get(`/api/stats/meal`, { params: { date: dateStr } })
                  .catch(() => ({ data: null })),
              ]);

              if (
                mealRes.data &&
                Array.isArray(mealRes.data) &&
                mealRes.data.length > 0
              ) {
                hasRecord = true; // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기록 있음으로 표시, 어디서: StatsPage.jsx 507번째 줄, 어떻게: hasRecord를 true로 설정, 왜: 기록이 있는 날짜를 추적하기 위해
                recordedDays++;
                // 아침, 점심, 저녁만 카운트 (간식 제외)
                const mealTypes = mealRes.data
                  .filter(
                    (meal) =>
                      meal.mealType === "아침" ||
                      meal.mealType === "점심" ||
                      meal.mealType === "저녁"
                  )
                  .map((meal) => meal.mealType);
                // 중복 제거 (같은 끼니에 여러 번 기록한 경우 1번만 카운트)
                const uniqueMealTypes = [...new Set(mealTypes)];
                totalMeals += uniqueMealTypes.length;

                // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 칼로리 초과/정상/미달성 기준을 명확한 퍼센트 범위로 변경하고 날짜 정보 저장, 어디서: StatsPage.jsx 391-410번째 줄, 어떻게: 목표 칼로리 대비 비율로 계산하여 0~50% 미달성, 51~100% 정상, 100% 초과로 구분하고 날짜를 배열에 저장, 왜: 사용자 요청에 따라 더 명확하고 현실적인 기준으로 구분하고 차트 호버 시 날짜 정보를 표시하기 위해
                if (
                  statsRes.data &&
                  statsRes.data.totalCalories !== undefined
                ) {
                  const totalCalories =
                    Number(statsRes.data.totalCalories) || 0;
                  const targetCalories =
                    Number(statsRes.data.targetCalories) || 2500;
                  const caloriePercent = (totalCalories / targetCalories) * 100; // 목표 대비 비율

                  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 칼로리 기준을 퍼센트 범위로 구분하고 날짜 저장, 어디서: StatsPage.jsx 397-407번째 줄, 어떻게: 0~50% 미달성, 51~100% 정상, 100% 초과로 분류하고 각 상태별 날짜 배열에 추가, 왜: 사용자 요청에 따라 더 명확한 기준 적용하고 차트 호버 시 날짜 정보 표시하기 위해
                  if (caloriePercent > 100) {
                    overDays++; // 초과 (100% 초과)
                    dateStatusMap.over.push(dateStr);
                  } else if (caloriePercent >= 51) {
                    normalDays++; // 정상 범위 (51%~100%)
                    dateStatusMap.normal.push(dateStr);
                  } else {
                    underDays++; // 미달성 (0~50%)
                    dateStatusMap.under.push(dateStr);
                  }
                }
              }

              // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 기록이 없는 날짜를 dateStatusMap.noRecord에 추가, 어디서: StatsPage.jsx 537-540번째 줄, 어떻게: hasRecord가 false인 경우 noRecord 배열에 날짜 추가, 왜: 기록없음 항목에도 날짜를 표시하기 위해
              if (!hasRecord) {
                dateStatusMap.noRecord.push(dateStr);
              }
            } catch (e) {
              console.error(`날짜 ${dateStr} 식단 조회 실패:`, e);
              // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 조회 실패한 날짜도 기록없음으로 처리, 어디서: StatsPage.jsx 544번째 줄, 어떻게: catch 블록에서도 noRecord 배열에 날짜 추가, 왜: 에러 발생 시에도 기록없음으로 표시하기 위해
              dateStatusMap.noRecord.push(dateStr);
            }
          }

          // 이상적 끼니 수 = 기록이 있는 날 수 × 3끼 (아침, 점심, 저녁)
          const idealMeals = recordedDays * 3;
          const mealRate =
            idealMeals > 0 ? Math.floor((totalMeals / idealMeals) * 100) : 0;

          return {
            mealRate,
            normalDays,
            overDays,
            underDays,
            totalPeriodDays, // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 전체 기간 일수 반환, 어디서: StatsPage.jsx 424번째 줄, 어떻게: totalPeriodDays를 반환 객체에 추가, 왜: 기록이 없는 날도 표시하기 위해
            dateStatusMap, // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 날짜별 상태 정보 반환, 어디서: StatsPage.jsx 420번째 줄, 어떻게: dateStatusMap을 반환 객체에 추가, 왜: 차트 호버 시 날짜 정보를 표시하기 위해
          };
        };

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

        // (2) 소비율 계산: 카테고리별 지출 비율 (백엔드 API 사용)
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 카테고리별 지출 통계를 백엔드 신규 API로 변경, 어디서: StatsPage.jsx 151-165번째 줄, 어떻게: /api/tx/category-stats API 응답의 categories 배열 사용, 왜: 백엔드에서 이미 카테고리별 집계 및 비율 계산을 제공하기 때문에
        let currentConsumptionList = [];
        let prevConsumptionList = [];

        if (resCategoryCurrent.data && resCategoryCurrent.data.categories) {
          currentConsumptionList = resCategoryCurrent.data.categories.map(
            (item) => ({
              category: item.category,
              amount: item.amount,
              percentage: item.percentage,
            })
          );
        }

        if (resCategoryPrev.data && resCategoryPrev.data.categories) {
          prevConsumptionList = resCategoryPrev.data.categories.map((item) => ({
            category: item.category,
            amount: item.amount,
            percentage: item.percentage,
          }));
        }

        // (3) 장바구니 완료율 계산: (구매 완료 항목 수 / 전체 등록 항목 수) × 100
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 장바구니 완료율을 백엔드 API 응답에서 직접 사용, 어디서: StatsPage.jsx 168-178번째 줄, 어떻게: /api/stats/cart/range 응답의 purchaseRate 사용, 왜: 백엔드에서 이미 구매율을 계산하여 제공하기 때문에
        let currentCartValue = 0;
        let prevCartValue = 0;

        if (resCartCurrent.data) {
          currentCartValue = Math.floor(resCartCurrent.data.purchaseRate || 0);
        }

        if (resCartPrev.data) {
          prevCartValue = Math.floor(resCartPrev.data.purchaseRate || 0);
        }

        // (4) 일정 달성률 계산: (완료된 일정 수 / 전체 일정 수) × 100
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 일정 달성률을 백엔드 API 응답에서 직접 사용, 어디서: StatsPage.jsx 181-191번째 줄, 어떻게: /api/todo/stats 응답의 completionRate 사용, 왜: 백엔드에서 이미 완료율을 계산하여 제공하기 때문에
        let currentScheduleValue = 0;
        let prevScheduleValue = 0;

        if (resTodoCurrent.data) {
          currentScheduleValue = Math.floor(
            resTodoCurrent.data.completionRate || 0
          );
        }

        if (resTodoPrev.data) {
          prevScheduleValue = Math.floor(resTodoPrev.data.completionRate || 0);
        }

        // State 업데이트
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: state 업데이트 로직 변경, 어디서: StatsPage.jsx 223-230번째 줄, 어떻게: 현재 기간과 이전 기간 데이터를 각각 state에 저장, 왜: 이전 기간 대비 증감률 계산 및 표시를 위해
        setCurrentDietScore(currentDietValue);
        setPrevDietScore(prevDietValue);
        // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단관리 상세 정보 state 설정에 날짜 정보 및 전체 기간 일수 추가, 어디서: StatsPage.jsx 486-487번째 줄, 어떻게: currentDietResult와 prevDietResult의 normalDays, overDays, underDays, totalPeriodDays, dateStatusMap 설정, 왜: 차트에 정상/초과/미달성 정보와 날짜 정보, 기록 없는 날을 표시하기 위해
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
        }); // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: dateStatusMap에 noRecord 추가, 어디서: StatsPage.jsx 617번째 줄, 어떻게: dateStatusMap 초기값에 noRecord 배열 추가, 왜: 기록없음 날짜를 표시하기 위해
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
        }); // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: dateStatusMap에 noRecord 추가, 어디서: StatsPage.jsx 618번째 줄, 어떻게: dateStatusMap 초기값에 noRecord 배열 추가, 왜: 기록없음 날짜를 표시하기 위해
        setCurrentConsumptionData(currentConsumptionList);
        setPrevConsumptionData(prevConsumptionList);
        setCurrentCartScore(currentCartValue);
        setPrevCartScore(prevCartValue);
        setCurrentScheduleScore(currentScheduleValue);
        setPrevScheduleScore(prevScheduleValue);
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
        }); // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: dateStatusMap에 noRecord 추가, 어디서: StatsPage.jsx 631번째 줄, 어떻게: dateStatusMap 초기값에 noRecord 배열 추가, 왜: 기록없음 날짜를 표시하기 위해
        setPrevDietDetail({
          normalDays: 0,
          overDays: 0,
          underDays: 0,
          totalPeriodDays: 0,
          dateStatusMap: { normal: [], over: [], under: [], noRecord: [] },
        }); // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: dateStatusMap에 noRecord 추가, 어디서: StatsPage.jsx 632번째 줄, 어떻게: dateStatusMap 초기값에 noRecord 배열 추가, 왜: 기록없음 날짜를 표시하기 위해
        setCurrentConsumptionData([]);
        setPrevConsumptionData([]);
        setCurrentCartScore(0);
        setPrevCartScore(0);
        setCurrentScheduleScore(0);
        setPrevScheduleScore(0);
        setHasData(false);
      }
    };

    fetchData();
  }, [currentDate, periodType, updateKey]);

  // [Logic] 증감률 계산 함수
  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 이전 기간 대비 증감률 계산 방식을 절대 증가(percentage point)로 변경, 어디서: StatsPage.jsx 483-486번째 줄, 어떻게: (현재값 - 이전값)으로 절대 차이 계산, 왜: 사용자 요청에 따라 상대 증가율이 아닌 절대 증가(퍼센트 포인트)로 표시하기 위해
  const calculateChangeRate = (current, prev) => {
    return Math.round(current - prev);
  };

  // [Data] 파이 차트 데이터 생성 함수 (단일 값용)
  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 단일 값 파이 차트 데이터 생성 함수 수정, 어디서: StatsPage.jsx 243-254번째 줄, 어떻게: 값과 나머지(100-값)로 구성된 파이 차트 데이터 생성, 왜: 식단, 장바구니, 일정 차트는 단일 비율을 표시하기 위해
  const createSinglePieData = (value, label, colors) => {
    const percentage = Math.min(value, 100);
    const remaining = 100 - percentage;

    return {
      labels: [label, ""],
      datasets: [
        {
          data: [percentage, remaining],
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  };

  // [Data] 식단관리 3개 영역 파이 차트 데이터 생성 함수
  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단관리 차트 데이터 생성 함수 수정 - 0인 항목 제외, 어디서: StatsPage.jsx 545-580번째 줄, 어떻게: normalDays, overDays, underDays가 0보다 큰 항목만 차트에 포함, 왜: 사용자 요청에 따라 해당 색깔 영역이 없으면 차트에서 제외하기 위해
  const createDietPieData = (
    normalDays,
    overDays,
    underDays,
    dateStatusMap = { normal: [], over: [], under: [] }
  ) => {
    const totalDays = normalDays + overDays + underDays;
    if (totalDays === 0) {
      return {
        labels: ["데이터 없음"],
        datasets: [
          {
            data: [100],
            backgroundColor: ["#e2e8f0"],
            borderWidth: 0,
          },
        ],
      };
    }

    // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 0인 항목 제외하고 차트 데이터 생성 및 순서 정보 저장, 어디서: StatsPage.jsx 655-685번째 줄, 어떻게: 각 항목이 0보다 클 때만 배열에 추가하고 순서 정보도 함께 저장, 왜: 해당 색깔 영역이 없으면 차트에서 제외하고 라벨 위치 계산에 순서 정보 사용하기 위해
    const labels = [];
    const data = [];
    const colors = [];
    const dates = [];
    const order = []; // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 각 항목의 순서 정보 저장, 어디서: StatsPage.jsx 662번째 줄, 어떻게: 각 항목의 타입('normal', 'over', 'under') 저장, 왜: 라벨 위치 계산 시 순서 정보 사용하기 위해

    if (normalDays > 0) {
      labels.push("정상"); // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨 문구 변경 '정상 범위' -> '정상', 어디서: StatsPage.jsx 691번째 줄, 어떻게: '정상 범위'를 '정상'으로 변경, 왜: 사용자 요청에 따라 라벨 문구 간소화하기 위해
      data.push(Math.round((normalDays / totalDays) * 100));
      colors.push("#4caf50");
      dates.push(dateStatusMap.normal || []);
      order.push("normal");
    }
    if (overDays > 0) {
      labels.push("초과"); // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 라벨 문구 변경 '칼로리 초과' -> '초과', 어디서: StatsPage.jsx 698번째 줄, 어떻게: '칼로리 초과'를 '초과'로 변경, 왜: 사용자 요청에 따라 라벨 문구 간소화하기 위해
      data.push(Math.round((overDays / totalDays) * 100));
      colors.push("#f44336");
      dates.push(dateStatusMap.over || []);
      order.push("over");
    }
    if (underDays > 0) {
      labels.push("미달성");
      data.push(Math.round((underDays / totalDays) * 100));
      colors.push("#ff9800");
      dates.push(dateStatusMap.under || []);
      order.push("under");
    }

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
          dates,
          order, // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 순서 정보를 데이터셋에 포함, 어디서: StatsPage.jsx 686번째 줄, 어떻게: order 배열을 데이터셋에 추가, 왜: 라벨 위치 계산 시 순서 정보 사용하기 위해
        },
      ],
    };
  };

  // [Data] 파이 차트 데이터 생성 함수 (카테고리별 소비율용)
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 카테고리별 소비율 파이 차트 데이터 생성 함수 추가, 어디서: StatsPage.jsx 257-275번째 줄, 어떻게: 카테고리별 지출 데이터를 파이 차트 형식으로 변환, 왜: 소비율 차트에 카테고리별 지출 비율을 표시하기 위해
  const createConsumptionPieData = (consumptionData) => {
    if (!consumptionData || consumptionData.length === 0) {
      return {
        labels: ["데이터 없음"],
        datasets: [
          {
            data: [100],
            backgroundColor: ["#e2e8f0"],
            borderWidth: 0,
          },
        ],
      };
    }

    const colors = [
      "#2196f3",
      "#4caf50",
      "#ff9800",
      "#9c27b0",
      "#f44336",
      "#00bcd4",
      "#ffc107",
    ];
    return {
      labels: consumptionData.map((item) => item.category),
      datasets: [
        {
          data: consumptionData.map((item) => item.percentage),
          backgroundColor: consumptionData.map(
            (_, index) => colors[index % colors.length]
          ),
          borderWidth: 0,
        },
      ],
    };
  };

  // [Config] 파이 차트 옵션 (범례 및 툴팁 포함)
  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단관리 차트 범례를 숨기고 차트 위에 라벨 표시, 어디서: StatsPage.jsx 595-625번째 줄, 어떻게: legend.display를 false로 설정, 왜: 사용자 요청에 따라 범례를 제거하고 차트 위에 라벨로 표시하기 위해
  const pieOptions = {
    plugins: {
      legend: {
        display: false, // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단관리 차트 범례 숨김, 어디서: StatsPage.jsx 599번째 줄, 어떻게: display를 false로 변경, 왜: 차트 위에 라벨로 표시하기 위해
        position: "bottom",
        labels: {
          font: {
            family: "'Pretendard', sans-serif",
            size: 12,
          },
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 툴팁 z-index 조정하여 라벨과 겹치지 않도록, 어디서: StatsPage.jsx 732번째 줄, 어떻게: zIndex 옵션 추가, 왜: 마우스 호버 시 툴팁이 라벨과 겹치지 않도록 하기 위해
        zIndex: 10, // 라벨보다 위에 표시
        // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 툴팁이 차트 영역 밖으로 나가도 표시되도록 position 설정, 어디서: StatsPage.jsx 770번째 줄, 어떻게: position을 'nearest'로 설정하고 intersect를 false로 설정, 왜: 툴팁이 잘리지 않도록 하기 위해
        position: "nearest",
        intersect: false,
        // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 툴팁이 차트 영역을 벗어나도 표시되도록 설정, 어디서: StatsPage.jsx 773번째 줄, 어떻게: padding과 displayColors 설정, 왜: 툴팁이 잘리지 않고 완전히 표시되도록 하기 위해
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 툴팁에서 날짜 정보 제거, 어디서: StatsPage.jsx 776-779번째 줄, 어떻게: 날짜 관련 코드 제거하고 퍼센트만 표시, 왜: 사용자 요청에 따라 툴팁 날짜를 제거하고 아래 상세 정보에 표시하기 위해
            return [`${label}: ${value}%`];
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // 각 차트 데이터
  // [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단관리 차트 데이터 생성에 날짜 정보 추가, 어디서: StatsPage.jsx 645번째 줄, 어떻게: createDietPieData 함수에 dateStatusMap 전달, 왜: 차트 호버 시 날짜 정보를 표시하기 위해
  const chart01Data = createDietPieData(
    currentDietDetail.normalDays,
    currentDietDetail.overDays,
    currentDietDetail.underDays,
    currentDietDetail.dateStatusMap
  );
  const chart02Data = createConsumptionPieData(currentConsumptionData);
  const chart03Data = createSinglePieData(currentCartScore, "장바구니 완료율", [
    "#ff9800",
    "#fff3e0",
  ]);
  const chart04Data = createSinglePieData(currentScheduleScore, "일정 달성률", [
    "#9c27b0",
    "#f3e5f5",
  ]);

  // [Config] 식단관리 차트 전용 옵션 (범례 숨김)
  // [추가 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 식단관리 차트 전용 옵션 생성, 어디서: StatsPage.jsx 650-652번째 줄, 어떻게: pieOptions를 복사하여 legend.display를 false로 설정, 왜: 식단관리 차트만 범례를 숨기고 다른 차트는 범례를 유지하기 위해
  const dietPieOptions = {
    ...pieOptions,
    plugins: {
      ...pieOptions.plugins,
      legend: {
        ...pieOptions.plugins.legend,
        display: false, // 식단관리 차트만 범례 숨김
      },
    },
  };

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

  // [Logic] 주 단위 범위 계산 함수
  // [추가 2026-01-19] 누가: 효민, 무엇을: 선택한 날짜가 포함된 주의 시작일과 종료일을 계산하는 함수 추가, 어디서: StatsPage.jsx 1117-1130번째 줄, 어떻게: getPeriodRange 함수를 사용하여 주 단위 범위 계산, 왜: DatePicker에서 주 단위 범위 선택을 표시하기 위해
  const getWeekRange = (date) => {
    return getPeriodRange(date, "week");
  };

  // [Logic] 2026년 전체 주 목록 생성
  // [수정 2026-01-19] 누가: 효민, 무엇을: 2026년 첫 주부터 마지막 주까지 전체 주 목록 생성, 어디서: StatsPage.jsx 1131-1164번째 줄, 어떻게: 2026년 1월 1일부터 12월 31일까지의 모든 주를 계산, 왜: 사용자가 2026년 전체 주를 선택할 수 있도록 하기 위해
  const getWeeksList = () => {
    const weeks = [];
    const year = 2026;

    // 2026년 첫 날
    const firstDay = new Date(year, 0, 1);
    // 2026년 마지막 날
    const lastDay = new Date(year, 11, 31);

    // 첫날이 속한 주의 월요일 찾기
    const firstDayOfWeek = firstDay.getDay();
    const mondayOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    let currentMonday = new Date(year, 0, 1 + mondayOffset);

    // 마지막날이 속한 주의 일요일 찾기
    const lastDayOfWeek = lastDay.getDay();
    const sundayOffset = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    const lastSunday = new Date(year, 11, lastDay.getDate() + sundayOffset);

    // 각 주를 생성
    while (currentMonday <= lastSunday) {
      const weekStart = new Date(currentMonday);
      const weekEnd = new Date(currentMonday);
      weekEnd.setDate(weekStart.getDate() + 6);

      // 2026년에 포함된 주만 추가
      if (weekStart.getFullYear() === year || weekEnd.getFullYear() === year) {
        weeks.push({
          startDate: new Date(weekStart),
          endDate: new Date(weekEnd),
        });
      }

      currentMonday.setDate(currentMonday.getDate() + 7);
    }

    // 월 필터링
    if (selectedMonth !== null) {
      return weeks.filter((week) => {
        const weekMonth = week.startDate.getMonth();
        return weekMonth === selectedMonth;
      });
    }

    return weeks;
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
                    {getWeeksList().map((week, index) => {
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
        {/* 파이 차트 영역 */}
        {/* [수정 2026-01-XX] 누가: 프론트엔드 개발자, 무엇을: 차트 3개를 4개로 변경, 어디서: StatsPage.jsx 372-430번째 줄, 어떻게: 식단, 소비율, 장바구니, 일정 4개 차트 렌더링, 왜: 요구사항에 맞게 4개 차트로 변경하기 위해 */}
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
