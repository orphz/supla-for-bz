import React, { useState } from 'react';
import Modal from './Modal';

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PIX_KEY = "00020126420014BR.GOV.BCB.PIX0120lmarques@inf.ufsm.br5204000053039865802BR5901N6001C62070503***6304FFDF";

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
    const [copyStatus, setCopyStatus] = useState<'Click to copy' | 'Copied!'>('Click to copy');

    const handleCopy = () => {
        navigator.clipboard.writeText(PIX_KEY).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Click to copy'), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy PIX key.');
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Support the Developer">
            <div className="text-center text-gray-300">
                <p className="mb-4">
                    If you find this tool useful, please consider supporting its development with a donation of any amount via PIX ❤
                </p>
                <div className="flex justify-center mb-4">
                     <img src="https://i.imgur.com/2tjoBEY.png" alt="PIX QR Code" className="w-48 h-48 rounded-lg bg-white p-2" />
                </div>
                <div className="bg-gray-900 p-3 rounded-lg break-words mb-4">
                    <p className="text-xs text-gray-400">PIX Copia e Cola:</p>
                    <p className="font-mono text-sm">{PIX_KEY}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                     <button
                        onClick={handleCopy}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        {copyStatus}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DonationModal;