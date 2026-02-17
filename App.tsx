import { useMemo, useState } from "react";

type ParticipantType = "adulto" | "crianca";

type Participant = {
  nome: string;
  telefone: string; // só dígitos
  tipo: ParticipantType;
  valor: number;
};

type Payment = "PIX" | "DINHEIRO" | "CARTAO_Templo";

// ✅ Se você não estiver usando .env COMMITADO no GitHub Pages,
// deixe o endpoint aqui (URL NOVA /exec).
const FALLBACK_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbw2s6VUA9XenYKYZNsCvMlov9VJIoS1YmeXOV4pVfxZ3-CfyY2hJ9xB_y-NmYaP4Qts/exec";


  
// Se você tiver VITE_FORM_ENDPOINT em um .env (e fizer commit dele), ele sobrescreve.
const ENDPOINT =
  (import.meta as any)?.env?.VITE_FORM_ENDPOINT?.trim?.() || FALLBACK_ENDPOINT;

export default function App() {
  const [participantes, setParticipantes] = useState<Participant[]>([
    { nome: "", telefone: "", tipo: "adulto", valor: 100 },
  ]);

  const [pagamento, setPagamento] = useState<Payment>("PIX");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const total = useMemo(
    () => participantes.reduce((s, p) => s + (Number(p.valor) || 0), 0),
    [participantes]
  );

  function adicionarParticipante() {
    setParticipantes((prev) => [
      ...prev,
      { nome: "", telefone: "", tipo: "adulto", valor: 100 },
    ]);
  }

  function removerParticipante(index: number) {
    if (participantes.length <= 1) return;
    setParticipantes((prev) => prev.filter((_, i) => i !== index));
  }

  function atualizarParticipante(
    index: number,
    campo: keyof Participant,
    valor: string
  ) {
    setParticipantes((prev) => {
      const copia = [...prev];

      if (campo === "telefone") {
        // só dígitos
        valor = valor.replace(/\D/g, "");
      }

      (copia[index] as any)[campo] = valor;

      if (campo === "tipo") {
        const t = valor as ParticipantType;
        copia[index].valor = t === "adulto" ? 100 : 50;
      }

      return copia;
    });
  }

  function validar(): string | null {
    if (!ENDPOINT || !ENDPOINT.includes("script.google.com")) {
      return "Endpoint do formulário não configurado. Confirme a URL do Web App (/exec).";
    }

    const resp = participantes[0];
    if (!resp?.nome?.trim()) return "Preencha o NOME do responsável (1º participante).";
    if (!resp?.telefone?.trim()) return "Preencha o TELEFONE do responsável (1º participante).";

    // valida pelo menos 8 dígitos (ajuste se quiser)
    if (resp.telefone.replace(/\D/g, "").length < 8) {
      return "Telefone do responsável parece curto. Digite apenas números, com DDD.";
    }

    // opcional: valida nomes dos demais participantes se quiser
    return null;
  }

  async function enviar() {
    setErro(null);

    const msg = validar();
    if (msg) {
      setErro(msg);
      return;
    }

    setEnviando(true);

    // ✅ payload no formato que seu Apps Script espera: { action, data }
    // Incluo também "responsavel" por compatibilidade com sua planilha.
    const responsavel = participantes[0];
    const payload = {
      pagamento,
      total,
      responsavel: responsavel.nome,
      telefoneResponsavel: responsavel.telefone,
      participantes,
    };

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        // ✅ SEM headers para evitar preflight/CORS chatos no Apps Script
        body: JSON.stringify({
          action: "criar_inscricao",
          data: payload,
        }),
        // Opcional: ajuda quando o usuário fecha a aba rápido
        keepalive: true,
        redirect: "follow",
      });

      // Apps Script às vezes retorna 302/200 sem JSON “certinho”.
      // Ler como texto é mais robusto.
      const txt = await res.text().catch(() => "");

      // Se o Apps Script estiver retornando JSON, tentamos interpretar.
      let out: any = null;
      try {
        out = txt ? JSON.parse(txt) : null;
      } catch {
        out = null;
      }

      // Se houver um erro explícito do script
      if (out && out.ok === false) {
        throw new Error(out.error || "Falha ao salvar na planilha.");
      }

      // Mesmo se não der pra ler resposta (ou vier vazio),
      // consideramos sucesso se o fetch não lançou erro de rede.
      setSucesso(true);
    } catch (e: any) {
      setErro(
        e?.message ||
          "Erro ao enviar. Verifique sua internet e a implantação do Apps Script."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="p-10 text-center bg-white rounded-xl shadow-lg max-w-md mx-auto mt-20">
        <h1 className="text-2xl font-bold text-green-600">
          Inscrição Confirmada! ✅
        </h1>
        <p className="mt-2 text-gray-600">
          Seus dados foram enviados para registro.
        </p>

        <button
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Fazer Nova Inscrição
        </button>

        <p className="mt-4 text-xs text-gray-500 break-all">
          Endpoint: {ENDPOINT}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Festa da Família 2026 - IBGP</h1>

      <div className="text-sm text-gray-600">
        <p>
          <b>Responsável:</b> preencha o 1º participante com seu nome e telefone.
        </p>
      </div>

      {erro && (
        <div className="border border-red-200 bg-red-50 text-red-700 p-3 rounded">
          {erro}
        </div>
      )}

      {participantes.map((p, i) => (
        <div
          key={i}
          className="border p-4 rounded-xl bg-white shadow-sm space-y-3 relative"
        >
          {participantes.length > 1 && (
            <button
              onClick={() => removerParticipante(i)}
              className="absolute right-4 top-4 text-red-500 text-xs font-bold uppercase"
              type="button"
            >
              Remover
            </button>
          )}

          <input
            placeholder={i === 0 ? "Nome do Responsável" : "Nome do Participante"}
            className="border p-2 w-full rounded"
            value={p.nome}
            onChange={(e) => atualizarParticipante(i, "nome", e.target.value)}
          />

          <input
            placeholder={i === 0 ? "Telefone do Responsável (DDD + número)" : "Telefone (se houver)"}
            className="border p-2 w-full rounded font-mono"
            value={p.telefone}
            onChange={(e) =>
              atualizarParticipante(i, "telefone", e.target.value)
            }
          />

          <select
            className="border p-2 w-full rounded bg-gray-50"
            value={p.tipo}
            onChange={(e) => atualizarParticipante(i, "tipo", e.target.value)}
          >
            <option value="adulto">Adulto – R$ 100</option>
            <option value="crianca">Criança – R$ 50</option>
          </select>
        </div>
      ))}

      <button
        onClick={adicionarParticipante}
        className="bg-green-600 text-white px-4 py-2 rounded font-bold"
        type="button"
      >
        + Adicionar Participante
      </button>

      <div className="border p-4 rounded-xl bg-gray-50 space-y-3">
        <h2 className="font-bold">Forma de pagamento</h2>

        {(["PIX", "DINHEIRO", "CARTAO_Templo"] as Payment[]).map((opt) => (
          <label key={opt} className="block cursor-pointer">
            <input
              type="radio"
              checked={pagamento === opt}
              onChange={() => setPagamento(opt)}
            />{" "}
            {opt.replace("_", " ")}
          </label>
        ))}
      </div>

      <div className="text-2xl font-bold bg-blue-600 text-white p-4 rounded-xl flex justify-between">
        <span>Total:</span>
        <span>R$ {total}</span>
      </div>

      <button
        onClick={enviar}
        disabled={enviando}
        className={`w-full py-4 rounded-xl text-white font-bold text-lg ${
          enviando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
        type="button"
      >
        {enviando ? "SALVANDO NA PLANILHA..." : "FINALIZAR INSCRIÇÃO"}
      </button>

      <p className="text-xs text-gray-500 break-all">
        Endpoint em uso: {ENDPOINT}
      </p>
    </div>
  );
}
