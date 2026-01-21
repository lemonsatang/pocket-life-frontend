import React, { useState } from "react";
import "./IdSearchModal.css";
import axios from "axios";
import dataApi from "../../api/api";

export default function IdSearchModal({ onClose }) {
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [findId, setFindId] = useState("");

  const handleTelChange = (e) => {
    const value = e.target.value;

    const onlyNumber = value.replace(/[^0-9]/g, "");
    setTel(onlyNumber);
  };

  const handleSearch = async () => {
    if (!name) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!tel) {
      alert("전화번호를 입력해주세요.");
      return;
    }

    const response = await dataApi.post("/findId", {
      usrnm: name,
      tel: tel,
    });

    if (response.data === "fail") {
      setFindId("일치하는 회원이 없습니다.");
    } else {
      setFindId("회원님의 아이디는 " + response.data + " 입니다.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">아이디 찾기</h2>
        <div className="modal-body">
          <input
            type="text"
            className="input"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={10}
          />
          <input
            type="tel"
            className="input"
            placeholder="전화번호를 입력하세요"
            value={tel}
            onChange={handleTelChange}
            maxLength={11}
          />
        </div>
        <div>{findId}</div>
        <div className="modal-footer">
          <button className="primaryBtn" onClick={handleSearch}>
            찾기
          </button>
          <button className="secondaryBtn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
