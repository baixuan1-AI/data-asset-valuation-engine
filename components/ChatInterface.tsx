import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, X, Sparkles, Lock, Eye, CheckCircle, ShieldAlert, Target, Database, Map, ArrowLeft, Users, Home, ClipboardCopy, Key, Copy, Check, CheckCircle2 } from 'lucide-react';
import { Message, DataAsset, UserRole } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import RadarAnalysis from './RadarAnalysis';
import { ROLE_META } from './SecurityGate';

interface ChatInterfaceProps {
  asset: DataAsset;
  currentUserRole: UserRole;
  onUpdateAsset: (updatedAsset: DataAsset) => void;
  onConsumeCredits: (amount: number) => void;
  onFinish: () => void;
  onBack?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ asset, currentUserRole, onUpdateAsset, onConsumeCredits, onFinish, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<{file: File, preview: string} | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  // Admin Onboarding State
  const [showAdminOnboarding, setShowAdminOnboarding] = useState(false);
  const [showInviteDetails, setShowInviteDetails] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Logic Fix: Only dismiss onboarding if USER has interacted. 
    // Ignore model messages (like the auto-greeting).
    const hasUserInteraction = asset.messages.some(m => m.role === 'user');
    
    if (currentUserRole === UserRole.SUPER_ADMIN && !hasUserInteraction) {
        setShowAdminOnboarding(true);
    } else {
        setShowAdminOnboarding(false);
    }
  }, [asset.messages, suggestions, attachment, currentUserRole]);

  // LOGIC FIX: Proactive AI Greeting with Professional Tone
  useEffect(() => {
      // Only if no messages exist yet
      if (asset.messages.length === 0) {
          let greeting = "您好！我是 DataPricing Ai 首席数据资产评估官。";
          if (asset.projectInfo) {
              greeting += `\n\n我们将基于【科学精准、标准权威、结果可信】的原则，对您的【${asset.name}】进行全维度价值测算。\n\n已读取立项信息：\n• 评估范围：${asset.projectInfo.scope}\n• 评估目的：${asset.projectInfo.purpose}\n\n请问我们先从数据合规性审查开始，还是先分析数据质量？`;
          } else {
              greeting += "\n\n请先告诉我您想评估的数据资产名称，或者请管理员先在控制台完善立项信息，以便我为您提供更精准的估值服务。";
          }

          const greetingMsg: Message = {
              id: "system-greeting-" + Date.now(),
              role: 'model',
              text: greeting
          };
          
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
              onUpdateAsset({ ...asset, messages: [greetingMsg] });
          }, 500);
      }
  }, []);

  // Visibility Filter
  const visibleMessages = asset.messages.filter(m => {
      if (currentUserRole === UserRole.SUPER_ADMIN) return true;
      if (m.role === 'model' || m.role === 'system') return true;
      if (m.senderRole === currentUserRole) return true;
      return false; 
  });

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() && !attachment) return;

    // Dismiss onboarding if interacting
    setShowAdminOnboarding(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      senderRole: currentUserRole,
      attachments: attachment ? [{ type: 'image', url: attachment.preview }] : undefined
    };

    const updatedMessages = [...asset.messages, userMsg];
    
    onUpdateAsset({ ...asset, messages: updatedMessages });
    setInputText('');
    setAttachment(null);
    setSuggestions([]);
    setIsLoading(true);
    onConsumeCredits(10); 

    let imageBase64: string | undefined = undefined;
    if (attachment && attachment.preview.startsWith('data:image')) {
        imageBase64 = attachment.preview.split(',')[1];
    }

    const result = await sendMessageToGemini(updatedMessages, asset, userMsg.text, currentUserRole, imageBase64);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: result.reply
    };

    const updatedClues = [...asset.clues, ...result.newClues];
    
    onUpdateAsset({
      ...asset,
      messages: [...updatedMessages, botMsg],
      dimensions: result.dimensions,
      clues: updatedClues,
      industry: result.industry,
      scenario: result.scenario
    });
    
    setSuggestions(result.suggestedActions);
    setIsLoading(false);
  };

  const handleStartInterview = () => {
      handleSend("请开始本次资产评估，针对当前立项信息进行提问。");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if(e.target.files && e.target.files.length > 0) {
         const file = e.target.files[0];
         const reader = new FileReader();
         reader.onload = (ev) => {
             setAttachment({
                 file: file,
                 preview: ev.target?.result as string
             });
         };
         reader.readAsDataURL(file);
         setShowAttachMenu(false);
     }
  };

  const handleCopyInvite = (member: any, script: string) => {
      navigator.clipboard.writeText(script);
      setCopiedId(member.id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Sidebar Logic: Progress Bars & Privacy ---
  const ROLE_LIST = [UserRole.DECISION, UserRole.BUSINESS, UserRole.TECH, UserRole.LEGAL, UserRole.FINANCE];
  const TARGET_CLUES_PER_ROLE = 3; // Mock target for progress bar

  const CurrentRoleIcon = ROLE_META[currentUserRole].icon;

  return (
    <div className="flex flex-col h-full bg-google-gray relative">
      
      {/* Top Bar - Persistent Project Overview */}
      <div className="bg-white px-4 py-2 border-b border-gray-200 flex justify-between items-center sticky top-0 z-30 shadow-sm h-16">
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
           {onBack && (
               <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500">
                   <ArrowLeft size={20} />
               </button>
           )}
           {/* Current Identity Badge */}
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border flex-shrink-0 ${ROLE_META[currentUserRole].bg} bg-opacity-10 ${ROLE_META[currentUserRole].color} border-current`}>
               <CurrentRoleIcon size={16} />
               <span className="text-sm font-bold hidden md:inline">{ROLE_META[currentUserRole].label}</span>
               {currentUserRole === UserRole.SUPER_ADMIN && <ShieldAlert size={14} className="animate-pulse"/>}
           </div>

           {/* Project Initiation Summary (Visible to ALL) */}
           <div className="flex flex-col border-l pl-4 border-gray-200 overflow-hidden">
               <h2 className="font-bold text-gray-900 text-sm truncate flex items-center gap-2">
                   {asset.name}
                   {!asset.projectInfo && <span className="text-[10px] text-gray-400 font-normal">(未立项)</span>}
               </h2>
               
               {asset.projectInfo ? (
                   <div className="flex items-center gap-3 text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                       <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 rounded-sm" title="评估目的">
                           <Target size={10}/> {asset.projectInfo.purpose}
                       </span>
                       <span className="hidden md:flex items-center gap-1" title="评估范围">
                           <Map size={10}/> {asset.projectInfo.scope}
                       </span>
                   </div>
               ) : (
                   <div className="text-[10px] text-gray-400">等待管理员完善立项信息...</div>
               )}
           </div>
        </div>
        
        <div className="flex items-center gap-2 pl-2">
            <button 
                onClick={onFinish} 
                className={`text-xs text-white font-medium px-4 py-2 rounded-lg shadow-md transition flex items-center gap-1 whitespace-nowrap ${
                    currentUserRole === UserRole.SUPER_ADMIN ? 'bg-google-blue hover:bg-blue-600' : 'bg-green-600 hover:bg-green-700'
                }`}
            >
                <CheckCircle size={14} /> 
                {currentUserRole === UserRole.SUPER_ADMIN ? "生成综合评估报告" : "完成本次协同"}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar pb-32 md:pb-4 bg-gray-50/50 relative">
          
          {/* Admin Onboarding / Zero State */}
          {showAdminOnboarding && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-gray-50/90 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center animate-in zoom-in duration-300 border border-gray-100">
                      
                      {showInviteDetails ? (
                          <div className="animate-in slide-in-from-right duration-300">
                              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                                  <Users size={20} className="text-google-blue"/> 团队协作邀请
                              </h3>
                              <p className="text-xs text-gray-400 mb-4">请将以下信息复制并发给对应成员</p>
                              
                              <div className="space-y-3 text-left max-h-[300px] overflow-y-auto custom-scrollbar mb-4">
                                  {asset.teamMembers && asset.teamMembers.length > 0 ? (
                                      asset.teamMembers.map(m => {
                                          const script = `【DataPricing Ai 邀请】\n您好，管理员已为您开通协作账号。\n登录地址：${window.location.origin}\n机构代码：${asset.companyId}\n登录手机：${m.phone}\n初始密码：123456\n请尽快登录完成[${m.roles.map(r => ROLE_META[r].label).join('/')}]维度的数据评估。`;
                                          return (
                                              <div key={m.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                  <div className="flex justify-between items-center mb-2">
                                                      <span className="font-bold text-sm text-gray-800">{m.phone}</span>
                                                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                          {m.roles.map(r => ROLE_META[r].label).join(', ')}
                                                      </span>
                                                  </div>
                                                  <div className="bg-white p-2 rounded border border-gray-100 text-[10px] text-gray-500 font-mono mb-2 whitespace-pre-wrap">
                                                      {script}
                                                  </div>
                                                  <button 
                                                    onClick={() => handleCopyInvite(m, script)}
                                                    className={`w-full py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
                                                        copiedId === m.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                    }`}
                                                  >
                                                      {copiedId === m.id ? <><Check size={12}/> 已复制</> : <><Copy size={12}/> 复制邀请函</>}
                                                  </button>
                                              </div>
                                          )
                                      })
                                  ) : (
                                      <div className="text-center py-8 text-gray-400 text-sm">暂无成员，请先在立项阶段添加成员。</div>
                                  )}
                              </div>

                              <button 
                                onClick={() => setShowInviteDetails(false)}
                                className="w-full py-2.5 bg-google-blue text-white rounded-lg font-bold hover:bg-blue-600 transition"
                              >
                                  关闭并返回
                              </button>
                          </div>
                      ) : (
                          <>
                            <div className="w-16 h-16 bg-blue-50 text-google-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">立项成功！</h3>
                            <p className="text-sm text-gray-500 mb-8 px-2">
                                您已成功创建资产档案。接下来，您可以选择直接开始AI评估，或分发账号邀请团队成员加入协作。
                            </p>
                            
                            <div className="space-y-3">
                                {/* Primary Action: Invite or Go Back to Add */}
                                {asset.teamMembers && asset.teamMembers.length > 0 ? (
                                    <button 
                                        onClick={() => setShowInviteDetails(true)}
                                        className="w-full py-3 bg-google-blue hover:bg-blue-600 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2"
                                    >
                                        <Users size={18} /> 邀请协作成员
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => onBack && onBack()}
                                        className="w-full py-3 bg-google-blue hover:bg-blue-600 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2"
                                    >
                                        <Users size={18} /> 返回台账添加成员
                                    </button>
                                )}

                                {/* Secondary Action: Start */}
                                <button 
                                    onClick={handleStartInterview}
                                    className="w-full py-3 bg-white border border-google-blue text-google-blue hover:bg-blue-50 rounded-xl font-bold transition flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={18} /> 立即开始评估
                                </button>
                                
                                {/* Text Action: Back */}
                                <button 
                                    onClick={onBack}
                                    className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
                                >
                                    返回资产台账
                                </button>
                            </div>
                          </>
                      )}
                  </div>
              </div>
          )}

          {/* Regular Message Rendering */}
          {visibleMessages.map((msg) => (
            <div key={msg.id} className={`flex w-full mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                 {msg.role === 'user' && (
                     <span className="text-[10px] text-gray-400 mb-1 mr-2 flex items-center gap-1">
                         {msg.senderRole ? ROLE_META[msg.senderRole].label : 'Me'}
                     </span>
                 )}
                 {msg.attachments && msg.attachments.length > 0 && (
                     <div className="mb-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-[200px]">
                         <img src={msg.attachments[0].url} alt="Attachment" className="w-full h-auto" />
                     </div>
                 )}
                 <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                    ? `text-white rounded-br-none ${ROLE_META[msg.senderRole || UserRole.TECH].bg.replace('50', '600').replace('bg-', 'bg-')}`
                    : 'bg-white text-google-text rounded-bl-none border border-gray-100'
                 } ${
                    msg.role === 'user' ? 
                       (msg.senderRole === UserRole.SUPER_ADMIN ? 'bg-yellow-600' :
                        msg.senderRole === UserRole.DECISION ? 'bg-purple-600' :
                        msg.senderRole === UserRole.BUSINESS ? 'bg-orange-600' :
                        msg.senderRole === UserRole.TECH ? 'bg-blue-600' :
                        msg.senderRole === UserRole.LEGAL ? 'bg-red-600' :
                        msg.senderRole === UserRole.FINANCE ? 'bg-teal-600' : 'bg-blue-600')
                    : ''
                 }`}>
                    {msg.text}
                 </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
               <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-2 shadow-sm">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sidebar: Collaborative Board & Progress */}
        <div className="hidden md:block w-80 bg-white border-l border-gray-200 flex flex-col z-20 shadow-[-5px_0_15px_rgba(0,0,0,0.02)]">
            {/* Top: Radar */}
            <div className="p-4 border-b border-gray-100 h-64 shrink-0">
                <h3 className="font-bold text-gray-700 mb-2 flex items-center text-xs uppercase tracking-wider">
                    <Sparkles size={14} className="text-google-yellow mr-2"/> 资产全息图
                </h3>
                {/* Updated container to fill remaining height minus title */}
                <div className="h-[calc(100%-24px)]">
                    <RadarAnalysis data={asset.dimensions} />
                </div>
            </div>
            
            {/* Bottom: Role Progress List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center justify-between sticky top-0 bg-gray-50/50 z-10 py-2">
                    <span>全域协同进度 (Global Progress)</span>
                </h4>
                
                <div className="space-y-6">
                    {ROLE_LIST.map((role) => {
                        const clues = asset.clues.filter(c => c.creatorRole === role);
                        const progressPercent = Math.min((clues.length / TARGET_CLUES_PER_ROLE) * 100, 100);
                        const meta = ROLE_META[role];
                        const RoleIcon = meta.icon;
                        
                        const canSeeContent = currentUserRole === UserRole.SUPER_ADMIN || currentUserRole === role;

                        return (
                            <div key={role} className="relative">
                                {/* Role Header & Progress Bar */}
                                <div className="mb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <RoleIcon size={14} className={meta.color}/>
                                            <span className="text-xs font-bold text-gray-700">{meta.label}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${meta.bg.replace('bg-', 'bg-').replace('50', '500')}`}
                                            style={{width: `${progressPercent}%`}}
                                        ></div>
                                    </div>
                                </div>

                                {/* Clues List */}
                                <div className="pl-6 space-y-2 mt-2">
                                    {clues.length === 0 && (
                                        <div className="text-[10px] text-gray-300 italic">待录入数据...</div>
                                    )}
                                    {clues.map((clue) => (
                                        <div key={clue.id} className="bg-white p-2 rounded border border-gray-100 shadow-sm text-xs relative overflow-hidden group">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-gray-500 font-medium">{clue.category}</span>
                                                {canSeeContent ? <Eye size={10} className="text-gray-300"/> : <Lock size={10} className="text-orange-300"/>}
                                            </div>
                                            
                                            {canSeeContent ? (
                                                <div className="text-gray-800 font-mono font-medium break-all animate-in fade-in">
                                                    {clue.content}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 select-none">
                                                    <div className="bg-gray-100 text-transparent rounded w-full h-4 relative overflow-hidden">
                                                        <span className="sr-only">Hidden</span>
                                                        <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center">
                                                            <span className="text-[10px] text-gray-400 font-mono">*** 权限不足 ***</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
         
         {suggestions.length > 0 && !isLoading && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3 pb-0 no-scrollbar items-center">
                <span className="text-xs font-bold text-gray-400 whitespace-nowrap mr-1 flex-shrink-0">建议:</span>
                {suggestions.map((s, i) => (
                <button 
                    key={i} 
                    onClick={() => handleSend(s)} 
                    className={`whitespace-nowrap bg-white border px-4 py-1.5 rounded-full text-sm font-medium transition shadow-sm hover:bg-gray-50`}
                >
                    {s}
                </button>
                ))}
            </div>
         )}

         {attachment && (
             <div className="px-4 pt-3">
                 <div className="relative inline-block">
                     <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                         <img src={attachment.preview} className="w-full h-full object-cover" />
                     </div>
                     <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 shadow-md"><X size={14} /></button>
                 </div>
             </div>
         )}

         <div className="flex items-end gap-2 p-4 max-w-4xl mx-auto">
            <div className="relative">
                <button 
                    className={`p-2.5 rounded-full transition ${showAttachMenu ? 'bg-gray-200 rotate-45' : 'text-gray-500 hover:bg-gray-100'}`} 
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                >
                    <Plus size={24} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect}/>
            </div>
            
            <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-4 py-3 focus-within:ring-2 focus-within:ring-google-blue/30 focus-within:bg-white transition border border-transparent">
                {/* IMPROVED TEXTAREA STYLING */}
                <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`[${ROLE_META[currentUserRole].label}] 请输入...`}
                    className="bg-transparent w-full outline-none text-google-text text-base resize-none max-h-32 leading-relaxed placeholder-gray-400 font-sans"
                    style={{minHeight: '24px'}}
                    rows={1}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
            </div>

            <button 
                onClick={() => handleSend()}
                className={`p-3 text-white rounded-full shadow-lg transition transform active:scale-95 flex-shrink-0 ${
                    inputText.trim() || attachment ? 'bg-google-blue' : 'bg-gray-300'
                }`}
            >
                <Send size={22} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default ChatInterface;