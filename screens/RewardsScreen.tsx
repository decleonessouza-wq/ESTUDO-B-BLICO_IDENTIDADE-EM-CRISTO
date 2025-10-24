
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';

const RewardsScreen: React.FC = () => {
  const { userName, navigateTo } = useAppContext();
  const [photo, setPhoto] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState('');
  
  const idCardRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Use a timeout to ensure React has finished its render cycle before Lucide modifies the DOM.
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (elementRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (elementRef.current && (window as any).html2canvas) {
      (window as any).html2canvas(elementRef.current, { backgroundColor: '#1f2937' }).then((canvas: any) => {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <AnimatedScreen>
      <div className="w-full max-w-5xl text-center text-white p-4">
        <h1 className="text-4xl font-bold mb-2">Suas Recompensas Espirituais</h1>
        <p className="text-gray-300 mb-8">Preencha os dados para gerar sua identidade e baixe seus documentos.</p>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* ID Card Section */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Carteira de Identidade Espiritual</h2>
            <div ref={idCardRef} className="p-4 bg-gray-900 text-left rounded-lg mb-4">
              <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-2 rounded-t-lg text-center font-bold">
                REINO DE DEUS - CIDADANIA CELESTIAL
              </div>
              <div className="flex gap-4 p-4 bg-gray-800">
                <div className="w-28 h-36 bg-gray-600 flex items-center justify-center text-xs text-gray-400 overflow-hidden flex-shrink-0">
                  {photo ? <img src={photo} alt="User" className="w-full h-full object-cover" /> : 'FOTO 3X4'}
                </div>
                <div className="text-sm space-y-1 flex-1">
                  <div><span className="font-semibold text-gray-400">NOME:</span><br/> <span className="font-mono">{userName}</span></div>
                  <div><span className="font-semibold text-gray-400">FILIAÇÃO:</span><br/> <span className="font-mono">DEUS PAI</span></div>
                  <div><span className="font-semibold text-gray-400">DATA DE NASCIMENTO (NOVO):</span><br/> <span className="font-mono">{birthDate || 'DD/MM/AAAA'}</span></div>
                </div>
              </div>
              <div className="bg-gray-900 p-2 rounded-b-lg">
                <p className="text-center font-bold text-lg text-cyan-400">NOVA CRIAÇÃO</p>
                <p className="text-xs text-center text-gray-400">"Se alguém está em Cristo, é nova criação." (2 Co 5:17)</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
               <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                 <i data-lucide="upload"></i> {photo ? 'Alterar Foto' : 'Carregar Foto 3x4'}
              </button>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-gray-700 p-2 rounded-lg w-full text-center" />
            </div>
            <button onClick={() => handleDownload(idCardRef, 'identidade_espiritual')} className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
              <i data-lucide="download"></i> Baixar Identidade
            </button>
          </div>

          {/* Letter Section */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Carta de Alforria Espiritual</h2>
            <div ref={letterRef} className="p-6 bg-gray-900 text-left rounded-lg mb-4 text-sm text-gray-300 leading-relaxed font-serif">
              <h3 className="text-center text-xl font-bold mb-4 text-cyan-300">DECLARAÇÃO DE LIBERDADE EM CRISTO</h3>
              <p className="mb-4">Pelo presente documento, declara-se que <span className="font-bold text-white">{userName}</span>, anteriormente cativo(a) pela lei do pecado e da morte, foi plenamente e eternamente liberto(a) pelo sangue de Jesus Cristo.</p>
              <p className="mb-4">Toda dívida foi paga na cruz. Não há mais condenação, culpa ou acusação válidas diante de Deus. A antiga natureza foi crucificada com Cristo, e uma nova vida foi concedida.</p>
              <p className="font-bold">Esta alforria é irrevogável, selada pelo Espírito Santo, e garante todos os direitos de filho(a) amado(a) e herdeiro(a) do Reino de Deus.</p>
              <p className="text-right mt-6 font-bold text-cyan-300">- Assinado: O Rei dos Reis</p>
            </div>
            <button onClick={() => handleDownload(letterRef, 'carta_de_alforria')} className="w-full bg-cyan-600 hover:bg-cyan-700 p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
               <i data-lucide="download"></i> Baixar Carta
            </button>
          </div>
        </div>

        <ActionButton onClick={() => navigateTo(Screen.Final)} className="mt-12">
          Finalizar Jornada
        </ActionButton>
      </div>
    </AnimatedScreen>
  );
};

export default RewardsScreen;