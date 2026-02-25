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
  const [showPixModal, setShowPixModal] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Refs para scroll
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

  const maskPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value.substring(0, 15);
  };

  const updateParticipante = (index: number, field: keyof Participant, value: any) => {
    setParticipantes((prev) => {
      const next = [...prev];
      const p = { ...next[index] };

      if (field === "telefone") {
        p.telefone = maskPhone(value);
      } else if (field === "tipo") {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (pagamento === "pix" && !showPixModal) {
      setShowPixModal(true);
      return;
    }

    setErro(null);

    // Validação de Telefone
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!phoneRegex.test(participantes[0].telefone)) {
      setErro("Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX");
      return;
    }

    setEnviando(true);

    const payload = {
      pagamento,
      total,
      participantes,
      clientRequestId: `req_${Date.now()}`
    };

    try {
      // ✅ MÉTODO MAIS ESTÁVEL: Enviar JSON puro como text/plain
      await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });

      setSucesso(true);
      setShowPixModal(false);
    } catch (err: any) {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Modal PIX */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Pagamento via PIX</h2>
            <p className="mb-4 text-gray-600">Valor total: <strong className="text-blue-600 text-xl">R$ {total.toFixed(2)}</strong></p>
            <div className="bg-gray-100 p-6 rounded-xl mb-6 flex flex-col items-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=gracaepazddf@gmail.com`} alt="QR Code" className="mb-4" />
              <p className="text-xs text-gray-500 font-mono">Chave: gracaepazddf@gmail.com</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPixModal(false)} className="flex-1 py-3 rounded-xl bg-gray-200 font-bold">Cancelar</button>
              <button onClick={() => handleSubmit()} className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold">Já paguei</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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
      <section className="relative bg-neutral-900 text-white py-24 px-4 text-center">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-blue-600 via-green-500 to-orange-500" />
        <div className="relative max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">VI Festa da Família IBGP</h2>
          <p className="text-xl text-neutral-200 mb-10">01 de Maio | Estância Felicidade - Brazlândia</p>
          <button 
            onClick={() => scrollTo(registrationRef, "registration")}
            className="bg-white text-rose-500 px-10 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
          >
            Garanta seu ingresso!
          </button>
        </div>
      </section>

      {/* Sobre */}
      <section ref={aboutRef} className="py-20 px-4 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-3xl font-bold text-neutral-800 mb-6">Sobre o Evento</h3>
          <p className="text-neutral-600 leading-relaxed mb-6">
            A VI Festa da Família IBGP é um evento especial projetado para fortalecer os laços familiares em um ambiente acolhedor e cristão. 
            Com atividades para todas as idades, é um dia memorável onde famílias podem se unir em amor, paz e alegria.
          </p>
          <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="aspect-square bg-blue-100 rounded-2xl flex items-center justify-center">
              <Heart className="text-blue-300 w-10 h-10" />
            </div>
          ))}
        </div>
      </section>

      {/* Activities */}
      <section ref={activitiesRef} className="bg-neutral-100 py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { icon: Waves, name: "Piscinas", desc: "Áreas aquáticas" },
            { icon: Square, name: "Futebol", desc: "Campo gramado" },
            { icon: Volleyball, name: "Vôlei", desc: "Quadra de areia" },
            { icon: Sun, name: "Brinquedos", desc: "Infláveis" },
            { icon: Heart, name: "Recreação", desc: "Monitores" },
            { icon: Trophy, name: "Bingo", desc: "Brindes" },
          ].map((act, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl text-center shadow-sm">
              <act.icon className="mx-auto mb-4 text-rose-500 w-8 h-8" />
              <p className="font-bold text-neutral-800">{act.name}</p>
              <p className="text-xs text-neutral-400">{act.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inscrição */}
      <section ref={registrationRef} className="py-20 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-neutral-900 mb-2">{sucesso ? "Inscrição Concluída" : "Formulário de Inscrição"}</h3>
          <div className="w-20 h-1 bg-rose-500 mx-auto" />
        </div>

        {sucesso ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-emerald-100">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            <h4 className="text-2xl font-bold mb-2">Inscrição Confirmada!</h4>
            <p className="text-neutral-500 mb-8">Seus dados foram registrados com sucesso. Nos vemos na festa!</p>
            <button onClick={() => window.location.reload()} className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold">Nova Inscrição</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {participantes.map((p, index) => (
                <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 relative">
                  {index > 0 && (
                    <button type="button" onClick={() => removeParticipante(index)} className="absolute top-4 right-4 text-neutral-300 hover:text-rose-500">
                      <Trash2 size={18} />
                    </button>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">Nome {index === 0 && "(Responsável)"}</label>
                      <input type="text" required value={p.nome} onChange={(e) => updateParticipante(index, "nome", e.target.value)} className="w-full bg-neutral-50 p-3 rounded-xl outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">Telefone</label>
                      <input 
                        type="tel" 
                        required={index === 0} 
                        value={p.telefone} 
                        onChange={(e) => updateParticipante(index, "telefone", e.target.value)} 
                        placeholder="(61) 99999-9999"
                        className="w-full bg-neutral-50 p-3 rounded-xl outline-none" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <select value={p.tipo} onChange={(e) => updateParticipante(index, "tipo", e.target.value)} className="bg-neutral-50 p-3 rounded-xl outline-none text-sm">
                      <option value="adulto">Adulto (R$ 100)</option>
                      <option value="crianca">Criança (R$ 50)</option>
                      <option value="isento">Isento (0-5 anos)</option>
                    </select>
                    <div className="p-3 font-bold text-neutral-700 text-right">R$ {p.valor.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addParticipante} className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-2xl text-neutral-400 font-bold hover:border-rose-500 hover:text-rose-500 transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> Adicionar Participante
            </button>

            <div className="bg-white p-6 rounded-3xl shadow-md">
              <h4 className="font-bold text-gray-800 mb-4">Pagamento</h4>
              <div className="grid grid-cols-3 gap-2">
                {["pix", "dinheiro", "cartao"].map(m => (
                  <button key={m} type="button" onClick={() => setPagamento(m)} className={`py-2 rounded-xl text-xs font-bold uppercase ${pagamento === m ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"}`}>{m}</button>
                ))}
              </div>
              <div className="flex justify-between items-center mt-8">
                <span className="font-bold text-neutral-400 text-xs uppercase">Total</span>
                <span className="text-3xl font-black text-neutral-900">R$ {total.toFixed(2)}</span>
              </div>
              <button type="submit" disabled={enviando} className="w-full mt-6 py-4 bg-rose-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-3">
                {enviando ? <Loader2 className="animate-spin" /> : "Finalizar Inscrição"}
              </button>
            </div>
          </form>
        )}
      </section>

      <footer className="py-12 bg-neutral-900 text-white text-center">
        <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">
          IBGP &copy; 2026 • v2.2 • Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
