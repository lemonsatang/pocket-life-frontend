/**
 * 식단 통계 계산 유틸리티 함수
 */
import dataApi from "../../../../../api/api";
import { formatDate } from "./dateUtils";

/**
 * 식단 달성률 계산 함수
 * 끼니 단위 달성률 + 칼로리 초과/정상/미달성 정보를 함께 계산
 * @param {Date} startDate - 시작 날짜
 * @param {Date} endDate - 종료 날짜
 * @returns {Promise<Object>} { mealRate, normalDays, overDays, underDays, totalPeriodDays, dateStatusMap }
 */
export const calculateDietMealRate = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalPeriodDays = 0; // 전체 기간 일수 (기록 유무와 관계없이)
  let recordedDays = 0; // 기록이 있는 날 수
  let totalMeals = 0; // 실제 먹은 끼니 수 (아침, 점심, 저녁만)
  let normalDays = 0; // 정상 범위 날 수 (목표 칼로리 달성)
  let overDays = 0; // 초과 날 수 (권장 칼로리 넘음)
  let underDays = 0; // 미달성 날 수 (목표 칼로리 미달)
  const dateStatusMap = {
    normal: [],
    over: [],
    under: [],
    noRecord: [],
  };

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    totalPeriodDays++;
    const dateStr = formatDate(d);
    let hasRecord = false;

    try {
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
        hasRecord = true;
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

        // 칼로리 초과/정상/미달성 판단
        if (
          statsRes.data &&
          statsRes.data.totalCalories !== undefined
        ) {
          const totalCalories = Number(statsRes.data.totalCalories) || 0;
          const targetCalories = Number(statsRes.data.targetCalories) || 2500;
          const caloriePercent = (totalCalories / targetCalories) * 100;

          // 0~50% 미달성, 51~100% 정상, 100% 초과로 구분
          if (caloriePercent > 100) {
            overDays++;
            dateStatusMap.over.push(dateStr);
          } else if (caloriePercent >= 51) {
            normalDays++;
            dateStatusMap.normal.push(dateStr);
          } else {
            underDays++;
            dateStatusMap.under.push(dateStr);
          }
        }
      }

      if (!hasRecord) {
        dateStatusMap.noRecord.push(dateStr);
      }
    } catch (e) {
      console.error(`날짜 ${dateStr} 식단 조회 실패:`, e);
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
    totalPeriodDays,
    dateStatusMap,
  };
};

/**
 * 증감률 계산 함수 (절대 증가, percentage point)
 * @param {number} current - 현재 값
 * @param {number} prev - 이전 값
 * @returns {number} 증감률 (절대 차이)
 */
export const calculateChangeRate = (current, prev) => {
  return Math.round(current - prev);
};
