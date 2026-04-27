import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { listProjects } from "helpers/api/content";
import type { Project } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import "./ManageContent.scss";

const ManageProjects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<"title" | "description" | "members">("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchProjects = async () => {
    setIsLoading(true);
    const response = await listProjects();
    if (response.success) {
      setProjects(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (item: Project) => {
    ModalsHandler.createModal("ProjectManageEditor", {
      project: item,
      onConfirm: () => {
        fetchProjects();
      },
    });
  };

  const hasProjects = projects.length > 0;

  const handleSort = (key: "title" | "description" | "members") => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedProjects = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    const getValue = (item: Project) => {
      switch (sortKey) {
        case "title":
          return item.title || "";
        case "description":
          return item.description || "";
        case "members":
          return item.members.length.toString().padStart(10, "0");
        default:
          return "";
      }
    };

    return [...projects].sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }

      const aValue = getValue(a).toString().toLowerCase();
      const bValue = getValue(b).toString().toLowerCase();

      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;

      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      if (aTitle < bTitle) return -1 * direction;
      if (aTitle > bTitle) return 1 * direction;
      return 0;
    });
  }, [projects, sortKey, sortDirection]);

  return (
    <div className="manage-content-page">
      <div className="manage-content-container">
        <button className="btn-back" onClick={() => navigate("/manage")}>
          <FaArrowLeft /> {t("Back")}
        </button>

        <header className="page-header">
          <div className="header-content">
            <h1>{t("Projects")}</h1>
            <p>{t("Manage the projects of the laboratory")}</p>
          </div>
          {!isLoading && hasProjects && (
            <button
              className="btn-add btn-sm"
              onClick={() => navigate("/create/project")}
            >
              <FaPlus /> {t("New Project")}
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="loading-state">{t("Loading projects...")}</div>
        ) : !hasProjects ? (
          <div className="empty-state">
            <p>{t("No project registered.")}</p>
            <button className="btn-confirm" onClick={() => navigate("/create/project")}>
              {t("Register first project")}
            </button>
          </div>
        ) : (
          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th
                    className={sortKey === "title" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("title")}
                  >
                    {t("Title")}
                    <span className="sort-indicator">
                      {sortKey === "title" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className={sortKey === "description" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("description")}
                  >
                    {t("Description")}
                    <span className="sort-indicator">
                      {sortKey === "description" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className={sortKey === "members" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("members")}
                  >
                    {t("Members")}
                    <span className="sort-indicator">
                      {sortKey === "members" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th>{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map((item) => (
                  <tr
                    key={item.id}
                    className={!item.is_active ? "inactive" : ""}
                    onClick={() => handleEdit(item)}
                  >
                    <td className="cell-name">{item.title}</td>
                    <td className="cell-description">
                      {item.description || <span className="empty-value">—</span>}
                    </td>
                    <td className="cell-members">
                      {item.members.length > 0 ? (
                        <div className="members-list">
                          {item.members.slice(0, 3).map((member) => (
                            <span key={member.id} className="member-badge">
                              {member.name.split(" ")[0]}
                            </span>
                          ))}
                          {item.members.length > 3 && (
                            <span className="member-badge more">
                              +{item.members.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="empty-value">—</span>
                      )}
                    </td>
                    <td className="cell-status">
                      <span
                        className={`status-badge ${item.is_active ? "active" : "inactive"}`}
                      >
                        {item.is_active ? t("Active") : t("Inactive")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProjects;
