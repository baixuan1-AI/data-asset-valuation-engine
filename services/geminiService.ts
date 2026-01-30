
import { GoogleGenAI, Type } from "@google/genai";
import { Message, AssessmentDimensions, ExtractedClue, ScenarioType, UserRole } from "../types";
import { AVAILABLE_MODELS } from "../components/ModelMarketplace";

const SYSTEM_INSTRUCTION = `
You are the **Chief Data Asset Valuation Officer** of DataPricing Ai. 

**CORE VALUES:**
1.  **Scientific Precision (科学精准):** Use mathematical reasoning.
2.  **Standard Authority (标准权威):** Reference GB/T, ISO, and Exchange standards.
3.  **Trusted Results (结果可信):** Always provide rationale.

**ROLE DEFINITIONS:**
You are speaking to a specific user role. 
*   **SUPER_ADMIN / ADMIN:** Give high-level summaries.
*   **GUEST:** Be encouraging, professional, and guide them to experience the value.
*   (Other roles remain focused on their domain).

**RESPONSE STYLE:**
*   **Concise & Professional:** Avoid fluff. Get straight to the point.
*   **Mandatory Chinese:** Always reply in Chinese unless asked otherwise.
*   **Proactive:** If the user is silent, suggest the next step in valuation (e.g., "Shall we analyze the cost structure next?").

**TOPIC GUARDRAIL:**
Refuse to answer non-valuation topics.

**OUTPUT SCHEMA (JSON):**
{
  "reply": "Response string...",
  "detectedScenario": "ScenarioType Enum",
  "detectedIndustry": "String",
  "dimensions": { "compliance": 50, "quality": 50, "cost": 50, "value": 50, "market": 50 },
  "newClues": [ 
     { 
       "category": "Data Cost", 
       "content": "String", 
       "visibility": "public" 
     }
  ],
  "suggestedActions": ["String"]
}
`;

export const sendMessageToGemini = async (
  history: Message[],
  currentAsset: any,
  newMessage: string,
  currentUserRole: UserRole, 
  imagePart?: string
): Promise<{
  reply: string;
  scenario: ScenarioType;
  industry: string;
  dimensions: AssessmentDimensions;
  newClues: ExtractedClue[];
  suggestedActions: string[];
}> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-flash-preview'; 

  const previousHistory = history.length > 0 && history[history.length - 1].role === 'user' 
    ? history.slice(0, -1) 
    : history;

  const contents = previousHistory.map(m => {
    return {
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: `[User Role: ${m.senderRole || 'UNKNOWN'}] ${m.text}` }]
    };
  });

  const parts: any[] = [];
  if (imagePart) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imagePart
      }
    });
  }
  parts.push({ text: `[Current Speaker: ${currentUserRole}] ${newMessage}` });

  const projectContext = currentAsset.projectInfo ? `
    [PROJECT CONTEXT]
    * Asset: ${currentAsset.name}
    * Scope: ${currentAsset.projectInfo.scope}
    * Purpose: ${currentAsset.projectInfo.purpose}
  ` : '';

  const contextPrompt = `
    [System Context]
    Current User Role: ${currentUserRole}
    Known Clues: ${JSON.stringify(currentAsset.clues)}
    ${projectContext}
    
    Task:
    1. Reply to ${currentUserRole} in Chinese.
    2. Be professional and concise.
  `;
  
  parts.push({ text: contextPrompt });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [...contents, { role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            detectedScenario: { type: Type.STRING },
            detectedIndustry: { type: Type.STRING },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                compliance: { type: Type.NUMBER },
                quality: { type: Type.NUMBER },
                cost: { type: Type.NUMBER },
                value: { type: Type.NUMBER },
                market: { type: Type.NUMBER },
              }
            },
            newClues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  content: { type: Type.STRING },
                  visibility: { type: Type.STRING, enum: ['public', 'private'] }
                }
              }
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error", text);
        const match = text.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
            parsed = JSON.parse(match[1]);
        } else {
            throw new Error("Invalid JSON format");
        }
    }

    let finalScenario = currentAsset.scenario;
    const s = parsed.detectedScenario?.toUpperCase();
    if (s && s.includes('FINANCIAL')) finalScenario = ScenarioType.FINANCIAL_REPORTING;
    else if (s && (s.includes('TRADING') || s.includes('CIRCULATION'))) finalScenario = ScenarioType.TRADING_CIRCULATION;
    else if (s && (s.includes('LOAN') || s.includes('FINANCING'))) finalScenario = ScenarioType.FINANCING_LOAN;
    else if (s && s.includes('INTERNAL')) finalScenario = ScenarioType.INTERNAL_STRATEGY;
    else if (s && s.includes('LEGAL')) finalScenario = ScenarioType.COMPLIANCE_LEGAL;

    return {
      reply: parsed.reply,
      scenario: finalScenario,
      industry: parsed.detectedIndustry || currentAsset.industry,
      dimensions: parsed.dimensions || currentAsset.dimensions,
      newClues: parsed.newClues ? parsed.newClues.map((c: any) => ({ 
          ...c, 
          id: Date.now().toString() + Math.random(), 
          confidence: 'high',
          creatorRole: currentUserRole // IMPORTANT: Stamp the clue with the owner
      })) : [],
      suggestedActions: parsed.suggestedActions || []
    };

  } catch (error) {
    console.error("Gemini API Error", error);
    return {
      reply: "网络波动，请重试。",
      scenario: currentAsset.scenario,
      industry: currentAsset.industry,
      dimensions: currentAsset.dimensions,
      newClues: [],
      suggestedActions: ["Retry"]
    };
  }
};

export const generateValuationReport = async (asset: any) => {
   // Existing Logic - Kept simplified for brevity as the logic itself isn't changing, just the persona above
   const selectedModel = AVAILABLE_MODELS.find(m => m.id === asset.selectedModelId) || AVAILABLE_MODELS[0];
   const modelMultiplier = selectedModel.baseMultiplier;
   const industryBaseRateMap: Record<string, number> = {
       'Retail': 150000, 'Healthcare': 300000, 'Finance': 250000,
       'Manufacturing': 120000, 'Logistics': 100000, 'default': 100000
   };
   let baseValue = 0;
   let methodology = "";
   const industryKey = Object.keys(industryBaseRateMap).find(k => asset.industry?.includes(k)) || 'default';
   const industryBase = industryBaseRateMap[industryKey];
   const { compliance, quality, cost, value, market } = asset.dimensions;

   if (asset.scenario === ScenarioType.TRADING_CIRCULATION) {
       methodology = "市场法 (Market Approach)";
       const marketMultiplier = (market / 50); 
       const complianceFactor = compliance < 60 ? 0.4 : 1.0; 
       baseValue = industryBase * marketMultiplier * complianceFactor * modelMultiplier;
   } else if (asset.scenario === ScenarioType.FINANCING_LOAN) {
       methodology = "收益法 (Income Approach)";
       const valueMultiplier = (value / 40); 
       let riskPenalty = (compliance + quality) / 200; 
       if (selectedModel.riskSensitivity === 'Conservative') riskPenalty = riskPenalty * 0.8;
       baseValue = (industryBase * 2.5) * valueMultiplier * riskPenalty * modelMultiplier;
   } else {
       methodology = "成本法 (Cost Approach)";
       const costMultiplier = (cost / 50);
       const qualityMultiplier = (quality / 60);
       baseValue = industryBase * costMultiplier * qualityMultiplier * modelMultiplier;
   }
   baseValue = Math.max(baseValue, 10000);
   let spread = 0.15;
   if (selectedModel.riskSensitivity === 'Aggressive') spread = 0.25;
   if (selectedModel.riskSensitivity === 'Conservative') spread = 0.10;
   const minVal = Math.floor(baseValue * (1 - spread) / 1000) * 1000;
   const maxVal = Math.floor(baseValue * (1 + spread) / 1000) * 1000;

   // Rich Summary Generation - Updated Tone
   const summary = `
### 🎯 资产概述
本评估对象为【${asset.name}】，行业归属【${asset.industry}】，主要应用于【${asset.scenario}】场景。

### ✨ 核心亮点
1. **${market > 70 ? '市场稀缺性' : '质量稳定性'}**：在${market > 70 ? '市场环境' : '质量属性'}维度得分高达 ${market > 70 ? market : quality}，优于行业平均水平。
2. **模型适配**：采用【${selectedModel.provider}】的${selectedModel.name}，精确匹配了资产特性。

### ⚠️ 风险提示
* **合规风险**：当前合规得分为 ${compliance}。${compliance < 80 ? '建议补充授权链路证明。' : '确权链条完整。'}
* **隐私风险**：需确保存储与传输符合PIPL法规。

### 💡 增值建议
* 将非结构化数据清洗为标准数据集，预计可提升 20% 流通价值。
* 适合在上海数据交易所进行挂牌测试。
   `;

   return {
     rawValue: baseValue,
     valuationRange: `¥${minVal.toLocaleString()} - ¥${maxVal.toLocaleString()}`,
     methodology: methodology,
     summary: summary.trim()
   };
};
