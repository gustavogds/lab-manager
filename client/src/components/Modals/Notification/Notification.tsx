import "./Notification.scss";
import Icons from "components/Icons/Icons";

const QuestionMarkIcon = () => {
  return <>?</>;
};

const Notification = (config: any) => {
  let ICONS_MAPPING: Record<string, any>;

  try {
    ICONS_MAPPING = {
      success: Icons.CheckIcon,
      error: Icons.ErrorCircleIcon,
      warning: Icons.TriangleWarningIcon,
      info: Icons.InfoCircleIcon,
    };
  } catch (error) {
    console.warn(
      "Icons not found, using default icons. Please ensure Icons component is correctly imported."
    );
    ICONS_MAPPING = {
      success: QuestionMarkIcon,
      error: QuestionMarkIcon,
      warning: QuestionMarkIcon,
      info: QuestionMarkIcon,
    };
  }

  const Icon = ICONS_MAPPING[config.type];

  return (
    <div
      className={`notification ${config.type || "success"}`}
      onClick={() => config.onConfirm()}
    >
      <div className="notification-box">
        <div className="notification-icon">
          {config.icon ? <config.icon /> : <Icon />}
        </div>
        <div className="notification-content">
          <h3 className="notification-title">{config.title}</h3>
          <p className="notification-message">{config.message}</p>
        </div>
      </div>
      <div className="notification-timer">
        <div
          className="timer-bar"
          style={{ animationDuration: `${config.duration || 5000}ms` }}
          onAnimationEnd={() => config.onConfirm()}
        ></div>
      </div>
    </div>
  );
};

export default Notification;
