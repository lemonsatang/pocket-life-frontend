/**
 * 차트 데이터 생성 유틸리티 함수
 */

/**
 * 식단관리 파이 차트 데이터 생성 함수
 * 0인 항목은 제외하고 차트 데이터 생성
 * @param {number} normalDays - 정상 일수
 * @param {number} overDays - 초과 일수
 * @param {number} underDays - 미달성 일수
 * @param {Object} dateStatusMap - 날짜별 상태 매핑 { normal: [], over: [], under: [] }
 * @returns {Object} Chart.js 파이 차트 데이터 형식
 */
export const createDietPieData = (
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

  const labels = [];
  const data = [];
  const colors = [];
  const dates = [];
  const order = [];

  if (normalDays > 0) {
    labels.push("정상");
    data.push(Math.round((normalDays / totalDays) * 100));
    colors.push("#4caf50");
    dates.push(dateStatusMap.normal || []);
    order.push("normal");
  }
  if (overDays > 0) {
    labels.push("초과");
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
        order,
      },
    ],
  };
};
