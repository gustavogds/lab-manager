import { useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaLock, FaUser, FaIdBadge, FaEye, FaEyeSlash } from "react-icons/fa";

import "./Login.scss";
import Medias from "components/Medias/Medias";
import AuthHandler from "helpers/services/AuthHandler";
import { getLabSettings } from "helpers/api/settings";
import { validateInvitation } from "helpers/api/invitations";
import { ModalsHandler } from "components/my-own-modal-handler";

type InvitationData = {
  email: string;
  roles: string[];
  name: string;
  phone: string;
  lattes: string;
  bio: string;
} | null;

const SignUp = ({
  onSubmit,
  isLoading,
  invitationData,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  invitationData?: InvitationData;
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: invitationData?.email || "",
    username: "",
    name: invitationData?.name || "",
    role: invitationData?.roles?.[0] || "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = t("Email is required.");
    if (!formData.username.trim())
      newErrors.username = t("Username is required.");
    if (!formData.name.trim()) newErrors.name = t("Full name is required.");
    // Skip role validation if invitation provides roles
    if (!invitationData && !formData.role) newErrors.role = t("Select a role.");
    if (!formData.password) newErrors.password = t("Password is required.");
    else if (formData.password.length < 6)
      newErrors.password = t("Password must be at least 6 characters.");
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t("Passwords do not match.");
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      professor: t("Professor"),
      student: t("Student"),
      collaborator: t("Collaborator"),
      inventory_manager: t("Inventory Manager"),
    };
    return roleNames[role] || role;
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>{invitationData ? t("Complete Registration") : t("Create Account")}</h2>
      <p className="form-subtitle">
        {invitationData
          ? t("Complete your registration using the received invitation")
          : t("Fill in the data to register")}
      </p>

      {invitationData && (
        <div className="invitation-banner">
          <span>✉️ {t("You have been invited with the role:")} </span>
          <strong>{invitationData.roles.map(getRoleDisplayName).join(", ")}</strong>
        </div>
      )}

      <div className={`form-field ${errors.name ? "has-error" : ""}`}>
        <label htmlFor="name">{t("Full Name")}</label>
        <div className="input-wrapper">
          <FaUser className="input-icon" />
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("Your full name")}
          />
        </div>
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className={`form-field ${errors.email ? "has-error" : ""} ${invitationData ? "disabled" : ""}`}>
        <label htmlFor="email">{t("Email")}</label>
        <div className="input-wrapper">
          <FaEnvelope className="input-icon" />
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            disabled={!!invitationData}
            readOnly={!!invitationData}
          />
        </div>
        {errors.email && <span className="field-error">{errors.email}</span>}
        {invitationData && (
          <span className="field-hint">{t("Email defined by invitation")}</span>
        )}
      </div>

      <div className={`form-field ${errors.username ? "has-error" : ""}`}>
        <label htmlFor="username">{t("Username")}</label>
        <div className="input-wrapper">
          <FaIdBadge className="input-icon" />
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder={t("username")}
          />
        </div>
        {errors.username && (
          <span className="field-error">{errors.username}</span>
        )}
      </div>

      {!invitationData && (
        <div className={`form-field ${errors.role ? "has-error" : ""}`}>
          <label htmlFor="role">{t("Role")}</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="" disabled>
              {t("Select a role")}
            </option>
            <option value="professor">{t("Professor")}</option>
            <option value="student">{t("Student")}</option>
            <option value="collaborator">{t("Collaborator")}</option>
          </select>
          {errors.role && <span className="field-error">{errors.role}</span>}
        </div>
      )}

      <div className={`form-field ${errors.password ? "has-error" : ""}`}>
        <label htmlFor="password">{t("Password")}</label>
        <div className="input-wrapper">
          <FaLock className="input-icon" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder={t("Minimum 6 characters")}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.password && (
          <span className="field-error">{errors.password}</span>
        )}
      </div>

      <div className={`form-field ${errors.confirmPassword ? "has-error" : ""}`}>
        <label htmlFor="confirmPassword">{t("Confirm Password")}</label>
        <div className="input-wrapper">
          <FaLock className="input-icon" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t("Repeat the password")}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="field-error">{errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? t("Creating account...") : t("Create Account")}
      </button>
    </form>
  );
};

const VERIFIED_MESSAGES: Record<string, { title: string; message: string; type: "success" | "info" | "error" }> = {
  success: {
    title: "Email Verified",
    message: "Your email has been verified successfully! Wait for an administrator to approve your account.",
    type: "success",
  },
  expired: {
    title: "Expired Link",
    message: "The verification link has expired or is invalid. Create a new account to receive a new link.",
    type: "error",
  },
  invalid: {
    title: "Invalid Link",
    message: "The verification link is invalid.",
    type: "error",
  },
  already: {
    title: "Email Already Verified",
    message: "Your email has already been verified.",
    type: "info",
  },
};

const SignIn = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified && VERIFIED_MESSAGES[verified]) {
      ModalsHandler.createNotification(VERIFIED_MESSAGES[verified]);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim())
      newErrors.email = t("Email or username is required.");
    if (!formData.password) newErrors.password = t("Password is required.");
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>{t("Sign In")}</h2>
      <p className="form-subtitle">{t("Access your laboratory account")}</p>

      <div className={`form-field ${errors.email ? "has-error" : ""}`}>
        <label htmlFor="email">{t("Email or Username")}</label>
        <div className="input-wrapper">
          <FaEnvelope className="input-icon" />
          <input
            id="email"
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
          />
        </div>
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className={`form-field ${errors.password ? "has-error" : ""}`}>
        <label htmlFor="password">{t("Password")}</label>
        <div className="input-wrapper">
          <FaLock className="input-icon" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder={t("Your password")}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.password && (
          <span className="field-error">{errors.password}</span>
        )}
      </div>

      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? t("Signing in...") : t("Sign In")}
      </button>

      <button
        type="button"
        className="forgot-link"
        onClick={() => navigate("/password/reset")}
      >
        {t("Forgot your password?")}
      </button>
    </form>
  );
};

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSent(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>{t("Recover Password")}</h2>
      <p className="form-subtitle">
        {t("Enter your email and we will send you a link to reset your password")}
      </p>

      {sent ? (
        <div className="success-banner">
          {t("If the email is registered, you will receive a recovery link shortly.")}
        </div>
      ) : (
        <>
          <div className="form-field">
            <label htmlFor="reset-email">{t("Email")}</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {t("Send Link")}
          </button>
        </>
      )}
    </form>
  );
};

const Login = ({
  isSignUp,
  isPasswordReset,
}: {
  isSignUp?: boolean;
  isPasswordReset?: boolean;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [labLogo, setLabLogo] = useState("");
  const [labName, setLabName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationData>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [isValidatingInvitation, setIsValidatingInvitation] = useState(false);

  useEffect(() => {
    const fetchLab = async () => {
      const response = await getLabSettings();
      if (response.success) {
        if (response.data.logo) setLabLogo(response.data.logo);
        if (response.data.lab_name) setLabName(response.data.lab_name);
      }
    };
    fetchLab();
  }, []);

  useEffect(() => {
    const inviteToken = searchParams.get("invite");
    if (inviteToken && isSignUp) {
      setIsValidatingInvitation(true);
      validateInvitation(inviteToken).then((response) => {
        setIsValidatingInvitation(false);
        if (response.valid && response.data) {
          setInvitationData(response.data);
          setInvitationToken(inviteToken);
          setSearchParams({}, { replace: true });
        } else {
          ModalsHandler.createNotification({
            title: t("Invalid Invitation"),
            message: response.error || t("The invitation is not valid or has expired."),
            type: "error",
          });
          navigate("/signup");
        }
      });
    }
  }, [searchParams, isSignUp]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    if (isSignUp) {
      const result = await AuthHandler.register(
        data.email,
        data.username,
        data.name,
        data.password,
        data.confirmPassword,
        data.role,
        invitationToken || undefined
      );
      setIsLoading(false);
      if (result.success) {
        if (result.autoApproved) {
          ModalsHandler.createNotification({
            title: t("Account Created"),
            message: t("Your account has been created successfully! You can now log in."),
            type: "success",
          });
          setTimeout(() => {
            navigate("/signin");
          }, 2000);
        } else {
          ModalsHandler.createNotification({
            title: t("Account Created"),
            message:
              t("Your account has been created successfully! Check your email to activate your registration."),
            type: "success",
          });
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        }
      } else {
        ModalsHandler.createNotification({
          title: t("Registration Error"),
          message: result.message,
          type: "error",
        });
      }
    } else {
      const result = await AuthHandler.login(data.email, data.password);
      setIsLoading(false);
      if (result.success) {
        window.location.href = "/";
      } else {
        ModalsHandler.createNotification({
          title: t("Login Error"),
          message: result.message,
          type: "error",
        });
      }
    }
  };

  const isSignUpPage = !!isSignUp;

  let switchText: string;
  let switchLabel: string;
  let switchPath: string;

  if (isPasswordReset) {
    switchText = t("Remembered your password?");
    switchLabel = t("Sign In");
    switchPath = "/signin";
  } else if (isSignUpPage) {
    switchText = t("Already have an account?");
    switchLabel = t("Sign In");
    switchPath = "/signin";
  } else {
    switchText = t("Don't have an account?");
    switchLabel = t("Sign Up");
    switchPath = "/signup";
  }

  if (isValidatingInvitation) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <img
              src={labLogo || Medias.Logo}
              alt={labName || "Lab Manager"}
              onClick={() => navigate("/")}
            />
            {labName && <h1>{labName}</h1>}
          </div>
          <div className="login-form-area">
            <div className="loading-invitation">
              <p>{t("Validating invitation...")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img
            src={labLogo || Medias.Logo}
            alt={labName || "Lab Manager"}
            onClick={() => navigate("/")}
          />
          {labName && <h1>{labName}</h1>}
        </div>

        <div className="login-form-area">
          {isPasswordReset ? (
            <ForgotPassword />
          ) : isSignUpPage ? (
            <SignUp onSubmit={onSubmit} isLoading={isLoading} invitationData={invitationData} />
          ) : (
            <SignIn onSubmit={onSubmit} isLoading={isLoading} />
          )}
        </div>

        <div className="login-switch">
          <span>{switchText}</span>
          <button onClick={() => navigate(switchPath)}>{switchLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
