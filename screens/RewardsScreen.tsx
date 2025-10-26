import React, { useRef, useEffect, useState } from 'react'; // ADICIONE , useState AQUI
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';
// *** IMPORTANDO O LINK DE constants.ts ***
import { SOUNDS, ESTUDO_PDF_URL } from '../constants';
import NovaIdentidade from '../components/NovaIdentidade'; // <-- ADICIONE ESTA LINHA


const RewardsScreen: React.FC = () => {
  const { userName, navigateTo, photo, setPhoto, birthDate, setBirthDate } = useAppContext();
  
  const idCardRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sexo, setSexo] = useState('Masculino'); // <-- ADICIONE ESTA LINHA

  // Ajuste para usar o SOUNDS importado, garantindo a correção do path
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

  const handleDownloadImage = (elementRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (elementRef.current && (window as any).html2canvas) {
      playDownloadSound();
      (window as any).html2canvas(elementRef.current, { backgroundColor: '#1f2937' }).then((canvas: any) => {
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

  // 3. Toca o som de download (opcional, mas bom manter)
  playDownloadSound();
};

  const formattedDate = birthDate 
    ? new Date(birthDate + 'T00:00:00').toLocaleDateString('pt-BR') 
    : 'DD/MM/AAAA';

  return (
    <AnimatedScreen>
      <div className="w-full max-w-5xl text-center text-white p-4">
        <h1 className="text-4xl font-bold mb-2">Suas Recompensas Espirituais</h1>
        <p className="text-gray-300 mb-8">Preencha os dados para gerar sua identidade e baixe seus documentos.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* ID Card Section */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Carteira de Identidade Espiritual</h2>
            <div className="flex justify-center my-4"> {/* Wrapper para centralizar */}
            <NovaIdentidade 
                ref={idCardRef}
                userName={userName}
                photo={photo}
                birthDate={birthDate}
                sexo={sexo}
            />
            </div>
            <div className="flex flex-col gap-4">
               <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
            />
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold ...">
                 <i data-lucide="upload"></i> {photo ? 'Alterar Foto' : 'Carregar Foto 3x4'}
              </button>

              {/* ADICIONE ESTE BLOCO <select> ABAIXO */}
              <select 
                value={sexo} 
                onChange={(e) => setSexo(e.target.value)} 
                className="bg-gray-700 p-3 rounded-lg w-full text-center"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
              
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-gray-700 p-3 rounded-lg w-full text-center" />
            </div>
            <button onClick={() => handleDownloadImage(idCardRef, 'identidade_espiritual')} className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 p-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2">
              <i data-lucide="download"></i> Baixar Identidade
            </button>
          </div>

          {/* Letter Section */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Carta de Alforria Espiritual</h2>
            <div ref={letterRef} className="p-6 bg-gray-900 text-left rounded-lg mb-4 text-sm text-gray-300 leading-relaxed font-serif">
              <h3 className="text-center text-xl font-bold mb-4 text-cyan-300">DECLARAÇÃO DE LIBERDADE EM CRISTO</h3>
              <p className="mb-4">Pelo presente documento, declara-se que <span className="font-bold text-white">{userName}</span>, anteriormente cativo(a) pela lei do pecado e da morte, foi plenamente e eternamente liberto(a) pelo sangue de Jesus Cristo.</p>
              <p className="mb-4">Toda dívida foi paga na cruz. Não há mais condenação, culpa ou acusação válidas diante de Deus. A antiga natureza foi crucificada com Cristo, e uma nova vida foi concedida.</p>
              <p className="font-bold">Esta alforria é irrevogável, selada pelo Espírito Santo, e garante todos os direitos de filho(a) amado(a) e herdeiro(a) do Reino de Deus.</p>
              <p className="text-right mt-6 font-bold text-cyan-300">- Assinado: O Rei dos Reis</p>
            </div>
            <button onClick={handleGeneratePdfCarta} className="...">
               <i data-lucide="download"></i> Baixar Carta
            </button>
          </div>

          {/* PDF Download Section */}
          <div className="md:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Estudo Completo em PDF</h2>
            <div className="p-6 bg-gray-900 rounded-lg mb-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
              <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-bold text-cyan-300">Identidade em Cristo</h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-serif mt-2">
                      Baixe o estudo completo para guardar e consultar sempre que precisar.
                  </p>
              </div>
              <i data-lucide="file-text" className="w-20 h-20 text-cyan-500 flex-shrink-0"></i>
            </div>
            <a 
              href={ESTUDO_PDF_URL} 
              download="Estudo_Identidade_em_Cristo.pdf" 
              onClick={() => playDownloadSound()} 
              className="w-full bg-cyan-600 hover:bg-cyan-700 p-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <i data-lucide="download"></i> Baixar Estudo em PDF
            </a>
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