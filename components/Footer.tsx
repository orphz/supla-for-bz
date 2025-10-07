import React from 'react';
import { HeartIcon, GitHubIcon } from './icons';

interface FooterProps {
    onOpenDonationModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenDonationModal }) => {
    return (
        <footer className="w-full bg-gray-800 text-gray-400 p-4 border-t border-gray-700">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
                <div className="text-center sm:text-left">
                    <p>Developed by <span className="font-semibold text-gray-300">Lucas Soares Marques</span></p>
                    <p>Acoustical Engineering Student</p>
                </div>
                <div className="flex items-center gap-6">
                    <a
                        href="https://github.com/orphz/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                        aria-label="Developer's GitHub profile"
                    >
                        <GitHubIcon />
                        GitHub
                    </a>
                    <button
                        onClick={onOpenDonationModal}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                        aria-label="Open donation modal"
                    >
                        <HeartIcon />
                        Support the Developer
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
