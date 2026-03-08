import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { listApprovedUsers, updateEquipment, deleteEquipment, listAllSections } from "helpers/api/content";
import type { Equipment, User, Room, IdentificationCategory, EquipmentState, RoomSection } from "helpers/api/content";
import { FaPen } from "react-icons/fa";

import { ModalsHandler } from "components/my-own-modal-handler";
import MultiSelect from "components/MultiSelect/MultiSelect";
import "pages/Manage/ManageContent.scss";

interface EquipmentEditorProps {
  equipment: Equipment;
  rooms: Room[];
  categories: IdentificationCategory[];
  states: EquipmentState[];
  sections?: RoomSection[];
  onConfirm: () => void;
  onCancel?: () => void;
}

const EquipmentEditor: React.FC<EquipmentEditorProps> = ({
  equipment,
  rooms,
  categories,
  states,
  sections: initialSections,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: equipment.name,
    custom_id: equipment.custom_id,
    observation: equipment.observation || "",
    selectedCategory: equipment.identification_category ? [equipment.identification_category] : [] as IdentificationCategory[],
    selectedState: equipment.equipment_state ? [equipment.equipment_state] : [] as EquipmentState[],
    selectedRoom: equipment.room ? [equipment.room] : [] as Room[],
    selectedSection: equipment.section ? [equipment.section] : [] as RoomSection[],
    selectedAssignedTo: equipment.assigned_to ? [equipment.assigned_to] : [] as User[],
  });
  const [isEditingObservation, setIsEditingObservation] = useState(!equipment.observation);
  const [selectedUsers, setSelectedUsers] = useState<
    Array<{ id: number; name: string; email?: string; profile_image?: string | null }>
  >(equipment.users || []);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [allSections, setAllSections] = useState<RoomSection[]>(initialSections || []);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const [usersResponse, sectionsResponse] = await Promise.all([
        listApprovedUsers(),
        !initialSections ? listAllSections() : Promise.resolve({ success: true, data: [] }),
      ]);
      if (usersResponse.success) {
        setAvailableUsers(usersResponse.data);
      }
      if (!initialSections && sectionsResponse.success) {
        setAllSections(sectionsResponse.data);
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (selected: Room[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoom: selected,
      selectedSection: [],
    }));
  };

  const handleSectionChange = (selected: RoomSection[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedSection: selected,
    }));
  };

  const availableSections = allSections.filter(
    (s) => formData.selectedRoom.length > 0 && s.room_id === formData.selectedRoom[0].id
  );

  const handleCategoryChange = (selected: IdentificationCategory[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategory: selected,
    }));
  };

  const handleStateChange = (selected: EquipmentState[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedState: selected,
    }));
  };

  const handleAssignedChange = (selected: User[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedAssignedTo: selected,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError(t("Name is required."));
      return;
    }
    if (!formData.custom_id.trim()) {
      setError(t("Equipment ID is required."));
      return;
    }

    setIsSaving(true);
    setError("");

    const payload: Record<string, any> = {
      name: formData.name,
      custom_id: formData.custom_id,
      observation: formData.observation,
      identification_category_id: formData.selectedCategory.length > 0 ? formData.selectedCategory[0].id : null,
      equipment_state_id: formData.selectedState.length > 0 ? formData.selectedState[0].id : null,
      room_id: formData.selectedRoom.length > 0 ? formData.selectedRoom[0].id : null,
      section_id: formData.selectedSection.length > 0 ? formData.selectedSection[0].id : null,
      assigned_to: formData.selectedAssignedTo.length > 0 ? formData.selectedAssignedTo[0].id : null,
      users: selectedUsers.map((u) => u.id),
    };

    const response = await updateEquipment(equipment.id, payload);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Equipment updated successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to update equipment."),
        type: "error",
      });
      setError(response.error || t("Failed to update equipment."));
    }
  };

  const handleToggleActive = async () => {
    setIsSaving(true);
    setError("");
    const response = await updateEquipment(equipment.id, {
      is_active: !equipment.is_active,
    });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: equipment.is_active
          ? t("Equipment deactivated!")
          : t("Equipment activated!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      setError(response.error || t("Failed to update equipment."));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t(`Are you sure you want to delete "{{name}}"?`, { name: equipment.name }))) return;

    setIsSaving(true);
    setError("");
    const response = await deleteEquipment(equipment.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Equipment deleted successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete equipment."),
        type: "error",
      });
      setError(response.error || t("Failed to delete equipment."));
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <div
      className="modal-overlay-shared"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-shared">
          <h2>{t("Edit Equipment")}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field observation-field">
            <label htmlFor="eq-observation">{t("Observation")}</label>
            {isEditingObservation ? (
              <textarea
                id="eq-observation"
                name="observation"
                value={formData.observation}
                onChange={(e) => setFormData((prev) => ({ ...prev, observation: e.target.value }))}
                placeholder={t("Add an observation about the equipment...")}
                rows={3}
                onBlur={() => {
                  if (formData.observation.trim()) {
                    setIsEditingObservation(false);
                  }
                }}
                autoFocus={!equipment.observation}
              />
            ) : (
              <div className="observation-display">
                <span className="observation-text">{formData.observation}</span>
                <button
                  type="button"
                  className="btn-icon btn-icon--primary"
                  onClick={() => setIsEditingObservation(true)}
                  title={t("Edit observation")}
                >
                  <FaPen />
                </button>
              </div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="eq-name">{t("Name")} *</label>
            <input
              id="eq-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("Equipment Name")}
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="eq-custom-id">{t("Equipment ID")} *</label>
            <input
              id="eq-custom-id"
              type="text"
              name="custom_id"
              value={formData.custom_id}
              onChange={handleChange}
              placeholder="Ex: mon_001"
              maxLength={100}
              required
            />
            <small className="field-hint">
              {t("Unique equipment identifier in the laboratory")}
            </small>
          </div>

          <div className="form-field">
            <MultiSelect
              label={t("Identification Category")}
              options={categories}
              selected={formData.selectedCategory}
              onChange={handleCategoryChange}
              singleSelect
              placeholder={t("None")}
            />
          </div>

          <div className="form-field">
            <MultiSelect
              label={t("Room")}
              options={rooms}
              selected={formData.selectedRoom}
              onChange={handleRoomChange}
              singleSelect
              placeholder={t("None")}
            />
          </div>

          {formData.selectedRoom.length > 0 && availableSections.length > 0 && (
            <div className="form-field">
              <MultiSelect
                label={t("Section")}
                options={availableSections}
                selected={formData.selectedSection}
                onChange={handleSectionChange}
                singleSelect
                placeholder={t("None")}
              />
            </div>
          )}

          <div className="form-field">
            <MultiSelect
              label={t("Equipment State")}
              options={states}
              selected={formData.selectedState}
              onChange={handleStateChange}
              singleSelect
              placeholder={t("None")}
            />
          </div>

          <div className="form-field">
            {isLoading ? (
              <p>{t("Loading users...")}</p>
            ) : (
              <MultiSelect
                label={t("Assigned To")}
                options={availableUsers.map((u) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  profile_image: u.profile_image || null,
                }))}
                selected={formData.selectedAssignedTo.map((u) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  profile_image: u.profile_image || null,
                }))}
                onChange={(selected) => handleAssignedChange(selected as User[])}
                singleSelect
                placeholder={t("None")}
              />
            )}
          </div>

          <div className="form-field">
            {isLoading ? (
              <p>{t("Loading users...")}</p>
            ) : (
              <MultiSelect
                label={t("Users")}
                options={availableUsers.map((u) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  profile_image: u.profile_image || null,
                }))}
                selected={selectedUsers}
                onChange={setSelectedUsers}
                placeholder={t("Select users...")}
              />
            )}
          </div>

          <div className="modal-actions">
            <div className="left-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={isSaving}
              >
                {t("Delete")}
              </button>
              <button
                type="button"
                className="btn-toggle"
                onClick={handleToggleActive}
                disabled={isSaving}
              >
                {equipment.is_active ? t("Deactivate") : t("Activate")}
              </button>
            </div>
            <div className="right-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                {t("Cancel")}
              </button>
              <button type="submit" className="btn-confirm" disabled={isSaving}>
                {isSaving ? t("Saving...") : t("Save")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentEditor;
