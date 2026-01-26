// [Layout] 회원가입 페이지 - 신규 사용자 등록
import React, { useMemo, useState } from "react";
import Modal from "../../components/Modal/Modal";
import axios from "axios";
import "./SignupPage.css";

export default function SignupPage({ onGoLogin }) {
  const [f, set] = useState({
    id: "",
    pw: "",
    pw2: "",
    email: "",
    name: "",
    phone: "",
    birth: "",
    mkt: false,
    sms: false,
    mail: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idMsg, setIdMsg] = useState({ text: "", isError: false });

  const [m, setM] = useState({
    open: false,
    title: "",
    msg: "",
    showCancel: false,
    confirmText: "확인",
    cancelText: "취소",
    // [수정 2026-01-15 09:41] 모달 타입 상태 추가 (success | warning)
    type: "success",
    onConfirm: null,
    onCancel: null,
  });

  // [Logic] 모달 닫기
  const close = () => setM((s) => ({ ...s, open: false }));

  // [Logic] 확인 모달 (기본값 warning -> 경고/실패)
  const openOk = (title, msg, after, type = "warning") => {
    setM({
      open: true,
      title,
      msg,
      showCancel: false,
      confirmText: "확인",
      cancelText: "취소",
      // [수정 2026-01-15 09:41] 타입 적용
      type: type,
      onConfirm: () => {
        close();
        after?.();
      },
      onCancel: close,
    });
  };

  // [Logic] 회원가입 성공 모달
  const openAskGoLogin = () => {
    let mktMsg = "";
    if (f.sms && f.mail) {
      mktMsg = "마케팅 정보 수신: 전체 동의 (SMS, E-Mail)";
    } else if (f.sms) {
      mktMsg = "마케팅 정보 수신: SMS 동의";
    } else if (f.mail) {
      mktMsg = "마케팅 정보 수신: E-Mail 동의";
    } else {
      mktMsg = "마케팅 정보 수신: 미동의";
    }

    setM({
      open: true,
      title: "회원가입 성공",
      msg: `회원가입이 완료되었습니다.\n[${mktMsg}]\n\n로그인창으로 이동하시겠습니까?`,
      showCancel: true,
      confirmText: "이동",
      cancelText: "취소",
      // [수정 2026-01-15 09:41] 회원가입 성공은 성공 타입 (초록)
      type: "success",
      onConfirm: () => {
        close();
        onGoLogin?.();
      },
      onCancel: close,
    });
  };

  // [Logic] 입력 필드 변경 핸들러
  const on = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "mkt") {
        set((s) => ({ ...s, mkt: checked, sms: checked, mail: checked }));
      } else {
        set((s) => {
          const next = { ...s, [name]: checked };
          const allChecked = next.sms && next.mail;
          return { ...next, mkt: allChecked };
        });
      }
      return;
    }

    let v = value;

    // [Logic] 아이디: 영문 시작, 영문+숫자만 허용
    if (name === "id") {
      v = v.replace(/[^a-zA-Z0-9]/g, "");
      if (v.length > 0 && /^[0-9]/.test(v)) {
        v = v.substring(1);
      }
    }

    // [Logic] 이름: 한글+영문 허용
    if (name === "name") {
      v = v.replace(/[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, "");
    }

    // [Logic] 휴대전화: 숫자만, 하이픈 자동 추가
    if (name === "phone") {
      const raw = v.replace(/\D/g, "");
      if (raw.length <= 3) {
        v = raw;
      } else if (raw.length <= 7) {
        v = `${raw.slice(0, 3)}-${raw.slice(3)}`;
      } else {
        v = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
      }
    }

    // [Logic] 생년월일: 숫자만, 6자리 제한
    if (name === "birth") {
      v = v.replace(/\D/g, "").slice(0, 6);
    }

    set((s) => ({ ...s, [name]: v }));
  };

  // [Logic] 아이디 중복 확인
  const idChk = async (e) => {
    const val = e.target.value;

    if (!val) return;

    if (val.length < 4) {
      setIdMsg({ text: "아이디는 4자 이상이어야 합니다.", isError: true });
      return;
    }

    try {
      const idk = await axios.post("http://localhost:8080/idChk", {
        usrid: e.target.value,
      });

      if (idk.data) {
        setIdMsg({ text: "이미 사용 중인 아이디입니다.", isError: true });
      } else {
        setIdMsg({ text: "사용 가능한 아이디입니다.", isError: false });
      }
    } catch (e) {
      console.error("중복 체크 중 에러 발생:", e.response?.data || e.message);
    }
  };

  // [Logic] 유효성 검사
  const err = useMemo(
    () => ({
      id: !f.id ? "필수 입력" : f.id.length < 4 ? "아이디 4자 이상" : "",
      pw: !f.pw ? "필수 입력" : f.pw.length < 6 ? "비번 6자 이상" : "",
      pw2: !f.pw2 ? "필수 입력" : f.pw !== f.pw2 ? "비밀번호 불일치" : "",
      email: !f.email
        ? "필수 입력"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)
          ? "이메일 형식"
          : "",
      name: !f.name ? "필수 입력" : "",
      phone:
        f.phone && !/^\d{3}-\d{4}-\d{4}$/.test(f.phone)
          ? "올바른 번호 형식"
          : "",
      birth:
        f.birth && !/^\d{6}$/.test(f.birth) ? "생년월일 6자리 (YYMMDD)" : "",
    }),
    [f],
  );

  // [Layout] 인라인 에러 메시지 컴포넌트
  const InlineErr = ({ msg }) =>
    !submitted || !msg ? (
      <div className="errSpace" />
    ) : (
      <div className="fieldErr">{msg}</div>
    );

  // [Logic] 에러 메시지 빌드
  const buildReason = (data, fallback) => {
    const lines = [];
    if (data?.message) lines.push(String(data.message));
    if (data?.errors && typeof data.errors === "object") {
      for (const [k, v] of Object.entries(data.errors))
        if (v) lines.push(`${k}: ${String(v)}`);
    }
    return lines.length ? lines.join("\n") : fallback;
  };

  // [Logic] 회원가입 제출
  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.values(err).some(Boolean)) return;

    setLoading(true);
    try {
      const joinData = {
        usrid: f.id,
        usrnm: f.name,
        passwd: f.pw,
        email: f.email,
        tel: f.phone,
        birth: f.birth,
        mkConsent: f.mkt ? "Y" : "N",
        mailConsent: f.mail ? "Y" : "N",
      };

      await axios.post("http://localhost:8080/join", joinData);

      setLoading(false);
      openAskGoLogin();
    } catch (data) {
      setLoading(false);
      openOk("회원가입 실패", `사유:\n${buildReason(data, "사유 확인 불가")}`);
    }
  };

  return (
    <>
      <form onSubmit={submit} className="form">
        <div className="panelTitle">회원가입</div>

        <Field
          icon="user"
          placeholder="아이디 (영문 시작, 숫자 포함 가능)"
          name="id"
          value={f.id}
          onChange={on}
          onBlur={idChk}
          maxLength={20}
        />
        {idMsg.text && (
          <div
            className={`signup-id-msg ${idMsg.isError ? "error" : "success"}`}
          >
            {idMsg.text}
          </div>
        )}
        <InlineErr msg={err.id} />

        <Field
          icon="lock"
          placeholder="비밀번호"
          name="pw"
          type={showPw ? "text" : "password"}
          value={f.pw}
          onChange={on}
          maxLength={50}
          suffix={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="signup-password-toggle-btn"
            >
              {showPw ? getIcon("eyeOff") : getIcon("eye")}
            </button>
          }
        />
        <InlineErr msg={err.pw} />

        <Field
          icon="check"
          placeholder="비밀번호 확인"
          name="pw2"
          type={showPw ? "text" : "password"}
          value={f.pw2}
          onChange={on}
          maxLength={50}
        />
        <InlineErr msg={err.pw2} />

        <Field
          icon="mail"
          placeholder="이메일"
          name="email"
          value={f.email}
          onChange={on}
          maxLength={40}
        />
        <InlineErr msg={err.email} />

        <Field
          icon="person"
          placeholder="이름 (한글/영문)"
          name="name"
          value={f.name}
          onChange={on}
          maxLength={5}
        />
        <InlineErr msg={err.name} />

        <Field
          icon="phone"
          placeholder="휴대전화번호 (숫자만 입력)"
          name="phone"
          value={f.phone}
          onChange={on}
        />
        <InlineErr msg={err.phone} />

        <Field
          icon="cal"
          placeholder="생년월일 6자리 (YYMMDD)"
          name="birth"
          value={f.birth}
          onChange={on}
        />
        <InlineErr msg={err.birth} />

        <div className="agreeBox">
          <label className="agreeHead">
            <input type="checkbox" name="mkt" checked={f.mkt} onChange={on} />
            <div>
              <div className="agreeTitle">
                마케팅 정보 수신 전체 동의 (선택)
              </div>
              <div className="agreeDesc">
                서비스와 관련된 신상품 소식, 이벤트 안내, 고객 혜택 등 다양한
                정보를 제공합니다.
              </div>
            </div>
          </label>

          <div className="agreeSub">
            <label className="agreeLine">
              <input type="checkbox" name="sms" checked={f.sms} onChange={on} />
              <span>SMS 수신 동의(선택)</span>
            </label>
            <label className="agreeLine">
              <input
                type="checkbox"
                name="mail"
                checked={f.mail}
                onChange={on}
              />
              <span>E-Mail 수신 동의(선택)</span>
            </label>
          </div>
        </div>

        <button className="primaryBtn" type="submit" disabled={loading}>
          {loading ? "처리중..." : "회원가입"}
        </button>

        <div className="bottomLink">
          이미 계정이 있나요?{" "}
          <button type="button" className="bottomBtn" onClick={onGoLogin}>
            로그인 &gt;
          </button>
        </div>
      </form>

      <Modal
        open={m.open}
        title={m.title}
        message={m.msg}
        showCancel={m.showCancel}
        confirmText={m.confirmText}
        cancelText={m.cancelText}
        // [수정 2026-01-15 09:41] type 전달
        type={m.type}
        onConfirm={m.onConfirm}
        onCancel={m.onCancel}
      />
    </>
  );
}

// [Layout] 입력 필드 컴포넌트
function Field({
  icon,
  placeholder,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  suffix,
  maxLength,
}) {
  return (
    <div className="field">
      <span className="icon">{getIcon(icon)}</span>
      <input
        className="input signup-field-input"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {suffix && suffix}
    </div>
  );
}

// [Layout] 아이콘 렌더링 함수
function getIcon(k) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24" };
  const S = (p) => (
    <svg {...common}>
      <path d={p} />
    </svg>
  );
  if (k === "user")
    return S(
      "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z",
    );
  if (k === "lock")
    return S(
      "M17 10h-1V8a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4Z",
    );
  if (k === "check") return S("M9 12.5 6.5 10 5 11.5 9 15.5 19 5.5 17.5 4Z");
  if (k === "mail")
    return S(
      "M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm0 3-8 5L4 9",
    );
  if (k === "person")
    return S("M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7.5 9a7.5 7.5 0 0 1 15 0Z");
  if (k === "phone")
    return S(
      "M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.59a1 1 0 0 1-.25 1.03l-2.2 2.17Z",
    );
  if (k === "cal")
    return S(
      "M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2Zm14 8H3V6h18Z",
    );
  if (k === "eye")
    return S(
      "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
    );
  if (k === "eyeOff")
    return S(
      "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4.01.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z",
    );

  return null;
}
