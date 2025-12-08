// src/components/NovaIdentidade.tsx

import React from "react";
import "./NovaIdentidade.css";

interface NovaIdentidadeProps {
  userName: string;
  birthDate: string; // formato YYYY-MM-DD (ou vazio)
  photo: string | null;
  sexo: string; // 'Masculino' | 'Feminino' | ''
}

const formatBirthDate = (raw: string) => {
  if (!raw) return "DD/MM/AAAA";
  // tenta converter de YYYY-MM-DD para DD/MM/AAAA
  const parts = raw.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return raw;
};

const getSexoLabel = (sexo: string) => {
  if (!sexo) return "—";
  if (sexo.toLowerCase().startsWith("m")) return "Masculino";
  if (sexo.toLowerCase().startsWith("f")) return "Feminino";
  return sexo;
};

const NovaIdentidade = React.forwardRef<HTMLDivElement, NovaIdentidadeProps>(
  ({ userName, birthDate, photo, sexo }, ref) => {
    const nome = userName || "Seu nome aqui";
    const dataNasc = formatBirthDate(birthDate);
    const sexoLabel = getSexoLabel(sexo);

    return (
      <main className="novaId-wrapper">
        <div ref={ref} className="novaId-card">
          {/* CABEÇALHO */}
          <header className="novaId-header">
            <div className="novaId-header-top">
              <span className="novaId-header-titleMain">
                REPÚBLICA FEDERATIVA DE DEUS
              </span>
              <span className="novaId-header-sub">GOVERNO DIVINO</span>
            </div>
            <div className="novaId-header-bottom">
              <div className="novaId-header-org">
                <span>Unidade Celestial</span>
                <span>Secretaria de Segurança da Trindade Divina</span>
              </div>
              <div className="novaId-header-logo" />
            </div>
          </header>

          {/* CORPO PRINCIPAL */}
          <section className="novaId-body">
            {/* FOTO 3x4 */}
            <div className="novaId-photoBox">
              {photo ? (
                <img
                  src={photo}
                  alt="Foto 3x4"
                  className="novaId-photoImg"
                />
              ) : (
                <div className="novaId-photoPlaceholder">
                  <span>Foto 3x4</span>
                </div>
              )}
            </div>

            {/* DADOS DO TITULAR */}
            <div className="novaId-data">
              <h2 className="novaId-docTitle">
                CARTEIRA DE IDENTIDADE ESPIRITUAL
              </h2>

              <div className="novaId-grid">
                <div className="novaId-gridRow">
                  <div className="novaId-field">
                    <span className="novaId-label">Nome</span>
                    <span className="novaId-value novaId-value--strong">
                      {nome}
                    </span>
                  </div>
                </div>

                <div className="novaId-gridRow novaId-gridRow--twoCols">
                  <div className="novaId-field">
                    <span className="novaId-label">Nascimento</span>
                    <span className="novaId-value">{dataNasc}</span>
                  </div>
                  <div className="novaId-field">
                    <span className="novaId-label">Sexo</span>
                    <span className="novaId-value">{sexoLabel}</span>
                  </div>
                </div>

                <div className="novaId-gridRow novaId-gridRow--twoCols">
                  <div className="novaId-field">
                    <span className="novaId-label">Filiação</span>
                    <span className="novaId-value">
                      Deus Pai Todo-Poderoso
                    </span>
                  </div>
                  <div className="novaId-field">
                    <span className="novaId-label">Valor</span>
                    <span className="novaId-value">
                      Sangue precioso de Cristo
                    </span>
                  </div>
                </div>

                <div className="novaId-gridRow novaId-gridRow--twoCols">
                  <div className="novaId-field">
                    <span className="novaId-label">Naturalidade</span>
                    <span className="novaId-value">Reino dos Céus</span>
                  </div>
                  <div className="novaId-field">
                    <span className="novaId-label">Herança</span>
                    <span className="novaId-value">
                      Vida eterna e Reino Celestial
                    </span>
                  </div>
                </div>

                <div className="novaId-gridRow novaId-gridRow--twoCols">
                  <div className="novaId-field">
                    <span className="novaId-label">Status</span>
                    <span className="novaId-value">
                      Filho(a) amado(a) e perdoado(a)
                    </span>
                  </div>
                  <div className="novaId-field">
                    <span className="novaId-label">Profissão</span>
                    <span className="novaId-value">
                      Embaixador(a) de Cristo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ASSINATURA TITULAR */}
          <section className="novaId-assinaturaTitular">
            <div className="novaId-assinaturaLinha" />
            <span className="novaId-assinaturaLabel">
              Assinatura do Titular
            </span>
          </section>

          {/* ÁREA INFERIOR: QR + DADOS DE EXPEDIÇÃO */}
          <section className="novaId-bottom">
            <div className="novaId-qrBox">
              <div className="novaId-qrFake" />
            </div>

            <div className="novaId-bottomData">
              <div className="novaId-field">
                <span className="novaId-label">Expedição</span>
                <span className="novaId-value">06/12/2025</span>
              </div>
              <div className="novaId-field">
                <span className="novaId-label">Orgão Expedidor</span>
                <span className="novaId-value">
                  I.E.P – Jardim de Oração Independente
                </span>
              </div>
              <div className="novaId-field">
                <span className="novaId-label">Local</span>
                <span className="novaId-value">Rondonópolis / MT</span>
              </div>
            </div>
          </section>

          {/* RODAPÉ */}
          <footer className="novaId-footer">
            <div className="novaId-footerLinha" />
            <span className="novaId-footerAssinatura">O Rei dos reis</span>

            <div className="novaId-footerSelos">
              <div className="novaId-footerSelo" />
              <div className="novaId-footerSelo" />
              <div className="novaId-footerSelo" />
              <div className="novaId-footerSelo" />
            </div>

            <p className="novaId-footerVerso">
              &quot;Vede quão grande amor nos tem concedido o Pai, que
              fôssemos chamados filhos de Deus; e nós somos filhos de Deus.&quot;{" "}
              <strong>1 João 3:1</strong>
            </p>
          </footer>
        </div>
      </main>
    );
  }
);

export default NovaIdentidade;
