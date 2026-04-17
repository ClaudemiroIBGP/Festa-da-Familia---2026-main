import React, { useMemo, useState, useRef } from "react";
import { Heart, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, MapPin, Sun, Trophy, Volleyball, Waves } from "lucide-react";

type ParticipantType = "adulto" | "crianca" | "isento";

interface Participant {
  nome: string;
  telefone: string;
  tipo: ParticipantType;
  valor: number;
  cpf?: string;
}

// 🔗 Endpoint Google Apps Script
const ENDPOINT = "https://script.google.com/macros/s/AKfycbyVhbFrBNBH_cRodY4uXjL0hjSKHj2pEJUDmUMfevTAslfp79rJQlEMY-Dz5fRWqPJ1/exec";

export default function App() {
  const [participantes, setParticipantes] = useState<Participant[]>([
    { nome: "", telefone: "", tipo: "adulto", valor: 100, cpf: "" },
  ]);

  const [pagamento, setPagamento] = useState("pix");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const registrationRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const total = useMemo(() => {
    return participantes.reduce((acc, p) => acc + p.valor, 0);
  }, [participantes]);

  const addParticipante = () => {
    setParticipantes((prev) => [...prev, { nome: "", telefone: "", tipo: "adulto", valor: 100 }]);
  };

  const updateParticipante = (index: number, field: keyof Participant, value: any) => {
    const next = [...participantes];
    next[index] = { ...next[index], [field]: value };
    setParticipantes(next);
  };

  const handleSubmit = async () => {
    setErro(null);

    if (!participantes[0].nome || !participantes[0].telefone) {
      setErro("Preencha os campos obrigatórios.");
      return;
    }

    setEnviando(true);

    try {
      await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ participantes, pagamento, total }),
      });

      setSucesso(true);
    } catch {
      setErro("Erro ao enviar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative w-full">
        <div className="relative h-[180px] md:h-[320px]">

          <img
            src="espaco/banner_piscina_web_1.jpg"
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "banner_fallback.jpg";
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <img
              src="logo.png"
              className="w-[50%] md:w-[30%]"
              loading="eager"
            />
          </div>

          <div className="absolute bottom-5 right-5">
            <button
              onClick={() => scrollTo(registrationRef)}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold"
            >
              Garanta seu ingresso
            </button>
          </div>
        </div>
      </section>

      {/* DATA */}
      <div className="flex justify-center py-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow">
          📅 01 de maio de 2026 • ⏰ das 8h às 18h
        </div>
      </div>

      {/* SOBRE */}
      <section className="text-center py-12 px-4">
        <h2 className="text-3xl font-bold mb-4">Sobre o Evento</h2>
        <p className="max-w-xl mx-auto text-gray-600">
          Um dia especial para fortalecer famílias com lazer, comunhão e alegria.
        </p>
      </section>

      {/* ATIVIDADES */}
      <section className="grid md:grid-cols-3 gap-6 p-6">
        {[ 
          { icon: Waves, name: "Piscina" },
          { icon: Volleyball, name: "Esportes" },
          { icon: Trophy, name: "Bingo" },
        ].map((a, i) => (
          <div key={i} className="p-6 bg-gray-100 rounded-xl text-center">
            <a.icon className="mx-auto mb-2" />
            {a.name}
          </div>
        ))}
      </section>

      {/* INSCRIÇÃO */}
      <section ref={registrationRef} className="p-6">
        <h2 className="text-2xl font-bold mb-4">Inscrição</h2>

        {sucesso ? (
          <div className="text-green-600 font-bold">
            Inscrição realizada com sucesso!
          </div>
        ) : (
          <>
            {participantes.map((p, i) => (
              <div key={i} className="mb-4 border p-4 rounded">
                <input
                  placeholder="Nome"
                  value={p.nome}
                  onChange={(e) => updateParticipante(i, "nome", e.target.value)}
                  className="w-full mb-2 border p-2"
                />
                <input
                  placeholder="Telefone"
                  value={p.telefone}
                  onChange={(e) => updateParticipante(i, "telefone", e.target.value)}
                  className="w-full border p-2"
                />
              </div>
            ))}

            <button onClick={addParticipante} className="mb-4 flex items-center gap-2">
              <Plus size={16} /> Adicionar
            </button>

            {erro && <div className="text-red-500">{erro}</div>}

            <div className="mt-4 font-bold">
              Total: R$ {total.toFixed(2)}
            </div>

            <button
              onClick={handleSubmit}
              disabled={enviando}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded"
            >
              {enviando ? "Enviando..." : "Enviar"}
            </button>
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500">
        © 2026 IBGP
      </footer>
    </div>
  );
}
