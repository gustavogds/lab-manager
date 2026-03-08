import { useTranslation } from "react-i18next";
import "./ResearcherDetails.scss";
import Icons from "components/Icons/Icons";
import type { Researcher, Project } from "helpers/api/content";

interface ResearcherDetailsProps {
  researcher: Researcher;
  projects: Project[];
  onConfirm: () => void;
}

const ResearcherDetails = ({ researcher, projects, onConfirm }: ResearcherDetailsProps) => {
  const { t } = useTranslation();
  const visiblePositions = (researcher.positions || [])
    .filter((p) => p.is_visible)
    .map((p) => p.name)
    .join(", ");

  // Fallback to single position for backward compatibility
  const positionDisplay = visiblePositions || (researcher.position?.is_visible !== false ? researcher.position?.name : null);

  return (
    <div className="researcher-details-modal" onClick={onConfirm}>
      <div className="researcher-details-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header-shared researcher-header">
          <div className="researcher-header-info">
            <div className="researcher-avatar">
              {researcher.profile_image ? (
                <img src={researcher.profile_image} alt={researcher.name} />
              ) : (
                <Icons.Profile />
              )}
            </div>
            <div className="researcher-info">
              <h2>{researcher.name}</h2>
              {positionDisplay && (
                <p className="position">{positionDisplay}</p>
              )}
            </div>
          </div>
          <button className="btn-close-modal" onClick={onConfirm}>
            ×
          </button>
        </header>

        <div className="researcher-details-body">
          {researcher.bio && (
            <section className="bio-section">
              <h3>{t("About")}</h3>
              <p className="bio-text">{researcher.bio}</p>
            </section>
          )}

          <section className="contact-section">
            {researcher.contact_email || researcher.phone ? (
              <h3>{t("Contact")}</h3>
            ) : null}
            <div className="contact-list">
              {researcher.contact_email && researcher.contact_email !== researcher.email && (
                <div className="contact-item">
                  <span className="label">{t("Contact email")}:</span>
                  <a href={`mailto:${researcher.contact_email}`}>{researcher.contact_email}</a>
                </div>
              )}
              {researcher.phone && (
                <div className="contact-item">
                  <span className="label">{t("Phone")}:</span>
                  <span>{researcher.phone}</span>
                </div>
              )}
            </div>
          </section>

          {(researcher.social_media || researcher.lattes) && (
            <section className="links-section">
              <h3>{t("Links")}</h3>
              <div className="links-list">
                {researcher.lattes && (
                  <a 
                    href={researcher.lattes} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link-item"
                  >
                    {t("Lattes CV")}
                  </a>
                )}
                {researcher.social_media && (
                  <a 
                    href={researcher.social_media} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link-item"
                  >
                    {t("Page")}
                  </a>
                )}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="projects-section">
              <h3>{t("Projects")} ({projects.length})</h3>
              <div className="projects-list">
                {projects.map((project) => (
                  <div key={project.id} className="project-item">
                    <h4>{project.title}</h4>
                    <p>{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearcherDetails;
