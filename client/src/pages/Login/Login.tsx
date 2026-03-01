import { useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaUser, FaIdBadge, FaEye, FaEyeSlash } from "react-icons/fa";

import "./Login.scss";
import Medias from "components/Medias/Medias";
import AuthHandler from "helpers/services/AuthHandler";
import { getLabSettings } from "helpers/api/settings";
import { ModalsHandler } from "components/my-own-modal-handler";

const SignUp = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    name: "",
    role: "",
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
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório.";
    if (!formData.username.trim())
      newErrors.username = "Nome de usuário é obrigatório.";
    if (!formData.name.trim()) newErrors.name = "Nome completo é obrigatório.";
    if (!formData.role) newErrors.role = "Selecione uma função.";
    if (!formData.password) newErrors.password = "Senha é obrigatória.";
    else if (formData.password.length < 6)
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "As senhas não coincidem.";
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
      <h2>Criar Conta</h2>
      <p className="form-subtitle">Preencha os dados para se cadastrar</p>

      <div className={`form-field ${errors.name ? "has-error" : ""}`}>
        <label htmlFor="name">Nome Completo</label>
        <div className="input-wrapper">
          <FaUser className="input-icon" />
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Seu nome completo"
          />
        </div>
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className={`form-field ${errors.email ? "has-error" : ""}`}>
        <label htmlFor="email">E-mail</label>
        <div className="input-wrapper">
          <FaEnvelope className="input-icon" />
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
          />
        </div>
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className={`form-field ${errors.username ? "has-error" : ""}`}>
        <label htmlFor="username">Nome de Usuário</label>
        <div className="input-wrapper">
          <FaIdBadge className="input-icon" />
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="nome_de_usuario"
          />
        </div>
        {errors.username && (
          <span className="field-error">{errors.username}</span>
        )}
      </div>

      <div className={`form-field ${errors.role ? "has-error" : ""}`}>
        <label htmlFor="role">Função</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="" disabled>
            Selecione uma função
          </option>
          <option value="professor">Professor</option>
          <option value="student">Estudante</option>
          <option value="collaborator">Colaborador</option>
        </select>
        {errors.role && <span className="field-error">{errors.role}</span>}
      </div>

      <div className={`form-field ${errors.password ? "has-error" : ""}`}>
        <label htmlFor="password">Senha</label>
        <div className="input-wrapper">
          <FaLock className="input-icon" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
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
        <label htmlFor="confirmPassword">Confirmar Senha</label>
        <div className="input-wrapper">
          <FaLock className="input-icon" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repita a senha"
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
        {isLoading ? "Criando conta..." : "Criar Conta"}
      </button>
    </form>
  );
};

const VERIFIED_MESSAGES: Record<string, { title: string; message: string; type: "success" | "info" | "error" }> = {
  success: {
    title: "E-mail Verificado",
    message: "Seu e-mail foi verificado com sucesso! Aguarde a aprovação de um administrador para acessar sua conta.",
    type: "success",
  },
  expired: {
    title: "Link Expirado",
    message: "O link de verificação expirou ou é inválido. Crie uma nova conta para receber um novo link.",
    type: "error",
  },
  invalid: {
    title: "Link Inválido",
    message: "O link de verificação é inválido.",
    type: "error",
  },
  already: {
    title: "E-mail Já Verificado",
    message: "Seu e-mail já foi verificado anteriormente.",
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
      newErrors.email = "E-mail ou nome de usuário é obrigatório.";
    if (!formData.password) newErrors.password = "Senha é obrigatória.";
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
      <h2>Entrar</h2>
      <p className="form-subtitle">Acesse sua conta do laboratório</p>

      <div className={`form-field ${errors.email ? "has-error" : ""}`}>
        <label htmlFor="email">E-mail ou Nome de Usuário</label>
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
        <label htmlFor="password">Senha</label>
        <div className="input-wrapper">
          <FaLock className="input-icon" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Sua senha"
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
        {isLoading ? "Entrando..." : "Entrar"}
      </button>

      <button
        type="button"
        className="forgot-link"
        onClick={() => navigate("/password/reset")}
      >
        Esqueceu sua senha?
      </button>
    </form>
  );
};

const ForgotPassword = () => {
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
      <h2>Recuperar Senha</h2>
      <p className="form-subtitle">
        Informe seu e-mail e enviaremos um link para redefinir sua senha
      </p>

      {sent ? (
        <div className="success-banner">
          Se o e-mail estiver cadastrado, você receberá um link de recuperação em
          breve.
        </div>
      ) : (
        <>
          <div className="form-field">
            <label htmlFor="reset-email">E-mail</label>
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
            Enviar Link
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
  const navigate = useNavigate();
  const [labLogo, setLabLogo] = useState("");
  const [labName, setLabName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    if (isSignUp) {
      const result = await AuthHandler.register(
        data.email,
        data.username,
        data.name,
        data.password,
        data.confirmPassword,
        data.role
      );
      setIsLoading(false);
      if (result.success) {
        ModalsHandler.createNotification({
          title: "Conta Criada",
          message:
            "Sua conta foi criada com sucesso! Verifique seu e-mail para ativar o cadastro.",
          type: "success",
        });
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        ModalsHandler.createNotification({
          title: "Erro no Cadastro",
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
          title: "Erro no Login",
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
    switchText = "Lembrou a senha?";
    switchLabel = "Entrar";
    switchPath = "/signin";
  } else if (isSignUpPage) {
    switchText = "Já possui uma conta?";
    switchLabel = "Entrar";
    switchPath = "/signin";
  } else {
    switchText = "Não possui uma conta?";
    switchLabel = "Cadastrar";
    switchPath = "/signup";
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
            <SignUp onSubmit={onSubmit} isLoading={isLoading} />
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
