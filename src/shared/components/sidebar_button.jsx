import { useNavigate } from "react-router-dom";
import '../style/sidebar_button_style.css';

const SidebarButton = ({ icon, label, active = false, isExpanded, to, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
    if (onClick) {
      onClick();
    }
  };

  return (
    <button 
      className={`nav-btn ${active ? "active" : ""}`} 
      onClick={handleClick}
    >
      <img src={icon} alt={label} />
      <span className={`label ${isExpanded ? 'visible' : ''}`}>{label}</span>
    </button>
  );
};

export default SidebarButton;