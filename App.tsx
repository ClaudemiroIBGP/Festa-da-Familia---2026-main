/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef } from "react";
import { Heart, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, MapPin, Map, Sun, Trophy, Volleyball, Waves, Square } from "lucide-react";

type ParticipantType = "adulto" | "crianca" | "isento";

interface Participant {
  nome: string;
  telefone: string;
  tipo: ParticipantType;
  valor: number;
}

// ✅ ENDPOINT DO GOOGLE
const ENDPOINT = "https://script.google.com/macros/s/AKfycbyVhbFrBNBH_cRodY4uXjL0hjSKHj2pEJUDmUMfevTAslfp79rJQlEMY-Dz5fRWqPJ1/exec";

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [participantes, setParticipantes] = useState<Participant[]>([
    { nome: "", telefone: "", tipo: "adulto", valor: 100 },
  ]);

  const [pagamento, setPagamento] = useState("pix");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Refs para scroll
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const activitiesRef = useRef<HTMLElement>(null);
  const ticketsRef = useRef<HTMLElement>(null);
  const locationRef = useRef<HTMLElement>(null);
  const registrationRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement>, id: string) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  };

  const total = useMemo(() => {
    return participantes.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
  }, [participantes]);

  const addParticipante = () => {
    setParticipantes((prev) => [
      ...prev,
      { nome: "", telefone: "", tipo: "adulto", valor: 100 },
    ]);
  };

  const removeParticipante = (index: number) => {
    if (participantes.length <= 1) return;
    setParticipantes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateParticipante = (index: number, field: keyof Participant, value: any) => {
    setParticipantes((prev) => {
      const next = [...prev];
      const p = { ...next[index] };

      if (field === "tipo") {
        p.tipo = value as ParticipantType;
        if (value === "adulto") p.valor = 100;
        else if (value === "crianca") p.valor = 50;
        else p.valor = 0;
      } else {
        (p as any)[field] = value;
      }

      next[index] = p;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const payload = {
      pagamento,
      total,
      participantes,
      clientRequestId: `req_${Date.now()}`
    };

    try {
      const params = new URLSearchParams();
      params.append('payload', JSON.stringify(payload));

      await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      alert("DADOS ENVIADOS COM SUCESSO! v2.1");
      setSucesso(true);
    } catch (err: any) {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Header / Nav */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
              <Heart className="text-white w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-neutral-900">IBGP</h1>
              <p className="text-[10px] uppercase tracking-tighter text-neutral-500">VI Festa da Família</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6">
            {[
              { name: "Sobre", ref: aboutRef, id: "about" },
              { name: "Atividades", ref: activitiesRef, id: "activities" },
              { name: "Local", ref: locationRef, id: "location" },
              { name: "Ingressos", ref: ticketsRef, id: "tickets" },
              { name: "Inscrição", ref: registrationRef, id: "registration" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.ref, item.id)}
                className={`text-sm font-bold transition-colors ${activeSection === item.id ? "text-rose-500" : "text-neutral-500 hover:text-neutral-900"}`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative bg-neutral-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/1920/1080')] bg-cover bg-center" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">VI Festa da Família IBGP</h2>
          <p className="text-xl text-neutral-300 mb-10">01 de Maio | Estância Felicidade - Brazlândia</p>
          <button 
            onClick={() => scrollTo(registrationRef, "registration")}
            className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
          >
            Fazer Minha Inscrição
          </button>
        </div>
      </section>

      {/* About */}
      <section ref={aboutRef} className="py-20 px-4 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-6">Um dia inesquecível para sua família</h3>
          <p className="text-neutral-600 leading-relaxed mb-4">
            A Festa da Família IBGP é o momento de celebrarmos juntos a alegria de sermos corpo de Cristo. 
            Um ambiente seguro, divertido e cheio de comunhão.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
              <Sun className="text-orange-500 mb-2" />
              <p className="font-bold text-sm">Dia Inteiro</p>
              <p className="text-xs text-neutral-400">08h às 18h</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
              <Trophy className="text-yellow-500 mb-2" />
              <p className="font-bold text-sm">Gincanas</p>
              <p className="text-xs text-neutral-400">Prêmios e Brindes</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl rotate-2">
          <img src="https://picsum.photos/seed/family/800/600" alt="Família" />
        </div>
      </section>

      {/* Activities */}
      <section ref={activitiesRef} className="bg-neutral-100 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h3 className="text-3xl font-bold text-neutral-900">O que teremos?</h3>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Waves, name: "Piscinas" },
            { icon: Square, name: "Futebol" },
            { icon: Volleyball, name: "Vôlei" },
            { icon: Heart, name: "Recreação" },
          ].map((act, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl text-center shadow-sm hover:shadow-md transition-all">
              <act.icon className="mx-auto mb-4 text-rose-500 w-8 h-8" />
              <p className="font-bold text-neutral-800">{act.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Form */}
      <section ref={registrationRef} className="py-20 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black text-neutral-900 mb-2">Inscrição</h3>
          <p className="text-neutral-500">Preencha os dados abaixo para garantir sua vaga</p>
        </div>

        {sucesso ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-emerald-100">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            <h4 className="text-2xl font-bold mb-2">Inscrição Enviada!</h4>
            <p className="text-neutral-500 mb-8">Verifique sua planilha. Nos vemos lá!</p>
            <button onClick={() => window.location.reload()} className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold">Nova Inscrição</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {erro && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl font-bold text-sm">{erro}</div>}
            
            <div className="space-y-4">
              {participantes.map((p, index) => (
                <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 relative">
                  {index > 0 && (
                    <button type="button" onClick={() => removeParticipante(index)} className="absolute top-4 right-4 text-neutral-300 hover:text-rose-500">
                      <Trash2 size={20} />
                    </button>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">Nome {index === 0 && "(Responsável)"}</label>
                      <input 
                        type="text" 
                        required 
                        value={p.nome} 
                        onChange={(e) => updateParticipante(index, "nome", e.target.value)}
                        className="w-full bg-neutral-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">Telefone</label>
                      <input 
                        type="tel" 
                        required={index === 0} 
                        value={p.telefone} 
                        onChange={(e) => updateParticipante(index, "telefone", e.target.value)}
                        className="w-full bg-neutral-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">Tipo</label>
                      <select 
                        value={p.tipo} 
                        onChange={(e) => updateParticipante(index, "tipo", e.target.value)}
                        className="w-full bg-neutral-50 p-3 rounded-xl outline-none"
                      >
                        <option value="adulto">Adulto (R$ 100)</option>
                        <option value="crianca">Criança (R$ 50)</option>
                        <option value="isento">Isento (0-5 anos)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">Valor</label>
                      <div className="p-3 font-bold text-neutral-700">R$ {p.valor.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addParticipante} className="w-full py-4 border-2 border-dashed border-neutral-200 rounded-3xl text-neutral-400 font-bold hover:border-rose-500 hover:text-rose-500 transition-all flex items-center justify-center gap-2">
              <Plus size={20} /> Adicionar Participante
            </button>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-neutral-100">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-neutral-400 uppercase text-xs">Total a Pagar</span>
                <span className="text-4xl font-black text-neutral-900">R$ {total.toFixed(2)}</span>
              </div>
              <button 
                type="submit" 
                disabled={enviando}
                className="w-full py-5 bg-rose-500 text-white rounded-2xl font-bold text-xl shadow-lg shadow-rose-200 hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {enviando ? <Loader2 className="animate-spin" /> : "Finalizar Inscrição"}
              </button>
            </div>
          </form>
        )}
      </section>

      <footer className="py-12 bg-neutral-900 text-white text-center">
        <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">
          IBGP &copy; 2026 • v2.1 - TESTE DE ENVIO • Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}



