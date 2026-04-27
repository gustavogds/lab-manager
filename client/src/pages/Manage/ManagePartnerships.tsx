import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { listAllPartnerships } from "helpers/api/content";
import type { Partnership } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import "./ManageContent.scss";

const ManagePartnerships = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<"name" | "link">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchPartnerships = async () => {
    setIsLoading(true);
    const response = await listAllPartnerships();
    if (response.success) {
      setPartnerships(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const handleEdit = (item: Partnership) => {
    ModalsHandler.createModal("PartnershipManageEditor", {
      partnership: item,
      onConfirm: () => {
        fetchPartnerships();
      },
    });
  };

  const hasPartnerships = partnerships.length > 0;

  const handleSort = (key: "name" | "link") => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedPartnerships = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    const getValue = (item: Partnership) => {
      switch (sortKey) {
        case "name":
          return item.name || "";
        case "link":
          return item.link || "";
        default:
          return "";
      }
    };

    return [...partnerships].sort((a, b) => {
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
  }, [partnerships, sortKey, sortDirection]);

  return (
    <div className="manage-content-page">
      <div className="manage-content-container">
        <button className="btn-back" onClick={() => navigate("/manage")}>
          <FaArrowLeft /> {t("Back")}
        </button>

        <header className="page-header">
          <div className="header-content">
            <h1>{t("Partnerships")}</h1>
            <p>{t("Manage the partnerships of the laboratory")}</p>
          </div>
          {!isLoading && hasPartnerships && (
            <button
              className="btn-add btn-sm"
              onClick={() => navigate("/create/partnership")}
            >
              <FaPlus /> {t("New Partnership")}
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="loading-state">{t("Loading partnerships...")}</div>
        ) : !hasPartnerships ? (
          <div className="empty-state">
            <p>{t("No partnership registered.")}</p>
            <button className="btn-confirm" onClick={() => navigate("/create/partnership")}>
              {t("Register first partnership")}
            </button>
          </div>
        ) : (
          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th
                    className={sortKey === "name" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("name")}
                  >
                    {t("Name")}
                    <span className="sort-indicator">
                      {sortKey === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className={sortKey === "link" ? "sortable active" : "sortable"}
                    onClick={() => handleSort("link")}
                  >
                    {t("Link")}
                    <span className="sort-indicator">
                      {sortKey === "link" && (sortDirection === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th>{t("Logo")}</th>
                  <th>{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedPartnerships.map((item) => (
                  <tr
                    key={item.id}
                    className={!item.is_active ? "inactive" : ""}
                    onClick={() => handleEdit(item)}
                  >
                    <td className="cell-name">{item.name}</td>
                    <td className="cell-link">
                      {item.link || <span className="empty-value">—</span>}
                    </td>
                    <td className="cell-logo">
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt={item.name}
                          className="partnership-logo"
                        />
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

export default ManagePartnerships;
