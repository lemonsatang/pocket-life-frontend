// [Data] 추천 식단 데이터 (상세 정보 포함)

// 가벼운 식단 (2000kcal 초과 시 추천)
export const lightMeals = [
  { name: "연어 샐러드", calories: 350, nutrients: "단백질 25g, 지방 15g, 탄수화물 10g" },
  { name: "두부 포케", calories: 320, nutrients: "단백질 18g, 지방 12g, 탄수화물 35g" },
  { name: "구운 야채", calories: 180, nutrients: "단백질 5g, 지방 8g, 탄수화물 25g" },
  { name: "닭가슴살 샐러드", calories: 280, nutrients: "단백질 30g, 지방 5g, 탄수화물 10g" },
  { name: "그릭 요거트와 견과류", calories: 250, nutrients: "단백질 15g, 지방 18g, 탄수화물 12g" },
  { name: "토마토 달걀 볶음", calories: 220, nutrients: "단백질 12g, 지방 14g, 탄수화물 10g" },
  { name: "삶은 달걀과 바나나", calories: 200, nutrients: "단백질 12g, 지방 6g, 탄수화물 25g" },
  { name: "리코타 치즈 샐러드", calories: 340, nutrients: "단백질 10g, 지방 22g, 탄수화물 15g" },
  { name: "버섯 구이 덮밥 (현미밥)", calories: 380, nutrients: "단백질 12g, 지방 8g, 탄수화물 65g" },
  { name: "오트밀 죽", calories: 250, nutrients: "단백질 8g, 지방 5g, 탄수화물 45g" },
  { name: "단호박 스프", calories: 190, nutrients: "단백질 4g, 지방 6g, 탄수화물 32g" },
  { name: "곤약 볶음면", calories: 150, nutrients: "단백질 2g, 지방 4g, 탄수화물 28g" },
  { name: "양배추 쌈과 쌈장", calories: 210, nutrients: "단백질 8g, 지방 2g, 탄수화물 40g" },
  { name: "오이 샌드위치", calories: 260, nutrients: "단백질 8g, 지방 10g, 탄수화물 35g" },
  { name: "미역국 (고기 없이)", calories: 120, nutrients: "단백질 4g, 지방 3g, 탄수화물 20g" },
];

// 든든한 식단 (2000kcal 이하 시 추천)
export const heartyMeals = [
  { name: "불고기 덮밥", calories: 650, nutrients: "단백질 28g, 지방 22g, 탄수화물 85g" },
  { name: "고등어 정식", calories: 600, nutrients: "단백질 35g, 지방 25g, 탄수화물 60g" },
  { name: "비빔밥", calories: 550, nutrients: "단백질 20g, 지방 15g, 탄수화물 85g" },
  { name: "돼지고기 김치찌개", calories: 500, nutrients: "단백질 25g, 지방 28g, 탄수화물 35g" },
  { name: "돈까스 정식", calories: 850, nutrients: "단백질 30g, 지방 45g, 탄수화물 80g" },
  { name: "제육볶음", calories: 600, nutrients: "단백질 32g, 지방 28g, 탄수화물 55g" },
  { name: "순두부 찌개", calories: 450, nutrients: "단백질 22g, 지방 20g, 탄수화물 45g" },
  { name: "카레라이스", calories: 620, nutrients: "단백질 18g, 지방 22g, 탄수화물 88g" },
  { name: "갈비탕", calories: 580, nutrients: "단백질 40g, 지방 25g, 탄수화물 48g" },
  { name: "햄버거 세트", calories: 900, nutrients: "단백질 35g, 지방 42g, 탄수화물 95g" },
  { name: "파스타 (크림/토마토)", calories: 750, nutrients: "단백질 25g, 지방 35g, 탄수화물 85g" },
  { name: "삼겹살 구이", calories: 700, nutrients: "단백질 30g, 지방 60g, 탄수화물 10g" },
  { name: "닭갈비", calories: 650, nutrients: "단백질 35g, 지방 25g, 탄수화물 70g" },
  { name: "부대찌개", calories: 600, nutrients: "단백질 20g, 지방 30g, 탄수화물 60g" },
  { name: "오므라이스", calories: 680, nutrients: "단백질 18g, 지방 25g, 탄수화물 95g" },
];

// 치팅 식단 (고칼로리/특식)
export const cheatMeals = [
  { name: "치킨", calories: 2000, nutrients: "단백질 150g, 지방 100g, 탄수화물 50g" },
  { name: "피자", calories: 2500, nutrients: "단백질 100g, 지방 120g, 탄수화물 300g" },
  { name: "닭갈비", calories: 1200, nutrients: "단백질 80g, 지방 60g, 탄수화물 150g" },
  { name: "떡볶이", calories: 1000, nutrients: "단백질 20g, 지방 30g, 탄수화물 200g" },
  { name: "삼겹살", calories: 1500, nutrients: "단백질 100g, 지방 120g, 탄수화물 10g" },
  { name: "햄버거 세트", calories: 1100, nutrients: "단백질 40g, 지방 50g, 탄수화물 120g" },
  { name: "족발", calories: 1300, nutrients: "단백질 120g, 지방 80g, 탄수화물 20g" },
  { name: "보쌈", calories: 1200, nutrients: "단백질 110g, 지방 70g, 탄수화물 15g" },
  { name: "라면", calories: 500, nutrients: "단백질 10g, 지방 20g, 탄수화물 80g" },
  { name: "짜장면", calories: 800, nutrients: "단백질 20g, 지방 30g, 탄수화물 110g" },
  { name: "짬뽕", calories: 700, nutrients: "단백질 25g, 지방 20g, 탄수화물 100g" },
  { name: "탕수육", calories: 900, nutrients: "단백질 50g, 지방 40g, 탄수화물 80g" },
];
