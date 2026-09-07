import React, { useState } from 'react';
import { requestService } from '../services/requestService';
import { GamePlatform } from '../types';
import { Alert } from './Alert';

interface FormState {
  name: string;
  email: string;
  gameName: string;
  platform: GamePlatform | '';
}

interface FormErrors {
  name?: string;
  email?: string;
  gameName?: string;
  platform?: string;
}

const PLATFORM_OPTIONS: GamePlatform[] = ['PS4', 'PS5', 'Xbox Series', 'Nintendo'];

export const RequestForm: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    gameName: '',
    platform: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Validação em tempo real do formulário no frontend
  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.name.trim()) {
      errs.name = 'Por favor, informe seu nome completo.';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      errs.name = 'O nome deve ter entre 2 e 100 caracteres.';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      errs.email = 'Por favor, informe seu e-mail.';
    } else if (!emailRegex.test(formData.email.trim()) || formData.email.trim().length > 150) {
      errs.email = 'Informe um endereço de e-mail válido (máximo 150 caracteres).';
    }

    if (!formData.gameName.trim()) {
      errs.gameName = 'Por favor, informe o nome do jogo desejado.';
    } else if (formData.gameName.trim().length < 1 || formData.gameName.trim().length > 200) {
      errs.gameName = 'O nome do jogo deve ter entre 1 e 200 caracteres.';
    }

    if (!formData.platform) {
      errs.platform = 'Por favor, selecione uma plataforma para o jogo.';
    } else if (!PLATFORM_OPTIONS.includes(formData.platform as GamePlatform)) {
      errs.platform = 'Plataforma selecionada inválida.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpa erro do campo alterado
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await requestService.createRequest(
        formData.name.trim(),
        formData.email.trim(),
        formData.gameName.trim(),
        formData.platform as GamePlatform
      );

      setSuccessMessage('Solicitação enviada com sucesso! Nossa equipe irá analisá-la em breve.');
      // Limpa os campos após o envio com sucesso
      setFormData({
        name: '',
        email: '',
        gameName: '',
        platform: ''
      });
      setErrors({});
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Não foi possível enviar sua solicitação. Verifique sua conexão e tente novamente.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card-wrapper">
      <div className="text-center mb-4">
        <h2 className="h4 fw-bold text-light mb-1">Preencha os dados da solicitação</h2>
        <p className="text-secondary small">Todos os campos são obrigatórios</p>
      </div>

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
          className="mb-4"
        />
      )}

      {serverError && (
        <Alert
          type="danger"
          message={serverError}
          onClose={() => setServerError(null)}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Campo: Nome Completo */}
        <div className="custom-form-group">
          <label htmlFor="name">
            Nome completo <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="name"
              name="name"
              className={`form-control-custom ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Ex: João da Silva"
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="name"
              required
            />
            <i className="bi bi-person input-icon" aria-hidden="true"></i>
          </div>
          {errors.name && (
            <div className="field-error-msg" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        {/* Campo: E-mail */}
        <div className="custom-form-group">
          <label htmlFor="email">
            E-mail <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Ex: joao@email.com"
              maxLength={150}
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
            <i className="bi bi-envelope input-icon" aria-hidden="true"></i>
          </div>
          {errors.email && (
            <div className="field-error-msg" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Campo: Nome do Jogo */}
        <div className="custom-form-group">
          <label htmlFor="gameName">
            Nome do jogo <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="gameName"
              name="gameName"
              className={`form-control-custom ${errors.gameName ? 'is-invalid' : ''}`}
              placeholder="Ex: Elden Ring / GTA VI"
              maxLength={200}
              value={formData.gameName}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            <i className="bi bi-controller input-icon" aria-hidden="true"></i>
          </div>
          {errors.gameName && (
            <div className="field-error-msg" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{errors.gameName}</span>
            </div>
          )}
        </div>

        {/* Campo: Plataforma (Select Obrigatório) */}
        <div className="custom-form-group">
          <label htmlFor="platform">
            Plataforma <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <select
              id="platform"
              name="platform"
              className={`form-control-custom ${errors.platform ? 'is-invalid' : ''}`}
              value={formData.platform}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              <option value="">Selecione uma plataforma</option>
              {PLATFORM_OPTIONS.map((plat) => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
              ))}
            </select>
            <i className="bi bi-display input-icon" aria-hidden="true"></i>
          </div>
          {errors.platform && (
            <div className="field-error-msg" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{errors.platform}</span>
            </div>
          )}
        </div>

        {/* Botão de Envio com Feedback de Carregamento */}
        <button
          type="submit"
          className="btn btn-submit-action rounded-3 mt-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Salvando solicitação...
            </>
          ) : (
            <>
              <i className="bi bi-send-fill me-1"></i>
              Solicitar jogo
            </>
          )}
        </button>
      </form>
    </div>
  );
};
