import Medias from "../../components/Medias/Medias";
import "./Home.scss";
import { useEffect, useState, useRef } from "react";
import {
  FaInfoCircle,
  FaMapMarkerAlt,
  FaFlask,
  FaProjectDiagram,
  FaUsers,
  FaHandshake,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const sections = [
  { id: "about", label: "About", icon: <FaInfoCircle /> },
  { id: "location", label: "Location", icon: <FaMapMarkerAlt /> },
  { id: "research", label: "Research Areas", icon: <FaFlask /> },
  { id: "projects", label: "Projects", icon: <FaProjectDiagram /> },
  { id: "researchers", label: "Researchers", icon: <FaUsers /> },
  { id: "partnerships", label: "Partnerships", icon: <FaHandshake /> },
  { id: "contact", label: "Contact", icon: <FaEnvelope /> },
];

const Home = () => {
  const [activeSection, setActiveSection] = useState<string>("about");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isNavVisible, setIsNavVisible] = useState(true);

  const toggleNav = () => {
    setIsNavVisible((prev) => !prev);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection?.target.id) {
          setActiveSection(visibleSection.target.id);
        }
      },
      {
        rootMargin: "0px",
        threshold: 0.25,
      }
    );

    sections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) {
        sectionRefs.current[id] = section;
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`home ${isNavVisible ? "nav-visible" : "nav-hidden"}`}>
      <button className="toggle-nav" onClick={toggleNav}>
        {isNavVisible ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
      <nav className="side-nav">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={activeSection === section.id ? "active" : ""}
          >
            <span className="icon">{section.icon}</span>
            <span className="label">{section.label}</span>
            <span className="tooltip">{section.label}</span>
          </a>
        ))}
      </nav>

      <main className="content">
        {sections.map(({ id, label }) => (
          <section key={id} id={id}>
            <h2>{label}</h2>
            <p>Content for {label} section...</p>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and
              typesetting industry. Lorem Ipsum has been the industry's standard
              dummy text ever since the 1500s, when an unknown printer took a
              galley of type and scrambled it to make a type specimen book. It
              has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </p>
          </section>
        ))}
      </main>
    </div>
  );
};

export default Home;
