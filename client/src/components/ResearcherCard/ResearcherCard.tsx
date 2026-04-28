import "./ResearcherCard.scss";
import Icons from "components/Icons/Icons";
import type { Researcher } from "helpers/api/content";
import { localized } from "helpers/i18n";

interface ResearcherCardProps {
  researcher: Researcher;
  onClick: () => void;
}

const ResearcherCard = ({ researcher, onClick }: ResearcherCardProps) => {
  const visiblePositions = (researcher.positions || [])
    .filter((p) => p.is_visible)
    .map((p) => localized(p, "name"))
    .filter(Boolean)
    .join(", ");

  const positionDisplay =
    visiblePositions ||
    (researcher.position?.is_visible !== false ? localized(researcher.position, "name") : null);

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
