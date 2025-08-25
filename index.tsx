import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

const LECTURES = [
    // 04 DE SETEMBRO
    { id: 'd4_t1_s1', day: 4, time: '07:50 - 08:40', room: 'Sala 01', title: 'VETERINÁRIA', speaker: 'Zoonoses Salto - LUCIANA', isDH: false },
    { id: 'd4_t1_s2', day: 4, time: '07:50 - 08:40', room: 'Sala 02', title: 'Pedagogia da Inclusão', speaker: 'LUCIANA PACHECO', isDH: false },
    { id: 'd4_t1_s3', day: 4, time: '07:50 - 08:40', room: 'Sala 03', title: 'Medicina Veterinária', speaker: 'UNIEDUK', isDH: false },
    { id: 'd4_t1_s5', day: 4, time: '07:50 - 08:40', room: 'Sala 05', title: 'Gestão de Serviços/ Empresarial e Comércio Exterior', speaker: 'FATEC INDAIATUBA', isDH: true },
    { id: 'd4_t1_s6', day: 4, time: '07:50 - 08:40', room: 'Sala 06', title: 'Nutrição', speaker: 'CEUNSP', isDH: false },
    { id: 'd4_t1_s7', day: 4, time: '07:50 - 08:40', room: 'Sala 07', title: 'Biomedicina', speaker: 'CEUNSP', isDH: false },
    { id: 'd4_t1_s8', day: 4, time: '07:50 - 08:40', room: 'Sala 08', title: 'Farmácia e estética', speaker: 'CEUNSP', isDH: false },
    { id: 'd4_t1_s9', day: 4, time: '07:50 - 08:40', room: 'Sala 09', title: 'Comunicação/Direito/Negócios', speaker: 'ATHON', isDH: false },
    { id: 'd4_t1_s10', day: 4, time: '07:50 - 08:40', room: 'Sala 10', title: 'Estética e cosmética/ Odonto/ Fisioterapia', speaker: 'UNIP', isDH: true },
    { id: 'd4_t1_senai', day: 4, time: '07:50 - 08:40', room: 'SALA SENAI', title: '?', speaker: '?', isDH: false },
    { id: 'd4_t1_bib', day: 4, time: '07:50 - 08:40', room: 'Biblioteca', title: 'Projeto de Vida', speaker: 'Sanderson (ROTARY)', isDH: false },

    { id: 'd4_t2_s1', day: 4, time: '08:40 - 09:30', room: 'Sala 01', title: 'VETERINÁRIA', speaker: 'Zoonoses Salto - LUCIANA', isDH: false },
    { id: 'd4_t2_s2', day: 4, time: '08:40 - 09:30', room: 'Sala 02', title: 'Pedagogia da Inclusão', speaker: 'LUCIANA PACHECO', isDH: false },
    { id: 'd4_t2_s3', day: 4, time: '08:40 - 09:30', room: 'Sala 03', title: 'Psicologia', speaker: 'UNIEDUK', isDH: false },
    { id: 'd4_t2_s6', day: 4, time: '08:40 - 09:30', room: 'Sala 06', title: 'Nutrição', speaker: 'CEUNSP', isDH: false },
    { id: 'd4_t2_s7', day: 4, time: '08:40 - 09:30', room: 'Sala 07', title: 'Biomedicina', speaker: 'CEUNSP', isDH: false },
    { id: 'd4_t2_s8', day: 4, time: '08:40 - 09:30', room: 'Sala 08', title: 'Farmácia e estética', speaker: 'CEUNSP', isDH: false },
    { id: 'd4_t2_s9', day: 4, time: '08:40 - 09:30', room: 'Sala 09', title: 'Comunicação/Direito/Negócios', speaker: 'ATHON', isDH: false },
    { id: 'd4_t2_senai', day: 4, time: '08:40 - 09:30', room: 'SALA SENAI', title: '?', speaker: '?', isDH: false },
    { id: 'd4_t2_bib', day: 4, time: '08:40 - 09:30', room: 'Biblioteca', title: 'Projeto de Vida', speaker: 'Sanderson (ROTARY)', isDH: false },

    { id: 'd4_t3_s1', day: 4, time: '09:50 - 10:40', room: 'Sala 01', title: 'VETERINÁRIA', speaker: 'Zoonoses Salto - LUCIANA', isDH: false },
    { id: 'd4_t3_s2', day: 4, time: '09:50 - 10:40', room: 'Sala 02', title: 'Pedagogia da Inclusão', speaker: 'LUCIANA PACHECO', isDH: false },
    { id: 'd4_t3_s3', day: 4, time: '09:50 - 10:40', room: 'Sala 03', title: 'Medicina', speaker: 'UNIEDUK', isDH: false },
    { id: 'd4_t3_s5', day: 4, time: '09:50 - 10:40', room: 'Sala 05', title: 'Logística Portuária', speaker: 'FATEC INDAIATUBA', isDH: false },
    { id: 'd4_t3_s6', day: 4, time: '09:50 - 10:40', room: 'Sala 06', title: 'Direito', speaker: 'CEUNSP', isDH: false },
    { id: 'd4_t3_s7', day: 4, time: '09:50 - 10:40', room: 'Sala 07', title: 'Engenharias', speaker: 'CEUNSP', isDH: false },
    { id: 'd4_t3_s8', day: 4, time: '09:50 - 10:40', room: 'Sala 08', title: 'Arquitetura e Urbanismo', speaker: 'CEUNSP', isDH: false },
    { id: 'd4_t3_s9', day: 4, time: '09:50 - 10:40', room: 'Sala 09', title: 'Comunicação/Direito/Negócios', speaker: 'ATHON', isDH: false },
    { id: 'd4_t3_s10', day: 4, time: '09:50 - 10:40', room: 'Sala 10', title: 'Estética e cosmética/ Odonto/ Fisioterapia', speaker: 'UNIP', isDH: false },
    { id: 'd4_t3_senai', day: 4, time: '09:50 - 10:40', room: 'SALA SENAI', title: '?', speaker: '?', isDH: false },
    { id: 'd4_t3_bib', day: 4, time: '09:50 - 10:40', room: 'Biblioteca', title: 'Projeto de Vida', speaker: 'Sanderson (ROTARY)', isDH: false },


    // 05 DE SETEMBRO
    { id: 'd5_t1_s1', day: 5, time: '08:00 - 08:40', room: 'Sala 01', title: 'Psicologia', speaker: 'BRUNA ROSA', isDH: false },
    { id: 'd5_t1_s2', day: 5, time: '08:00 - 08:40', room: 'Sala 02', title: 'Pedagogia da Inclusão', speaker: 'LUCIANA PACHECO', isDH: false },
    { id: 'd5_t1_s3', day: 5, time: '08:00 - 08:40', room: 'Sala 03', title: 'Arquitetura e Urbanismo', speaker: 'UNIEDUK', isDH: false },
    { id: 'd5_t1_s5', day: 5, time: '08:00 - 08:40', room: 'Sala 05', title: 'Análise de Desenvolvimento de Sistemas/ Gestão de eventos/ Gestão de TI/ Gestão Empresarial', speaker: 'FATEC ITU', isDH: true },
    { id: 'd5_t1_s6', day: 5, time: '08:00 - 08:40', room: 'Sala 06', title: 'Engenharia civil', speaker: 'CEUNSP', isDH: false },
    { id: 'd5_t1_s8', day: 5, time: '08:00 - 08:40', room: 'Sala 08', title: 'Medicina veterinária', speaker: 'CEUNSP', isDH: false },
    { id: 'd5_t1_s9', day: 5, time: '08:00 - 08:40', room: 'Sala 09', title: 'Medicina', speaker: 'Letícia Jorand (egresso)', isDH: false },
    { id: 'd5_t1_s10', day: 5, time: '08:00 - 08:40', room: 'Sala 10', title: 'Direito', speaker: 'Maria Luisa (egresso)', isDH: false },
    { id: 'd5_t1_senai', day: 5, time: '08:00 - 08:40', room: 'SALA SENAI', title: 'Técnico Desenvolvimento de sistemas', speaker: 'SENAI ITU', isDH: false },

    { id: 'd5_t2_s1', day: 5, time: '08:40 - 09:30', room: 'Sala 01', title: 'Psicologia', speaker: 'BRUNA ROSA', isDH: false },
    { id: 'd5_t2_s2', day: 5, time: '08:40 - 09:30', room: 'Sala 02', title: 'Pedagogia da Inclusão', speaker: 'LUCIANA PACHECO', isDH: false },
    { id: 'd5_t2_s3', day: 5, time: '08:40 - 09:30', room: 'Sala 03', title: 'Direito', speaker: 'UNIEDUK', isDH: false },
    { id: 'd5_t2_s6', day: 5, time: '08:40 - 09:30', room: 'Sala 06', title: 'Engenharia Química', speaker: 'CEUNSP', isDH: false },
    { id: 'd5_t2_s7', day: 5, time: '08:40 - 09:30', room: 'Sala 07', title: 'Fisioterapia', speaker: 'CEUNSP', isDH: false },
    { id: 'd5_t2_s8', day: 5, time: '08:40 - 09:30', room: 'Sala 08', title: 'Enfermagem', speaker: 'CEUNSP', isDH: false },
    { id: 'd5_t2_s9', day: 5, time: '08:40 - 09:30', room: 'Sala 09', title: 'Medicina', speaker: 'Letícia Jorand (egresso)', isDH: false },
    { id: 'd5_t2_s10', day: 5, time: '08:40 - 09:30', room: 'Sala 10', title: 'Direito', speaker: 'Maria Luisa (egresso)', isDH: false },
    { id: 'd5_t2_senai', day: 5, time: '08:40 - 09:30', room: 'SALA SENAI', title: 'Técnico Desenvolvimento de sistemas', speaker: 'SENAI ITU', isDH: false },
    
    { id: 'd5_t3_s1', day: 5, time: '09:50 - 10:40', room: 'Sala 01', title: 'Psicologia', speaker: 'BRUNA ROSA', isDH: false },
    { id: 'd5_t3_s2', day: 5, time: '09:50 - 10:40', room: 'Sala 02', title: 'Pedagogia da Inclusão', speaker: 'LUCIANA PACHECO', isDH: false },
    { id: 'd5_t3_s3', day: 5, time: '09:50 - 10:40', room: 'Sala 03', title: 'Engenharias e ciência da computação', speaker: 'UNIEDUK', isDH: false },
    { id: 'd5_t3_s5', day: 5, time: '09:50 - 10:40', room: 'Sala 05', title: 'Mecatrônica e Processos Gerênciais', speaker: 'FATEC ITU', isDH: false },
     { id: 'd5_t3_s6', day: 5, time: '09:50 - 10:40', room: 'Sala 06', title: 'Egenharia Química', speaker: 'CEUNSP', isDH: false },
    { id: 'd5_t3_s7', day: 5, time: '09:50 - 10:40', room: 'Sala 07', title: 'Fisioterapia', speaker: 'CEUNSP', isDH: false },
     { id: 'd5_t3_s8', day: 5, time: '09:50 - 10:40', room: 'Sala 08', title: 'Enfermagem', speaker: 'CEUNSP', isDH: false },
    { id: 'd5_t3_s9', day: 5, time: '09:50 - 10:40', room: 'Sala 09', title: 'Medicina', speaker: 'Letícia Jorand (egresso)', isDH: false },
    { id: 'd5_t3_s10', day: 5, time: '09:50 - 10:40', room: 'Sala 10', title: 'Direito', speaker: 'Maria Luisa (egresso)', isDH: false },
    { id: 'd5_t3_senai', day: 5, time: '09:50 - 10:40', room: 'SALA SENAI', title: 'Técnico Desenvolvimento de sistemas', speaker: 'SENAI ITU', isDH: false },
];

const INSTITUTIONS = [
    { name: 'SENAI (Sorocaba e Itu)', logo: 'assets/logos/senai.png' },
    { name: 'FATEC (Indaiatuba e Itu)', logo: 'assets/logos/fatec.png' },
    { name: 'CEUNSP (Salto/Itu)', logo: 'assets/logos/ceunsp.png' },
    { name: 'UNIEDUK (Indaiatuba)', logo: 'assets/logos/unieduk.png' },
    { name: 'ATHON', logo: 'assets/logos/athon.png' },
    { name: 'UNIP', logo: 'assets/logos/unip.png' },
];

const INDIVIDUALS_AND_OTHERS = [
    'LUCIANA PACHECO', 'BRUNA ROSA', 'LETÍCIA JORAND (EGRESSO)', 'MARIA LUISA (EGRESSO)', 'ZOONOSES SALTO', 'ROTARY (SANDERSON)'
];

const LECTURE_CAPACITY = 25;
const ADMIN_PASSWORD = 'admin2025';

type Lecture = typeof LECTURES[0];

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
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);


    const renderView = () => {
        switch (hash) {
            case '#form':
                return <RegistrationForm goToSuccess={() => window.location.hash = 'success'} />;
            case '#admin':
                 if (isAdminAuthenticated) {
                    return <AdminView goToHome={() => window.location.hash = 'home'} />;
                }
                return <AdminLogin onAuthSuccess={() => setIsAdminAuthenticated(true)} />;
            case '#success':
                 return <SuccessScreen goToHome={() => window.location.hash = 'home'} />;
            case '#home':
            default:
                return <HomeScreen goToForm={() => window.location.hash = 'form'} />;
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
            <main>
                {renderView()}
            </main>
            <footer>
                <div className="container">
                    Escola SESI &copy; 2025
                </div>
            </footer>
        </>
    );
};

const AdminLogin = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
    useEffect(() => {
        const password = prompt('Digite a senha de administrador:');
        if (password === ADMIN_PASSWORD) {
            onAuthSuccess();
        } else {
            if (password !== null) {
                alert('Senha incorreta.');
            }
            window.location.hash = 'home';
        }
    }, [onAuthSuccess]);

    return (
        <div className="card" style={{ textAlign: 'center' }}>
            <h2>Acesso Administrativo</h2>
            <p>Por favor, aguarde...</p>
        </div>
    );
};


const SuccessScreen = ({ goToHome }: { goToHome: () => void }) => (
    <div className="card" style={{ textAlign: 'center' }}>
        <div className="alert alert-success">
            <h2>Inscrição realizada com sucesso!</h2>
        </div>
        <p style={{ margin: '1.5rem 0' }}>Sua inscrição foi registrada. Nos vemos na Feira das Profissões!</p>
        <button className="btn" onClick={goToHome}>Voltar para a Página Inicial</button>
    </div>
);


const HomeScreen = ({ goToForm }: { goToForm: () => void }) => (
    <div className="card home-screen">
        <h2>Faculdades Participantes</h2>
        <div className="logos-grid">
            {INSTITUTIONS.map(inst => (
                <div key={inst.name} className="logo-card">
                    <img src={inst.logo} alt={`Logo ${inst.name}`} />
                </div>
            ))}
        </div>

        <h2>Palestrantes Participantes</h2>
        <div className="speakers-list">
            {INDIVIDUALS_AND_OTHERS.map(speaker => <div key={speaker} className="speaker-tag">{speaker}</div>)}
        </div>
        
        <button className="btn" onClick={goToForm}>Inscreva-se nas palestras</button>
    </div>
);

const RegistrationForm = ({ goToSuccess }: { goToSuccess: () => void }) => {
    const [formData, setFormData] = useState({
        fullName: '', rm: '', email: '', birthDate: '', studentClass: ''
    });
    const [selectedLectures, setSelectedLectures] = useState<Record<string, string>>({});
    const [error, setError] = useState('');
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);

    useEffect(() => {
        const storedRegistrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        setRegistrations(storedRegistrations);
    }, []);

    const lectureCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        registrations.forEach(reg => {
            Object.values(reg.selectedLectures).forEach(lectureId => {
                counts[lectureId] = (counts[lectureId] || 0) + 1;
            });
        });
        return counts;
    }, [registrations]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLectureSelect = (time: string, lectureId: string) => {
        setSelectedLectures(prev => ({...prev, [time]: lectureId }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (Object.values(formData).some(field => !field)) {
            setError('Todos os campos de dados pessoais são obrigatórios.');
            window.scrollTo(0,0);
            return;
        }

        const emailExists = registrations.some(reg => reg.email.toLowerCase() === formData.email.toLowerCase());
        if (emailExists) {
            setError('Este e-mail já foi utilizado para uma inscrição. Só é permitido uma inscrição por e-mail.');
            window.scrollTo(0,0);
            return;
        }

        const newRegistration = { ...formData, selectedLectures, timestamp: new Date().toISOString() };
        const updatedRegistrations = [...registrations, newRegistration];
        localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
        
        goToSuccess();
    };
    
    const lecturesByDay = LECTURES.reduce<Record<number, Lecture[]>>((acc, lecture) => {
        (acc[lecture.day] = acc[lecture.day] || []).push(lecture);
        return acc;
    }, {});

    const renderDaySchedule = (day: number) => {
        const lectures = lecturesByDay[day] || [];
        const timeSlots = [...new Set(lectures.map(l => l.time))].sort();
        
        let blockedSlots = new Set<string>();
        timeSlots.forEach((time, index) => {
           const selectedLectureId = selectedLectures[time];
           if(selectedLectureId){
                const selectedLecture = LECTURES.find(l => l.id === selectedLectureId);
                if(selectedLecture?.isDH && timeSlots[index + 1]){
                    blockedSlots.add(timeSlots[index + 1]);
                }
           }
        });

        return (
            <div className="form-section">
                <h2>Dia 0{day} de Setembro</h2>
                {timeSlots.map(time => {
                    const isBlocked = blockedSlots.has(time);
                    return (
                        <div key={time} className={`timeslot-group ${isBlocked ? 'disabled-timeslot' : ''}`}>
                            <h3>{time} {isBlocked && <span>(Horário indisponível devido à seleção de palestra DH)</span>}</h3>
                            {lectures.filter(l => l.time === time).map(lecture => {
                                const isFull = (lectureCounts[lecture.id] || 0) >= LECTURE_CAPACITY;
                                return (
                                    <div key={lecture.id} className="lecture-option">
                                        <label>
                                            <input
                                                type="radio"
                                                name={`lecture_time_${time}`}
                                                value={lecture.id}
                                                checked={selectedLectures[time] === lecture.id}
                                                onChange={() => handleLectureSelect(time, lecture.id)}
                                                disabled={isFull || isBlocked}
                                            />
                                            <div className="details">
                                                <strong>{lecture.title}</strong> - {lecture.speaker}
                                            </div>
                                            <span className="badge badge-room">{lecture.room}</span>
                                            {lecture.isDH && <span className="badge badge-dh">DH</span>}
                                            {isFull && <span className="badge badge-full">Lotado</span>}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
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
                        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rm">RM SESI</label>
                        <input type="text" id="rm" name="rm" value={formData.rm} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">E-mail SESI</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="birthDate">Data de Nascimento</label>
                        <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="studentClass">Turma</label>
                        <select id="studentClass" name="studentClass" value={formData.studentClass} onChange={handleInputChange} required>
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
                    <strong>Atenção:</strong> Só é possível enviar uma inscrição por e-mail. Verifique suas escolhas com cuidado antes de enviar.
                </div>

                <button type="submit" className="btn">Salvar e Enviar Inscrição</button>
            </form>
        </div>
    );
};

const AdminView = ({ goToHome }: { goToHome: () => void }) => {
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);

    useEffect(() => {
        const storedRegistrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        storedRegistrations.sort((a: RegistrationData, b: RegistrationData) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRegistrations(storedRegistrations);
    }, []);

    const getLectureInfo = (id: string) => LECTURES.find(l => l.id === id);

    const downloadCSV = () => {
        if (registrations.length === 0) {
            alert("Nenhuma inscrição para exportar.");
            return;
        }

        const attendeesByLecture: Record<string, { fullName: string; studentClass: string; email: string; rm: string }[]> = {};

        registrations.forEach(reg => {
            Object.values(reg.selectedLectures).forEach(lectureId => {
                if (!attendeesByLecture[lectureId]) {
                    attendeesByLecture[lectureId] = [];
                }
                attendeesByLecture[lectureId].push({
                    fullName: reg.fullName,
                    studentClass: reg.studentClass,
                    email: reg.email,
                    rm: reg.rm
                });
            });
        });

        for (const lectureId in attendeesByLecture) {
            attendeesByLecture[lectureId].sort((a, b) => a.fullName.localeCompare(b.fullName));
        }

        const csvRows: string[] = [];
        const lecturesMap = LECTURES.reduce((acc, lecture) => {
            acc[lecture.id] = lecture;
            return acc;
        }, {} as Record<string, Lecture>);
        
        const sortedLectureIds = Object.keys(attendeesByLecture).sort((a, b) => {
            const lectA = lecturesMap[a];
            const lectB = lecturesMap[b];
            if (lectA.day !== lectB.day) return lectA.day - lectB.day;
            if (lectA.time !== lectB.time) return lectA.time.localeCompare(lectB.time);
            return lectA.title.localeCompare(lectB.title);
        });

        sortedLectureIds.forEach(lectureId => {
            const lecture = lecturesMap[lectureId];
            const attendees = attendeesByLecture[lectureId];

            if (lecture && attendees) {
                csvRows.push(`"PALESTRA: ${lecture.title.replace(/"/g, '""')}"`);
                csvRows.push(`"DIA: Dia ${String(lecture.day).padStart(2, '0')}","HORÁRIO: ${lecture.time}","SALA: ${lecture.room}"`);
                csvRows.push(`"Nome do Aluno","Turma","E-mail","RM"`);

                attendees.forEach(attendee => {
                    const row = [
                        `"${attendee.fullName.replace(/"/g, '""')}"`,
                        `"${attendee.studentClass.replace(/"/g, '""')}"`,
                        `"${attendee.email.replace(/"/g, '""')}"`,
                        `"${attendee.rm.replace(/"/g, '""')}"`
                    ];
                    csvRows.push(row.join(','));
                });

                csvRows.push('');
                csvRows.push('');
            }
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'lista_presenca_por_palestra.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card admin-view">
            <h2>Inscrições Recebidas ({registrations.length})</h2>
            <div className="actions">
                <button className="btn" onClick={downloadCSV} disabled={registrations.length === 0}>Exportar Listas de Presença (CSV)</button>
                <button className="btn" onClick={goToHome}>Ir para a Página Inicial</button>
            </div>
            {registrations.length > 0 ? (
                <div style={{overflowX: 'auto'}}>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Turma</th>
                            <th>Inscrições nas Palestras</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map((reg, index) => (
                            <tr key={index}>
                                <td>{reg.fullName}</td>
                                <td>{reg.email}</td>
                                <td>{reg.studentClass}</td>
                                <td>
                                    <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                                        {Object.entries(reg.selectedLectures).sort(([timeA], [timeB]) => timeA.localeCompare(timeB)).map(([time, lectureId]) => {
                                            const lecture = getLectureInfo(lectureId as string);
                                            return (
                                              <li key={time}><strong>{time}:</strong> {lecture ? lecture.title : 'N/A'}</li>
                                            )
                                        })}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            ) : <p>Nenhuma inscrição recebida ainda.</p>}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);