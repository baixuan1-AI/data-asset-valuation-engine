
export enum ScreenState {
  SECURITY_GATE = 'SECURITY_GATE',
  DASHBOARD = 'DASHBOARD',
  ASSESSMENT_CHAT = 'ASSESSMENT_CHAT',
  REPORT_PREVIEW = 'REPORT_PREVIEW',
  MARKETPLACE = 'MARKETPLACE'
}

export enum AssetType {
  DATA_PRODUCT = '数据产品 (Data Product)',
  DATASET = '数据集 (Dataset)',
  DATA_CLUSTER = '数据集群 (Data Cluster)'
}

export enum DataCategory {
  GOVERNMENT = '政务数据 (Government)',
  INDUSTRIAL = '产业数据 (Industrial)',
  RESEARCH = '科研数据 (Research)',
  PERSONAL = '个人数据 (Personal)',
  OTHER = '其他数据 (Other)'
}

export enum AssessmentStatus {
  NEW = '新建评估',
  IN_PROGRESS = '协同评估中', 
  ANALYZING = '模型计算中',
  VALUATION_COMPLETE = '评估完成',
  CERTIFIED = '已认证 (具法律效力)',
  LISTED = '已挂牌'
}

export enum ScenarioType {
  UNKNOWN = '场景识别中...',
  FINANCIAL_REPORTING = '入表 & 财务报告 (Cost-based)',
  TRADING_CIRCULATION = '交易 & 流通 (Market-based)',
  FINANCING_LOAN = '融资 & 抵押 (Income-based)',
  INTERNAL_STRATEGY = '内部管理 & 决策 (Strategic)',
  COMPLIANCE_LEGAL = '合规 & 法律 (Risk-based)'
}

export enum ValuationObjective {
  FINANCIAL_ENTRY = '财务报告/资产入表/公共数据成本调查',
  TRADING_FINANCING = '交易定价/融资抵押 (以市场法为主)',
  INTERNAL_DECISION = '内部管理/投资决策 (以收益法为主)'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // 管理员
  DECISION = 'DECISION',       // 管理/战略
  BUSINESS = 'BUSINESS',       // 业务/运营
  TECH = 'TECH',               // 技术/运维
  LEGAL = 'LEGAL',             // 法务/律师
  FINANCE = 'FINANCE',         // 采购/财务
  GUEST = 'GUEST'              // 游客
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  senderRole?: UserRole; 
  isThinking?: boolean;
  attachments?: { type: 'image' | 'file'; url: string }[];
}

export interface AssessmentDimensions {
  compliance: number;
  quality: number;
  cost: number;
  value: number;
  market: number;
}

export interface ExtractedClue {
  id: string;
  category: string; 
  content: string;
  confidence: 'high' | 'medium' | 'low';
  creatorRole: UserRole; 
  visibility: 'public' | 'private'; 
}

export interface ValueHistoryPoint {
  date: string;
  value: number;
}

export interface ValuationModel {
  id: string;
  name: string;
  provider: string;
  providerIcon?: string;
  description: string;
  tags: string[];
  baseMultiplier: number;
  riskSensitivity: 'Conservative' | 'Moderate' | 'Aggressive';
  cost: number;
  recommendedFor: ValuationObjective[]; 
  isOfficial?: boolean; 
}

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  roles: UserRole[]; 
  isInitialPassword: boolean; 
  isDisabled?: boolean; 
}

export interface ProjectInfo {
  scope: string; 
  purpose: string; 
  deadline: string; 
  background?: string; 
  methodology?: string; 
  unitName?: string; 
  dataCategory?: DataCategory; 
}

export interface DataAsset {
  id: string;
  name: string;
  type: AssetType;
  industry?: string;
  scenario: ScenarioType; 
  status: AssessmentStatus;
  lastUpdated: Date;
  estimatedValue?: {
    min: number;
    max: number;
    currency: string;
  };
  dimensions: AssessmentDimensions;
  clues: ExtractedClue[];
  messages: Message[];
  selectedModelId?: string;
  valueHistory?: ValueHistoryPoint[];
  companyId: string;
  projectInfo?: ProjectInfo;
  teamMembers?: TeamMember[];
  isDisabled?: boolean; 
  isDeleted?: boolean; 
  hasPaidValuation?: boolean; // New flag to track payment status
}

export interface MarketPulse {
  id: string;
  text: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface TransactionRecord {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    date: string;
}

// Service Provider Interfaces
export type ProviderType = 'consulting' | 'legal' | 'accounting' | 'quality' | 'valuation' | 'trading';

export interface ServiceProvider {
    id: string;
    name: string;
    title: string; // e.g. "资深合伙人"
    org: string;
    type: ProviderType;
    yearsExperience: number;
    region: string;
    price: string;
    rating: number;
    tags: string[];
    // Detail fields
    certifications: string[];
    clients: string[]; // e.g. "工商银行", "腾讯"
    expertise: string; // Long description
    avatarSeed: string;
}
