// Conteúdo para: src/components/NovaIdentidade.tsx

import React from 'react';
// 1. Importa o CSS que acabamos de criar na Fase 2
import './NovaIdentidade.css'; 

// 2. Definimos as "Props" (dados) que este componente vai receber
// (Vimos no seu RewardsScreen que ele tem userName, photo e birthDate)
interface NovaIdentidadeProps {
  userName: string;
  birthDate: string; // Espera a data no formato YYYY-MM-DD
  photo: string | null;
  sexo: string; // 'Masculino' ou 'Feminino' (vamos adicionar isso na Fase 4)
}

// 3. Criamos o componente com React.forwardRef
// Isso é ESSENCIAL para que o botão "Baixar Identidade" continue funcionando
// Ele "passa para frente" o `idCardRef` do RewardsScreen para o <main> aqui
const NovaIdentidade = React.forwardRef<HTMLDivElement, NovaIdentidadeProps>(
  ({ userName, birthDate, photo, sexo }, ref) => {
    
    // 4. Lógica para formatar datas (tirado do seu JS original)
    const formatarData = (data: string): string => {
      if (!data) return 'DD/MM/AAAA';
      try {
        // A data vem como 'YYYY-MM-DD' do input
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
      } catch (e) {
        console.error("Erro ao formatar data:", data, e);
        return 'Data Inválida';
      }
    };

    const hoje = new Date();
    const diaExp = String(hoje.getDate()).padStart(2, '0');
    const mesExp = String(hoje.getMonth() + 1).padStart(2, '0');
    const anoExp = hoje.getFullYear();
    const dataExpedicaoFormatada = `${diaExp}/${mesExp}/${anoExp}`;

    const dataNascimentoFormatada = formatarData(birthDate);

    // 5. Lógica para definir Status e Profissão (tirado do seu JS)
    const statusValor =
      sexo === 'Feminino' ? 'Filha Amada e Escolhida' : 'Filho Amado e Escolhido';
    const profissaoValor =
      sexo === 'Feminino' ? 'Embaixadora de Cristo' : 'Embaixador de Cristo';

    // 6. Seu HTML convertido para JSX
    // (Note o 'className' em vez de 'class' e o 'style' diferente na foto)
    return (
      // A 'ref' (idCardRef) é aplicada aqui, para o html2canvas funcionar
      <main className="documento" id="card" ref={ref}>
        <div className="frente">
          <div className="logo-brasao"></div>
          <div className="logo-governo"></div>
          <header>
            <h1>REPÚBLICA FEDERATIVA DE DEUS</h1>
            <div className="subtitulo-governo">GOVERNO DIVINO</div>
            <div className="subtitulo-secretaria">
              Unidade Celestial
              <br />
              Secretária de Segurança da Trindade Divina
            </div>
            <h2>CARTEIRA DE IDENTIDADE ESPIRITUAL</h2>
            <h3>Documento Oficial do Céus</h3>
          </header>
          <div
            className="foto"
            id="foto-card"
            style={{
              // DADO DINÂMICO: Usa a 'photo' que vem do AppContext
              backgroundImage: photo ? `url(${photo})` : 'none',
              backgroundColor: photo ? 'transparent' : '#fff'
            }}
          ></div>
          <div className="conteudo">
            <div className="linha">
              <div className="campo" style={{ width: '100%' }}>
                <div className="label">Nome</div>
                {/* DADO DINÂMICO: Usa o 'userName' que vem do AppContext */}
                <div className="valor" id="nome-valor">{userName || 'Seu Nome Aqui'}</div>
              </div>
            </div>
            <div className="linha">
              <div className="campo">
                <div className="label">Nascimento</div>
                {/* DADO DINÂMICO: Usa a data formatada */}
                <div className="valor" id="nascimento-valor">{dataNascimentoFormatada}</div>
              </div>
              <div className="campo">
                <div className="label">Sexo</div>
                {/* DADO DINÂMICO: Usa o 'sexo' */}
                <div className="valor" id="sexo-valor">{sexo}</div>
              </div>
            </div>
            <div className="linha">
              <div className="campo"><div className="label">Filiação</div><div className="valor">Deus Pai Todo Poderoso</div></div>
              <div className="campo"><div className="label">Valor</div><div className="valor">Sangue Precioso de Cristo</div></div>
            </div>
            <div className="linha">
              <div className="campo"><div className="label">Naturalidade</div><div className="valor">Reino dos Céus</div></div>
              <div className="campo"><div className="label">Herança</div><div className="valor">Vida Eterna e Reino Celestial</div></div>
            </div>
            <div className="linha">
              <div className="campo">
                <div className="label">Status</div>
                {/* DADO DINÂMICO: Usa o status calculado */}
                <div className="valor" id="status-valor">{statusValor}</div>
              </div>
              <div className="campo">
                <div className="label">Profissão</div>
                {/* DADO DINÂMICO: Usa a profissão calculada */}
                <div className="valor" id="profissao-valor">{profissaoValor}</div>
              </div>
            </div>
          </div>
          <div className="assinatura">
            <div className="assinatura-linha"></div>
            <div className="assinatura-label">Assinatura do Titular</div>
          </div>
        </div>

        <div className="verso">
          <div className="conteudo-superior-verso">
            <div className="mapa-fundo"></div>
            <div className="dados-expedicao">
              <div className="campo-exp">
                <div className="label">Expedição</div>
                {/* DADO DINÂMICO: Usa a data de hoje */}
                <div className="valor" id="data-expedicao">{dataExpedicaoFormatada}</div>
              </div>
              <div className="campo-exp">
                <div className="label">Orgão Expeditor</div>
                <div className="valor">I.E.P - Jardim de Oração Independente</div>
              </div>
              <div className="campo-exp">
                <div className="label">Local</div>
                <div className="valor">RONDONÓPOLIS/MT</div>
              </div>
            </div>
          </div>

          <div className="assinatura-divina">
            <div className="assinatura-divina-img">O Rei dos reis</div>
            <div className="assinatura-divina-label">Assinatura Divina</div>
          </div>

          <div className="validade-container">
            <div className="espaco-figura" id="figura1"></div>
            <div className="espaco-figura" id="figura2"></div>
            <div className="validade">
              Válida Enquanto a Fé Estiver Fundamentada em Jesus Cristo!
            </div>
            <div className="espaco-figura" id="figura3"></div>
            <div className="espaco-figura" id="figura4"></div>
          </div>

          <div className="rodape-verso">
            <div className="versiculo">
              "Vede quão grande amor nos tem concedido o Pai, que fôssemos
              chamados filhos de Deus; e nós somos filhos de Deus.”
              <strong>1 João 3:1</strong>
            </div>
            <div className="rodape-container">
              <div className="rodape-texto-esquerda">Documento Oficial do Céus</div>
              <div className="logo-rodape"></div>
              <div className="rodape-texto-direita">Jesus Te Ama</div>
            </div>
          </div>
        </div>
      </main>
    );
  }
);

export default NovaIdentidade;