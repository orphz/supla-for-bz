import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import { toPng, toSvg } from 'html-to-image';
import JSZip from 'jszip';
import saveAs from 'file-saver';

import { Measurement, WeightingType, ChartSettings, FrequencyData } from './types';
import { FREQUENCY_BANDS, A_WEIGHTING, C_WEIGHTING, DEFAULT_COLORS } from './constants';
import Sidebar from './components/Sidebar';
import ChartComponent from './components/ChartComponent';
import DonationModal from './components/DonationModal';
import Footer from './components/Footer';
import { UploadIcon } from './components/icons';

const App: React.FC = () => {
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [weighting, setWeighting] = useState<WeightingType>('Z');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);

    const [chartSettings, setChartSettings] = useState<ChartSettings>({
        yAxisLabel: 'Sound Pressure Level (dB)',
        xAxisLabel: 'Frequency (Hz)',
        showValues: false,
        yAxisStart: '12,5Hz',
        yAxisEnd: '20kHz',
        backgroundColor: '#1f2937', // bg-gray-800
        gridColor: '#4b5563', // bg-gray-600
        textColor: '#d1d5db', // text-gray-300
        showXAxisLabel: true,
        showYAxisLabel: true,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chartRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setError(null);
        setIsLoading(true);
        setLoadingMessage('Parsing CSV file...');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const dataRows = results.data as any[];
                    if (!dataRows || dataRows.length === 0) {
                        throw new Error('CSV file is empty or invalid.');
                    }

                    const lzeqHeaders = Object.keys(dataRows[0]).filter(h => h.startsWith('LZeq'));
                    if (lzeqHeaders.length === 0) {
                        throw new Error('No "LZeq" columns found in the CSV file.');
                    }
                    
                    const newMeasurements = dataRows.map((row, index) => {
                        const data: FrequencyData = {};
                        lzeqHeaders.forEach(header => {
                            const freqMatch = header.match(/(\d+([.,]\d+)?(k|K)?Hz)/);
                            if (freqMatch) {
                                const freq = freqMatch[0].replace('K', 'k').replace('.', ',');
                                if (FREQUENCY_BANDS.includes(freq) && row[header]) {
                                    data[freq] = parseFloat(String(row[header]).replace(',', '.'));
                                }
                            }
                        });

                        const measurementName = row['Project Name'] ? String(row['Project Name']).trim() : `Measurement ${index + 1}`;
                        return {
                            id: `${Date.now()}-${index}`,
                            name: measurementName,
                            originalName: measurementName,
                            data,
                            visible: false,
                            color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                            originalColor: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                        };
                    });
                    setMeasurements(newMeasurements);
                } catch (e: any) {
                    setError(`Failed to parse CSV file: ${e.message}. Please check the format.`);
                    console.error(e);
                } finally {
                    setIsLoading(false);
                    setLoadingMessage('');
                }
            },
            error: (err) => {
                setError(`CSV parsing error: ${err.message}`);
                setIsLoading(false);
                setLoadingMessage('');
            }
        });
    };

    const applyWeighting = useCallback((data: FrequencyData, type: WeightingType): FrequencyData => {
        if (type === 'Z') return data;
        const weightingValues = type === 'A' ? A_WEIGHTING : C_WEIGHTING;
        const weightedData: FrequencyData = {};
        for (const freq of FREQUENCY_BANDS) {
            if (data[freq] !== undefined && weightingValues[freq] !== undefined) {
                weightedData[freq] = data[freq] + weightingValues[freq];
            }
        }
        return weightedData;
    }, []);
    
    const processedData = useMemo(() => {
        const startIndex = FREQUENCY_BANDS.indexOf(chartSettings.yAxisStart);
        const endIndex = FREQUENCY_BANDS.indexOf(chartSettings.yAxisEnd);
        const visibleFrequencies = FREQUENCY_BANDS.slice(startIndex, endIndex + 1);

        return visibleFrequencies.map(freq => {
            const dataPoint: { name: string; [key: string]: any } = { name: freq };
            measurements.forEach(m => {
                if (m.visible) {
                    const weightedData = applyWeighting(m.data, weighting);
                    dataPoint[m.name] = weightedData[freq] !== undefined ? weightedData[freq] : null;
                }
            });
            return dataPoint;
        });
    }, [measurements, weighting, applyWeighting, chartSettings.yAxisStart, chartSettings.yAxisEnd]);

    const handleWeightingChange = (newWeighting: WeightingType) => {
        setWeighting(newWeighting);
    };
    
    const exportToTxt = useCallback(() => {
        let content = `Frequency\t${measurements.filter(m => m.visible).map(m => m.name).join('\t')}\n`;
        processedData.forEach(dataPoint => {
            const values = measurements
                .filter(m => m.visible)
                .map(m => {
                    const val = dataPoint[m.name];
                    if (val === null || val === undefined) return 'N/A';
                    return String(val).replace('.', ',');
                })
                .join('\t');
            content += `${dataPoint.name}\t${values}\n`;
        });
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'sound_level_data.txt');
    }, [processedData, measurements]);

    const exportToImage = useCallback(async (format: 'png' | 'svg') => {
        if (!chartRef.current) return;
        setIsLoading(true);
        setLoadingMessage(`Exporting to ${format.toUpperCase()}...`);
        let prevResize: string | null = null;
        let prevOverflow: string | null = null;
        try {
            // Temporarily hide the resize handle / resize affordance so it doesn't appear in the export
            prevResize = chartRef.current.style.resize;
            prevOverflow = chartRef.current.style.overflow;
            chartRef.current.style.resize = 'none';
            chartRef.current.style.overflow = 'hidden';
            let dataUrl;
            const options = { quality: 0.95, backgroundColor: chartSettings.backgroundColor };
            
            if (format === 'png') {
                dataUrl = await toPng(chartRef.current, options);
            } else {
                dataUrl = await toSvg(chartRef.current, options);
            }
            saveAs(dataUrl, `chart.${format}`);
        } catch (error) {
            console.error('Export failed:', error);
            setError('Failed to export image.');
        } finally {
            // Restore resize / overflow
            if (chartRef.current) {
                chartRef.current.style.resize = prevResize ?? '';
                chartRef.current.style.overflow = prevOverflow ?? '';
            }
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [chartSettings.backgroundColor]);

    // Export entire project state (measurements + chart settings + weighting) as JSON
    const exportProject = useCallback(() => {
        const project = {
            metadata: {
                exportedAt: new Date().toISOString(),
                app: 'supla-for-bz',
                version: '1'
            },
            chartSettings,
            weighting,
            measurements
        };
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json;charset=utf-8' });
        saveAs(blob, 'supla_project_export.json');
    }, [measurements, chartSettings, weighting]);

    // Import project JSON and restore state
    const importProject = useCallback((file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const text = String(reader.result || '');
                const parsed = JSON.parse(text);
                if (!parsed || !parsed.measurements || !parsed.chartSettings) {
                    throw new Error('Invalid project file');
                }
                // Basic validation and restore
                const importedMeasurements: Measurement[] = parsed.measurements.map((m: any, idx: number) => ({
                    id: m.id || `${Date.now()}-${idx}`,
                    name: m.name || `Measurement ${idx + 1}`,
                    originalName: m.originalName || m.name || `Measurement ${idx + 1}`,
                    data: m.data || {},
                    visible: !!m.visible,
                    color: m.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                    originalColor: m.originalColor || m.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                }));
                setChartSettings(parsed.chartSettings);
                setWeighting(parsed.weighting || 'Z');
                setMeasurements(importedMeasurements);
            } catch (err: any) {
                console.error('Failed to import project:', err);
                setError('Failed to import project file.');
            }
        };
        reader.onerror = (e) => {
            console.error('File read error', e);
            setError('Failed to read project file.');
        };
        reader.readAsText(file, 'utf-8');
    }, [setChartSettings, setWeighting, setMeasurements]);

    // Warn on unload if there are unsaved measurements
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (measurements.length > 0) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
            return undefined;
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [measurements.length]);


    const exportAllAsZip = async (format: 'png' | 'svg' | 'txt') => {
        setIsLoading(true);
        setLoadingMessage(`Generating ${format.toUpperCase()} files for ZIP...`);
    
        const originalVisibility = measurements.map(m => m.visible);
        const zip = new JSZip();
    
        for (let i = 0; i < measurements.length; i++) {
            const m = measurements[i];
            setLoadingMessage(`Processing Measurement ${i + 1} of ${measurements.length}...`);
    
            setMeasurements(prev => prev.map((meas, idx) => ({ ...meas, visible: i === idx })));
    
            await new Promise(resolve => setTimeout(resolve, 100));
    
            const sanitizedName = m.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
            if (format === 'png' || format === 'svg') {
                if (chartRef.current) {
                    try {
                        const options = { quality: 0.95, backgroundColor: chartSettings.backgroundColor };
                        // Hide resize affordance before export
                        const prevResizeLocal = chartRef.current.style.resize;
                        const prevOverflowLocal = chartRef.current.style.overflow;
                        chartRef.current.style.resize = 'none';
                        chartRef.current.style.overflow = 'hidden';
                        try {
                            if (format === 'png') {
                                // toPng returns a data URL. Instead of splitting base64 (which may fail
                                // if the data URL is malformed), fetch it and store the resulting
                                // ArrayBuffer/Blob in the ZIP. Retry once on transient failures.
                                let attempt = 0;
                                const maxAttempts = 2;
                                let ok = false;
                                while (attempt < maxAttempts && !ok) {
                                    attempt++;
                                    try {
                                        const dataUrl = await toPng(chartRef.current, options);
                                        const resp = await fetch(dataUrl);
                                        if (!resp.ok) throw new Error(`Failed to fetch data URL: ${resp.status}`);
                                        const ab = await resp.arrayBuffer();
                                        zip.file(`${sanitizedName}.png`, ab);
                                        ok = true;
                                    } catch (err) {
                                        console.warn(`Attempt ${attempt} failed to export ${sanitizedName}.png`, err);
                                        if (attempt < maxAttempts) {
                                            // small delay before retry
                                            await new Promise(r => setTimeout(r, 250));
                                        } else {
                                            console.error(`Failed to export ${sanitizedName}.png after ${maxAttempts} attempts`, err);
                                            setError(`Failed to export ${sanitizedName}. Skipping.`);
                                        }
                                    }
                                }
                            } else {
                                // toSvg returns an SVG string (not a data URL). Add it as text to the zip.
                                let svgString = await toSvg(chartRef.current, options);
                                // Some environments may return a data URL (data:image/svg+xml;utf8,<svg...>)
                                // or a percent-encoded string. Normalize all cases to a raw SVG string.
                                if (svgString.startsWith('data:')) {
                                    const commaIdx = svgString.indexOf(',');
                                    svgString = decodeURIComponent(svgString.slice(commaIdx + 1));
                                }
                                // If percent-encoded but not data URL
                                if (!svgString.trim().startsWith('<')) {
                                    try {
                                        const decoded = decodeURIComponent(svgString);
                                        if (decoded.trim().startsWith('<')) svgString = decoded;
                                    } catch (e) {
                                        // ignore decode errors
                                    }
                                }
                                // Remove any leading UTF BOM or whitespace
                                svgString = svgString.replace(/^\uFEFF/, '').trimStart();
                                if (!svgString.startsWith('<')) {
                                    throw new Error('SVG content does not start with "<" after normalization');
                                }
                                // Create a Blob to ensure proper UTF-8 encoding when added to the ZIP
                                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                                zip.file(`${sanitizedName}.svg`, svgBlob);
                            }
                        } catch (err) {
                            console.error(`Failed to export ${sanitizedName}.${format}`, err);
                            setError(`Failed to export ${sanitizedName}. Skipping.`);
                        } finally {
                            // Restore resize styles after export
                            chartRef.current.style.resize = prevResizeLocal;
                            chartRef.current.style.overflow = prevOverflowLocal;
                        }
                    } catch (e) {
                        console.error(`Failed to export ${sanitizedName}.${format}`, e);
                        setError(`Failed to export ${sanitizedName}. Skipping.`);
                    }
                }
            } else { // txt
                const dataToExport = FREQUENCY_BANDS.map(freq => {
                    const weightedData = applyWeighting(m.data, weighting);
                    return {
                        name: freq,
                        [m.name]: weightedData[freq] !== undefined ? weightedData[freq] : null,
                    };
                });

                let content = `Frequency\t${m.name}\n`;
                dataToExport.forEach(dp => {
                    const val = dp[m.name];
                    const formattedVal = (val === null || val === undefined) ? 'N/A' : String(val).replace('.', ',');
                    content += `${dp.name}\t${formattedVal}\n`;
                });
                zip.file(`${sanitizedName}.txt`, content);
            }
        }
    
        setMeasurements(prev => prev.map((meas, idx) => ({ ...meas, visible: originalVisibility[idx] })));
    
        setLoadingMessage('Compressing files...');
        try {
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `sound_level_export_${format}.zip`);
        } catch(e) {
            console.error('Failed to generate ZIP file', e);
            setError('Failed to generate ZIP file.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };


    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-gray-200 font-sans">
            <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
            {(isLoading) && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="text-center">
                        <svg className="animate-spin h-10 w-10 text-cyan-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xl font-semibold text-white">{loadingMessage}</p>
                    </div>
                </div>
            )}
            <div className="flex flex-1 flex-col lg:flex-row">
                 <Sidebar
                    measurements={measurements}
                    setMeasurements={setMeasurements}
                    weighting={weighting}
                    onWeightingChange={handleWeightingChange}
                    chartSettings={chartSettings}
                    setChartSettings={setChartSettings}
                    onFileUploadClick={() => fileInputRef.current?.click()}
                    onExportPNG={() => exportToImage('png')}
                    onExportSVG={() => exportToImage('svg')}
                    onExportTXT={exportToTxt}
                    onExportAll={exportAllAsZip}
                    onExportProject={exportProject}
                    onImportProject={importProject}
                />
                <main className="flex-1 p-4 lg:p-8 flex flex-col">
                    {measurements.length > 0 ? (
                        <div 
                            ref={chartRef}
                            className="w-full h-[70vh] p-4 rounded-lg resize overflow-auto border border-gray-700"
                            style={{ backgroundColor: chartSettings.backgroundColor }}
                        >
                            <ChartComponent
                                data={processedData}
                                measurements={measurements}
                                settings={chartSettings}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-300 mb-2">SUPLA for BZ</h2>
                                <p className="text-lg text-gray-400 mb-6">Sound Pressure Level Analyzer for BZ-5503 data.</p>
                                <p className="text-gray-500 mb-8">Upload a CSV file to begin visualizing your sound pressure level data.</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
                                >
                                    <UploadIcon />
                                    Upload CSV File
                                </button>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".csv"
                    />
                </main>
            </div>
            <Footer onOpenDonationModal={() => setIsDonationModalOpen(true)} />
        </div>
    );
};

export default App;