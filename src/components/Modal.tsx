import { useEffect, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleBack(event: Event) {
      if (
        event.type === "nativeBackButton" ||
        (event instanceof KeyboardEvent && event.key === "Escape")
      ) {
        onClose();
      }
    }

    window.addEventListener("nativeBackButton", handleBack);
    window.addEventListener("keydown", handleBack);

    return () => {
      window.removeEventListener("nativeBackButton", handleBack);
      window.removeEventListener("keydown", handleBack);
    };
  }, [onClose]);

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
