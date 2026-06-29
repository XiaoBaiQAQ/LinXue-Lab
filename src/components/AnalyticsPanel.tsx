/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPersona, CurrentSession, Past30DaysData, VehicleOption } from '../types';
import {
  User,
  History,
  Activity,
  BrainCircuit,
  TrendingUp,
  Tag,
  Clock,
  Star,
  DollarSign,
  MapPin,
  Calendar,
  Cloud,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface AnalyticsPanelProps {
  userPersona: UserPersona;
  currentSession: CurrentSession;
  past30Days: Past30DaysData;
  vehicleOptions: VehicleOption[];
  onTriggerAI: () => Promise<string | null>;
  aiAnalysisResult: string | null;
  isAiLoading: boolean;
}

export default function AnalyticsPanel({
  userPersona,
  currentSession,
  past30Days,
  vehicleOptions,
  onTriggerAI,
  aiAnalysisResult,
  isAiLoading
}: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<'session' | 'history' | 'ai'>('session');

  // Chart styling colors
  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#6366f1', '#a855f7', '#ec4899'];

  // Process selected vehicle choices
  const activeChoices = vehicleOptions.filter(v => v.checked);

  // Parse Markdown paragraphs roughly for a clean list-like UI
  const formatAiOutput = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('###')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-800 mt-5 mb-2 border-l-3 border-orange-500 pl-2">
            {trimmed.replace(/###\s*/, '')}
          </h4>
        );
      } else if (trimmed.startsWith('##')) {
        return (
          <h3 key={idx} className="text-base font-extrabold text-slate-900 mt-6 mb-3 border-b pb-1">
            {trimmed.replace(/##\s*/, '')}
          </h3>
        );
      } else if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-600 my-1 leading-relaxed">
            {trimmed.replace(/^[*-\s]+/, '')}
          </li>
        );
      } else if (trimmed) {
        return (
          <p key={idx} className="text-xs text-slate-600 my-1.5 leading-relaxed">
            {trimmed}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <div id="analytics-panel-wrapper" className="bg-white rounded-2xl border border-slate-100 shadow-xs h-[780px] flex flex-col overflow-hidden">
      {/* Tab Select Header */}
      <div className="bg-slate-50 border-b border-slate-100 flex p-1 shrink-0">
        <button
          id="tab-session"
          onClick={() => setActiveTab('session')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'session'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" />
          本次 Session
        </button>
        <button
          id="tab-history"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          历史轨迹
        </button>
        <button
          id="tab-ai"
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-orange-50 text-orange-700 shadow-2xs ring-1 ring-orange-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <BrainCircuit className="w-4 h-4 shrink-0 text-orange-500" />
          AI 行为洞察
        </button>
      </div>

      {/* Main Tab Content Scroller */}
      <div className="flex-1 overflow-y-auto p-5">
        
        {/* TAB 1: ACTIVE SESSION TELEMETRY */}
        {activeTab === 'session' && (
          <div id="tab-content-session" className="space-y-5 animate-fade-in">
            {/* Simplified Session Parameters */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-orange-500" />
                会话实时数据参数
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-orange-50/50 rounded-xl p-3.5 border border-orange-100/50 shadow-2xs">
                  <p className="text-[10px] font-bold text-orange-800 flex items-center gap-1.5 mb-1.5">
                    ⏱️ 冒泡时间 (J列)
                  </p>
                  <p className="text-xs font-extrabold text-slate-800 font-mono">
                    {currentSession.bubbleTime || '2026-06-25 01:46:00'}
                  </p>
                </div>

                <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100/50 shadow-2xs">
                  <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-1.5 mb-1.5">
                    📈 预估应答率 (I列)
                  </p>
                  <p className="text-xs font-extrabold text-slate-800 font-mono">
                    {currentSession.estimatedAcceptRate || '0.9 - 1.0'}
                  </p>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 shadow-2xs">
                  <p className="text-[10px] font-bold text-blue-800 flex items-center gap-1.5 mb-1.5">
                    📞 呼叫时间 (K列)
                  </p>
                  <p className="text-xs font-extrabold text-slate-800 font-mono">
                    {currentSession.callTime || '无数据'}
                  </p>
                </div>

                <div className="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-100/50 shadow-2xs">
                  <p className="text-[10px] font-bold text-indigo-800 flex items-center gap-1.5 mb-1.5">
                    🔔 应答时间 (L列)
                  </p>
                  <p className="text-xs font-extrabold text-slate-800 font-mono">
                    {currentSession.replyTime || '无数据'}
                  </p>
                </div>


              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PAST 30 DAYS TRACKS & RECHARTS */}
        {activeTab === 'history' && (
          <div id="tab-content-history" className="space-y-5 animate-fade-in">
            {/* Bento statistics grids - Only 累计行程单 is kept */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">累计行程单</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-1 font-mono">{past30Days.totalRides} 单</p>
            </div>

            {/* Split layout: Category distribution pie chart + sample historical list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pie Chart of category preferences */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col items-center">
                <h4 className="text-xs font-extrabold text-slate-700 mb-3 self-start">车型偏好分布比重</h4>
                <div className="h-36 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={past30Days.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {past30Days.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '9px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend guide */}
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 text-[9px]">
                    {past30Days.categoryDistribution.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="text-slate-500 font-medium">{entry.name}: {entry.value}次</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Recent Trips List */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                <h4 className="text-xs font-extrabold text-slate-700 mb-3">最近完成行程记录 ({past30Days.rides.length}条)</h4>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {[...past30Days.rides]
                    .sort((a, b) => {
                      const dtA = `${a.date.replace(/\//g, '-')} ${a.time}`;
                      const dtB = `${b.date.replace(/\//g, '-')} ${b.time}`;
                      return dtA.localeCompare(dtB);
                    })
                    .map((ride) => (
                    <div key={ride.orderId} className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-100/80 hover:border-slate-200/80 rounded-xl space-y-2.5 transition-all text-[10px]">
                      {/* Header row: Vehicle Type + Date & Time */}
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-slate-800 text-[11px] bg-slate-200/60 px-2 py-0.5 rounded-md">
                            🚗 {ride.vehicleType}
                          </span>
                          {ride.acceptRate && (
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-sm border border-indigo-100">
                              应答率: {ride.acceptRate}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono font-bold whitespace-nowrap">
                          ⏱️ {ride.date} {ride.time}
                        </span>
                      </div>

                      {/* Row: Price and Distance */}
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                        <div className="flex items-center gap-3">
                          {ride.distanceKm !== undefined && (
                            <span>里程: <strong className="text-slate-700 font-mono font-extrabold">{ride.distanceKm} km</strong></span>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-orange-600 font-mono">
                          实付: ¥{ride.fare}
                        </span>
                      </div>

                      {/* Flowchart path: Start to End */}
                      <div className="pl-2 border-l border-dashed border-slate-300 space-y-1 text-[9px] text-slate-600 leading-snug">
                        <div className="flex items-start gap-1">
                          <span className="text-emerald-500 font-bold shrink-0">起:</span>
                          <span className="truncate" title={ride.startLoc}>{ride.startLoc}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="text-orange-500 font-bold shrink-0">终:</span>
                          <span className="truncate" title={ride.endLoc}>{ride.endLoc}</span>
                        </div>
                      </div>

                      {/* Selection States: defaultChecked, addedChecked, removedChecked */}
                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-[8px] leading-normal font-medium text-slate-500">
                        <div>
                          <p className="text-slate-400 font-bold mb-0.5">🫧 冒泡默认勾</p>
                          <div className="flex flex-wrap gap-0.5">
                            {ride.defaultChecked && ride.defaultChecked.length > 0 ? (
                              ride.defaultChecked.map((item, i) => (
                                <span key={i} className="bg-slate-200/50 text-slate-700 px-1 py-0.5 rounded-xs scale-90 origin-left truncate max-w-[50px] inline-block">{item}</span>
                              ))
                            ) : (
                              <span className="text-slate-300 italic">无</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-emerald-600 font-bold mb-0.5">➕ 加勾</p>
                          <div className="flex flex-wrap gap-0.5">
                            {ride.addedChecked && ride.addedChecked.length > 0 ? (
                              ride.addedChecked.map((item, i) => (
                                <span key={i} className="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded-xs scale-90 origin-left truncate max-w-[50px] inline-block">{item}</span>
                              ))
                            ) : (
                              <span className="text-slate-300 italic">无</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-red-500 font-bold mb-0.5">➖ 减勾</p>
                          <div className="flex flex-wrap gap-0.5">
                            {ride.removedChecked && ride.removedChecked.length > 0 ? (
                              ride.removedChecked.map((item, i) => (
                                <span key={i} className="bg-red-50 text-red-700 px-1 py-0.5 rounded-xs scale-90 origin-left truncate max-w-[50px] inline-block">{item}</span>
                              ))
                            ) : (
                              <span className="text-slate-300 italic">无</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {userPersona.historyRaw && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                      📂 Excel 历史订单轨迹原始值 (W列)
                    </p>
                    <pre className="text-[9px] text-slate-500 bg-slate-50 rounded-lg p-2.5 max-h-[100px] overflow-y-auto whitespace-pre-wrap font-mono border border-slate-100/60 leading-normal">
                      {userPersona.historyRaw}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI BEHAVIORAL DIAGNOSTIC ANALYSIS */}
        {activeTab === 'ai' && (
          <div id="tab-content-ai" className="space-y-5 animate-fade-in">
            {/* AI Action trigger card */}
            <div className="bg-linear-to-r from-orange-500/5 to-orange-500/10 rounded-2xl border border-orange-200/50 p-5">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-orange-500" />
                Didi-Behavior Analyst (出行行为学AI智囊)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                利用大语言模型 (Gemini-3.5-Flash) 针对该用户的画像、时序勾选行为以及近30天的出行决策偏好，综合计算其<b>折扣价格弹性</b>、<b>本次呼叫流失/转化漏斗概率</b>，并输出最有效的<b>精准精细化优惠券运营策略建议</b>。
              </p>

              <button
                id="btn-trigger-ai"
                onClick={onTriggerAI}
                disabled={isAiLoading}
                className={`w-full py-2.5 mt-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isAiLoading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md'
                }`}
              >
                {isAiLoading ? (
                  <>
                    <svg className="animate-spin h-4.5 w-4.5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在利用 Gemini 建模计算中...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4.5 h-4.5 fill-current" />
                    一键分析该用户会话与行为弹性
                  </>
                )}
              </button>
            </div>

            {/* Diagnostic Report Display */}
            {isAiLoading ? (
              <div id="ai-loading-skeleton" className="border border-slate-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-ping"></span>
                  <span className="text-xs text-slate-500 font-medium">AI 正在研究用户历史单与实时轨迹数据...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded-full w-[90%] animate-pulse"></div>
                  <div className="h-3 bg-slate-100 rounded-full w-[75%] animate-pulse"></div>
                  <div className="h-3 bg-slate-100 rounded-full w-[85%] animate-pulse"></div>
                  <div className="h-3 bg-slate-100 rounded-full w-[60%] animate-pulse"></div>
                </div>
              </div>
            ) : aiAnalysisResult ? (
              <div id="ai-analysis-report" className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40 relative">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    📝 策略诊断报告 (Behavioral Audit Report)
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    分析完成
                  </span>
                </div>
                
                {/* Clean markdown rendering area */}
                <div className="space-y-2 markdown-body overflow-x-auto text-xs text-slate-700 pr-1">
                  {formatAiOutput(aiAnalysisResult)}
                </div>
              </div>
            ) : (
              <div id="ai-idle-state" className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-8 h-8 text-slate-300" />
                <p className="font-bold">点击上方按钮，即刻启动人工智能分析决策</p>
                <p className="text-[10px] max-w-xs mt-0.5 leading-relaxed text-slate-400">
                  AI会分析当前用户的勾选车型、比价事件数、历史优惠使用率等指标，进行深度的商业智能运营评估。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
