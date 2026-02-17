import { useMemo, useState } from "react";

type Participant = {
  nome: string;
  telefone: string;
  tipo: "adulto" | "crianca";
  valor: number;
};

const ENDPOINT = "https://script.google.com/macros/s/AKfycbw2s6VUA9XenYKYZNsCvMlov9VJIoS1YmeXOV4pVfxZ3-CfyY2hJ9xB_y-NmYaP4Qts/exec";
                  
export default function App() {
  const [participantes, setParticipantes] = useState<Participant[]>([
    { nome: "", telefone: "", tipo: "adulto", valor: 100 },
  ]);
  const [pagamento, setPagamento] = useState<"PIX" | "DINHEIRO" | "CARTAO_Templo">("PIX");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function adicionar() {
    setParticipantes((prev) => [...prev, { nome: "", telefone: "", tipo: "adulto", valor: 100 }]);
  }

  function remover(index: number) {
    if (participantes.length > 1) {
      setParticipantes(participantes.filter((_, i) => i !== index));
    }
  }

  function atualizar(i: number, campo: keyof Participant, valor: any) {
    const copia = [...participantes];
    
    // BLOQUEIO DE LETRAS: Se for telefone, remove tudo que não for dígito
    if (campo === "telefone") {
      valor = valor.replace(/\D/g, ""); 
    }

    (copia[i] as any)[campo] = valor;

    if (campo === "tipo") {
      copia[i].valor = valor === "adulto" ? 100 : 50;
    }
    setParticipantes(copia);
  }

  const total = useMemo(() => participantes.reduce((s, p) => s + (Number(p.valor) || 0), 0), [participantes]);

  async function enviar() {
    if (!participantes[0].nome || !participantes[0].telefone) {
      alert("Por favor, preencha pelo menos o nome e o telefone do responsável.");
      return;
    }

    setEnviando(true);
    const payload = {
      pagamento,
      total,
      participantes,
    };

    try {await fetch(ENDPOINT, {
  method: "POST",
  body: JSON.stringify({
    action: "criar_inscricao",
    data: payload,
  }),
}); }

 catch (err) {
      alert("Erro ao enviar. Verifique a conexão.");
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="p-10 text-center bg-white rounded-xl shadow-lg max-w-md mx-auto mt-20">
        <h1 className="text-2xl font-bold text-green-600">Inscrição Enviada! ✅</h1>
        <p className="mt-2 text-gray-600">Seus dados foram salvos na planilha.</p>
        <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded" onClick={() => window.location.reload()}>
          Nova Inscrição
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Festa da Família 2026 - IBGP</h1>

      {participantes.map((p, i) => (
        <div key={i} className="border p-4 rounded-xl bg-white shadow-sm space-y-3 relative">
          {participantes.length > 1 && (
            <button onClick={() => remover(i)} className="absolute right-4 top-4 text-red-500 text-xs font-bold uppercase">Remover</button>
          )}
          <input
            placeholder="Nome Completo"
            className="border p-2 w-full rounded"
            value={p.nome}
            onChange={(e) => atualizar(i, "nome", e.target.value)}
          />
          <input
            placeholder="Telefone (apenas números)"
            className="border p-2 w-full rounded font-mono"
            value={p.telefone}
            onChange={(e) => atualizar(i, "telefone", e.target.value)}
          />
          <select
            className="border p-2 w-full rounded bg-gray-50"
            value={p.tipo}
            onChange={(e) => atualizar(i, "tipo", e.target.value as any)}
          >
            <option value="adulto">Adulto – R$ 100</option>
            <option value="crianca">Criança – R$ 50</option>
          </select>
        </div>
      ))}

      <button onClick={adicionar} className="bg-green-600 text-white px-4 py-2 rounded font-bold">
        + Adicionar Participante
      </button>

      <div className="border p-4 rounded-xl bg-gray-50 space-y-3">
        <h2 className="font-bold">Forma de pagamento</h2>
        {["PIX", "DINHEIRO", "CARTAO_Templo"].map((opt) => (
          <label key={opt} className="block cursor-pointer">
            <input
              type="radio"
              checked={pagamento === opt}
              onChange={() => setPagamento(opt as any)}
            />{" "}
            {opt.replace('_', ' ')}
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
        className={`w-full py-4 rounded-xl text-white font-bold text-lg ${enviando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {enviando ? "SALVANDO NA PLANILHA..." : "FINALIZAR INSCRIÇÃO"}
      </button>
    </div>
  );
}