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
  FaEdit,
} from "react-icons/fa";
import { getLabSettings, saveLabSettings } from "helpers/api/settings";
import { useGlobalData } from "helpers/context/globalContext";
import { isEmptyObject } from "helpers/utils";
import { ModalsHandler } from "components/my-own-modal-handler";
import type { SectionEditorField } from "components/Modals/SectionEditor/SectionEditor";

const sections = [
  { id: "about", label: "Sobre", icon: <FaInfoCircle /> },
  { id: "location", label: "Localização", icon: <FaMapMarkerAlt /> },
  { id: "research", label: "Áreas de Pesquisa", icon: <FaFlask /> },
  { id: "projects", label: "Projetos", icon: <FaProjectDiagram /> },
  { id: "researchers", label: "Pesquisadores", icon: <FaUsers /> },
  { id: "partnerships", label: "Parcerias", icon: <FaHandshake /> },
  { id: "contact", label: "Contato", icon: <FaEnvelope /> },
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
};

const Home = () => {
  const [activeSection, setActiveSection] = useState<string>("about");
  // const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [labSettings, setLabSettings] = useState<LabSettings | null>(null);
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
          label: "Missao",
          type: "textarea",
          placeholder: "Descreva a missao do laboratorio",
          rows: 6,
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
      title: "Editar localizacao",
      fields: [
        {
          name: "address",
          label: "Endereco",
          type: "text",
          placeholder: "Rua, numero, bairro",
        },
        {
          name: "city",
          label: "Cidade",
          type: "text",
          placeholder: "Cidade e estado",
        },
      ],
    },
    research: {
      title: "Editar areas de pesquisa",
      fields: [
        {
          name: "areas",
          label: "Areas principais",
          type: "textarea",
          placeholder: "Liste as principais areas de pesquisa",
          rows: 5,
        },
      ],
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
    },
    researchers: {
      title: "Editar pesquisadores",
      fields: [
        {
          name: "lead",
          label: "Responsavel",
          type: "text",
          placeholder: "Nome do responsavel",
        },
        {
          name: "team",
          label: "Equipe",
          type: "textarea",
          placeholder: "Nomes e funcoes",
          rows: 5,
        },
      ],
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

    fetchSettings();
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
              {isProfessor && (
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
            {id === "about" ? (
              <p>{labSettings?.mission || "Carregando missao..."}</p>
            ) : (
              <>
                <p>{sectionDescriptions[id] || "Conteudo em construcao."}</p>
              </>
            )}
          </section>
        ))}
      </main>
    </div>
  );
};

export default Home;
