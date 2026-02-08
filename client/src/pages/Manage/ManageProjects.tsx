import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { listProjects } from "helpers/api/content";
import type { Project } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import "./ManageContent.scss";

const ManageProjects = () => {
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
        <button className="back-button" onClick={() => navigate("/manage")}>
          <FaArrowLeft /> Voltar
        </button>

        <header className="page-header">
          <div className="header-content">
            <h1>Projetos</h1>
            <p>Gerencie os projetos do laboratório</p>
          </div>
          {!isLoading && hasProjects && (
            <button
              className="add-button"
              onClick={() => navigate("/create/project")}
            >
              <FaPlus /> Novo Projeto
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="loading-state">Carregando projetos...</div>
        ) : !hasProjects ? (
          <div className="empty-state">
            <p>Nenhum projeto cadastrado.</p>
            <button onClick={() => navigate("/create/project")}>
              Cadastrar primeiro projeto
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
                    Título
                    <span className="sort-indicator">
                      {sortKey === "title" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className={sortKey === "description" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("description")}
                  >
                    Descrição
                    <span className="sort-indicator">
                      {sortKey === "description" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className={sortKey === "members" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("members")}
                  >
                    Integrantes
                    <span className="sort-indicator">
                      {sortKey === "members" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th>Status</th>
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
                        {item.is_active ? "Ativo" : "Inativo"}
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
