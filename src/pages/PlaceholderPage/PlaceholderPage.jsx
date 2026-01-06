// [Layout] 준비 중 페이지 컴포넌트
import React from "react";
import "../../styles/Common.css";

const PlaceholderPage = ({ title, emoji }) => {
  return (
    <div className="placeholder-page">
      <h2>
        {emoji} {title}
      </h2>
      <p>아직 준비 중입니다.</p>
    </div>
  );
};

export default PlaceholderPage;
