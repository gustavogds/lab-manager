import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { listResearchAreas } from "helpers/api/content";
import type { ResearchArea } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import "./ManageContent.scss";

const ManageResearchAreas = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<"title" | "description">("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchAreas = async () => {
    setIsLoading(true);
    const response = await listResearchAreas();
    if (response.success) {
      setAreas(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleEdit = (item: ResearchArea) => {
    ModalsHandler.createModal("ResearchAreaEditor", {
      researchArea: item,
      onConfirm: () => {
        fetchAreas();
      },
    });
  };

  const hasAreas = areas.length > 0;

  const handleSort = (key: "title" | "description") => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedAreas = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    const getValue = (item: ResearchArea) => {
      switch (sortKey) {
        case "title":
          return item.title || "";
        case "description":
          return item.description || "";
        default:
          return "";
      }
    };

    return [...areas].sort((a, b) => {
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
  }, [areas, sortKey, sortDirection]);

  return (
    <div className="manage-content-page">
      <div className="manage-content-container">
        <button className="back-button" onClick={() => navigate("/manage")}>
          <FaArrowLeft /> Voltar
        </button>

        <header className="page-header">
          <div className="header-content">
            <h1>Áreas de Pesquisa</h1>
            <p>Gerencie as áreas de pesquisa do laboratório</p>
          </div>
          {!isLoading && hasAreas && (
            <button
              className="add-button"
              onClick={() => navigate("/create/research-area")}
            >
              <FaPlus /> Nova Área de Pesquisa
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="loading-state">Carregando áreas de pesquisa...</div>
        ) : !hasAreas ? (
          <div className="empty-state">
            <p>Nenhuma área de pesquisa cadastrada.</p>
            <button onClick={() => navigate("/create/research-area")}>
              Cadastrar primeira área de pesquisa
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedAreas.map((item) => (
                  <tr
                    key={item.id}
                    className={!item.is_active ? "inactive" : ""}
                    onClick={() => handleEdit(item)}
                  >
                    <td className="cell-name">{item.title}</td>
                    <td className="cell-description">
                      {item.description || <span className="empty-value">—</span>}
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

export default ManageResearchAreas;
