import { useTranslation } from "react-i18next";
import "./ProjectDetails.scss";
import Icons from "components/Icons/Icons";
import type { Project } from "helpers/api/content";
import { localized } from "helpers/i18n";

interface ProjectDetailsProps {
  project: Project;
  onConfirm: () => void;
}

const ProjectDetails = ({ project, onConfirm }: ProjectDetailsProps) => {
  const { t } = useTranslation();
  return (
    <div className="project-details-modal" onClick={onConfirm}>
      <div className="project-details-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header-shared project-header">
          <h2>{localized(project, "title")}</h2>
          <button className="btn-close-modal" onClick={onConfirm}>
            ×
          </button>
        </header>

        <div className="project-details-body">
          <section className="project-description">
            <h3>{t("Description")}</h3>
            <p>{localized(project, "description")}</p>
          </section>

          <section className="project-members">
            <h3>{t("Members")} ({project.members.length})</h3>
            {project.members.length > 0 ? (
              <div className="members-list">
                {project.members.map((member) => (
                  <div key={member.id} className="member-card">
                    <div className="member-avatar">
                      {member.profile_image ? (
                        <img src={member.profile_image} alt={member.name} />
                      ) : (
                        <Icons.Profile />
                      )}
                    </div>
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <p>{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-members">{t("No members added to this project.")}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
