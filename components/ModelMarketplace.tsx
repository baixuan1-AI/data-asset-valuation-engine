import React, { useState, useMemo } from 'react';
import { ValuationModel, ValuationObjective } from '../types';
import { Shield, CheckCircle, University, Wallet, FileText, TrendingUp, BarChart3, Info } from 'lucide-react';

interface ModelMarketplaceProps {
  onSelectModel: (model: ValuationModel) => void;
  onBack: () => void;
  currentPoints: number;
}

export const AVAILABLE_MODELS: ValuationModel[] = [
  // --- 1. 财务/入表 (Cost Based) ---
  {
    id: 'm_gov_2025_65',
    name: '公共数据资源授权运营价格形成机制模型 (2025-65号文)',
    provider: 'National NDRC Standard',
    description: '严格遵循发改价格〔2025〕65号文件精神，采用“基础服务费+增值服务费”双轨制定价。专为公共数据授权运营设计，确保国有资产保值增值。',
    tags: ['国家发改委', '最新政策', '公共数据'],
    baseMultiplier: 1.1,
    riskSensitivity: 'Conservative',
    cost: 500,
    recommendedFor: [ValuationObjective.FINANCIAL_ENTRY],
    isOfficial: true
  },
  {
    id: 'm_cost_china_official',
    name: '中国资产评估协会指导意见模型',
    provider: 'China Appraisal Society (CAS)',
    description: '严格遵循《数据资产评估指导意见》标准，基于重置成本法，叠加数据质量与合规性修正系数。适合国有资产、上市公司资产入表。',
    tags: ['国家标准', '成本法', '审计首选'],
    baseMultiplier: 1.0,
    riskSensitivity: 'Conservative',
    cost: 0,
    recommendedFor: [ValuationObjective.FINANCIAL_ENTRY],
    isOfficial: true
  },
  {
    id: 'm_cost_gbt',
    name: 'GB/T 4754 成本归集模型',
    provider: 'National Standard (GB)',
    description: '基于国家统计局行业分类标准，精确归集数据采集、清洗、标注等环节的人力与算力成本。',
    tags: ['国标', '高精度', '财务'],
    baseMultiplier: 1.05,
    riskSensitivity: 'Moderate',
    cost: 100,
    recommendedFor: [ValuationObjective.FINANCIAL_ENTRY],
    isOfficial: true
  },

  // --- 2. 交易/融资 (Market Based) ---
  {
    id: 'm_market_shanghai',
    name: '上海数交所 (SDE) 交易定价模型',
    provider: 'Shanghai Data Exchange',
    description: '基于上海数据交易所历史挂牌行情与撮合交易数据，利用相似案例比较法进行市场公允价值测算。',
    tags: ['交易所认证', '市场法', '高流通性'],
    baseMultiplier: 1.25,
    riskSensitivity: 'Moderate',
    cost: 300,
    recommendedFor: [ValuationObjective.TRADING_FINANCING],
    isOfficial: true
  },
  {
    id: 'm_market_shenzhen',
    name: '深圳数交所 (SZDE) 数据贷模型',
    provider: 'Shenzhen Data Exchange',
    description: '侧重于数据资产的变现能力和法律确权，广泛被商业银行作为数据质押贷款的风控依据。',
    tags: ['银行认可', '融资', '风控'],
    baseMultiplier: 0.9,
    riskSensitivity: 'Conservative',
    cost: 300,
    recommendedFor: [ValuationObjective.TRADING_FINANCING],
    isOfficial: true
  },
  {
    id: 'm_market_damodaran',
    name: 'Damodaran 相对估值模型',
    provider: 'NYU Stern (A. Damodaran)',
    description: '全球通用的相对估值法，通过对比同行业科技公司的市销率 (P/S) 和数据密度来推导资产价值。',
    tags: ['国际通用', '美元基金', '相对估值'],
    baseMultiplier: 1.3,
    riskSensitivity: 'Aggressive',
    cost: 200,
    recommendedFor: [ValuationObjective.TRADING_FINANCING]
  },

  // --- 3. 内部/投资 (Income Based) ---
  {
    id: 'm_income_gartner',
    name: 'Gartner Infonomics 价值模型',
    provider: 'Gartner Inc.',
    description: '经典的各种信息经济学模型 (RVI, BVI)，侧重于计算数据对业务流程改进带来的经济增加值 (EVA)。',
    tags: ['国际权威', '收益法', '管理咨询'],
    baseMultiplier: 1.4,
    riskSensitivity: 'Moderate',
    cost: 400,
    recommendedFor: [ValuationObjective.INTERNAL_DECISION]
  },
  {
    id: 'm_income_dcf',
    name: '多期超额收益法 (MPEE)',
    provider: 'DataPricing Ai Lab',
    description: '将数据资产视为无形资产，预测其剩余经济寿命内的现金流，并剥离其他贡献资产后的超额收益。',
    tags: ['经典', '收益法', '高增长'],
    baseMultiplier: 1.5,
    riskSensitivity: 'Aggressive',
    cost: 150,
    recommendedFor: [ValuationObjective.INTERNAL_DECISION]
  }
];

const ModelMarketplace: React.FC<ModelMarketplaceProps> = ({ onSelectModel, onBack, currentPoints }) => {
  const [selectedObjective, setSelectedObjective] = useState<ValuationObjective | null>(null);

  const filteredModels = useMemo(() => {
    if (!selectedObjective) return [];
    return AVAILABLE_MODELS.filter(m => m.recommendedFor.includes(selectedObjective));
  }, [selectedObjective]);

  const ObjectiveCard = ({ objective, icon: Icon, desc }: { objective: ValuationObjective, icon: any, desc: string }) => (
      <div 
          onClick={() => setSelectedObjective(objective)}
          className={`cursor-pointer rounded-xl border-2 p-5 transition duration-300 flex flex-col gap-3 relative overflow-hidden group ${
              selectedObjective === objective 
              ? 'border-google-blue bg-blue-50 shadow-md' 
              : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg'
          }`}
      >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
               selectedObjective === objective ? 'bg-google-blue text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-google-blue'
          }`}>
              <Icon size={20} />
          </div>
          <div>
              <h3 className={`font-bold text-sm mb-1 ${selectedObjective === objective ? 'text-google-blue' : 'text-gray-800'}`}>
                  {objective.split(' ')[0]}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
          {selectedObjective === objective && (
              <div className="absolute top-2 right-2">
                  <CheckCircle size={16} className="text-google-blue" />
              </div>
          )}
      </div>
  );

  return (
    <div className="h-full bg-gray-50 overflow-y-auto pb-24">
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-4 shadow-sm flex justify-between items-center">
        <div>
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <University className="text-purple-600"/> 专家模型市场
            </h2>
            <p className="text-xs text-gray-500">Global Valuation Model Marketplace</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium text-google-blue">
            <Wallet size={16} />
            {currentPoints} 积分
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
         
         {/* Step 1: Select Objective */}
         <div className="mb-10">
             <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                 请选择您的评估目的
             </h3>
             <div className="grid md:grid-cols-3 gap-4">
                 <ObjectiveCard 
                    objective={ValuationObjective.FINANCIAL_ENTRY}
                    icon={FileText}
                    desc="适用于资产负债表扩张、年度财务审计及公共数据成本调查。优先采用国家标准与成本法。"
                 />
                 <ObjectiveCard 
                    objective={ValuationObjective.TRADING_FINANCING}
                    icon={TrendingUp}
                    desc="适用于数据交易所挂牌、银行质押贷款。优先采用交易所数据与市场法。"
                 />
                 <ObjectiveCard 
                    objective={ValuationObjective.INTERNAL_DECISION}
                    icon={BarChart3}
                    desc="适用于企业内部ROI分析、战略投资决策。优先采用咨询机构模型与收益法。"
                 />
             </div>
         </div>

         {/* Step 2: Select Model */}
         {selectedObjective && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        智能推荐模型
                    </h3>
                    <span className="text-xs text-google-blue bg-blue-50 px-2 py-1 rounded font-medium">
                        已为您筛选最匹配算法
                    </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {filteredModels.map((model) => (
                        <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-purple-200 transition duration-300 overflow-hidden flex flex-col group relative">
                            {/* Official Badge */}
                            {model.isOfficial && (
                                <div className="absolute top-0 right-0 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-red-100 z-10 flex items-center gap-1">
                                    <Shield size={10} /> 官方权威
                                </div>
                            )}

                            {/* Header Color Strip */}
                            <div className={`h-1.5 w-full ${
                                model.isOfficial ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <University size={14}/>
                                        {model.provider}
                                    </div>
                                    <div className="mt-4">
                                        {model.cost > 0 ? (
                                            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-100">
                                                {model.cost} 积分
                                            </span>
                                        ) : (
                                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-100">
                                                FREE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-google-blue transition">{model.name}</h4>
                                <p className="text-sm text-gray-600 mb-5 flex-1 leading-relaxed">
                                    {model.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {model.tags.map(tag => (
                                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">#{tag}</span>
                                    ))}
                                    <span className={`text-[10px] px-2 py-1 rounded border ${
                                        model.riskSensitivity === 'Aggressive' ? 'text-orange-600 border-orange-100 bg-orange-50' :
                                        model.riskSensitivity === 'Conservative' ? 'text-blue-600 border-blue-100 bg-blue-50' : 'text-green-600 border-green-100 bg-green-50'
                                    }`}>
                                        {model.riskSensitivity} 策略
                                    </span>
                                </div>

                                <button 
                                    onClick={() => onSelectModel(model)}
                                    className="w-full py-2.5 rounded-lg border-2 border-gray-100 font-bold text-sm text-gray-700 hover:border-google-blue hover:text-google-blue hover:bg-blue-50 transition flex items-center justify-center gap-2"
                                >
                                    选择此模型
                                    <CheckCircle size={16} className="opacity-0 group-hover:opacity-100 transition" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         )}
         
         <div className="mt-8 text-center flex justify-center">
             <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
                暂不选择，使用系统默认算法 <Info size={12}/>
             </button>
         </div>
      </div>
    </div>
  );
};

export default ModelMarketplace;