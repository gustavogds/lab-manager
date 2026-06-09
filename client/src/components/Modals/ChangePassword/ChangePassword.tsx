import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "components/my-own-modal-handler";
import { changePassword } from "helpers/api/auth";
import "./ChangePassword.scss";

type ChangePasswordProps = {
  onConfirm?: () => void;
  onCancel?: () => void;
};

const ChangePassword = ({ onConfirm, onCancel }: ChangePasswordProps) => {
  const { t } = useTranslation();
  const [values, setValues] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    if (values.password !== values.confirmPassword) {
      setError(t("Passwords do not match."));
      return;
    }

    setSubmitting(true);
    const response = await changePassword(
      values.currentPassword,
      values.password,
      values.confirmPassword
    );
    setSubmitting(false);

    if (response.success) {
      onConfirm?.();
    } else {
      setError(translateError(response.code, response.error));
    }
  };

  // Map the backend's stable error codes to localized messages so the same
  // failure shows in the user's language.
  const translateError = (code?: string, fallback?: string): string => {
    switch (code) {
      case "current_password_required":
        return t("Current password is required.");
      case "new_password_required":
        return t("New password is required.");
      case "password_too_short":
        return t("The new password must be at least 6 characters.");
      case "passwords_do_not_match":
        return t("Passwords do not match.");
      case "current_password_incorrect":
        return t("Current password is incorrect.");
      default:
        return fallback || t("Failed to change password.");
    }
  };

  return (
    <Modal
      headerTitle={t("Change Password")}
      confirmLabel={t("Change Password")}
      cancelLabel={t("Cancel")}
      onConfirm={handleSubmit}
      onCancel={() => onCancel?.()}
      disableConfirm={submitting}
      className="change-password-modal"
    >
      <div slot="body">
        <form
          className="change-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {error && <div className="msg-error">{error}</div>}
          <div className="change-password-field">
            <label htmlFor="cp-current">{t("Current Password")}</label>
            <input
              id="cp-current"
              type="password"
              name="currentPassword"
              value={values.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
          <div className="change-password-field">
            <label htmlFor="cp-new">{t("New Password")}</label>
            <input
              id="cp-new"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          <div className="change-password-field">
            <label htmlFor="cp-confirm">{t("Confirm New Password")}</label>
            <input
              id="cp-confirm"
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          {/* Hidden submit keeps Enter-to-submit working inside the modal. */}
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
      </div>
    </Modal>
  );
};

export default ChangePassword;
