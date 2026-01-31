import "./PartnershipBadge.scss";
import type { Partnership } from "helpers/api/content";

interface PartnershipBadgeProps {
  partnership: Partnership;
}

const PartnershipBadge = ({ partnership }: PartnershipBadgeProps) => {
  const handleClick = () => {
    if (partnership.link) {
      window.open(partnership.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`partnership-badge ${partnership.link ? "clickable" : ""}`}
      onClick={handleClick}
      title={partnership.name}
    >
      <div className="badge-logo">
        {partnership.logo && (
          <img src={partnership.logo} alt={partnership.name} />
        )}
      </div>
      <div className="badge-overlay">
        <span className="badge-name">{partnership.name}</span>
      </div>
    </div>
  );
};

export default PartnershipBadge;
