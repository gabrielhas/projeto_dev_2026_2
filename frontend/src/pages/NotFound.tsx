import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const NotFound: React.FC = () => {
  return (
    <div className="content-wrapper">
      <div className="bg-mesh" aria-hidden="true"></div>
      <Header />

      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="container-custom text-center">
          <div className="display-1 fw-extrabold text-primary mb-2">404</div>
          <h1 className="h2 fw-bold text-light mb-3">Página Não Encontrada</h1>
          <p className="text-secondary lead mb-4">
            A página que você está procurando não existe ou foi movida.
          </p>
          <Link to="/" className="btn btn-primary px-4 py-2">
            <i className="bi bi-house-door me-2"></i>
            Voltar para a Página Inicial
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};
