import "./ProjectDetails.scss";
import Icons from "components/Icons/Icons";
import type { Project } from "helpers/api/content";

interface ProjectDetailsProps {
  project: Project;
  onConfirm: () => void;
}

const ProjectDetails = ({ project, onConfirm }: ProjectDetailsProps) => {
  return (
    <div className="project-details-modal" onClick={onConfirm}>
      <div className="project-details-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onConfirm}>
          ×
        </button>

        <div className="project-details-body">
          <header className="project-header">
            <h2>{project.title}</h2>
          </header>

          <section className="project-description">
            <h3>Descrição</h3>
            <p>{project.description}</p>
          </section>

          <section className="project-members">
            <h3>Integrantes ({project.members.length})</h3>
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
              <p className="no-members">Nenhum integrante adicionado a este projeto.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
