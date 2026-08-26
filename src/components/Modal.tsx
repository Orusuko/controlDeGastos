import { useEffect, type ReactNode } from "react";
import { pushModalCloser } from "../lib/native";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => pushModalCloser(onClose), [onClose]);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__handle" />
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
