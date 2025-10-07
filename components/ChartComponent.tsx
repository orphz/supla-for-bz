import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Label, LabelList } from 'recharts';
import { Measurement, ChartSettings, ChartDataPoint } from '../types';

interface ChartComponentProps {
    data: ChartDataPoint[];
    measurements: Measurement[];
    settings: ChartSettings;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-700 p-3 rounded-md border border-gray-600 shadow-lg">
                <p className="label font-bold text-cyan-400">{`${label}`}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.fill }}>
                        {`${pld.dataKey}: ${String(pld.value).replace('.', ',')} dB`}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};


const ChartComponent: React.FC<ChartComponentProps> = ({ data, measurements, settings }) => {
    
    const visibleMeasurements = measurements.filter(m => m.visible);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 30, right: 30, left: 30, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={settings.gridColor} />
                <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fill: settings.textColor, fontSize: 12 }}
                    stroke={settings.gridColor}
                    interval={0}
                >
                    {settings.showXAxisLabel !== false && (
                        <Label value={settings.xAxisLabel} offset={0} position="insideBottom" fill={settings.textColor} />
                    )}
                </XAxis>
                <YAxis 
                    tick={{ fill: settings.textColor, fontSize: 12 }}
                    stroke={settings.gridColor}
                >
                    {settings.showYAxisLabel !== false && (
                        <Label value={settings.yAxisLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: settings.textColor }} />
                    )}
                </YAxis>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107, 114, 128, 0.3)' }} />
                <Legend wrapperStyle={{ color: settings.textColor, paddingTop: '10px', paddingLeft:'60px' }} />
                {visibleMeasurements.map(m => (
                    <Bar key={m.id} dataKey={m.name} fill={m.color} isAnimationActive={false}>
                        {settings.showValues && (
                            <LabelList
                                dataKey={m.name}
                                position="top"
                                style={{ fill: settings.textColor, fontSize: 10 }}
                                formatter={(value: number) => {
                                    if (value === null || value === undefined) return '';
                                    return String(value).replace('.', ',');
                                }}
                            />
                        )}
                    </Bar>
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ChartComponent;