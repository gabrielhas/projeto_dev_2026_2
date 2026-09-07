import React from 'react';
import { RequestStatus, GamePlatform } from '../types';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (s: RequestStatus) => {
    switch (s) {
      case 'pending':
        return {
          label: 'Pendente',
          className: 'pending',
          icon: 'bi-hourglass-split'
        };
      case 'approved':
        return {
          label: 'Aprovado',
          className: 'approved',
          icon: 'bi-check-circle-fill'
        };
      case 'rejected':
        return {
          label: 'Rejeitado',
          className: 'rejected',
          icon: 'bi-x-circle-fill'
        };
      case 'completed':
        return {
          label: 'Concluído',
          className: 'completed',
          icon: 'bi-check2-all'
        };
      default:
        return {
          label: s,
          className: 'pending',
          icon: 'bi-question-circle'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`status-badge ${config.className} ${size === 'sm' ? 'py-1 px-2 fs-7' : ''}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <i className={`bi ${config.icon}`} aria-hidden="true"></i>
      <span>{config.label}</span>
    </span>
  );
};

export const PlatformBadge: React.FC<{ platform: GamePlatform; size?: 'sm' | 'md' }> = ({
  platform,
  size = 'md'
}) => {
  const getPlatformIcon = (p: GamePlatform) => {
    switch (p) {
      case 'PS4':
      case 'PS5':
        return 'bi-playstation';
      case 'Xbox Series':
        return 'bi-xbox';
      case 'Nintendo':
        return 'bi-nintendo-switch';
      default:
        return 'bi-controller';
    }
  };

  return (
    <span
      className={`platform-badge platform-${platform.toLowerCase().replace(/\s+/g, '-')} ${
        size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5'
      }`}
    >
      <i className={`bi ${getPlatformIcon(platform)}`} aria-hidden="true"></i>
      <span>{platform}</span>
    </span>
  );
};
