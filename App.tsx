import { useState } from 'react'

type Participant = {
  nome: string
  telefone: string
  tipo: string
  valor: number
}

const ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzZqMHznHXqprPyvPYqVOUbBPr-QiUNjfdJz5hBNa7YZWOFgqhVDeD2T-U7HK9kjodL/exec'

export default function App() {
  const [participantes, setParticipantes] = useState<Participant[]>([
    { nome: '', telefone: '', tipo: 'adulto', valor: 100 },
  ])

  const [pagamento, setPagamento] = useState('PIX')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function adicionar() {
    setParticipantes([
      ...participantes,
      { nome: '', telefone: '', tipo: 'adulto', valor: 100 },
    ])
  }

  function atualizar(i: number, campo: keyof Participant, valor: any) {
    const copia = [...participantes]
    copia[i][campo] = valor

    if (campo === 'tipo') {
      copia[i].valor = valor === 'adulto' ? 100 : 50
    }

    setParticipantes(copia)
  }

  const total = participantes.reduce((s, p) => s + p.valor, 0)

  async function enviar() {
    setEnviando(true)

    const payload = {
      data: new Date().toISOString(),
      pagamento,
      total,
      participantes,
    }

    await fetch(ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    setSucesso(true)
    setEnviando(false)
  }

  if (sucesso) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Inscrição enviada ✅</h1>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Inscrição – Festa da Família</h1>

      {participantes.map((p, i) => (
        <div key={i} className="border p-4 rounded space-y-3">
          <input
            placeholder="Nome"
            className="border p-2 w-full"
            value={p.nome}
            onChange={(e) => atualizar(i, 'nome', e.target.value)}
          />

          <input
            placeholder="Telefone"
            className="border p-2 w-full"
            value={p.telefone}
            onChange={(e) => atualizar(i, 'telefone', e.target.value)}
          />

          <select
            className="border p-2 w-full"
            value={p.tipo}
            onChange={(e) => atualizar(i, 'tipo', e.target.value)}
          >
            <option value="adulto">Adulto – R$ 100</option>
            <option value="crianca">Criança – R$ 50</option>
          </select>
        </div>
      ))}

      <button
        onClick={adicionar}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Participante
      </button>

      <div className="border p-4 rounded space-y-3">
        <h2 className="font-bold">Forma de pagamento</h2>

        {['PIX', 'DINHEIRO', 'CARTÃO TEMPLO'].map((m) => (
          <label key={m} className="block">
            <input
              type="radio"
              checked={pagamento === m}
              onChange={() => setPagamento(m)}
            />{' '}
            {m}
          </label>
        ))}
      </div>

      <div className="text-xl font-bold">Total: R$ {total}</div>

      <button
        onClick={enviar}
        disabled={enviando}
        className="bg-blue-600 text-white px-6 py-3 rounded w-full"
      >
        {enviando ? 'Enviando...' : 'Finalizar inscrição'}
      </button>
    </div>
  )
}
