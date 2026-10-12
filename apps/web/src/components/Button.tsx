import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'blue' | 'red';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', fullWidth, className = '', type = 'button', ...props }) => (
  <button type={type} className={`game-button button-${variant} button-${size} ${fullWidth ? 'w-full' : ''} ${className}`} {...props} />
);
