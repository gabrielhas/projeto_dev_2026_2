import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { RequestForm } from '../components/RequestForm';

export const Home: React.FC = () => {
  return (
    <div className="content-wrapper">
      <div className="bg-mesh" aria-hidden="true"></div>
      <Header />

      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container-custom">
          {/* Hero Section */}
          <div className="row align-items-center justify-content-center g-4 g-lg-5 mb-4">
            <div className="col-12 col-lg-6 text-center text-lg-start">
              <div 
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
                style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
              >
                <i className="bi bi-stars text-warning"></i>
                <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>Plataforma de Pedidos de Games</span>
              </div>

              <h1 className="display-4 fw-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>
                Solicite seu <span className="text-gradient">jogo</span> favorito
              </h1>

              <p className="lead mb-4 fs-6 fs-md-5" style={{ color: 'var(--text-secondary)' }}>
                Não encontrou o jogo que procura em nosso catálogo? Envie sua solicitação agora mesmo para que nossa equipe técnica possa analisá-la e adicioná-la à biblioteca.
              </p>

              {/* Destaques / Benefícios */}
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start small" style={{ color: 'var(--text-secondary)' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-success fs-5"></i>
                  <span className="fw-medium">Avaliação Rápida</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-bell text-info fs-5"></i>
                  <span className="fw-medium">Notificação por E-mail</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-controller text-primary fs-5"></i>
                  <span className="fw-medium">Todas as Plataformas</span>
                </div>
              </div>
            </div>

            {/* Formulário Público de Solicitação */}
            <div className="col-12 col-md-10 col-lg-6">
              <RequestForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
