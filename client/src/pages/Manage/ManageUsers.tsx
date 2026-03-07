import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  listAllUsers,
  listRooms,
  createRoom,
  listPositions,
  createPosition,
} from "helpers/api/content";
import type { User, Room, Position } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import { FaArrowLeft, FaPlus, FaChevronDown, FaSearch, FaPen, FaBriefcase, FaDoorOpen } from "react-icons/fa";
import "./ManageContent.scss";
import "./ManageUsers.scss";

const ROLE_LABELS: Record<string, string> = {
  professor: "Professor",
  student: "Estudante",
  collaborator: "Colaborador",
  inventory_manager: "Gestor de Inventário",
};

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newPositionName, setNewPositionName] = useState("");
  const [showNewPositionInput, setShowNewPositionInput] = useState(false);
  const [isCreatingPosition, setIsCreatingPosition] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const [usersResponse, roomsResponse, positionsResponse] = await Promise.all([
      listAllUsers(),
      listRooms(),
      listPositions(),
    ]);
    if (usersResponse.success) setUsers(usersResponse.data);
    if (roomsResponse.success) setRooms(roomsResponse.data);
    if (positionsResponse.success) setPositions(positionsResponse.data);
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

  const handleEditUser = (user: User) => {
    ModalsHandler.createModal("UserEditor", {
      user,
      rooms,
      positions,
      onConfirm: () => fetchData(),
    });
  };

  const handleEditRoom = (room: Room) => {
    ModalsHandler.createModal("RoomEditor", {
      room,
      onConfirm: () => fetchData(),
    });
  };

  const handleEditPosition = (position: Position) => {
    ModalsHandler.createModal("PositionEditor", {
      position,
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

  const handleCreatePosition = async () => {
    if (!newPositionName.trim()) return;
    setIsCreatingPosition(true);
    const response = await createPosition({ name: newPositionName.trim() });
    setIsCreatingPosition(false);
    if (response.success) {
      setNewPositionName("");
      setShowNewPositionInput(false);
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Cargo criado com sucesso!",
        type: "success",
      });
      fetchData();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao criar cargo.",
        type: "error",
      });
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (a.is_former_member !== b.is_former_member) {
        return a.is_former_member ? 1 : -1;
      }
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [filteredUsers]);

  return (
    <div className="manage-content-page manage-users-page">
      <div className="manage-content-container">
        <button className="btn-back" onClick={() => navigate("/manage")}>
          <FaArrowLeft /> Voltar
        </button>

        <header className="page-header">
          <div className="header-content">
            <h1>Usuários</h1>
            <p>Gerencie os usuários, cargos e salas do sistema</p>
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
                      setShowCreateDropdown(false);
                      setShowNewPositionInput(true);
                    }}
                  >
                    <FaBriefcase /> Novo Cargo
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setShowNewRoomInput(true);
                    }}
                  >
                    <FaDoorOpen /> Nova Sala
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
            placeholder="Pesquisar por nome ou email..."
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

        {showNewPositionInput && (
          <div className="new-input-bar">
            <input
              type="text"
              placeholder="Nome do novo cargo..."
              value={newPositionName}
              onChange={(e) => setNewPositionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreatePosition();
                if (e.key === "Escape") {
                  setShowNewPositionInput(false);
                  setNewPositionName("");
                }
              }}
              autoFocus
              maxLength={100}
            />
            <button
              className="btn-confirm"
              onClick={handleCreatePosition}
              disabled={isCreatingPosition || !newPositionName.trim()}
            >
              {isCreatingPosition ? "Criando..." : "Criar"}
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowNewPositionInput(false);
                setNewPositionName("");
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {showNewRoomInput && (
          <div className="new-input-bar">
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
          <div className="loading-state">Carregando usuários...</div>
        ) : (
          <div className="users-layout">
            {positions.length > 0 && (
              <div className="categories-section positions-section">
                <div className="categories-header">
                  <h2><FaBriefcase className="category-icon" /> Cargos</h2>
                </div>
                <div className="categories-list">
                  {positions.map((position) => (
                    <div key={position.id} className="category-item position-item">
                      <span className="category-name">
                        {position.name} {!position.is_visible && "(oculto)"}
                      </span>
                      <button
                        className="btn-icon btn-icon--primary btn-icon--sm"
                        onClick={() => handleEditPosition(position)}
                        title="Editar cargo"
                      >
                        <FaPen />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rooms.length > 0 && (
              <div className="categories-section rooms-section">
                <div className="categories-header">
                  <h2><FaDoorOpen className="category-icon" /> Salas</h2>
                </div>
                <div className="categories-list">
                  {rooms.map((room) => (
                    <div key={room.id} className="category-item room-item">
                      <span className="category-name">{room.name}</span>
                      <button
                        className="btn-icon btn-icon--primary btn-icon--sm"
                        onClick={() => handleEditRoom(room)}
                        title="Editar sala"
                      >
                        <FaPen />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="users-section">
              <div className="users-header">
                <h2>Usuários ({sortedUsers.length})</h2>
              </div>
              <div className="content-table-wrapper">
                {sortedUsers.length === 0 ? (
                  <div className="empty-state">
                    <p>Nenhum usuário encontrado.</p>
                  </div>
                ) : (
                  <table className="content-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Cargos</th>
                        <th>Sala</th>
                        <th>Funções</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map((user) => (
                        <tr
                          key={user.id}
                          className={!user.is_active ? "inactive" : ""}
                          onClick={() => handleEditUser(user)}
                        >
                          <td className="cell-name">
                            <div className="user-name-cell">
                              {user.profile_image && (
                                <img
                                  src={user.profile_image}
                                  alt=""
                                  className="user-avatar"
                                />
                              )}
                              <span>{user.name || "-"}</span>
                            </div>
                          </td>
                          <td className="cell-email">{user.email}</td>
                          <td className="cell-position">
                            {user.positions && user.positions.length > 0
                              ? user.positions.map((position) => position.name).join(", ")
                              : "-"}
                          </td>
                          <td className="cell-room">
                            {user.room?.name || "-"}
                          </td>
                          <td className="cell-roles">
                            <div className="roles-list">
                              {user.roles?.map((role) => (
                                <span key={role} className={`role-tag role-${role}`}>
                                  {ROLE_LABELS[role] || role}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="cell-status">
                            {user.is_former_member ? (
                              <span className="status-badge former">Ex-membro</span>
                            ) : (
                              <span className="status-badge active">Ativo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
