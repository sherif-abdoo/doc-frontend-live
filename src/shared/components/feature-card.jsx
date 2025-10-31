/*feature-card.jsx*/
import "../style/feature-card-style.css"

const FeatureCard = ({title , icon , description,bgColor}) => {
    return (
      <div className="feature-card" style={{ backgroundColor: bgColor }}>
          <div className="feature-card-content">
              <h1 className="feature-card-title">{title}</h1>
              <img src={icon} alt={title + " icon"} className="feature-card-icon" />
              <p className="feature-card-description">{description}</p>
          </div>
      </div>
    );
}

export default FeatureCard;