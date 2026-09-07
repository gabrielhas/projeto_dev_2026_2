import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary' | 'success';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content-custom">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            className={`rounded-circle p-2 d-flex align-items-center justify-content-center bg-${confirmVariant} bg-opacity-25 text-${confirmVariant}`}
            style={{ width: '48px', height: '48px' }}
          >
            <i className="bi bi-exclamation-triangle-fill fs-4"></i>
          </div>
          <h3 id="modal-title" className="h5 mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>

        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{message}</p>

        <div className="d-flex align-items-center justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary px-3"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant} px-4`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Processando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
