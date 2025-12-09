// Conteúdo para: src/components/NovaIdentidade.tsx

import React from 'react';
import './NovaIdentidade.css';

interface NovaIdentidadeProps {
  userName: string;
  birthDate: string; // Espera a data no formato YYYY-MM-DD
  photo: string | null;
  sexo: string; // 'Masculino' ou 'Feminino'
}

const NovaIdentidade = React.forwardRef<HTMLDivElement, NovaIdentidadeProps>(
  ({ userName, birthDate, photo, sexo }, ref) => {
    const formatarData = (data: string): string => {
      if (!data) return 'DD/MM/AAAA';
      try {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
      } catch (e) {
        console.error('Erro ao formatar data:', data, e);
        return 'Data Inválida';
      }
    };

    const hoje = new Date();
    const diaExp = String(hoje.getDate()).padStart(2, '0');
    const mesExp = String(hoje.getMonth() + 1).padStart(2, '0');
    const anoExp = hoje.getFullYear();
    const dataExpedicaoFormatada = `${diaExp}/${mesExp}/${anoExp}`;

    const dataNascimentoFormatada = formatarData(birthDate);

    const statusValor =
      sexo === 'Feminino'
        ? 'Filha Amada e Escolhida'
        : 'Filho Amado e Escolhido';

    const profissaoValor =
      sexo === 'Feminino' ? 'Embaixadora de Cristo' : 'Embaixador de Cristo';

    return (
      // Wrapper para responsividade / escala no mobile
      <div className="documento-wrapper">
        {/* ref continua aqui para o html2canvas funcionar normalmente */}
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
                backgroundImage: photo ? `url(${photo})` : 'none',
                backgroundColor: photo ? 'transparent' : '#fff',
              }}
            ></div>

            <div className="conteudo">
              <div className="linha">
                <div className="campo" style={{ width: '100%' }}>
                  <div className="label">Nome</div>
                  <div className="valor" id="nome-valor">
                    {userName || 'Seu Nome Aqui'}
                  </div>
                </div>
              </div>

              <div className="linha">
                <div className="campo">
                  <div className="label">Nascimento</div>
                  <div className="valor" id="nascimento-valor">
                    {dataNascimentoFormatada}
                  </div>
                </div>
                <div className="campo">
                  <div className="label">Sexo</div>
                  <div className="valor" id="sexo-valor">
                    {sexo}
                  </div>
                </div>
              </div>

              <div className="linha">
                <div className="campo">
                  <div className="label">Filiação</div>
                  <div className="valor">Deus Pai Todo Poderoso</div>
                </div>
                <div className="campo">
                  <div className="label">Valor</div>
                  <div className="valor">Sangue Precioso de Cristo</div>
                </div>
              </div>

              <div className="linha">
                <div className="campo">
                  <div className="label">Naturalidade</div>
                  <div className="valor">Reino dos Céus</div>
                </div>
                <div className="campo">
                  <div className="label">Herança</div>
                  <div className="valor">Vida Eterna e Reino Celestial</div>
                </div>
              </div>

              <div className="linha">
                <div className="campo">
                  <div className="label">Status</div>
                  <div className="valor" id="status-valor">
                    {statusValor}
                  </div>
                </div>
                <div className="campo">
                  <div className="label">Profissão</div>
                  <div className="valor" id="profissao-valor">
                    {profissaoValor}
                  </div>
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
                  <div className="valor" id="data-expedicao">
                    {dataExpedicaoFormatada}
                  </div>
                </div>
                <div className="campo-exp">
                  <div className="label">Orgão Expeditor</div>
                  <div className="valor">
                    I.E.P - Jardim de Oração Independente
                  </div>
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
                chamados filhos de Deus; e nós somos filhos de Deus.”{' '}
                <strong>1 João 3:1</strong>
              </div>
              <div className="rodape-container">
                <div className="rodape-texto-esquerda">
                  Documento Oficial do Céus
                </div>
                <div className="logo-rodape"></div>
                <div className="rodape-texto-direita">Jesus Te Ama</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
);

export default NovaIdentidade;
