import { StageData } from './types';
import { getRandomQuestions } from './questionsBank';

// Fix: Add and export DECLARATIONS constant
export const DECLARATIONS = [
  "Eu sou filho(a) amado(a) de Deus.",
  "Eu sou nova criação em Cristo.",
  "Eu sou perdoado(a) e justificado(a).",
  "Eu sou herdeiro(a) do Reino.",
  "Eu sou livre da condenação.",
  "Eu tenho um propósito divino.",
  "Eu sou templo do Espírito Santo.",
  "Eu sou mais que vencedor(a)!"
];

// CORREÇÃO FINAL: Todos os links de efeitos sonoros são locais (na pasta 'public').
export const SOUNDS = {
  // Arquivos .WAV
  CLICK: { id: 'sound-click', src: '/CLICK.wav' }, 
  CORRECT: { id: 'sound-correct', src: '/CORRECT.wav' }, 
  INCORRECT: { id: 'sound-incorrect', src: '/INCORRECT.wav' }, 
  DECLARE: { id: 'sound-declare', src: '/DECLARE.wav' }, 
  SUCCESS: { id: 'sound-success', src: '/SUCCESS.wav' },
  LIKE: { id: 'sound-like', src: '/LIKE.wav' }, 
  STAGE_COMPLETE: { id: 'sound-stage-complete', src: '/STAGE_COMPLETE.wav' }, 
  NEW_POST: { id: 'sound-new-post', src: '/NEW_POST.wav' }, 
  INTRO: { id: 'sound-intro', src: '/INTRO.wav' },
  PHOTO_UPLOAD: { id: 'sound-photo-upload', src: '/PHOTO_UPLOAD.wav' },
  DOWNLOAD: { id: 'sound-download', src: '/DOWNLOAD.wav' },

  // Arquivos .MP3
  COPY_SUCCESS: { id: 'sound-copy-success', src: '/COPY_SUCCESS.mp3' },
  COPY_FAIL: { id: 'sound-copy-fail', src: '/COPY_FAIL.wav' },
  TOGGLE: { id: 'sound-toggle', src: '/TOGGLE.mp3' },
  CONCLUSION: { id: 'sound-conclusion', src: '/CONCLUSION.wav' },
};

// MANTIDO: URLs locais que já funcionaram para BGM.
export const QUIZ_BGM_URLS = [
  '/quiz_etapa_1.mp3', // Caminho local para a Etapa 1
  '/quiz_etapa_2.mp3', // Caminho local para a Etapa 2
  '/quiz_etapa_3.mp3', // Caminho local para a Etapa 3
  '/quiz_etapa_4.mp3', // Caminho local (se existir)
  '/quiz_etapa_5.mp3', // Caminho local (se existir)
  '/quiz_etapa_6.mp3', // Caminho local (se existir)
];

// Fix: Add and export getStagesData function
export const getStagesData = (): StageData[] => [
  {
    id: 1,
    title: 'A Crise de Identidade',
    videoUrl: 'https://www.youtube.com/embed/VM3x-6CWKPM',
    biblicalReflection: 'Agora somos filhos de Deus... o mundo não nos conhece, porque não o conhece a Ele. (1 João 3:1-2)',
    motivationalPhrase: 'Descubra quem você é aos olhos de quem te criou.',
    questions: getRandomQuestions(1),
  },
  {
    id: 2,
    title: 'Criado à Imagem de Deus',
    videoUrl: 'https://www.youtube.com/embed/VM3x-6CWKPM',
    biblicalReflection: 'Eu te louvarei, porque de um modo assombrosamente maravilhoso fui formado. (Salmos 139:14)',
    motivationalPhrase: 'Você não é um acidente. Você é uma obra-prima divina.',
    questions: getRandomQuestions(2),
  },
  {
    id: 3,
    title: 'A Identidade Quebrada pelo Pecado',
    videoUrl: 'https://www.youtube.com/embed/VM3x-6CWKPM',
    biblicalReflection: 'Todos pecaram e destituídos estão da glória de Deus. (Romanos 3:23)',
    motivationalPhrase: 'Entender a queda é o primeiro passo para se levantar.',
    questions: getRandomQuestions(3),
  },
  {
    id: 4,
    title: 'A Nova Identidade em Cristo',
    videoUrl: 'https://www.youtube.com/embed/VM3x-6CWKPM',
    biblicalReflection: 'Se alguém está em Cristo, nova criatura é; as coisas velhas já passaram. (2 Coríntios 5:17)',
    motivationalPhrase: 'Em Cristo, você não é reformado. Você é recriado.',
    questions: getRandomQuestions(4),
  },
  {
    id: 5,
    title: 'Vivendo a Nova Identidade',
    videoUrl: 'https://www.youtube.com/embed/VM3x-6CWKPM',
    biblicalReflection: 'Não mais eu, mas Cristo vive em mim. (Gálatas 2:20)',
    motivationalPhrase: 'Sua identidade não é um título, é um estilo de vida.',
    questions: getRandomQuestions(5),
  },
  {
    id: 6,
    title: 'Firmado no Espelho Certo',
    videoUrl: 'https://www.youtube.com/embed/VM3x-6CWKPM',
    biblicalReflection: 'Aquele que atenta bem para a lei perfeita da liberdade, e persevera nela... será bem-aventurado. (Tiago 1:25)',
    motivationalPhrase: 'Pare de se ver pelo espelho do mundo. A Palavra de Deus é o único reflexo fiel.',
    questions: getRandomQuestions(6),
  },
];

// Adicionado o logo da igreja.
export const CHURCH_LOGO_URL = 'https://i.postimg.cc/7LVcT2cb/com_a_mocidade.png';