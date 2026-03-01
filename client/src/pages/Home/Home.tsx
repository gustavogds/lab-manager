import "./Home.scss";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
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
  listProjects,
  updateProject,
  deleteProject,
  listResearchers,
  listAllResearchers,
  updateResearchersConfig,
  listPartnerships,
  listAllPartnerships,
  updatePartnershipsConfig,
  deletePartnership,
  type ResearchArea,
  type Project,
  type Researcher,
  type Partnership,
} from "helpers/api/content";
import ResearcherCard from "components/ResearcherCard/ResearcherCard";
import PartnershipBadge from "components/PartnershipBadge/PartnershipBadge";
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
  { id: "contact-location", label: "Contato & Localização", icon: <FaEnvelope /> },
];

const sectionDescriptions: Record<string, string> = {
  research: "Resumo das principais linhas e areas de pesquisa do laboratorio.",
  projects: "Lista e descricao dos projetos em andamento e concluidos.",
  researchers: "Equipe, perfis dos pesquisadores e estudantes envolvidos.",
  partnerships: "Instituicoes parceiras e colaboracoes estrategicas.",
  "contact-location": "Informacoes de contato e localizacao do laboratorio.",
};

type LabSettings = {
  mission?: string;
  address?: string;
  address_details?: string;
  maps_link?: string;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [allResearchers, setAllResearchers] = useState<Researcher[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [allPartnerships, setAllPartnerships] = useState<Partnership[]>([]);
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
    location: {
      title: "Editar localização",
      fields: [
        {
          name: "address",
          label: "Endereço",
          type: "textarea",
          placeholder: "Endereço completo (rua, número, bairro, cidade, estado, CEP)",
          rows: 3,
        },
        {
          name: "address_details",
          label: "Outras informações",
          type: "text",
          placeholder: "Ex: Quarto andar, salas 403-406",
        },
        {
          name: "maps_link",
          label: "Link do Google Maps",
          type: "text",
          placeholder: "https://maps.google.com/...",
        },
      ],
      getInitialValues: (settings) => ({
        address: settings?.address || "",
        address_details: settings?.address_details || "",
        maps_link: settings?.maps_link || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({
          address: values.address,
          address_details: values.address_details,
          maps_link: values.maps_link,
        });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            address: values.address,
            address_details: values.address_details,
            maps_link: values.maps_link,
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

    const fetchProjects = async () => {
      const result = await listProjects();
      if (result.success) {
        setProjects(result.data);
      }
    };

    const fetchResearchers = async () => {
      const result = await listResearchers();
      if (result.success) {
        setResearchers(result.data);
      }
    };

    const fetchAllResearchers = async () => {
      const result = await listAllResearchers();
      if (result.success) {
        setAllResearchers(result.data);
      }
    };

    const fetchPartnerships = async () => {
      const result = await listPartnerships();
      if (result.success) {
        setPartnerships(result.data);
      }
    };

    const fetchAllPartnerships = async () => {
      const result = await listAllPartnerships();
      if (result.success) {
        setAllPartnerships(result.data);
      }
    };

    fetchSettings();
    fetchResearchAreas();
    fetchProjects();
    fetchResearchers();
    fetchPartnerships();
    if (isProfessor) {
      fetchAllResearchers();
      fetchAllPartnerships();
    }
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

  const openProjectEditor = async (project: Project) => {
    const { promise } = ModalsHandler.createModal("ProjectEditor", {
      project,
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const values = result as {
      title: string;
      description: string;
      members: any[];
    };
    const response = await updateProject(project.id, {
      title: values.title,
      description: values.description,
      members: values.members.map((m: any) => m.id),
    } as any);

    if (response.success) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                title: values.title,
                description: values.description,
                members: values.members,
              }
            : p
        )
      );

      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Projeto atualizado com sucesso!",
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.message || "Falha ao atualizar projeto.",
        type: "error",
      });
    }
  };

  const handleDeleteProject = async (project: Project) => {
    const { promise } = ModalsHandler.createModal("Notification", {
      title: "Confirmar exclusão",
      message: `Tem certeza que deseja excluir o projeto "${project.title}"?`,
      type: "warning",
      confirmLabel: "Excluir",
      cancelLabel: "Cancelar",
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const response = await deleteProject(project.id);

    if (response.success) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));

      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Projeto excluído com sucesso!",
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir projeto.",
        type: "error",
      });
    }
  };

  const handleToggleProjectVisibility = async (project: Project) => {
    const newStatus = !project.is_active;
    const response = await updateProject(project.id, {
      is_active: newStatus,
    });

    if (response.success) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, is_active: newStatus } : p
        )
      );

      ModalsHandler.createNotification({
        title: "Sucesso",
        message: newStatus
          ? "Projeto ativado!"
          : "Projeto desativado!",
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

  const openProjectDetails = async (project: Project) => {
    const { promise } = ModalsHandler.createModal("ProjectDetails", {
      project: project,
    });

    await promise;
  };

  const openResearcherDetails = async (researcher: Researcher) => {
    const researcherProjects = projects.filter((project) =>
      project.members.some((member) => member.id === researcher.id)
    );

    const { promise } = ModalsHandler.createModal("ResearcherDetails", {
      researcher,
      projects: researcherProjects,
    });

    await promise;
  };

  const openResearchersEditor = async () => {
    const { promise } = ModalsHandler.createModal("ResearchersEditor", {
      researchers: allResearchers,
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const configData = result as Array<{ id: number; order: number; show: boolean; is_former_member: boolean }>;
    const response = await updateResearchersConfig(configData);

    if (response.success) {
      const researchersResult = await listResearchers();
      if (researchersResult.success) {
        setResearchers(researchersResult.data);
      }

      const allResearchersResult = await listAllResearchers();
      if (allResearchersResult.success) {
        setAllResearchers(allResearchersResult.data);
      }

      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Configuração dos pesquisadores atualizada!",
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.message || "Falha ao atualizar configuração.",
        type: "error",
      });
    }
  };

  const openPartnershipsEditor = async () => {
    const { promise } = ModalsHandler.createModal("PartnershipsEditor", {
      partnerships: allPartnerships,
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const configData = result as Array<{
      id: number;
      order: number;
      is_active: boolean;
      deleted: boolean;
    }>;

    const toDelete = configData.filter((p) => p.deleted);
    const toUpdate = configData.filter((p) => !p.deleted);

    for (const p of toDelete) {
      await deletePartnership(p.id);
    }

    if (toUpdate.length > 0) {
      await updatePartnershipsConfig(
        toUpdate.map((p) => ({
          id: p.id,
          order: p.order,
          is_active: p.is_active,
        }))
      );
    }

    const partnershipsResult = await listPartnerships();
    if (partnershipsResult.success) {
      setPartnerships(partnershipsResult.data);
    }

    const allPartnershipsResult = await listAllPartnerships();
    if (allPartnershipsResult.success) {
      setAllPartnerships(allPartnershipsResult.data);
    }

    ModalsHandler.createNotification({
      title: "Sucesso",
      message: "Parcerias atualizadas!",
      type: "success",
    });
  };

  function Arrow(props: any) {
    const { className, onClick, direction } = props;

    return (
      <button
        type="button"
        className={`${className} about-arrow about-arrow--${direction}`}
        onClick={onClick}
        aria-label={direction === "next" ? "Next" : "Previous"}
      >
        <span aria-hidden="true">{direction === "next" ? "›" : "‹"}</span>
      </button>
    );
  }

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "about":
        const sliderSettings = {
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 5000,
          arrows: true,
          adaptiveHeight: true,
          nextArrow: <Arrow direction="next" />,
          prevArrow: <Arrow direction="prev" />,
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
      case "research":
        return (
          <div className="research-areas-section">
            {researchAreas.length > 0 ? (
              <div className="research-areas-list">
                {researchAreas.map((area) => (
                  <div key={area.id} className="content-card">
                    <div className="card-content">
                      <h3>{area.title}</h3>
                      <p>{area.description}</p>
                    </div>
                    {isProfessor && (
                      <div className="card-actions">
                        <button
                          className="btn-icon btn-icon--primary"
                          onClick={() => handleToggleResearchAreaVisibility(area)}
                          title={area.is_active ? "Esconder" : "Mostrar"}
                        >
                          {area.is_active ? <FaEye /> : <FaEyeSlash />}
                        </button>
                        <button
                          className="btn-icon btn-icon--primary"
                          onClick={() => openResearchAreaEditor(area)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-icon--danger"
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
                className="btn-add"
                onClick={() => navigate("/create/research-area")}
              >
                <FaPlus /> Adicionar Área de Pesquisa
              </button>
            )}
          </div>
        );
      case "projects":
        return (
          <div className="projects-section">
            {projects.length > 0 ? (
              <div className="projects-list">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="content-card clickable"
                    onClick={() => openProjectDetails(project)}
                  >
                    <div className="card-content">
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                    </div>
                    {isProfessor && (
                      <div className="card-actions">
                        <button
                          className="btn-icon btn-icon--primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleProjectVisibility(project);
                          }}
                          title={project.is_active ? "Esconder" : "Mostrar"}
                        >
                          {project.is_active ? <FaEye /> : <FaEyeSlash />}
                        </button>
                        <button
                          className="btn-icon btn-icon--primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectEditor(project);
                          }}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-icon--danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
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
                  ? "Nenhum projeto cadastrado. Clique no botão + para adicionar."
                  : "Nenhum projeto disponível no momento."}
              </p>
            )}
            {isProfessor && (
              <button
                className="btn-add"
                onClick={() => navigate("/create/project")}
              >
                <FaPlus /> Adicionar Projeto
              </button>
            )}
          </div>
        );
      case "researchers":
        const currentResearchers = researchers.filter((r) => !r.is_former_member);
        const formerResearchers = researchers.filter((r) => r.is_former_member);
        return (
          <div className="researchers-section">
            {currentResearchers.length > 0 ? (
              <div className="researchers-grid">
                {currentResearchers.map((researcher) => (
                  <ResearcherCard
                    key={researcher.id}
                    researcher={researcher}
                    onClick={() => openResearcherDetails(researcher)}
                  />
                ))}
              </div>
            ) : (
              <p>Nenhum pesquisador disponível no momento.</p>
            )}
            {formerResearchers.length > 0 && (
              <div className="former-members-section">
                <h3 className="former-members-title">Ex-membros</h3>
                <div className="researchers-grid former-grid">
                  {formerResearchers.map((researcher) => (
                    <ResearcherCard
                      key={researcher.id}
                      researcher={researcher}
                      onClick={() => openResearcherDetails(researcher)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case "partnerships":
        return (
          <div className="partnerships-section">
            {partnerships.length > 0 ? (
              <div className="partnerships-grid">
                {partnerships.map((partnership) => (
                  <PartnershipBadge
                    key={partnership.id}
                    partnership={partnership}
                  />
                ))}
              </div>
            ) : (
              <p>
                {isProfessor
                  ? "Nenhuma parceria cadastrada. Clique no botão + para adicionar."
                  : "Nenhuma parceria disponível no momento."}
              </p>
            )}
            {isProfessor && (
              <button
                className="btn-add"
                onClick={() => navigate("/create/partnership")}
              >
                <FaPlus /> Adicionar Parceria
              </button>
            )}
          </div>
        );
      case "contact-location":
        const hasAddress = !!labSettings?.address;
        const hasContact = labSettings?.email || labSettings?.phone;

        return (
          <div className="contact-location-section">
            <div className="contact-column">
              <h3><FaEnvelope /> Contato</h3>
              {isProfessor && (
                <button
                  className="btn-icon btn-icon--primary column-edit-btn"
                  type="button"
                  onClick={() => openSectionEditor("contact")}
                  title="Editar contato"
                >
                  <FaEdit />
                </button>
              )}
              <div className="column-content">
                {labSettings?.email && (
                  <p><strong>Email:</strong> {labSettings.email}</p>
                )}
                {labSettings?.phone && (
                  <p><strong>Telefone:</strong> {labSettings.phone}</p>
                )}
                {!hasContact && (
                  <p className="empty-message">Informações de contato não disponíveis.</p>
                )}
              </div>
            </div>
            <div className="location-column">
              <h3><FaMapMarkerAlt /> Localização</h3>
              {isProfessor && (
                <button
                  className="btn-icon btn-icon--primary column-edit-btn"
                  type="button"
                  onClick={() => openSectionEditor("location")}
                  title="Editar localização"
                >
                  <FaEdit />
                </button>
              )}
              <div className="column-content">
                {hasAddress ? (
                  <>
                    <p>{labSettings.address}</p>
                    {labSettings?.address_details && (
                      <p className="address-details">{labSettings.address_details}</p>
                    )}
                    {labSettings?.maps_link && (
                      <a
                        href={labSettings.maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link-btn"
                      >
                        <FaMapMarkerAlt /> Ver no mapa
                      </a>
                    )}
                  </>
                ) : (
                  <p className="empty-message">Endereço não disponível.</p>
                )}
              </div>
            </div>
          </div>
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
              {isProfessor && id !== "research" && id !== "projects" && id !== "researchers" && id !== "partnerships" && id !== "contact-location" && (
                <button
                  className="section-edit"
                  type="button"
                  onClick={() => openSectionEditor(id)}
                >
                  <FaEdit />
                  Editar
                </button>
              )}
              {isProfessor && id === "researchers" && (
                <button
                  className="section-edit"
                  type="button"
                  onClick={openResearchersEditor}
                >
                  <FaEdit />
                  Editar
                </button>
              )}
              {isProfessor && id === "partnerships" && (
                <button
                  className="section-edit"
                  type="button"
                  onClick={openPartnershipsEditor}
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
