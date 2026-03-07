import "./ResearcherCard.scss";
import Icons from "components/Icons/Icons";
import type { Researcher } from "helpers/api/content";

interface ResearcherCardProps {
  researcher: Researcher;
  onClick: () => void;
}

const ResearcherCard = ({ researcher, onClick }: ResearcherCardProps) => {
  const visiblePositions = (researcher.positions || [])
    .filter((p) => p.is_visible)
    .map((p) => p.name)
    .join(", ");

  // Fallback to single position for backward compatibility
  const positionDisplay = visiblePositions || (researcher.position?.is_visible !== false ? researcher.position?.name : null);

  return (
    <div className="researcher-card" onClick={onClick}>
      <div className="researcher-avatar">
        {researcher.profile_image ? (
          <img src={researcher.profile_image} alt={researcher.name} />
        ) : (
          <Icons.Profile />
        )}
      </div>
      <h3 className="researcher-name">{researcher.name}</h3>
      {positionDisplay && (
        <p className="researcher-position">{positionDisplay}</p>
      )}
    </div>
  );
};

export default ResearcherCard;
