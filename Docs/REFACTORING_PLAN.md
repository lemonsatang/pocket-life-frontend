# MealPage 리팩토링 계획

## 📊 현재 상황
- **파일 크기**: MealPage.jsx 약 637줄
- **문제점**: 여러 기능이 한 파일에 섞여있음
- **목표**: 기능별로 파일 분리하여 유지보수성 향상

---

## 🎯 리팩토링 목표
1. CSS 코드는 모두 MealPage.css에서 관리
2. JS 로직을 기능별로 분리
3. 각 파일당 최대 200-300줄 이하로 유지
4. 기존 기능 및 UI 변경 없음

---

## 📁 새로운 파일 구조

```
src/pages/MealPage/
├── MealPage.jsx              (메인 컴포넌트, ~200줄)
├── MealPage.css              (모든 스타일)
├── components/               (서브 컴포넌트)
│   ├── CheatingBanner.jsx   (치팅데이 배너, ~30줄)
│   ├── MealInputForm.jsx    (식단 입력 폼, ~80줄)
│   ├── MenuBoardModal.jsx   (전체 메뉴판 모달, ~100줄)
│   └── QuantitySelectModal.jsx (치팅 식단 수량 선택 모달, ~80줄)
├── hooks/                    (커스텀 훅)
│   ├── useTargetCalories.js (목표 칼로리 조회, ~40줄)
│   ├── useMealRecommendations.js (추천 식단 생성, ~120줄)
│   └── useModal.js          (모달 상태 관리, ~50줄)
├── utils/                    (유틸리티 함수)
│   └── mealHelpers.js       (식단 관련 헬퍼 함수, ~80줄)
└── constants/                (상수)
    └── mealTypes.js         (끼니 타입 상수, ~10줄)
```

---

## 📝 분리 계획

### 1. **components/CheatingBanner.jsx** (~30줄)
**내용**:
- 치팅데이 배너 컴포넌트
- 고정 위치 배너 렌더링

**Props**:
```javascript
{
  show: boolean
}
```

**의존성**:
- CSS 클래스 또는 인라인 스타일

---

### 2. **components/MealInputForm.jsx** (~80줄)
**내용**:
- 날짜 선택기
- 끼니 타입 버튼
- 음식명/칼로리 입력 필드
- 추가 버튼

**Props**:
```javascript
{
  currentDate: Date,
  mealType: string,
  inputValue: string,
  calorieInput: string,
  errorMessage: string,
  onDateChange: (offset) => void,
  onDateSelect: (date) => void,
  onMealTypeChange: (type) => void,
  onInputChange: (value) => void,
  onCalorieChange: (value) => void,
  onAdd: () => void
}
```

**의존성**:
- DatePicker
- CSS 클래스: `meal-date-picker-container`, `meal-type-btn` 등

---

### 3. **components/MenuBoardModal.jsx** (~100줄)
**내용**:
- 전체 메뉴판 모달 컨텐츠
- 가벼운 식단 / 든든한 식단 / 치팅 식단 목록
- 각 메뉴 클릭 핸들러

**Props**:
```javascript
{
  onMealSelect: (name, calories) => void,
  onClose: () => void
}
```

**의존성**:
- lightMeals, heartyMeals, cheatMeals 데이터
- CSS 클래스: `menu-board-container`, `menu-board-item`

---

### 4. **components/QuantitySelectModal.jsx** (~80줄)
**내용**:
- 치팅 식단 수량 선택 모달 컨텐츠
- 수량 입력 필드
- 칼로리 계산 및 표시
- "다 먹음" 버튼

**Props**:
```javascript
{
  cheatMeal: Object,
  onConfirm: (quantity) => void,
  onEatAll: () => void
}
```

**의존성**:
- CSS 클래스: `quantity-modal-content`

---

### 5. **hooks/useTargetCalories.js** (~40줄)
**내용**:
- 목표 칼로리 API 조회
- currentDate 변경 시 재조회

**반환값**:
```javascript
{
  targetCalories: number,
  loading: boolean
}
```

**의존성**:
- dataApi
- formatDate 유틸 (또는 직접 구현)

---

### 6. **hooks/useMealRecommendations.js** (~120줄)
**내용**:
- 추천 식단 생성 로직
- 칼로리에 따른 스마트 추천
- 치팅 모드 / 목표 초과 시 추천 변경

**매개변수**:
```javascript
{
  totalCalories: number,
  meals: Array,
  targetCalories: number,
  cheatingMode: boolean,
  hasEatenCheatMeal: boolean
}
```

**반환값**:
```javascript
{
  displayRecs: Array<string>
}
```

**의존성**:
- lightMeals, heartyMeals, cheatMeals 데이터

---

### 7. **hooks/useModal.js** (~50줄)
**내용**:
- 모달 상태 관리
- 모달 열기/닫기 함수

**반환값**:
```javascript
{
  modalState: Object,
  openModal: (config) => void,
  closeModal: () => void,
  openAlert: (message, type) => void
}
```

**특징**:
- 범용 모달 훅 (다른 페이지에서도 재사용 가능)

---

### 8. **utils/mealHelpers.js** (~80줄)
**내용**:
- `hasEatenCheatMeal(meals)` - 치팅 식단 포함 여부 확인
- `calculateTotalCalories(meals)` - 총 칼로리 계산
- `getNextMealType(mealType)` - 다음 끼니 타입 반환
- `getInitialMealType(meals)` - 초기 끼니 타입 계산

**특징**:
- 순수 함수 (외부 의존성 없음)
- 테스트 가능

---

### 9. **constants/mealTypes.js** (~10줄)
**내용**:
```javascript
export const MEAL_TYPES = ["아침", "점심", "저녁", "간식"];
```

**특징**:
- 상수만 정의

---

### 10. **MealPage.jsx** (메인, ~200줄)
**내용**:
- State 관리 (currentDate, mealType, inputValue 등)
- useMealData 훅 사용
- 커스텀 훅 사용 (useTargetCalories, useMealRecommendations, useModal)
- 식단 추가 핸들러 (handleManualAdd, addMealItem)
- 서브 컴포넌트 조합

**역할**:
- 컨테이너 컴포넌트
- 전체 레이아웃 관리
- 이벤트 핸들러 조합

---

## 🔧 작업 순서

### Phase 1: 상수 및 유틸리티 함수 분리 (기능 영향 없음)
1. ✅ `constants/mealTypes.js` 생성
2. ✅ `utils/mealHelpers.js` 생성
3. ✅ MealPage.jsx에서 import하여 사용

### Phase 2: 커스텀 훅 분리
1. ✅ `hooks/useTargetCalories.js` 생성
2. ✅ `hooks/useMealRecommendations.js` 생성
3. ✅ `hooks/useModal.js` 생성
4. ✅ MealPage.jsx에서 사용하도록 변경

### Phase 3: 컴포넌트 분리
1. ✅ `components/CheatingBanner.jsx` 생성
2. ✅ `components/MealInputForm.jsx` 생성
3. ✅ `components/MenuBoardModal.jsx` 생성
4. ✅ `components/QuantitySelectModal.jsx` 생성
5. ✅ MealPage.jsx에서 import하여 사용

### Phase 4: 인라인 스타일 제거
1. ✅ 모든 인라인 style 속성 확인
2. ✅ CSS 클래스로 변환
3. ✅ MealPage.css에 추가

### Phase 5: 코드 정리
1. ✅ 불필요한 주석 제거
2. ✅ 중복 코드 제거
3. ✅ 최종 테스트

---

## ⚠️ 주의사항

1. **기능 유지**: 리팩토링 중 기존 기능이 변경되면 안됨
2. **UI 유지**: 시각적 변경 없이 코드만 분리
3. **Props 전달**: 컴포넌트 간 props 전달이 복잡해질 수 있음 - 최소한으로 유지
4. **CSS 클래스명**: 기존 클래스명 유지 (CSS 파일 수정 최소화)
5. **단계별 진행**: 한 번에 하나씩, 각 단계마다 테스트

---

## 📈 예상 효과

### Before
- MealPage.jsx: 637줄 (단일 파일)
- 유지보수: 어려움 (긴 파일, 복잡한 로직 혼재)

### After
- MealPage.jsx: ~200줄 (메인 컴포넌트만)
- 각 파일: 10-120줄 (읽기 쉬움)
- 유지보수: 쉬움 (기능별 분리, 명확한 역할)

---

## 🎯 최종 구조 예시

```javascript
// MealPage.jsx (메인)
import MealInputForm from './components/MealInputForm';
import CheatingBanner from './components/CheatingBanner';
import MenuBoardModal from './components/MenuBoardModal';
import QuantitySelectModal from './components/QuantitySelectModal';
import { useTargetCalories } from './hooks/useTargetCalories';
import { useMealRecommendations } from './hooks/useMealRecommendations';
import { useModal } from './hooks/useModal';
import { hasEatenCheatMeal, calculateTotalCalories } from './utils/mealHelpers';
import { MEAL_TYPES } from './constants/mealTypes';

const MealPage = () => {
  // State 관리
  // 커스텀 훅 사용
  // 서브 컴포넌트 렌더링
};
```

---

## ✅ 체크리스트

- [ ] Phase 1: 상수 및 유틸리티 함수 분리
- [ ] Phase 2: 커스텀 훅 분리
- [ ] Phase 3: 컴포넌트 분리
- [ ] Phase 4: 인라인 스타일 제거
- [ ] Phase 5: 코드 정리
- [ ] 최종 테스트 (UI 및 기능 확인)
