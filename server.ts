/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. API Route: Analyze Ride-Hailing Session Behavioral Data
app.post('/api/analyze', async (req, res) => {
  try {
    const { persona, session, history } = req.body;

    if (!persona || !session) {
      return res.status(400).json({ error: 'Missing persona or session data' });
    }

    // Format prompt based on provided data
    const systemPrompt = `你是一位顶尖的出行服务（网约车/打车）平台的高级策略产品经理与用户行为学经济学家。
你的任务是通过分析用户画像数据、当前会话交互日志、以及过去30天的出行消费行为，输出一份专业度极高、排版严谨、洞察深刻的【用户行为诊断与精细化运营建议报告】。`;

    const userPrompt = `请对以下打车用户会话（Session）数据进行全面行为诊断：

=== 1. 用户画像数据 ===
- 用户ID: ${persona.userId}
- 年龄: ${persona.age} | 性别: ${persona.gender} | 职业: ${persona.occupation}
- 会员等级: ${persona.vipLevel}
- 价格敏感度系数: ${persona.priceSensitivity} / 10 (数值越高代表对价格和折扣越敏感)
- 舒适度偏好系数: ${persona.comfortPreference} / 10 (数值越高代表对车辆档次越在乎)
- 出行频次特征: ${persona.frequency}
- 用户综合评分: ${persona.averageRating}
- 历史比价时长平均: ${persona.preRideCompareTimeSec}秒
- 行为标签: ${persona.labels ? persona.labels.join(', ') : '暂无'}

=== 2. 当前 Session 订单详情 ===
- 行程起点: ${session.startLocation}
- 行程终点: ${session.endLocation}
- 行程预估里程: ${session.distanceKm} 公里
- 行程预计时间: ${session.durationMin} 分钟
- 会话天气状况: ${session.weather} | 会话时段: ${session.timeSlot}
- 交互设备载体: ${session.deviceType}
- 当前勾选呼叫意向车型: ${session.userChoices ? session.userChoices.join(', ') : '未选择'}

=== 3. 实时会话交互事件流 (用户近2分钟在车列表内的动作) ===
${session.sessionEvents ? session.sessionEvents.map((e: any) => `[${e.time}] ${e.eventType.toUpperCase()}: ${e.description}`).join('\n') : '无交互日志'}

=== 4. 过去30天平台履约轨迹 ===
- 累计行程: ${history?.totalRides || 0} 单
- 实付款累计: ¥${history?.totalSpent || 0}
- 平均折扣节省比例: ${history?.avgDiscountRate ? (history.avgDiscountRate * 100).toFixed(1) : '15'}%
- 最常履约车型: ${history?.preferredVehicle || '暂无'}
- 车型分布频次: ${history?.categoryDistribution ? JSON.stringify(history.categoryDistribution) : '暂无'}

请基于以上多维度数据源，严格按照以下四个核心模块输出专业的深度诊断报告。请以清晰美观的 Markdown 语法进行组织（请使用 ## 与 ### 分级标题，避免产生零散段落）：

## 出行行为深度诊断报告

### 一、 用户决策心智与比价特征分析
分析用户的核心痛点（例如：赶时间、图便宜、喜欢好车、拼车接受度）。结合该用户 ${persona.preRideCompareTimeSec} 秒的比价行为、VIP等级及事件流，诊断此会话中所表现的决策焦虑、比价犹豫点（如为什么停留滴滴小巴后取消、为什么最终复选了特惠快车和惊喜特价）。

### 二、 折扣弹性与价格敏感度评估
基于用户的价格敏感度 ${persona.priceSensitivity}，评估当前车型展现的优惠（如特惠快车专享V6折扣 -¥4.6、惊喜特价一口价 ¥19.1）是否在其心理阈值内。计算该用户对本次行程差价的折扣敏感度弹性，说明该弹性如何引导其最终的下单倾向。

### 三、 本次 Session 下单转化概率与流失风险预测
根据目前用户勾选了 ${session.userChoices ? session.userChoices.length : 0} 个车型的现状和时序，判定当前会话的下单期望胜率（高、中、低）和流失概率。深入剖析流失风险来源（如等待时长、溢价、对拼车步行的厌恶、或存在跨平台比价流失可能）。

### 四、 精准智能运营与差异化补贴策略建议
网约车平台应该如何进行精准精细化运营？请给出3个极具落地性的策略：
1. 应当对该用户发放何种额度、何种门槛的精细化优惠券？（请结合其实付车费和V6身份）；
2. 针对其“拼车嫌步行但想便宜”或“对特惠快车敏感”的痛点，如何调整车型展示或动态溢价？
3. 在App端上应当提供何种心智提示（如：绿色通勤护航提示、周边运力极速接单保证等），从而加速其促成“立即打车”下单转化？`;

    if (!ai) {
      // Return a beautiful, rules-based simulation response if API key is not configured yet
      // This is helpful for early setup before secrets are stored, preserving premium UI
      const simulatedResponse = `## 出行行为深度诊断报告 (模拟本地行为学引擎输出)

> ⚠️ **温馨提示**：您当前尚未在 AI Studio 的【Settings > Secrets】中配置有效的 \`GEMINI_API_KEY\`。当前报告由本地系统规则规则库模拟计算得出。在配置密钥后，点击分析将为您提供完全真实的 Gemini 大模型决策洞察！

### 一、 用户决策心智与比价特征分析
* **高频通勤与高比价偏好**：该用户（${persona.userId}）为互联网大厂产品运营，具有明显的高频通勤特征（每周打车 5-8 次）。虽然拥有 ${persona.vipLevel}，但其价格敏感度极高（${persona.priceSensitivity}/10）。
* **决策停留与焦虑点**：在本次 Session 实时事件流中，用户在 20:37:45 点击了“滴滴小巴”并停留了 3.2 秒，但随后并没有勾选它。这表明用户具有**“拼车嫌步行、但又极度渴望优惠”**的矛盾心理——既想享受 ¥13.0 的超低一口价，又排斥站点拼车所需的步行体力消耗。
* **联合复选锁定**：用户最终联合勾选了“惊喜特价”(¥19.1) 与“特惠快车”(¥26.2)，表明其底线心智是在保证直达不拼车的前提下，寻求最低成本解决方案（享受了V6专属折扣 -¥4.6）。

### 二、 折扣弹性与价格敏感度评估
* **弹性高敏区**：用户的价格敏感度为 8，说明其对价格波动的需求弹性（Price Elasticity of Demand）非常高，系数预计在 1.6 - 2.2 之间。也就是说，价格下降 10%，该用户的打车意愿将提升 16% 以上。
* **会员专属折扣黏性**：当前“特惠快车”展现的 V6 专属折扣（-¥4.6）非常有效地起到了心智牵引作用。即使该车型的实付金额（¥26.2）高于惊喜特价（¥19.1），专属会员折扣的“损失厌恶”心理（Loss Aversion）依然促使他勾选该车型，作为兜底期望。

### 三、 本次 Session 下单转化概率与流失风险预测
* **下单转化概率：高 (预计转化率 85%)**
  * **正向因子**：用户复选了“惊喜特价”和“特惠快车”，增加了平台运力的匹配面。
  * **负向风险**：当前时间为 20:38（普通时段），天气晴天。但如果运力响应等待时间显示超过 5 分钟，由于用户平均比价耗时较长（42秒），极有可能切换到竞品App进行实时价格比对，存在 15% 跨平台流失风险。

### 四、 精准智能运营与差异化补贴策略建议
1. **定制“舒适升级”精细化限时券**：鉴于该用户过去 30 天 50% 的订单选择了“特惠快车”，平台可对其定向增发一张 “¥3.0 特惠快车专享立减券”（满 25 元可用），使特惠快车折后价逼近惊喜特价，提升高客单车型的转化。
2. **免步行拼车引导**：在车型列表“特价拼车”或“极速拼车”卡片处，向该特定用户强力透出“本单可在小区门口直接上车，无需步行至站点”的动态提示，打消其对拼车嫌累的心智顾虑。
3. **App端强透运力保障**：在用户勾选多个车型后，底部的“立即打车”按钮上方推荐闪烁提示：*“当前您勾选的车型在您附近 200 米内有 4 辆闲置运力，预计 10 秒内接单”*，用确定性消除等待焦虑，加速立即点击转化的心智收敛。`;

      return res.json({ result: simulatedResponse });
    }

    // Real API Call using GoogleGenAI SDK
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const resultText = response.text;
    return res.json({ result: resultText });

  } catch (error: any) {
    console.error('Gemini call failure:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze user behavior', 
      details: error.message || String(error) 
    });
  }
});

// 2. Integration with Vite (Dev) or Static Serving (Production)
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    // Dynamic import to avoid including Vite as dependency in production execution
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware loaded.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static client files serving loaded.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ride-hailing analytics server successfully bound and listening on http://0.0.0.0:${PORT}`);
  });
}

start();
