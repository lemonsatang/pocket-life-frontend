/**
 * 차트 설정 및 상수
 */

/**
 * 기본 파이 차트 옵션
 */
export const pieOptions = {
  plugins: {
    legend: {
      display: false,
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
      zIndex: 10,
      position: "nearest",
      intersect: false,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = context.parsed || 0;
          return [`${label}: ${value}%`];
        },
      },
    },
  },
  maintainAspectRatio: false,
};

/**
 * 식단관리 차트 전용 옵션 (범례 숨김)
 */
export const dietPieOptions = {
  ...pieOptions,
  plugins: {
    ...pieOptions.plugins,
    legend: {
      ...pieOptions.plugins.legend,
      display: false,
    },
  },
};
