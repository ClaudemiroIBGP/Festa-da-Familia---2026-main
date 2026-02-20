import React, { useMemo, useState } from "react";

type ParticipantType = "adulto" | "crianca";

type Participant = {
  nome: string;
  telefone: string; // vamos salvar só dígitos
  tipo: ParticipantType;
  valor: number;
};

type PaymentType = "pix" | "dinheiro" | "cartao_templo";

// ✅ ENDPOINT CORRIGIDO - ESTA É A CORREÇÃO PRINCIPAL!
const ENDPOINT = "https://script.google.com/macros/s/AKfycbwZImn5Rtu4MYie0-YCcU_NF7_8re_OirKck2z2uYgwefqNfkOuiYBcIE5Q795e_ila/exec";

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function moneyBRL(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function App() {
  const [participantes, setParticipantes] = useState([
    { nome: "", telefone: "", tipo: "adulto", valor: 100 },
  ]);

  const [pagamento, setPagamento] = useState("pix");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [debugResposta, setDebugResposta] = useState("");

  const total = useMemo(() => {
    return participantes.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
  }, [participantes]);

  function addParticipante() {
    setParticipantes((prev) => [
      ...prev,
      { nome: "", telefone: "", tipo: "adulto", valor: 100 },
    ]);
  }

  function removeParticipante(index: number) {
    if (participantes.length <= 1) return;
    setParticipantes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateParticipante(
    index: number,
    field: keyof Participant,
    value: string
  ) {
    setParticipantes((prev) => {
      const next = [...prev];
      const p = { ...next[index] };

      if (field === "telefone") {
        p.telefone = onlyDigits(value);
      } else if (field === "nome") {
        p.nome = value;
      } else if (field === "tipo") {
        const t = value as ParticipantType;
        p.tipo = t;
        p.valor = t === "adulto" ? 100 : 50;
      } else if (field === "valor") {
        p.valor = Number(value) || 0;
      }

      next[index] = p;
      return next;
    });
  }

  function validar(): string | null {
    if (!ENDPOINT || ENDPOINT.includes("COLE_AQUI") || ENDPOINT.includes("Error") || ENDPOINT.includes("knowledge base")) {
      return "ENDPOINT não configurado corretamente. Verifique o código.";
    }

    const resp = participantes[0];
    if (!resp?.nome?.trim()) return "Preencha o NOME do responsável (1º participante).";
    if (!resp?.telefone?.trim()) return "Preencha o TELEFONE do responsável (1º participante).";
    if (resp.telefone.length < 10) return "Telefone do responsável parece curto. Use DDD + número (apenas dígitos).";

    // opcional: exigir nome para todos os participantes
    for (let i = 0; i < participantes.length; i++) {
      if (!participantes[i].nome.trim()) return `Preencha o nome do participante #${i + 1}.`;
    }

    return null;
  }

  async function enviar() {
    // 🔍 LOGS DE DEBUG ADICIONADOS
    console.log('🔍 INICIANDO DEBUG');
    console.log('🔍 ENDPOINT atual:', ENDPOINT);
    
    setErro(null);
    setDebugResposta("");
    setSucesso(false);

    const msg = validar();
    if (msg) {
      console.log('❌ Erro de validação:', msg);
      setErro(msg);
      return;
    }

    setEnviando(true);

    const payload = {
      pagamento,
      total,
      participantes,
    };

    // 🔍 LOGS DETALHADOS
    console.log('=== DEBUG COMPLETO ===');
    console.log('📍 ENDPOINT:', ENDPOINT);
    console.log('📦 Payload original:', payload);
    console.log('📦 Participantes:', participantes);
    console.log('💰 Total:', total);
    console.log('💳 Pagamento:', pagamento);
    console.log('📤 JSON que será enviado:', JSON.stringify({ data: payload }));
    console.log('=====================');

    try {
      console.log('🚀 Enviando requisição...');
      
      // IMPORTANTE: sem headers para evitar preflight/CORS chato com Apps Script
      const res = await fetch(ENDPOINT, {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify({ data: payload }),
      });

      console.log('📥 Resposta recebida:', res);
      console.log('📊 Status:', res.status);
      console.log('✅ OK?', res.ok);

      const txt = await res.text();
      console.log('📄 Texto da resposta:', txt);
      
      setDebugResposta(txt);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}. Resposta: ${txt || "(vazia)"}`);
      }

      let out: any;
      try {
        out = txt ? JSON.parse(txt) : null;
        console.log('🔄 JSON parseado:', out);
      } catch {
        throw new Error(`Resposta do Apps Script não é JSON: ${txt || "(vazia)"}`);
      }

      if (!out || out.ok !== true) {
        throw new Error(out?.error || `Apps Script não confirmou ok:true. Resposta: ${txt}`);
      }

      console.log('✅ SUCESSO TOTAL!');
      setSucesso(true);
    } catch (e: any) {
      console.log('❌ ERRO CAPTURADO:', e);
      setErro(e?.message || "Falha ao enviar para a planilha.");
    } finally {
      setEnviando(false);
    }
  }

  function resetForm() {
    setParticipantes([{ nome: "", telefone: "", tipo: "adulto", valor: 100 }]);
    setPagamento("pix");
    setErro(null);
    setDebugResposta("");
    setSucesso(false);
  }

  // UI simples sem depender de Tailwind (funciona em qualquer projeto)
  const styles: Record<string, React.CSSProperties> = {
    page: {
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      background: "#f6f8fb",
      minHeight: "100vh",
      padding: 20,
    },
    container: {
      maxWidth: 900,
      margin: "0 auto",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    brand: {
      fontWeight: 800,
      fontSize: 22,
      lineHeight: 1.1,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      color: "#6b7280",
      fontWeight: 600,
    },
    card: {
      background: "white",
      borderRadius: 14,
      boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
      padding: 16,
      marginBottom: 14,
      border: "1px solid #eef2f7",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1.3fr 1fr 0.8fr 0.6fr",
      gap: 10,
    },
    label: {
      fontSize: 12,
      color: "#6b7280",
      fontWeight: 700,
      marginBottom: 6,
      display: "block",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid #dbe3ef",
      outline: "none",
      fontSize: 14,
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid #dbe3ef",
      outline: "none",
      fontSize: 14,
      background: "#fff",
    },
    btn: {
      border: "none",
      borderRadius: 12,
      padding: "12px 14px",
      cursor: "pointer",
      fontWeight: 800,
    },
    btnPrimary: {
      background: "#1d4ed8",
      color: "white",
    },
    btnGreen: {
      background: "#16a34a",
      color: "white",
    },
    btnGhost: {
      background: "#eef2ff",
      color: "#1d4ed8",
    },
    btnDanger: {
      background: "#fee2e2",
      color: "#991b1b",
    },
    error: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#991b1b",
      borderRadius: 12,
      padding: 12,
      fontWeight: 700,
      marginBottom: 14,
      whiteSpace: "pre-wrap" as const,
    },
    ok: {
      background: "#ecfdf5",
      border: "1px solid #bbf7d0",
      color: "#065f46",
      borderRadius: 14,
      padding: 18,
      textAlign: "center" as const,
    },
    totalBox: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#e0f2fe",
      border: "1px solid #bae6fd",
      borderRadius: 14,
      padding: 14,
      fontWeight: 900,
      fontSize: 18,
    },
    small: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 10,
      wordBreak: "break-all" as const,
    },
  };

  if (sucesso) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.ok}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>
                Inscrição Confirmada! ✅
              </div>
              <div style={{ fontSize: 16 }}>
                Seus dados foram gravados na planilha.
              </div>
            </div>

            <button
              style={{ ...styles.btn, ...styles.btnPrimary, width: "100%", marginTop: 16 }}
              onClick={resetForm}
            >
              Fazer nova inscrição
            </button>

            <div style={styles.small}>
              Endpoint em uso: {ENDPOINT}
            </div>

            {/* Debug opcional */}
            {debugResposta && (
              <div style={styles.small}>
                Resposta do servidor: {debugResposta}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ fontSize: 32 }}>
            ♥
          </div>
          <div>
            <div style={styles.brand}>
              IBGP
            </div>
            <div style={styles.subtitle}>
              VI Festa da Família
            </div>
          </div>
        </div>

        {erro && <div style={styles.error}>{erro}</div>}

        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>
              Participantes
            </h3>

            <button
              style={{ ...styles.btn, ...styles.btnGhost }}
              onClick={addParticipante}
              type="button"
            >
              + Adicionar Participante
            </button>
          </div>

          <div style={styles.small}>
            O 1º participante será tratado como responsável (nome e telefone obrigatórios).
          </div>
        </div>

        {participantes.map((p, i) => (
          <div key={i} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h4 style={{ margin: 0 }}>
                {i === 0 ? "Responsável" : `Participante #${i + 1}`}
              </h4>

              {participantes.length > 1 && (
                <button
                  style={{ ...styles.btn, ...styles.btnDanger }}
                  onClick={() => removeParticipante(i)}
                  type="button"
                >
                  Remover
                </button>
              )}
            </div>

            <div style={styles.row}>
              <div>
                <label style={styles.label}>
                  Nome
                </label>
                <input
                  style={styles.input}
                  value={p.nome}
                  onChange={(e) => updateParticipante(i, "nome", e.target.value)}
                  placeholder={i === 0 ? "Nome do responsável" : "Nome do participante"}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Telefone (apenas números)
                </label>
                <input
                  style={styles.input}
                  value={p.telefone}
                  onChange={(e) => updateParticipante(i, "telefone", e.target.value)}
                  placeholder="61999999999"
                />
              </div>

              <div>
                <label style={styles.label}>
                  Tipo
                </label>
                <select
                  style={styles.select}
                  value={p.tipo}
                  onChange={(e) => updateParticipante(i, "tipo", e.target.value)}
                >
                  <option value="adulto">Adulto</option>
                  <option value="crianca">Criança</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>
                  Valor
                </label>
                <input
                  style={styles.input}
                  type="number"
                  value={p.valor}
                  onChange={(e) => updateParticipante(i, "valor", e.target.value)}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>
        ))}

        <div style={styles.card}>
          <h3 style={{ margin: "0 0 16px 0" }}>
            Forma de Pagamento
          </h3>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                checked={pagamento === "pix"}
                onChange={() => setPagamento("pix")}
              />
              PIX
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                checked={pagamento === "dinheiro"}
                onChange={() => setPagamento("dinheiro")}
              />
              Dinheiro
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                checked={pagamento === "cartao_templo"}
                onChange={() => setPagamento("cartao_templo")}
              />
              Cartão (direto no templo)
            </label>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.totalBox}>
            <span>Total</span>
            <span>{moneyBRL(total)}</span>
          </div>

          <button
            style={{
              ...styles.btn,
              ...styles.btnGreen,
              width: "100%",
              marginTop: 16,
              fontSize: 16,
            }}
            onClick={enviar}
            disabled={enviando}
          >
            {enviando ? "Enviando para a planilha..." : "Finalizar Inscrição"}
          </button>

          <div style={styles.small}>
            Endpoint: {ENDPOINT}
          </div>

          {debugResposta && (
            <div style={styles.small}>
              Última resposta do servidor: {debugResposta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
