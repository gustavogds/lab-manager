import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  listAllEquipment,
  listRooms,
  createRoom,
  updateEquipment,
  listIdentificationCategories,
  createIdentificationCategory,
  listEquipmentStates,
  createEquipmentState,
  listAllSections,
  createRoomSection,
} from "helpers/api/content";
import type { Equipment, Room, IdentificationCategory, EquipmentState, RoomSection } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import { FaArrowLeft, FaPlus, FaDoorOpen, FaPen, FaGripVertical, FaChevronDown, FaTag, FaSearch, FaTimes, FaClipboard, FaLayerGroup } from "react-icons/fa";
import "./ManageContent.scss";
import "./ManageEquipment.scss";

const ManageEquipment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sections, setSections] = useState<RoomSection[]>([]);
  const [categories, setCategories] = useState<IdentificationCategory[]>([]);
  const [states, setStates] = useState<EquipmentState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState("");
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [showNewStateInput, setShowNewStateInput] = useState(false);
  const [isCreatingState, setIsCreatingState] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [showNewSectionInput, setShowNewSectionInput] = useState<number | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Set<number>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dragItems = useRef<number[]>([]);
  const [dragOverTarget, setDragOverTarget] = useState<{ roomId: number | null; sectionId: number | null } | null>(null);
  const [collapsedRooms, setCollapsedRooms] = useState<Set<number | "unassigned">>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleRoomCollapse = (roomId: number | "unassigned") => {
    setCollapsedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const toggleSectionCollapse = (roomId: number, sectionId: number | null) => {
    const key = `${roomId}-${sectionId ?? "none"}`;
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const fetchData = async () => {
    setIsLoading(true);
    const [eqResponse, roomResponse, catResponse, stateResponse, sectionsResponse] = await Promise.all([
      listAllEquipment(),
      listRooms(),
      listIdentificationCategories(),
      listEquipmentStates(),
      listAllSections(),
    ]);
    if (eqResponse.success) setEquipment(eqResponse.data);
    if (roomResponse.success) setRooms(roomResponse.data);
    if (catResponse.success) setCategories(catResponse.data);
    if (stateResponse.success) setStates(stateResponse.data);
    if (sectionsResponse.success) setSections(sectionsResponse.data);
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
    const roomSections = sections.filter((s) => s.room_id === item.room?.id);
    ModalsHandler.createModal("EquipmentEditor", {
      equipment: item,
      rooms,
      categories,
      states,
      sections: roomSections,
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
        title: t("Success"),
        message: t("Room created successfully!"),
        type: "success",
      });
      fetchData();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to create room."),
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
        title: t("Success"),
        message: t("Category created successfully!"),
        type: "success",
      });
      fetchData();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to create category."),
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

  const handleCreateState = async () => {
    if (!newStateName.trim()) return;
    setIsCreatingState(true);
    const response = await createEquipmentState({ name: newStateName.trim() });
    setIsCreatingState(false);
    if (response.success) {
      setNewStateName("");
      setShowNewStateInput(false);
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("State created successfully!"),
        type: "success",
      });
      fetchData();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to create state."),
        type: "error",
      });
    }
  };

  const handleEditState = (state: EquipmentState) => {
    ModalsHandler.createModal("EquipmentStateEditor", {
      state,
      onConfirm: () => fetchData(),
    });
  };

  const handleCreateSection = async (roomId: number) => {
    if (!newSectionName.trim()) return;
    setIsCreatingSection(true);
    const response = await createRoomSection(roomId, { name: newSectionName.trim() });
    setIsCreatingSection(false);
    if (response.success) {
      setNewSectionName("");
      setShowNewSectionInput(null);
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Section created successfully!"),
        type: "success",
      });
      fetchData();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to create section."),
        type: "error",
      });
    }
  };

  const handleEditSection = (section: RoomSection, roomName: string) => {
    ModalsHandler.createModal("RoomSectionEditor", {
      section,
      roomName,
      onConfirm: () => fetchData(),
    });
  };

  const getSectionsForRoom = (roomId: number) => {
    return sections.filter((s) => s.room_id === roomId);
  };

  const handleDragStart = (equipmentId: number) => {
    if (selectedEquipment.has(equipmentId)) {
      dragItems.current = Array.from(selectedEquipment);
    } else {
      dragItems.current = [equipmentId];
    }
  };

  const toggleEquipmentSelection = (equipmentId: number) => {
    setSelectedEquipment((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(equipmentId)) {
        newSet.delete(equipmentId);
      } else {
        newSet.add(equipmentId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = (items: Equipment[]) => {
    const itemIds = items.map((eq) => eq.id);
    const allSelected = itemIds.every((id) => selectedEquipment.has(id));
    setSelectedEquipment((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        itemIds.forEach((id) => newSet.delete(id));
      } else {
        itemIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedEquipment(new Set());
  };

  const handleDragOver = (e: React.DragEvent, roomId: number | null, sectionId: number | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget({ roomId, sectionId });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverTarget(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetRoomId: number | null, targetSectionId: number | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
    if (dragItems.current.length === 0) return;

    const itemsToMove = dragItems.current.filter((id) => {
      const item = equipment.find((eq) => eq.id === id);
      if (!item) return false;
      const currentRoomId = item.room?.id || null;
      const currentSectionId = item.section?.id || null;
      return currentRoomId !== targetRoomId || currentSectionId !== targetSectionId;
    });

    dragItems.current = [];

    if (itemsToMove.length === 0) return;

    setEquipment((prev) =>
      prev.map((eq) =>
        itemsToMove.includes(eq.id)
          ? {
              ...eq,
              room: targetRoomId
                ? rooms.find((r) => r.id === targetRoomId) || null
                : null,
              section: targetSectionId
                ? sections.find((s) => s.id === targetSectionId) || null
                : null,
            }
          : eq
      )
    );

    setSelectedEquipment(new Set());

    const results = await Promise.all(
      itemsToMove.map((id) =>
        updateEquipment(id, { room_id: targetRoomId, section_id: targetSectionId } as any)
      )
    );

    const failures = results.filter((r) => !r.success).length;
    if (failures > 0) {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: t("Failed to move {{count}} equipment(s).", { count: failures }),
        type: "error",
      });
      fetchData();
    } else if (itemsToMove.length > 1) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("{{count}} equipment moved successfully!", { count: itemsToMove.length }),
        type: "success",
      });
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

  const getEquipmentForSection = (roomId: number, sectionId: number | null) =>
    sortActiveFirst(
      filteredEquipment.filter(
        (eq) => eq.room?.id === roomId && (eq.section?.id || null) === sectionId
      )
    );

  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => a.order - b.order),
    [rooms]
  );

  const renderEquipmentTable = (
    items: Equipment[],
    roomId: number | null,
    sectionId: number | null,
    emptyMessage: string
  ) => {
    const allSelected = items.length > 0 && items.every((eq) => selectedEquipment.has(eq.id));
    const someSelected = items.some((eq) => selectedEquipment.has(eq.id));
    const isDragOver = dragOverTarget?.roomId === roomId && dragOverTarget?.sectionId === sectionId;

    return (
      <div
        className={`room-table-drop-zone ${isDragOver ? "drag-over" : ""}`}
        onDragOver={(e) => handleDragOver(e, roomId, sectionId)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, roomId, sectionId)}
      >
        {items.length === 0 ? (
          <div className="room-empty">{emptyMessage}</div>
        ) : (
          <table className="content-table">
            <colgroup>
              <col className="col-checkbox" />
              <col className="col-drag" />
              <col className="col-id" />
              <col className="col-category" />
              <col className="col-name" />
              <col className="col-observation" />
              <col className="col-assigned" />
              <col className="col-users" />
              <col className="col-state" />
              <col className="col-status" />
            </colgroup>
            <thead>
              <tr>
                <th className="cell-checkbox">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => toggleSelectAll(items)}
                    title={t("Select all")}
                  />
                </th>
                <th />
                <th>{t("ID")}</th>
                <th>{t("Category")}</th>
                <th>{t("Name")}</th>
                <th>{t("Obs.")}</th>
                <th>{t("Responsible")}</th>
                <th>{t("Users")}</th>
                <th>{t("State")}</th>
                <th>{t("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isSelected = selectedEquipment.has(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`${!item.is_active ? "inactive" : ""} ${isSelected ? "selected" : ""}`}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                  >
                    <td className="cell-checkbox" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleEquipmentSelection(item.id)}
                      />
                    </td>
                    <td className="cell-drag">
                      <FaGripVertical className="drag-handle" />
                    </td>
                    <td className="cell-id" onClick={() => handleEdit(item)}>
                      {item.custom_id}
                    </td>
                    <td className="cell-category" onClick={() => handleEdit(item)}>
                      {item.identification_category ? (
                        <span className="category-tag">{item.identification_category.name}</span>
                      ) : (
                        <span className="empty-value">—</span>
                      )}
                    </td>
                    <td className="cell-name" onClick={() => handleEdit(item)}>
                      {item.name}
                    </td>
                    <td className="cell-observation" onClick={() => handleEdit(item)}>
                      {item.observation ? (
                        <span className="observation-text" title={item.observation}>
                          {item.observation.length > 30
                            ? `${item.observation.substring(0, 30)}...`
                            : item.observation}
                        </span>
                      ) : (
                        <span className="empty-value">—</span>
                      )}
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
                    <td className="cell-state" onClick={() => handleEdit(item)}>
                      {item.equipment_state ? (
                        <span className="state-tag">{item.equipment_state.name}</span>
                      ) : (
                        <span className="empty-value">—</span>
                      )}
                    </td>
                    <td className="cell-status" onClick={() => handleEdit(item)}>
                      <span
                        className={`status-badge ${item.is_active ? "active" : "inactive"}`}
                      >
                        {item.is_active ? t("Active") : t("Inactive")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const hasContent = equipment.length > 0 || rooms.length > 0;

  return (
    <div className="manage-content-page manage-equipment-page">
      <div className="manage-content-container">
        <button className="btn-back" onClick={() => navigate("/manage")}>
          <FaArrowLeft /> {t("Back")}
        </button>

        <header className="page-header">
          <div className="header-content">
            <h1>{t("Equipments")}</h1>
            <p>{t("Manage the materials, equipment and rooms of the laboratory")}</p>
          </div>
          <div className="header-actions">
            <div className="create-dropdown" ref={dropdownRef}>
              <button
                className="btn-add btn-sm"
                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              >
                <FaPlus /> {t("Create")} <FaChevronDown />
              </button>
              {showCreateDropdown && (
                <div className="dropdown-menu">
                  <button
                    onClick={() => {
                      navigate("/create/equipment");
                      setShowCreateDropdown(false);
                    }}
                  >
                    <FaPlus /> {t("Equipments")}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewRoomInput(true);
                      setShowCreateDropdown(false);
                    }}
                  >
                    <FaDoorOpen /> {t("Room")}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewCategoryInput(true);
                      setShowCreateDropdown(false);
                    }}
                  >
                    <FaTag /> {t("Identification Category")}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewStateInput(true);
                      setShowCreateDropdown(false);
                    }}
                  >
                    <FaClipboard /> {t("Equipment State")}
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
            placeholder={t("Search by category, ID, name or user...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              title={t("Clear search")}
            >
              ×
            </button>
          )}
        </div>

        {selectedEquipment.size > 0 && (
          <div className="selection-bar">
            <div className="selection-info">
              <span className="selection-count">{selectedEquipment.size}</span>
              <span>{t("items selected")}</span>
            </div>
            <span className="selection-hint">{t("Drag to move to another room")}</span>
            <button className="btn-clear-selection" onClick={clearSelection} title={t("Clear selection")}>
              <FaTimes />
            </button>
          </div>
        )}

        {showNewRoomInput && (
          <div className="new-input-bar">
            <input
              type="text"
              placeholder={t("Name of the new room...")}
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
              {isCreatingRoom ? t("Creating...") : t("Create")}
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowNewRoomInput(false);
                setNewRoomName("");
              }}
            >
              {t("Cancel")}
            </button>
          </div>
        )}

        {showNewCategoryInput && (
          <div className="new-input-bar">
            <input
              type="text"
              placeholder={t("Name of the new category...")}
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
              {isCreatingCategory ? t("Creating...") : t("Create")}
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategoryName("");
              }}
            >
              {t("Cancel")}
            </button>
          </div>
        )}

        {showNewStateInput && (
          <div className="new-input-bar">
            <input
              type="text"
              placeholder={t("Name of the new state...")}
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateState();
                if (e.key === "Escape") {
                  setShowNewStateInput(false);
                  setNewStateName("");
                }
              }}
              autoFocus
              maxLength={255}
            />
            <button
              className="btn-confirm"
              onClick={handleCreateState}
              disabled={isCreatingState || !newStateName.trim()}
            >
              {isCreatingState ? t("Creating...") : t("Create")}
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowNewStateInput(false);
                setNewStateName("");
              }}
            >
              {t("Cancel")}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">{t("Loading equipment...")}</div>
        ) : !hasContent ? (
          <div className="empty-state">
            <p>{t("No equipment or room registered.")}</p>
            <button className="btn-confirm" onClick={() => navigate("/create/equipment")}>
              {t("Register first equipment")}
            </button>
          </div>
        ) : (
          <div className="rooms-layout">
            {categories.length > 0 && (
              <div className="categories-section">
                <div className="categories-header">
                  <h2><FaTag className="category-icon" /> {t("Identification Categories")}</h2>
                </div>
                <div className="categories-list">
                  {categories.map((category) => (
                    <div key={category.id} className="category-item">
                      <span className="category-name">{category.name}</span>
                      <button
                        className="btn-icon btn-icon--primary btn-icon--sm"
                        onClick={() => handleEditCategory(category)}
                        title={t("Edit category")}
                      >
                        <FaPen />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {states.length > 0 && (
              <div className="categories-section states-section">
                <div className="categories-header">
                  <h2><FaClipboard className="category-icon" /> {t("Equipment States")}</h2>
                </div>
                <div className="categories-list">
                  {states.map((state) => (
                    <div key={state.id} className="category-item state-item">
                      <span className="category-name">{state.name}</span>
                      <button
                        className="btn-icon btn-icon--primary btn-icon--sm"
                        onClick={() => handleEditState(state)}
                        title={t("Edit state")}
                      >
                        <FaPen />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unassignedEquipment.length > 0 && (() => {
              const isCollapsed = collapsedRooms.has("unassigned");
              return (
                <div className="room-section">
                  <div className="room-header">
                    <h2
                      className="room-header-title"
                      onClick={() => toggleRoomCollapse("unassigned")}
                      role="button"
                      tabIndex={0}
                    >
                      <FaChevronDown className={`collapse-chevron ${isCollapsed ? "collapsed" : ""}`} />
                      {t("Unassigned")}
                    </h2>
                  </div>
                  {!isCollapsed && (
                    <div className="content-table-wrapper">
                      {renderEquipmentTable(
                        unassignedEquipment,
                        null,
                        null,
                        t("No equipment without room.")
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {sortedRooms.map((room) => {
              const roomEquipment = getEquipmentForRoom(room.id);
              const roomSections = getSectionsForRoom(room.id);
              const isRoomCollapsed = collapsedRooms.has(room.id);
              return (
                <div key={room.id} className="room-section">
                  <div className="room-header">
                    <h2
                      className="room-header-title"
                      onClick={() => toggleRoomCollapse(room.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <FaChevronDown className={`collapse-chevron ${isRoomCollapsed ? "collapsed" : ""}`} />
                      <FaDoorOpen className="room-icon" />
                      {room.name}
                    </h2>
                    <div className="room-header-actions">
                      <button
                        className="btn-icon btn-icon--primary btn-icons-sm"
                        onClick={() => setShowNewSectionInput(showNewSectionInput === room.id ? null : room.id)}
                        title={t("Add section")}
                      >
                        <FaLayerGroup />
                        <FaPlus className="icon-small" />
                      </button>
                      <button
                        className="btn-icon btn-icon--primary"
                        onClick={() => handleEditRoom(room)}
                        title={t("Edit room")}
                      >
                        <FaPen />
                      </button>
                    </div>
                  </div>

                  {!isRoomCollapsed && showNewSectionInput === room.id && (
                    <div className="new-input-bar">
                      <input
                        type="text"
                        placeholder={t("Name of the new section...")}
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateSection(room.id);
                          if (e.key === "Escape") {
                            setShowNewSectionInput(null);
                            setNewSectionName("");
                          }
                        }}
                        autoFocus
                        maxLength={255}
                      />
                      <button
                        className="btn-confirm"
                        onClick={() => handleCreateSection(room.id)}
                        disabled={isCreatingSection || !newSectionName.trim()}
                      >
                        {isCreatingSection ? t("Creating...") : t("Create")}
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setShowNewSectionInput(null);
                          setNewSectionName("");
                        }}
                      >
                        {t("Cancel")}
                      </button>
                    </div>
                  )}

                  {!isRoomCollapsed && (roomSections.length > 0 ? (
                    <div className="room-sections-container">
                      {(() => {
                        const noSectionCollapsed = collapsedSections.has(`${room.id}-none`);
                        return (
                          <div className="section-area">
                            <div
                              className="section-area-header"
                              onClick={() => toggleSectionCollapse(room.id, null)}
                              role="button"
                              tabIndex={0}
                            >
                              <FaChevronDown className={`collapse-chevron ${noSectionCollapsed ? "collapsed" : ""}`} />
                              <span className="section-area-title">{t("No section")}</span>
                            </div>
                            {!noSectionCollapsed && (
                              <div className="content-table-wrapper">
                                {renderEquipmentTable(
                                  getEquipmentForSection(room.id, null),
                                  room.id,
                                  null,
                                  t("Drag equipment to this area")
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {roomSections.map((section) => {
                        const sectionCollapsed = collapsedSections.has(`${room.id}-${section.id}`);
                        return (
                          <div key={section.id} className="section-area">
                            <div
                              className="section-area-header"
                              onClick={() => toggleSectionCollapse(room.id, section.id)}
                              role="button"
                              tabIndex={0}
                            >
                              <FaChevronDown className={`collapse-chevron ${sectionCollapsed ? "collapsed" : ""}`} />
                              <FaLayerGroup className="section-icon" />
                              <span className="section-area-title">{section.name}</span>
                              <button
                                className="btn-icon btn-icon--primary btn-icon--sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSection(section, room.name);
                                }}
                                title={t("Edit section")}
                              >
                                <FaPen />
                              </button>
                            </div>
                            {!sectionCollapsed && (
                              <div className="content-table-wrapper">
                                {renderEquipmentTable(
                                  getEquipmentForSection(room.id, section.id),
                                  room.id,
                                  section.id,
                                  t("Drag equipment to {{section}}", { section: section.name })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="content-table-wrapper">
                      {renderEquipmentTable(
                        roomEquipment,
                        room.id,
                        null,
                        t("Drag equipment to this room")
                      )}
                    </div>
                  ))}
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
