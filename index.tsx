import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";

const INSTITUTIONS = [
  { name: "SENAI (Sorocaba e Itu)", logo: "assets/logos/senai.png" },
  { name: "FATEC (Indaiatuba e Itu)", logo: "assets/logos/fatec.png" },
  { name: "CEUNSP (Salto/Itu)", logo: "assets/logos/ceunsp.png" },
  { name: "UNIEDUK (Indaiatuba)", logo: "assets/logos/unieduk.png" },
  { name: "ATHON", logo: "assets/logos/athon.png" },
  { name: "UNIP", logo: "assets/logos/unip.png" },
];

const INDIVIDUALS_AND_OTHERS = [
  "LUCIANA PACHECO",
  "BRUNA ROSA",
  "LETÍCIA JORAND (EGRESSO)",
  "MARIA LUISA (EGRESSO)",
  "ZOONOSES SALTO",
  "ROTARY (SANDERSON)",
];

const LECTURE_CAPACITY = 25;

type Lecture = {
  id: string;
  day: number;
  time: string;
  room: string;
  title: string;
  speaker: string;
  capacity?: number;
};

interface RegistrationData {
  fullName: string;
  rm: string;
  email: string;
  birthDate: string;
  studentClass: string;
  selectedLectures: Record<string, string>;
  timestamp: string;
}

const App = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    fetch("/api/lectures")
      .then((res) => res.json())
      .then(setLectures);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const renderView = () => {
    switch (hash) {
      case "#form":
        return (
          <RegistrationForm
            lectures={lectures}
            goToSuccess={() => (window.location.hash = "success")}
          />
        );
      case "#admin":
        if (adminToken) {
          return (
            <AdminView
              lectures={lectures}
              setLectures={setLectures}
              token={adminToken}
              goToHome={() => (window.location.hash = "home")}
            />
          );
        }
        return <AdminLogin onAuthSuccess={(token) => setAdminToken(token)} />;
      case "#success":
        return (
          <SuccessScreen goToHome={() => (window.location.hash = "home")} />
        );
      case "#home":
      default:
        return <HomeScreen goToForm={() => (window.location.hash = "form")} />;
    }
  };

  return (
    <>
      <header>
        <div className="container header-content">
          <a href="#home">
            <img
              src="assets/sesi-logo.png"
              alt="SESI Logo"
              className="header-logo"
            />
          </a>
          <h1>FEIRA DAS PROFISSÕES SESI 2025</h1>
        </div>
      </header>
      <main>{renderView()}</main>
      <footer>
        <div className="container">Escola SESI &copy; 2025</div>
      </footer>
    </>
  );
};

const AdminLogin = ({
  onAuthSuccess,
}: {
  onAuthSuccess: (token: string) => void;
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const { token } = await res.json();
      onAuthSuccess(token);
    } else {
      setError("Usuário ou senha inválidos.");
    }
  };

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h2>Acesso Administrativo</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn" type="submit">
          Entrar
        </button>
        {error && <div className="alert alert-error">{error}</div>}
      </form>
    </div>
  );
};

const SuccessScreen = ({ goToHome }: { goToHome: () => void }) => (
  <div className="card" style={{ textAlign: "center" }}>
    <div className="alert alert-success">
      <h2>Inscrição realizada com sucesso!</h2>
    </div>
    <p style={{ margin: "1.5rem 0" }}>
      Sua inscrição foi registrada. Nos vemos na Feira das Profissões!
    </p>
    <button className="btn" onClick={goToHome}>
      Voltar para a Página Inicial
    </button>
  </div>
);

const HomeScreen = ({ goToForm }: { goToForm: () => void }) => (
  <div className="card home-screen">
    <h2>Faculdades Participantes</h2>
    <div className="logos-grid">
      {INSTITUTIONS.map((inst) => (
        <div key={inst.name} className="logo-card">
          <img src={inst.logo} alt={`Logo ${inst.name}`} />
        </div>
      ))}
    </div>

    <h2>Palestrantes Participantes</h2>
    <div className="speakers-list">
      {INDIVIDUALS_AND_OTHERS.map((speaker) => (
        <div key={speaker} className="speaker-tag">
          {speaker}
        </div>
      ))}
    </div>

    <button className="btn" onClick={goToForm}>
      Inscreva-se nas palestras
    </button>
  </div>
);

const RegistrationForm = ({
  lectures,
  goToSuccess,
}: {
  lectures: Lecture[];
  goToSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    rm: "",
    email: "",
    birthDate: "",
    studentClass: "",
  });
  const [selectedLectures, setSelectedLectures] = useState<
    Record<string, string>
  >({});
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);

  useEffect(() => {
    const storedRegistrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );
    setRegistrations(storedRegistrations);
  }, []);

  const lectureCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach((reg) => {
      Object.values(reg.selectedLectures).forEach((lectureId) => {
        counts[lectureId] = (counts[lectureId] || 0) + 1;
      });
    });
    return counts;
  }, [registrations]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLectureSelect = (time: string, lectureId: string) => {
    setSelectedLectures((prev) => ({ ...prev, [time]: lectureId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (Object.values(formData).some((field) => !field)) {
      setError("Todos os campos de dados pessoais são obrigatórios.");
      window.scrollTo(0, 0);
      return;
    }

    const emailExists = registrations.some(
      (reg) => reg.email.toLowerCase() === formData.email.toLowerCase()
    );
    if (emailExists) {
      setError(
        "Este e-mail já foi utilizado para uma inscrição. Só é permitido uma inscrição por e-mail."
      );
      window.scrollTo(0, 0);
      return;
    }

    const newRegistration = {
      ...formData,
      selectedLectures,
      timestamp: new Date().toISOString(),
    };
    const updatedRegistrations = [...registrations, newRegistration];
    localStorage.setItem("registrations", JSON.stringify(updatedRegistrations));
    goToSuccess();
  };

  const lecturesByDay = lectures.reduce<Record<number, Lecture[]>>(
    (acc, lecture) => {
      (acc[lecture.day] = acc[lecture.day] || []).push(lecture);
      return acc;
    },
    {}
  );

  const renderDaySchedule = (day: number) => {
    const lecturesDay = lecturesByDay[day] || [];
    const timeSlots = [...new Set(lecturesDay.map((l) => l.time))].sort();

    return (
      <div className="form-section">
        <h2>Dia 0{day} de Setembro</h2>
        {timeSlots.map((time) => (
          <div key={time} className="timeslot-group">
            <h3>{time}</h3>
            {lecturesDay
              .filter((l) => l.time === time)
              .map((lecture) => {
                const isFull =
                  (lectureCounts[lecture.id] || 0) >=
                  (lecture.capacity || LECTURE_CAPACITY);
                return (
                  <div key={lecture.id} className="lecture-option">
                    <label>
                      <input
                        type="radio"
                        name={`lecture_time_${time}`}
                        value={lecture.id}
                        checked={selectedLectures[time] === lecture.id}
                        onChange={() => handleLectureSelect(time, lecture.id)}
                        disabled={isFull}
                      />
                      <div className="details">
                        <strong>{lecture.title}</strong> - {lecture.speaker}
                      </div>
                      <span className="badge badge-room">{lecture.room}</span>
                      {isFull && (
                        <span className="badge badge-full">Lotado</span>
                      )}
                    </label>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-section">
          <h2>Dados do Participante</h2>
          <div className="form-group">
            <label htmlFor="fullName">Nome completo</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rm">RM SESI</label>
            <input
              type="text"
              id="rm"
              name="rm"
              value={formData.rm}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail SESI</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthDate">Data de Nascimento</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="studentClass">Turma</label>
            <select
              id="studentClass"
              name="studentClass"
              value={formData.studentClass}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione sua turma</option>
              <option value="9A_FUND">9º Ano A (Ensino Fundamental)</option>
              <option value="9B_FUND">9º Ano B (Ensino Fundamental)</option>
              <option value="1A_MED">1º Ano A (Ensino Médio)</option>
              <option value="1B_MED">1º Ano B (Ensino Médio)</option>
              <option value="2A_MED">2º Ano A (Ensino Médio)</option>
              <option value="2B_MED">2º Ano B (Ensino Médio)</option>
              <option value="3_MED">3º Ano (Ensino Médio)</option>
            </select>
          </div>
        </div>

        {renderDaySchedule(4)}
        {renderDaySchedule(5)}

        <div className="alert alert-info">
          <strong>Atenção:</strong> Só é possível enviar uma inscrição por
          e-mail. Verifique suas escolhas com cuidado antes de enviar.
        </div>

        <button type="submit" className="btn">
          Salvar e Enviar Inscrição
        </button>
      </form>
    </div>
  );
};

const AdminView = ({
  lectures,
  setLectures,
  token,
  goToHome,
}: {
  lectures: Lecture[];
  setLectures: (lectures: Lecture[]) => void;
  token: string;
  goToHome: () => void;
}) => {
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [newLecture, setNewLecture] = useState({
    day: "",
    time: "",
    room: "",
    title: "",
    speaker: "",
    capacity: 25,
  });

  const handleSaveLecture = async (lecture: Lecture) => {
    await fetch(`/api/lectures/${lecture.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(lecture),
    });
    const updated = await fetch("/api/lectures", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());
    setLectures(updated);
    setEditingLecture(null);
  };

  const handleDeleteLecture = async (id: string) => {
    await fetch(`/api/lectures/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setLectures(lectures.filter((l) => l.id !== id));
  };

  const handleAddLecture = async () => {
    await fetch("/api/lectures", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newLecture),
    });
    const updated = await fetch("/api/lectures", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());
    setLectures(updated);
    setNewLecture({
      day: "",
      time: "",
      room: "",
      title: "",
      speaker: "",
      capacity: 25,
    });
  };

  return (
    <div className="card admin-view">
      <h2>Palestras</h2>
      <table>
        <thead>
          <tr>
            <th>Dia</th>
            <th>Horário</th>
            <th>Sala</th>
            <th>Título</th>
            <th>Palestrante</th>
            <th>Capacidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {lectures.map((lecture) => (
            <tr key={lecture.id}>
              <td>{lecture.day}</td>
              <td>{lecture.time}</td>
              <td>{lecture.room}</td>
              <td>{lecture.title}</td>
              <td>{lecture.speaker}</td>
              <td>{lecture.capacity}</td>
              <td>
                <button onClick={() => setEditingLecture(lecture)}>
                  Editar
                </button>
                <button onClick={() => handleDeleteLecture(lecture.id)}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingLecture && (
        <div>
          {/* Formulário de edição */}
          {/* Adicione campos para edição conforme necessário */}
          <button onClick={() => handleSaveLecture(editingLecture)}>
            Salvar
          </button>
          <button onClick={() => setEditingLecture(null)}>Cancelar</button>
        </div>
      )}
      <h3>Adicionar Nova Palestra</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddLecture();
        }}
      >
        {/* Adicione campos para nova palestra conforme necessário */}
        <button type="submit">Adicionar</button>
      </form>
      <button className="btn" onClick={goToHome}>
        Ir para a Página Inicial
      </button>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
