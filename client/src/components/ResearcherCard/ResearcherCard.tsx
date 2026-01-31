import "./ResearcherCard.scss";
import Icons from "components/Icons/Icons";
import type { Researcher } from "helpers/api/content";

interface ResearcherCardProps {
  researcher: Researcher;
  onClick: () => void;
}

const ResearcherCard = ({ researcher, onClick }: ResearcherCardProps) => {
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
      {researcher.position && (
        <p className="researcher-position">{researcher.position}</p>
      )}
    </div>
  );
};

export default ResearcherCard;
