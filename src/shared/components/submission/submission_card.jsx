// src/shared/components/submission/submission_card.jsx
import SecondaryButton from "../../../shared/components/secondary_button";
import "../../style/submission/submission_card_style.css";
import appColors from "../../../shared/components/app_colors";
import IconButton from "../../../shared/components/icon_button";

const EditIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z" fill="currentColor" />
      <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" fill="currentColor"/>
    </svg>
);

const TrashIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 7h12l-1 13H7L6 7Z" fill="currentColor"/>
      <path d="M9 4h6l1 2H8l1-2Z" fill="currentColor"/>
    </svg>
);

const SubmissionCard = ({ submission, type, role, canManage = false, onEdit, onDelete }) => {
  const sectionColors = {
    Biology: appColors.bioCard,
    Chemistry: appColors.chemCard,
    Physics: appColors.physCard,
  };

  const sectionBackgrounds = {
    Biology: "/assets/Homework/Biology-Background.png",
    Chemistry: "/assets/Homework/Chemistry-Background.png",
    Physics: "/assets/Homework/Physics-Background.png",
  };

  // --- Green/Red badge logic ---
  // Accept either string state ("submitted"/"unsubmitted") or boolean `submitted`
  const submittedFlag =
      typeof submission?.state === "string"
          ? submission.state.toLowerCase() === "submitted"
          : !!submission?.submitted;

  const stateLabel = submittedFlag ? "Submitted" : "Unsubmitted";
  const pillBg = submittedFlag ? "#16a34a" /* green-600 */ : "#dc2626" /* red-600 */;

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(submission, role);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(submission, role);
  };

  return (
      <div
          className="submission-card"
          style={{ backgroundColor: sectionColors[submission.subject] }}
      >
        <div className="submission-image">
          <img
              src={sectionBackgrounds[submission.subject]}
              alt={`${submission.subject || "Section"} background`}
              onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        <div className="submission-card_left">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>{submission.title}</h2>
            {canManage && (
                <div style={{ display: "inline-flex", gap: 6, marginLeft: 6 }}>
                  <IconButton icon={<EditIcon />} bg="#2563eb" title="Edit" onClick={handleEditClick} />
                  <IconButton icon={<TrashIcon />} bg="#dc2626" title="Delete" onClick={handleDeleteClick} />
                </div>
            )}
          </div>

          {submission.description ? <h3>Description : {submission.description}</h3> : null}
          {submission.endDate ? (
              <p>
                <strong>Due : </strong>{" "}
                {new Date(submission.endDate).toLocaleDateString("en-CA")}
              </p>
          ) : null}
        </div>

        <div className="submission-card_right">
          <div className="submission-button">
            <SecondaryButton
                label={`View ${type}`}
                fontFamily="Montserrat Regular"
                fontWeight="auto"
            />
          </div>

          {/* ✅ Green/Red status pill */}
          <div className="submission-status" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <strong>Status:</strong>
            <span
                style={{
                  backgroundColor: pillBg,
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                }}
            >
            {stateLabel}
          </span>
          </div>
        </div>
      </div>
  );
};

export default SubmissionCard;
