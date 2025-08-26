import React, { useState, useEffect, useMemo, FormEvent } from "react";
import ReactDOM from "react-dom/client";

// --- Constantes e Tipos ---
const INSTITUTIONS = [
  { name: "SENAI (Sorocaba e Itu)", logo: "assets/logos/senai.png" },
  { name: "FATEC (Indaiatuba e Itu)", logo: "assets/logos/fatec.png" },
  { name: "CEUNSP (Salto/Itu)", logo: "assets/logos/ceunsp.png" },
  { name: "UNIEDUK (Indaiatuba)", logo: "assets/logos/unieduk.png" },
  { name: "ATHON", logo: "assets/logos/athon.png" },
  { name: "UNIP", logo: "assets/logos/unip.png" },
];

const INDIVIDUALS_AND_OTHERS = [
  "LUCIANA PACHECO", "BRUNA ROSA", "LETÍCIA JORAND (EGRESSO)",
  "MARIA LUISA (EGRESSO)", "ZOONOSES SALTO", "ROTARY (SANDERSON)",
];

type Lecture = {
  id: string;
  day: number;
  time: string;
  room: string;
  title: string;
  speaker: string;
  capacity: number;
};

// --- Componente Principal: App ---
const App = () => {
  const [hash, setHash] = useState(window.location.hash || "#home");
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("adminToken"));
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lectures")
      .then((res) => res.json())
      .then((data) => {
        setLectures(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Falha ao carregar palestras:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash || "#home");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  
  const handleLoginSuccess = (token: string) => {
      localStorage.setItem("adminToken", token);
      setAdminToken(token);
      window.location.hash = "admin";
  }
  
  const handleLogout = () => {
      localStorage.removeItem("adminToken");
      setAdminToken(null);
      window.location.hash = "home";
  }

  const renderView = () => {
    if (loading) {
        return <div className="card" style={{textAlign: 'center'}}>Carregando...</div>;
    }
    
    switch (hash) {
      case "#form":
        return <RegistrationForm lectures={lectures} goToSuccess={() => (window.location.hash = "success")} />;
      case "#admin":
        if (adminToken) {
          return <AdminView lectures={lectures} setLectures={setLectures} token={adminToken} onLogout={handleLogout} />;
        }
        return <AdminLogin onAuthSuccess={handleLoginSuccess} />;
      case "#success":
        return <SuccessScreen goToHome={() => (window.location.hash = "home")} />;
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
            <img src="assets/sesi-logo.png" alt="SESI Logo" className="header-logo" />
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

// --- Componentes de Tela ---
const AdminLogin = ({ onAuthSuccess }: { onAuthSuccess: (token: string) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (res.ok) {
            onAuthSuccess(data.token);
        } else {
            setError(data.message || "Usuário ou senha inválidos.");
        }
    } catch(err) {
        setError("Erro de conexão com o servidor.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h2>Acesso Administrativo</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group"><input type="text" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
        <div className="form-group"><input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        {error && <div className="alert alert-error" style={{marginTop: '1rem'}}>{error}</div>}
      </form>
    </div>
  );
};

const SuccessScreen = ({ goToHome }: { goToHome: () => void }) => (
  <div className="card" style={{ textAlign: "center" }}>
    <div className="alert alert-success"><h2>Inscrição realizada com sucesso!</h2></div>
    <p style={{ margin: "1.5rem 0" }}>Sua inscrição foi registrada. Nos vemos na Feira das Profissões!</p>
    <button className="btn" onClick={goToHome}>Voltar para a Página Inicial</button>
  </div>
);

const HomeScreen = ({ goToForm }: { goToForm: () => void }) => (
  <div className="card home-screen">
    <h2>Faculdades Participantes</h2>
    <div className="logos-grid">{INSTITUTIONS.map((inst) => (<div key={inst.name} className="logo-card"><img src={inst.logo} alt={`Logo ${inst.name}`} /></div>))}</div>
    <h2>Palestrantes Participantes</h2>
    <div className="speakers-list">{INDIVIDUALS_AND_OTHERS.map((speaker) => (<div key={speaker} className="speaker-tag">{speaker}</div>))}</div>
    <button className="btn" onClick={goToForm}>Inscreva-se nas palestras</button>
  </div>
);

const RegistrationForm = ({ lectures, goToSuccess }: { lectures: Lecture[]; goToSuccess: () => void; }) => {
  const [formData, setFormData] = useState({ fullName: "", rm: "", email: "", birthDate: "", studentClass: "" });
  const [selectedLectures, setSelectedLectures] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lectureCounts, setLectureCounts] = useState<Record<string, number>>({});

  useEffect(() => {
      fetch('/api/lecture-counts')
          .then(res => res.json())
          .then(setLectureCounts)
          .catch(err => console.error("Erro ao buscar contagem de vagas:", err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLectureSelect = (time: string, lectureId: string) => {
    setSelectedLectures((prev) => ({ ...prev, [time]: lectureId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (Object.values(formData).some((field) => !field)) {
      setError("Todos os campos de dados pessoais são obrigatórios.");
      window.scrollTo(0, 0);
      return;
    }
    setLoading(true);
    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, selectedLectures })
        });
        const data = await res.json();
        if (res.ok) {
            goToSuccess();
        } else {
            setError(data.message || 'Ocorreu um erro ao enviar sua inscrição.');
            window.scrollTo(0, 0);
        }
    } catch(err) {
        setError("Erro de conexão. Tente novamente mais tarde.");
        window.scrollTo(0, 0);
    } finally {
        setLoading(false);
    }
  };

  const lecturesByDay = useMemo(() => lectures.reduce<Record<number, Lecture[]>>((acc, lecture) => {
    (acc[lecture.day] = acc[lecture.day] || []).push(lecture);
    return acc;
  }, {}), [lectures]);

  const renderDaySchedule = (day: number) => {
    const lecturesDay = lecturesByDay[day] || [];
    const timeSlots = [...new Set(lecturesDay.map((l) => l.time))].sort();
    if (lecturesDay.length === 0) return <div className="form-section"><h2>Dia 0{day} de Setembro</h2><p>Nenhuma palestra cadastrada para este dia.</p></div>

    return (
      <div className="form-section">
        <h2>Dia 0{day} de Setembro</h2>
        {timeSlots.map((time) => (
          <div key={time} className="timeslot-group">
            <h3>{time}</h3>
            {lecturesDay.filter((l) => l.time === time).map((lecture) => {
              const registeredCount = lectureCounts[lecture.id] || 0;
              const isFull = registeredCount >= lecture.capacity;
              return (
                <div key={lecture.id} className="lecture-option">
                  <label>
                    <input type="radio" name={`lecture_time_${time}`} value={lecture.id} checked={selectedLectures[time] === lecture.id} onChange={() => handleLectureSelect(time, lecture.id)} disabled={isFull} />
                    <div className="details"><strong>{lecture.title}</strong> - {lecture.speaker}</div>
                    <span className="badge badge-room">{lecture.room}</span>
                    <span className="badge badge-dh">{registeredCount} / {lecture.capacity}</span>
                    {isFull && <span className="badge badge-full">Lotado</span>}
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
          <div className="form-group"><label htmlFor="fullName">Nome completo</label><input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required /></div>
          <div className="form-group"><label htmlFor="rm">RM SESI</label><input type="text" id="rm" name="rm" value={formData.rm} onChange={handleInputChange} required /></div>
          <div className="form-group"><label htmlFor="email">E-mail SESI</label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required /></div>
          <div className="form-group"><label htmlFor="birthDate">Data de Nascimento</label><input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleInputChange} required /></div>
          <div className="form-group">
            <label htmlFor="studentClass">Turma</label>
            <select id="studentClass" name="studentClass" value={formData.studentClass} onChange={handleInputChange} required>
              <option value="">Selecione sua turma</option>
              <option value="9A_FUND">9º Ano A (Ensino Fundamental)</option><option value="9B_FUND">9º Ano B (Ensino Fundamental)</option><option value="1A_MED">1º Ano A (Ensino Médio)</option>
              <option value="1B_MED">1º Ano B (Ensino Médio)</option><option value="2A_MED">2º Ano A (Ensino Médio)</option><option value="2B_MED">2º Ano B (Ensino Médio)</option><option value="3_MED">3º Ano (Ensino Médio)</option>
            </select>
          </div>
        </div>
        {renderDaySchedule(4)}
        {renderDaySchedule(5)}
        <div className="alert alert-info"><strong>Atenção:</strong> Só é possível enviar uma inscrição por e-mail/RM. Verifique suas escolhas com cuidado antes de enviar.</div>
        <button type="submit" className="btn" disabled={loading}>{loading ? 'Enviando...' : 'Salvar e Enviar Inscrição'}</button>
      </form>
    </div>
  );
};


const AdminView = ({ lectures, setLectures, token, onLogout }: { lectures: Lecture[]; setLectures: (lectures: Lecture[]) => void; token: string; onLogout: () => void; }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newLecture, setNewLecture] = useState({ day: 4, time: '09:00', room: '', title: '', speaker: '', capacity: 25 });
    const [loading, setLoading] = useState(false);

    const fetchLectures = async () => {
        const updated = await fetch("/api/lectures").then((res) => res.json());
        setLectures(updated);
    };

    const handleDeleteLecture = async (id: string) => {
        if (confirm('Tem certeza que deseja remover esta palestra?')) {
            await fetch(`/api/lectures/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            fetchLectures();
        }
    };

    const handleAddLecture = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await fetch("/api/lectures", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(newLecture),
        });
        await fetchLectures();
        setNewLecture({ day: 4, time: '09:00', room: '', title: '', speaker: '', capacity: 25 });
        setIsAdding(false);
        setLoading(false);
    };

    return (
        <div className="card admin-view">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2>Painel de Palestras</h2>
                <button className="btn" onClick={onLogout}>Sair</button>
            </div>

            {!isAdding && <button className="btn" onClick={() => setIsAdding(true)}>Adicionar Nova Palestra</button>}

            {isAdding && (
                <form onSubmit={handleAddLecture} className="form-section">
                    <h3>Nova Palestra</h3>
                    <div className="form-group"><label>Dia</label><select value={newLecture.day} onChange={e => setNewLecture({...newLecture, day: Number(e.target.value)})}><option value={4}>Dia 04</option><option value={5}>Dia 05</option></select></div>
                    <div className="form-group"><label>Horário</label><input type="time" value={newLecture.time} onChange={e => setNewLecture({...newLecture, time: e.target.value})} required/></div>
                    <div className="form-group"><label>Sala</label><input type="text" value={newLecture.room} onChange={e => setNewLecture({...newLecture, room: e.target.value})} required/></div>
                    <div className="form-group"><label>Título</label><input type="text" value={newLecture.title} onChange={e => setNewLecture({...newLecture, title: e.target.value})} required/></div>
                    <div className="form-group"><label>Palestrante</label><input type="text" value={newLecture.speaker} onChange={e => setNewLecture({...newLecture, speaker: e.target.value})} required/></div>
                    <div className="form-group"><label>Capacidade</label><input type="number" value={newLecture.capacity} onChange={e => setNewLecture({...newLecture, capacity: Number(e.target.value)})} required/></div>
                    <div>
                        <button type="submit" className="btn" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Palestra'}</button>
                        <button type="button" className="btn" onClick={() => setIsAdding(false)} style={{marginLeft: '1rem', backgroundColor: '#888'}}>Cancelar</button>
                    </div>
                </form>
            )}
            
            <table style={{marginTop: '2rem'}}>
                <thead><tr><th>Dia</th><th>Horário</th><th>Sala</th><th>Título</th><th>Palestrante</th><th>Capacidade</th><th>Ações</th></tr></thead>
                <tbody>
                    {lectures.length > 0 ? lectures.map((lecture) => (
                        <tr key={lecture.id}>
                            <td>{lecture.day}</td><td>{lecture.time}</td><td>{lecture.room}</td><td>{lecture.title}</td><td>{lecture.speaker}</td><td>{lecture.capacity}</td>
                            <td><button onClick={() => handleDeleteLecture(lecture.id)}>Remover</button></td>
                        </tr>
                    )) : <tr><td colSpan={7} style={{textAlign: 'center'}}>Nenhuma palestra cadastrada.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

// --- Renderização da Aplicação ---
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);