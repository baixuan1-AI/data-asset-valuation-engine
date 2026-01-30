import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { AssessmentDimensions } from '../types';

interface RadarAnalysisProps {
  data: AssessmentDimensions;
}

const RadarAnalysis: React.FC<RadarAnalysisProps> = ({ data }) => {
  const chartData = [
    { subject: '合规确权', A: data.compliance, fullMark: 100 },
    { subject: '质量属性', A: data.quality, fullMark: 100 },
    { subject: '成本构成', A: data.cost, fullMark: 100 },
    { subject: '价值实现', A: data.value, fullMark: 100 },
    { subject: '市场环境', A: data.market, fullMark: 100 },
  ];

  // Changed h-64 to h-full to fit parent containers properly
  return (
    <div className="w-full h-full min-h-[160px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-4">
      <h3 className="text-sm font-semibold text-google-text mb-2 self-start">资产价值五维全息图</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#5f6368', fontSize: 10, fontWeight: 500 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Asset Score"
            dataKey="A"
            stroke="#1a73e8"
            strokeWidth={3}
            fill="#1a73e8"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarAnalysis;