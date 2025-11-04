import { useEffect, useMemo, useState } from "react";

/**
 * Props:
 * - title: string
 * - placeholder?: string
 * - validate?: (value: string) => boolean
 * - value?: string
 * - onChange?: (v: string) => void
 * - onCountryChange?: (code: string) => void
 * - name?: string
 * - autoComplete?: string
 * - disabled?: boolean
 * - countries?: Array<{code: string, name: string, dialCode: string, flag: string}>
 * - defaultCountry?: string (country code like 'EG')
 * - allowText?: boolean (if true, allows text input for admin passkeys)
 */
export default function PhoneInput({
  title,
  placeholder = "",
  validate = () => false,
  value,
  onChange,
  onCountryChange,
  name,
  autoComplete = "off",
  disabled = false,
  countries = DEFAULT_COUNTRIES,
  defaultCountry = "EG",
  allowText = false,
  ...rest
}) {
  const [inner, setInner] = useState(value ?? "");
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  useEffect(() => {
    if (value !== undefined) setInner(value);
  }, [value]);

  const current = value !== undefined ? value : inner;

  const valid = useMemo(() => {
    if (!current) return false;
    try {
      return !!validate(current);
    } catch {
      return false;
    }
  }, [current, validate]);

  const handleChange = (e) => {
    const next = e.target.value;
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const handleCountryChange = (e) => {
    const code = e.target.value;
    setSelectedCountry(code);
    onCountryChange?.(code);
  };

  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];

  return (
    <div style={{ marginBottom: "1rem" }}>
      {title ? (
        <label style={{ 
          display: "block", 
          marginBottom: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: "600",
          color: "#374151",
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }}>
          {title}
        </label>
      ) : null}

      <div style={{
        position: "relative",
        display: "flex",
        alignItems: "stretch",
        border: `2px solid ${valid ? "#10b981" : "#e5e7eb"}`,
        borderRadius: "0.5rem",
        overflow: "hidden",
        transition: "border-color 0.2s",
        backgroundColor: disabled ? "#f9fafb" : "#ffffff"
      }}>
        {/* Country Dropdown */}
        <div style={{ 
          position: "relative",
          display: "flex",
          alignItems: "center",
          borderRight: "2px solid #e5e7eb",
          backgroundColor: "#f9fafb"
        }}>
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            disabled={disabled}
            style={{
              appearance: "none",
              padding: "0.75rem 2rem 0.75rem 0.75rem",
              border: "none",
              backgroundColor: "transparent",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: disabled ? "not-allowed" : "pointer",
              outline: "none",
              minWidth: "80px"
            }}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dialCode}
              </option>
            ))}
          </select>
          <svg 
            style={{
              position: "absolute",
              right: "0.5rem",
              width: "1rem",
              height: "1rem",
              pointerEvents: "none",
              color: "#6b7280"
            }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Phone Input */}
        <input
          type={allowText ? "text" : "tel"}
          name={name}
          placeholder={placeholder}
          value={current}
          onChange={handleChange}
          autoComplete={autoComplete}
          disabled={disabled}
          style={{
            flex: 1,
            padding: "0.75rem 3rem 0.75rem 0.75rem",
            border: "none",
            outline: "none",
            fontSize: "1rem",
            backgroundColor: "transparent",
            color: disabled ? "#9ca3af" : "#111827"
          }}
          {...rest}
        />

        {/* Check Mark */}
        {valid && (
          <svg
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "1.25rem",
              height: "1.25rem",
              color: "#10b981",
              pointerEvents: "none"
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </div>
  );
}

// Default countries list - can be overridden via props
const DEFAULT_COUNTRIES = [
  // 🇪🇬 North Africa
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "LY", name: "Libya", dialCode: "+218", flag: "🇱🇾" },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: "🇹🇳" },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: "🇩🇿" },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: "🇲🇦" },
  { code: "SD", name: "Sudan", dialCode: "+249", flag: "🇸🇩" },
  { code: "MR", name: "Mauritania", dialCode: "+222", flag: "🇲🇷" },
  { code: "DJ", name: "Djibouti", dialCode: "+253", flag: "🇩🇯" },
  { code: "SO", name: "Somalia", dialCode: "+252", flag: "🇸🇴" },
  { code: "KM", name: "Comoros", dialCode: "+269", flag: "🇰🇲" },

  // 🌍 Middle East
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴" },
  { code: "LB", name: "Lebanon", dialCode: "+961", flag: "🇱🇧" },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: "🇮🇶" },
  { code: "SY", name: "Syria", dialCode: "+963", flag: "🇸🇾" },
  { code: "YE", name: "Yemen", dialCode: "+967", flag: "🇾🇪" },
  { code: "PS", name: "Palestine", dialCode: "+970", flag: "🇵🇸" },
  { code: "IR", name: "Iran", dialCode: "+98", flag: "🇮🇷" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
];