import React from 'react';
import { useWaitForTransaction } from 'wagmi';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

/**
 * Component for displaying transaction status
 * @param {Object} props - Component props
 * @param {string} props.hash - Transaction hash
 * @param {function} props.onSuccess - Callback for successful transaction
 * @param {function} props.onError - Callback for transaction error
 */
export function TransactionStatus({ hash, onSuccess, onError }) {
  const { 
    data, 
    isError, 
    isLoading, 
    isSuccess 
  } = useWaitForTransaction({
    hash,
    onSuccess,
    onError
  });

  if (!hash) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4 shadow-card">
      <div className="flex items-center space-x-3">
        {isLoading && (
          <>
            <Loader2 className="w-6 h-6 text-white animate-spin" />
            <div>
              <h3 className="text-white font-medium">Transaction in Progress</h3>
              <p className="text-white/70 text-sm">Please wait while your transaction is being processed...</p>
            </div>
          </>
        )}

        {isSuccess && (
          <>
            <CheckCircle className="w-6 h-6 text-accent" />
            <div>
              <h3 className="text-white font-medium">Transaction Successful</h3>
              <p className="text-white/70 text-sm">Your transaction has been confirmed!</p>
            </div>
          </>
        )}

        {isError && (
          <>
            <XCircle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-white font-medium">Transaction Failed</h3>
              <p className="text-red-300 text-sm">There was an error processing your transaction.</p>
            </div>
          </>
        )}
      </div>

      {hash && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-white/70 text-xs">Transaction Hash:</p>
          <a 
            href={`https://basescan.org/tx/${hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary text-sm font-mono break-all hover:underline"
          >
            {hash}
          </a>
        </div>
      )}
    </div>
  );
}

