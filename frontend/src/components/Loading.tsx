import React from 'react';

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Carregando...',
  fullPage = false
}) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4" role="status" aria-live="polite">
      <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      <p className="text-muted fw-medium mb-0">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div
        className="d-flex align-items-center justify-content-center min-vh-100 w-100"
        style={{ background: '#0f172a' }}
      >
        {content}
      </div>
    );
  }

  return content;
};
