/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef } from "react";
import { Heart, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, MapPin, Map, Sun, Trophy, Volleyball, Waves, Square } from "lucide-react";

type ParticipantType = "adult" | "child" | "free";

interface Participant {
  name: string;
  phone: string;
  ticketType: ParticipantType;
}

// ✅ ENDPOINT DO GOOGLE (MANTIDO)
const ENDPOINT = "https://script.google.com/macros/s/AKfycbyVhbFrBNBH_cRodY4uXjL0hjSKHj2pEJUDmUMfevTAslfp79rJQlEMY-Dz5fRWqPJ1/exec";

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [participantes, setParticipantes] = useState<Participant[]>([
    { name: "", phone: "", ticketType: "adult" },
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
    return participantes.reduce((acc, p) => {
      if (p.ticketType === "adult") return acc + 100;
      if (p.ticketType === "child") return acc + 50;
      return acc;
    }, 0);
  }, [participantes]);

  const addParticipante = () => {
    setParticipantes((prev) => [...prev, { name: "", phone: "", ticketType: "adult" }]);
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
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

      // Validação de Telefone
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!phoneRegex.test(participantes[0].telefone)) {
      setErro("Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX");
      return;
    }
    if (pagamento === "pix" && !showPixModal) {
      setShowPixModal(true);
      return;
    }

    setEnviando(true);

    const payload = {
      pagamento,
      total,
      participantes: participantes.map(p => ({
        nome: p.name,
        telefone: p.phone,
        tipo: p.ticketType,
        valor: p.ticketType === "adult" ? 100 : p.ticketType === "child" ? 50 : 0
      })),
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

      setSucesso(true);
      setShowPixModal(false);
    } catch (err: any) {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 font-sans">
      {/* Modal PIX (Simulação) */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Pagamento via PIX</h2>
            <p className="mb-4 text-gray-600">Valor total: <strong className="text-blue-600 text-xl">R$ {total.toFixed(2)}</strong></p>
            <div className="bg-gray-100 p-6 rounded-xl mb-6 flex flex-col items-center">
              <div className="w-48 h-48 bg-gray-300 rounded-lg mb-4 flex items-center justify-center text-gray-500">QR CODE</div>
              <p className="text-xs text-gray-400">Chave: gracaepazddf@gmail.com</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPixModal(false)} className="flex-1 py-3 rounded-xl bg-gray-200 font-bold">Cancelar</button>
              <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold">Já paguei</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-md">
              <Heart className="text-white w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">IBGP</h1>
              <p className="text-xs text-gray-600">VI Festa da Família</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
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
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${activeSection === item.id ? "text-blue-600" : "text-gray-700"}`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-r from-blue-600 via-green-500 to-orange-500 text-white py-24 lg:py-32 text-center px-4">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">VI Festa da Família IBGP - 2026</h1>
          <p className="text-xl md:text-2xl mb-8 font-light drop-shadow-md">01 de Maio das 08h às 18h | Estância Felicidade - Brazlândia</p>
          <button 
            onClick={() => scrollTo(registrationRef, "registration")}
            className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Garanta seu ingresso!
          </button>
        </div>
      </section>

      {/* Sobre */}
      <section ref={aboutRef} className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Sobre o Evento</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto md:mx-0 mb-8" />
            <p className="text-lg text-gray-700 leading-relaxed mb-6">A VI Festa da Família IBGP é um evento especial projetado para fortalecer os laços familiares em um ambiente acolhedor e cristão.</p>
            <p className="text-lg text-gray-700 leading-relaxed">Com atividades para todas as idades, é um dia memorável onde famílias podem se unir em amor, paz e alegria.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-blue-200 to-green-200 rounded-lg flex items-center justify-center">
                <Heart className="w-12 h-12 text-white opacity-80" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Atividades */}
      <section ref={activitiesRef} className="py-20 bg-gradient-to-br from-green-50 to-blue-50 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Atividades Confirmadas</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto mb-16" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Waves, name: "Piscinas", desc: "Áreas aquáticas para toda família" },
              { icon: Square, name: "Futebol", desc: "Campos para partidas amistosas" },
              { icon: Volleyball, name: "Vôlei", desc: "Quadras de areia para diversão" },
              { icon: Sun, name: "Brinquedos Infláveis", desc: "Diversão garantida para as crianças" },
              { icon: Heart, name: "Recreação", desc: "Atividades supervisionadas" },
              { icon: Trophy, name: "Bingo", desc: "Diversos Brindes" },
            ].map((act, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
                <act.icon className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{act.name}</h3>
                <p className="text-gray-600">{act.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Localização */}
      <section ref={locationRef} className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Localização</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto mb-16" />
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:flex text-left">
            <div className="md:w-1/2 p-8">
              <div className="flex items-start space-x-4 mb-6">
                <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Estância Felicidade</h3>
                  <p className="text-gray-600">Incra 07 G 02 - Brazlândia, Brasília - DF</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-200 h-64 md:h-auto flex items-center justify-center">
              <Map className="w-16 h-16 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Ingressos */}
      <section ref={ticketsRef} className="py-20 bg-gradient-to-br from-orange-50 to-blue-50 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Ingressos e Valores</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-blue-500 mx-auto mb-16" />
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { age: "0 a 5 anos", price: "Grátis", desc: "Crianças até 5 anos não pagam" },
              { age: "6 a 10 anos", price: "R$ 50,00", desc: "Meia entrada para crianças" },
              { age: "A partir de 11 anos", price: "R$ 100,00", desc: "Ingresso adulto" },
            ].map((ticket, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center border shadow-md">
                <h3 className="text-lg font-semibold text-gray-800">{ticket.age}</h3>
                <p className="text-2xl font-bold text-blue-600 my-2">{ticket.price}</p>
                <p className="text-sm text-gray-600">{ticket.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inscrição */}
      <section ref={registrationRef} className="py-20 bg-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">{sucesso ? "Inscrição Concluída" : "Formulário de Inscrição"}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-orange-500 mx-auto mb-16" />
          
          {sucesso ? (
            <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-emerald-100">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h4 className="text-2xl font-bold mb-2 text-gray-800">Inscrição Confirmada!</h4>
              <p className="text-gray-600 mb-8">✅ Seus dados foram recebidos. Nos vemos na festa!</p>
              <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700">Fazer Nova Inscrição</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {participantes.map((p, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md relative border border-gray-100">
                  {index > 0 && (
                    <button type="button" onClick={() => removeParticipante(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                      <input type="text" value={p.name} onChange={(e) => updateParticipante(index, "name", e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ingresso *</label>
                      <select value={p.ticketType} onChange={(e) => updateParticipante(index, "ticketType", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="adult">Adulto (11+ anos) - R$ 100,00</option>
                        <option value="child">Criança (6-10 anos) - R$ 50,00</option>
                        <option value="free">Grátis (0-5 anos)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone de Contato *</label>
                    <input type="tel" value={p.phone} onChange={(e) => updateParticipante(index, "phone", e.target.value)} required placeholder="(61) 99999-9999" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              ))}

              <button type="button" onClick={addParticipante} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <Plus size={20} /> <span>Adicionar Participante</span>
              </button>

              <div className="bg-white rounded-xl p-6 shadow-md mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Forma de Pagamento</h3>
                <div className="space-y-3">
                  {["pix", "dinheiro", "card_templo"].map((method) => (
                    <label key={method} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${pagamento === method ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"}`}>
                      <input type="radio" name="payment" value={method} checked={pagamento === method} onChange={() => setPagamento(method)} className="w-5 h-5 text-blue-600" />
                      <span className="ml-3 text-sm font-medium text-gray-700 capitalize">{method.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 items-center">
                <div className="flex-1 bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg w-full">
                  <p className="font-semibold text-blue-800">Valor a Pagar</p>
                  <p className="text-blue-700 text-2xl font-bold">R$ {total.toFixed(2)}</p>
                </div>
                <button type="submit" disabled={enviando} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all flex items-center justify-center gap-3">
                  {enviando ? <Loader2 className="animate-spin" /> : "Finalizar Inscrição"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 text-center px-4">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold">IBGP - Igreja Batista da Graça e Paz</h3>
        </div>
        <p className="text-gray-400 mb-4">Evento exclusivo para membros e convidados IBGP</p>
        <p className="text-gray-500 text-sm">© 2026 IBGP • v2.1 • Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
