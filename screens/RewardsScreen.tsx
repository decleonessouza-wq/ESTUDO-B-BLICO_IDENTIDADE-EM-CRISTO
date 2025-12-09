import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';
import { SOUNDS, ESTUDO_PDF_URL } from '../constants';
import NovaIdentidade from '../components/NovaIdentidade';

const RewardsScreen: React.FC = () => {
  const { userName, navigateTo, photo, setPhoto, birthDate, setBirthDate } =
    useAppContext();

  const idCardRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sexo, setSexo] = useState('Masculino');

  const playPhotoUploadSound = useSound(SOUNDS.PHOTO_UPLOAD.src, 0.5);
  const playDownloadSound = useSound(SOUNDS.DOWNLOAD.src, 0.5);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, []);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      playPhotoUploadSound();
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadImage = (
    elementRef: React.RefObject<HTMLDivElement>,
    filename: string
  ) => {
    if (elementRef.current && (window as any).html2canvas) {
      playDownloadSound();
      (window as any)
        .html2canvas(elementRef.current, {
          backgroundColor: '#1f2937',
        })
        .then((canvas: any) => {
          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
    }
  };

  const handleGeneratePdfCarta = () => {
    // 1. Salva o nome no localStorage para o template ler
    localStorage.setItem('cartaUserName', userName);
    // 2. Abre o template em uma nova aba
    window.open('/carta_template.html', '_blank');
    // 3. Som de download
    playDownloadSound();
  };

  const formattedDate = birthDate
    ? new Date(birthDate + 'T00:00:00').toLocaleDateString('pt-BR')
    : 'DD/MM/AAAA';

  return (
    <AnimatedScreen>
      <div className="w-full max-w-5xl text-center text-white p-4">
        <h1 className="text-4xl font-bold mb-2">Suas Recompensas Espirituais</h1>
        <p className="text-gray-300 mb-8">
          Preencha os dados para gerar sua identidade e baixe seus documentos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* ID Card Section */}
          <div className="bg-gray-800/90 border border-cyan-500/40 p-6 rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <h2 className="text-2xl font-bold mb-1 text-blue-400">
              Carteira de Identidade Espiritual
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Preencha seus dados e gere sua identidade celestial personalizada.
            </p>

            <div className="flex justify-center my-4">
              <NovaIdentidade
                ref={idCardRef}
                userName={userName}
                photo={photo}
                birthDate={birthDate}
                sexo={sexo}
              />
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 p-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                <i data-lucide="upload" className="w-5 h-5" />
                {photo ? 'Alterar Foto' : 'Carregar Foto 3x4'}
              </button>

              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                className="bg-gray-700/80 border border-gray-600 rounded-lg p-3 w-full text-center text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>

              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="bg-gray-700/80 border border-gray-600 rounded-lg p-3 w-full text-center text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                handleDownloadImage(idCardRef, 'identidade_espiritual')
              }
              className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 p-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <i data-lucide="download" className="w-5 h-5" />
              Baixar Identidade
            </button>
          </div>

          {/* Letter Section */}
          <div className="relative bg-gradient-to-br from-sky-900/80 via-indigo-900/80 to-slate-900/90 border border-cyan-500/50 p-[1px] rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_#22d3ee,_transparent_60%),radial-gradient(circle_at_bottom,_#a855f7,_transparent_60%)] pointer-events-none" />
            <div className="relative bg-gray-900/95 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-cyan-300">
                    Carta de Alforria Espiritual
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Um lembrete visual da liberdade que você recebeu em Cristo.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                  <i data-lucide="sparkles" className="w-4 h-4" />
                  Exclusivo da Jornada
                </span>
              </div>

              <div
                ref={letterRef}
                className="p-6 bg-slate-900/90 text-left rounded-xl mb-4 text-sm text-gray-200 leading-relaxed font-serif border border-slate-700/80 shadow-inner"
              >
                <h3 className="text-center text-xl font-bold mb-4 text-cyan-300 tracking-wide">
                  DECLARAÇÃO DE LIBERDADE EM CRISTO
                </h3>
                <p className="mb-4">
                  Pelo presente documento, declara-se que{' '}
                  <span className="font-bold text-white">
                    {userName || '________________'}
                  </span>
                  , anteriormente cativo(a) pela lei do pecado e da morte, foi
                  plenamente e eternamente liberto(a) pelo sangue de Jesus
                  Cristo.
                </p>
                <p className="mb-4">
                  Toda dívida foi paga na cruz. Não há mais condenação, culpa
                  ou acusação válidas diante de Deus. A antiga natureza foi
                  crucificada com Cristo, e uma nova vida foi concedida.
                </p>
                <p className="font-bold text-emerald-300">
                  Esta alforria é irrevogável, selada pelo Espírito Santo, e
                  garante todos os direitos de filho(a) amado(a) e
                  herdeiro(a) do Reino de Deus.
                </p>
                <p className="text-right mt-6 font-bold text-cyan-300">
                  - Assinado: O Rei dos Reis
                </p>
              </div>

              {/* BOTÃO MODERNO – BAIXAR CARTA */}
              <button
                type="button"
                onClick={handleGeneratePdfCarta}
                className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 p-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
              >
                <i data-lucide="download-cloud" className="w-5 h-5" />
                Baixar Carta de Alforria (PDF)
              </button>
            </div>
          </div>

          {/* PDF Download Section */}
          <div className="md:col-span-2 bg-gray-800/90 border border-indigo-500/40 p-6 rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-blue-400">
              Estudo Completo em PDF
            </h2>
            <div className="p-6 bg-gray-900 rounded-lg mb-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-xl font-bold text-cyan-300">
                  Identidade em Cristo
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-serif mt-2">
                  Baixe o estudo completo para guardar e consultar sempre que
                  precisar.
                </p>
              </div>
              <i
                data-lucide="file-text"
                className="w-20 h-20 text-cyan-500 flex-shrink-0"
              />
            </div>
            <a
              href={ESTUDO_PDF_URL}
              download="Estudo_Identidade_em_Cristo.pdf"
              onClick={() => playDownloadSound()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 p-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <i data-lucide="download" className="w-5 h-5" />
              Baixar Estudo em PDF
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <ActionButton onClick={() => navigateTo(Screen.Bonus)}>
            Explorar Jogos Bônus
          </ActionButton>
          <ActionButton onClick={() => navigateTo(Screen.Final)}>
            Finalizar Jornada
          </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default RewardsScreen;
