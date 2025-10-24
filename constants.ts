import { StageData, Post } from './types';
import { getRandomQuestions } from './questionsBank';

export const getStagesData = (): StageData[] => [
  {
    id: 1,
    title: "Criado à Imagem de Deus",
    videoUrl: "https://www.youtube.com/embed/VM3x-6CWKPM",
    biblicalReflection: "Então disse Deus: 'Façamos o homem à nossa imagem, conforme a nossa semelhança...' E Deus criou o homem à sua imagem; à imagem de Deus o criou; homem e mulher os criou.",
    motivationalPhrase: "Você não é um acidente. Você foi criado de forma única e maravilhosa por um Deus que te ama.",
    questions: getRandomQuestions(1),
  },
  {
    id: 2,
    title: "A Queda e a Identidade Perdida",
    videoUrl: "https://www.youtube.com/embed/VM3x-6CWKPM",
    biblicalReflection: "Pois todos pecaram e estão destituídos da glória de Deus.",
    motivationalPhrase: "Mesmo em nossas falhas, o plano de Deus para nos resgatar já estava em ação.",
    questions: getRandomQuestions(2),
  },
   {
    id: 3,
    title: "A Nova Criação em Cristo",
    videoUrl: "https://www.youtube.com/embed/VM3x-6CWKPM",
    biblicalReflection: "Portanto, se alguém está em Cristo, é nova criação. As coisas antigas já passaram; eis que surgiram coisas novas!",
    motivationalPhrase: "Em Cristo, seu passado não define seu futuro. Você é uma nova pessoa com um novo começo.",
    questions: getRandomQuestions(3),
  },
  {
    id: 4,
    title: "Filhos Amados de Deus",
    videoUrl: "https://www.youtube.com/embed/VM3x-6CWKPM",
    biblicalReflection: "Vejam que grande amor o Pai nos tem concedido, que fôssemos chamados filhos de Deus! E somos mesmo!",
    motivationalPhrase: "Você não é órfão. Você foi adotado na família de Deus e é um filho amado.",
    questions: getRandomQuestions(4),
  },
  {
    id: 5,
    title: "Livres do Pecado e da Condenação",
    videoUrl: "https://www.youtube.com/embed/VM3x-6CWKPM",
    biblicalReflection: "Portanto, agora já não há condenação para os que estão em Cristo Jesus.",
    motivationalPhrase: "A cruz quitou sua dívida. Em Cristo, você está livre da culpa e da condenação do pecado.",
    questions: getRandomQuestions(5),
  },
  {
    id: 6,
    title: "Cidadãos do Céu com um Propósito",
    videoUrl: "https://www.youtube.com/embed/VM3x-6CWKPM",
    biblicalReflection: "Pois somos feitura dele, criados em Cristo Jesus para as boas obras, as quais Deus preparou de antemão para que andássemos nelas.",
    motivationalPhrase: "Sua vida tem um propósito divino. Você foi criado para fazer a diferença para a glória de Deus.",
    questions: getRandomQuestions(6),
  },
];

export const DECLARATIONS: string[] = [
    "Eu sou imagem e semelhança de Deus.",
    "Eu sou uma nova criação em Cristo.",
    "Eu sou filho(a) amado(a) de Deus.",
    "Eu sou perdoado(a) e livre da condenação.",
    "Eu sou co-herdeiro(a) com Cristo.",
    "Eu sou templo do Espírito Santo.",
    "Eu sou cidadão(ã) dos céus.",
    "Eu fui criado(a) com um propósito divino.",
    "Eu sou mais que vencedor(a) em Cristo.",
    "Eu sou amado(a) com amor eterno.",
    "Eu sou selado(a) com o Espírito Santo.",
    "Eu sou luz do mundo e sal da terra.",
];

export const COMMUNITY_POSTS: Omit<Post, 'isLiked' | 'isUserPost'>[] = [
  { id: 101, author: "Ana", message: "Que jornada incrível! Entender que sou filha amada de Deus mudou tudo para mim. Não estou mais sozinha!", likes: 15 },
  { id: 102, author: "Lucas", message: "A parte sobre ser 'nova criação' foi muito forte. Deixar o passado para trás e viver o novo de Deus é libertador. #2Corintios5:17", likes: 22 },
  { id: 103, author: "Mariana", message: "Estou maravilhada em saber que fui criada com um propósito. Cada um de nós é uma 'feitura de Deus' para boas obras. Vamos fazer a diferença!", likes: 18 },
  { id: 104, author: "Pedro", message: "A lição sobre não haver mais condenação tirou um peso das minhas costas. Saber que em Cristo estou perdoado de verdade é a melhor notícia.", likes: 25 },
];