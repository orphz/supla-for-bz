
import React, { useState, useRef, useEffect } from 'react';
import { Measurement, WeightingType, ChartSettings } from '../types';
import { FREQUENCY_BANDS, A_WEIGHTING, C_WEIGHTING } from '../constants';
import Modal from './Modal';
import { UploadIcon, InfoIcon, EditIcon, SettingsIcon, ExportIcon } from './icons';

interface SidebarProps {
    measurements: Measurement[];
    setMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
    weighting: WeightingType;
    onWeightingChange: (weighting: WeightingType) => void;
    chartSettings: ChartSettings;
    setChartSettings: React.Dispatch<React.SetStateAction<ChartSettings>>;
    onFileUploadClick: () => void;
    onExportPNG: () => void;
    onExportSVG: () => void;
    onExportTXT: () => void;
    onExportAll: (format: 'png' | 'svg' | 'txt') => void;
    onExportProject: () => void;
    onImportProject: (file: File | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    measurements, setMeasurements, weighting, onWeightingChange,
    chartSettings, setChartSettings, onFileUploadClick,
    onExportPNG, onExportSVG, onExportTXT, onExportAll
    , onExportProject, onImportProject
    
}) => {
    const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
    const [isWeightingInfoOpen, setIsWeightingInfoOpen] = useState(false);
    const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
    const [isExportAllModalOpen, setIsExportAllModalOpen] = useState(false);
    
    const masterCheckboxRef = useRef<HTMLInputElement>(null);
    const areAllSelected = measurements.length > 0 && measurements.every(m => m.visible);
    const areSomeSelected = measurements.some(m => m.visible) && !areAllSelected;

    useEffect(() => {
        if (masterCheckboxRef.current) {
            masterCheckboxRef.current.indeterminate = areSomeSelected;
        }
    }, [areSomeSelected]);

    const handleToggleAllMeasurements = () => {
        const targetVisibility = !areAllSelected;
        setMeasurements(prev => prev.map(m => ({ ...m, visible: targetVisibility })));
    };

    const handleMeasurementToggle = (id: string) => {
        setMeasurements(prev => prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
    };

    const handleEditMeasurement = (measurement: Measurement) => {
        setEditingMeasurement({ ...measurement });
    };

    const handleUpdateMeasurement = () => {
        if (!editingMeasurement) return;
        setMeasurements(prev => prev.map(m => m.id === editingMeasurement.id ? editingMeasurement : m));
        setEditingMeasurement(null);
    };

    const handleRevertMeasurement = () => {
        if (!editingMeasurement) return;
        setMeasurements(prev => prev.map(m => m.id === editingMeasurement.id ? { ...m, name: m.originalName, color: m.originalColor } : m));
        setEditingMeasurement(null);
    }
    
    return (
        <aside className="w-full lg:w-96 bg-gray-800 p-6 flex flex-col flex-shrink-0">
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white leading-tight">SUPLA for BZ</h1>
                    <p className="text-sm text-gray-400">Sound Pressure Level Analyzer for BZ-5503 data.</p>
                </div>
                
                <button
                    onClick={onFileUploadClick}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 mb-6"
                >
                    <UploadIcon />
                    Upload CSV File
                </button>
                
                {measurements.length > 0 && (
                    <>
                        {/* Measurements List */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-300">Measurements</h3>
                                <button onClick={() => setIsAppearanceModalOpen(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-lg flex items-center justify-center gap-2 text-sm">
                                   <SettingsIcon /> Edit Colors
                                </button>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                <div className="flex items-center bg-gray-900 p-2 rounded mb-2 sticky top-0">
                                    <input
                                        type="checkbox"
                                        ref={masterCheckboxRef}
                                        checked={areAllSelected}
                                        onChange={handleToggleAllMeasurements}
                                        className="form-checkbox h-5 w-5 bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-500 rounded"
                                    />
                                    <span className="ml-3 text-sm font-semibold">
                                        {areAllSelected ? 'Deselect All' : 'Select All'}
                                    </span>
                                </div>
                                {measurements.map(m => (
                                    <div key={m.id} className="flex items-center bg-gray-700 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={m.visible}
                                            onChange={() => handleMeasurementToggle(m.id)}
                                            className="form-checkbox h-5 w-5 bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-500 rounded"
                                        />
                                        <span className="h-4 w-4 rounded-full ml-3 flex-shrink-0" style={{ backgroundColor: m.color }}></span>
                                        <div className="ml-3 flex-grow truncate">
                                            <span className="text-sm block" title={m.name}>{m.name}</span>
                                            <span className="text-xs text-gray-400 block" title={`Original: ${m.originalName}`}>{m.originalName}</span>
                                        </div>
                                        <button onClick={() => handleEditMeasurement(m)} className="ml-2 text-gray-400 hover:text-white">
                                            <EditIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                             <label className="flex items-center mt-3">
                                <input type="checkbox" checked={chartSettings.showValues} onChange={e => setChartSettings(s => ({...s, showValues: e.target.checked}))} className="form-checkbox h-5 w-5 bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-500 rounded" />
                                <span className="ml-2 text-sm">Show Values on Chart</span>
                            </label>
                        </div>

                        {/* Frequency Weighting */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
                                Frequency Weighting
                                <button onClick={() => setIsWeightingInfoOpen(true)} className="ml-2 text-gray-400 hover:text-white">
                                    <InfoIcon />
                                </button>
                            </h3>
                            <div className="flex space-x-2">
                                {(['Z', 'A', 'C'] as WeightingType[]).map(w => (
                                    <button
                                        key={w}
                                        onClick={() => onWeightingChange(w)}
                                        className={`flex-1 py-2 rounded-md text-sm font-semibold ${weighting === w ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    >
                                        {w}-Weighting
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Frequency Range */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-300 mb-3">Frequency Range</h3>
                             <div className="flex gap-2">
                                <select value={chartSettings.yAxisStart} onChange={e => setChartSettings(s => ({...s, yAxisStart: e.target.value}))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm">
                                    {FREQUENCY_BANDS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                                <select value={chartSettings.yAxisEnd} onChange={e => setChartSettings(s => ({...s, yAxisEnd: e.target.value}))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm">
                                    {FREQUENCY_BANDS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                             </div>
                        </div>

                        {/* Axis Labels */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-300 mb-3">Axis Labels</h3>
                            <div className="space-y-2">
                                <input type="text" placeholder="X-Axis Label" value={chartSettings.xAxisLabel} onChange={e => setChartSettings(s => ({...s, xAxisLabel: e.target.value}))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm" />
                                <input type="text" placeholder="Y-Axis Label" value={chartSettings.yAxisLabel} onChange={e => setChartSettings(s => ({...s, yAxisLabel: e.target.value}))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm" />
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {/* Fixed Footer for Exports & Import (always visible) */}
            <div className="mt-auto flex-shrink-0 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">Export / Import</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onExportPNG}
                        disabled={measurements.length === 0}
                        className={`bg-gray-700 p-2 rounded-md text-sm ${measurements.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                    >
                        Export PNG
                    </button>
                    <button
                        onClick={onExportSVG}
                        disabled={measurements.length === 0}
                        className={`bg-gray-700 p-2 rounded-md text-sm ${measurements.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                    >
                        Export SVG
                    </button>
                    <button
                        onClick={onExportTXT}
                        disabled={measurements.length === 0}
                        className={`bg-gray-700 p-2 rounded-md text-sm ${measurements.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                    >
                        Export TXT
                    </button>
                    <button
                        onClick={onExportProject}
                        className={`bg-gray-700 p-2 rounded-md text-sm ${measurements.length === 0 ? 'hover:bg-gray-600' : 'hover:bg-gray-600'}`}
                    >
                        Export Project (JSON)
                    </button>

                    <label className="w-full">
                        <input type="file" accept="application/json" onChange={e => onImportProject(e.target.files ? e.target.files[0] : null)} className="hidden" />
                        <span className="block text-center cursor-pointer bg-gray-700 hover:bg-gray-600 p-2 rounded-md text-sm">Import Project (JSON)</span>
                    </label>

                    <button
                        onClick={() => setIsExportAllModalOpen(true)}
                        disabled={measurements.length === 0}
                        className={`flex items-center justify-center gap-1 ${measurements.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-700 p-2 rounded-md text-sm' : 'bg-cyan-500 hover:bg-cyan-600 text-white font-bold p-2 rounded-md text-sm'}`}
                    >
                        <ExportIcon /> Export All (ZIP)
                    </button>
                </div>
                {measurements.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">No measurements loaded — export actions are disabled. Use "Upload CSV File" or "Import Project (JSON)" to load data.</p>
                )}
            </div>
            
            {/* Modals */}
            <Modal isOpen={!!editingMeasurement} onClose={() => setEditingMeasurement(null)} title="Edit Measurement">
                {editingMeasurement && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Display Name</label>
                            <input type="text" value={editingMeasurement.name} onChange={e => setEditingMeasurement({...editingMeasurement, name: e.target.value})} className="mt-1 w-full bg-gray-900 border-gray-600 rounded-md p-2" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400">Color</label>
                            <input type="color" value={editingMeasurement.color} onChange={e => setEditingMeasurement({...editingMeasurement, color: e.target.value})} className="mt-1 w-full h-10 p-1 bg-gray-900 border-gray-600 rounded-md" />
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <button onClick={handleRevertMeasurement} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Revert to Default</button>
                            <button onClick={handleUpdateMeasurement} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded">Save Changes</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isWeightingInfoOpen} onClose={() => setIsWeightingInfoOpen(false)} title="Frequency Weighting Values">
                <div className="grid grid-cols-2 gap-4 text-sm max-h-96 overflow-y-auto">
                    <div>
                        <h4 className="font-bold mb-2 text-cyan-400">A-Weighting (dB)</h4>
                        <ul className="space-y-1">
                            {Object.entries(A_WEIGHTING).map(([freq, val]) => <li key={freq} className="flex justify-between"><span>{freq}:</span> <span>{val.toFixed(1)}</span></li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-cyan-400">C-Weighting (dB)</h4>
                        <ul className="space-y-1">
                            {Object.entries(C_WEIGHTING).map(([freq, val]) => <li key={freq} className="flex justify-between"><span>{freq}:</span> <span>{val.toFixed(1)}</span></li>)}
                        </ul>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isAppearanceModalOpen} onClose={() => setIsAppearanceModalOpen(false)} title="Edit Chart Appearance">
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-400">Background Color</label>
                        <input type="color" value={chartSettings.backgroundColor} onChange={e => setChartSettings(s => ({...s, backgroundColor: e.target.value}))} className="mt-1 w-full h-10 p-1 bg-gray-900 border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Grid/Axis Line Color</label>
                        <input type="color" value={chartSettings.gridColor} onChange={e => setChartSettings(s => ({...s, gridColor: e.target.value}))} className="mt-1 w-full h-10 p-1 bg-gray-900 border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Text/Label Color</label>
                        <input type="color" value={chartSettings.textColor} onChange={e => setChartSettings(s => ({...s, textColor: e.target.value}))} className="mt-1 w-full h-10 p-1 bg-gray-900 border-gray-600 rounded-md" />
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isExportAllModalOpen} onClose={() => setIsExportAllModalOpen(false)} title="Batch Export Options">
                 <div>
                    <p className="text-gray-400 mb-4">Select the format for all measurements.</p>
                    <div className="flex flex-col space-y-2">
                        <button onClick={() => { onExportAll('png'); setIsExportAllModalOpen(false); }} className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-md text-center">PNG Images</button>
                        <button onClick={() => { onExportAll('svg'); setIsExportAllModalOpen(false); }} className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-md text-center">SVG Images</button>
                        <button onClick={() => { onExportAll('txt'); setIsExportAllModalOpen(false); }} className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-md text-center">TXT Data Files</button>
                    </div>
                </div>
            </Modal>
        </aside>
    );
};

export default Sidebar;