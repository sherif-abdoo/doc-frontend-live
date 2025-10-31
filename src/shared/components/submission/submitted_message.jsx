import { Check } from "lucide-react";
import "../../style/submission/submitted_message_style.css";

const SubmittedMessage = ({type}) => {
  return (
    <div className="submitted-message">
      <Check size={30} className="check-icon" />
      <span>{type} already submitted</span>
    </div>
  );
};

export default SubmittedMessage;
