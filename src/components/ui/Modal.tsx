'use client';

import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '' 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC tuşu ile modali kapatma
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Modal açıldığında body scroll'u engelle
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      // Modal kapandığında body scroll'u geri aç
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Modal dışına tıklama kontrolü
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl overflow-hidden max-w-lg w-full mx-4 transform transition-transform ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-medium">{title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Kapat"
            >
              <FaTimes />
            </button>
          </div>
        )}
        
        <div className={title ? 'p-6' : 'p-6 pt-4'}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 