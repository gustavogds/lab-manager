import { useNavigate, useLocation } from "react-router";

import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Login.scss";
import carouselLandingPage from "assets/images/img1.png";
import carouselSigninPage from "assets/images/img2.png";
import carouselSignupPage from "assets/images/img3.png";
import logo from "assets/images/logo.png";
import api from "helpers/api";

const images = [carouselLandingPage, carouselSigninPage, carouselSignupPage];

const SignUp = ({ onSubmit }: { onSubmit: any }) => {
  const navigate = useNavigate();
  const handleSubmit = (event: any) => {
    event.preventDefault();
    onSubmit({
      email: event.target.email.value,
      password: event.target.password.value,
      username: event.target.username.value,
      name: event.target.name.value,
      confirmPassword: event.target["password-confirm"].value,
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
        <input type="text" id="email" placeholder="E-mail" />
      </div>
      <div className="form-group">
        <input type="text" id="username" placeholder="Username" />
      </div>
      <div className="form-group">
        <input type="text" id="name" placeholder="Full Name" />
      </div>
      <div className="form-group">
        <input type="password" id="password" placeholder="Password" />
      </div>
      <div className="form-group">
        <input
          type="password"
          id="password-confirm"
          placeholder="Confirm Password"
        />
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

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
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
        <input type="text" id="email" placeholder="E-mail or Username" />
      </div>
      <div className="form-group">
        <input type="password" id="password" placeholder="Password" />
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
  const navigate = useNavigate();
  const onSubmit = (data: any) => {
    if (isSignUp) {
      return api.auth.register(data).then((response: any) => {
        if (response.success) {
          navigate("/");
        } else {
          console.error(response);
        }
      });
    } else {
      return api.auth.login(data).then((response: any) => {
        if (response.success) {
          navigate("/");
        } else {
          console.error(response);
        }
      });
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
