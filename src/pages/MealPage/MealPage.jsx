// [Layout] 식단 관리 페이지 - 식사 기록 및 통계
import React, { useState, useEffect } from "react";
import { useMealContext } from "../../context/MealContext.jsx"; // [New] import
import DatePicker from "react-datepicker";
import { useMealData } from "../../hooks/useMealData";
import MealStats from "../../components/Meal/MealStats/MealStats";
import MealList from "../../components/Meal/MealList/MealList";
import MealChatbot from "../../components/Meal/MealChatbot/MealChatbot";
import Modal from "../../components/Modal/Modal";
import "./MealPage.css";
import { lightMeals, heartyMeals, cheatMeals } from "../../data/recommendedMeals";

const MealPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealType, setMealType] = useState("아침");
  const [inputValue, setInputValue] = useState("");
  const [calorieInput, setCalorieInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [editingCalories, setEditingCalories] = useState("");
  const [displayRecs, setDisplayRecs] = useState([]);

  // [State] 치팅 모드 상태 (챗봇과 공유)
  const [cheatingMode, setCheatingMode] = useState(false);

  // [State] 모달 상태
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    message: "",
    // [수정 2026-01-15 09:44] 타입 추가
    type: "success",
    children: null, // [수정] 커스텀 컨텐츠
    onConfirm: null,
  });

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
  };

  const openAlert = (message, type = "warning") => {
    setModalState({
      open: true,
      title: "알림",
      message,
      // [수정 2026-01-15 09:44] 타입 적용
      type: type,
      children: null, // 초기화
      onConfirm: closeModal,
      confirmText: "확인",
    });
  };

  // [Logic] 식단 직접 추가 핸들러 (버튼, 추천메뉴, 메뉴판 공용)
  const handleManualAdd = (name, calories) => {
    if (!name || !name.trim()) {
      openAlert("섭취한 음식과 칼로리를 입력해주세요!", "warning");
      return;
    }

    // [New Logic] 치팅 식단인지 확인
    const cheatMeal = cheatMeals.find(cheat => name === cheat.name);

    if (cheatMeal) {
        // [UI] 수량 선택 모달 띄우기
        let quantity = 1; // 기본값
        
        const updateModalContent = (qty) => {
            const calculatedCalories = cheatMeal.unitCalories * qty;
            
            setModalState({
                open: true,
                title: `🍕 ${name} 수량 선택`,
                message: ``,
                type: 'success',
                confirmText: "입력 완료",
                
                // [Logic] 입력 완료 버튼 클릭 시 실제 추가
                onConfirm: () => {
                   const finalCalories = cheatMeal.unitCalories * quantity;
                   // 실제 추가 로직 호출
                   addMealItem(name, finalCalories);
                   closeModal();
                },
                
                children: (
                    <div className="quantity-modal-content" style={{textAlign: 'center', padding: '10px 0'}}>
                        <p style={{marginBottom: '15px', color: '#718096'}}>
                            몇 {cheatMeal.unit} 드셨나요?<br/>
                            <small>(1{cheatMeal.unit} 당 {cheatMeal.unitCalories}kcal)</small>
                        </p>
                        
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
                            <input 
                                type="number" 
                                min="1" 
                                defaultValue={qty}
                                onChange={(e) => {
                                    quantity = Number(e.target.value);
                                    // 실시간 칼로리 표시 업데이트를 위해 모달 다시 렌더링 (간이 방식)
                                    // 실제로는 state로 분리하는게 좋지만, 여기서는 함수 내부 변수 + 재호출로 처리
                                    const nextCal = cheatMeal.unitCalories * quantity;
                                    document.getElementById('calculated-cal-display').innerText = `${nextCal} kcal`;
                                }}
                                style={{
                                    width: '80px', 
                                    padding: '8px', 
                                    fontSize: '1.2rem', 
                                    textAlign: 'center',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px'
                                }} 
                            />
                            <span style={{fontSize: '1.1rem', fontWeight: 'bold'}}>{cheatMeal.unit}</span>
                        </div>

                        <div style={{marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: '#5e72e4'}}>
                            총 <span id="calculated-cal-display">{cheatMeal.unitCalories * qty} kcal</span>
                        </div>

                        <button 
                            className="pixel-btn" 
                            style={{width: '100%', backgroundColor: '#f57c00', marginTop: '10px'}}
                            onClick={() => {
                                // 전체 먹기
                                addMealItem(name, cheatMeal.calories);
                                closeModal();
                            }}
                        >
                            {cheatMeal.totalName} 다 먹음! ({cheatMeal.calories}kcal)
                        </button>
                    </div>
                )
            });
        };
        
        updateModalContent(1); // 초기 실행
        return;
    }
    
    // 일반 메뉴는 바로 추가
    const calValue = String(calories).replace(/\D/g, "");
    addMealItem(name, calValue);
  };

  // [Context] 실시간 업데이트 트리거
  const { triggerUpdate } = useMealContext();

  // [Logic] 실제 식단 추가 내부 함수 (모달/직접입력 공통 사용)
  const addMealItem = (name, calories) => {
    const calValue = String(calories).replace(/\D/g, "");

    addMeal({
      text: name,
      mealType,
      calories: calValue,
    }).then(() => {
      setInputValue("");
      setCalorieInput("");
      
      // [New] 전역 업데이트 트리거 (통계 페이지 등 반영)
      triggerUpdate();
      
      const isCheatMeal = cheatMeals.some(cheat => name.includes(cheat.name));
      const projectedCalories = totalCalories + (Number(calValue) || 0);

      // [Conditions] 완벽한 치팅 데이 조건(치팅식단 + 2000kcal 초과)일 때만 알림
      if (isCheatMeal && projectedCalories > 2000 && !cheatingMode) {
          openAlert("치팅 메뉴가 감지되었습니다! 오늘은 치팅데이! 🥳", "success");
      }
      
      // [Logic] 입력 후 다음 끼니로 자동 포커스 이동
      const types = ["아침", "점심", "저녁", "간식"];
      const currentIndex = types.indexOf(mealType);
      if (currentIndex < types.length - 1) {
        setMealType(types[currentIndex + 1]);
      }
    });
  };

  // [Logic] 메뉴판 모달 열기
  const handleOpenMenu = () => {
    setModalState({
        open: true,
        title: "📋 전체 메뉴판",
        message: "", // 메시지 없음
        type: "success",
        confirmText: "닫기",
        onConfirm: closeModal,
        children: (
            <div className="menu-board-container" style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'left', padding: '0 10px' }}>
                <h4 style={{marginTop: '10px', borderBottom: '2px solid #ddd', paddingBottom: '5px'}}>🥗 가벼운 식단</h4>
                <ul style={{listStyle: 'none', padding: 0}}>
                    {lightMeals.map((m, i) => (
                        <li 
                            key={i} 
                            className="menu-board-item"
                            onClick={() => {
                                handleManualAdd(m.name, m.calories); // 바로 추가
                                closeModal(); // 모달 닫기
                            }}
                        >
                            - {m.name} ({m.calories}kcal)
                        </li>
                    ))}
                </ul>
                
                <h4 style={{marginTop: '20px', borderBottom: '2px solid #ddd', paddingBottom: '5px'}}>🍚 든든한 식단</h4>
                <ul style={{listStyle: 'none', padding: 0}}>
                    {heartyMeals.map((m, i) => (
                        <li 
                            key={i} 
                            className="menu-board-item"
                            onClick={() => {
                                handleManualAdd(m.name, m.calories); // 바로 추가
                                closeModal();
                            }}
                        >
                            - {m.name} ({m.calories}kcal)
                        </li>
                    ))}
                </ul>

                <h4 style={{marginTop: '20px', borderBottom: '2px solid #ff5722', color: '#ff5722', paddingBottom: '5px'}}>🍕 치팅 식단</h4>
                <ul style={{listStyle: 'none', padding: 0}}>
                    {cheatMeals.map((m, i) => (
                        <li 
                            key={i} 
                            className="menu-board-item"
                            onClick={() => {
                                handleManualAdd(m.name, m.calories); // 바로 추가
                                closeModal();
                            }}
                        >
                            - {m.name} ({m.calories}kcal)
                        </li>
                    ))}
                </ul>
            </div>
        )
    });
  };

  const {
    meals,
    addMeal,
    deleteMeal,
    updateMeal,
    errorMessage,
    setErrorMessage,
  } = useMealData(currentDate);

  // [Logic] 총 칼로리 계산
  const totalCalories = meals.reduce(
    (sum, m) => sum + (Number(m.calories) || 0),
    0
  );

  // [Logic] 치팅 식단 포함 여부 확인 (useEffect에서 사용하기 위해 위치 이동)
  const hasEatenCheatMeal = meals.some((meal) =>
    cheatMeals.some((cheat) => meal.text.includes(cheat.name))
  );

  // [Logic] 초기 로딩 시(또는 데이터 로드 후) 안 먹은 끼니로 자동 선택
  const hasInitializedRef = React.useRef(false);
  useEffect(() => {
    if (meals.length > 0 && !hasInitializedRef.current) {
        const eatenTypes = meals.map(m => m.mealType);
        const types = ["아침", "점심", "저녁", "간식"];
        
        // 순서대로 확인해서 안 먹은 첫 번째 끼니를 찾음
        for (const type of types) {
            if (!eatenTypes.includes(type)) {
                setMealType(type);
                break;
            }
        }
        hasInitializedRef.current = true;
    }
  }, [meals]);

  // [Logic] 칼로리에 따른 스마트 추천 식단 생성
  useEffect(() => {
    const dailyGoal = 2000;

    // 1. [New Logic] 오직 1끼만 입력했고, 그게 치팅 식단이며 2000kcal 이하인 경우 -> 다이어트 + 치팅 믹스 추천
    if (meals.length === 1 && hasEatenCheatMeal && totalCalories <= dailyGoal) {
         // 다이어트 식단과 치팅 식단을 합침
         const mixedMeals = [...lightMeals, ...heartyMeals, ...cheatMeals];
         // 이미 먹은거 제외
         const eatenNames = meals.map(m => m.text);
         const candidates = mixedMeals.filter(m => !eatenNames.includes(m.name));
         
         setDisplayRecs(
            [...candidates]
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map((meal) => meal.name)
        );
        return;
    }

    // 2. [New Logic] 목표 칼로리(2000kcal) 초과하거나 치팅 모드가 켜져있으면 무조건 치팅 식단만 추천
    if (totalCalories > dailyGoal || cheatingMode) {
        setDisplayRecs(
            [...cheatMeals]
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map((meal) => meal.name)
        );
        return; 
    }

    const remainingCalories = Math.max(0, dailyGoal - totalCalories);

    // 남은 끼니 수 계산
    const types = meals.map((m) => m.mealType);
    let remainingCount = 0;
    if (!types.includes("아침")) remainingCount++;
    if (!types.includes("점심")) remainingCount++;
    if (!types.includes("저녁")) remainingCount++;

    // 예산 계산 (남은 끼니가 없으면 간식용으로 남은 칼로리 전체 사용)
    const budgetPerMeal =
      remainingCount > 0
        ? Math.floor(remainingCalories / remainingCount)
        : remainingCalories;

    const allMeals = [...lightMeals, ...heartyMeals];
    
    // 3. 예산 필터링 (엄격하게)
    let candidates = allMeals.filter((m) => m.calories <= budgetPerMeal);
    
    // 4. 이미 먹은 메뉴 제외
    const eatenNames = meals.map(m => m.text);
    candidates = candidates.filter(m => !eatenNames.includes(m.name));

    // 5. 후보가 없으면?
    if (candidates.length === 0) {
        // 예산 초과 시 가장 칼로리 낮은거 3개 보여주기 (이미 먹은거 제외하고)
        const notEatenAll = allMeals.filter(m => !eatenNames.includes(m.name));
        candidates = notEatenAll.sort((a, b) => a.calories - b.calories).slice(0, 3);
    }

    // 6. 랜덤 3개 선택
    setDisplayRecs(
      [...candidates]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((meal) => meal.name)
    );
  }, [totalCalories, meals, cheatingMode, hasEatenCheatMeal]);

  // [Layout] DatePicker 커스텀 입력 컴포넌트
  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <span onClick={onClick} ref={ref} className="meal-date-input">
      {value} 📅
    </span>
  ));

  // [Logic] 날짜 변경 핸들러
  const handleDateChange = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  // [Logic] 식단 목록이 비워지면 '아침'으로 리셋
  useEffect(() => {
    if (meals.length === 0) {
      setMealType("아침");
    }
  }, [meals]);

  // [Logic] 입력값 변경 및 칼로리 자동 추적 함수
  const updateInputAndCalories = (value) => {
    setInputValue(value);

    // [Logic] 입력한 음식명이 추천 식단에 있으면 칼로리 자동 입력
    // [수정 2026-01-15 11:34] 치팅 메뉴도 포함
    const allMeals = [...lightMeals, ...heartyMeals, ...cheatMeals];
    const found = allMeals.find((meal) => meal.name === value);
    if (found) {
      setCalorieInput(String(found.calories));
    }
  };

  const handleRecommendationClick = (mealName) => {
      // updateInputAndCalories(mealName); // [변경] 기존 로직 (입력만 함)
      
      // [수정] 추천 식단 클릭 시 바로 추가
      const allMeals = [...lightMeals, ...heartyMeals, ...cheatMeals];
      const found = allMeals.find((meal) => meal.name === mealName);
      if (found) {
        handleManualAdd(found.name, found.calories);
      }
  };

  // [State] 모달 상태

  const showBanner = cheatingMode || (hasEatenCheatMeal && totalCalories > 2000);
  const isStrictCheating = hasEatenCheatMeal && totalCalories > 2000;

  return (
    <div className="main-content meal-container">
      {/* [Logic] 치팅 데이 배너 (치팅 모드 활성화 시 표시) */}
      {showBanner && (
        <div style={{
          position: 'fixed',
          top: '120px', // 더 아래로 (105px -> 120px)
          left: '0',
          width: '100%',
          textAlign: 'center',
          fontSize: '15px',
          fontWeight: 'bold',
          color: '#f57c00', 
          zIndex: 2000, 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none' // 클릭 통과 (필요 시)
        }}>
          <span>오늘은 치팅데이 인가보네요! 마음껏 드세요</span> 
          <span style={{fontSize: '18px'}}>🥳</span>
        </div>
      )}

      <div className="meal-content-row">
        <div className="pixel-card meal-card">
          <h3>🥗 오늘의 식단 기록</h3>
          
          <div className="meal-date-picker-container">
            <button
              className="date-nav-btn"
              onClick={() => handleDateChange(-1)}
            >
              ◀
            </button>
            <DatePicker
              locale="ko"
              selected={currentDate}
              onChange={setCurrentDate}
              dateFormat="yyyy년 MM월 dd일 eeee"
              customInput={<CustomInput />}
            />
          <button
            className="date-nav-btn"
            onClick={() => handleDateChange(1)}
          >
            ▶
          </button>
        </div>
        <div className="meal-type-buttons">
          {["아침", "점심", "저녁", "간식"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setMealType(type);
                setErrorMessage("");
              }}
              className={`meal-type-btn ${
                mealType === type ? "active" : "inactive"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div
          className={`input-group meal-input-group ${
            errorMessage ? "has-error" : ""
          }`}
        >
          <input
            className="pixel-input meal-food-input"
            placeholder="음식명"
            value={inputValue}
            onChange={(e) => updateInputAndCalories(e.target.value)}
          />
          <input
            className="pixel-input meal-calorie-input"
            placeholder="kcal"
            value={calorieInput}
            onChange={(e) => setCalorieInput(e.target.value.replace(/\D/g, ""))}
          />
          <button
            className="pixel-btn"
            onClick={() => handleManualAdd(inputValue, calorieInput)}
          >
            추가
          </button>
        </div>
        {errorMessage && (
          <div className="meal-error-message">⚠️ {errorMessage}</div>
        )}
        <MealList
          meals={meals}
          editingId={editingId}
          setEditingId={setEditingId}
          editingText={editingText}
          setEditingText={setEditingText}
          editingCalories={editingCalories}
          setEditingCalories={setEditingCalories}
          updateMeal={updateMeal}
          deleteMeal={deleteMeal}
          isStrictCheating={isStrictCheating}
        />
      </div>
      <MealStats
        totalCalories={totalCalories}
        dailyGoal={2000}
        displayRecs={displayRecs}
        onRecClick={handleRecommendationClick}
        isCheating={showBanner}
        hasEatenCheatMeal={hasEatenCheatMeal}
        isStrictCheating={isStrictCheating}
        onOpenMenu={handleOpenMenu}
      />
      </div> {/* End of meal-content-row */}
      <Modal
        open={modalState.open}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        // [수정 2026-01-15 09:44] type 전달
        type={modalState.type}
        children={modalState.children}
      />
      <MealChatbot
        mealData={[...lightMeals, ...heartyMeals]}
        // [Cheat] 치팅 모드 데이터 전달
        cheatMeals={cheatMeals}
        eatenMeals={meals}
        currentCalories={totalCalories}
        dailyGoal={2000}
        onAddMeal={addMeal}
        // [State] 치팅 모드 상태 전달 (파생 상태인 showBanner 전달)
        cheatingMode={showBanner} 
        onToggleCheatingMode={() => setCheatingMode(prev => !prev)}
      />
    </div>
  );
};

export default MealPage;
