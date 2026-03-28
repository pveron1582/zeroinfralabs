import React, { useEffect } from 'react';

interface TeamMember {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

interface ConsultancySiteProps {
  onNavigate?: (url: string) => void;
  onViewTeam?: (users: string[]) => void;
}

export const ConsultancySite: React.FC<ConsultancySiteProps> = ({ onViewTeam }) => {
  const team: TeamMember[] = [
    { name: 'Pedro Sánchez', role: 'Senior Web Developer', email: 'psanchez@devconsultancy.com', avatar: 'P' },
    { name: 'Gonzalo Ruiz', role: 'Systems Administrator', email: 'gruiz@devconsultancy.com', avatar: 'G' },
    { name: 'Arturo Vidal', role: 'UX/UI Designer', email: 'avidal@devconsultancy.com', avatar: 'A' },
    { name: 'Lucía Fernández', role: 'Project Manager', email: 'lfernandez@devconsultancy.com', avatar: 'L' },
  ];

  // Extraer nombres de usuario de los mails (pedro, gonzalo, arturo, lucia)
  const usernames = ['pedro', 'gonzalo', 'arturo', 'lucia'];
  const informedRef = React.useRef(false);

  useEffect(() => {
    // Informar al store sobre los posibles usuarios encontrados (solo una vez)
    if (onViewTeam && !informedRef.current) {
      onViewTeam(usernames);
      informedRef.current = true;
    }
  }, [onViewTeam]);

  return (
    <div className="min-h-full bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">DC</div>
          <span className="text-xl font-bold tracking-tight text-slate-800">DevConsultancy</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600 uppercase tracking-wider">
          <a href="#" className="hover:text-indigo-600 transition-colors">Inicio</a>
          <a href="#servicios" className="hover:text-indigo-600 transition-colors">Servicios</a>
          <a href="#equipo" className="hover:text-indigo-600 transition-colors">Equipo</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Contacto</a>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
          Contratar
        </button>
      </nav>

      {/* Hero Section */}
      <header className="px-8 py-20 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">Soluciones Web <span className="text-indigo-400">Premium</span> para tu Empresa</h1>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">Transformamos ideas en experiencias digitales potentes, seguras y escalables. Más de 10 años impulsando negocios locales.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#servicios" className="bg-indigo-500 hover:bg-indigo-400 px-8 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1">Nuestros Servicios</a>
            <a href="#equipo" className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-xl font-bold backdrop-blur-sm transition-all border border-white/20">Conocer al Equipo</a>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section id="servicios" className="px-8 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-slate-800">Servicios Digitales</h2>
          <div className="w-20 h-1.5 bg-indigo-500 mx-auto rounded-full" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Desarrollo Web</h3>
            <p className="text-slate-600 leading-relaxed">Sitios corporativos, landing pages y e-commerce construidos con las últimas tecnologías para máximo rendimiento.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Hosting & Nube</h3>
            <p className="text-slate-600 leading-relaxed">Infraestructura robusta y administración de servidores para que tu aplicación nunca deje de funcionar.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Apps para Empresas</h3>
            <p className="text-slate-600 leading-relaxed">Creamos herramientas a medida tanto para móviles como para web que optimizan tus procesos internos.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="equipo" className="px-8 py-24 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-3 text-slate-800">Nuestro Equipo</h2>
              <p className="text-slate-500 max-w-md">Profesionales apasionados por la excelencia técnica y el diseño centrado en el usuario.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-1.5 bg-indigo-500 rounded-full" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <div key={i} className="group">
                <div className="aspect-square bg-slate-100 rounded-2xl mb-5 flex items-center justify-center text-4xl font-bold text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner overflow-hidden relative">
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-indigo-400 rounded-2xl m-2 transition-all duration-300" />
                  {member.avatar}
                </div>
                <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{member.name}</h4>
                <p className="text-sm text-indigo-600 font-medium mb-2">{member.role}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {member.email}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">DC</div>
            <span className="text-lg font-bold text-white">DevConsultancy</span>
          </div>
          <div className="text-sm flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Aviso Legal</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
          <p className="text-xs">&copy; 2024 DevConsultancy S.A. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
