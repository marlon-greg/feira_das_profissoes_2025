import React, { useState, useEffect, useMemo, FormEvent } from "react";
import ReactDOM from "react-dom/client";

// --- Tipos, Constantes e Funções Auxiliares ---
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
type Lecture = { id: string; day: number; time: string; room: string; title: string; speaker: string; capacity: number; };
type UserProfile = { id: number, username: string; isAdmin: number; };
type Registration = { id: number; fullName: string; rm: string; email: string; studentClass: string; };
type FullRegistrationInfo = Registration & { lectureId: string | null; lectureTitle: string | null; day: number | null; time: string | null; };
type User = { id: number; username: string; is_admin: number; };

function parseJwt(token: string): UserProfile | null {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
}

// --- Componente Principal: App ---
const App = () => {
  const [hash, setHash] = useState(window.location.hash || "#home");
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("adminToken"));
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lectures").then((res) => res.json()).then((data) => {
        setLectures(data);
        setLoading(false);
      }).catch(error => { setLoading(false); });
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
    if (loading) return <div className="card" style={{textAlign: 'center'}}>Carregando...</div>;
    
    switch (hash) {
      case "#form":
        return <RegistrationForm lectures={lectures} goToSuccess={() => (window.location.hash = "success")} />;
      case "#admin":
      case "#registrations":
      case "#users":
        if (adminToken) return <AdminContainer lectures={lectures} setLectures={setLectures} token={adminToken} onLogout={handleLogout} />;
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
      <header><div className="container header-content"><a href="#home"><img src="assets/sesi-logo.png" alt="SESI Logo" className="header-logo" /></a><h1>FEIRA DAS PROFISSÕES SESI 2025</h1></div></header>
      <main>{renderView()}</main>
      <footer><div className="container">Escola SESI &copy; 2025</div></footer>
    </>
  );
};

// --- Componentes de Tela ---
const AdminLogin = ({ onAuthSuccess }: { onAuthSuccess: (token: string) => void }) => {
    // ... (código completo do componente)
    return <div>...</div>
};
const SuccessScreen = ({ goToHome }: { goToHome: () => void }) => {
    // ... (código completo do componente)
    return <div>...</div>
};
const HomeScreen = ({ goToForm }: { goToForm: () => void }) => {
    // ... (código completo do componente)
    return <div>...</div>
};
const RegistrationForm = ({ lectures, goToSuccess }: { lectures: Lecture[]; goToSuccess: () => void; }) => {
    // ... (código completo do componente)
    return <div>...</div>
};
const AdminContainer = ({ lectures, setLectures, token, onLogout }: { lectures: Lecture[]; setLectures: (l: Lecture[])=>void; token: string; onLogout: () => void;}) => {
    // ... (código completo do componente)
    return <div>...</div>
};

const RegistrationsView = ({ token, isFullAdmin }: { token: string, isFullAdmin: boolean }) => {
    const [registrations, setRegistrations] = useState<FullRegistrationInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRegistrations = () => {
        setLoading(true);
        fetch('/api/registrations', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setRegistrations(data))
            .finally(() => setLoading(false));
    };

    useEffect(fetchRegistrations, [token]);

    const handleDelete = async (registrationId: number, lectureId: string | null) => {
        if (!lectureId) {
            alert("Não é possível remover uma inscrição sem palestra associada.");
            return;
        }
        if (confirm('Deseja realmente remover este aluno desta palestra específica?')) {
            await fetch(`/api/registrations/${registrationId}/lectures/${lectureId}`, { 
                method: 'DELETE', 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchRegistrations();
        }
    };
    
    if (loading) return <p>Carregando inscritos...</p>;

    return (
        <div>
            <h2>Todos os Inscritos</h2>
            <table>
                <thead><tr><th>Nome</th><th>RM</th><th>Palestra</th><th>Dia/Hora</th>{isFullAdmin && <th>Ações</th>}</tr></thead>
                <tbody>
                    {registrations.map((reg, index) => (
                        <tr key={`${reg.id}-${reg.lectureId || index}`}>
                            <td>{reg.fullName}</td>
                            <td>{reg.rm}</td>
                            <td>{reg.lectureTitle || 'N/A'}</td>
                            <td>{reg.day && reg.time ? `Dia ${reg.day} - ${reg.time}` : 'N/A'}</td>
                            {isFullAdmin && <td><button className="btn-danger" onClick={() => handleDelete(reg.id, reg.lectureId)}>Excluir</button></td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const UserManagementView = ({ token }: { token: string }) => {
    // ... (código completo do componente)
    return <div>...</div>
};

const AdminView = ({ lectures, setLectures, token, onLogout }: { lectures: Lecture[]; setLectures: (l: Lecture[])=>void; token: string; onLogout: () => void;}) => {
    // ... (código completo do componente)
    return <>...</>
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);