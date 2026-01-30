import React, { useState, useEffect } from 'react';
import { ScreenState, DataAsset, AssetType, AssessmentStatus, ScenarioType, ValuationModel, UserRole, TransactionRecord } from './types';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ReportPreview from './components/ReportPreview';
import ModelMarketplace from './components/ModelMarketplace';
import { SecurityGate } from './components/SecurityGate';
import { LayoutGrid, FileText, Settings, User, LogOut, Sparkles, Building, Phone, CheckCircle2, Key, Copy, Check, Info, Gift, X, Briefcase, MessageCircle, Clock, Server, ShieldCheck, Globe, Loader2, Link2, Database, Code } from 'lucide-react';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenState.SECURITY_GATE);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [currentOrgCode, setCurrentOrgCode] = useState<string | null>(null); // Store Org Code
  
  // Guest Verification State
  const [isGuestVerified, setIsGuestVerified] = useState(false);
  const [showGuestVerifyModal, setShowGuestVerifyModal] = useState(false);
  const [guestProfile, setGuestProfile] = useState({ phone: '', company: '', wechat: '' });

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // New Admin Welcome Modal State
  const [showAdminWelcome, setShowAdminWelcome] = useState(false);

  // Redeem Modal State
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemTab, setRedeemTab] = useState<'code' | 'trial'>('code');
  const [trialForm, setTrialForm] = useState({ company: '', phone: '', wechat: '' });

  // Service Provider Onboarding State
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [providerForm, setProviderForm] = useState({ name: '', type: '评估师', phone: '', wechat: '' });
  const [providerSubmitSuccess, setProviderSubmitSuccess] = useState(false);

  // Points History State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>([]);

  // Listing Simulation State
  const [showListingModal, setShowListingModal] = useState(false);
  const [listingStep, setListingStep] = useState(0); // 0: Idle, 1: Connecting, 2: Uploading, 3: Minting, 4: Done
  
  // Mock Database - In a real app, this would be fetched based on companyId
  const [assets, setAssets] = useState<DataAsset[]>([
     {
         id: '1',
         name: '2023 华东区零售销售数据集',
         type: AssetType.DATASET,
         industry: 'Retail',
         scenario: ScenarioType.INTERNAL_STRATEGY,
         status: AssessmentStatus.IN_PROGRESS,
         lastUpdated: new Date(),
         dimensions: { compliance: 80, quality: 65, cost: 30, value: 70, market: 50 },
         clues: [
             {id:'c1', category:'数据规模', content:'10TB 日志', confidence:'high', creatorRole: UserRole.TECH, visibility: 'public'},
             {id:'c2', category:'时效性', content:'实时更新 (T+0)', confidence:'high', creatorRole: UserRole.TECH, visibility: 'public'},
             {id:'c3', category:'运维成本', content:'¥150k/年', confidence:'high', creatorRole: UserRole.FINANCE, visibility: 'private'},
             {id:'c4', category:'数据源采购', content:'第三方API (保密协议)', confidence:'high', creatorRole: UserRole.LEGAL, visibility: 'private'}
         ],
         messages: [],
         selectedModelId: 'm1',
         companyId: 'ORG-8888',
         projectInfo: {
             scope: '华东区全量',
             dataType: 'static',
             purpose: '内部决策',
             methodology: '成本法',
             deadline: '1周',
             unitName: 'XX零售集团',
         },
         teamMembers: []
     }
  ]);

  const [credits, setCredits] = useState(850);
  const [highlightPoints, setHighlightPoints] = useState(false);

  // Effect to handle points animation
  useEffect(() => {
      if (highlightPoints) {
          const timer = setTimeout(() => setHighlightPoints(false), 2000);
          return () => clearTimeout(timer);
      }
  }, [highlightPoints]);

  const addTransaction = (amount: number, type: 'income' | 'expense', desc: string) => {
      setTransactionHistory(prev => [{
          id: Date.now().toString(),
          amount,
          type,
          description: desc,
          date: new Date().toLocaleString()
      }, ...prev]);
  };

  const handleLogin = (role: UserRole, companyId: string, userData?: { phone?: string, orgCode?: string, isNew?: boolean }) => {
      setCurrentUserRole(role);
      setCurrentCompanyId(companyId);
      setCurrentScreen(ScreenState.DASHBOARD);
      
      if (userData?.orgCode) {
          setCurrentOrgCode(userData.orgCode);
      } else {
          setCurrentOrgCode(companyId); // Fallback
      }

      if (userData?.phone) {
          setGuestProfile(prev => ({ ...prev, phone: userData.phone! }));
      }
      // If guest, ensure they have base credits to play with
      if (role === UserRole.GUEST) {
          setCredits(850);
          setIsGuestVerified(false);
      }

      // If New Admin, boost credits and show welcome guide
      if (userData?.isNew && role === UserRole.SUPER_ADMIN) {
          setCredits(3000); 
          addTransaction(3000, 'income', '新机构开通赠送');
          setShowAdminWelcome(true);
      }
  };

  const handleLogout = () => {
      setCurrentUserRole(null);
      setCurrentCompanyId(null);
      setCurrentOrgCode(null);
      setCurrentScreen(ScreenState.SECURITY_GATE);
      setIsGuestVerified(false);
      setGuestProfile({ phone: '', company: '', wechat: '' });
      setShowProfileModal(false);
      setShowAdminWelcome(false);
  };

  const handleCreateAsset = (assetData: Partial<DataAsset>) => {
    const newAsset: DataAsset = {
        id: Date.now().toString(),
        name: assetData.name || '新数据资产评估',
        type: AssetType.DATA_PRODUCT,
        status: AssessmentStatus.NEW,
        lastUpdated: new Date(),
        dimensions: { compliance: 10, quality: 10, cost: 10, value: 10, market: 10 },
        clues: [],
        messages: [],
        scenario: ScenarioType.UNKNOWN,
        selectedModelId: 'm1', // Default model
        companyId: currentCompanyId || 'UNKNOWN',
        isDisabled: false,
        isDeleted: false,
        hasPaidValuation: false, // Init
        ...assetData // Merge project info and team members
    };
    setAssets([newAsset, ...assets]);
    setActiveAssetId(newAsset.id);
    setCurrentScreen(ScreenState.ASSESSMENT_CHAT);
  };

  const handleSelectAsset = (asset: DataAsset) => {
    if (asset.isDisabled && currentUserRole !== UserRole.SUPER_ADMIN) {
        alert("该项目已被管理员禁用，请联系管理员解锁。");
        return;
    }
    setActiveAssetId(asset.id);
    if (asset.status === AssessmentStatus.VALUATION_COMPLETE || asset.status === AssessmentStatus.LISTED) {
        setCurrentScreen(ScreenState.REPORT_PREVIEW);
    } else {
        setCurrentScreen(ScreenState.ASSESSMENT_CHAT);
    }
  };

  const handleUpdateAsset = (updatedAsset: DataAsset) => {
    setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  };

  const handleDeleteAsset = (id: string) => {
      if (confirm("确定要将此项目移入回收站吗？")) {
          setAssets(assets.map(a => a.id === id ? { ...a, isDeleted: true } : a));
      }
  };

  const handleToggleAssetStatus = (id: string, currentStatus: boolean) => {
      setAssets(assets.map(a => a.id === id ? { ...a, isDisabled: !currentStatus } : a));
  };

  const handleMoveAsset = (id: string, direction: 'up' | 'down') => {
      const index = assets.findIndex(a => a.id === id);
      if (index === -1) return;
      
      const newAssets = [...assets];
      if (direction === 'up' && index > 0) {
          [newAssets[index], newAssets[index - 1]] = [newAssets[index - 1], newAssets[index]];
      } else if (direction === 'down' && index < newAssets.length - 1) {
          [newAssets[index], newAssets[index + 1]] = [newAssets[index + 1], newAssets[index]];
      }
      setAssets(newAssets);
  };

  const handleFinishAssessment = () => {
      if (currentUserRole === UserRole.GUEST && !isGuestVerified) {
          setShowGuestVerifyModal(true);
          return;
      }

      if (currentUserRole === UserRole.SUPER_ADMIN || currentUserRole === UserRole.GUEST || currentUserRole === UserRole.BUSINESS) {
        setCurrentScreen(ScreenState.MARKETPLACE);
      } else {
        setCurrentScreen(ScreenState.DASHBOARD);
        if (activeAssetId) {
             alert(`[${currentUserRole}] 任务已提交，进度已同步至管理员。`);
        }
      }
  };

  const handleGuestVerifySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // LOGIC FIX: Check 11-digit phone
      if (!/^\d{11}$/.test(guestProfile.phone)) {
          alert("请输入正确的11位手机号码");
          return;
      }

      setTimeout(() => {
          setIsGuestVerified(true);
          setShowGuestVerifyModal(false);
          setCredits(prev => prev + 2000); 
          addTransaction(2000, 'income', '信息完善奖励');
          setHighlightPoints(true);
          
          // UPGRADE LOGIC: Guest -> SUPER_ADMIN
          setCurrentUserRole(UserRole.SUPER_ADMIN); 
          // Generate a fake org code for them if they don't have one
          if (currentOrgCode === 'DEMO-GUEST-001') {
              setCurrentOrgCode(`ORG-${Math.floor(Math.random()*10000)}`);
          }

          alert("🎉 认证成功！\n\n您已升级为【超级管理员】，并获得 2000 积分奖励。");

          // Continue to wherever they were headed or Dashboard
          // If flow was triggered by Listing, we might want to trigger listing, but simpler to just let them click again.
          // Or if they were finishing assessment:
          if (currentScreen === ScreenState.REPORT_PREVIEW) {
              // Stay on report
          } else {
              setCurrentScreen(ScreenState.MARKETPLACE);
          }
      }, 800);
  };

  const handleSelectModel = (model: ValuationModel) => {
      if(activeAssetId) {
          const asset = assets.find(a => a.id === activeAssetId);
          if(asset) {
              // LOGIC FIX: Strict Credit Check
              if (!asset.hasPaidValuation) {
                  if (credits < model.cost) {
                      alert("积分不足，请充值！");
                      setShowRedeemModal(true); // Open redeem modal automatically
                      return;
                  }
                  setCredits(c => c - model.cost);
                  addTransaction(model.cost, 'expense', `购买模型：${model.name}`);
              }
              
              // LOGIC FIX: Generate Report Data ONCE here to persist trend chart
              let valueHistory = asset.valueHistory;
              if (!valueHistory || valueHistory.length === 0) {
                  const trendData = [];
                  const startMonth = new Date().getMonth();
                  const baseValue = 150000; // Mock base
                  for (let i = 0; i < 12; i++) {
                      const d = new Date();
                      d.setMonth(startMonth - 11 + i);
                      const monthStr = `${d.getMonth() + 1}月`;
                      const growthFactor = 0.85 + (i * 0.02) + (Math.random() * 0.05);
                      trendData.push({
                          date: monthStr,
                          value: Math.floor(baseValue * growthFactor)
                      });
                  }
                  valueHistory = trendData;
              }

              handleUpdateAsset({
                  ...asset, 
                  status: AssessmentStatus.VALUATION_COMPLETE,
                  selectedModelId: model.id,
                  hasPaidValuation: true, // Mark as paid
                  valueHistory: valueHistory // Save trend data
              });
              setCurrentScreen(ScreenState.REPORT_PREVIEW);
          }
      }
  };

  const startListingProcess = () => {
      // 1. Check Auth (Guest Trap)
      if (currentUserRole === UserRole.GUEST && !isGuestVerified) {
          setShowGuestVerifyModal(true);
          return;
      }

      // 2. Check Credits
      const LISTING_COST = 1000;
      if (credits < LISTING_COST) {
          alert(`挂牌服务需消耗 ${LISTING_COST} 积分，您的余额不足。`);
          setShowRedeemModal(true);
          return;
      }

      // 3. Deduct & Start
      // Simplified confirm to just proceed if clicked
      setCredits(c => c - LISTING_COST);
      addTransaction(LISTING_COST, 'expense', '交易所挂牌服务费');
      setShowListingModal(true);
      
      // Simulation Sequence
      setListingStep(1); // Connect
      setTimeout(() => setListingStep(2), 2500); // Upload
      setTimeout(() => setListingStep(3), 5000); // Mint
      setTimeout(() => {
          setListingStep(4); // Success
          // Update Asset Status
          if(activeAssetId) {
              const asset = assets.find(a => a.id === activeAssetId);
              if(asset) handleUpdateAsset({...asset, status: AssessmentStatus.LISTED});
          }
      }, 7500);
  };
  
  const handleCopyOrgCode = () => {
      if(currentOrgCode) {
          navigator.clipboard.writeText(currentOrgCode);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      }
  };

  const handleRedeem = () => {
      if (redeemCode.trim() === '') return;
      if (redeemCode === 'DV2024' || redeemCode === 'VIP888') {
          setCredits(prev => prev + 10000); 
          addTransaction(10000, 'income', '兑换码充值');
          setHighlightPoints(true);
          alert("🎉 兑换成功！\n\n已成功充值 10,000 积分");
          setShowRedeemModal(false);
          setRedeemCode('');
      } else {
          alert("❌ 无效的兑换码，请检查后重试。");
      }
  };

  const handleTrialSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // LOGIC FIX: 11 digit check
      if (!/^\d{11}$/.test(trialForm.phone)) {
          alert("请输入正确的11位手机号码");
          return;
      }

      setCredits(prev => prev + 3000); 
      addTransaction(3000, 'income', '免费试用申请');
      setHighlightPoints(true);
      alert("🎉 申请成功！\n\n3,000 试用积分已到账。");
      setShowRedeemModal(false);
      setTrialForm({ company: '', phone: '', wechat: '' });
  };

  const handleProviderSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // LOGIC FIX: 11 digit check
      if (!/^\d{11}$/.test(providerForm.phone)) {
          alert("请输入正确的11位手机号码");
          return;
      }

      setProviderSubmitSuccess(true);
  };

  const activeAsset = assets.find(a => a.id === activeAssetId);

  // Security Gate Screen
  if (currentScreen === ScreenState.SECURITY_GATE) {
      return <SecurityGate onLogin={handleLogin} />;
  }

  // Filter assets by company for multi-tenancy simulation & non-deleted
  const visibleAssets = assets.filter(a => a.companyId === currentCompanyId && !a.isDeleted);

  const isGuestValid = /^\d{11}$/.test(guestProfile.phone) && guestProfile.company && guestProfile.wechat;
  const isTrialValid = trialForm.company && /^\d{11}$/.test(trialForm.phone) && trialForm.wechat;
  const isProviderValid = providerForm.name && /^\d{11}$/.test(providerForm.phone) && providerForm.wechat;

  return (
    <div className="flex h-screen w-full bg-white font-sans text-google-text relative">
      
      {/* Listing Simulation Modal */}
      {showListingModal && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-700 overflow-hidden text-white relative">
                  {/* Glowing header bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                  
                  <div className="p-8">
                      <div className="flex justify-between items-center mb-8">
                          <h3 className="text-xl font-bold flex items-center gap-3">
                              <Globe size={24} className="text-blue-400 animate-pulse"/> 
                              上海数据交易所直通车
                          </h3>
                          {listingStep === 4 && (
                              <button onClick={() => setShowListingModal(false)} className="text-gray-400 hover:text-white"><X/></button>
                          )}
                      </div>

                      <div className="space-y-8 relative">
                          {/* Vertical Line */}
                          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gray-800 -z-10"></div>

                          {/* Step 1: Connection */}
                          <div className={`flex items-start gap-4 transition-all duration-700 ${listingStep >= 1 ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-gray-900 transition-colors duration-500 ${listingStep > 1 ? 'bg-green-500 border-green-500 text-white' : (listingStep === 1 ? 'border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-gray-700 text-gray-700')}`}>
                                  {listingStep > 1 ? <Check size={20}/> : <Link2 size={20}/>}
                              </div>
                              <div className="flex-1 pt-1">
                                  <div className="flex justify-between items-center">
                                      <p className={`font-bold ${listingStep === 1 ? 'text-blue-400' : 'text-gray-200'}`}>建立安全握手 (Handshake)</p>
                                      {listingStep === 1 && <Loader2 size={16} className="animate-spin text-blue-400"/>}
                                  </div>
                                  <p className="text-xs text-gray-500 font-mono mt-1">Connecting to SDE Gateway v4.2...</p>
                                  {listingStep === 1 && <p className="text-[10px] text-green-400 font-mono mt-1">TLS 1.3 Secure Connection Established</p>}
                              </div>
                          </div>

                          {/* Step 2: Upload */}
                          <div className={`flex items-start gap-4 transition-all duration-700 ${listingStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-gray-900 transition-colors duration-500 ${listingStep > 2 ? 'bg-green-500 border-green-500 text-white' : (listingStep === 2 ? 'border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-gray-700 text-gray-700')}`}>
                                  {listingStep > 2 ? <Check size={20}/> : <Database size={20}/>}
                              </div>
                              <div className="flex-1 pt-1">
                                  <div className="flex justify-between items-center">
                                      <p className={`font-bold ${listingStep === 2 ? 'text-purple-400' : 'text-gray-200'}`}>元数据哈希上链</p>
                                      {listingStep === 2 && <Loader2 size={16} className="animate-spin text-purple-400"/>}
                                  </div>
                                  <p className="text-xs text-gray-500 font-mono mt-1">Hashing asset metadata to Hyperledger Fabric...</p>
                                  {listingStep === 2 && (
                                      <div className="bg-gray-800 p-2 rounded mt-2 border border-gray-700">
                                          <p className="text-[10px] text-gray-400 font-mono break-all">Hash: 0x7f83b165...9a2b</p>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Step 3: Mint */}
                          <div className={`flex items-start gap-4 transition-all duration-700 ${listingStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-gray-900 transition-colors duration-500 ${listingStep > 3 ? 'bg-green-500 border-green-500 text-white' : (listingStep === 3 ? 'border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'border-gray-700 text-gray-700')}`}>
                                  {listingStep > 3 ? <Check size={20}/> : <Code size={20}/>}
                              </div>
                              <div className="flex-1 pt-1">
                                  <div className="flex justify-between items-center">
                                      <p className={`font-bold ${listingStep === 3 ? 'text-yellow-400' : 'text-gray-200'}`}>生成唯一资产代码</p>
                                      {listingStep === 3 && <Loader2 size={16} className="animate-spin text-yellow-400"/>}
                                  </div>
                                  <p className="text-xs text-gray-500 font-mono mt-1">Minting Unique Asset Token ID...</p>
                              </div>
                          </div>
                      </div>

                      {/* Success State */}
                      {listingStep === 4 && (
                          <div className="mt-8 bg-gradient-to-br from-green-900/50 to-emerald-900/20 border border-green-500/30 p-6 rounded-xl text-center animate-in zoom-in duration-500 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/50">
                                  <CheckCircle2 size={32} className="text-white"/>
                              </div>
                              <p className="text-white font-bold text-xl mb-2">🎉 挂牌申请已受理</p>
                              <p className="text-sm text-gray-300 mb-6">您的资产已成功推送到上海数据交易所预审队列。</p>
                              
                              <div className="bg-black/40 p-3 rounded-lg border border-white/10 mb-6">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Asset Token ID</p>
                                  <p className="font-mono text-green-400 font-bold text-lg tracking-wider">SDE-{Date.now().toString().slice(-8)}</p>
                              </div>

                              <button 
                                onClick={() => setShowListingModal(false)}
                                className="w-full bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition shadow-lg"
                              >
                                  查看受理回执
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Profile / Settings Modal */}
      {showProfileModal && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-start justify-end p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl mt-16 animate-in slide-in-from-right duration-300 p-6">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gray-100 p-1 border border-gray-200">
                          <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${currentUserRole}`} alt="Avatar" className="w-full h-full rounded-full"/>
                      </div>
                      <div>
                          <p className="font-bold text-lg">{currentUserRole}</p>
                          <p className="text-sm text-gray-500">{currentCompanyId}</p>
                      </div>
                  </div>

                  {/* Admin Only: Org Code */}
                  {(currentUserRole === UserRole.SUPER_ADMIN) && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                          <p className="text-xs text-blue-600 font-bold uppercase mb-2">机构代码 (邀请成员)</p>
                          <div className="flex items-center justify-between">
                              <code className="text-xl font-mono font-bold text-blue-900">{currentOrgCode}</code>
                              <button onClick={handleCopyOrgCode} className="text-blue-500 hover:text-blue-700">
                                  {isCopied ? <Check size={18}/> : <Copy size={18}/>}
                              </button>
                          </div>
                          <p className="text-[10px] text-blue-400 mt-2">此代码是团队的唯一通行证。管理员添加成员后，成员可凭 机构码 + 手机号 直接加入。如忘记，可随时在“我的”页面找回。</p>
                      </div>
                  )}

                  <div className="space-y-2">
                      <button 
                        onClick={() => alert("密码修改功能已模拟。")}
                        className="w-full py-3 text-left px-4 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition"
                      >
                          <Key size={18} className="text-gray-500"/> 修改登录密码
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full py-3 text-left px-4 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-3 transition"
                      >
                          <LogOut size={18}/> 退出登录
                      </button>
                  </div>
                  
                  <button onClick={() => setShowProfileModal(false)} className="mt-6 w-full py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200">
                      关闭
                  </button>
              </div>
          </div>
      )}

      {/* Points History Modal */}
      {showHistoryModal && (
          <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <Clock size={18} className="text-google-blue"/> 储值积分记录
                      </h3>
                      <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {transactionHistory.length === 0 ? (
                          <p className="text-center text-gray-400 text-sm py-8">暂无记录</p>
                      ) : (
                          transactionHistory.map(record => (
                              <div key={record.id} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0">
                                  <div>
                                      <p className="font-bold text-sm text-gray-800">{record.description}</p>
                                      <p className="text-xs text-gray-400">{record.date}</p>
                                  </div>
                                  <div className={`font-mono font-bold ${record.type === 'income' ? 'text-red-500' : 'text-green-500'}`}>
                                      {record.type === 'income' ? '+' : '-'}{record.amount}
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Admin Welcome Modal */}
      {showAdminWelcome && (
          <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={32} className="text-google-blue" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">机构创建成功!</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        欢迎您，超级管理员。您的机构空间已就绪。<br/>
                        已为您获赠 <span className="font-bold text-orange-500">3,000 积分</span>。
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">您的机构代码</p>
                        <div className="flex items-center justify-center gap-3">
                            <code className="text-3xl font-mono font-bold text-gray-900 tracking-wider">{currentOrgCode}</code>
                        </div>
                        <div className="mt-3 text-xs text-blue-600 bg-blue-50 py-2 rounded px-2 leading-relaxed">
                            此代码是团队的唯一通行证。<br/>
                            管理员添加成员后，成员可凭 <strong>机构码 + 手机号</strong> 直接加入，无需另行注册。
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowAdminWelcome(false)}
                        className="w-full py-3.5 bg-google-blue text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition"
                    >
                        开始工作
                    </button>
               </div>
          </div>
      )}

      {/* Redeem Points Modal */}
      {showRedeemModal && (
          <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                   <div className="bg-gradient-to-r from-google-blue to-purple-600 p-6 text-white text-center relative">
                        <button 
                            onClick={() => setShowRedeemModal(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <Gift size={40} className="mx-auto mb-3 text-yellow-300 animate-bounce" />
                        <h3 className="text-lg font-bold">兑换积分</h3>
                        <p className="text-xs text-white/80 mt-1">获取更多算力以生成专业报告</p>
                   </div>
                   
                   <div className="p-4 border-b border-gray-100 flex">
                        <button 
                            onClick={() => setRedeemTab('code')}
                            className={`flex-1 py-2 text-sm font-bold border-b-2 transition ${redeemTab === 'code' ? 'text-google-blue border-google-blue' : 'text-gray-400 border-transparent'}`}
                        >
                            兑换码
                        </button>
                        <button 
                            onClick={() => setRedeemTab('trial')}
                            className={`flex-1 py-2 text-sm font-bold border-b-2 transition ${redeemTab === 'trial' ? 'text-google-blue border-google-blue' : 'text-gray-400 border-transparent'}`}
                        >
                            免费试用
                        </button>
                   </div>

                   <div className="p-6">
                        {redeemTab === 'code' ? (
                            <div className="space-y-4">
                                <input 
                                    value={redeemCode}
                                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                    placeholder="输入兑换码 (如: DV2024)"
                                    className="w-full p-3 border-2 border-gray-100 rounded-xl text-center font-mono text-lg font-bold focus:border-google-blue outline-none uppercase tracking-widest placeholder:text-sm placeholder:tracking-normal placeholder:font-sans"
                                />
                                <button 
                                    onClick={handleRedeem}
                                    disabled={!redeemCode}
                                    className="w-full py-3 bg-google-blue text-white font-bold rounded-xl shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    立即兑换 (获 10,000 积分)
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleTrialSubmit} className="space-y-3">
                                <p className="text-xs text-gray-500 mb-2 text-center">完善信息立即获赠 <span className="font-bold text-orange-500">3,000 积分</span></p>
                                <input 
                                    required
                                    value={trialForm.company}
                                    onChange={e => setTrialForm({...trialForm, company: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-google-blue outline-none"
                                    placeholder="单位名称"
                                />
                                <input 
                                    required
                                    value={trialForm.phone}
                                    onChange={e => setTrialForm({...trialForm, phone: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-google-blue outline-none"
                                    placeholder="联系电话"
                                />
                                <input 
                                    required
                                    value={trialForm.wechat}
                                    onChange={e => setTrialForm({...trialForm, wechat: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-google-blue outline-none"
                                    placeholder="微信号"
                                />
                                <button 
                                    type="submit"
                                    disabled={!isTrialValid}
                                    className={`w-full py-3 font-bold rounded-xl shadow-md transition mt-2 ${
                                        isTrialValid 
                                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    免费申请试用点数
                                </button>
                            </form>
                        )}
                   </div>
               </div>
          </div>
      )}

      {/* Service Provider Onboarding Modal */}
      {showProviderModal && (
          <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                  {providerSubmitSuccess ? (
                      <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 size={32} className="text-green-600"/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">申请提交成功</h3>
                          <p className="text-gray-500 text-sm mb-6">
                              感谢您的入驻申请！我们已收到您的资料。
                          </p>
                          <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100 mb-6">
                              <p className="text-xs font-bold text-gray-700 mb-2">后续审核流程：</p>
                              <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                                  <li>人工资质核验（1-3个工作日）</li>
                                  <li>电话回访确认 (021-xxxx)</li>
                                  <li>开通服务商后台权限</li>
                              </ul>
                          </div>
                          <button 
                            onClick={() => {
                                setShowProviderModal(false);
                                setProviderSubmitSuccess(false);
                                setProviderForm({ name: '', type: '评估师', phone: '', wechat: '' });
                            }}
                            className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition"
                          >
                              我知道了
                          </button>
                      </div>
                  ) : (
                      <>
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Briefcase size={20} className="text-yellow-400"/> 服务商入驻
                            </h3>
                            <button onClick={() => setShowProviderModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleProviderSubmit} className="p-6 space-y-4">
                            <p className="text-xs text-gray-500 mb-2">提交个人身份信息，成为 DataPricing Ai 认证专家。</p>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">真实姓名</label>
                                <input 
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-gray-900 outline-none"
                                    value={providerForm.name}
                                    onChange={e => setProviderForm({...providerForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">专业身份</label>
                                <select 
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-gray-900 outline-none bg-white"
                                    value={providerForm.type}
                                    onChange={e => setProviderForm({...providerForm, type: e.target.value})}
                                >
                                    <option>律师</option>
                                    <option>会计师</option>
                                    <option>评估师</option>
                                    <option>其他专家</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">联系手机</label>
                                <input 
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-gray-900 outline-none"
                                    value={providerForm.phone}
                                    onChange={e => setProviderForm({...providerForm, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">微信号</label>
                                <input 
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-gray-900 outline-none"
                                    value={providerForm.wechat}
                                    onChange={e => setProviderForm({...providerForm, wechat: e.target.value})}
                                />
                            </div>
                            <button 
                                disabled={!isProviderValid}
                                className={`w-full py-3 font-bold rounded-lg shadow-lg mt-2 transition ${
                                    isProviderValid 
                                    ? 'bg-gray-900 text-white hover:bg-black' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                提交审核
                            </button>
                        </form>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* Guest Lead Capture Modal */}
      {showGuestVerifyModal && (
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
                      <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                          <Sparkles size={24} className="text-yellow-300"/>
                      </div>
                      <h3 className="text-xl font-bold">升级权益并获取算力积分</h3>
                      <p className="text-white/80 text-xs mt-1">完善档案即可解锁高级估值模型与导出权限</p>
                  </div>
                  <form onSubmit={handleGuestVerifySubmit} className="p-6 space-y-4">
                      <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg flex items-center gap-2">
                          <CheckCircle2 size={16} className="flex-shrink-0"/>
                          <span>认证成功将立即获得 <strong className="text-orange-600">+2000 积分</strong></span>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">手机号码 (已验证)</label>
                          <div className="relative">
                               <Phone size={16} className="absolute left-3 top-3 text-gray-400"/>
                               <input 
                                   type="tel"
                                   value={guestProfile.phone}
                                   onChange={e => setGuestProfile({...guestProfile, phone: e.target.value})}
                                   className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none"
                                   placeholder="手机号码"
                                   required
                               />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">公司/机构全称</label>
                          <div className="relative">
                               <Building size={16} className="absolute left-3 top-3 text-gray-400"/>
                               <input 
                                   type="text"
                                   value={guestProfile.company}
                                   onChange={e => setGuestProfile({...guestProfile, company: e.target.value})}
                                   className="w-full pl-9 p-3 border border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none transition"
                                   placeholder="请输入公司完整名称"
                                   required
                               />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">微信号 (用于接收报告)</label>
                          <div className="relative">
                               <User size={16} className="absolute left-3 top-3 text-gray-400"/>
                               <input 
                                   type="text"
                                   value={guestProfile.wechat}
                                   onChange={e => setGuestProfile({...guestProfile, wechat: e.target.value})}
                                   className="w-full pl-9 p-3 border border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none transition"
                                   placeholder="请输入微信号"
                                   required
                               />
                          </div>
                      </div>
                      <button 
                          type="submit"
                          disabled={!isGuestValid}
                          className={`w-full py-3.5 mt-2 rounded-xl font-bold shadow-lg transition active:scale-95 ${
                              isGuestValid 
                              ? 'bg-gray-900 text-white hover:bg-black' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                          }`}
                      >
                          领取积分并生成报告
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* Mobile-first Layout Container */}
      <div className="flex flex-col flex-1 w-full max-w-full overflow-hidden relative">
        
        {/* Header - Simple & Clean */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-30">
            <div className="flex items-center gap-2" onClick={() => setCurrentScreen(ScreenState.DASHBOARD)}>
                <div className="w-8 h-8 bg-google-blue rounded-lg flex items-center justify-center text-white font-bold cursor-pointer">
                    D
                </div>
                <span className="font-bold text-lg cursor-pointer hidden md:block">DataPricing Ai</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium">
                <div className="hidden md:flex items-center gap-1 text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Sync
                </div>
                {/* Points Display - Clickable for Redeem */}
                <div 
                    onClick={() => setShowRedeemModal(true)}
                    className={`px-3 py-1 rounded-full cursor-pointer transition flex items-center gap-1 border ${highlightPoints ? 'bg-yellow-100 text-yellow-800 border-yellow-300 scale-110' : 'text-google-blue bg-blue-50 border-transparent hover:bg-blue-100'}`}
                    title="点击兑换积分"
                >
                    <Gift size={14} />
                    {credits} 积分
                </div>
                <div 
                    className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 ring-red-200 transition"
                    onClick={() => setShowProfileModal(true)}
                    title="User Profile"
                >
                    <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${currentUserRole}`} alt="Avatar" />
                </div>
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
            {currentScreen === ScreenState.DASHBOARD && currentUserRole && (
                <div className="h-full overflow-y-auto custom-scrollbar">
                    <Dashboard 
                        assets={visibleAssets} 
                        currentUserRole={currentUserRole}
                        onCreateAsset={handleCreateAsset} 
                        onSelectAsset={handleSelectAsset}
                        onUpdateAsset={handleUpdateAsset} 
                        onDeleteAsset={handleDeleteAsset} 
                        onToggleStatus={handleToggleAssetStatus} 
                        onMoveAsset={handleMoveAsset} 
                        onMarketplace={() => setCurrentScreen(ScreenState.MARKETPLACE)}
                        onOpenRedeem={() => setShowRedeemModal(true)}
                        onOpenProvider={() => setShowProviderModal(true)} 
                        onShowHistory={() => setShowHistoryModal(true)} // Pass History handler
                        currentPoints={credits}
                    />
                </div>
            )}

            {currentScreen === ScreenState.ASSESSMENT_CHAT && activeAsset && currentUserRole && (
                <ChatInterface 
                    asset={activeAsset} 
                    currentUserRole={currentUserRole}
                    onUpdateAsset={handleUpdateAsset}
                    onConsumeCredits={(amount) => {
                        // LOGIC FIX: Prevent negative balance
                        if (credits < amount) {
                            alert("积分不足，请充值！");
                            setShowRedeemModal(true);
                        } else {
                            setCredits(c => c - amount);
                            addTransaction(amount, 'expense', 'AI 问答消耗');
                        }
                    }}
                    onFinish={handleFinishAssessment}
                    onBack={() => setCurrentScreen(ScreenState.DASHBOARD)}
                />
            )}

            {currentScreen === ScreenState.MARKETPLACE && (
                <ModelMarketplace 
                    onSelectModel={handleSelectModel}
                    onBack={() => {
                        if (activeAsset?.status === AssessmentStatus.VALUATION_COMPLETE) {
                            setCurrentScreen(ScreenState.REPORT_PREVIEW);
                        } else {
                             setCurrentScreen(ScreenState.ASSESSMENT_CHAT);
                        }
                    }}
                    currentPoints={credits}
                />
            )}

            {currentScreen === ScreenState.REPORT_PREVIEW && activeAsset && (
                <ReportPreview 
                    asset={activeAsset}
                    onBack={() => setCurrentScreen(ScreenState.ASSESSMENT_CHAT)}
                    onMarketplace={startListingProcess}
                    prefilledProfile={{
                        phone: guestProfile.phone,
                    }}
                />
            )}
        </main>

        {/* Bottom Nav (Mobile Only) */}
        <nav className="md:hidden h-16 bg-white border-t border-gray-200 flex items-center justify-around text-gray-400 z-40">
            <button 
                onClick={() => setCurrentScreen(ScreenState.DASHBOARD)}
                className={`flex flex-col items-center ${currentScreen === ScreenState.DASHBOARD ? 'text-google-blue' : ''}`}
            >
                <LayoutGrid size={24} />
                <span className="text-[10px] mt-1">台账</span>
            </button>
            <button className="flex flex-col items-center hover:text-google-blue">
                <FileText size={24} />
                <span className="text-[10px] mt-1">报告</span>
            </button>
            <button className="flex flex-col items-center hover:text-google-blue">
                <Settings size={24} />
                <span className="text-[10px] mt-1">设置</span>
            </button>
             <button className="flex flex-col items-center text-red-400 hover:text-red-600" onClick={handleLogout}>
                <LogOut size={24} />
                <span className="text-[10px] mt-1">登出</span>
            </button>
        </nav>

      </div>
    </div>
  );
};

export default App;