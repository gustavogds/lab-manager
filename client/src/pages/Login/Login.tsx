import { useNavigate, useLocation } from "react-router";

import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Login.scss";
import carouselLandingPage from "assets/images/img1.png";
import carouselSigninPage from "assets/images/img2.png";
import carouselSignupPage from "assets/images/img3.png";
import logo from "assets/images/logo.png";
import AuthHandler from "helpers/services/AuthHandler";
import { useState } from "react";
import { ModalsHandler } from "components/my-own-modal-handler";

const images = [carouselLandingPage, carouselSigninPage, carouselSignupPage];

const SignUp = ({ onSubmit }: { onSubmit: any }) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const email = event.target.email.value;
    const username = event.target.username.value;
    const name = event.target.name.value;
    const role = event.target.role.value;
    const password = event.target.password.value;
    const confirmPassword = event.target["password-confirm"].value;
    if (!email) {
      setErrors((state: any) => ({ ...state, email: "Email is required" }));
    } else {
      setErrors((state: any) => ({ ...state, email: null }));
    }
    if (!username) {
      setErrors((state: any) => ({
        ...state,
        username: "Username is required",
      }));
    } else {
      setErrors((state: any) => ({ ...state, username: null }));
    }
    if (!name) {
      setErrors((state: any) => ({ ...state, name: "Name is required" }));
    } else {
      setErrors((state: any) => ({ ...state, name: null }));
    }
    if (!role) {
      setErrors((state: any) => ({ ...state, role: "Role is required" }));
    } else {
      setErrors((state: any) => ({ ...state, role: null }));
    }
    if (!password) {
      setErrors((state: any) => ({
        ...state,
        password: "Password is required",
      }));
    } else {
      setErrors((state: any) => ({ ...state, password: null }));
    }
    if (password !== confirmPassword) {
      setErrors((state: any) => ({
        ...state,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((state: any) => ({ ...state, confirmPassword: null }));
    }
    if (
      errors.email ||
      errors.username ||
      errors.name ||
      errors.role ||
      errors.password ||
      errors.confirmPassword
    ) {
      return;
    }
    onSubmit({
      email,
      username,
      name,
      role,
      password,
      confirmPassword,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-header">
        <img
          src={logo}
          alt="Lab Manager"
          onClick={() => {
            navigate("/");
          }}
        />
      </div>
      <span className="divider"></span>
      <div className="form-group">
        <input
          type="text"
          id="email"
          className={`${errors.email ? "error" : ""}`}
          placeholder="E-mail"
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      <div className="form-group">
        <input
          type="text"
          id="username"
          className={`${errors.username ? "error" : ""}`}
          placeholder="Username"
        />
        {errors.username && (
          <span className="error-message">{errors.username}</span>
        )}
      </div>
      <div className="form-group">
        <input
          type="text"
          id="name"
          className={`${errors.name ? "error" : ""}`}
          placeholder="Name"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>
      <div className="form-group">
        <input
          type="password"
          id="password"
          className={`${errors.password ? "error" : ""}`}
          placeholder="Password"
        />
        {errors.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>
      <div className="form-group">
        <input
          type="password"
          id="password-confirm"
          className={`${errors.confirmPassword ? "error" : ""}`}
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>
      <div className="form-group">
        <select
          id="role"
          className={`${errors.role ? "error" : ""}`}
          defaultValue=""
        >
          <option value="" disabled>
            Select a role
          </option>
          <option value="professor">Professor</option>
          <option value="student">Student</option>
          <option value="collaborator">Collaborator</option>
        </select>
        {errors.role && <span className="error-message">{errors.role}</span>}
      </div>
      <span className="divider"></span>
      <div className="form-group">
        <button type="submit">Sign Up</button>
      </div>
    </form>
  );
};

const SignIn = ({ onSubmit }: { onSubmit: any }) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    if (!email) {
      setErrors((state: any) => ({ ...state, email: "Email is required" }));
    } else {
      setErrors((state: any) => ({ ...state, email: null }));
    }
    if (!password) {
      setErrors((state: any) => ({
        ...state,
        password: "Password is required",
      }));
    } else {
      setErrors((state: any) => ({ ...state, password: null }));
    }
    if (errors.email || errors.password) {
      return;
    }
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-header">
        <img
          src={logo}
          alt="Lab Manager"
          onClick={() => {
            navigate("/");
          }}
        />
      </div>
      <span className="divider"></span>
      <div className="form-group">
        <input
          type="text"
          className={`${errors.email ? "error" : ""}`}
          id="email"
          placeholder="E-mail or Username"
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      <div className="form-group">
        <input
          type="password"
          className={`${errors.password ? "error" : ""}`}
          id="password"
          placeholder="Password"
        />
        {errors.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>
      <span className="divider"></span>
      <div className="form-group">
        <button type="submit">Sign In</button>
      </div>
      <div className="forgot-password">
        <button
          onClick={() => {
            navigate("/password/reset");
          }}
        >
          Forgotten Password?
        </button>
      </div>
    </form>
  );
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <form>
      <div className="form-header">
        <img
          src={logo}
          alt="Life Pets"
          onClick={() => {
            navigate("/");
          }}
        />
      </div>
      <span className="divider"></span>
      <div className="form-group">
        <h4>Having trouble remembering your password?</h4>
        <p>
          Enter your username or email below and we'll send you a link to access
          your account again.
        </p>
      </div>
      <span className="divider"></span>
      <div className="form-group">
        <input type="text" id="email" placeholder="E-mail" />
      </div>
      <span className="divider"></span>
      <div className="form-group">
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

const Carousel = () => {
  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 10000,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
  };

  return (
    <Slider {...settings}>
      {images.map((image, index) => (
        <div key={index}>
          <img src={image} alt="" />
        </div>
      ))}
    </Slider>
  );
};

const SideInformation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let buttonText: string;
  let infoText: string;
  let buttonPath: string;

  if (location.pathname === "/password/reset") {
    infoText = "Remembered the password?";
    buttonText = "Sign In";
    buttonPath = "/signin";
  } else if (location.pathname === "/signup") {
    infoText = "Already have an account?";
    buttonText = "Sign In";
    buttonPath = "/signin";
  } else {
    infoText = "Don't have an account?";
    buttonText = "Sign Up";
    buttonPath = "/signup";
  }

  return (
    <div className="side-information">
      <div className="side-information-carousel">
        <Carousel />
      </div>
      <div className="side-information-header">
        <h2>Laboratory Manager</h2>
      </div>
      <div className="side-information-body">
        <p>Here you can manage you research laboratory.</p>
        <p>blah blah blah</p>
        <p>
          {infoText}{" "}
          <button
            onClick={() => {
              navigate(buttonPath);
            }}
          >
            <strong>{buttonText}</strong>
          </button>
        </p>
      </div>
    </div>
  );
};

const Login = ({
  isSignUp,
  isPasswordReset,
}: {
  isSignUp?: boolean;
  isPasswordReset?: boolean;
}) => {
  const onSubmit = async (data: any) => {
    if (isSignUp) {
      const result = await AuthHandler.register(
        data.email,
        data.username,
        data.name,
        data.password,
        data.confirmPassword,
        data.role
      );
      if (result.success) {
        window.location.href = "/";
      } else {
        ModalsHandler.createNotification({
          title: "Registration Failed",
          message: result.message,
          type: "error",
        });
      }
    } else {
      const result = await AuthHandler.login(data.email, data.password);
      if (result.success) {
        window.location.href = "/";
      } else {
        ModalsHandler.createNotification({
          title: "Login Failed",
          message: result.message,
          type: "error",
        });
      }
    }
  };

  let currentPage;
  if (isPasswordReset) {
    currentPage = <ForgotPassword />;
  } else {
    currentPage = isSignUp ? (
      <SignUp onSubmit={onSubmit} />
    ) : (
      <SignIn onSubmit={onSubmit} />
    );
  }

  return (
    <div className="login">
      <div className="login-body">
        <div className="body-section">
          <SideInformation />
        </div>
        <div className="body-section">{currentPage}</div>
      </div>
    </div>
  );
};

export default Login;
