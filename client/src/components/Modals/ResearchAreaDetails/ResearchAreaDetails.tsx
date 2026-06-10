import { useTranslation } from "react-i18next";
import { FaExternalLinkAlt } from "react-icons/fa";
import "./ResearchAreaDetails.scss";
import type { ResearchArea } from "helpers/api/content";
import { localized } from "helpers/i18n";

interface ResearchAreaDetailsProps {
  area: ResearchArea;
  onConfirm: () => void;
}

const ResearchAreaDetails = ({ area, onConfirm }: ResearchAreaDetailsProps) => {
  const { t } = useTranslation();
  return (
    <div className="research-area-details-modal" onClick={onConfirm}>
      <div className="research-area-details-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header-shared research-area-header">
          <h2>{localized(area, "title")}</h2>
          <button className="btn-close-modal" onClick={onConfirm}>
            ×
          </button>
        </header>

        <div className="research-area-details-body">
          <section className="research-area-description">
            <h3>{t("Description")}</h3>
            <p>{localized(area, "description")}</p>
          </section>

          {area.link && (
            <a
              className="btn-more-info"
              href={area.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaExternalLinkAlt /> {t("More information")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchAreaDetails;
