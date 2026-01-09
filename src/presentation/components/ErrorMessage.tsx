import React from 'react';

interface ErrorMessageProps {
  message: string | null;
  onDismiss: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="error-message">
      <span>{message}</span>
      <button onClick={onDismiss}>✕</button>
    </div>
  );
};
