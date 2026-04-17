{/* Hero */}
<section className="relative overflow-hidden w-full bg-white">
  <div className="relative w-full max-w-[1920px] mx-auto h-[150px] sm:h-[220px] md:h-[300px] lg:h-[350px] flex items-center justify-center">

    <img 
      src="espaco/banner_piscina_web_1.jpg" 
      alt="VI Festa da Família IBGP - 2026"
      className="w-full h-full object-cover"
      loading="eager"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "banner_festa_familia_ibgp_1.png";
      }}
    />

    {/* Overlay */}
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <img 
        src="LOGO FESTA DA FAMILIA IBGP..png"
        alt="Logo Festa da Família"
        className="w-[50%] sm:w-[40%] md:w-[30%] lg:w-[25%] h-auto drop-shadow-[0_8px_25px_rgba(0,0,0,0.4)]"
        loading="eager"
      />
    </div>

    {/* Botão */}
    <div className="absolute bottom-[10%] right-[5%] z-20">
      <button 
        onClick={() => scrollTo(registrationRef, "registration")}
        className="bg-[#ff8a3d] text-white font-bold text-xs md:text-sm lg:text-lg px-4 py-2 md:px-8 md:py-3 rounded-xl hover:scale-105 transition-all shadow-lg"
      >
        Garanta seu ingresso!
      </button>
    </div>
  </div>
</section>

{/* DATA FORA DO BANNER */}
<div className="w-full flex justify-center bg-white py-6">
  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl text-sm sm:text-base md:text-lg font-bold shadow-xl">
    📅 01 de maio de 2026 • ⏰ das 8h às 18h
  </div>
</div>
