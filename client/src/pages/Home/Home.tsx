import "./Home.scss";
import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { readCache, writeCache } from "helpers/cache";
import { isEmptyObject, canManageAll } from "helpers/utils";
import { localized } from "helpers/i18n";
import { ModalsHandler } from "components/my-own-modal-handler";
import type { SectionEditorField } from "components/Modals/SectionEditor/SectionEditor";

type LabSettings = {
  mission_pt?: string;
  mission_en?: string;
  address?: string;
  address_details_pt?: string;
  address_details_en?: string;
  maps_link?: string;
  areas?: string;
  highlights?: string;
  lead?: string;
  team?: string;
  partners?: string;
  email?: string;
  phone?: string;
  about_images?: Array<{ id: number; image: string; order: number }>;
  home_use_gradient?: boolean;
  home_bg_color_start?: string;
  home_bg_color_middle?: string;
  home_bg_color_end?: string;
  home_accent_color?: string;
  home_border_hover_color?: string;
  home_icon_color?: string;
  home_text_color?: string;
};

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("about");

  const sections = useMemo(() => [
    { id: "about", label: t("About"), icon: <FaInfoCircle /> },
    { id: "research", label: t("Research Areas"), icon: <FaFlask /> },
    { id: "projects", label: t("Projects"), icon: <FaProjectDiagram /> },
    { id: "researchers", label: t("Members"), icon: <FaUsers /> },
    { id: "partnerships", label: t("Partnerships"), icon: <FaHandshake /> },
    { id: "contact-location", label: t("Contact & Location"), icon: <FaEnvelope /> },
  ], [t]);

  const sectionDescriptions: Record<string, string> = useMemo(() => ({
    research: t("Summary of the main research lines and areas of the laboratory."),
    projects: t("List and description of ongoing and completed projects."),
    researchers: t("Team, profiles of researchers and students involved."),
    partnerships: t("Partner institutions and strategic collaborations."),
    "contact-location": t("Contact information and laboratory location."),
  }), [t]);
  const [isNavVisible, setIsNavVisible] = useState(true);
  // Hydrate synchronously from the last successful load so a reload renders the
  // previously fetched content immediately instead of flashing the loading
  // placeholders; the fetches below silently revalidate in the background.
  const [labSettings, setLabSettings] = useState<LabSettings | null>(
    () => readCache<LabSettings>("home:labSettings")
  );
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>(
    () => readCache<ResearchArea[]>("home:researchAreas") ?? []
  );
  const [projects, setProjects] = useState<Project[]>(
    () => readCache<Project[]>("home:projects") ?? []
  );
  const [researchers, setResearchers] = useState<Researcher[]>(
    () => readCache<Researcher[]>("home:researchers") ?? []
  );
  const [allResearchers, setAllResearchers] = useState<Researcher[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>(
    () => readCache<Partnership[]>("home:partnerships") ?? []
  );
  const [allPartnerships, setAllPartnerships] = useState<Partnership[]>([]);
  const hashNavTimeout = useRef<number | null>(null);
  const { user }: any = useGlobalData();
  const isProfessor = !isEmptyObject(user.state) && canManageAll(user.state);
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
      title: t("Edit about"),
      fields: [
        {
          name: "mission_pt",
          label: `${t("Mission")} (PT)`,
          type: "textarea",
          placeholder: t("Describe the laboratory's mission"),
          rows: 6,
        },
        {
          name: "mission_en",
          label: `${t("Mission")} (EN)`,
          type: "textarea",
          placeholder: t("Describe the laboratory's mission"),
          rows: 6,
        },
        {
          name: "images",
          label: t("Images"),
          type: "image-upload",
        },
      ],
      getInitialValues: (settings) => ({
        mission_pt: settings?.mission_pt || "",
        mission_en: settings?.mission_en || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({
          mission_pt: values.mission_pt,
          mission_en: values.mission_en,
        });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            mission_pt: values.mission_pt,
            mission_en: values.mission_en,
          }));
        }
        return response;
      },
    },
    contact: {
      title: t("Edit contact"),
      fields: [
        {
          name: "email",
          label: t("Email"),
          type: "email",
          placeholder: "contato@laboratorio.com",
        },
        {
          name: "phone",
          label: t("Phone"),
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
      title: t("Edit location"),
      fields: [
        {
          name: "address",
          label: t("Address"),
          type: "textarea",
          placeholder: t("Full address (street, number, neighborhood, city, state, ZIP code)"),
          rows: 3,
        },
        {
          name: "address_details_pt",
          label: `${t("Other information")} (PT)`,
          type: "text",
          placeholder: t("Ex: Fourth floor, rooms 403-406"),
        },
        {
          name: "address_details_en",
          label: `${t("Other information")} (EN)`,
          type: "text",
          placeholder: t("Ex: Fourth floor, rooms 403-406"),
        },
        {
          name: "maps_link",
          label: t("Google Maps Link"),
          type: "text",
          placeholder: "https://maps.google.com/...",
        },
      ],
      getInitialValues: (settings) => ({
        address: settings?.address || "",
        address_details_pt: settings?.address_details_pt || "",
        address_details_en: settings?.address_details_en || "",
        maps_link: settings?.maps_link || "",
      }),
      onSave: async (values) => {
        const response = await saveLabSettings({
          address: values.address,
          address_details_pt: values.address_details_pt,
          address_details_en: values.address_details_en,
          maps_link: values.maps_link,
        });
        if (response.success) {
          setLabSettings((prev) => ({
            ...(prev || {}),
            address: values.address,
            address_details_pt: values.address_details_pt,
            address_details_en: values.address_details_en,
            maps_link: values.maps_link,
          }));
        }
        return response;
      },
    },
    research: {
      title: t("Edit research areas"),
      fields: [
        {
          name: "areas",
          label: t("Main areas"),
          type: "textarea",
          placeholder: t("List the main research areas"),
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
      title: t("Edit projects"),
      fields: [
        {
          name: "highlights",
          label: t("Featured projects"),
          type: "textarea",
          placeholder: t("Describe the main projects"),
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
      title: t("Edit researchers"),
      fields: [
        {
          name: "lead",
          label: t("Lead"),
          type: "text",
          placeholder: t("Lead's name"),
        },
        {
          name: "team",
          label: t("Team"),
          type: "textarea",
          placeholder: t("Names and roles"),
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
      title: t("Edit partnerships"),
      fields: [
        {
          name: "partners",
          label: t("Institutions"),
          type: "textarea",
          placeholder: t("List the partner institutions"),
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
        setLabSettings({ mission_pt: t("Mission not available.") });
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

  // Persist the loaded sections so the next reload can hydrate from cache. These
  // run on every change, so edits made on this page keep the cache in sync too.
  useEffect(() => {
    if (labSettings) writeCache("home:labSettings", labSettings);
  }, [labSettings]);
  useEffect(() => {
    writeCache("home:researchAreas", researchAreas);
  }, [researchAreas]);
  useEffect(() => {
    writeCache("home:projects", projects);
  }, [projects]);
  useEffect(() => {
    writeCache("home:researchers", researchers);
  }, [researchers]);
  useEffect(() => {
    writeCache("home:partnerships", partnerships);
  }, [partnerships]);

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

  const customStyles = useMemo(() => {
    if (!labSettings) return {};

    const styles: Record<string, string> = {};
    const useGradient = labSettings.home_use_gradient !== false;

    if (labSettings.home_text_color) {
      styles["--home-ink"] = labSettings.home_text_color;
    }
    if (labSettings.home_icon_color) {
      styles["--home-icon"] = labSettings.home_icon_color;
    }
    if (labSettings.home_accent_color) {
      styles["--home-accent"] = labSettings.home_accent_color;
    }
    if (labSettings.home_border_hover_color) {
      styles["--home-border-hover"] = labSettings.home_border_hover_color;
    }
    if (useGradient) {
      if (labSettings.home_bg_color_start) {
        styles["--home-bg-start"] = labSettings.home_bg_color_start;
      }
      if (labSettings.home_bg_color_middle) {
        styles["--home-bg-middle"] = labSettings.home_bg_color_middle;
      }
      if (labSettings.home_bg_color_end) {
        styles["--home-bg-end"] = labSettings.home_bg_color_end;
      }
    } else {
      const solidColor = labSettings.home_bg_color_start || "#eef7f6";
      styles["--home-bg-start"] = solidColor;
      styles["--home-bg-middle"] = solidColor;
      styles["--home-bg-end"] = solidColor;
    }
    styles["--home-use-gradient"] = useGradient ? "1" : "0";

    return styles;
  }, [labSettings]);

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
      confirmLabel: t("Save"),
      cancelLabel: t("Cancel"),
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
    const { promise } = ModalsHandler.createModal("ResearchAreaEditor", {
      researchArea: area,
      onImagesChange: (images: ResearchArea["images"]) => {
        setResearchAreas((prev) =>
          prev.map((a) => (a.id === area.id ? { ...a, images } : a))
        );
      },
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const values = result as {
      title_pt: string;
      title_en: string;
      description_pt: string;
      description_en: string;
      link: string;
    };
    const response = await updateResearchArea(area.id, {
      title_pt: values.title_pt,
      title_en: values.title_en,
      description_pt: values.description_pt,
      description_en: values.description_en,
      link: values.link,
    });

    if (response.success) {
      setResearchAreas((prev) =>
        prev.map((a) =>
          a.id === area.id
            ? {
                ...a,
                title_pt: values.title_pt,
                title_en: values.title_en,
                description_pt: values.description_pt,
                description_en: values.description_en,
                link: values.link,
              }
            : a
        )
      );

      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Research area updated successfully!"),
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.message || t("Failed to update research area."),
        type: "error",
      });
    }
  };

  const handleDeleteResearchArea = async (area: ResearchArea) => {
    const { promise } = ModalsHandler.createModal("Notification", {
      title: t("Confirm deletion"),
      message: `${t("Are you sure you want to delete the area")} "${localized(area, "title")}"?`,
      type: "warning",
      confirmLabel: t("Delete"),
      cancelLabel: t("Cancel"),
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const response = await deleteResearchArea(area.id);

    if (response.success) {
      setResearchAreas((prev) => prev.filter((a) => a.id !== area.id));

      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Research area deleted successfully!"),
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete research area."),
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
        title: t("Success"),
        message: newStatus
          ? t("Research area activated!")
          : t("Research area deactivated!"),
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.message || t("Failed to update visibility."),
        type: "error",
      });
    }
  };

  const openProjectEditor = async (project: Project) => {
    const { promise } = ModalsHandler.createModal("ProjectEditor", {
      project,
      onImagesChange: (images: Project["images"]) => {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, images } : p))
        );
      },
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const values = result as {
      title_pt: string;
      title_en: string;
      description_pt: string;
      description_en: string;
      link: string;
      members: any[];
    };
    const response = await updateProject(project.id, {
      title_pt: values.title_pt,
      title_en: values.title_en,
      description_pt: values.description_pt,
      description_en: values.description_en,
      link: values.link,
      members: values.members.map((m: any) => m.id),
    } as any);

    if (response.success) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                title_pt: values.title_pt,
                title_en: values.title_en,
                description_pt: values.description_pt,
                description_en: values.description_en,
                link: values.link,
                members: values.members,
              }
            : p
        )
      );

      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Project updated successfully!"),
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.message || t("Failed to update project."),
        type: "error",
      });
    }
  };

  const handleDeleteProject = async (project: Project) => {
    const { promise } = ModalsHandler.createModal("Notification", {
      title: t("Confirm deletion"),
      message: `${t("Are you sure you want to delete the project")} "${localized(project, "title")}"?`,
      type: "warning",
      confirmLabel: t("Delete"),
      cancelLabel: t("Cancel"),
    });

    const result = await promise;
    if (result === "cancel") {
      return;
    }

    const response = await deleteProject(project.id);

    if (response.success) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));

      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Project deleted successfully!"),
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete project."),
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
        title: t("Success"),
        message: newStatus
          ? t("Project activated!")
          : t("Project deactivated!"),
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.message || t("Failed to update visibility."),
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

  const openResearchAreaDetails = async (area: ResearchArea) => {
    const { promise } = ModalsHandler.createModal("ResearchAreaDetails", {
      area,
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
        title: t("Success"),
        message: t("Researchers configuration updated!"),
        type: "success",
      });
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.message || t("Failed to update configuration."),
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
      title: t("Success"),
      message: t("Partnerships updated!"),
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
          adaptiveHeight: false,
          nextArrow: <Arrow direction="next" />,
          prevArrow: <Arrow direction="prev" />,
        };

        return (
          <>
            <p>{localized(labSettings, "mission") || t("Loading mission...")}</p>
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
                  <div
                    key={area.id}
                    className="content-card clickable"
                    onClick={() => openResearchAreaDetails(area)}
                  >
                    <div className="card-content">
                      <h3>{localized(area, "title")}</h3>
                      <p>{localized(area, "description")}</p>
                    </div>
                    {isProfessor && (
                      <div className="card-actions">
                        <button
                          className="btn-icon btn-icon--primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleResearchAreaVisibility(area);
                          }}
                          title={area.is_active ? t("Hide") : t("Show")}
                        >
                          {area.is_active ? <FaEye /> : <FaEyeSlash />}
                        </button>
                        <button
                          className="btn-icon btn-icon--primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openResearchAreaEditor(area);
                          }}
                          title={t("Edit")}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-icon--danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteResearchArea(area);
                          }}
                          title={t("Delete")}
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
                  ? t("No research areas registered. Click the + button to add.")
                  : t("No research areas available at the moment.")}
              </p>
            )}
            {isProfessor && (
              <button
                className="btn-add"
                onClick={() => navigate("/create/research-area")}
              >
                <FaPlus /> {t("Add Research Area")}
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
                      <h3>{localized(project, "title")}</h3>
                      <p>{localized(project, "description")}</p>
                    </div>
                    {isProfessor && (
                      <div className="card-actions">
                        <button
                          className="btn-icon btn-icon--primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleProjectVisibility(project);
                          }}
                          title={project.is_active ? t("Hide") : t("Show")}
                        >
                          {project.is_active ? <FaEye /> : <FaEyeSlash />}
                        </button>
                        <button
                          className="btn-icon btn-icon--primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectEditor(project);
                          }}
                          title={t("Edit")}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-icon--danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
                          title={t("Delete")}
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
                  ? t("No projects registered. Click the + button to add.")
                  : t("No projects available at the moment.")}
              </p>
            )}
            {isProfessor && (
              <button
                className="btn-add"
                onClick={() => navigate("/create/project")}
              >
                <FaPlus /> {t("Add Project")}
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
              <p>{t("No researchers available at the moment.")}</p>
            )}
            {formerResearchers.length > 0 && (
              <div className="former-members-section">
                <h3 className="former-members-title">{t("Former members")}</h3>
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
                  ? t("No partnerships registered. Click the + button to add.")
                  : t("No partnerships available at the moment.")}
              </p>
            )}
            {isProfessor && (
              <button
                className="btn-add"
                onClick={() => navigate("/create/partnership")}
              >
                <FaPlus /> {t("Add Partnership")}
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
              <h3><FaEnvelope /> {t("Contact")}</h3>
              {isProfessor && (
                <button
                  className="btn-icon btn-icon--primary column-edit-btn"
                  type="button"
                  onClick={() => openSectionEditor("contact")}
                  title={t("Edit contact")}
                >
                  <FaEdit />
                </button>
              )}
              <div className="column-content">
                {labSettings?.email && (
                  <p><strong>{t("Email")}:</strong> {labSettings.email}</p>
                )}
                {labSettings?.phone && (
                  <p><strong>{t("Phone")}:</strong> {labSettings.phone}</p>
                )}
                {!hasContact && (
                  <p className="empty-message">{t("Contact information not available.")}</p>
                )}
              </div>
            </div>
            <div className="location-column">
              <h3><FaMapMarkerAlt /> {t("Location")}</h3>
              {isProfessor && (
                <button
                  className="btn-icon btn-icon--primary column-edit-btn"
                  type="button"
                  onClick={() => openSectionEditor("location")}
                  title={t("Edit location")}
                >
                  <FaEdit />
                </button>
              )}
              <div className="column-content">
                {hasAddress ? (
                  <>
                    <p>{labSettings.address}</p>
                    {localized(labSettings, "address_details") && (
                      <p className="address-details">{localized(labSettings, "address_details")}</p>
                    )}
                    {labSettings?.maps_link && (
                      <a
                        href={labSettings.maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link-btn"
                      >
                        <FaMapMarkerAlt /> {t("View on map")}
                      </a>
                    )}
                  </>
                ) : (
                  <p className="empty-message">{t("Address not available.")}</p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return <p>{sectionDescriptions[sectionId] || t("Content under construction.")}</p>;
    }
  };

  return (
    <div className={`home ${isNavVisible ? "nav-visible" : "nav-hidden"}`} style={customStyles as React.CSSProperties}>
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
                  {t("Edit")}
                </button>
              )}
              {isProfessor && id === "researchers" && (
                <button
                  className="section-edit"
                  type="button"
                  onClick={openResearchersEditor}
                >
                  <FaEdit />
                  {t("Edit")}
                </button>
              )}
              {isProfessor && id === "partnerships" && (
                <button
                  className="section-edit"
                  type="button"
                  onClick={openPartnershipsEditor}
                >
                  <FaEdit />
                  {t("Edit")}
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
