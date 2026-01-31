import "./Home.scss";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
  FaEdit,
  FaPlus,
  FaTrash,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { getLabSettings, saveLabSettings } from "helpers/api/settings";
import { 
  listResearchAreas, 
  updateResearchArea,
  deleteResearchArea,
  type ResearchArea 
} from "helpers/api/content";
import { useGlobalData } from "helpers/context/globalContext";
import { isEmptyObject } from "helpers/utils";
import { ModalsHandler } from "components/my-own-modal-handler";
import type { SectionEditorField } from "components/Modals/SectionEditor/SectionEditor";

const sections = [
  { id: "about", label: "Sobre", icon: <FaInfoCircle /> },
  { id: "research", label: "Áreas de Pesquisa", icon: <FaFlask /> },
  { id: "projects", label: "Projetos", icon: <FaProjectDiagram /> },
  { id: "researchers", label: "Pesquisadores", icon: <FaUsers /> },
  { id: "partnerships", label: "Parcerias", icon: <FaHandshake /> },
  { id: "contact", label: "Contato", icon: <FaEnvelope /> },
  { id: "location", label: "Localização", icon: <FaMapMarkerAlt /> },
];

const sectionDescriptions: Record<string, string> = {
  location: "Informacoes sobre a localizacao, endereco e como chegar.",
  research: "Resumo das principais linhas e areas de pesquisa do laboratorio.",
  projects: "Lista e descricao dos projetos em andamento e concluidos.",
  researchers: "Equipe, perfis dos pesquisadores e estudantes envolvidos.",
  partnerships: "Instituicoes parceiras e colaboracoes estrategicas.",
  contact: "Canais de contato, redes sociais e formulario de mensagem.",
};

type LabSettings = {
  mission?: string;
  address?: string;
  city?: string;
  areas?: string;
  highlights?: string;
  lead?: string;
  team?: string;
  partners?: string;
  email?: string;
  phone?: string;
  about_images?: Array<{ id: number; image: string; order: number }>;
};

const Home = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("about");
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [labSettings, setLabSettings] = useState<LabSettings | null>(null);
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const hashNavTimeout = useRef<number | null>(null);
  const { user }: any = useGlobalData();
  const isProfessor = !isEmptyObject(user.state) && user.state.role === "professor";
  const sectionEditors: Record<
    string,
    {
      title: string;
      fields: SectionEditorField[];
      getInitialValues?: (settings: LabSettings | null) => Record<string, string>;
      onSave?: (values: Record<string, string>) => Promise<{ success: boolean }>;
    }
  > = {
    about: {
      title: "Editar sobre",
      fields: [
        {
          name: "mission",
          label: "Missão",
          type: "textarea",
          placeholder: "Descreva a missão do laboratório",
          rows: 6,
        },
        {
          name: "images",
          label: "Imagens",
          type: "image-upload",
        },
      ],
      getInitialValues: (settings) => ({
        mission: settings?.mission || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({ mission: values.mission });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            mission: values.mission,
          }));
        }
        return response;
      },
    },
    location: {
      title: "Editar localização",
      fields: [
        {
          name: "address",
          label: "Endereço",
          type: "text",
          placeholder: "Rua, número, bairro",
        },
        {
          name: "city",
          label: "Cidade",
          type: "text",
          placeholder: "Cidade e estado",
        },
      ],
      getInitialValues: (settings) => ({
        address: settings?.address || "",
        city: settings?.city || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({
          address: values.address,
          city: values.city,
        });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            address: values.address,
            city: values.city,
          }));
        }
        return response;
      },
    },
    research: {
      title: "Editar áreas de pesquisa",
      fields: [
        {
          name: "areas",
          label: "Áreas principais",
          type: "textarea",
          placeholder: "Liste as principais áreas de pesquisa",
          rows: 5,
        },
      ],
      getInitialValues: (settings) => ({
        areas: settings?.areas || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({ areas: values.areas });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            areas: values.areas,
          }));
        }
        return response;
      },
    },
    projects: {
      title: "Editar projetos",
      fields: [
        {
          name: "highlights",
          label: "Projetos em destaque",
          type: "textarea",
          placeholder: "Descreva os projetos principais",
          rows: 5,
        },
      ],
      getInitialValues: (settings) => ({
        highlights: settings?.highlights || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({ highlights: values.highlights });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            highlights: values.highlights,
          }));
        }
        return response;
      },
    },
    researchers: {
      title: "Editar pesquisadores",
      fields: [
        {
          name: "lead",
          label: "Responsável",
          type: "text",
          placeholder: "Nome do responsável",
        },
        {
          name: "team",
          label: "Equipe",
          type: "textarea",
          placeholder: "Nomes e funcoes",
          rows: 5,
        },
      ],
      getInitialValues: (settings) => ({
        lead: settings?.lead || "",
        team: settings?.team || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({
          lead: values.lead,
          team: values.team,
        });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            lead: values.lead,
            team: values.team,
          }));
        }
        return response;
      },
    },
    partnerships: {
      title: "Editar parcerias",
      fields: [
        {
          name: "partners",
          label: "Instituicoes",
          type: "textarea",
          placeholder: "Liste as instituicoes parceiras",
          rows: 4,
        },
      ],
      getInitialValues: (settings) => ({
        partners: settings?.partners || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({ partners: values.partners });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            partners: values.partners,
          }));
        }
        return response;
      },
    },
    contact: {
      title: "Editar contato",
      fields: [
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "contato@laboratorio.com",
        },
        {
          name: "phone",
          label: "Telefone",
          type: "tel",
          placeholder: "(00) 00000-0000",
        },
      ],
      getInitialValues: (settings) => ({
        email: settings?.email || "",
        phone: settings?.phone || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({
          email: values.email,
          phone: values.phone,
        });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            email: values.email,
            phone: values.phone,
          }));
        }
        return response;
      },
    },
  };

  const toggleNav = () => {
    setIsNavVisible((prev) => !prev);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const result = await getLabSettings();
      if (result.success) {
        setLabSettings(result.data);
      } else {
        setLabSettings({ mission: "Missao nao disponivel." });
      }
    };

    const fetchResearchAreas = async () => {
      const result = await listResearchAreas();
      if (result.success) {
        setResearchAreas(result.data);
      }
    };

    fetchSettings();
    fetchResearchAreas();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && sections.some((s) => s.id === hash)) {
        setActiveSection(hash);

        if (hashNavTimeout.current) {
          clearTimeout(hashNavTimeout.current);
        }

        hashNavTimeout.current = setTimeout(() => {
          hashNavTimeout.current = null;
        }, 500);
      } else if (!hash) {
        setActiveSection("about");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const openSectionEditor = async (sectionId: string) => {
    const editor = sectionEditors[sectionId];
    if (!editor) {
      return;
    }

    const initialValues = editor.getInitialValues
      ? editor.getInitialValues(labSettings)
      : {};

    const { promise } = ModalsHandler.createModal("SectionEditor", {
      headerTitle: editor.title,
      fields: editor.fields,
      initialValues,
      images: labSettings?.about_images || [],
      onImagesChange: (images: Array<{ id: number; image: string; order: number }>) => {
        setLabSettings((prev) => ({
          ...(prev || {}),
          about_images: images,
        }));
      },
      confirmLabel: "Salvar",
      cancelLabel: "Cancelar",
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    if (editor.onSave) {
      await editor.onSave(result as Record<string, string>);
    }
  };

  const openResearchAreaEditor = async (area: ResearchArea) => {
    const { promise } = ModalsHandler.createModal("SectionEditor", {
      headerTitle: "Editar Área de Pesquisa",
      fields: [
        {
          name: "title",
          label: "Título",
          type: "text",
          placeholder: "Ex: Inteligência Artificial",
          required: true,
        },
        {
          name: "description",
          label: "Descrição",
          type: "textarea",
          placeholder: "Descreva a área de pesquisa...",
          rows: 6,
          required: true,
        },
      ],
      initialValues: {
        title: area.title,
        description: area.description,
      },
      confirmLabel: "Salvar",
      cancelLabel: "Cancelar",
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const values = result as Record<string, string>;
    const response = await updateResearchArea(area.id, {
      title: values.title,
      description: values.description,
    });

    if (response.success) {
      setResearchAreas((prev) =>
        prev.map((a) =>
          a.id === area.id
            ? { ...a, title: values.title, description: values.description }
            : a
        )
      );

      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Área de pesquisa atualizada com sucesso!",
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.message || "Falha ao atualizar área de pesquisa.",
        type: "error",
      });
    }
  };

  const handleDeleteResearchArea = async (area: ResearchArea) => {
    const { promise } = ModalsHandler.createModal("Notification", {
      title: "Confirmar exclusão",
      message: `Tem certeza que deseja excluir a área "${area.title}"?`,
      type: "warning",
      confirmLabel: "Excluir",
      cancelLabel: "Cancelar",
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const response = await deleteResearchArea(area.id);

    if (response.success) {
      setResearchAreas((prev) => prev.filter((a) => a.id !== area.id));

      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Área de pesquisa excluída com sucesso!",
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir área de pesquisa.",
        type: "error",
      });
    }
  };

  const handleToggleResearchAreaVisibility = async (area: ResearchArea) => {
    const newStatus = !area.is_active;
    const response = await updateResearchArea(area.id, {
      is_active: newStatus,
    });

    if (response.success) {
      setResearchAreas((prev) =>
        prev.map((a) =>
          a.id === area.id ? { ...a, is_active: newStatus } : a
        )
      );

      ModalsHandler.createNotification({
        title: "Sucesso",
        message: newStatus
          ? "Área de pesquisa ativada!"
          : "Área de pesquisa desativada!",
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.message || "Falha ao atualizar visibilidade.",
        type: "error",
      });
    }
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "about":
        const sliderSettings = {
          dots: true,
          infinite: true,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 5000,
          arrows: true,
          adaptiveHeight: true,
        };

        return (
          <>
            <p>{labSettings?.mission || "Carregando missão..."}</p>
            {labSettings?.about_images && labSettings.about_images.length > 0 && (
              <div className="about-carousel">
                <Slider {...sliderSettings}>
                  {labSettings.about_images.map((image) => (
                    <div key={image.id} className="carousel-slide">
                      <img src={image.image} alt={`About ${image.order}`} />
                    </div>
                  ))}
                </Slider>
              </div>
            )}
          </>
        );
      case "location":
        return (
          <>
            {labSettings?.address && <p>{labSettings.address}</p>}
            {labSettings?.city && <p>{labSettings.city}</p>}
            {!labSettings?.address && !labSettings?.city && (
              <p>{sectionDescriptions[sectionId]}</p>
            )}
          </>
        );
      case "research":
        return (
          <div className="research-areas-section">
            {researchAreas.length > 0 ? (
              <div className="research-areas-list">
                {researchAreas.map((area) => (
                  <div key={area.id} className="research-area-card">
                    <div className="card-content">
                      <h3>{area.title}</h3>
                      <p>{area.description}</p>
                    </div>
                    {isProfessor && (
                      <div className="card-actions">
                        <button
                          className="toggle-btn"
                          onClick={() => handleToggleResearchAreaVisibility(area)}
                          title={area.is_active ? "Esconder" : "Mostrar"}
                        >
                          {area.is_active ? <FaEye /> : <FaEyeSlash />}
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() => openResearchAreaEditor(area)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteResearchArea(area)}
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>
                {isProfessor
                  ? "Nenhuma área de pesquisa cadastrada. Clique no botão + para adicionar."
                  : "Nenhuma área de pesquisa disponível no momento."}
              </p>
            )}
            {isProfessor && (
              <button
                className="add-research-area-btn"
                onClick={() => navigate("/create/research-area")}
              >
                <FaPlus /> Adicionar Área de Pesquisa
              </button>
            )}
          </div>
        );
      case "projects":
        return <p>{labSettings?.highlights || sectionDescriptions[sectionId]}</p>;
      case "researchers":
        return (
          <>
            {labSettings?.lead && <p><strong>Responsável:</strong> {labSettings.lead}</p>}
            {labSettings?.team && <p>{labSettings.team}</p>}
            {!labSettings?.lead && !labSettings?.team && (
              <p>{sectionDescriptions[sectionId]}</p>
            )}
          </>
        );
      case "partnerships":
        return <p>{labSettings?.partners || sectionDescriptions[sectionId]}</p>;
      case "contact":
        return (
          <>
            {labSettings?.email && <p><strong>Email:</strong> {labSettings.email}</p>}
            {labSettings?.phone && <p><strong>Telefone:</strong> {labSettings.phone}</p>}
            {!labSettings?.email && !labSettings?.phone && (
              <p>{sectionDescriptions[sectionId]}</p>
            )}
          </>
        );
      default:
        return <p>{sectionDescriptions[sectionId] || "Conteúdo em construção."}</p>;
    }
  };

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
            <div className="section-header">
              <h2>{label}</h2>
              {isProfessor && id !== "research" && (
                <button
                  className="section-edit"
                  type="button"
                  onClick={() => openSectionEditor(id)}
                >
                  <FaEdit />
                  Editar
                </button>
              )}
            </div>
            {renderSectionContent(id)}
          </section>
        ))}
      </main>
    </div>
  );
};

export default Home;
