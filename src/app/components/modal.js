import { useState } from 'react';

const Modal = ({ isOpen, setIsOpen, title, children, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full">
        <div className="w-full h-full rounded-t-lg bg-cover bg-center">
          <img src={imageUrl[0].url} width="100%" />
        </div>

        <div className="flex justify-between items-center mt-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-black text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
