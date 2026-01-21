# Meal 관련 파일 구조 재정리 계획

## 📊 현재 문제점
- Meal 관련 파일들이 여러 곳에 흩어져 있음
- 관련 파일을 찾기 어려움
- 기능 확장 시 구조 파악이 어려움

## 🎯 제안하는 구조

### 옵션 1: Feature-based 구조 (권장) ⭐
```
src/
└── features/Meal/                    (또는 modules/Meal/)
    ├── MealPage.jsx                  (메인 페이지)
    ├── MealPage.css
    ├── components/                   (하위 컴포넌트들)
    │   ├── MealReport/
    │   │   ├── MealReport.jsx
    │   │   ├── MealReport.css
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── utils/
    │   │   └── constants/
    │   ├── MealStats/
    │   ├── MealChatbot/
    │   ├── MealList/
    │   ├── CheatingBanner.jsx
    │   ├── MealInputForm.jsx
    │   ├── MenuBoardModal.jsx
    │   └── QuantitySelectModal.jsx
    ├── hooks/                        (Meal 관련 훅들)
    │   ├── useMealData.js
    │   ├── useTargetCalories.js
    │   ├── useMealRecommendations.js
    │   └── useModal.js
    ├── context/                      (Meal 관련 컨텍스트)
    │   └── MealContext.jsx
    ├── data/                         (Meal 관련 데이터)
    │   └── recommendedMeals.js
    ├── utils/                        (Meal 관련 유틸리티)
    │   └── mealHelpers.js
    └── constants/                    (Meal 관련 상수)
        └── mealTypes.js
```

**장점:**
- ✅ 모든 Meal 관련 코드가 한 곳에 모임
- ✅ 기능별로 완전히 독립적
- ✅ 확장 시 위치가 명확함
- ✅ 코드 검색 및 탐색이 쉬움

**단점:**
- ⚠️ App.jsx의 라우팅 경로 변경 필요
- ⚠️ 다른 곳에서 Meal 관련 파일 import하는 곳들 수정 필요

---

### 옵션 2: Hybrid 구조
```
src/
├── pages/
│   └── MealPage/
│       ├── MealPage.jsx
│       └── MealPage.css
└── modules/Meal/                     (또는 features/Meal/)
    ├── components/
    │   ├── MealReport/
    │   ├── MealStats/
    │   ├── MealChatbot/
    │   └── MealList/
    ├── hooks/
    ├── context/
    ├── data/
    ├── utils/
    └── constants/
```

**장점:**
- ✅ pages 폴더는 유지
- ✅ Meal 관련 나머지 코드만 모음

**단점:**
- ⚠️ 여전히 두 곳에 분산
- ⚠️ 완전히 통합되지 않음

---

## 🔧 이주 계획

### Phase 1: 새 폴더 구조 생성
1. ✅ `src/features/Meal/` 폴더 생성
2. ✅ 하위 폴더들 생성 (components, hooks, context, data, utils, constants)

### Phase 2: 파일 이동
1. ✅ `src/pages/MealPage/` → `src/features/Meal/` (MealPage.jsx, MealPage.css)
2. ✅ `src/components/Meal/` → `src/features/Meal/components/`
3. ✅ `src/hooks/useMealData.js` → `src/features/Meal/hooks/`
4. ✅ `src/context/MealContext.jsx` → `src/features/Meal/context/`
5. ✅ `src/data/recommendedMeals.js` → `src/features/Meal/data/`

### Phase 3: Import 경로 수정
1. ✅ App.jsx의 라우팅 경로 수정
2. ✅ MealPage.jsx 내부 import 경로 수정
3. ✅ 다른 컴포넌트에서 Meal 관련 파일 import하는 곳 모두 수정
4. ✅ MealReport 리팩토링 시 생성된 파일들의 import 경로도 함께 수정

### Phase 4: 검증 및 정리
1. ✅ 모든 기능 동작 확인
2. ✅ 린터 에러 수정
3. ✅ 사용하지 않는 import 제거

---

## 📝 변경해야 할 Import 경로 예시

### Before
```javascript
// App.jsx
import MealPage from "./pages/MealPage/MealPage";

// MealPage.jsx
import MealStats from "../../components/Meal/MealStats/MealStats";
import { useMealData } from "../../hooks/useMealData";
import { lightMeals } from "../../data/recommendedMeals";
```

### After
```javascript
// App.jsx
import MealPage from "./features/Meal/MealPage";

// MealPage.jsx
import MealStats from "./components/MealStats/MealStats";
import { useMealData } from "./hooks/useMealData";
import { lightMeals } from "./data/recommendedMeals";
```

---

## ⚠️ 주의사항

1. **단계별 진행**: 한 번에 하나씩 이동하고 테스트
2. **Import 경로**: 모든 관련 파일의 import 경로 확인
3. **빌드 확인**: 각 단계마다 빌드 및 실행 확인
4. **Git 커밋**: 단계별로 커밋하여 롤백 가능하게

---

## 🎯 최종 권장사항

**옵션 1 (Feature-based 구조)을 추천**합니다.

이유:
- Meal 기능이 크고 독립적임
- 향후 확장성 고려
- 코드 탐색 및 유지보수 용이
- 명확한 책임 분리

---

## ✅ 작업 순서

1. [ ] 구조 재정리 계획 확정
2. [ ] 새 폴더 구조 생성
3. [ ] 파일 이동 (단계별)
4. [ ] Import 경로 수정
5. [ ] 기능 테스트
6. [ ] 리팩토링 진행 (기존 계획대로)
