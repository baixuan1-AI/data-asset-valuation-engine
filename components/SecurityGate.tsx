import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  Cpu, Smartphone, Lock, ArrowRight, ShieldCheck, Database, 
  LayoutGrid, Globe2, PlusCircle, Copy, Check, User, Sparkles, Building2, Scale, Wallet
} from 'lucide-react';

interface SecurityGateProps {
  onLogin: (role: UserRole, companyId: string, userData?: { phone?: string, orgCode?: string, isNew?: boolean }) => void;
}

export const ROLE_META = {
  [UserRole.SUPER_ADMIN]: { label: '管理员', desc: '组织架构 / 密码重置', icon: ShieldCheck, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  [UserRole.DECISION]: { label: '管理/战略', desc: '评估范围 / 评估目的', icon: LayoutGrid, color: 'text-purple-600', bg: 'bg-purple-50' },
  [UserRole.BUSINESS]: { label: '业务/运营', desc: '场景描述 / 市场价值', icon: Database, color: 'text-orange-600', bg: 'bg-orange-50' },
  [UserRole.TECH]: { label: '技术/运维', desc: '数据规模 / 技术参数', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
  [UserRole.LEGAL]: { label: '法务/律师', desc: '授权链路 / 法律风险', icon: Scale, color: 'text-red-600', bg: 'bg-red-50' },
  [UserRole.FINANCE]: { label: '财务', desc: '成本归集 / 财务入表', icon: Wallet, color: 'text-teal-600', bg: 'bg-teal-50' },
  [UserRole.GUEST]: { label: '游客体验', desc: '受限访问 / 功能预览', icon: User, color: 'text-gray-600', bg: 'bg-gray-50' },
};

// Utility to generate random short codes (e.g., K9X-2M4)
const generateOrgCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; 
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 2) result += '-';
  }
  return result;
};

export const SecurityGate: React.FC<SecurityGateProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'create'>('login');
  
  // Login States
  const [orgCode, setOrgCode] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Create Form
  const [createPhone, setCreatePhone] = useState('');
  const [createPassword, setCreatePassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // --- Handlers ---

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgCode || !phone || !password) return;
    
    if (!/^\d{11}$/.test(phone)) {
        alert("请输入正确的11位手机号码");
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        // Direct Login -> No Role Selection, Default to SUPER_ADMIN for demo simplicity
        onLogin(UserRole.SUPER_ADMIN, orgCode, { phone: phone, orgCode });
    }, 800);
  };

  const handleGuestEntry = () => {
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          // Zero-friction guest entry
          onLogin(UserRole.GUEST, 'DEMO-GUEST-001', { });
      }, 600);
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPhone || !createPassword) return;

    if (!/^\d{11}$/.test(createPhone)) {
        alert("请输入正确的11位手机号码作为管理员账号");
        return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
        setIsLoading(false);
        const newCode = generateOrgCode();
        // Immediately login as Super Admin, pass isNew: true
        onLogin(UserRole.SUPER_ADMIN, newCode, { phone: createPhone, orgCode: newCode, isNew: true });
    }, 1000);
  };

  const isLoginValid = orgCode && /^\d{11}$/.test(phone) && password;
  const isCreateValid = /^\d{11}$/.test(createPhone) && createPassword;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans text-gray-800 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Brand Header */}
      <div className="mb-8 text-center z-10 animate-in fade-in slide-in-from-top-4 duration-700">
         <div className="inline-flex items-center justify-center w-14 h-14 bg-google-blue text-white rounded-2xl shadow-lg mb-5 animate-engine-pulse">
             <Cpu size={28} />
         </div>
       <h2 className="text-xs font-medium tracking-widest text-gray-500 mb-1 uppercase">
  清雁数智
</h2>

</h1>
         <h1 className="text-3xl font-black tracking-tighter text-gray-900 mb-2">
            数据资产价值评估引擎 <span className="text-google-blue text-lg font-mono font-medium">V1.0</span>
         </h1>
         <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            科学精准  标准权威  结果可信
         </p>
      </div>

      <div className="bg-white w-full max-w-sm z-10">
        
        <div className="animate-in zoom-in-95 duration-300">
            {/* Main Tabs */}
            <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-6 shadow-inner">
                <button 
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                        activeTab === 'login' ? 'bg-white text-google-text shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    登录
                </button>
                <button 
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                        activeTab === 'create' ? 'bg-white text-google-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    创建
                </button>
            </div>

            {/* LOGIN TAB CONTENT */}
            {activeTab === 'login' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <form onSubmit={handleMemberLogin} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Globe2 size={16} className="text-gray-400 group-focus-within:text-google-blue transition"/>
                            </div>
                            <input 
                                type="text" 
                                value={orgCode}
                                onChange={e => setOrgCode(e.target.value.toUpperCase())}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-google-blue rounded-xl outline-none font-mono text-sm transition placeholder-gray-400 uppercase tracking-wider"
                                placeholder="机构代码 (如: K9X-2M4)"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Smartphone size={16} className="text-gray-400 group-focus-within:text-google-blue transition"/>
                            </div>
                            <input 
                                type="tel" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-google-blue rounded-xl outline-none text-sm transition placeholder-gray-400"
                                placeholder="手机号码"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={16} className="text-gray-400 group-focus-within:text-google-blue transition"/>
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-google-blue rounded-xl outline-none text-sm transition placeholder-gray-400"
                                placeholder="登录密码"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!isLoginValid || isLoading}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                                isLoginValid 
                                ? 'bg-gray-900 text-white hover:bg-black active:scale-95' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <>立即启动引擎 <ArrowRight size={16}/></>}
                        </button>
                    </form>

                    {/* Guest Entry Point - Integrated cleanly */}
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-300 text-xs">或</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <button 
                        onClick={handleGuestEntry}
                        className="w-full py-3 rounded-xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm border border-gray-100"
                    >
                        <Sparkles size={16} className="text-purple-500"/> 游客直接体验
                    </button>
                </div>
            )}

            {/* CREATE TAB CONTENT */}
            {activeTab === 'create' && (
                <form onSubmit={handleCreateOrg} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start mb-2">
                            <div className="bg-white p-1.5 rounded-full shadow-sm">
                            <PlusCircle size={16} className="text-google-blue"/>
                            </div>
                            <p className="text-xs text-blue-800 leading-relaxed mt-0.5">
                                <span className="font-bold">一键开通专属空间</span>
                                <br/>系统将为您自动生成唯一的机构代码。
                            </p>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Smartphone size={16} className="text-gray-400 group-focus-within:text-google-blue transition"/>
                        </div>
                        <input 
                            type="tel" 
                            value={createPhone}
                            onChange={e => setCreatePhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-google-blue rounded-xl outline-none text-sm transition placeholder-gray-400"
                            placeholder="管理员手机号"
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={16} className="text-gray-400 group-focus-within:text-google-blue transition"/>
                        </div>
                        <input 
                            type="password" 
                            value={createPassword}
                            onChange={e => setCreatePassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-google-blue rounded-xl outline-none text-sm transition placeholder-gray-400"
                            placeholder="设置管理密码"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!isCreateValid || isLoading}
                        className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                            isCreateValid 
                            ? 'bg-google-blue text-white hover:bg-blue-600 active:scale-95' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : '立即创建机构'}
                    </button>
                </form>
            )}
            </div>

      </div>
      
      {/* Footer Info */}
      <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-300 font-mono">
              ENGINE_VER: 1.0.4 &bull; SECURE_CONN: TLS 1.3
          </p>
      </div>
    </div>
  );
};
