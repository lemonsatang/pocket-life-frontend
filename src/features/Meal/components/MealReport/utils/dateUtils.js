/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * @param {Date} date - 변환할 날짜 객체
 * @returns {string} YYYY-MM-DD 형식의 문자열
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 기간 범위 계산 함수
 * @param {Date} date - 기준 날짜
 * @param {string} type - 'week' 또는 'month'
 * @returns {Object} { startDate: Date, endDate: Date }
 */
export const getPeriodRange = (date, type) => {
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

/**
 * 주 단위 범위 계산 함수 (getPeriodRange의 wrapper)
 * @param {Date} date - 기준 날짜
 * @returns {Object} { startDate: Date, endDate: Date }
 */
export const getWeekRange = (date) => {
  return getPeriodRange(date, "week");
};

/**
 * 2026년 전체 주 목록 생성
 * @param {number|null} selectedMonth - 필터링할 월 (0-11), null이면 전체
 * @returns {Array} 주 목록 [{ startDate: Date, endDate: Date }, ...]
 */
export const getWeeksList = (selectedMonth = null) => {
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
