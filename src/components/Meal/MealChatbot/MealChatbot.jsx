import React, { useState, useEffect, useRef } from "react";
import "./MealChatbot.css";

// [Props] cheatMeals: 치팅 모드용 고칼로리 식단 데이터
const MealChatbot = ({ mealData, cheatMeals = [], eatenMeals, currentCalories, dailyGoal = 2000, onAddMeal }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // [Settings] 설정 상태
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    detailMode: false,
    cheatingMode: false,
  });

  // [Flow] 대화 진행 상태
  // step: 'IDLE' | 'CONFIRM_ADD' | 'SELECT_TYPE'
  const [chatStep, setChatStep] = useState(() => {
    return sessionStorage.getItem("meal_chat_step") || 'IDLE';
  });
  const [pendingMeal, setPendingMeal] = useState(() => {
    const saved = sessionStorage.getItem("meal_chat_pending");
    return saved ? JSON.parse(saved) : null;
  });

  // [Logic] 세션 스토리지에서 초기 메시지 로드
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("meal_chat_history");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            text: "안녕하세요! 질문이 있거나 메뉴를 입력하시면 도와드릴게요! 😊",
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // [Logic] 상태 변경 시 세션 스토리지에 저장
  useEffect(() => {
    sessionStorage.setItem("meal_chat_history", JSON.stringify(messages));
    sessionStorage.setItem("meal_chat_step", chatStep);
    sessionStorage.setItem("meal_chat_pending", JSON.stringify(pendingMeal));
  }, [messages, chatStep, pendingMeal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // [Logic] 식사 상태 분석
  const analyzeContext = () => {
    const types = eatenMeals.map(m => m.mealType);
    const hasBreakfast = types.includes("아침");
    const hasLunch = types.includes("점심");
    const hasDinner = types.includes("저녁");
    
    // 남은 끼니 수 계산 (아침, 점심, 저녁 중 안 먹은 것)
    let remainingCount = 0;
    if (!hasBreakfast) remainingCount++;
    if (!hasLunch) remainingCount++;
    if (!hasDinner) remainingCount++;

    return { hasBreakfast, hasLunch, hasDinner, remainingCount, eatenTypes: types };
  };

  // 챗봇 메시지 추가 헬퍼
  const botReply = (text, options = []) => {
    setMessages((prev) => [
      ...prev,
      { 
        id: Date.now() + 1, 
        text, 
        isBot: true, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options // 버튼 선택지 (예: ['네', '아니오'] 또는 ['아침', '점심'])
      },
    ]);
  };

  const handleSend = (e, manualMsg = null) => {
    if (e) e.preventDefault();
    const userMsg = manualMsg || input.trim();
    if (!userMsg) return;

    // 사용자 메시지 추가
    setMessages((prev) => [
      ...prev,
      { 
        id: Date.now(), 
        text: userMsg, 
        isBot: false, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      },
    ]);
    setInput("");

    // 봇 응답 로직 (0.5초 딜레이)
    setTimeout(() => {
      // --- [Flow] 메뉴 추가 대화 중일 때 ---
      if (chatStep === 'CONFIRM_ADD') {
        if (userMsg === "식단에 추가해줘" || userMsg === "응" || userMsg === "ㅇㅇ") {
            // 안 먹은 끼니 찾기
            const { eatenTypes } = analyzeContext();
            const allTypes = ["아침", "점심", "저녁", "간식"];
            const availableTypes = allTypes.filter(t => !eatenTypes.includes(t) || t === "간식");
            
            setChatStep('SELECT_TYPE');
            botReply("어떤 끼니로 기록할까요?", availableTypes);
        } else {
            setChatStep('IDLE');
            setPendingMeal(null);
            botReply("네, 식단에는 추가하지 않을게요!");
        }
        return;
      }

      if (chatStep === 'SELECT_TYPE') {
         if (["아침", "점심", "저녁", "간식"].includes(userMsg)) {
             onAddMeal({
                 text: pendingMeal.name,
                 calories: pendingMeal.calories,
                 mealType: userMsg
             });
             botReply(`[${pendingMeal.name}]을(를) ${userMsg}으로 기록했습니다! 👍`);
             setChatStep('IDLE');
             setPendingMeal(null);
         } else {
             botReply("취소되었습니다.");
             setChatStep('IDLE');
             setPendingMeal(null);
         }
         return;
      }

      // --- [Flow] 일반 대화 ---
      let response = "";
      const { hasBreakfast, hasLunch, hasDinner, remainingCount } = analyzeContext();
      
      // 잔여 칼로리 및 한 끼 권장 칼로리 계산
      const remainingCalories = Math.max(0, dailyGoal - currentCalories);
      const budgetPerMeal = remainingCount > 0 ? Math.floor(remainingCalories / remainingCount) : remainingCalories;
      
      // 예산에 맞는 추천 리스트 필터링
      let affordableMeals = mealData.filter(m => m.calories <= budgetPerMeal);
      
      // [Logic] 이미 먹은 메뉴는 추천 제외
      const eatenNames = eatenMeals.map((m) => m.text);
      const notEatenMeals = affordableMeals.filter(
        (m) => !eatenNames.includes(m.name)
      );
      if (notEatenMeals.length > 0) affordableMeals = notEatenMeals;

      // [Cheating Mode] 치팅 모드면 칼로리/중복 무시하고 치팅 메뉴에서 랜덤
      if (settings.cheatingMode) {
          affordableMeals = cheatMeals; 
      }

      // 추천 후보 선정
      let randomMenu = "";
      let warningMsg = "";
      if (affordableMeals.length > 0) {
        randomMenu = affordableMeals[Math.floor(Math.random() * affordableMeals.length)].name;
      } else {
        const lowestCalorieMeal = mealData.sort((a, b) => a.calories - b.calories)[0];
         if (lowestCalorieMeal.calories > remainingCalories && !settings.cheatingMode) {
          randomMenu = lowestCalorieMeal.name;
          warningMsg = `(남은 칼로리가 부족하여 [${randomMenu}] 섭취 시 목표를 초과할 수 있어요 😢)`;
        } else {
           randomMenu = lowestCalorieMeal.name;
        }
      }

      // 1. 인사/안부
      if (userMsg.includes("안녕") || userMsg.includes("반가")) {
        // (기존 인사 로직 유지)
        if (hasBreakfast && !hasLunch) {
           const breakfastMenu = eatenMeals.find(m => m.mealType === "아침").text;
           response = `안녕하세요! 아침으로 [${breakfastMenu}] 든든하게 드셨군요.`;
        } else if (hasLunch && !hasDinner) {
           response = `안녕하세요! 점심 잘 드셨나요?`;
        } else if (hasDinner) {
           response = `오늘 하루 수고하셨어요!`;
        } else {
           response = "안녕하세요! 하루 2000kcal 목표로 시작해볼까요? 😊";
        }
        botReply(response);
      } 
      // 2. 추천 요청
      else if (userMsg.includes("추천") || userMsg.includes("뭐 먹") || userMsg.includes("먹을까")) {
        const targetPool = settings.cheatingMode ? cheatMeals : mealData;
        const detailInfo = settings.detailMode ? ` (칼로리: ${targetPool.find(m=>m.name===randomMenu)?.calories}kcal)` : "";
        let menuMsg = `[${randomMenu}]${detailInfo}`;

        if (settings.cheatingMode) menuMsg = `오늘은 치팅데이! 마음껏 드세요! 🍔 [${randomMenu}]`;

        if (userMsg.includes("아침")) {
             response = `상쾌한 아침 메뉴로 ${menuMsg} 추천드려요! ☀️ ${warningMsg}`;
        } else if (userMsg.includes("점심")) {
             response = `활기찬 오후를 위해 점심으로 ${menuMsg} 어떠세요? 🍱 ${warningMsg}`;
        } else if (userMsg.includes("저녁")) {
             response = `오늘 하루의 마무리, 저녁 메뉴로는 ${menuMsg} 추천합니다! 🌙 ${warningMsg}`;
        } else {
            // (기존 else logic)
            response = `추천 메뉴는 ${menuMsg} 입니다! ${warningMsg}`;
        }

        // 추천된 메뉴 객체 찾기
        const recommendedMeal = targetPool.find(m => m.name === randomMenu);
        if (recommendedMeal) {
            setPendingMeal(recommendedMeal);
            setChatStep('CONFIRM_ADD');
            botReply(response + "\n\n식단에 추가할까요?", ["식단에 추가해줘", "괜찮아"]);
        } else {
            botReply(response);
        }
      }
      // 3. 특정 메뉴 검색 (여기에 추가 로직 적용)
      else {
        const found = mealData.find((meal) =>
          meal.name.includes(userMsg) || userMsg.includes(meal.name)
        );

        if (found) {
          response = `[${found.name}]\n칼로리: ${found.calories}kcal\n주요 성분: ${found.nutrients}`;
          setChatStep('CONFIRM_ADD');
          setPendingMeal(found);
          botReply(response, ["식단에 추가해줘", "괜찮아"]);
        } else {
          botReply("죄송해요, 그 메뉴는 아직 정보가 없어요. 😢\n'안녕'하고 인사하거나 '메뉴 추천'이라고 물어봐주세요!");
        }
      }
    }, 500);
  };

  // 설정 버튼 핸들러
  const handleSettingAction = (action) => {
      if (action === 'new_chat') {
          setMessages([{
            id: Date.now(),
            text: "대화가 초기화되었습니다. 무엇을 도와드릴까요?",
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
          sessionStorage.removeItem("meal_chat_history");
          sessionStorage.removeItem("meal_chat_step");
      } else if (action === 'cheating') {
          // [Logic] 상태 업데이트 전 다음 모드 계산 (이중 메시지 방지)
          const nextMode = !settings.cheatingMode;
          setSettings(prev => ({ ...prev, cheatingMode: nextMode }));
          
          if (nextMode) {
              botReply("오늘 하루는 다이어트 걱정 없이 기분 좋게 즐기세요! 🥳 맛있는 음식 추천해드릴까요?");
          } else {
              botReply("치팅 모드를 종료하고 다시 건강한 식단 관리로 돌아갑니다! 💪");
          }
      } else if (action === 'detail') {
          setSettings(prev => ({ ...prev, detailMode: !prev.detailMode }));
      }
      setShowSettings(false);
  };

  // [Resize] 윈도우 크기 조절 상태 및 로직
  const [size, setSize] = useState({ width: 300, height: 400 });
  const isResizingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingRef.current) return;
      
      const deltaX = startPosRef.current.x - e.clientX;
      const deltaY = startPosRef.current.y - e.clientY;

      setSize({
        width: Math.max(300, startSizeRef.current.width + deltaX),
        height: Math.max(400, startSizeRef.current.height + deltaY)
      });
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResize = (e) => {
    e.preventDefault();
    isResizingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { width: size.width, height: size.height };
    document.body.style.cursor = 'nwse-resize';
  };

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {isOpen && (
        <div 
            className="chatbot-window" 
            style={{ width: size.width, height: size.height }}
        >
          {/* 리사이즈 핸들 (좌상단) */}
          <div className="chatbot-resize-handle" onMouseDown={startResize}>
             ⤡
          </div>

          <div className="chatbot-header">
            <span style={{flex: 1}}>🥗 영양 톡톡</span>
            <div className="chatbot-settings-container">
                <button className="chatbot-util-btn" onClick={() => setShowSettings(!showSettings)}>⚙️</button>
                {showSettings && (
                    <div className="chatbot-context-menu">
                        <div onClick={() => handleSettingAction('cheating')}>
                            {settings.cheatingMode ? "✅" : "⬜"} 치팅 모드
                        </div>
                        <div onClick={() => handleSettingAction('detail')}>
                            {settings.detailMode ? "✅" : "⬜"} 자세히 추천
                        </div>
                        <div onClick={() => handleSettingAction('new_chat')}>
                            🔄 새 채팅방
                        </div>
                    </div>
                )}
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              ✖
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-msg-container ${msg.isBot ? "bot" : "user"}`}>
                  <div className={`chatbot-msg ${msg.isBot ? "bot" : "user"}`}>
                    {msg.text.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                    {msg.timestamp && <span className="chatbot-time">{msg.timestamp}</span>}
                  </div>
                  
                  {/* 옵션 버튼 (봇 메시지의 경우) */}
                  {msg.isBot && msg.options && (
                      <div className="chatbot-options">
                          {msg.options.map(opt => (
                              <button key={opt} onClick={() => handleSend(null, opt)} className="chatbot-option-btn">
                                  {opt}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={chatStep === 'IDLE' ? "메뉴를 입력하세요..." : "답변을 선택하거나 입력하세요"}
            />
            <button type="submit">전송</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MealChatbot;
