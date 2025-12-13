import React, { useState, useRef } from 'react';
import { MapPin, Heart, Sun, Map, Trophy, Waves, Square, Volleyball, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Participant } from './types';
import PaymentModal from './components/PaymentModal';

const App = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [participants, setParticipants] = useState<Participant[]>([{
    name: '',
    ticketType: 'adult',
    phone: ''
  }]);
  
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix_avista' | 'pix_programado' | 'card_templo'>('pix_avista');
  const [successMessage, setSuccessMessage] = useState({ title: '', body: '' });


  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const activitiesRef = useRef<HTMLElement>(null);
  const ticketsRef = useRef<HTMLElement>(null);
  const locationRef = useRef<HTMLElement>(null);
  const registrationRef = useRef<HTMLElement>(null);

  const scrollToSection = (sectionRef: React.RefObject<HTMLElement>, sectionName: string) => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionName);
  };

  const addParticipant = () => {
    setParticipants([...participants, {
      name: '',
      ticketType: 'adult',
      phone: ''
    }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...participants];
    const participantToUpdate = { ...newParticipants[index] };
    
    if(field === 'ticketType') {
        participantToUpdate[field] = value as 'adult' | 'child' | 'free';
    } else {
        participantToUpdate[field] = value;
    }

    newParticipants[index] = participantToUpdate;
    setParticipants(newParticipants);
  };

  const calculateTotal = () => {
    return participants.reduce((total, participant) => {
      if (participant.ticketType === 'adult') return total + 100;
      if (participant.ticketType === 'child') return total + 50;
      return total;
    }, 0);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = participants.every(p => p.name.trim() && p.ticketType && p.phone.trim());
    if (!isValid) {
      alert('Por favor, preencha todos os campos obrigatórios para todos os participantes.');
      return;
    }
    
    if (paymentMethod === 'card_templo') {
        setSuccessMessage({
            title: 'Inscrição Agendada!',
            body: 'Seus dados foram recebidos. Lembre-se de efetuar o pagamento com cartão diretamente no Templo para garantir sua participação.'
        });
        setRegistrationSuccess(true);
        scrollToSection(registrationRef, 'registration');
    } else {
        setIsPaymentModalOpen(true);
    }
  };
  
  const ticketPrices = [
    { age: '0 a 5 anos', price: 'Grátis', description: 'Crianças até 5 anos não pagam' },
    { age: '6 a 10 anos', price: 'R$ 50,00', description: 'Meia entrada para crianças' },
    { age: 'A partir de 11 anos', price: 'R$ 100,00', description: 'Ingresso adulto' }
  ];

  const activities = [
    { icon: <Waves className="w-8 h-8" />, name: 'Piscinas', description: 'Áreas aquáticas para toda família' },
    { icon: <Square className="w-8 h-8" />, name: 'Futebol', description: 'Campos para partidas amistosas' },
    { icon: <Volleyball className="w-8 h-8" />, name: 'Vôlei', description: 'Quadras de areia para diversão' },
    { icon: <Sun className="w-8 h-8" />, name: 'Brinquedos Infláveis', description: 'Diversão garantida para as crianças' },
    { icon: <Heart className="w-8 h-8" />, name: 'Recreação', description: 'Atividades supervisionadas para crianças' },
    { icon: <Trophy className="w-8 h-8" />, name: 'Bingo', description: 'Diversos Brindes' }
  ];
  
  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      
      {isPaymentModalOpen && (
        <PaymentModal
          totalAmount={totalAmount}
          isInstallment={paymentMethod === 'pix_programado'}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            setSuccessMessage({
                title: 'Inscrição Enviada com Sucesso!',
                body: 'Seus dados foram recebidos. Após a confirmação do seu pagamento PIX, sua inscrição estará garantida. Nos vemos na festa!'
            });
            setRegistrationSuccess(true);
            scrollToSection(registrationRef, 'registration');
          }}
        />
      )}

      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="grid grid-cols-2 gap-4">
  {[
    "/assets/images/foto1.jpeg",
    "/assets/images/foto2.jpeg",
    "/assets/images/foto3.jpeg",
    "/assets/images/foto4.jpeg",
  ].map((src, idx) => (
    <div
      key={idx}
      className="aspect-square rounded-lg overflow-hidden shadow-sm bg-gray-100"
    >
      <img
        src={src}
        alt={`Foto ${idx + 1}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  ))}
</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">IBGP</h1>
                <p className="text-xs text-gray-600">VI Festa da Família</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              {[
                { name: 'Sobre', ref: aboutRef, id: 'about' },
                { name: 'Local', ref: locationRef, id: 'location' },
                { name: 'Atividades', ref: activitiesRef, id: 'activities' },
                { name: 'Ingressos', ref: ticketsRef, id: 'tickets' },
                { name: 'Inscrição', ref: registrationRef, id: 'registration' }
              ].map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.ref, item.id)} className={`text-sm font-medium transition-colors hover:text-blue-600 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-700'}`}>
                  {item.name}
                </button>
              ))}
            </nav>
            <button className="md:hidden text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </header>

      <section ref={heroRef} className="relative bg-gradient-to-r from-blue-600 via-green-500 to-orange-500 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">VI Festa da Família IBGP - 2026</h1>
          <p className="text-xl md:text-2xl mb-8 font-light drop-shadow-md">01 de Maio das 08h às 18h | Estância Felicidade - Brazlândia</p>
          <button onClick={() => scrollToSection(registrationRef, 'registration')} className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-transform transform hover:scale-105 shadow-lg">Garanta seu ingresso!</button>
        </div>
      </section>

      <section ref={aboutRef} id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Sobre o Evento</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">A VI Festa da Família IBGP é um evento especial projetado para fortalecer os laços familiares em um ambiente acolhedor e cristão.</p>
              <p className="text-lg text-gray-700 leading-relaxed">Com atividades para todas as idades, é um dia memorável onde famílias podem se unir em amor, paz e alegria.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (<div key={item} className="aspect-square bg-gradient-to-br from-blue-200 to-green-200 rounded-lg flex items-center justify-center"><Heart className="w-12 h-12 text-white opacity-80" /></div>))}
            </div>
          </div>
        </div>
      </section>

      <section ref={activitiesRef} id="activities" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Atividades Confirmadas</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.map((activity, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-blue-600 mb-4">{activity.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{activity.name}</h3>
                  <p className="text-gray-600">{activity.description}</p>
                </div>
              ))}
            </div>
        </div>
      </section>

      <section ref={locationRef} id="location" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Localização</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:flex">
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

      <section ref={ticketsRef} id="tickets" className="py-20 bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Ingressos e Valores</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-blue-500 mx-auto"></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {ticketPrices.map((ticket, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 text-center border">
                    <h3 className="text-lg font-semibold text-gray-800">{ticket.age}</h3>
                    <p className="text-2xl font-bold text-blue-600 my-2">{ticket.price}</p>
                    <p className="text-sm text-gray-600">{ticket.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={registrationRef} id="registration" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              {registrationSuccess ? 'Inscrição Concluída' : 'Formulário de Inscrição'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-orange-500 mx-auto"></div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 shadow-lg min-h-[400px] flex items-center justify-center">
            {registrationSuccess ? (
              <div className="text-center">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{successMessage.title}</h3>
                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                  {successMessage.body}
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  (Esta é uma simulação. Nenhum pagamento real foi processado.)
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Fazer Nova Inscrição
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegistrationSubmit} className="space-y-6 w-full">
                {participants.map((participant, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md relative">
                    {participants.length > 1 && (
                      <button type="button" onClick={() => removeParticipant(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                    )}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                        <input type="text" value={participant.name} onChange={(e) => updateParticipant(index, 'name', e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ingresso *</label>
                        <select value={participant.ticketType} onChange={(e) => updateParticipant(index, 'ticketType', e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                          <option value="adult">Adulto (11+ anos) - R$ 100,00</option>
                          <option value="child">Criança (6-10 anos) - R$ 50,00</option>
                          <option value="free">Grátis (0-5 anos)</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone de Contato *</label>
                      <input type="tel" value={participant.phone} onChange={(e) => updateParticipant(index, 'phone', e.target.value)} required placeholder="(61) 99999-9999" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addParticipant} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"><Plus className="w-5 h-5" /><span>Adicionar Participante</span></button>
                
                <div className="bg-white rounded-xl p-6 shadow-md mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Forma de Pagamento</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                      <input type="radio" name="paymentMethod" value="pix_avista" checked={paymentMethod === 'pix_avista'} onChange={() => setPaymentMethod('pix_avista')} className="w-5 h-5 text-blue-600 focus:ring-blue-500"/>
                      <span className="ml-3 text-sm font-medium text-gray-700">PIX à vista</span>
                    </label>
                     <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                      <input type="radio" name="paymentMethod" value="pix_programado" checked={paymentMethod === 'pix_programado'} onChange={() => setPaymentMethod('pix_programado')} className="w-5 h-5 text-blue-600 focus:ring-blue-500"/>
                      <span className="ml-3 text-sm font-medium text-gray-700">PIX programado (em até 6x)</span>
                    </label>
                     <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                      <input type="radio" name="paymentMethod" value="card_templo" checked={paymentMethod === 'card_templo'} onChange={() => setPaymentMethod('card_templo')} className="w-5 h-5 text-blue-600 focus:ring-blue-500"/>
                      <span className="ml-3 text-sm font-medium text-gray-700">Cartão (direto no Templo)</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 items-center">
                  <div className="flex-1 bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg">
                    <p className="font-semibold text-blue-800">Valor a Pagar</p>
                    <p className="text-blue-700 text-2xl font-bold">R$ {totalAmount.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all"
                  >
                    Finalizar Inscrição
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center"><Heart className="w-5 h-5 text-white" /></div>
            <h3 className="text-xl font-bold">IBGP - Igreja Batista da Graça e Paz</h3>
          </div>
          <p className="text-gray-400 mb-4">Evento exclusivo para membros e convidados IBGP</p>
          <p className="text-gray-500 text-sm">© 2026 IBGP. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
