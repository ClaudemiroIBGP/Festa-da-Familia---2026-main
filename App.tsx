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
  cpf?: string;
}

// ✅ ENDPOINT DO GOOGLE (MANTIDO)
const ENDPOINT = "https://script.google.com/macros/s/AKfycbyVhbFrBNBH_cRodY4uXjL0hjSKHj2pEJUDmUMfevTAslfp79rJQlEMY-Dz5fRWqPJ1/exec";

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [participantes, setParticipantes] = useState<Participant[]>([
    { nome: "", telefone: "", tipo: "adulto", valor: 100, cpf: "" },
  ]);

  const [pagamento, setPagamento] = useState("pix");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showPixChoice, setShowPixChoice] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    setParticipantes((prev) => [...prev, { nome: "", telefone: "", tipo: "adulto", valor: 100 }]);
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

  const maskCpf = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value.substring(0, 14);
  };

  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
  };

  const generatePixPayload = (amount: number) => {
    const pixKey = "gracaepazdf@gmail.com";
    const merchantName = "IBGP FESTA FAMILIA";
    const merchantCity = "BRASILIA";
    
    const f = (id: string, value: string) => id + value.length.toString().padStart(2, '0') + value;

    const gui = f("00", "br.gov.bcb.pix");
    const key = f("01", pixKey);
    const merchantAccountInfo = f("26", gui + key);

    let payload = f("00", "01");
    payload += f("01", "11");
    payload += merchantAccountInfo;
    payload += f("52", "0000");
    payload += f("53", "986");
    payload += f("54", amount.toFixed(2));
    payload += f("58", "BR");
    payload += f("59", merchantName);
    payload += f("60", merchantCity);
    payload += f("62", f("05", "***"));
    payload += "6304";

    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= (payload.charCodeAt(i) << 8);
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
        else crc <<= 1;
      }
    }
    const crcStr = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return payload + crcStr;
  };

  const updateParticipante = (index: number, field: keyof Participant, value: any) => {
    setParticipantes((prev) => {
      const next = [...prev];
      const p = { ...next[index] };

      if (field === "telefone") {
        p.telefone = maskPhone(value);
      } else if (field === "cpf") {
        p.cpf = maskCpf(value);
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

  const handleBlur = (index: number, field: string) => {
    setTouched(prev => ({ ...prev, [`${index}_${field}`]: true }));
  };

  const getFieldError = (index: number, field: keyof Participant) => {
    const isTouched = touched[`${index}_${field}`];
    if (!isTouched) return null;

    const p = participantes[index];
    if (field === "nome" && !p.nome.trim()) return "Nome é obrigatório";
    
    if (index === 0) {
      if (field === "cpf") {
        if (!p.cpf) return "CPF é obrigatório";
        if (!validateCPF(p.cpf)) return "CPF inválido";
      }
      if (field === "telefone") {
        if (!p.telefone) return "Telefone é obrigatório";
        const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
        if (!phoneRegex.test(p.telefone)) return "Formato: (XX) XXXXX-XXXX";
      }
    }
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErro(null);

    // Marcar todos como touched para mostrar erros
    const allTouched: Record<string, boolean> = {};
    participantes.forEach((_, i) => {
      allTouched[`${i}_nome`] = true;
      if (i === 0) {
        allTouched[`0_cpf`] = true;
        allTouched[`0_telefone`] = true;
      }
    });
    setTouched(allTouched);

    // Validação Geral
    let hasError = false;
    participantes.forEach((_, i) => {
      if (getFieldError(i, "nome") || (i === 0 && (getFieldError(0, "cpf") || getFieldError(0, "telefone")))) {
        hasError = true;
      }
    });

    if (hasError) {
      setErro("Por favor, corrija os campos marcados em vermelho.");
      return;
    }

    // Fluxo específico para PIX
    if (pagamento === "pix" && !showPixModal && !showPixChoice && !sucesso) {
      setShowPixChoice(true);
      return;
    }

    setEnviando(true);

    // Verificação de CPF Duplicado (Chamada ao Google Script)
    try {
      const checkResponse = await fetch(`${ENDPOINT}?action=checkCpf&cpf=${participantes[0].cpf}`);
      const checkResult = await checkResponse.json();
      if (checkResult.exists) {
        setErro("Este CPF já possui uma inscrição realizada. Caso precise alterar ou adicionar dependentes, entre em contato com a organização.");
        setEnviando(false);
        return;
      }
    } catch (e) {
      console.warn("Não foi possível verificar duplicidade de CPF, continuando...");
    }

    const payload = {
      pagamento,
      total,
      participantes,
      clientRequestId: `req_${Date.now()}`
    };

    try {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 font-sans">
      {/* Modal Escolha PIX */}
      {showPixChoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Como deseja pagar?</h2>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  setShowPixChoice(false);
                  setShowPixModal(true);
                }} 
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Pagar Agora
              </button>
              <button 
                onClick={() => {
                  setShowPixChoice(false);
                  handleSubmit();
                }} 
                className="w-full py-4 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors border border-gray-200"
              >
                Pagar Depois
              </button>
              <button 
                onClick={() => setShowPixChoice(false)} 
                className="mt-2 text-sm text-gray-500 hover:underline"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal PIX QR Code */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Pagamento via PIX</h2>
            <p className="mb-4 text-gray-600">Valor total: <strong className="text-blue-600 text-xl">R$ {total.toFixed(2)}</strong></p>
            <div className="bg-gray-100 p-6 rounded-xl mb-6 flex flex-col items-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(generatePixPayload(total))}`} 
                alt="QR Code PIX" 
                className="mb-4 shadow-sm bg-white p-2 rounded-lg" 
              />
              <p className="text-[10px] text-gray-500 font-mono break-all bg-white p-2 rounded border border-gray-200 mb-2 select-all">
                {generatePixPayload(total)}
              </p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatePixPayload(total));
                  alert("Código PIX Copia e Cola copiado!");
                }}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Copiar Código PIX
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPixModal(false)} className="flex-1 py-3 rounded-xl bg-gray-200 font-bold">Cancelar</button>
              <button onClick={() => handleSubmit()} className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold">Já paguei</button>
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
          <div className="grid grid-cols-2 gap-4 mx-auto md:mx-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 p-1">
                <img 
                  src={`foto${i}.jpeg`} 
                  alt={`Foto ${i}`} 
                  className="w-full h-full object-cover object-top rounded-lg"
                />
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
            <div className="md:w-1/2 h-64 md:h-auto min-h-[400px]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3840.6724390369236!2d-48.09002392487153!3d-15.715527284913891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935bb556281434e7%3A0xd0e6b8e9e02c002f!2sEst%C3%A2ncia%20Felicidade!5e0!3m2!1spt-BR!2sbr!4v1772211879876!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
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
              <h4 className="text-2xl font-bold mb-2 text-gray-800">Inscrição realizada com sucesso!</h4>
              <p className="text-gray-600 mb-8">
                {pagamento === "pix" && "Para confirmar sua inscrição envie o comprovante do Pix para Magna no telefone 61-99817-3586."}
                {pagamento === "dinheiro" && "Após o pagamento, informar Magna no telefone 61-99817-3586."}
                {pagamento === "Cartão_Templo" && "Após o pagamento, enviar comprovante para Magna no telefone 61-99817-3586."}
              </p>
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
                      <input 
                        type="text" 
                        value={p.nome} 
                        onChange={(e) => updateParticipante(index, "nome", e.target.value)} 
                        onBlur={() => handleBlur(index, "nome")}
                        required 
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${getFieldError(index, "nome") ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`} 
                      />
                      {getFieldError(index, "nome") && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {getFieldError(index, "nome")}</p>}
                    </div>
                    {index === 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CPF do Responsável *</label>
                        <input 
                          type="text" 
                          value={p.cpf} 
                          onChange={(e) => updateParticipante(index, "cpf", e.target.value)} 
                          onBlur={() => handleBlur(index, "cpf")}
                          required 
                          placeholder="000.000.000-00"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${getFieldError(index, "cpf") ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`} 
                        />
                        {getFieldError(index, "cpf") && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {getFieldError(index, "cpf")}</p>}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ingresso *</label>
                      <select value={p.tipo} onChange={(e) => updateParticipante(index, "tipo", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="adulto">Adulto (11+ anos) - R$ 100,00</option>
                        <option value="crianca">Criança (6-10 anos) - R$ 50,00</option>
                        <option value="isento">Grátis (0-5 anos)</option>
                      </select>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone de Contato *</label>
                      <input 
                        type="tel" 
                        value={p.telefone} 
                        onChange={(e) => updateParticipante(index, "telefone", e.target.value)} 
                        onBlur={() => handleBlur(index, "telefone")}
                        required 
                        placeholder="(61) 99999-9999" 
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${getFieldError(index, "telefone") ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`} 
                      />
                      {getFieldError(index, "telefone") && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {getFieldError(index, "telefone")}</p>}
                    </div>
                  )}
                </div>
              ))}

              <button type="button" onClick={addParticipante} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <Plus size={20} /> <span>Adicionar Participante</span>
              </button>

              <div className="bg-white rounded-xl p-6 shadow-md mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Forma de Pagamento</h3>
                <div className="space-y-3">
                  {["pix", "dinheiro", "Cartão_Templo"].map((method) => (
                    <label key={method} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${pagamento === method ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"}`}>
                      <input type="radio" name="payment" value={method} checked={pagamento === method} onChange={() => setPagamento(method)} className="w-5 h-5 text-blue-600" />
                      <span className="ml-3 text-sm font-medium text-gray-700 capitalize">{method.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3 text-red-700">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{erro}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6 items-center">
                <div className="flex-1 bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg w-full">
                  <p className="font-semibold text-blue-800">Valor a Pagar</p>
                  <p className="text-blue-700 text-2xl font-bold">R$ {total.toFixed(2)}</p>
                </div>
                <button type="submit" disabled={enviando} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all flex items-center justify-center gap-3">
                  {enviando ? <Loader2 className="animate-spin" /> : "Enviar Inscrição"}
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
        <p className="text-gray-500 text-sm">© 2026 IBGP • v2.3 • Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
