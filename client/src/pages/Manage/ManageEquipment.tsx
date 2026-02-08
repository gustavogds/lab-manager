import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { listAllEquipment } from "helpers/api/content";
import type { Equipment } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import "./ManageContent.scss";

const ManageEquipment = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<
    "custom_id" | "name" | "location" | "assigned_to"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchEquipment = async () => {
    setIsLoading(true);
    const response = await listAllEquipment();
    if (response.success) {
      setEquipment(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleEdit = (item: Equipment) => {
    ModalsHandler.createModal("EquipmentEditor", {
      equipment: item,
      onConfirm: () => {
        fetchEquipment();
      },
    });
  };

  const hasEquipment = equipment.length > 0;

  const handleSort = (
    key: "custom_id" | "name" | "location" | "assigned_to"
  ) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedEquipment = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    const getValue = (item: Equipment) => {
      switch (sortKey) {
        case "custom_id":
          return item.custom_id || "";
        case "name":
          return item.name || "";
        case "location":
          return item.location || "";
        case "assigned_to":
          return item.assigned_to?.name || "";
        default:
          return "";
      }
    };

    return [...equipment].sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }

      const aValue = getValue(a).toString().toLowerCase();
      const bValue = getValue(b).toString().toLowerCase();

      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;

      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      if (aName < bName) return -1 * direction;
      if (aName > bName) return 1 * direction;
      return 0;
    });
  }, [equipment, sortKey, sortDirection]);

  return (
    <div className="manage-content-page">
      <div className="manage-content-container">
        <button className="back-button" onClick={() => navigate("/manage")}>
          <FaArrowLeft /> Voltar
        </button>

        <header className="page-header">
          <div className="header-content">
            <h1>Equipamentos</h1>
            <p>Gerencie os materiais e equipamentos do laboratório</p>
          </div>
          {!isLoading && hasEquipment && (
            <button
              className="add-button"
              onClick={() => navigate("/create/equipment")}
            >
              <FaPlus /> Novo Equipamento
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="loading-state">Carregando equipamentos...</div>
        ) : !hasEquipment ? (
          <div className="empty-state">
            <p>Nenhum equipamento cadastrado.</p>
            <button onClick={() => navigate("/create/equipment")}>
              Cadastrar primeiro equipamento
            </button>
          </div>
        ) : (
          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th
                    className={sortKey === "custom_id" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("custom_id")}
                  >
                    ID
                    <span className="sort-indicator">
                      {sortKey === "custom_id" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className={sortKey === "name" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("name")}
                  >
                    Nome
                    <span className="sort-indicator">
                      {sortKey === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className={sortKey === "location" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("location")}
                  >
                    Localização
                    <span className="sort-indicator">
                      {sortKey === "location" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className={sortKey === "assigned_to" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("assigned_to")}
                  >
                    Responsável
                    <span className="sort-indicator">
                      {sortKey === "assigned_to" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedEquipment.map((item) => (
                  <tr
                    key={item.id}
                    className={!item.is_active ? "inactive" : ""}
                    onClick={() => handleEdit(item)}
                  >
                    <td className="cell-id">{item.custom_id}</td>
                    <td className="cell-name">{item.name}</td>
                    <td className="cell-location">
                      {item.location || <span className="empty-value">—</span>}
                    </td>
                    <td className="cell-assigned">
                      {item.assigned_to ? (
                        <div className="assigned-user">
                          {item.assigned_to.profile_image && (
                            <img
                              src={item.assigned_to.profile_image}
                              alt={item.assigned_to.name}
                              className="user-avatar"
                            />
                          )}
                          <span>{item.assigned_to.name}</span>
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

export default ManageEquipment;
