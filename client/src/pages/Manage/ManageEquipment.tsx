import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  listAllEquipment,
  listRooms,
  createRoom,
  updateEquipment,
  listIdentificationCategories,
  createIdentificationCategory,
} from "helpers/api/content";
import type { Equipment, Room, IdentificationCategory } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import { FaArrowLeft, FaPlus, FaDoorOpen, FaPen, FaGripVertical, FaChevronDown, FaTag, FaSearch } from "react-icons/fa";
import "./ManageContent.scss";
import "./ManageEquipment.scss";

const ManageEquipment = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<IdentificationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState("");
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<{ equipmentId: number } | null>(null);
  const [dragOverRoom, setDragOverRoom] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const [eqResponse, roomResponse, catResponse] = await Promise.all([
      listAllEquipment(),
      listRooms(),
      listIdentificationCategories(),
    ]);
    if (eqResponse.success) setEquipment(eqResponse.data);
    if (roomResponse.success) setRooms(roomResponse.data);
    if (catResponse.success) setCategories(catResponse.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (item: Equipment) => {
    ModalsHandler.createModal("EquipmentEditor", {
      equipment: item,
      rooms,
      categories,
      onConfirm: () => fetchData(),
    });
  };

  const handleEditRoom = (room: Room) => {
    ModalsHandler.createModal("RoomEditor", {
      room,
      onConfirm: () => fetchData(),
    });
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    setIsCreatingRoom(true);
    const response = await createRoom({ name: newRoomName.trim() });
    setIsCreatingRoom(false);
    if (response.success) {
      setNewRoomName("");
      setShowNewRoomInput(false);
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Sala criada com sucesso!",
        type: "success",
      });
      fetchData();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao criar sala.",
        type: "error",
      });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    const response = await createIdentificationCategory({ name: newCategoryName.trim() });
    setIsCreatingCategory(false);
    if (response.success) {
      setNewCategoryName("");
      setShowNewCategoryInput(false);
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Categoria criada com sucesso!",
        type: "success",
      });
      fetchData();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao criar categoria.",
        type: "error",
      });
    }
  };

  const handleEditCategory = (category: IdentificationCategory) => {
    ModalsHandler.createModal("IdentificationCategoryEditor", {
      category,
      onConfirm: () => fetchData(),
    });
  };

  const handleDragStart = (equipmentId: number) => {
    dragItem.current = { equipmentId };
  };

  const handleDragOver = (e: React.DragEvent, roomId: number | null) => {
    e.preventDefault();
    setDragOverRoom(roomId);
  };

  const handleDragLeave = () => {
    setDragOverRoom(null);
  };

  const handleDrop = async (e: React.DragEvent, targetRoomId: number | null) => {
    e.preventDefault();
    setDragOverRoom(null);
    if (!dragItem.current) return;

    const { equipmentId } = dragItem.current;
    dragItem.current = null;

    const item = equipment.find((eq) => eq.id === equipmentId);
    if (!item) return;

    const currentRoomId = item.room?.id || null;
    if (currentRoomId === targetRoomId) return;

    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === equipmentId
          ? {
              ...eq,
              room: targetRoomId
                ? rooms.find((r) => r.id === targetRoomId) || null
                : null,
            }
          : eq
      )
    );

    const response = await updateEquipment(equipmentId, {
      room_id: targetRoomId,
    } as any);

    if (!response.success) {
      ModalsHandler.createNotification({
        title: "Erro",
        message: "Falha ao mover equipamento.",
        type: "error",
      });
      fetchData();
    }
  };

  const sortActiveFirst = (items: Equipment[]) =>
    [...items].sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return 0;
    });

  const filterEquipment = (items: Equipment[]) => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (eq) =>
        eq.name.toLowerCase().includes(term) ||
        eq.custom_id.toLowerCase().includes(term) ||
        (eq.identification_category?.name.toLowerCase().includes(term) ?? false) ||
        (eq.assigned_to?.name.toLowerCase().includes(term) ?? false) ||
        (eq.users?.some((u) => u.name.toLowerCase().includes(term)) ?? false)
    );
  };

  const filteredEquipment = useMemo(
    () => filterEquipment(equipment),
    [equipment, searchTerm]
  );

  const unassignedEquipment = useMemo(
    () => sortActiveFirst(filteredEquipment.filter((eq) => !eq.room)),
    [filteredEquipment]
  );

  const getEquipmentForRoom = (roomId: number) =>
    sortActiveFirst(filteredEquipment.filter((eq) => eq.room?.id === roomId));

  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => a.order - b.order),
    [rooms]
  );

  const renderEquipmentTable = (
    items: Equipment[],
    roomId: number | null,
    emptyMessage: string
  ) => (
    <div
      className={`room-table-drop-zone ${dragOverRoom === roomId ? "drag-over" : ""}`}
      onDragOver={(e) => handleDragOver(e, roomId)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, roomId)}
    >
      {items.length === 0 ? (
        <div className="room-empty">{emptyMessage}</div>
      ) : (
        <table className="content-table">
          <thead>
            <tr>
              <th style={{ width: 40 }} />
              <th>Categoria</th>
              <th>ID</th>
              <th>Nome</th>
              <th>Responsável</th>
              <th>Usuários</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={!item.is_active ? "inactive" : ""}
                draggable
                onDragStart={() => handleDragStart(item.id)}
              >
                <td className="cell-drag">
                  <FaGripVertical className="drag-handle" />
                </td>
                <td className="cell-category" onClick={() => handleEdit(item)}>
                  {item.identification_category ? (
                    <span className="category-tag">{item.identification_category.name}</span>
                  ) : (
                    <span className="empty-value">—</span>
                  )}
                </td>
                <td className="cell-id" onClick={() => handleEdit(item)}>
                  {item.custom_id}
                </td>
                <td className="cell-name" onClick={() => handleEdit(item)}>
                  {item.name}
                </td>
                <td className="cell-assigned" onClick={() => handleEdit(item)}>
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
                <td className="cell-users" onClick={() => handleEdit(item)}>
                  {item.users && item.users.length > 0 ? (
                    <div className="users-list">
                      {item.users.slice(0, 3).map((u) => (
                        <span key={u.id} className="user-tag">
                          {u.name.split(" ")[0]}
                        </span>
                      ))}
                      {item.users.length > 3 && (
                        <span className="user-tag more">
                          +{item.users.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="empty-value">—</span>
                  )}
                </td>
                <td className="cell-status" onClick={() => handleEdit(item)}>
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
      )}
    </div>
  );

  const hasContent = equipment.length > 0 || rooms.length > 0;

  return (
    <div className="manage-content-page manage-equipment-page">
      <div className="manage-content-container">
        <button className="btn-back" onClick={() => navigate("/manage")}>
          <FaArrowLeft /> Voltar
        </button>

        <header className="page-header">
          <div className="header-content">
            <h1>Equipamentos</h1>
            <p>Gerencie os materiais, equipamentos e salas do laboratório</p>
          </div>
          <div className="header-actions">
            <div className="create-dropdown" ref={dropdownRef}>
              <button
                className="btn-add btn-sm"
                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              >
                <FaPlus /> Criar <FaChevronDown />
              </button>
              {showCreateDropdown && (
                <div className="dropdown-menu">
                  <button
                    onClick={() => {
                      navigate("/create/equipment");
                      setShowCreateDropdown(false);
                    }}
                  >
                    <FaPlus /> Equipamento
                  </button>
                  <button
                    onClick={() => {
                      setShowNewRoomInput(true);
                      setShowCreateDropdown(false);
                    }}
                  >
                    <FaDoorOpen /> Sala
                  </button>
                  <button
                    onClick={() => {
                      setShowNewCategoryInput(true);
                      setShowCreateDropdown(false);
                    }}
                  >
                    <FaTag /> Categoria de Identificação
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar por categoria, ID, nome ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              title="Limpar pesquisa"
            >
              ×
            </button>
          )}
        </div>

        {showNewRoomInput && (
          <div className="new-room-input-bar">
            <input
              type="text"
              placeholder="Nome da nova sala..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateRoom();
                if (e.key === "Escape") {
                  setShowNewRoomInput(false);
                  setNewRoomName("");
                }
              }}
              autoFocus
              maxLength={255}
            />
            <button
              className="btn-confirm"
              onClick={handleCreateRoom}
              disabled={isCreatingRoom || !newRoomName.trim()}
            >
              {isCreatingRoom ? "Criando..." : "Criar"}
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowNewRoomInput(false);
                setNewRoomName("");
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {showNewCategoryInput && (
          <div className="new-room-input-bar">
            <input
              type="text"
              placeholder="Nome da nova categoria..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCategory();
                if (e.key === "Escape") {
                  setShowNewCategoryInput(false);
                  setNewCategoryName("");
                }
              }}
              autoFocus
              maxLength={255}
            />
            <button
              className="btn-confirm"
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
            >
              {isCreatingCategory ? "Criando..." : "Criar"}
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategoryName("");
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">Carregando equipamentos...</div>
        ) : !hasContent ? (
          <div className="empty-state">
            <p>Nenhum equipamento ou sala cadastrado.</p>
            <button className="btn-confirm" onClick={() => navigate("/create/equipment")}>
              Cadastrar primeiro equipamento
            </button>
          </div>
        ) : (
          <div className="rooms-layout">
            {categories.length > 0 && (
              <div className="categories-section">
                <div className="categories-header">
                  <h2><FaTag className="category-icon" /> Categorias de Identificação</h2>
                </div>
                <div className="categories-list">
                  {categories.map((category) => (
                    <div key={category.id} className="category-item">
                      <span className="category-name">{category.name}</span>
                      <button
                        className="btn-icon btn-icon--primary"
                        onClick={() => handleEditCategory(category)}
                        title="Editar categoria"
                      >
                        <FaPen />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unassignedEquipment.length > 0 && (
              <div className="room-section">
                <div className="room-header">
                  <h2>Sem sala definida</h2>
                </div>
                <div className="content-table-wrapper">
                  {renderEquipmentTable(
                    unassignedEquipment,
                    null,
                    "Nenhum equipamento sem sala."
                  )}
                </div>
              </div>
            )}

            {sortedRooms.map((room) => {
              const roomEquipment = getEquipmentForRoom(room.id);
              return (
                <div key={room.id} className="room-section">
                  <div className="room-header">
                    <h2>
                      <FaDoorOpen className="room-icon" />
                      {room.name}
                    </h2>
                    <button
                      className="btn-icon btn-icon--primary"
                      onClick={() => handleEditRoom(room)}
                      title="Editar sala"
                    >
                      <FaPen />
                    </button>
                  </div>
                  <div className="content-table-wrapper">
                    {renderEquipmentTable(
                      roomEquipment,
                      room.id,
                      "Arraste equipamentos para esta sala"
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEquipment;
