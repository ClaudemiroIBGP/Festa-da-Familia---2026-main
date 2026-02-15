import React from 'react';

interface PaymentModalProps {
  totalAmount: number;
  isInstallment: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  totalAmount,
  isInstallment,
  onClose,
  onSuccess,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Pagamento via PIX</h2>

        <p className="mb-4 text-gray-700">
          Valor total:{' '}
          <strong>R$ {totalAmount.toFixed(2).replace('.', ',')}</strong>
        </p>

      <p className="text-sm text-gray-500 mb-4">
  Pagamento via PIX.
</p>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            🔒 Este é um ambiente de simulação.
            <br />
            Nenhum pagamento real será processado.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
          >
            Cancelar
          </button>

          <button
            onClick={onSuccess}
            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
