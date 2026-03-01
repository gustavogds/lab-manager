import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  listAllEquipment,
  listRooms,
  createRoom,
  updateEquipment,
} from "helpers/api/content";
import type { Equipment, Room } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import { FaArrowLeft, FaPlus, FaDoorOpen, FaPen, FaGripVertical } from "react-icons/fa";
import "./ManageContent.scss";
import "./ManageEquipment.scss";

const ManageEquipment = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState("");
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const dragItem = useRef<{ equipmentId: number } | null>(null);
  const [dragOverRoom, setDragOverRoom] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const [eqResponse, roomResponse] = await Promise.all([
      listAllEquipment(),
      listRooms(),
    ]);
    if (eqResponse.success) setEquipment(eqResponse.data);
    if (roomResponse.success) setRooms(roomResponse.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: Equipment) => {
    ModalsHandler.createModal("EquipmentEditor", {
      equipment: item,
      rooms,
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

  const unassignedEquipment = useMemo(
    () => sortActiveFirst(equipment.filter((eq) => !eq.room)),
    [equipment]
  );

  const getEquipmentForRoom = (roomId: number) =>
    sortActiveFirst(equipment.filter((eq) => eq.room?.id === roomId));

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
            <button
              className="btn-add btn-add--secondary btn-sm"
              onClick={() => setShowNewRoomInput(true)}
            >
              <FaDoorOpen /> Nova Sala
            </button>
            <button
              className="btn-add btn-sm"
              onClick={() => navigate("/create/equipment")}
            >
              <FaPlus /> Novo Equipamento
            </button>
          </div>
        </header>

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

        {isLoading ? (
          <div className="loading-state">Carregando equipamentos...</div>
        ) : !hasContent ? (
          <div className="empty-state">
            <p>Nenhum equipamento ou sala cadastrado.</p>
            <button onClick={() => navigate("/create/equipment")}>
              Cadastrar primeiro equipamento
            </button>
          </div>
        ) : (
          <div className="rooms-layout">
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
