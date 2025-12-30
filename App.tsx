
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Shield, 
  AlertCircle, 
  Coins, 
  Settings, 
  Gauge, 
  ChevronRight, 
  Lock, 
  Terminal,
  Activity,
  Fingerprint,
  Scan,
  Video,
  X,
  BarChart3,
  Network,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  Unplug,
  Database,
  Cpu,
  Layers,
  Maximize,
  Briefcase,
  Globe,
  Zap,
  EyeOff,
  Bomb,
  ActivitySquare,
  Binary,
  CpuIcon,
  UserCheck,
  UserX,
  Workflow,
  ArrowDown,
  Target,
  DollarSign,
  Radio,
  Calculator,
  Percent,
  Timer
} from 'lucide-react';
import { analyzeAIUseCase } from './services/geminiService';
import { ROIDiagnostic, ModalType } from './types';

// --- Sistema de Audio Espacial / UI Feedback ---
const useAudioManager = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (type: 'click' | 'hover' | 'modal-open' | 'modal-close' | 'action-success') => {
    initAudio();
    const ctx = audioCtxRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'action-success':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'modal-open':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'modal-close':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      default:
        break;
    }
  };

  return { playSound };
};

// --- Componentes Atómicos de UI ---

const TelemetryLine = ({ label, value, color = "blue" }: { label: string, value: string, color?: string }) => (
  <div className="flex items-center gap-3 py-1">
    <span className="text-[8px] mono font-bold text-white/30 uppercase tracking-widest">{label}</span>
    <div className="flex-grow border-b border-white/10 border-dashed h-px" />
    <span className={`text-[8px] mono font-bold uppercase tracking-widest ${color === "blue" ? "text-blue-400" : color === "rose" ? "text-rose-400" : "text-emerald-400"}`}>{value}</span>
  </div>
);

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const targetDate = new Date('2026-01-14T19:00:00-05:00').getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        setIsLive(true);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLive) {
    return (
      <div className="flex items-center gap-3 px-5 py-2 bg-blue-600/10 border border-blue-500/30 rounded-lg backdrop-blur-xl shadow-lg shadow-blue-500/10">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[10px] font-bold mono text-blue-200 uppercase tracking-widest">ESTADO: TRANSMISIÓN ACTIVA</span>
      </div>
    );
  }

  const TimeBlock = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center gap-0.5 min-w-[55px]">
      <span className="text-3xl font-black mono text-white tracking-tighter tabular-nums leading-none">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[8px] mono text-blue-400 font-bold uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="relative glass px-8 py-5 rounded-2xl flex items-center gap-5 bg-black/80 border-white/10 shadow-2xl overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent group-hover:via-blue-500 transition-all duration-700" />
      <TimeBlock value={timeLeft.days} label="Días" />
      <span className="text-xl font-light text-white/10 mb-3">:</span>
      <TimeBlock value={timeLeft.hours} label="Hrs" />
      <span className="text-xl font-light text-white/10 mb-3">:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className="text-xl font-light text-white/10 mb-3">:</span>
      <TimeBlock value={timeLeft.seconds} label="Seg" />
    </div>
  );
};

const StatusBadge = ({ label, color = "blue" }: { label: string, color?: string }) => (
  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[9px] mono font-bold uppercase tracking-widest ${
    color === "blue" ? "bg-blue-950/30 border-blue-500/40 text-blue-300" : 
    color === "red" ? "bg-rose-950/30 border-rose-500/40 text-rose-300" : 
    "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
  }`}>
    <div className={`w-1.5 h-1.5 rounded-full ${color === "blue" ? "bg-blue-400" : color === "red" ? "bg-rose-400" : "bg-emerald-400"} shadow-[0_0_8px_currentColor]`} />
    {label}
  </div>
);

// --- Componentes de Modal Específicos ---

const ProblemHypeModal = () => (
  <div className="space-y-8">
    <div className="p-8 rounded-2xl bg-amber-600/10 border border-amber-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10"><Bomb size={100}/></div>
      <h4 className="text-xl font-black text-amber-400 uppercase italic mb-4 tracking-tight">El Bucle del Gasto Especulativo</h4>
      <p className="text-base text-white/60 italic leading-relaxed relative z-10">
        La proliferación de pruebas de concepto (PoCs) sin una tesis de inversión robusta agota el capital de innovación sin transformar el core del negocio.
      </p>
    </div>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h5 className="text-[9px] mono font-bold text-white/30 uppercase tracking-[0.4em]">Inercia_Táctica</h5>
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 italic text-sm text-white/60 leading-relaxed">
          "El 85% de las iniciativas de IA fracasan por falta de alineación con el EBITDA y dependencia de arquitecturas externas."
        </div>
      </div>
      <div className="space-y-4">
        <h5 className="text-[9px] mono font-bold text-amber-500/60 uppercase tracking-[0.4em]">Riesgo: Fragmentación de Datos</h5>
        <p className="text-xs text-white/50 italic leading-relaxed">
          La adopción reactiva de herramientas genera silos operativos que incrementan la complejidad técnica a largo plazo.
        </p>
      </div>
    </div>
  </div>
);

// --- Componente Principal ---

export default function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [auditQuery, setAuditQuery] = useState("");
  const [auditResult, setAuditResult] = useState<ROIDiagnostic | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<'audit' | 'calc'>('audit');

  // ROI Calculator State
  const [investment, setInvestment] = useState<string>("");
  const [monthlySavings, setMonthlySavings] = useState<string>("");
  const [roiResults, setRoiResults] = useState<{ annualRoi: number; paybackMonths: number } | null>(null);
  
  const { playSound } = useAudioManager();

  const handleAudit = async () => {
    if (!auditQuery) return;
    playSound('action-success');
    setLoading(true);
    const result = await analyzeAIUseCase(auditQuery);
    setAuditResult(result);
    setLoading(false);
  };

  const calculateROI = () => {
    const inv = parseFloat(investment);
    const sav = parseFloat(monthlySavings);
    if (!isNaN(inv) && !isNaN(sav) && inv > 0) {
      playSound('action-success');
      const annualRoi = ((sav * 12) / inv) * 100;
      const paybackMonths = inv / sav;
      setRoiResults({ annualRoi, paybackMonths });
    }
  };

  const openModal = useCallback((type: ModalType) => {
    playSound('modal-open');
    setActiveModal(type);
  }, [playSound]);

  const closeModal = useCallback(() => {
    playSound('modal-close');
    setActiveModal(null);
  }, [playSound]);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'MATRIX': return (
        <div className="space-y-8">
          <p className="text-lg text-white/60 italic leading-relaxed border-l-2 border-blue-500/40 pl-6">
            Optimización del portafolio mediante la Matriz de Eficiencia Operativa.
          </p>
          <div className="grid md:grid-cols-2 gap-4 h-[400px] mt-8">
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-8 flex flex-col justify-end gap-2 group hover:bg-rose-900/30 transition-all shadow-inner">
              <span className="text-[9px] mono font-bold text-rose-400 uppercase">Zona de Pasivos</span>
              <h5 className="text-lg font-black text-rose-300 uppercase italic tracking-tight">Drenaje de Presupuesto</h5>
              <p className="text-xs text-white/50 italic">Soluciones tácticas que incrementan la deuda técnica y el OPEX.</p>
            </div>
            <div className="bg-blue-950/20 border border-blue-500/30 rounded-2xl p-8 flex flex-col justify-end gap-2 group hover:bg-blue-900/30 transition-all shadow-inner">
              <span className="text-[9px] mono font-bold text-blue-400 uppercase">Zona de Activos</span>
              <h5 className="text-lg font-black text-blue-300 uppercase italic tracking-tight">Soberanía de IA</h5>
              <p className="text-xs text-white/50 italic">Arquitecturas integradas que escalan el margen de contribución.</p>
            </div>
          </div>
        </div>
      );
      case 'PROBLEM_INVISIBLE': return (
        <div className="space-y-8">
          <div className="p-8 rounded-2xl bg-rose-950/10 border border-rose-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><EyeOff size={100}/></div>
            <h4 className="text-xl font-black text-rose-400 uppercase italic mb-4 tracking-tight">Fuga Estructural de Capital</h4>
            <p className="text-base text-white/60 italic leading-relaxed relative z-10">
              La IA superficial genera resultados con una alta tasa de error que requiere supervisión humana constante, neutralizando el ahorro proyectado y quemando horas de talento senior.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-[9px] mono font-bold text-white/30 uppercase tracking-[0.4em]">Indicador_Fuga</h5>
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 italic text-sm text-white/60 leading-relaxed">
                "Por cada dólar en licencias de IA táctica, las empresas incurren en $1.80 de deuda operativa oculta."
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-[9px] mono font-bold text-rose-500/60 uppercase tracking-[0.4em]">Riesgo: Obsolescencia Integrada</h5>
              <p className="text-xs text-white/50 italic leading-relaxed">
                Depender de modelos externos sin una capa de propiedad intelectual propia debilita la ventaja competitiva.
              </p>
            </div>
          </div>
        </div>
      );
      case 'PROBLEM_HYPE': return <ProblemHypeModal />;
      case 'CASE_RETAIL': return (
        <div className="space-y-8">
          <div className="p-8 rounded-2xl bg-blue-600/10 border border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Briefcase size={100}/></div>
            <h4 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">Transformación: Cash Flow 2.0</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[8px] mono font-bold text-white/30 uppercase">Impacto_EBITDA</span>
                <p className="text-4xl font-black text-emerald-400 italic leading-none">+12.4%</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] mono font-bold text-white/30 uppercase">Capex_Recovery</span>
                <p className="text-4xl font-black text-white italic leading-none">1.2 Q</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-white/50 italic leading-relaxed">Automatización de conciliación bancaria y orquestación de pagos mediante modelos de razonamiento probabilístico.</p>
        </div>
      );
      default: return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'REGISTRATION': return "Protocolo de Acceso";
      case 'MATRIX': return "Arquitectura de Valor Real";
      case 'PROBLEM_INVISIBLE': return "Diagnóstico de Fugas";
      case 'PROBLEM_HYPE': return "Filtro de Inercia";
      case 'CASE_RETAIL': return "Reporte de Impacto";
      default: return "Handshake Estratégico";
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-[#f8fafc] selection:bg-blue-500/30">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      
      {/* Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center glass border-b border-white/10 shadow-2xl backdrop-blur-3xl" role="navigation">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="p-2.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform"><Terminal size={16} className="text-white"/></div>
          <div className="flex flex-col">
            <span className="text-[10px] mono font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">Sinapsis Innovadora // Enterprise_Audit</span>
            <span className="text-sm font-black uppercase tracking-tight italic">IA_Strategic <span className="text-white/40">Nexus</span></span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex flex-col items-end">
            <span className="text-[8px] mono font-bold text-white/40 uppercase tracking-[0.2em]">Live_Briefing_Online</span>
            <span className="text-[10px] mono font-bold text-blue-500 uppercase tracking-widest italic">14 ENE 2026 // 19:00 EST</span>
          </div>
          <StatusBadge label="RED: OPERATIVA" />
        </div>
      </nav>

      <main className="relative pt-40 pb-32 px-6 max-w-6xl mx-auto space-y-64">
        
        {/* Hero Section */}
        <section className="text-center space-y-20 relative" aria-labelledby="hero-title">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/5 blur-[120px] pointer-events-none -z-10" />
          
          <div className="space-y-12">
            <div className="flex flex-col items-center gap-6">
              <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[9px] mono font-bold uppercase tracking-[0.4em] shadow-inner">
                <Video size={12} className="opacity-80" /> CLASIFICACIÓN: ESTRATEGIA C-LEVEL
              </div>
              
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.2em] animate-pulse shadow-[0_0_25px_rgba(225,29,72,0.6)] border border-white/20">
                <Radio size={14} />
                Webinar Live!
              </div>
            </div>

            <h1 id="hero-title" className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase italic text-shadow-enterprise animate-fade-up">
              IA en Negocios: <br/>
              <span className="hero-gradient-value not-italic">Activo Estratégico</span> <br/>
              <span className="text-white/90 italic text-4xl lowercase tracking-normal font-black border-y border-white/20 py-2 my-4 block w-fit mx-auto px-10">vs</span>
              <span className="hero-gradient-cost not-italic">Pasivo Táctico</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto italic leading-relaxed animate-fade-in">
              Migra de la experimentación reactiva a la <span className="text-white font-bold underline decoration-blue-500/60 underline-offset-4">orquestación de valor estructural</span>. Audita el retorno real de tus iniciativas de IA antes de comprometer el presupuesto.
            </p>
          </div>

          <div className="flex flex-col items-center gap-16">
            <div className="flex flex-col gap-2 items-center">
              <span className="text-[8px] mono font-bold text-white/30 uppercase tracking-[0.6em]">Core_Sync: Established</span>
              <CountdownTimer />
            </div>

            <div className="flex flex-col gap-6 items-center">
              <button 
                onClick={() => openModal('REGISTRATION')}
                className="group px-14 py-5 btn-handshake rounded-full text-lg font-black uppercase tracking-[0.3em] text-white flex items-center gap-8 active:scale-95 italic shadow-2xl animate-pulse-subtle"
              >
                ASEGURAR ACCESO <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform opacity-70" />
              </button>
            </div>

            {/* Target Audience Subsection */}
            <div className="w-full max-w-5xl mt-8 grid md:grid-cols-2 gap-8 border-t border-white/10 pt-16">
              <div className="space-y-8 text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><UserCheck size={28}/></div>
                  <h3 className="text-base font-black uppercase tracking-[0.3em] mono text-white">Perfil del Participante_Valor</h3>
                </div>
                <ul className="space-y-5">
                  {[
                    "Responsables de la Asignación de Capital con enfoque en ROI tangible.",
                    "Líderes de Transformación Operativa que exigen eficiencia medible.",
                    "Directivos que buscan construir Soberanía Tecnológica y activos propios.",
                    "Gestores de Cambio enfocados en la orquestación de procesos core."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start group">
                      <CheckCircle2 size={22} className="text-emerald-500/80 mt-1 shrink-0 group-hover:text-emerald-400 transition-colors"/>
                      <span className="text-lg italic text-white/70 group-hover:text-white transition-colors leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-8 text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400"><UserX size={28}/></div>
                  <h3 className="text-base font-black uppercase tracking-[0.3em] mono text-white">Exclusiones_Nexus</h3>
                </div>
                <ul className="space-y-5">
                  {[
                    "Interesados en la adopción táctica de herramientas de consumo.",
                    "Perfiles sin incidencia en el EBITDA o en la estrategia financiera.",
                    "Visiones cortoplacistas que priorizan el 'hype' sobre la rentabilidad.",
                    "Entornos de innovación cerrados a la integración de activos digitales."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start group">
                      <X size={22} className="text-rose-500/80 mt-1 shrink-0 group-hover:text-rose-400 transition-colors"/>
                      <span className="text-lg italic text-white/70 group-hover:text-white transition-colors leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Problems (Audit Leakage) */}
        <section className="space-y-24" aria-labelledby="leaks-title">
          <div className="border-l-[4px] border-rose-500/40 pl-8 space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge label="DIAGNÓSTICO: FUGAS OPERATIVAS" color="red" />
              <span className="text-[8px] mono font-bold text-rose-500/60 uppercase tracking-widest">Audit_Ref: 0xFD3</span>
            </div>
            <h2 id="leaks-title" className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-shadow-enterprise">Factores de <br/>Dilución de Capital</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: 'PROBLEM_INVISIBLE', num: "01", title: "Deuda de Verificación", desc: "Sistemas con baja fiabilidad que requieren revisión manual redundante.", icon: <EyeOff size={28}/>, metrics: ["ROI_Drift: -40%", "Deuda_Operativa: Alta"] },
              { id: 'PROBLEM_HYPE', num: "02", title: "Inercia de Pilotos", desc: "Fragmentación de iniciativas aisladas sin ruta clara a producción.", icon: <Bomb size={28}/>, metrics: ["Tasa_Escalabilidad: 12%", "Capital_Ocioso: Alto"] },
              { id: 'PROBLEM_COMPLEXITY', num: "03", title: "Dependencia de Terceros", desc: "Infraestructuras alquiladas que no generan valor patrimonial.", icon: <Layers size={28}/>, metrics: ["Soberanía: Crítica", "Agilidad: Comprometida"] }
            ].map((leak, i) => (
              <article 
                key={i} 
                onClick={() => openModal(leak.id as ModalType)}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col gap-8 group hover:bg-rose-950/[0.05] hover:border-rose-500/40 transition-all shadow-lg cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/0 group-hover:bg-rose-500/10 blur-3xl transition-all" />
                <div className="flex justify-between items-start">
                  <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-all border border-rose-500/20">{leak.icon}</div>
                  <span className="text-[8px] mono font-bold text-white/30 uppercase tracking-widest">AUDIT_LOG: {leak.num}</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{leak.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed italic group-hover:text-white/70 transition-colors">{leak.desc}</p>
                </div>
                <div className="pt-4 border-t border-white/10 space-y-1">
                  {leak.metrics.map((m, idx) => (
                    <TelemetryLine key={idx} label={m.split(':')[0]} value={m.split(':')[1]} color="rose" />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[9px] mono font-bold text-rose-400 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                  DESGLOSE DE IMPACTO <ChevronRight size={10}/>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* The Framework Section: Rediseñado como Timeline/Flow */}
        <section className="space-y-32 relative py-20" aria-labelledby="methodology-title">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] pointer-events-none -z-10" />
          
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <StatusBadge label="FRAMEWORK DE RENTABILIDAD" />
            <h2 id="methodology-title" className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-shadow-enterprise">Hoja de Ruta de <span className="text-blue-500">Activos Digitales</span></h2>
            <p className="text-lg text-white/50 font-medium italic leading-relaxed">Sustituyendo el gasto táctico por la construcción de ventajas competitivas estructurales.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-blue-500/0 via-blue-500/40 to-blue-500/0 hidden md:block" />
            
            <div className="space-y-24 md:space-y-40">
              {[
                { 
                  layer: "01", 
                  title: "Auditoría_Soberana", 
                  sub: "Propiedad_Intelectual", 
                  desc: "Evaluación de la tasa de propiedad sobre los modelos implementados para garantizar la independencia técnica y el valor del equity.", 
                  icon: <Shield size={32}/>, 
                  modal: 'STEP_01',
                  alignment: 'left'
                },
                { 
                  layer: "02", 
                  title: "Optimización_EBITDA", 
                  sub: "Tesis_de_Inversión", 
                  desc: "Identificación de puntos críticos de fricción operativa donde la IA incrementa el margen de contribución de forma inmediata.", 
                  icon: <Gauge size={32}/>, 
                  modal: 'MATRIX',
                  alignment: 'right'
                },
                { 
                  layer: "03", 
                  title: "Orquestación_Core", 
                  sub: "Integración_Transaccional", 
                  desc: "Despliegue de arquitecturas de IA que ejecutan lógica de negocio directa, eliminando la latencia en la toma de decisiones.", 
                  icon: <Network size={32}/>, 
                  modal: 'STEP_03',
                  alignment: 'left'
                }
              ].map((item, i) => (
                <div key={i} className={`relative flex flex-col md:flex-row items-center gap-12 group ${item.alignment === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-black border-2 border-blue-500 group-hover:scale-125 transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] z-10" />
                    <div className="absolute w-12 h-12 bg-blue-500/10 rounded-full animate-ping opacity-30" />
                  </div>

                  <article className="w-full md:w-[45%] glass p-10 rounded-[2.5rem] border-white/10 hover:border-blue-500/40 transition-all flex flex-col group shadow-2xl relative overflow-hidden bg-black/60">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-600/10 blur-3xl group-hover:bg-blue-600/20 transition-all" />
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:bg-blue-600/20 transition-all relative">
                        {item.icon}
                        <span className="absolute -top-2 -left-2 text-[10px] mono font-bold text-blue-500">{item.layer}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-2xl uppercase italic tracking-tight text-white leading-none">{item.title}</h4>
                        <p className="text-[9px] mono font-bold text-blue-400 uppercase tracking-widest italic">{item.sub}</p>
                      </div>
                    </div>

                    <p className="text-base text-white/60 leading-relaxed font-medium italic mb-8 group-hover:text-white/80 transition-colors">{item.desc}</p>
                    
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                         <TelemetryLine label="Nivel" value="Estratégico" />
                         <TelemetryLine label="Impacto" value="Directo" />
                      </div>
                      <button 
                        onClick={() => openModal(item.modal as ModalType)}
                        className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-blue-400 hover:text-white hover:bg-blue-600 transition-all active:scale-95 shadow-lg group/btn"
                      >
                        <Maximize size={18} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </article>

                  {i < 2 && (
                    <div className={`hidden md:block absolute bottom-[-80px] ${item.alignment === 'left' ? 'right-[20%]' : 'left-[20%]'} opacity-30 group-hover:opacity-60 transition-opacity animate-bounce`}>
                      <ArrowDown size={32} className="text-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audit Tool Shell with ROI Calculator */}
        <section id="audit-tool" className="grid lg:grid-cols-2 gap-20 items-center" aria-labelledby="audit-title">
          <div className="space-y-12">
            <div className="space-y-6">
              <StatusBadge label="TERMINAL: NEXUS AUDIT" />
              <h2 id="audit-title" className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-shadow-enterprise">Validación de <br/><span className="text-blue-500">Tesis de IA</span></h2>
              <p className="text-lg text-white/50 font-medium italic leading-relaxed max-w-md">
                Audita la viabilidad de tus iniciativas de IA o proyecta el retorno financiero para optimizar la asignación de capital.
              </p>
            </div>
            <div className="space-y-4 opacity-60">
              <div className="flex items-center gap-3"><Binary size={14} className="text-blue-500"/><span className="text-[10px] mono uppercase tracking-widest font-bold">Checksum: Active</span></div>
              <div className="flex items-center gap-3"><DollarSign size={14} className="text-blue-500"/><span className="text-[10px] mono uppercase tracking-widest font-bold">ROI_Model: Pro_Enterprise</span></div>
            </div>
          </div>

          <div className="p-2 rounded-[3.5rem] glass border-white/10 shadow-2xl relative overflow-hidden bg-black/80">
            {/* Tabs for Audit Box */}
            <div className="flex p-4 gap-2 border-b border-white/5 bg-white/[0.02]">
               <button 
                onClick={() => setActiveToolTab('audit')}
                className={`flex-1 py-3 rounded-2xl text-[10px] mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeToolTab === 'audit' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
               >
                 <CpuIcon size={14}/> IA_Thesis_Audit
               </button>
               <button 
                onClick={() => setActiveToolTab('calc')}
                className={`flex-1 py-3 rounded-2xl text-[10px] mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeToolTab === 'calc' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
               >
                 <Calculator size={14}/> ROI_Projection
               </button>
            </div>

            <div className="p-8 space-y-10">
              {activeToolTab === 'audit' ? (
                <>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] mono font-bold text-blue-500 uppercase tracking-[0.4em] block" htmlFor="audit-query">Input_Estratégico</label>
                      <span className="text-[8px] mono font-bold text-white/30 uppercase tracking-widest">Memory_Buffer: OK</span>
                    </div>
                    <textarea 
                      id="audit-query"
                      value={auditQuery}
                      onChange={(e) => setAuditQuery(e.target.value)}
                      placeholder="Ej: Automatización de logística mediante modelos predictivos de demanda..."
                      className="w-full h-32 bg-black/60 border border-white/10 rounded-2xl p-6 text-base text-white placeholder:text-white/20 outline-none focus:border-blue-500/40 transition-all font-medium italic resize-none shadow-inner"
                    />
                  </div>
                  <button 
                    onClick={handleAudit}
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 rounded-full text-base font-black uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 disabled:opacity-50 btn-handshake italic"
                  >
                    {loading ? "CORRIENDO INFERENCIA..." : "VALIDAR TESIS"}
                  </button>

                  {auditResult && (
                    <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                      <div className="flex justify-between items-center pb-6 border-b border-white/10">
                        <StatusBadge 
                          label={auditResult.category === 'VALUE' ? 'STATUS: ACTIVO ESTRATÉGICO' : 'STATUS: RIESGO DE DILUCIÓN'} 
                          color={auditResult.category === 'VALUE' ? 'emerald' : 'red'}
                        />
                        <span className={`text-3xl font-black italic tracking-tighter ${auditResult.category === 'VALUE' ? 'text-emerald-400' : 'text-rose-400'}`}>{auditResult.roiEstimate}</span>
                      </div>
                      <div className="space-y-4">
                        <span className="text-[8px] mono font-bold text-white/40 uppercase tracking-[0.4em]">Reporte de Auditoría Senior</span>
                        <p className="text-base text-white/60 font-medium italic leading-relaxed border-l-2 border-blue-500/40 pl-6">{auditResult.reasoning}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] mono font-bold text-blue-500 uppercase tracking-[0.4em] ml-2">Asignación CAPEX ($)</label>
                      <input 
                        type="number" 
                        value={investment}
                        onChange={(e) => setInvestment(e.target.value)}
                        placeholder="Inversión Inicial"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/40 transition-all mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] mono font-bold text-blue-500 uppercase tracking-[0.4em] ml-2">Delta_OPEX Mensual ($)</label>
                      <input 
                        type="number" 
                        value={monthlySavings}
                        onChange={(e) => setMonthlySavings(e.target.value)}
                        placeholder="Ahorro Operativo"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/40 transition-all mono"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={calculateROI}
                    className="w-full py-5 bg-blue-600 rounded-full text-base font-black uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 btn-handshake italic"
                  >
                    CALCULAR EFICIENCIA
                  </button>

                  {roiResults && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                      <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/20 text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-blue-400">
                          <Percent size={14}/>
                          <span className="text-[8px] mono font-bold uppercase tracking-widest">ROI_Est proyectado</span>
                        </div>
                        <p className="text-3xl font-black text-emerald-400 italic leading-none">{roiResults.annualRoi.toFixed(0)}%</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/20 text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-blue-400">
                          <Timer size={14}/>
                          <span className="text-[8px] mono font-bold uppercase tracking-widest">Breakeven</span>
                        </div>
                        <p className="text-3xl font-black text-white italic leading-none">{roiResults.paybackMonths.toFixed(1)} <span className="text-xs text-white/40">meses</span></p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Case Studies / Evidence */}
        <section className="space-y-20" aria-labelledby="evidence-title">
          <div className="text-center space-y-5">
            <StatusBadge label="AUDITORÍAS DE CASOS DE ÉXITO" />
            <h2 id="evidence-title" className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-shadow-enterprise">Resultados de <span className="text-blue-500">Transformación</span></h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {[
              { id: 'CASE_RETAIL', title: "Orquestación de Flujos de Capital", result: "+15% Margen", desc: "Optimización de tesorería y ruteo transaccional de alta fidelidad.", icon: <DollarSign size={28}/> },
              { id: 'CASE_FINTECH', title: "Gobernanza de Riesgo Dinámico", result: "90% Eficiencia", desc: "Escalado de procesos críticos mediante auditoría de IA soberana.", icon: <Shield size={28}/> }
            ].map((story, i) => (
              <article key={i} className="glass p-8 rounded-[2.5rem] border-white/10 bg-black/70 flex flex-col gap-8 group hover:border-blue-500/30 transition-all shadow-xl hover:bg-black/80">
                <div className="flex justify-between items-start">
                  <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-all">{story.icon}</div>
                  <div className="text-right">
                    <span className="text-[8px] mono font-bold text-white/40 uppercase tracking-widest">Impacto_Directo</span>
                    <div className="text-4xl font-black text-white italic tracking-tighter drop-shadow-md">{story.result}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tight leading-tight">{story.title}</h4>
                  <p className="text-sm text-white/50 italic group-hover:text-white/80 transition-colors leading-relaxed">{story.desc}</p>
                </div>
                <button 
                  onClick={() => openModal(story.id as ModalType)}
                  className="flex items-center gap-2 text-[9px] mono font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-all group/btn w-fit"
                >
                  AUDITAR REPORTE <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Closing Shell */}
        <footer className="pt-32 text-center space-y-20 relative pb-10" role="contentinfo">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-shadow-enterprise">
              Valida tu <br/> <span className="text-blue-500">Handshake</span>.
            </h2>
            <div className="flex flex-col gap-6 items-center">
              <button 
                onClick={() => openModal('REGISTRATION')}
                className="px-20 py-7 btn-handshake rounded-full text-xl font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 italic"
              >
                FORMALIZAR REGISTRO
              </button>
              <div className="text-[10px] mono font-bold text-white/30 uppercase tracking-[0.5em] italic">Sinapsis Innovadora // Strategic Nexus 2026</div>
            </div>
          </div>
        </footer>
      </main>

      {/* High-Fidelity Modal System */}
      <BaseModal 
        isOpen={activeModal !== null} 
        onClose={closeModal} 
        title={getModalTitle()}
      >
        {activeModal === 'REGISTRATION' ? (
          <div className="space-y-10">
            <div className="p-10 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500/50" />
              <p className="text-xl text-white/70 font-medium italic leading-relaxed">
                Complete el protocolo de validación para asegurar su plaza en el briefing estratégico.
              </p>
            </div>
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[9px] mono font-bold text-blue-500 uppercase tracking-[0.4em] ml-4">Identidad Corporativa</label>
                <input type="text" placeholder="NOMBRE Y CARGO" className="w-full bg-black border border-white/20 rounded-2xl py-5 px-8 text-lg text-white outline-none focus:border-blue-500 transition-all font-black italic shadow-inner uppercase tracking-wider" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] mono font-bold text-blue-500 uppercase tracking-[0.4em] ml-4">Email Corporativo</label>
                <input type="email" placeholder="ejemplo@empresa.com" className="w-full bg-black border border-white/20 rounded-2xl py-5 px-8 text-lg text-white outline-none focus:border-blue-500 transition-all font-black italic shadow-inner tracking-wider" />
              </div>
              <button className="w-full py-7 bg-blue-600 text-white font-black rounded-full text-xl uppercase tracking-[0.3em] italic mt-4 btn-handshake shadow-2xl">
                CONFIRMAR HANDSHAKE
              </button>
            </div>
          </div>
        ) : renderModalContent()}
      </BaseModal>
    </div>
  );
}

const BaseModal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative glass w-full max-w-3xl rounded-[3rem] border border-white/20 p-12 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-500 bg-black/95 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-2">
            <span className="text-blue-500 text-[9px] mono font-bold uppercase tracking-[0.8em]">PROTOCOL_STATUS: READY</span>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none text-shadow-enterprise">{title}</h3>
          </div>
          <button onClick={onClose} className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-white/40 hover:text-white hover:bg-white/[0.1] transition-all active:scale-90 shadow-xl"><X size={24}/></button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto pr-6 custom-scrollbar">
          {children}
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex justify-between items-center opacity-40">
           <span className="text-[7px] mono font-bold uppercase tracking-[0.5em]">Audit_Session: 0x932</span>
           <span className="text-[7px] mono font-bold uppercase tracking-[0.5em]">Sinapsis Innovadora // Nexus</span>
        </div>
      </div>
    </div>
  );
};
