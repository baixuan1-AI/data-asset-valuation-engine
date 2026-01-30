import React, { useEffect, useState } from 'react';
import { DataAsset, AssessmentStatus, ServiceProvider, ProviderType, UserRole } from '../types';
import { Share2, ShieldCheck, TrendingUp, Download, ArrowLeft, BookOpen, BadgeCheck, CheckCircle2, User, Phone, MessageCircle, Briefcase, Zap, MapPin, Award, Star, Search, Filter, X, RefreshCw, FileSignature } from 'lucide-react';
import { generateValuationReport } from '../services/geminiService';
import RadarAnalysis from './RadarAnalysis';
import { AVAILABLE_MODELS } from './ModelMarketplace';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportPreviewProps {
  asset: DataAsset;
  onBack: () => void;
  onMarketplace: () => void;
  prefilledProfile?: {
      phone?: string;
  };
}

// Realistic Chinese Provider Data (8 per category)
const MOCK_PROVIDERS: ServiceProvider[] = [
    // 1. Consulting (咨询)
    { id: 'c1', name: '李建国', title: '首席顾问', org: '赛迪顾问 (CCID)', type: 'consulting', yearsExperience: 18, region: '北京', price: '¥25,000/项目', rating: 4.9, tags: ['数字经济', '十四五规划'], certifications: ['高级咨询师'], clients: ['北京市大数据局', '中国电子'], expertise: '参与多项国家级数字经济产业规划编制，擅长政府公共数据授权运营方案设计。', avatarSeed: 'Li' },
    { id: 'c2', name: '陈晓红', title: '合伙人', org: '汉得信息', type: 'consulting', yearsExperience: 15, region: '上海', price: '¥20,000/项目', rating: 4.8, tags: ['企业数字化', 'ERP数据'], certifications: ['MBA'], clients: ['上汽集团', '光明乳业'], expertise: '专注于大型制造企业数据资产盘点与商业化场景挖掘，拥有丰富的ERP数据价值变现经验。', avatarSeed: 'Chen' },
    { id: 'c3', name: '王志刚', title: '总监', org: '艾瑞咨询', type: 'consulting', yearsExperience: 12, region: '深圳', price: '¥18,000/项目', rating: 4.7, tags: ['互联网数据', '流量变现'], certifications: ['CFA'], clients: ['腾讯', '美团'], expertise: '深耕互联网行业数据商业模式研究，擅长流量数据的定价与交易策略制定。', avatarSeed: 'Wang' },
    { id: 'c4', name: '赵雅芝', title: '高级经理', org: '德勤管理咨询', type: 'consulting', yearsExperience: 10, region: '广州', price: '¥30,000/项目', rating: 4.9, tags: ['数据战略', '跨国合规'], certifications: ['PMP'], clients: ['广汽集团', '南航'], expertise: '为大型国企提供数据资产管理体系建设咨询，熟悉国际数据跨境流动规则。', avatarSeed: 'Zhao' },
    { id: 'c5', name: '孙伟', title: '资深专家', org: '信通院 (CAICT)', type: 'consulting', yearsExperience: 14, region: '北京', price: '¥22,000/项目', rating: 5.0, tags: ['政策解读', '标准制定'], certifications: ['博士'], clients: ['工信部', '移动'], expertise: '参与数据要素市场化配置相关政策起草，对数据资产入表政策有深度独到见解。', avatarSeed: 'Sun' },
    { id: 'c6', name: '周杰', title: '副总裁', org: '易观分析', type: 'consulting', yearsExperience: 16, region: '北京', price: '¥20,000/项目', rating: 4.6, tags: ['用户画像', '精准营销'], certifications: ['MBA'], clients: ['京东', '字节'], expertise: '擅长C端用户行为数据的价值评估与营销应用场景设计。', avatarSeed: 'Zhou' },
    { id: 'c7', name: '吴敏', title: '合伙人', org: '北大纵横', type: 'consulting', yearsExperience: 20, region: '成都', price: '¥15,000/项目', rating: 4.5, tags: ['国资改革', '数据资产化'], certifications: ['CMC'], clients: ['成都交投', '兴城集团'], expertise: '专注地方平台公司数据资产化转型，助力城投企业盘活数据资产。', avatarSeed: 'Wu' },
    { id: 'c8', name: '郑强', title: '创始人', org: '某数据科技', type: 'consulting', yearsExperience: 8, region: '杭州', price: '¥12,000/项目', rating: 4.8, tags: ['电商数据', 'SaaS'], certifications: ['阿里云MVP'], clients: ['淘天集团', '有赞'], expertise: '电商生态数据价值挖掘专家，擅长店铺与商品数据的资产化包装。', avatarSeed: 'Zheng' },

    // 2. Legal (法律)
    { id: 'l1', name: '张伟律师', title: '高级合伙人', org: '金杜律师事务所', type: 'legal', yearsExperience: 15, region: '北京', price: '¥30,000/项目', rating: 5.0, tags: ['数据出境', 'GDPR', '合规审计'], certifications: ['执业律师', 'CIPP/E'], clients: ['字节跳动', '中石油'], expertise: '国内顶尖数据合规专家，主导过多起大型企业数据出境安全评估案件。', avatarSeed: 'ZhangLaw' },
    { id: 'l2', name: '刘洋律师', title: '合伙人', org: '中伦律师事务所', type: 'legal', yearsExperience: 12, region: '上海', price: '¥25,000/项目', rating: 4.9, tags: ['数据确权', '知识产权'], certifications: ['执业律师'], clients: ['拼多多', '小红书'], expertise: '擅长处理复杂的数据权属纠纷，精通互联网平台数据确权法律实务。', avatarSeed: 'LiuLaw' },
    { id: 'l3', name: '陈静律师', title: '资深律师', org: '君合律师事务所', type: 'legal', yearsExperience: 10, region: '深圳', price: '¥20,000/项目', rating: 4.8, tags: ['个人隐私', 'PIPL'], certifications: ['执业律师', 'CIPP/A'], clients: ['大疆', '招行'], expertise: '专注于个人信息保护法(PIPL)合规落地，为金融科技企业提供全流程合规服务。', avatarSeed: 'ChenLaw' },
    { id: 'l4', name: '杨波律师', title: '合伙人', org: '大成律师事务所', type: 'legal', yearsExperience: 14, region: '成都', price: '¥18,000/项目', rating: 4.7, tags: ['数据交易', '合同法'], certifications: ['执业律师'], clients: ['四川发展', '成都银行'], expertise: '擅长起草和审核数据交易合同，规避数据流通环节的法律风险。', avatarSeed: 'YangLaw' },
    { id: 'l5', name: '黄勇律师', title: '顾问', org: '方达律师事务所', type: 'legal', yearsExperience: 8, region: '上海', price: '¥28,000/项目', rating: 4.9, tags: ['投融资', '尽职调查'], certifications: ['执业律师', 'CFA'], clients: ['红杉中国', '高瓴'], expertise: '专注于TMT行业投资并购中的数据资产法律尽职调查。', avatarSeed: 'HuangLaw' },
    { id: 'l6', name: '赵磊律师', title: '律师', org: '锦天城律师事务所', type: 'legal', yearsExperience: 6, region: '杭州', price: '¥15,000/项目', rating: 4.6, tags: ['网络安全', '数据合规'], certifications: ['执业律师'], clients: ['吉利汽车', '海康威视'], expertise: '协助企业建立数据安全合规体系，应对监管检查。', avatarSeed: 'ZhaoLaw' },
    { id: 'l7', name: '周婷律师', title: '合伙人', org: '竞天公诚', type: 'legal', yearsExperience: 11, region: '北京', price: '¥22,000/项目', rating: 4.8, tags: ['反垄断', '数据竞争'], certifications: ['执业律师'], clients: ['百度', '美团'], expertise: '处理平台经济反垄断与数据不正当竞争法律事务。', avatarSeed: 'ZhouLaw' },
    { id: 'l8', name: '吴刚律师', title: '资深律师', org: '环球律师事务所', type: 'legal', yearsExperience: 9, region: '广州', price: '¥18,000/项目', rating: 4.7, tags: ['医疗数据', '合规'], certifications: ['执业律师'], clients: ['广药集团', '金域医学'], expertise: '深耕医疗健康行业，精通医疗数据脱敏与合规使用法律规范。', avatarSeed: 'WuLaw' },

    // 3. Accounting (会计/入表)
    { id: 'a1', name: '王芳', title: '高级审计师', org: '普华永道 (PwC)', type: 'accounting', yearsExperience: 15, region: '上海', price: '¥35,000/项目', rating: 5.0, tags: ['入表审计', '国际准则'], certifications: ['CPA', 'ACCA'], clients: ['上汽', '宝钢'], expertise: '四大背景，精通《暂行规定》，擅长大型集团数据资产入表审计。', avatarSeed: 'WangAcc' },
    { id: 'a2', name: '刘洋', title: '合伙人', org: '信永中和', type: 'accounting', yearsExperience: 18, region: '北京', price: '¥25,000/项目', rating: 4.8, tags: ['成本核算', '税务筹划'], certifications: ['CPA', 'CTA'], clients: ['国家电网', '中石油'], expertise: '擅长数据资产成本归集与税务优化，解决入表实操难题。', avatarSeed: 'LiuAcc' },
    { id: 'a3', name: '张强', title: '副主任会计师', org: '立信会计师事务所', type: 'accounting', yearsExperience: 20, region: '深圳', price: '¥22,000/项目', rating: 4.9, tags: ['IPO审计', '科创板'], certifications: ['CPA'], clients: ['迈瑞医疗', '深信服'], expertise: '辅导多家科创板企业进行数据资产披露与上市审计。', avatarSeed: 'ZhangAcc' },
    { id: 'a4', name: '李娜', title: '经理', org: '德勤华永', type: 'accounting', yearsExperience: 8, region: '杭州', price: '¥28,000/项目', rating: 4.7, tags: ['内部控制', '风险管理'], certifications: ['CPA', 'CIA'], clients: ['阿里巴巴', '网易'], expertise: '协助企业建立数据资产内部控制体系，确保财务数据准确性。', avatarSeed: 'LiAcc' },
    { id: 'a5', name: '赵云', title: '高级经理', org: '天健会计师事务所', type: 'accounting', yearsExperience: 12, region: '杭州', price: '¥20,000/项目', rating: 4.8, tags: ['研发支出', '资本化'], certifications: ['CPA'], clients: ['海康威视', '大华'], expertise: '精通研发支出资本化处理，合规提升数据资产账面价值。', avatarSeed: 'ZhaoAcc' },
    { id: 'a6', name: '孙梅', title: '合伙人', org: '大华会计师事务所', type: 'accounting', yearsExperience: 16, region: '北京', price: '¥18,000/项目', rating: 4.6, tags: ['国企入表', '专项审计'], certifications: ['CPA'], clients: ['首钢', '北控'], expertise: '专注于国有企业数据资产专项审计与入表咨询。', avatarSeed: 'SunAcc' },
    { id: 'a7', name: '周明', title: '总监', org: '致同', type: 'accounting', yearsExperience: 14, region: '广州', price: '¥24,000/项目', rating: 4.7, tags: ['估值复核', '财务顾问'], certifications: ['CPA', 'CPV'], clients: ['越秀集团', '广汽'], expertise: '提供财务视角的估值复核服务，确保入表金额公允。', avatarSeed: 'ZhouAcc' },
    { id: 'a8', name: '吴杰', title: '经理', org: '容诚', type: 'accounting', yearsExperience: 9, region: '苏州', price: '¥15,000/项目', rating: 4.5, tags: ['高新企业', '加计扣除'], certifications: ['CPA'], clients: ['苏州工业园企业'], expertise: '擅长高新技术企业数据研发费用的加计扣除与入表结合。', avatarSeed: 'WuAcc' },

    // 4. Quality (质量)
    { id: 'q1', name: '陈刚', title: '首席架构师', org: '中国信通院 (CAICT)', type: 'quality', yearsExperience: 15, region: '北京', price: '¥30,000/项目', rating: 5.0, tags: ['DCMM', '数据治理'], certifications: ['CDGA', 'DAMA'], clients: ['工信部', '联通'], expertise: 'DCMM 国家标准核心起草人之一，提供权威的数据管理能力成熟度评估。', avatarSeed: 'ChenQual' },
    { id: 'q2', name: '杨丽', title: '技术总监', org: '赛宝实验室', type: 'quality', yearsExperience: 12, region: '广州', price: '¥25,000/项目', rating: 4.9, tags: ['质量检测', 'CNAS'], certifications: ['CISA'], clients: ['南方电网', '广铁'], expertise: '拥有CNAS认证实验室背景，提供具有法律效力的数据质量检测报告。', avatarSeed: 'YangQual' },
    { id: 'q3', name: '张涛', title: '高级顾问', org: '普元信息', type: 'quality', yearsExperience: 10, region: '上海', price: '¥20,000/项目', rating: 4.7, tags: ['元数据', '血缘分析'], certifications: ['PMP'], clients: ['浦发银行', '国泰君安'], expertise: '擅长金融行业数据血缘分析与元数据管理，提升数据可追溯性。', avatarSeed: 'ZhangQual' },
    { id: 'q4', name: '李华', title: '专家', org: '华宇软件', type: 'quality', yearsExperience: 11, region: '北京', price: '¥18,000/项目', rating: 4.6, tags: ['政务数据', '清洗治理'], certifications: ['CDMP'], clients: ['最高法', '司法部'], expertise: '专注于政务大数据清洗与治理，提升公共数据可用性。', avatarSeed: 'LiQual' },
    { id: 'q5', name: '王强', title: '合伙人', org: '亿信华辰', type: 'quality', yearsExperience: 14, region: '武汉', price: '¥16,000/项目', rating: 4.8, tags: ['数据标准', '质量监控'], certifications: ['DAMA'], clients: ['湖北省大数据局'], expertise: '提供全链路数据质量监控解决方案，确保数据资产“清洁”。', avatarSeed: 'WangQual' },
    { id: 'q6', name: '赵敏', title: '咨询总监', org: '数澜科技', type: 'quality', yearsExperience: 9, region: '杭州', price: '¥20,000/项目', rating: 4.7, tags: ['数据中台', '标签体系'], certifications: ['阿里云认证'], clients: ['万科', '绿城'], expertise: '擅长地产行业数据中台建设与标签体系质量评估。', avatarSeed: 'ZhaoQual' },
    { id: 'q7', name: '孙斌', title: '高级经理', org: '御数坊', type: 'quality', yearsExperience: 8, region: '北京', price: '¥18,000/项目', rating: 4.6, tags: ['DG', '数据安全'], certifications: ['CISP'], clients: ['中信银行'], expertise: '数据治理与数据安全融合专家，保障数据质量与安全双达标。', avatarSeed: 'SunQual' },
    { id: 'q8', name: '周巍', title: '架构师', org: '明略科技', type: 'quality', yearsExperience: 10, region: '上海', price: '¥22,000/项目', rating: 4.8, tags: ['知识图谱', '非结构化'], certifications: ['PhD'], clients: ['上海地铁'], expertise: '擅长非结构化数据治理与知识图谱构建，提升数据挖掘价值。', avatarSeed: 'ZhouQual' },

    // 5. Valuation (评估)
    { id: 'v1', name: '刘强', title: '首席评估师', org: '中联资产评估', type: 'valuation', yearsExperience: 22, region: '北京', price: '¥40,000/项目', rating: 5.0, tags: ['国资评估', '上市定价'], certifications: ['CPV', 'FRM'], clients: ['国资委', '腾讯'], expertise: '国内数据资产评估泰斗，主导过首单数据资产入表评估项目。', avatarSeed: 'LiuVal' },
    { id: 'v2', name: '张明', title: '合伙人', org: '银信资产评估', type: 'valuation', yearsExperience: 18, region: '上海', price: '¥30,000/项目', rating: 4.9, tags: ['金融数据', '收益法'], certifications: ['CPV'], clients: ['浦发银行', '太保'], expertise: '精通收益法模型，擅长金融衍生数据产品的价值估算。', avatarSeed: 'ZhangVal' },
    { id: 'v3', name: '王伟', title: '副总裁', org: '天健兴业', type: 'valuation', yearsExperience: 16, region: '北京', price: '¥28,000/项目', rating: 4.8, tags: ['科技企业', '成本法'], certifications: ['CPV', 'CPA'], clients: ['百度', '京东'], expertise: '擅长互联网企业数据资产重置成本法评估，数据详实可信。', avatarSeed: 'WangVal' },
    { id: 'v4', name: '李红', title: '总监', org: '国众联', type: 'valuation', yearsExperience: 14, region: '深圳', price: '¥25,000/项目', rating: 4.7, tags: ['数据贷', '质押评估'], certifications: ['CPV'], clients: ['微众银行', '招行'], expertise: '专注数据资产质押融资评估，报告获多家银行风控认可。', avatarSeed: 'LiVal' },
    { id: 'v5', name: '赵刚', title: '高级经理', org: '坤元评估', type: 'valuation', yearsExperience: 12, region: '杭州', price: '¥20,000/项目', rating: 4.6, tags: ['电商数据', '市场法'], certifications: ['CPV'], clients: ['阿里巴巴'], expertise: '擅长利用市场法对电商交易数据进行公允价值评估。', avatarSeed: 'ZhaoVal' },
    { id: 'v6', name: '孙丽', title: '经理', org: '东洲评估', type: 'valuation', yearsExperience: 10, region: '上海', price: '¥18,000/项目', rating: 4.5, tags: ['知识产权', '软件著作'], certifications: ['CPV'], clients: ['Bilibili'], expertise: '擅长软件著作权与后台数据资产的打包评估。', avatarSeed: 'SunVal' },
    { id: 'v7', name: '周凯', title: '合伙人', org: '中企华', type: 'valuation', yearsExperience: 19, region: '北京', price: '¥35,000/项目', rating: 4.9, tags: ['能源数据', '基建数据'], certifications: ['CPV'], clients: ['国家管网', '三峡'], expertise: '能源与基建行业数据资产评估专家，经验丰富。', avatarSeed: 'ZhouVal' },
    { id: 'v8', name: '吴平', title: '专家', org: '北方亚事', type: 'valuation', yearsExperience: 13, region: '天津', price: '¥20,000/项目', rating: 4.6, tags: ['工业数据', '物联网'], certifications: ['CPV'], clients: ['一汽', '空客'], expertise: '专注于工业互联网与IoT设备数据价值评估。', avatarSeed: 'WuVal' },

    // 6. Trading (交易)
    { id: 't1', name: 'SDE 官方服务', title: '挂牌服务团队', org: '上海数据交易所', type: 'trading', yearsExperience: 5, region: '上海', price: '¥10,000/项目', rating: 5.0, tags: ['官方通道', '快速审核'], certifications: ['SDE认证'], clients: ['数千家挂牌企业'], expertise: '交易所官方服务团队，提供从合规审核到挂牌上市的一站式绿色通道。', avatarSeed: 'SDETeam' },
    { id: 't2', name: '张华', title: '金牌经纪人', org: '华东数据经纪', type: 'trading', yearsExperience: 8, region: '上海', price: '¥15,000/项目', rating: 4.9, tags: ['撮合交易', '金融买家'], certifications: ['数据经纪人'], clients: ['银行', '券商'], expertise: '拥有丰富的金融机构买家资源，擅长金融数据产品的高溢价撮合。', avatarSeed: 'ZhangTrad' },
    { id: 't3', name: '李明', title: '合伙人', org: '数商科技', type: 'trading', yearsExperience: 7, region: '深圳', price: '¥12,000/项目', rating: 4.8, tags: ['深数所', '跨境交易'], certifications: ['DEX认证'], clients: ['跨境电商'], expertise: '深耕深圳数据交易所生态，擅长跨境电商数据产品的合规交易。', avatarSeed: 'LiTrad' },
    { id: 't4', name: '王勇', title: '总监', org: '北数所服务中心', type: 'trading', yearsExperience: 6, region: '北京', price: '¥12,000/项目', rating: 4.7, tags: ['公共数据', '政务授权'], certifications: ['BJDX认证'], clients: ['市政单位'], expertise: '熟悉北京国际大数据交易所规则，擅长公共数据授权运营产品的进场交易。', avatarSeed: 'WangTrad' },
    { id: 't5', name: '赵强', title: '经纪人', org: '贵阳大数据交易所', type: 'trading', yearsExperience: 9, region: '贵阳', price: '¥8,000/项目', rating: 4.6, tags: ['算力交易', '场景对接'], certifications: ['GZDATA'], clients: ['云上贵州'], expertise: '国内最早一批数据经纪人，擅长算力与数据融合产品的交易撮合。', avatarSeed: 'ZhaoTrad' },
    { id: 't6', name: '孙浩', title: '顾问', org: '浙数交服务站', type: 'trading', yearsExperience: 5, region: '杭州', price: '¥10,000/项目', rating: 4.7, tags: ['产业数据', '供应链'], certifications: ['ZJDX'], clients: ['传化智联'], expertise: '专注供应链与物流数据产品的交易变现与场景落地。', avatarSeed: 'SunTrad' },
    { id: 't7', name: '周林', title: '高级经理', org: '广数所生态伙伴', type: 'trading', yearsExperience: 6, region: '广州', price: '¥10,000/项目', rating: 4.6, tags: ['行业数据', '地产'], certifications: ['GZDE'], clients: ['富力', '保利'], expertise: '熟悉广州数据交易所流程，擅长地产与建筑行业数据挂牌。', avatarSeed: 'ZhouTrad' },
    { id: 't8', name: '吴凯', title: '交易员', org: '西部数据交易中心', type: 'trading', yearsExperience: 4, region: '重庆', price: '¥8,000/项目', rating: 4.5, tags: ['汽车数据', '工业'], certifications: ['CQDX'], clients: ['长安汽车'], expertise: '专注西部地区汽车工业数据产品的交易撮合。', avatarSeed: 'WuTrad' },
];

const PROVIDER_TYPES: { id: ProviderType; label: string; icon: any }[] = [
    { id: 'consulting', label: '咨询服务', icon: Briefcase },
    { id: 'legal', label: '合规律师', icon: ShieldCheck },
    { id: 'accounting', label: '入表会计', icon: BookOpen },
    { id: 'quality', label: '质量评估', icon: CheckCircle2 },
    { id: 'valuation', label: '资产评估', icon: TrendingUp },
    { id: 'trading', label: '数据交易', icon: Share2 },
];

const ReportPreview: React.FC<ReportPreviewProps> = ({ asset, onBack, onMarketplace, prefilledProfile }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [isCertified, setIsCertified] = useState(asset.status === AssessmentStatus.CERTIFIED);
  
  // Service Marketplace State
  const [showServiceMarket, setShowServiceMarket] = useState(false);
  const [selectedType, setSelectedType] = useState<ProviderType>('consulting');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showProviderDetail, setShowProviderDetail] = useState(false);
  const [smartMatchLoading, setSmartMatchLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'exp'>('rating');

  // Contact Modal State (for Expert & Legal Certificate)
  const [showContactConfirm, setShowContactConfirm] = useState(false);
  // Separate state for Certificate Application Modal
  const [showCertApplication, setShowCertApplication] = useState(false); 
  
  const [contactForm, setContactForm] = useState({ company: '', name: '', phone: '', wechat: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    generateValuationReport(asset).then(setReportData);
  }, [asset]);

  useEffect(() => {
      // Prefill contact form when any contact modal opens
      if(showContactConfirm || showCertApplication) {
          setContactForm(prev => ({
              ...prev,
              company: asset.projectInfo?.unitName || '',
              phone: prefilledProfile?.phone || ''
          }));
      }
  }, [showContactConfirm, showCertApplication, asset.projectInfo, prefilledProfile]);

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === asset.selectedModelId) || AVAILABLE_MODELS[0];

  const handleApply = () => {
      setShowCertApplication(true);
  };

  const handleSmartMatch = () => {
      setSmartMatchLoading(true);
      setTimeout(() => {
          // Mock Match Logic: find highest rated in selected category
          const candidates = MOCK_PROVIDERS.filter(p => p.type === selectedType);
          const best = candidates.sort((a,b) => b.rating - a.rating)[0];
          
          setSmartMatchLoading(false);
          if (best) {
              setSelectedProvider(best);
              setShowProviderDetail(true);
          }
      }, 2000);
  };

  const handleViewProvider = (provider: ServiceProvider) => {
      setSelectedProvider(provider);
      setShowProviderDetail(true);
  };

  const proceedToContact = () => {
      setShowProviderDetail(false);
      setShowContactConfirm(true);
  };

  const handleListingClick = () => {
      // Trigger the Listing Flow in App.tsx
      onMarketplace();
  };

  const submitContactForm = (e: React.FormEvent, isCertApp: boolean = false) => {
      e.preventDefault();
      
      // LOGIC FIX: 11 digit check
      if (!/^\d{11}$/.test(contactForm.phone)) {
          alert("请输入正确的11位手机号码");
          return;
      }

      setIsSubmitting(true);
      setTimeout(() => {
          setIsSubmitting(false);
          setSubmitSuccess(true);
          
          // Only auto-close if NOT cert application
          if (!isCertApp) {
            setTimeout(() => {
                // LOGIC FIX: Return to Provider List instead of closing everything
                setShowContactConfirm(false); 
                // setShowCertApplication(false); // Handled manually for Cert App
                setShowProviderDetail(false); // Close detail
                setSubmitSuccess(false); // Reset success state
            }, 3000);
          }
      }, 1000);
  };

  const sortedProviders = MOCK_PROVIDERS
    .filter(p => p.type === selectedType)
    .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'exp') return b.yearsExperience - a.yearsExperience;
        // Simple string comparison for price mock
        return 0; 
    });

  if (!reportData) {
    return (
       <div className="h-full flex flex-col items-center justify-center bg-white text-google-text">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-gray-100 rounded-full mb-4"></div>
             <div className="w-16 h-16 border-4 border-google-blue border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-xl font-bold mb-2">专家模型计算中...</p>
       </div>
    );
  }

  // LOGIC FIX: Use Persistent Trend Data from Asset
  const trendData = asset.valueHistory && asset.valueHistory.length > 0 
      ? asset.valueHistory 
      : []; // Should be populated by App.tsx now.

  const isContactValid = contactForm.name && /^\d{11}$/.test(contactForm.phone);

  return (
    <div className="h-full bg-gray-50 overflow-y-auto pb-24 relative">
      
      {/* Service Provider Marketplace Modal */}
      {showServiceMarket && (
          <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col animate-in slide-in-from-bottom duration-300">
              {/* Header */}
              <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between flex-shrink-0">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Briefcase className="text-google-blue"/> 数据服务商市场
                  </h2>
                  <button onClick={() => setShowServiceMarket(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                      关闭
                  </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full">
                  
                  {/* Sidebar Filters */}
                  <div className="w-full md:w-64 bg-white border-r border-gray-200 overflow-y-auto p-4 flex-shrink-0">
                      <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 px-2">服务类型</h3>
                      <div className="space-y-1">
                          {PROVIDER_TYPES.map(type => (
                              <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition ${
                                    selectedType === type.id 
                                    ? 'bg-blue-50 text-google-blue' 
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                  <type.icon size={18}/> {type.label}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Main List */}
                  <div className="flex-1 overflow-y-auto p-6">
                      
                      {/* Smart Match Banner */}
                      <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-6 text-white mb-8 shadow-lg flex items-center justify-between relative overflow-hidden">
                          <div className="relative z-10">
                              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                                  <Zap className="text-yellow-400 fill-current"/> Ai 智能匹配
                              </h3>
                              <p className="text-gray-300 text-sm">
                                  根据您的资产行业 ({asset.industry}) 和规模，自动筛选最匹配的{PROVIDER_TYPES.find(t=>t.id===selectedType)?.label}。
                              </p>
                          </div>
                          <button 
                            onClick={handleSmartMatch}
                            disabled={smartMatchLoading}
                            className="relative z-10 bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
                          >
                              {smartMatchLoading ? <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/> : <Search size={16}/>}
                              立即匹配
                          </button>
                          {/* Decorative Scan Line */}
                          {smartMatchLoading && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 h-full skew-x-12 animate-[shimmer_1s_infinite]"></div>
                          )}
                      </div>

                      {/* Sorting */}
                      <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-500">共找到 {sortedProviders.length} 位专家</span>
                          <div className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-lg p-1">
                              <button onClick={() => setSortBy('rating')} className={`px-3 py-1 rounded ${sortBy === 'rating' ? 'bg-gray-100 font-bold' : 'text-gray-500'}`}>评分</button>
                              <button onClick={() => setSortBy('exp')} className={`px-3 py-1 rounded ${sortBy === 'exp' ? 'bg-gray-100 font-bold' : 'text-gray-500'}`}>年限</button>
                          </div>
                      </div>

                      {/* Grid */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {sortedProviders.map(provider => (
                              <div key={provider.id} onClick={() => handleViewProvider(provider)} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-xl transition group cursor-pointer hover:border-google-blue">
                                  <div className="flex items-center gap-4 mb-4">
                                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm flex-shrink-0">
                                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.avatarSeed}`} alt={provider.name} />
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-gray-900 text-lg">{provider.name}</h4>
                                          <p className="text-xs text-google-blue font-bold">{provider.title}</p>
                                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{provider.org}</p>
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-2 mb-4">
                                      <div className="flex items-center gap-2 text-xs text-gray-600">
                                          <Star size={12} className="text-yellow-500 fill-current"/>
                                          <span className="font-bold text-gray-900">{provider.rating}</span>
                                          <span className="text-gray-300">|</span>
                                          <span>从业 {provider.yearsExperience} 年</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-600">
                                          <MapPin size={12} className="text-gray-400"/>
                                          <span>{provider.region}</span>
                                      </div>
                                  </div>

                                  <div className="flex flex-wrap gap-1 mb-4">
                                      {provider.tags.slice(0,3).map(tag => (
                                          <span key={tag} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded">{tag}</span>
                                      ))}
                                  </div>

                                  <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                      <span className="font-bold text-gray-900 text-sm">{provider.price}</span>
                                      <span className="text-xs text-google-blue font-medium">查看详情 &rarr;</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Provider Detail Modal */}
      {showProviderDetail && selectedProvider && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                      <button onClick={() => setShowProviderDetail(false)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                          <X size={20} />
                      </button>
                      <div className="flex items-center gap-6">
                          <div className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg bg-white overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProvider.avatarSeed}`} alt="Avatar" className="w-full h-full"/>
                          </div>
                          <div>
                              <h2 className="text-3xl font-bold mb-1">{selectedProvider.name}</h2>
                              <p className="text-blue-100 text-lg mb-2">{selectedProvider.title} @ {selectedProvider.org}</p>
                              <div className="flex gap-3">
                                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                      <Star size={12} fill="currentColor"/> {selectedProvider.rating} 评分
                                  </span>
                                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                                      {selectedProvider.yearsExperience} 年从业经验
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-8 overflow-y-auto">
                      <div className="grid md:grid-cols-2 gap-8 mb-8">
                          <div>
                              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Award size={18}/> 资质认证</h4>
                              <div className="flex flex-wrap gap-2">
                                  {selectedProvider.certifications.map(c => (
                                      <span key={c} className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-xs font-bold">{c}</span>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Briefcase size={18}/> 服务客户</h4>
                              <div className="flex flex-wrap gap-2">
                                  {selectedProvider.clients.map(c => (
                                      <span key={c} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{c}</span>
                                  ))}
                              </div>
                          </div>
                      </div>
                      
                      <div className="mb-8">
                          <h4 className="font-bold text-gray-900 mb-3">个人简介与擅长领域</h4>
                          <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                              {selectedProvider.expertise}
                          </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                          <div>
                              <p className="text-xs text-gray-400 uppercase">参考报价</p>
                              <p className="text-2xl font-bold text-gray-900">{selectedProvider.price}</p>
                          </div>
                          <button 
                            onClick={proceedToContact}
                            className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:scale-105 transition transform flex items-center gap-2"
                          >
                              <Phone size={18} /> 预约咨询
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Certificate Application Modal */}
      {showCertApplication && (
          <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                  {submitSuccess ? (
                      <div className="p-10 text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 size={32} className="text-green-600"/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">申请已受理</h3>
                          <p className="text-gray-500 text-sm mb-4">
                              我们的评估专家将在 <strong>3个工作日内</strong> 按照您提供的联系方式与您进行电话对接。
                          </p>
                          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 text-left space-y-2">
                              <p className="font-bold">后续流程说明：</p>
                              <p>1. 专家电话沟通，确认评估目的与范围。</p>
                              <p>2. 补充必要的合规证明材料。</p>
                              <p>3. 评估师进行线下或远程核验。</p>
                              <p>4. 出具带盖章的法律效力评估报告。</p>
                          </div>
                          <button 
                            onClick={() => {
                                setShowCertApplication(false);
                                setSubmitSuccess(false);
                            }}
                            className="w-full mt-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition shadow-lg"
                          >
                              关闭
                          </button>
                      </div>
                  ) : (
                      <>
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FileSignature size={20} className="text-yellow-400"/> 获取正式评估报告
                            </h3>
                            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                                当前为AI初筛结果。如需用于银行授信、监管备案或进场交易，需由注册评估师进行线下核验并出具带章报告。
                            </p>
                        </div>
                        <form onSubmit={(e) => submitContactForm(e, true)} className="p-6 space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">单位名称</label>
                                <input 
                                    required
                                    className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-google-blue outline-none text-sm font-medium text-gray-700"
                                    value={contactForm.company}
                                    readOnly 
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">联系人姓名</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-3 text-gray-400"/>
                                    <input 
                                        required
                                        className="w-full pl-9 p-3 rounded-lg border border-gray-200 focus:border-google-blue outline-none text-sm"
                                        placeholder="请输入姓名"
                                        value={contactForm.name}
                                        onChange={e => setContactForm({...contactForm, name: e.target.value})}
                                        autoFocus
                                    />
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">手机号码</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-3 text-gray-400"/>
                                        <input 
                                            required
                                            type="tel"
                                            className="w-full pl-9 p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-google-blue outline-none text-sm font-medium text-gray-700"
                                            value={contactForm.phone}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">微信号 (选填)</label>
                                    <div className="relative">
                                        <MessageCircle size={16} className="absolute left-3 top-3 text-gray-400"/>
                                        <input 
                                            className="w-full pl-9 p-3 rounded-lg border border-gray-200 focus:border-google-blue outline-none text-sm"
                                            placeholder="WeChat ID"
                                            value={contactForm.wechat}
                                            onChange={e => setContactForm({...contactForm, wechat: e.target.value})}
                                        />
                                    </div>
                                </div>
                             </div>

                             <div className="flex gap-3 mt-4">
                                 <button 
                                    type="button" 
                                    onClick={() => setShowCertApplication(false)}
                                    className="flex-1 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition text-sm"
                                 >
                                     取消
                                 </button>
                                 <button 
                                    type="submit" 
                                    disabled={!isContactValid || isSubmitting}
                                    className={`flex-1 py-3 rounded-lg font-bold text-white shadow-md transition flex justify-center items-center text-sm ${
                                        isContactValid 
                                        ? 'bg-google-blue hover:bg-blue-600' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                 >
                                     {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "确认提交申请"}
                                 </button>
                             </div>
                        </form>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* Final Contact Confirmation Modal (For regular provider booking) */}
      {showContactConfirm && (
          <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                  {submitSuccess ? (
                      <div className="p-10 text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 size={32} className="text-green-600"/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">预约申请已提交</h3>
                          <p className="text-gray-500 text-sm">
                              我们已收到您的需求。服务商 <strong>{selectedProvider?.name}</strong> 将在 3 个工作日内通过电话 (021-xxxx) 联系您，请保持畅通。
                          </p>
                      </div>
                  ) : (
                      <>
                        <div className="bg-gray-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Phone size={18}/> 确认联系方式
                            </h3>
                            <p className="text-xs text-gray-500 mt-2">
                                请确认您的联系信息，以便专家与您取得联系。
                            </p>
                        </div>
                        <form onSubmit={(e) => submitContactForm(e)} className="p-6 space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">单位名称</label>
                                <input 
                                    required
                                    className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-google-blue outline-none text-sm font-medium text-gray-700"
                                    value={contactForm.company}
                                    readOnly 
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">联系人姓名</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-3 text-gray-400"/>
                                    <input 
                                        required
                                        className="w-full pl-9 p-3 rounded-lg border border-gray-200 focus:border-google-blue outline-none text-sm"
                                        placeholder="请输入姓名"
                                        value={contactForm.name}
                                        onChange={e => setContactForm({...contactForm, name: e.target.value})}
                                        autoFocus
                                    />
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">手机号码</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-3 text-gray-400"/>
                                        <input 
                                            required
                                            type="tel"
                                            className="w-full pl-9 p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-google-blue outline-none text-sm font-medium text-gray-700"
                                            value={contactForm.phone}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">微信号 (选填)</label>
                                    <div className="relative">
                                        <MessageCircle size={16} className="absolute left-3 top-3 text-gray-400"/>
                                        <input 
                                            className="w-full pl-9 p-3 rounded-lg border border-gray-200 focus:border-google-blue outline-none text-sm"
                                            placeholder="WeChat ID"
                                            value={contactForm.wechat}
                                            onChange={e => setContactForm({...contactForm, wechat: e.target.value})}
                                        />
                                    </div>
                                </div>
                             </div>

                             <div className="flex gap-3 mt-4">
                                 <button 
                                    type="button" 
                                    onClick={() => setShowContactConfirm(false)}
                                    className="flex-1 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition text-sm"
                                 >
                                     返回
                                 </button>
                                 <button 
                                    type="submit" 
                                    disabled={!isContactValid || isSubmitting}
                                    className={`flex-1 py-3 rounded-lg font-bold text-white shadow-md transition flex justify-center items-center text-sm ${
                                        isContactValid 
                                        ? 'bg-google-blue hover:bg-blue-600' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                 >
                                     {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "确认并发送申请"}
                                 </button>
                             </div>
                        </form>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-google-blue">
            <ArrowLeft size={20} className="mr-1"/> 返回
        </button>
        <span className="font-bold text-gray-800">评估报告</span>
        <button className="text-google-blue font-medium text-sm flex items-center gap-1">
            <Download size={16} /> 导出 PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Certificate Card */}
        <div className="bg-white rounded-none md:rounded-lg shadow-lg border border-gray-200 overflow-hidden relative print:shadow-none">
            {/* Watermark only if Certified */}
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
                {isCertified && (
                    <div className="relative transform rotate-[-12deg] opacity-90 animate-in zoom-in duration-500">
                        <div className="w-48 h-48 border-4 border-red-600 rounded-full flex flex-col items-center justify-center text-red-600 p-2 shadow-sm">
                            <div className="text-xs font-serif tracking-widest mb-1">中国数据资产评估</div>
                            <StarRow />
                            <div className="text-xl font-bold font-serif my-2">已认证</div>
                            <div className="text-[10px] uppercase tracking-tighter">Certified Valuation</div>
                            <div className="text-[10px] mt-2 font-mono">{new Date().toISOString().split('T')[0]}</div>
                        </div>
                        {/* Signature */}
                        <div className="absolute top-24 left-20 transform -rotate-12">
                            <img src="https://api.dicebear.com/7.x/initials/svg?seed=ZW&backgroundColor=transparent&textColor=b91c1c" className="w-24 h-12 opacity-80" alt="Signature"/>
                        </div>
                    </div>
                )}
            </div>

            <div className={`h-2 w-full ${selectedModel.id === 'm1' ? 'bg-google-blue' : 'bg-purple-600'}`}></div>
            <div className="p-8 pb-12 text-center relative z-10">
                <div className="flex justify-center mb-6">
                    <ShieldCheck size={48} className={selectedModel.id === 'm1' ? 'text-google-blue' : 'text-purple-600'}/>
                </div>
                <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">数据资产价值评估证书</h1>
                <p className="text-gray-500 text-sm mb-4 uppercase tracking-widest">Certificate of Valuation</p>
                
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full mb-8">
                    <BookOpen size={14} className="text-gray-500"/>
                    <span className="text-xs font-bold text-gray-700">基于: {selectedModel.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto mb-8 bg-gray-50 p-4 rounded border border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400 uppercase">资产名称</p>
                        <p className="font-bold text-gray-800">{asset.name}</p>
                    </div>
                    <div>
                         <p className="text-xs text-gray-400 uppercase">评估场景</p>
                         <p className="font-bold text-google-blue">{asset.scenario}</p>
                    </div>
                    <div>
                         <p className="text-xs text-gray-400 uppercase">证书编号</p>
                         <p className="font-mono text-gray-600">DVA-{asset.id.substring(0,8)}-V4</p>
                    </div>
                    <div>
                         <p className="text-xs text-gray-400 uppercase">评估机构</p>
                         <p className="text-gray-600">{selectedModel.provider}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2">核定估值区间 (RMB)</p>
                    <div className={`text-4xl md:text-5xl font-serif font-bold tracking-tight ${selectedModel.id === 'm1' ? 'text-google-blue' : 'text-purple-700'}`}>
                        {reportData.valuationRange}
                    </div>
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                        <TrendingUp size={12} className="mr-1"/> 
                        环比上月: +2.4%
                    </div>
                </div>

                {/* Certification CTA or Supplement */}
                <div className="mt-8 border-t border-dashed border-gray-200 pt-6">
                    {!isCertified ? (
                        <>
                            <p className="text-xs text-orange-600 mb-3 bg-orange-50 inline-block px-3 py-1 rounded-full">
                                ⚠️ 当前为 AI 自动评估结果，仅供内部参考，不具备法律效力
                            </p>
                            <div className="flex flex-col md:flex-row justify-center gap-3">
                                <button 
                                    onClick={onBack}
                                    className="bg-white border border-gray-300 text-gray-600 px-6 py-3 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 transition flex flex-col items-center justify-center gap-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <RefreshCw size={16} />
                                        补充材料并重新评估
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-normal">(不重复扣积分)</span>
                                </button>
                                
                                {/* New Secret Entry Button Structure */}
                                <div className="group relative overflow-hidden bg-gray-900 text-white rounded-full font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-stretch">
                                    {/* Secret Button: Opens Marketplace */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowServiceMarket(true); }}
                                        className="px-4 flex items-center justify-center border-r border-gray-700 hover:bg-gray-800 transition relative z-20"
                                        title="Secret: Service Marketplace"
                                    >
                                        <BadgeCheck size={18} className="text-yellow-400"/>
                                    </button>
                                    
                                    {/* Main Button: Opens Cert Application */}
                                    <button 
                                        onClick={handleApply}
                                        className="px-6 py-3 flex-1 text-left relative z-20"
                                    >
                                        申请法律效力证书和完整版报告
                                    </button>
                                    
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none z-10"></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-center">
                             <button 
                                onClick={onBack}
                                className="bg-white border border-gray-300 text-gray-600 px-6 py-3 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 transition flex flex-col items-center justify-center gap-1"
                            >
                                <div className="flex items-center gap-2">
                                    <RefreshCw size={16} />
                                    补充材料并重新评估
                                </div>
                                <span className="text-[10px] text-gray-400 font-normal">(不重复扣积分)</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Charts & Analysis Grid */}
        <div className="grid md:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                 <h3 className="font-bold text-gray-800 mb-2 self-start border-l-4 border-google-yellow pl-3">资产图谱</h3>
                 <div className="w-full h-64">
                    <RadarAnalysis data={asset.dimensions} />
                 </div>
            </div>

            {/* Value Trend Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                 <h3 className="font-bold text-gray-800 mb-4 self-start border-l-4 border-red-500 pl-3">价值趋势 (12个月)</h3>
                 <div className="w-full h-64 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                            <XAxis 
                                dataKey="date" 
                                tick={{fontSize: 10, fill: '#6b7280'}} 
                                axisLine={false} 
                                tickLine={false}
                                interval={0} // Show all ticks
                            />
                            <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']}/>
                            <Tooltip 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                formatter={(value: number) => [`¥${value.toLocaleString()}`, '估值']}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={selectedModel.id === 'm1' ? '#1a73e8' : '#9333ea'} 
                                strokeWidth={3} 
                                dot={false}
                                activeDot={{r: 6}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-4 border-l-4 border-google-blue pl-3 flex items-center justify-between">
                 <span>Ai评估综述</span>
             </h3>
             <div className="text-sm text-gray-700 leading-relaxed space-y-4 whitespace-pre-wrap">
                {/* Simulate rendering markdown roughly by splitting, in a real app use ReactMarkdown */}
                {reportData.summary.split('###').map((section: string, idx: number) => {
                    if (!section.trim()) return null;
                    const [title, ...content] = section.split('\n');
                    return (
                        <div key={idx} className="mb-4">
                            <h4 className="font-bold text-gray-900 mb-1">{title.trim()}</h4>
                            <p className="text-gray-600">{content.join('\n').trim()}</p>
                        </div>
                    )
                })}
             </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-900 text-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h3 className="font-bold text-lg mb-2">资产变现通道</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                    已为您对接 <strong>上海数据交易所</strong> 绿色通道。
                    <br/>由于您采用了权威专家模型{isCertified ? '并已完成认证' : ''}，挂牌审核通过率预计提升 {isCertified ? '95%' : '40%'}。
                </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
                <button onClick={handleListingClick} className="bg-google-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg transition flex items-center justify-center gap-2">
                    <Share2 size={18} />
                    一键挂牌交易
                </button>
                <p className="text-[10px] text-center text-gray-500">消耗 1000 积分</p>
            </div>
        </div>

      </div>
    </div>
  );
};

const StarRow = () => (
    <div className="flex gap-1 justify-center my-1">
        {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 bg-red-600 rounded-full"></div>)}
    </div>
)

export default ReportPreview;