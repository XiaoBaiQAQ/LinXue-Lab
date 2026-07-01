/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserPersona, CurrentSession, VehicleOption, Past30DaysData, SessionEvent, ParsedExcelSession } from './types';
import {
  INITIAL_VEHICLE_OPTIONS,
  DEFAULT_USER_PERSONA,
  DEFAULT_CURRENT_SESSION,
  DEFAULT_PAST_30_DAYS,
  DEFAULT_EXCEL_SESSIONS
} from './data/mockData';
import PhoneSimulator from './components/PhoneSimulator';
import ExcelImporter from './components/ExcelImporter';
import AnalyticsPanel from './components/AnalyticsPanel';
import { Compass, Sparkles, Activity, FileSpreadsheet, HelpCircle, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';

// Helpers to parse history Raw column and compute category distributions
const parseHistoryRaw = (raw: string) => {
  if (!raw) return [];
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.map((line, idx) => {
    const isNewFormat = line.includes('***');
    
    if (isNewFormat) {
      const parts = line.split('***');
      
      // 1. Call Time (Part 0)
      const dateTimeStr = (parts[0] || '').replace(/^\[+/, '').trim();
      const dtParts = dateTimeStr.split(/\s+/);
      const date = dtParts[0] || '2026-06-25';
      const time = dtParts[1] || '21:18:51';
      
      // 2. Accept Rate / 应答率 (Part 1)
      const acceptRate = (parts[1] || '').trim();
      
      // 3. Order details / 本次完单车型、价格、距离、起终点 (Part 2)
      // e.g., "[惊喜特价车|2380.000000|17469.000000|灞桥区|枫林九溪·竹韵-南门(超超烟酒便利店旁)|灞桥区|西侯社区洪庆新苑]"
      const orderDetailsRaw = (parts[2] || '').trim().replace(/^\[/, '').replace(/\]$/, '');
      const orderDetails = orderDetailsRaw.split('|').map(s => s.trim());
      
      const vehicleType = orderDetails[0] || '特惠快车';
      
      // Fare from cents (usually unit is cent, divide by 100)
      const rawPrice = parseFloat(orderDetails[1]);
      const fare = !isNaN(rawPrice) 
        ? (rawPrice > 100 ? Number((rawPrice / 100).toFixed(2)) : rawPrice) 
        : 25.0;
      
      // Distance from meters (usually in meters, divide by 1000)
      const rawDistance = parseFloat(orderDetails[2]);
      const distanceKm = !isNaN(rawDistance) 
        ? Number((rawDistance / 1000).toFixed(2)) 
        : undefined;
      
      const startDistrict = orderDetails[3] || '';
      const startDetail = orderDetails[4] || '';
      const endDistrict = orderDetails[5] || '';
      const endDetail = orderDetails[6] || '';
      
      const startLoc = startDetail ? `${startDistrict}·${startDetail}` : (startDistrict || '未知起点');
      const endLoc = endDetail ? `${endDistrict}·${endDetail}` : (endDistrict || '未知终点');
      
      // 4. Default checked / 本次冒泡默认勾 (Part 3)
      // e.g., "[惊喜特价车, 特惠快车]"
      const defaultCheckedRaw = (parts[3] || '').trim().replace(/^\[/, '').replace(/\]$/, '');
      const defaultChecked = defaultCheckedRaw 
        ? defaultCheckedRaw.split(',').map(s => s.trim()).filter(Boolean) 
        : [];
      
      // 5. Added checked / 加勾 (Part 4)
      const addedCheckedRaw = (parts[4] || '').trim().replace(/^\[/, '').replace(/\]$/, '');
      const addedChecked = addedCheckedRaw === '未加勾' || !addedCheckedRaw 
        ? [] 
        : addedCheckedRaw.split(',').map(s => s.trim()).filter(Boolean);
      
      // 6. Removed checked / 减勾 (Part 5)
      const removedCheckedRaw = (parts[5] || '').trim().replace(/^\[/, '').replace(/\]+$/, '');
      const removedChecked = removedCheckedRaw === '未减勾' || !removedCheckedRaw 
        ? [] 
        : removedCheckedRaw.split(',').map(s => s.trim()).filter(Boolean);
      
      return {
        orderId: `HIST-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        date,
        time,
        vehicleType,
        fare,
        discount: Number((fare * 0.12).toFixed(1)),
        rating: 5,
        isCompleted: true,
        startLoc,
        endLoc,
        acceptRate,
        startDistrict,
        startDetail,
        endDistrict,
        endDetail,
        distanceKm,
        defaultChecked,
        addedChecked,
        removedChecked
      };
    } else {
      // Fallback old parsing logic
      const cleanLine = line.replace(/[\[\]]/g, '');
      const parts = cleanLine.split('***');
      
      const dateTimeStr = parts[0] || '2026-06-11 08:00:00';
      const date = dateTimeStr.split(' ')[0] || '2026-06-11';
      const time = dateTimeStr.split(' ')[1] || '08:00';
      const rate = parts[1] || '0.9';
      const typeAndPrice = parts[2] || '特惠快车';
      
      const priceMatch = line.match(/¥?\s*(\d+(\.\d+)?)/);
      const fare = priceMatch ? parseFloat(priceMatch[1]) : 25.0;
      
      return {
        orderId: `HIST-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        date,
        time,
        vehicleType: typeAndPrice.split(']')[0].trim() || '特惠快车',
        fare,
        discount: Number((fare * 0.12).toFixed(1)),
        rating: 5,
        isCompleted: true,
        startLoc: '历史记录起点位置',
        endLoc: '历史记录目的地位置',
        acceptRate: rate
      };
    }
  });
};

const calculateCategoryDistribution = (rides: any[]) => {
  const counts: Record<string, number> = {};
  rides.forEach((r) => {
    counts[r.vehicleType] = (counts[r.vehicleType] || 0) + 1;
  });
  
  const dist = Object.entries(counts).map(([name, value]) => ({ name, value }));
  if (dist.length === 0) {
    return [
      { name: '特惠快车', value: 3 },
      { name: '普通快车', value: 1 }
    ];
  }
  return dist;
};

export default function App() {
  // Global Excel high-fidelity session pool
  const [sessions, setSessions] = useState<ParsedExcelSession[]>(DEFAULT_EXCEL_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('c448d6e66a');

  // Copy ID State & Handler
  const [copied, setCopied] = useState(false);
  const handleCopyId = () => {
    navigator.clipboard.writeText(selectedSessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find index of currently active session
  const currentIndex = sessions.findIndex((s) => s.passengerId === selectedSessionId);

  // Switch to the previous session with cyclic wrapping
  const handlePrevSession = () => {
    if (sessions.length <= 1) return;
    const newIdx = (currentIndex - 1 + sessions.length) % sessions.length;
    setSelectedSessionId(sessions[newIdx].passengerId);
    setAiAnalysisResult(null);
  };

  // Switch to the next session with cyclic wrapping
  const handleNextSession = () => {
    if (sessions.length <= 1) return;
    const newIdx = (currentIndex + 1) % sessions.length;
    setSelectedSessionId(sessions[newIdx].passengerId);
    setAiAnalysisResult(null);
  };

  // Global Derived/Direct States representing active analytical environment
  const [userPersona, setUserPersona] = useState<UserPersona>(DEFAULT_USER_PERSONA);
  const [currentSession, setCurrentSession] = useState<CurrentSession>(DEFAULT_CURRENT_SESSION);
  const [past30Days, setPast30Days] = useState<Past30DaysData>(DEFAULT_PAST_30_DAYS);
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>(INITIAL_VEHICLE_OPTIONS);

  // AI Loading & Result states
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Derive everything whenever active session ID or the full sessions array changes
  useEffect(() => {
    const active = sessions.find((s) => s.passengerId === selectedSessionId);
    if (!active) return;

    // 1. Sync vehicles
    setVehicleOptions(active.vehicles);

    // 2. Parse History Raw
    const parsedRides = parseHistoryRaw(active.historyRaw);
    const totalSpent = parsedRides.reduce((sum, r) => sum + r.fare, 0);
    const categoryDistribution = calculateCategoryDistribution(parsedRides);
    const pastData: Past30DaysData = {
      totalRides: parsedRides.length,
      totalSpent: Number(totalSpent.toFixed(1)),
      avgDiscountRate: 0.15,
      avgDistance: Number((parsedRides.reduce((sum, r) => sum + (active.distanceKm || 8), 0) / (parsedRides.length || 1)).toFixed(1)),
      preferredVehicle: parsedRides[0]?.vehicleType || '特惠快车',
      dailyTrend: parsedRides.map((r) => ({
        date: r.date.substring(5) || '06-25',
        spent: r.fare,
        rides: 1
      })),
      categoryDistribution,
      rides: parsedRides
    };
    setPast30Days(pastData);

    // 3. Form User Persona
    const persona: UserPersona = {
      userId: active.passengerId,
      age: parseInt(active.age) || 30,
      gender: active.gender || '男',
      occupation: '出行乘车用户',
      vipLevel: '黄金会员',
      priceSensitivity: active.vehicles.some(v => v.price < 20) ? 8 : 5,
      comfortPreference: active.vehicles.some(v => v.category === 'comfort') ? 7 : 4,
      frequency: parsedRides.length > 5 ? '高频出行 (每周5次以上)' : '中频出行 (每周2-3次)',
      labels: [
        `地区: ${active.city || '未知'}`,
        `性别: ${active.gender}`,
        `年龄段: ${active.age}岁`,
        `应答率敏感: ${active.estimatedAcceptRate || '普通'}`
      ],
      averageRating: 4.85,
      preRideCompareTimeSec: 45,
      city: active.city,
      historyRaw: active.historyRaw
    };
    setUserPersona(persona);

    // 4. Set Current Session with chronological playback from call/reply times!
    const events: SessionEvent[] = [];
    events.push({
      id: `evt_init`,
      time: active.bubbleTime ? active.bubbleTime.split(' ')[1] || '01:46:00' : '01:46:00',
      eventType: 'view',
      description: `用户进入打车起终点确认。起点: ${active.startLocation} (场景: ${active.startScene})，终点: ${active.endLocation} (场景: ${active.endScene})。预估距离: ${active.distanceKm} km。`
    });

    active.vehicles.forEach((v) => {
      if (v.callTime) {
        events.push({
          id: `evt_call_${v.id}`,
          time: v.callTime.split(' ')[1] || v.callTime,
          eventType: 'call_order',
          description: `用户发起呼叫：【${v.name}】，券后预估价格为 ¥${v.price}，触发联合呼叫动作。`
        });
      }
      if (v.replyTime) {
        events.push({
          id: `evt_reply_${v.id}`,
          time: v.replyTime.split(' ')[1] || v.replyTime,
          eventType: 'select_vehicle',
          description: `司机应答接单：车型【${v.name}】于 ${v.replyTime} 做出应答，匹配成功。`
        });
      }
    });

    events.sort((a, b) => a.time.localeCompare(b.time));

    const sess: CurrentSession = {
      sessionId: `SES-${active.passengerId}`,
      timestamp: active.bubbleTime || new Date().toISOString(),
      startLocation: active.startLocation,
      endLocation: active.endLocation,
      distanceKm: active.distanceKm,
      durationMin: Math.ceil(active.distanceKm * 1.8) || 15,
      weather: '晴天',
      timeSlot: active.bubbleTime ? (parseInt(active.bubbleTime.split(' ')[1]?.split(':')[0]) < 6 || parseInt(active.bubbleTime.split(' ')[1]?.split(':')[0]) > 22 ? '夜间时段' : '普通时段') : '普通时段',
      deviceType: '打车客户端',
      userChoices: active.vehicles.filter((v) => v.checked).map((v) => v.name),
      bubbleTime: active.bubbleTime,
      estimatedAcceptRate: active.estimatedAcceptRate,
      startScene: active.startScene,
      endScene: active.endScene,
      sessionEvents: events,
      callTime: active.callTime,
      replyTime: active.replyTime,
      orderStatus: active.orderStatus
    };
    setCurrentSession(sess);

  }, [selectedSessionId, sessions]);

  // Append a customized chronological tracking event to the active session
  const handleAddEvent = (eventType: SessionEvent['eventType'], description: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newEvent: SessionEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      time: timeStr,
      eventType,
      description
    };

    setCurrentSession((prev) => ({
      ...prev,
      sessionEvents: [newEvent, ...prev.sessionEvents] // Newest logs stacked on top
    }));
  };

  // Toggle vehicle checkboxes inside the phone simulator
  const handleToggleVehicle = (id: string) => {
    setVehicleOptions((prev) =>
      prev.map((v) => (v.id === id ? { ...v, checked: !v.checked } : v))
    );
    // Sync back to sessions list to persist across toggle & preserve React state updates
    setSessions((prev) =>
      prev.map((s) => {
        if (s.passengerId === selectedSessionId) {
          return {
            ...s,
            vehicles: s.vehicles.map((v) =>
              v.id === id ? { ...v, checked: !v.checked } : v
            )
          };
        }
        return s;
      })
    );
  };

  // Sync state variables once Excel file is fully processed
  const handleDataImported = (importedData: {
    sessions?: ParsedExcelSession[];
    persona?: UserPersona;
    session?: Partial<CurrentSession>;
    history?: Past30DaysData;
  }) => {
    if (importedData.sessions && importedData.sessions.length > 0) {
      setSessions(importedData.sessions);
      setSelectedSessionId(importedData.sessions[0].passengerId);
    } else {
      if (importedData.persona) {
        setUserPersona(importedData.persona);
      }
      if (importedData.session) {
        setCurrentSession((prev) => ({
          ...prev,
          ...importedData.session,
          sessionEvents: [
            {
              id: `evt_import_${Date.now()}`,
              time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
              eventType: 'view',
              description: `成功通过 Excel 文件重新部署导入会话参数。新起点为：【${importedData.session.startLocation}】，终点为：【${importedData.session.endLocation}】。`
            }
          ]
        }));
      }
      if (importedData.history) {
        setPast30Days(importedData.history);
      }
    }
    // Clear old AI outputs to avoid confusion under new datasets
    setAiAnalysisResult(null);
  };

  // Post analytics payload to full-stack Express server to run Gemini behavior algorithms
  const handleTriggerAIAnalysis = async (): Promise<string | null> => {
    setIsAiLoading(true);
    setAiAnalysisResult(null);

    // Capture currently ticked vehicles list on the simulator
    const chosenModels = vehicleOptions.filter((v) => v.checked).map((v) => `${v.name} (¥${v.price})`);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          persona: userPersona,
          session: {
            ...currentSession,
            userChoices: chosenModels
          },
          history: past30Days
        })
      });

      if (!response.ok) {
        throw new Error(`API analysis failed with server code ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAiAnalysisResult(data.result);
      return data.result;
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      alert(`AI 决策诊断服务出错：${err.message || '网络通讯受阻'}`);
      return null;
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50/50 text-slate-900 pb-12 antialiased">
      {/* Dynamic Session Switcher Bar */}
      <div className="bg-slate-100 border-b border-slate-200 py-3 px-6 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-xs font-bold text-slate-500 shrink-0">当前分析会话 (Session):</span>
            
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs shrink-0">
              <button
                onClick={handlePrevSession}
                disabled={sessions.length <= 1}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-slate-50 rounded-md disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 cursor-pointer transition-colors shrink-0"
                title="上一个乘客"
                id="btn-prev-session"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>上一个</span>
              </button>
              
              <div className="h-4 w-[1px] bg-slate-200 mx-1 shrink-0" />
              
              <div className="px-3 py-1 flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-400 font-mono">
                  [{currentIndex + 1} / {sessions.length}]
                </span>
                <span className="text-xs font-extrabold text-slate-800 font-mono select-all">
                  乘客ID: {selectedSessionId}
                </span>
                
                {/* Copy Button */}
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded-md text-slate-400 hover:text-orange-500 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shrink-0"
                  title="复制乘客ID"
                  id="btn-copy-session-id"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              
              <div className="h-4 w-[1px] bg-slate-200 mx-1 shrink-0" />
              
              <button
                onClick={handleNextSession}
                disabled={sessions.length <= 1}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-slate-50 rounded-md disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 cursor-pointer transition-colors shrink-0"
                title="下一个乘客"
                id="btn-next-session"
              >
                <span>下一个</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current Metadata Indicator */}
            {sessions[currentIndex] && (
              <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200/60 px-2.5 py-1 rounded-lg shadow-2xs shrink-0">
                👤 {sessions[currentIndex].city || '未知'} · {sessions[currentIndex].gender || '未知'} · {sessions[currentIndex].age || '未知'}岁
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-[11px] shrink-0">
            <span className="bg-orange-50 border border-orange-200 text-orange-700 font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
              📍 {currentSession.startLocation?.substring(0, 15)}... → {currentSession.endLocation?.substring(0, 15)}...
            </span>
            <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2.5 py-1 rounded-md font-mono">
              📏 {currentSession.distanceKm} km
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: SMART PHONE SIMULATOR (4 Columns on large screens) */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="flex flex-col items-center">
              {/* Simulator Header tag */}
              <div className="mb-2 text-center">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  📱 打车端交互模拟沙盒
                </span>
              </div>
              <PhoneSimulator
                vehicleOptions={vehicleOptions}
                onToggleVehicle={handleToggleVehicle}
                onAddEvent={handleAddEvent}
                startLocation={currentSession.startLocation}
                endLocation={currentSession.endLocation}
                distanceKm={currentSession.distanceKm}
                durationMin={currentSession.durationMin}
                startScene={currentSession.startScene}
                endScene={currentSession.endScene}
              />
              <p className="text-[10px] text-slate-400 text-center mt-3 max-w-[280px] leading-relaxed">
                💡 <b>提示</b>：点击列表中的车型复选框将动态模拟用户的选择行为，并自动生成比价轨迹日志
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: EXCEL IMPORTER + MULTI-TAB ANALYTICS (8 Columns on large screens) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Standard Multi-Sheet Excel Uploader */}
            <ExcelImporter
              onDataImported={handleDataImported}
              onAddEvent={(desc) => handleAddEvent('view', desc)}
            />

            {/* 2. Interactive Analytical Tabs (Persona, Live Logs, Recharts History, Gemini Report) */}
            <AnalyticsPanel
              userPersona={userPersona}
              currentSession={currentSession}
              past30Days={past30Days}
              vehicleOptions={vehicleOptions}
              onTriggerAI={handleTriggerAIAnalysis}
              aiAnalysisResult={aiAnalysisResult}
              isAiLoading={isAiLoading}
            />

          </div>
        </div>
      </main>
    </div>
  );
}
