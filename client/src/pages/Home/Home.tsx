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
import { getLabSettings } from "helpers/api/settings";

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
  const [labSettings, setLabSettings] = useState<{ mission: string } | null>(
    null
  );

  const toggleNav = () => {
    setIsNavVisible((prev) => !prev);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const result = await getLabSettings();
      if (result.success) {
        setLabSettings(result.data);
      } else {
        setLabSettings({ mission: "Mission not available." });
      }
    };

    fetchSettings();
  }, []);

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
            {id === "about" ? (
              <p>{labSettings?.mission || "Loading mission..."}</p>
            ) : (
              <>
                <p>Content for {label} section...</p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry...
                </p>
              </>
            )}
          </section>
        ))}
      </main>
    </div>
  );
};

export default Home;
