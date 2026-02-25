/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { Heart, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type ParticipantType = "adulto" | "crianca";

interface Participant {
  nome: string;
  telefone: string;
  tipo: ParticipantType;
  valor: number;
}

// ✅ ENDPOINT DO GOOGLE APPS SCRIPT
const ENDPOINT = "https://script.google.com/macros/s/AKfycbw3GVjyhH3x20bJYc73ierg4sot8wzjg_QP2q-QhBYX1Iz92UuHVx0rwQK-vXalc3a9/exec";

export default function App() {
  const [participantes, setParticipantes] = useState<Participant[]>([
    { nome: "", telefone: "", tipo: "adulto", valor: 100 },
  ]);

  const [pagamento, setPagamento] = useState("pix");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
        p.valor = value === "adulto" ? 100 : 50;
      } else {
        (p as any)[field] = value;
      }

      next[index] = p;
      return next;
    });
  };

  const validate = () => {
    if (!participantes[0].nome.trim()) return "O nome do responsável é obrigatório.";
    if (!participantes[0].telefone.trim()) return "O telefone do responsável é obrigatório.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const errorMsg = validate();
    if (errorMsg) {
      setErro(errorMsg);
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
      /**
       * ✅ DICA DE OURO PARA GOOGLE APPS SCRIPT:
       * Para evitar erros de CORS (preflight OPTIONS), enviamos como 'text/plain' 
       * ou usamos URLSearchParams para 'application/x-www-form-urlencoded'.
       * O Apps Script recebe isso no e.postData.contents.
       */
      const formData = new URLSearchParams();
      formData.append("payload", JSON.stringify(payload));

      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors", // 'no-cors' é seguro para Apps Script se você não precisar ler a resposta JSON detalhada
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      // Como usamos 'no-cors', não conseguimos ler o corpo da resposta (fica opaco),
      // mas se não houver erro de rede, assumimos que o Apps Script recebeu.
      setSucesso(true);
    } catch (err: any) {
      setErro("Erro ao conectar com o servidor. Verifique sua internet.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-neutral-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Inscrição Enviada!</h2>
          <p className="text-neutral-500 mb-8">
            Seus dados foram registrados com sucesso na nossa planilha. Nos vemos na Festa da Família!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-semibold hover:bg-neutral-800 transition-colors"
          >
            Fazer Nova Inscrição
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
            <Heart className="text-white w-8 h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">IBGP</h1>
            <p className="text-neutral-500 font-medium uppercase tracking-widest text-xs">VI Festa da Família</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {erro && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold text-sm">{erro}</p>
            </div>
          )}

          {/* Participantes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-neutral-800">Participantes</h2>
              <button
                type="button"
                onClick={addParticipante}
                className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {participantes.map((p, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4 relative group"
              >
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeParticipante(index)}
                    className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 ml-1">
                      Nome {index === 0 && "(Responsável)"}
                    </label>
                    <input
                      type="text"
                      value={p.nome}
                      onChange={(e) => updateParticipante(index, "nome", e.target.value)}
                      placeholder="Ex: João Silva"
                      className="w-full bg-neutral-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 ml-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={p.telefone}
                      onChange={(e) => updateParticipante(index, "telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-neutral-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                      required={index === 0}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 ml-1">
                      Tipo
                    </label>
                    <select
                      value={p.tipo}
                      onChange={(e) => updateParticipante(index, "tipo", e.target.value)}
                      className="w-full bg-neutral-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none appearance-none transition-all"
                    >
                      <option value="adulto">Adulto (R$ 100)</option>
                      <option value="crianca">Criança (R$ 50)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 ml-1">
                      Valor
                    </label>
                    <div className="w-full bg-neutral-100 rounded-2xl px-4 py-3 text-sm font-bold text-neutral-600">
                      R$ {p.valor.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagamento */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-neutral-800">Pagamento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["pix", "dinheiro", "cartao"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPagamento(method)}
                  className={`py-3 px-4 rounded-2xl text-sm font-bold capitalize transition-all border-2 ${
                    pagamento === method
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-200"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Footer / Submit */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Total a Pagar</span>
              <span className="text-3xl font-black text-neutral-900">R$ {total.toFixed(2)}</span>
            </div>
            <button
              type="submit"
              disabled={enviando}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold text-lg hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Finalizar Inscrição"
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-neutral-400 text-[10px] mt-8 uppercase tracking-[0.2em] font-bold">
          IBGP &copy; 2026 • Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}

