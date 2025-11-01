import { useState } from "react";
import "./sign_up_style.css";
import { Link } from "react-router-dom";
import StringInput from "../../shared/components/string_input";
import PrimaryButton from "../../shared/components/primary_button";
import FeatureCardsSlider from "../../shared/components/feature-cards-slider";
import app_colors from "../../shared/components/app_colors";
import AlertBanner from "../../shared/components/alert_banner";

import {
  sanitizeText,
  isEmail,
  isPhoneEG11,
  isDateYMD,
  passwordMin,
  matches,
  isNonEmpty,
} from "../../utils/validator";
import AUTH_FEATURE_CARDS from "./cards";

const API_BASE = process.env.REACT_APP_API_BASE;
const ADMIN_PASSKEY = process.env.REACT_APP_ADMIN_PASSKEY;

const STUDENT_REGISTER = `${API_BASE}/student/studentRegister`;
const ADMIN_REGISTER = `${API_BASE}/admin/adminRegister`;

const isAdminPasskey = (v) => String(v || "").trim().toUpperCase() === ADMIN_PASSKEY;

export default function SignUp() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  const [group, setGroup] = useState("");
  const [semester, setSemester] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    error: true,
  });

  const passOk = passwordMin(6);
  const confirmOk = () => matches(password)(confirm);

  const onNext = () => setStep((s) => Math.min(s + 1, 3));
  const onBack = () => setStep((s) => Math.max(s - 1, 1));

  const onRegister = async () => {
    if (loading) return;
    setShowErrors(true);

    const clean = {
      studentName: sanitizeText(fullName, { maxLen: 120 }),
      studentEmail: sanitizeText(email, { maxLen: 254 }).toLowerCase(),
      parentEmail: sanitizeText(parentEmail, { maxLen: 254 }).toLowerCase(),
      password: String(password ?? ""),
      confirm: String(confirm ?? ""),
      studentPhoneNumber: String(phone ?? "").replace(/\D/g, "").slice(0, 11),
      parentPhoneNumber: String(parentPhone ?? "").replace(/\D/g, "").slice(0, 11),
      group: sanitizeText(group, { maxLen: 50 }),
      semester: sanitizeText(semester, { maxLen: 20 }),
      birthDate: sanitizeText(String(birthDate ?? "").replace(/[^\d-]/g, ""), { maxLen: 10 }),
    };

    const step1OK =
        isNonEmpty(clean.studentName) &&
        isEmail(clean.studentEmail) &&
        passOk(clean.password) &&
        clean.password === clean.confirm;

    let step2OK =
        isPhoneEG11(clean.studentPhoneNumber) &&
        isPhoneEG11(clean.parentPhoneNumber) &&
        isEmail(clean.parentEmail);

    const step3OK =
        isNonEmpty(clean.group) && isNonEmpty(clean.semester) && isDateYMD(clean.birthDate);

    let apiKey;
    let isAdmin;

    if (isAdminPasskey(parentEmail) || isAdminPasskey(parentPhone)) {
      isAdmin = true;
      apiKey = ADMIN_REGISTER;
      step2OK = isPhoneEG11(clean.studentPhoneNumber); // admin shortcut
    } else {
      isAdmin = false;
      apiKey = STUDENT_REGISTER;
    }

    if (!step2OK) { setStep(2); return; }
    if (!step1OK) { setStep(1); return; }
    if (!step3OK) { setStep(3); return; }

    const payload = !isAdmin ? {
      studentName: clean.studentName,
      studentEmail: clean.studentEmail,
      parentEmail: clean.parentEmail,
      password: clean.password,
      studentPhoneNumber: clean.studentPhoneNumber,
      parentPhoneNumber: clean.parentPhoneNumber,
      group: clean.group,
      semester: clean.semester,
      birthDate: clean.birthDate,
    } : {
      name: clean.studentName,
      email: clean.studentEmail,
      password: clean.password,
      phoneNumber: clean.studentPhoneNumber,
      group: clean.group,
    };

    setLoading(true);
    try {
      const res = await fetch(apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.clone().text().catch(() => "");
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {}

      if (!res.ok) {
        if (res.status === 400) {
          const backendMsg =
              data?.data?.message || data?.message || data?.error || "Request failed (400)";
          setAlertState({ open: true, message: backendMsg, error: true });
        }
        return;
      }

      if (res.status === 200 || res.status === 201) {
        setAlertState({
          open: true,
          message: "Thanks for registration, your account is under review now",
          error: false,
        });
      } else {
        setAlertState({
          open: true,
          message: "Registration failed.",
          error: true,
        });
      }
    } catch (err) {
      setAlertState({
        open: true,
        message: "Network error.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={"sign_up_container"}>
        <AlertBanner
            open={alertState.open}
            message={alertState.message}
            error={alertState.error}
            onClose={() => setAlertState((p) => ({ ...p, open: false }))}
        />

        <div className="sign_up_left">
          <h1 className={"sign_up_header"}>Register</h1>

          <div className={`sign_up_inputs ${showErrors ? "show-errors" : ""}`}>
            {step === 1 && (
                <>
                  <StringInput
                      title={"Username"}
                      placeholder={"John Doe"}
                      onChange={setFullName}
                      value={fullName}
                      validate={isNonEmpty}
                  />
                  <StringInput
                      title={"Email"}
                      placeholder={"student@example.com"}
                      onChange={setEmail}
                      value={email}
                      validate={isEmail}
                  />

                  {/* 🔐 Use shared StringInput with built-in eye toggle */}
                  <StringInput
                      title={"Password"}
                      isPassword
                      placeholder={"********"}
                      onChange={setPassword}
                      value={password}
                      autoComplete="new-password"
                      validate={passOk}
                  />
                  <StringInput
                      title={"Confirm Password"}
                      isPassword
                      placeholder={"********"}
                      onChange={setConfirm}
                      value={confirm}
                      autoComplete="new-password"
                      validate={confirmOk}
                  />
                </>
            )}

            {step === 2 && (
                <>
                  <StringInput
                      title={"Phone Number"}
                      placeholder={"01XXXXXXXXX"}
                      onChange={setPhone}
                      value={phone}
                      validate={isPhoneEG11}
                  />
                  <StringInput
                      title={"Parent Phone Number"}
                      placeholder={"01XXXXXXXXX"}
                      onChange={setParentPhone}
                      value={parentPhone}
                      validate={(v) => isAdminPasskey(v) || isPhoneEG11(v)}
                  />
                  <StringInput
                      title={"Parent Email"}
                      placeholder={"parent@example.com"}
                      onChange={setParentEmail}
                      value={parentEmail}
                      validate={(v) => isAdminPasskey(v) || isEmail(v)}
                  />
                </>
            )}

            {step === 3 && (
                <>
                  {/* Group Dropdown */}
                  <div className="string_input_container">
                    <label className="string_input_label">Group</label>
                    <br />
                    <select
                        className="string_input_field"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                    >
                      <option value="">Select your group</option>
                      <option value="Cmbs">Cmbs</option>
                      <option value="Psbs">Psbs</option>
                      <option value="Nls">Nls</option>
                      <option value="Ice">Ice</option>
                      <option value="Mes">Mes</option>
                      <option value="Sbis">Sbis</option>
                      <option value="Esc">Esc</option>
                      <option value="Fbs">Fbs</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>

                  {/* Semester Dropdown */}
                  <div className="string_input_container">
                    <label className="string_input_label">Semester</label>
                    <br />
                    <select
                        className="string_input_field"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                    >
                      <option value="">Select semester</option>
                      <option value="November">November</option>
                      <option value="June">June</option>
                    </select>
                  </div>

                  {/* Birth Date Picker */}
                  <div className="string_input_container">
                    <label className="string_input_label">Birth Date (YYYY-MM-DD)</label>
                    <br />
                    <input
                        type="date"
                        className="string_input_field"
                        placeholder="2008-06-21"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                </>
            )}
          </div>

          <div className="sign_up_footer">
            <div className="sign_up_actions">
              {step < 3 ? (
                  <PrimaryButton
                      label="Next"
                      bgColor={app_colors.heroPrimaryButton}
                      onClick={onNext}
                      disabled={loading}
                      style={{ width: "100%" }}
                  />
              ) : (
                  <PrimaryButton
                      label={loading ? "..." : "Register"}
                      bgColor={app_colors.heroPrimaryButton}
                      onClick={onRegister}
                      disabled={loading}
                      style={{ width: "100%" }}
                  />
              )}

              {step > 1 && (
                  <PrimaryButton
                      label="Back"
                      bgColor={app_colors.inputBaseLine}
                      onClick={onBack}
                      disabled={loading}
                      style={{ width: "100%" }}
                  />
              )}
            </div>

            <p className="sign_up_sure">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>

        <div className={"sign_up_right"}>
          <FeatureCardsSlider items={AUTH_FEATURE_CARDS} />
        </div>
      </div>
  );
}
