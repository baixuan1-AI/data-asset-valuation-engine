import React, { useState, useEffect, useRef } from 'react';
import { DataAsset, AssessmentStatus, ScenarioType, UserRole, ProjectInfo, TeamMember, DataCategory } from '../types';
import { Plus, Database, ChevronRight, PieChart, Activity, TrendingUp, TrendingDown, Lock, Users, Calendar, Target, FileText, Server, X, UserPlus, ShieldAlert, AlignLeft, RefreshCw, Ban, Gift, Building2, Layers, Check, HardDrive, Hash, Clock, MoreVertical, Trash2, ArrowUp, ArrowDown, Edit2, Share2, Briefcase, User, Copy, Info, RotateCcw } from 'lucide-react';
import { ROLE_META } from './SecurityGate';

interface DashboardProps {
  assets: DataAsset[];
  currentUserRole: UserRole;
  onSelectAsset: (asset: DataAsset) => void;
  onCreateAsset: (assetData: Partial<DataAsset>) => void;
  onUpdateAsset: (asset: DataAsset) => void;
  onDeleteAsset: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onMoveAsset: (id: string, direction: 'up' | 'down') => void;
  
  onMarketplace: () => void;
  onOpenRedeem: () => void;
  onOpenProvider: () => void; 
  onShowHistory: () => void; 
  currentPoints: number; 
}

const ASSESSMENT_PURPOSES = [
  "公共数据授权运营 (Public Data Operation)", 
  "财务报告/入表 (Financial Reporting)",
  "融资信贷/质押 (Financing/Loan)",
  "企业战略决策 (Strategic Decision)",
  "合规与风险管理 (Compliance/Risk)",
  "投资并购估值 (M&A Valuation)",
  "数据产品交易 (Data Trading)" 
];

const CATEGORY_DESCRIPTIONS: Record<DataCategory, string> = {
    [DataCategory.GOVERNMENT]: "政府部门管理的数据（如医疗、交通、教育等公共服务数据，及统计、财政等宏观经济数据）。",
    [DataCategory.INDUSTRIAL]: "特定行业（金融、制造、零售等）生产经营中产生的数据（如供应链、生产制造、客户交易）。",
    [DataCategory.RESEARCH]: "高校、科研机构在科学研究中产生的实验数据、观测数据等。",
    [DataCategory.PERSONAL]: "涉及自然人个人信息的数据，需严格遵守隐私法规（PIPL）。",
    [DataCategory.OTHER]: "不属于以上分类的其他数据资产。"
};

const MARKET_NEWS = [
    { text: "北京数据交易所：医疗脱敏数据集成交均价上涨 12%", change: "+12%" },
    { text: "交通运输部：加强交通运输数据资产管理，鼓励公路数据入表", change: "+5%" },
    { text: "上海数交所：新增 3 个物流类数据产品挂牌，流动性评级 A+", change: "+3%" },
    { text: "行业预警：部分低质量爬虫数据产品被强制下架，估值归零", change: "-100%" },
    { text: "深圳发布数据资产入表新规指南，明确成本法核算边界", change: "+0%" },
    { text: "广州数据交易所：金融信贷类数据包交易额突破 5 亿元", change: "+8%" }
];

// Rolling Number Component
const RollingNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);
    
    useEffect(() => {
        let start = displayValue;
        const end = value;
        if (start === end) return;

        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * ease);
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [value]);

    return <span>{displayValue.toLocaleString()}</span>;
};

const Dashboard: React.FC<DashboardProps> = ({ 
    assets, currentUserRole, onSelectAsset, onCreateAsset, 
    onUpdateAsset, onDeleteAsset, onToggleStatus, onMoveAsset,
    onMarketplace, onOpenRedeem, onOpenProvider, onShowHistory, currentPoints 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [newsIndex, setNewsIndex] = useState(0);
  
  // News Ticker Logic
  useEffect(() => {
      const interval = setInterval(() => {
          setNewsIndex((prev) => (prev + 1) % MARKET_NEWS.length);
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  // Form State
  const [formData, setFormData] = useState<{
      name: string;
      unitName: string; 
      dataCategory: DataCategory; 
      scope: string;
      purpose: string[]; 
      deadline: string;
      background: string;
  }>({
      name: '', unitName: '', dataCategory: DataCategory.INDUSTRIAL, scope: '', 
      purpose: [], deadline: '', background: ''
  });

  // Team Building State
  const [teamList, setTeamList] = useState<Partial<TeamMember>[]>([]);
  const [newMember, setNewMember] = useState<{ name: string, phone: string, roles: UserRole[] }>({ name: '', phone: '', roles: [] });
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // Initialize form when editing
  const openEditModal = (asset: DataAsset) => {
      setEditingAssetId(asset.id);
      setFormData({
          name: asset.name,
          unitName: asset.projectInfo?.unitName || '',
          dataCategory: asset.projectInfo?.dataCategory || DataCategory.INDUSTRIAL,
          scope: asset.projectInfo?.scope || '',
          purpose: asset.projectInfo?.purpose.split(' + ') || [],
          deadline: asset.projectInfo?.deadline || '',
          background: asset.projectInfo?.background || ''
      });
      setTeamList(asset.teamMembers || []);
      setShowCreateModal(true);
  };

  const handleCloseModal = () => {
      setShowCreateModal(false);
      setEditingAssetId(null);
      setFormData({ name: '', unitName: '', dataCategory: DataCategory.INDUSTRIAL, scope: '', purpose: [], deadline: '', background: '' });
      setTeamList([]);
      setNewMember({ name: '', phone: '', roles: [] });
  };

  const toggleNewMemberRole = (role: UserRole) => {
      setNewMember(prev => {
          if (prev.roles.includes(role)) {
              return { ...prev, roles: prev.roles.filter(r => r !== role) };
          } else {
              return { ...prev, roles: [...prev.roles, role] };
          }
      });
  };

  const toggleMemberStatus = (memberIndex: number) => {
      const newList = [...teamList];
      newList[memberIndex].isDisabled = !newList[memberIndex].isDisabled;
      setTeamList(newList);
  };

  const resetMemberPassword = (memberIndex: number) => {
      if(confirm("确定重置该成员的密码为初始密码 (123456) 吗？")) {
          const newList = [...teamList];
          newList[memberIndex].isInitialPassword = true;
          setTeamList(newList);
          alert("密码已重置成功。");
      }
  };

  const togglePurpose = (p: string) => {
      setFormData(prev => {
          if (prev.purpose.includes(p)) {
              return { ...prev, purpose: prev.purpose.filter(item => item !== p) };
          } else {
              return { ...prev, purpose: [...prev.purpose, p] };
          }
      });
  };

  const handleAddMember = (e?: React.FormEvent) => {
      if(e) e.preventDefault();
      
      if (!/^\d{11}$/.test(newMember.phone)) {
          alert("请输入正确的11位手机号码");
          return;
      }

      if(!newMember.name || newMember.roles.length === 0) return;
      
      setTeamList([...teamList, { 
          id: Date.now().toString(), 
          name: newMember.name, 
          phone: newMember.phone, 
          roles: newMember.roles,
          isInitialPassword: true,
          isDisabled: false
      }]);
      setNewMember({ name: '', phone: '', roles: [] });
  };

  const handleRemoveMember = (idx: number) => {
      const newList = [...teamList];
      newList.splice(idx, 1);
      setTeamList(newList);
  };

  const handleCopyInvite = (m: Partial<TeamMember>) => {
      const script = `【DataPricing Ai】${m.name}，管理员邀请您加入协作。\n项目：${formData.name || '新资产评估'}\n登录手机：${m.phone}\n初始密码：123456\n机构码请咨询管理员。`;
      navigator.clipboard.writeText(script);
      setCopiedInviteId(m.id || null);
      setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const isFormValid = () => {
      return (
          formData.name && 
          formData.unitName && 
          formData.scope && 
          formData.deadline &&
          formData.purpose.length > 0
      );
  };

  const submitCreate = () => {
      if (!isFormValid()) return;
      
      const assetPayload: Partial<DataAsset> = {
          name: formData.name,
          projectInfo: {
              unitName: formData.unitName, 
              dataCategory: formData.dataCategory, 
              scope: formData.scope,
              purpose: formData.purpose.join(' + '), 
              methodology: 'AI智能推荐',
              deadline: formData.deadline,
              background: formData.background
          },
          teamMembers: teamList as TeamMember[]
      };

      if (editingAssetId) {
          const original = assets.find(a => a.id === editingAssetId);
          if (original) {
              onUpdateAsset({ ...original, ...assetPayload, id: editingAssetId });
          }
      } else {
          onCreateAsset(assetPayload);
      }
      
      handleCloseModal();
  };

  const isAdmin = currentUserRole === UserRole.SUPER_ADMIN;
  const isGuest = currentUserRole === UserRole.GUEST;
  const canCreate = isAdmin || isGuest;

  const ROLE_SELECTION_ORDER = [
      UserRole.SUPER_ADMIN,
      UserRole.DECISION,
      UserRole.BUSINESS,
      UserRole.TECH,
      UserRole.LEGAL,
      UserRole.FINANCE 
  ];

  const estimatedReports = Math.floor(currentPoints / 300);

  const isMemberValid = newMember.name && /^\d{11}$/.test(newMember.phone) && newMember.roles.length > 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 relative">
      
      {/* Create Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-in zoom-in duration-300 my-8">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                      <div>
                          <h2 className="text-xl font-bold text-gray-800">{editingAssetId ? '编辑立项信息' : '立项：新资产评估'}</h2>
                          <p className="text-xs text-gray-500">Project Initiation Wizard</p>
                      </div>
                      <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      {/* Section 1: Basic Info */}
                      <div>
                          <h3 className="text-sm font-bold text-google-blue uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
                              <FileText size={16}/> 1. 评估标的定义 (必填)
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Row 1 */}
                              <div className="col-span-1">
                                  <label className="block text-xs font-bold text-gray-500 mb-1.5">单位名称 (权属主体) <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                     <Building2 size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                     <input 
                                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-google-blue outline-none transition" 
                                        placeholder="如：XX科技有限公司"
                                        value={formData.unitName}
                                        onChange={e => setFormData({...formData, unitName: e.target.value})}
                                     />
                                  </div>
                              </div>
                              <div className="col-span-1">
                                  <label className="block text-xs font-bold text-gray-500 mb-1.5">项目/资产名称 <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                     <Database size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                     <input 
                                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-google-blue outline-none transition" 
                                        placeholder="例如：2024年集团CRM会员数据集"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                     />
                                  </div>
                              </div>

                              {/* Row 2: Data Category */}
                              <div className="col-span-2">
                                  <label className="block text-xs font-bold text-gray-500 mb-2">数据权属类型 <span className="text-red-500">*</span></label>
                                  <div className="grid grid-cols-1 gap-2">
                                      {Object.values(DataCategory).map((category) => {
                                          const desc = CATEGORY_DESCRIPTIONS[category];
                                          const isSelected = formData.dataCategory === category;
                                          return (
                                              <div 
                                                key={category}
                                                onClick={() => setFormData({...formData, dataCategory: category})}
                                                className={`p-3 rounded-lg border flex flex-col gap-1 transition relative overflow-hidden cursor-pointer ${
                                                    isSelected 
                                                        ? 'border-google-blue bg-blue-50/50 text-google-blue ring-1 ring-google-blue' 
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                                                }`}
                                              >
                                                  <div className="flex items-center gap-3">
                                                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                                          isSelected ? 'border-google-blue' : 'border-gray-300'
                                                      }`}>
                                                          {isSelected && <div className="w-2 h-2 rounded-full bg-google-blue"></div>}
                                                      </div>
                                                      <span className="text-sm font-bold">{category}</span>
                                                  </div>
                                                  <p className={`text-[10px] ml-7 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                                                      {desc}
                                                  </p>
                                              </div>
                                          )
                                      })}
                                  </div>
                              </div>

                              {/* Row 3: Scope & Deadline */}
                              <div className="col-span-1">
                                  <label className="block text-xs font-bold text-gray-500 mb-1.5">评估范围 <span className="text-red-500">*</span></label>
                                  <input 
                                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-google-blue outline-none transition" 
                                      placeholder="如：华东区2023年全量数据"
                                      value={formData.scope}
                                      onChange={e => setFormData({...formData, scope: e.target.value})}
                                  />
                              </div>
                              <div className="col-span-1">
                                  <label className="block text-xs font-bold text-gray-500 mb-1.5">要求交付日期 <span className="text-red-500">*</span></label>
                                  <input 
                                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-google-blue outline-none transition" 
                                      placeholder="如：2024-12-31"
                                      value={formData.deadline}
                                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                                  />
                              </div>
                              
                              {/* Row 4: Context */}
                              <div className="col-span-2">
                                  <label className="block text-xs font-bold text-gray-500 mb-1.5">项目背景描述 (Ai 上下文增强)</label>
                                  <textarea 
                                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-google-blue outline-none min-h-[80px] transition" 
                                      placeholder="请简述业务背景及核心动因。例如：拟利用该数据资产进行银行质押贷款，需重点评估其合规性与市场公允价值。"
                                      value={formData.background}
                                      onChange={e => setFormData({...formData, background: e.target.value})}
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Section 2: Purpose */}
                      <div>
                          <h3 className="text-sm font-bold text-google-blue uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                              <Target size={16}/> 2. 评估目的 (多选，必填) <span className="text-red-500">*</span>
                          </h3>
                          <div className="flex flex-wrap gap-3">
                              {ASSESSMENT_PURPOSES.map((purpose) => {
                                  const isSelected = formData.purpose.includes(purpose);
                                  return (
                                      <button
                                          key={purpose}
                                          onClick={() => togglePurpose(purpose)}
                                          className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition flex items-center gap-2 ${
                                              isSelected 
                                              ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-105' 
                                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                          }`}
                                      >
                                          {isSelected && <Check size={12} className="text-white"/>}
                                          {purpose.split(' (')[0]}
                                      </button>
                                  )
                              })}
                          </div>
                          {formData.purpose.length === 0 && (
                              <p className="text-[10px] text-red-400 mt-2 font-medium animate-pulse">⚠️ 请至少选择一项评估目的以指导模型计算</p>
                          )}
                      </div>

                      {/* Section 3: Team (Hidden for Guests) */}
                      {!isGuest && (
                          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                              <h3 className="text-sm font-bold text-google-blue uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <Users size={16}/> 3. 组建协同团队 (可选)
                              </h3>
                              
                              {/* REDESIGNED Add Member Area: Compact */}
                              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm mb-6">
                                  <div className="flex flex-col gap-3">
                                      <div className="flex gap-3">
                                          <div className="flex-1 relative">
                                              <User size={14} className="absolute left-3 top-2.5 text-gray-400"/>
                                              <input 
                                                  className="w-full pl-9 p-2 border border-gray-200 bg-gray-50 rounded-lg text-xs outline-none focus:border-google-blue focus:bg-white transition h-9"
                                                  placeholder="成员姓名"
                                                  value={newMember.name}
                                                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                                              />
                                          </div>
                                          <div className="flex-1 relative">
                                              <input 
                                                  className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg text-xs outline-none focus:border-google-blue focus:bg-white transition h-9"
                                                  placeholder="11位手机号"
                                                  value={newMember.phone}
                                                  onChange={e => setNewMember({...newMember, phone: e.target.value})}
                                              />
                                          </div>
                                      </div>
                                      
                                      <div className="flex justify-between items-center gap-2">
                                          <div className="flex flex-wrap gap-1.5 flex-1">
                                              {ROLE_SELECTION_ORDER.map(role => {
                                                  const isSelected = newMember.roles.includes(role);
                                                  const meta = ROLE_META[role];
                                                  return (
                                                      <button
                                                          key={role}
                                                          onClick={() => toggleNewMemberRole(role)}
                                                          className={`text-[9px] px-2 py-1 rounded-full border transition-all font-bold ${
                                                              isSelected 
                                                              ? `${meta.bg.replace('50', '100')} ${meta.color} border-${meta.color.split('-')[1]}-200` 
                                                              : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                                                          }`}
                                                      >
                                                          {meta.label.split('/')[0]}
                                                      </button>
                                                  );
                                              })}
                                          </div>
                                          
                                          <button 
                                              onClick={handleAddMember}
                                              disabled={!isMemberValid}
                                              className={`h-8 px-4 text-xs font-bold rounded-full shadow-sm flex items-center gap-1 transition active:scale-95 whitespace-nowrap ${
                                                  isMemberValid 
                                                  ? 'bg-google-blue text-white hover:bg-blue-600' 
                                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                              }`}
                                          >
                                              <Plus size={12}/> 添加
                                          </button>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Team List with Actions */}
                              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar px-1">
                                  {teamList.map((m, idx) => (
                                      <div key={idx} className={`relative flex justify-between items-center bg-white p-2.5 rounded-lg border text-sm transition gap-3 group ${m.isDisabled ? 'border-red-100 bg-red-50/20' : 'border-gray-100 hover:shadow-sm'}`}>
                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm text-xs ${m.isDisabled ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                                                  {m.name[0]}
                                              </div>
                                              <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-gray-800 text-xs ${m.isDisabled ? 'line-through text-gray-400' : ''}`}>{m.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{m.phone}</span>
                                                    {m.isDisabled && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 rounded font-bold">已冻结</span>}
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {m.roles?.map(r => (
                                                        <span key={r} className="text-[9px] px-1.5 py-0 bg-gray-50 text-gray-600 rounded border border-gray-200">
                                                            {ROLE_META[r].label}
                                                        </span>
                                                    ))}
                                                </div>
                                              </div>
                                          </div>

                                          {/* Right Actions */}
                                          <div className="flex items-center gap-2">
                                              <button 
                                                onClick={() => handleCopyInvite(m)}
                                                className="relative px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 text-google-blue bg-blue-50 hover:bg-blue-100"
                                              >
                                                {copiedInviteId === m.id ? <Check size={10}/> : <Copy size={10}/>}
                                                {copiedInviteId === m.id ? '已复制' : '复制'}
                                              </button>

                                              <div className="w-px h-3 bg-gray-200 mx-1"></div>

                                              <div className="flex items-center gap-1 text-gray-400">
                                                  <button onClick={() => handleRemoveMember(idx)} className="p-1 hover:text-red-600 hover:bg-red-50 rounded transition" title="移除">
                                                      <Trash2 size={12}/>
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                                  {teamList.length === 0 && (
                                      <div className="text-center py-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                          <p className="text-[10px] text-gray-400">暂无成员，请在上方添加。</p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
                      <div className="text-xs text-gray-400">
                          * 标星字段为必填项
                      </div>
                      <div className="flex gap-3">
                          <button onClick={handleCloseModal} className="px-6 py-2.5 rounded-lg font-bold text-gray-500 hover:bg-gray-200 transition">
                              取消
                          </button>
                          <button 
                              onClick={submitCreate}
                              disabled={!isFormValid()}
                              className="px-8 py-2.5 rounded-lg font-bold text-white bg-google-blue hover:bg-blue-600 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                              {isFormValid() ? <Check size={16}/> : <Lock size={16}/>}
                              {editingAssetId ? '保存修改' : '确认立项'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-google-text flex items-center gap-2">
                数据资产工作台 
                {isGuest && <span className="text-xs font-normal text-white bg-purple-500 px-2 py-0.5 rounded-full">游客体验模式</span>}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Data Asset Workspace</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={onOpenProvider}
                className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-4 py-2.5 rounded-full hover:bg-gray-50 hover:border-gray-300 transition text-xs font-bold"
            >
                <Briefcase size={14} /> 服务商入驻
            </button>

            {canCreate ? (
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-google-blue text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-blue-600 transition font-medium animate-in fade-in"
                >
                    <Plus size={20} /> 新增评估
                </button>
            ) : (
                <div className="group relative">
                    <button 
                        disabled
                        className="flex items-center gap-2 bg-gray-100 text-gray-400 px-5 py-2.5 rounded-full border border-gray-200 cursor-not-allowed"
                    >
                        <Lock size={16} /> 新增评估
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 mb-8 border border-gray-100 shadow-sm flex items-center gap-3 overflow-hidden h-14 relative">
        <div className="bg-red-50 text-red-600 p-1.5 rounded-md flex-shrink-0 self-center">
            <Activity size={16} />
        </div>
        <div className="flex-1 h-full relative overflow-hidden">
            {MARKET_NEWS.map((news, idx) => (
                <div 
                    key={idx}
                    className={`absolute w-full h-full flex items-center justify-between transition-all duration-500 ease-in-out transform ${
                        idx === newsIndex 
                        ? 'translate-y-0 opacity-100' 
                        : idx < newsIndex ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'
                    }`}
                >
                    <span className="text-xs md:text-sm text-gray-700 font-medium truncate pr-4">{news.text}</span>
                    <span className={`text-xs font-bold whitespace-nowrap px-2 py-1 rounded ${
                        news.change.startsWith('+') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                        {news.change}
                    </span>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">管理资产</p>
            <div className="flex items-end gap-2 mt-2">
                <p className="text-3xl font-bold text-google-text">{assets.length}</p>
                <span className="text-xs text-gray-400 mb-1">个</span>
            </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">预估总价值</p>
            <div className="flex items-end gap-2 mt-2">
                <p className="text-3xl font-bold text-red-600">
                    {assets.length > 0 ? "¥2.4M" : "¥0"}
                </p>
                {assets.length > 0 && <span className="text-xs text-red-600 mb-1 bg-red-50 px-1 rounded flex items-center"><TrendingUp size={10} className="mr-0.5"/> +5%</span>}
            </div>
         </div>
         <div 
            className="col-span-2 md:col-span-1 bg-gradient-to-br from-google-blue to-blue-600 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden group flex flex-col justify-between"
         >
            <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full group-hover:scale-110 transition duration-500"></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">储值积分 (Points)</p>
                    <p className="text-3xl font-bold mt-2">
                        <RollingNumber value={currentPoints} />
                    </p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onOpenRedeem(); }}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-sm transition"
                >
                    <Gift size={12} /> 兑换/充值
                </button>
            </div>
            
            <div className="mt-2 flex items-center justify-between relative z-10">
                <p className="text-xs text-blue-100">{isGuest ? "完成验证获取更多" : `可用于生成${estimatedReports}份资产评估结果`}</p>
                <div 
                    onClick={onShowHistory}
                    className="bg-white/20 p-1 rounded hover:bg-white/30 transition cursor-pointer flex items-center justify-center w-6 h-6" 
                    title="查看积分记录"
                >
                    <ChevronRight size={16} />
                </div>
            </div>
         </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center">
            <Database size={18} className="mr-2 text-google-blue"/> 资产台账
        </h3>
        
        {assets.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-100 transition cursor-pointer" 
                 onClick={() => canCreate && setShowCreateModal(true)}
            >
                <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-3">
                    {canCreate ? <Plus size={24} /> : <Lock size={24}/>}
                </div>
                <p className="text-gray-500 font-medium">暂无数据资产</p>
                <p className="text-xs text-gray-400 mt-1">
                    {isAdmin ? "点击开启您的第一次专业评估" : (isGuest ? "点击立即体验评估流程" : "请联系管理员发起立项")}
                </p>
            </div>
        ) : (
            <div className="space-y-4">
                {assets.map((asset, index) => (
                    <div 
                        key={asset.id} 
                        className={`bg-white rounded-xl border shadow-sm transition group relative overflow-hidden ${
                            asset.isDisabled 
                            ? 'opacity-70 bg-gray-50 border-gray-200' 
                            : 'border-gray-100 hover:shadow-lg hover:border-blue-100'
                        }`}
                        onClick={() => onSelectAsset(asset)}
                    >
                        {!asset.isDisabled && <div className="absolute left-0 top-0 bottom-0 w-1 bg-google-blue opacity-0 group-hover:opacity-100 transition"></div>}
                        
                        <div className="p-4 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 cursor-pointer flex-1">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        asset.status === AssessmentStatus.VALUATION_COMPLETE ? 'bg-green-100 text-green-600' : 
                                        asset.status === AssessmentStatus.NEW ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-google-blue'
                                    }`}>
                                        <PieChart size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-google-text flex items-center gap-2">
                                            {asset.name || "未命名资产"}
                                            {asset.isDisabled && <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded flex items-center gap-1"><Lock size={10}/> 已禁用</span>}
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{asset.industry || "行业未定"}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                                asset.scenario === ScenarioType.UNKNOWN ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-blue-50 text-google-blue border-blue-100'
                                            }`}>
                                                {asset.scenario}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-right self-start md:self-center">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                            asset.status === AssessmentStatus.VALUATION_COMPLETE ? 'bg-green-500' : 'bg-google-blue animate-pulse'
                                    }`}></span>
                                    <span className={asset.status === AssessmentStatus.VALUATION_COMPLETE ? 'text-green-600' : 'text-google-blue'}>{asset.status}</span>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="border-t border-gray-50 pt-3 flex items-center gap-4 text-xs font-bold text-gray-500" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        onClick={() => openEditModal(asset)} 
                                        className="flex items-center gap-1 hover:text-blue-600 transition" 
                                    >
                                        <Edit2 size={14}/> 修改
                                    </button>
                                    <div className="w-px h-3 bg-gray-200"></div>
                                    <button onClick={() => onMoveAsset(asset.id, 'up')} className="flex items-center gap-1 hover:text-blue-600 transition"><ArrowUp size={14}/> 上移</button>
                                    <button onClick={() => onMoveAsset(asset.id, 'down')} className="flex items-center gap-1 hover:text-blue-600 transition"><ArrowDown size={14}/> 下移</button>
                                    <div className="w-px h-3 bg-gray-200"></div>
                                    <button 
                                        onClick={() => onToggleStatus(asset.id, !!asset.isDisabled)} 
                                        className={`flex items-center gap-1 transition ${asset.isDisabled ? 'text-green-600' : 'hover:text-orange-500'}`} 
                                    >
                                        {asset.isDisabled ? <><Check size={14}/> 启用</> : <><Ban size={14}/> 禁用</>}
                                    </button>
                                    <div className="flex-1"></div>
                                    <button 
                                        onClick={() => onDeleteAsset(asset.id)} 
                                        className="flex items-center gap-1 hover:text-red-600 transition text-gray-400" 
                                    >
                                        <Trash2 size={14}/> 删除
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
