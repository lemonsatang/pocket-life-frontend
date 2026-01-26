# 🎈 Pocket Life - 당신의 일상을 가볍고 스마트하게

## 📢 프로젝트 소개

### 👨‍👧‍👧Team (1조): 권효민,장민선,정해련

**가계부, 식단, 일정을 한 화면에서 정리하는 올인원 라이프 플래너, Pocket Life입니다.**

Pocket Life는  
- 하루의 **일정**, **식단**, **장바구니**, **가계부**를 하나의 대시보드에서 한눈에 정리하고  
- 필요한 화면으로 바로 이동해 **기록·수정·삭제·분석**까지 하실 수 있는  
프론트엔드 기반 라이프 매니지먼트 웹 애플리케이션입니다.

---

## 🚀 기술 스택 (Tech Stack)


| 분류 | 기술 |
|------|---------|
| **프레임워크** | React, Vite |
| **언어** | JavaScript (ES6+) |
| **네트워크** | Axios |
| **차트** | Recharts, Chart.js |
| **UI** | React Datepicker |

---

## 🎥 미리보기 (Screenshots & Demo)

### 📊 대표 대시보드

<p align="center">
  <img src="./src/assets/image/gif/Dashboard.gif" alt="Pocket Life 대시보드" width="900" />
</p>

#### 대시보드에서는 아래의 기록정보 한 화면에서 확인하실 수 있습니다.
- 일정  
- 식단 요약 및 칼로리  
- 장바구니 상태  
- 가계부 요약  

---


### 🎬 데모 GIF

<table>
  <tr>
    <td align="center">
      <b>🔐 회원가입 및 로그인</b><br />
      <img src="./src/assets/image/gif/Signup_Login.gif" alt="Signup & Login 데모" width="370" />
    </td>
    <td align="center">
  <b>📊 대시보드</b><br />
  <img src="./src/assets/image/gif/Dashboard.gif" width="370" />
</td>
  </tr>
  <tr>
    <td align="center">
      <b>🍱 식단 관리</b><br />
      <img src="./src/assets/image/gif/Meal.gif" alt="Meal 데모" width="370" />
    </td>
    <td align="center">
      <b>🛒 장바구니</b><br />
      <img src="./src/assets/image/gif/Cart.gif" alt="Cart 데모" width="370" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <b>📅 일정 관리</b><br />
      <img src="./src/assets/image/gif/Schedule.gif" alt="Schedule 데모" width="370" />
    </td>
    <td align="center">
      <b>💰 가계부</b><br />
      <img src="./src/assets/image/gif/Ledger.gif" alt="Ledger 데모" width="370" />
    </td>
  </tr>
</table>

---

## 📌 주요 기능

### 1. 대시보드

- 오늘의 일정, 식단, 장바구니, 가계부 요약을 한 화면에서 확인  
- 각 카드에서 **상세 페이지로 바로 이동** 가능  
- 오늘 날짜 기준으로 핵심 정보만 깔끔하게 정리

### 2. 가계부

- 일자별 수입/지출 내역 기록 및 수정/삭제  
- 카테고리(예: 식비, 생활, 쇼핑 등) 별 정리  
- 월 단위 합계, 오늘 기준 요약 정보 제공  
- 직관적인 컬러(지출은 빨간색 등)로 빠르게 파악 가능

### 3. 장바구니 & 즐겨찾기

- 오늘의 장바구니 목록 조회 및 추가/삭제  
- 자주 사는 품목은 **즐겨찾기**로 관리해서 빠르게 추가  
- 구매 완료 상태 표시로 실제 쇼핑 체크리스트처럼 사용 가능

### 4. 식단 관리 & 영양 리포트

- 아침/점심/저녁/간식 단위로 음식과 칼로리 기록  
- 하루 섭취 칼로리 합계 및 간단한 영양 요약 제공  
- 추천 식단 영역에서 오늘의 추천 메뉴 제안  
- 시각적인 차트/그래프 기반 리포트 제공

### 5. 일정 관리 (캘린더)

- 월간 캘린더에서 한눈에 일정 확인  
- 특정 날짜 선택 후 할 일 추가/수정/삭제  
- 완료된 일정은 체크 표시로 상태를 바로 확인

---

## 📁 폴더 구조 (요약)

```
src
├─ api
│  ├─ api.js                  # API 관련 유틸 (요청 래퍼 등)
│  └─ OAuth2RedirectHandler.jsx
├─ components
│  ├─ DashboardCard           # 대시보드 카드 UI
│  └─ Layout                  # 헤더/푸터/레이아웃 공통 컴포넌트
├─ features
│  ├─ Cart                    # 장바구니 도메인
│  ├─ Ledger                  # 가계부 도메인
│  ├─ Meal                    # 식단 관리 도메인
│  └─ Schedule                # 일정 관리 도메인
├─ pages                      # 라우팅 기준 페이지
└─ styles                     # 공통 스타일
```

각 도메인(`Cart`, `Ledger`, `Meal`, `Schedule`)은  
- **Page 컴포넌트**  
- **View/Section 컴포넌트**  
- **hooks / context / utils**  
등으로 나뉘어 있어 기능별로 구조가 잘 분리되도록 구성되어 있습니다.

---

## 💻 화면 흐름 & 라우팅

> 실제 라우팅 구조는 `App.jsx` / `main.jsx` 에 정의되어 있으며, 아래는 대략적인 흐름입니다.

- `/` : 홈 또는 대시보드로 이동  
- `/login` : 로그인 페이지  
- `/signup` : 회원가입 페이지  
- `/dashboard` : 메인 대시보드  
- `/meal` : 식단 관리 페이지  
- `/cart` : 장바구니 페이지  
- `/ledger` : 가계부 페이지  
- `/schedule` : 일정 관리 페이지  

사용자는 상단 내비게이션을 통해 각 기능 페이지로 빠르게 이동하실 수 있습니다.

---

## 🔗 설치 및 실행 방법

### 1. 사전 준비

- Node.js (권장: LTS 버전) 설치

### 2. 의존성 설치

- npm install

### 3. 개발 서버 실행

- npm run dev- 기본적으로 `http://localhost:5173` (또는 터미널에 표시되는 주소)에서 확인하실 수 있습니다.


## 🛫 향후 개선

- 그래프/차트 종류 확장 및 필터링 기능 강화  
- 사용자 맞춤 추천(예: 소비 패턴, 식단 패턴 기반) 로직 고도화  
- 접근성(키보드 네비게이션, 스크린 리더 지원 등) 개선