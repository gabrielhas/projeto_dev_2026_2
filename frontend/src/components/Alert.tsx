import React from 'react';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '' }) => {
  if (!message) return null;

  const iconMap: Record<AlertType, string> = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill'
  };

  return (
    <div
      className={`alert alert-${type} d-flex align-items-center justify-content-between p-3 border-0 shadow-sm rounded-3 ${className}`}
      role="alert"
    >
      <div className="d-flex align-items-center gap-2">
        <i className={`bi ${iconMap[type]} fs-5`} aria-hidden="true"></i>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-close ms-2"
          onClick={onClose}
          aria-label="Fechar alerta"
        ></button>
      )}
    </div>
  );
};
