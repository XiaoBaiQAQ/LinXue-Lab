/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VehicleOption, SessionEvent } from '../types';
import { ChevronLeft, Compass, Shield, Navigation2, MoreHorizontal, HelpCircle, Settings, TrendingUp } from 'lucide-react';

interface PhoneSimulatorProps {
  vehicleOptions: VehicleOption[];
  onToggleVehicle: (id: string) => void;
  onAddEvent: (eventType: SessionEvent['eventType'], description: string) => void;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  durationMin: number;
  startScene?: string;
  endScene?: string;
}

export default function PhoneSimulator({
  vehicleOptions,
  onToggleVehicle,
  onAddEvent,
  startLocation,
  endLocation,
  distanceKm,
  durationMin,
  startScene,
  endScene
}: PhoneSimulatorProps) {
  const [activeCategory, setActiveCategory] = useState<'recommend' | 'more'>('recommend');

  // Define sidebar categories
  const categories: { id: typeof activeCategory; label: string }[] = [
    { id: 'recommend', label: '推荐' },
    { id: 'more', label: '更多' }
  ];

  const handleCategoryChange = (catId: typeof activeCategory) => {
    setActiveCategory(catId);
    const catLabel = categories.find(c => c.id === catId)?.label || '';
    onAddEvent('change_category', `用户切换车型分类到: 【${catLabel}】`);
  };

  const handleVehicleClick = (v: VehicleOption) => {
    onToggleVehicle(v.id);
    const action = !v.checked ? '勾选' : '取消勾选';
    onAddEvent(
      !v.checked ? 'select_vehicle' : 'deselect_vehicle',
      `用户${action}了【${v.name}】（当前价格: ¥${v.price}，预估类型: ${v.priceDesc}）`
    );
  };

  const handleCallNow = (v: VehicleOption, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddEvent('call_order', `用户直接点击【${v.name}】的“去呼叫”按钮，发起专属呼叫。`);
    alert(`[模拟事件] 正在单独呼叫: ${v.name}，价格: ¥${v.price}`);
  };

  const handleImmediateRide = () => {
    const selectedVehicles = vehicleOptions.filter(v => v.checked).map(v => v.name);
    if (selectedVehicles.length === 0) {
      alert('请至少勾选一种车型再打车！');
      onAddEvent('call_order', '用户点击“立即打车”，但由于未勾选任何车型，系统提示阻断。');
      return;
    }
    onAddEvent('call_order', `用户最终点击【立即打车】，联合呼叫车型: ${selectedVehicles.join(', ')}`);
    alert(`[呼叫成功] 正在帮您联合呼叫: ${selectedVehicles.join('、')}！等候附近司机接单。`);
  };

  // Calculate dynamic bottom price based on selected items
  const checkedVehicles = vehicleOptions.filter(v => v.checked);
  let priceText = '19-27';
  if (checkedVehicles.length > 0) {
    const prices = checkedVehicles.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    priceText = minPrice === maxPrice ? `${minPrice.toFixed(1)}` : `${minPrice.toFixed(1)}-${maxPrice.toFixed(1)}`;
  } else {
    priceText = '0.0';
  }

  // Visual helper to draw custom car SVGs
  const renderCarSvg = (id: string) => {
    switch (id) {
      case 'didi_bus':
        return (
          <svg className="w-10 h-7 text-teal-600" viewBox="0 0 40 24" fill="currentColor">
            <rect x="4" y="6" width="30" height="13" rx="3" />
            <rect x="8" y="8" width="8" height="5" fill="#fff" />
            <rect x="18" y="8" width="6" height="5" fill="#fff" />
            <rect x="26" y="8" width="6" height="5" fill="#fff" />
            <circle cx="10" cy="20" r="3" fill="#333" />
            <circle cx="28" cy="20" r="3" fill="#333" />
            <rect x="34" y="10" width="3" height="5" rx="1" fill="#bbb" />
          </svg>
        );
      case 'six_seat_premium':
        return (
          <svg className="w-11 h-7 text-slate-800" viewBox="0 0 40 24" fill="currentColor">
            <path d="M4 14V9a2 2 0 012-2h24a4 4 0 014 4v3a2 2 0 01-2 2H4z" />
            <path d="M6 14h26a1 1 0 001-1V10H5v3a1 1 0 001 1z" fill="#334155" />
            <rect x="9" y="8" width="10" height="4" fill="#fff" opacity="0.8" />
            <rect x="21" y="8" width="9" height="4" fill="#fff" opacity="0.8" />
            <circle cx="11" cy="18" r="3" fill="#1e293b" />
            <circle cx="27" cy="18" r="3" fill="#1e293b" />
          </svg>
        );
      default:
        // Regular sedans
        return (
          <svg className="w-11 h-7 text-neutral-500" viewBox="0 0 40 24" fill="currentColor">
            <path d="M2 14c0-1.5 1-4 3-5s8-2 15-2 14 1 16 3a4 4 0 012 4v2H2v-2z" />
            <rect x="18" y="9" width="8" height="4" fill="#fff" opacity="0.9" />
            <rect x="8" y="9" width="8" height="4" fill="#fff" opacity="0.9" />
            <circle cx="10" cy="18" r="3" fill="#222" />
            <circle cx="28" cy="18" r="3" fill="#222" />
          </svg>
        );
    }
  };

  return (
    <div className="w-[375px] h-[780px] bg-neutral-100 rounded-[40px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative font-sans text-xs select-none">
      {/* Phone Status Bar Simulation */}
      <div className="bg-white h-7 px-6 pt-1 flex justify-between items-center text-[10px] text-black font-semibold shrink-0 z-20">
        <span>20:38</span>
        {/* Dynamic Island Pin */}
        <div className="w-20 h-4 bg-black rounded-full absolute left-1/2 transform -translate-x-1/2 top-1.5"></div>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
          </svg>
          <span>5G</span>
          <div className="w-5 h-2.5 border border-black rounded-sm p-0.5 flex items-center">
            <div className="w-full h-full bg-black rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Map Segment / Viewport Top */}
      <div className="h-[220px] bg-emerald-50 relative overflow-hidden flex-none">
        {/* Simple Simulated Map Canvas */}
        <div className="absolute inset-0 opacity-40">
          {/* Mock Grid Lines / Road layout */}
          <div className="absolute top-10 left-0 right-0 h-4 bg-emerald-100 transform -rotate-12"></div>
          <div className="absolute top-28 left-0 right-0 h-6 bg-emerald-100 transform rotate-6"></div>
          <div className="absolute top-0 bottom-0 left-20 w-5 bg-emerald-100 transform rotate-45"></div>
          <div className="absolute top-0 bottom-0 left-64 w-4 bg-emerald-100 transform -rotate-45"></div>
          <div className="absolute top-1/2 left-10 w-40 h-40 border-4 border-emerald-100 rounded-full"></div>
        </div>

        {/* Dynamic Route Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 375 220">
          <path
            d="M 120 180 Q 200 130 190 90 T 240 40"
            fill="none"
            stroke="#10b981"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 120 180 Q 200 130 190 90 T 240 40"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        </svg>

        {/* Back and Safety Overlays */}
        <button 
          id="btn-phone-back"
          onClick={() => onAddEvent('view', '用户点击模拟器左上角返回按钮')}
          className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-neutral-700 hover:bg-neutral-50"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Shield Icon & Compass Overlays */}
        <div className="absolute bottom-16 left-3 flex flex-col gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg text-white">
            <Shield className="w-4 h-4 fill-white" />
          </div>
        </div>

        <div className="absolute bottom-16 right-3 flex flex-col gap-1.5">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-slate-700">
            <Compass className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-slate-700">
            <Navigation2 className="w-4 h-4 rotate-45" />
          </div>
        </div>

        {/* Simulated Combined Route-Scene Card Overlay (P+R and Q+S) */}
        <div className="absolute top-11 left-3 right-3 bg-white p-2.5 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-1.5 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <div className="overflow-hidden min-w-0 flex-1 text-left">
              <span className="text-[8px] text-neutral-400 font-extrabold uppercase">起点 (P+R列):</span>
              <p className="font-extrabold text-[10px] text-neutral-800 truncate leading-tight">
                {startLocation} <span className="text-orange-500 font-bold ml-1 text-[8px] bg-orange-50 px-1 py-0.2 rounded-sm">({startScene || '餐饮'})</span>
              </p>
            </div>
          </div>
          <div className="h-[1px] bg-neutral-100/60"></div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
            <div className="overflow-hidden min-w-0 flex-1 text-left">
              <span className="text-[8px] text-neutral-400 font-extrabold uppercase">终点 (Q+S列):</span>
              <p className="font-extrabold text-[10px] text-neutral-800 truncate leading-tight">
                {endLocation} <span className="text-indigo-500 font-bold ml-1 text-[8px] bg-indigo-50 px-1 py-0.2 rounded-sm">({endScene || '公司'})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Commute Tag */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[8px] font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
          时间快 {distanceKm}公里 {durationMin}分钟
        </div>
      </div>

      {/* Ride-Hailing Selection Workspace */}
      <div className="bg-white rounded-t-3xl -mt-4 flex-1 flex flex-col overflow-hidden relative z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-16">
        {/* Promotion Header banner */}
        <div className="px-4 py-2.5 bg-linear-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex justify-between items-center shrink-0">
          <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
            <span className="text-orange-500 font-mono">7秒内</span>有车，附近车多马上走
          </span>
          <div 
            onClick={() => onAddEvent('expand_details', '用户点击自选司机按钮查看推荐司机详情')}
            className="text-[9px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex items-center cursor-pointer hover:bg-orange-200 transition-colors"
          >
            📋 自选司机 &gt;
          </div>
        </div>

        {/* Split Layout: Sidebar of categories + vehicle main scrolling list */}
        <div className="flex flex-1 overflow-hidden">
          {/* Vertical Navigation Sidebar */}
          <div className="w-[52px] border-r border-neutral-100 bg-neutral-50/50 flex flex-col shrink-0 py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`w-full py-3.5 text-center font-bold relative flex flex-col items-center justify-center transition-all ${
                  activeCategory === cat.id
                    ? 'text-neutral-900 scale-105'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {activeCategory === cat.id && (
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[3px] h-6 bg-orange-500 rounded-r-full"></span>
                )}
                <span className="text-[11px] tracking-wider writing-mode-vertical">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Scrolling Vehicles List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 max-h-[380px]">
            {vehicleOptions
              .filter(v => v.category === activeCategory)
              .map((v) => (
                <div
                  key={v.id}
                  onClick={() => handleVehicleClick(v)}
                  className={`border rounded-xl p-2.5 transition-all cursor-pointer flex items-center gap-2 ${
                    v.checked
                      ? 'bg-orange-50/40 border-orange-200 ring-1 ring-orange-200/50'
                      : 'bg-white border-neutral-100 hover:border-neutral-200 shadow-2xs'
                  }`}
                >
                  {/* Car Image Placeholder representing type */}
                  <div className="shrink-0">
                    {renderCarSvg(v.id)}
                  </div>

                  {/* Core Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className={`font-bold text-[11px] truncate ${
                        v.replyTime ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 font-extrabold' :
                        v.callTime ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100 font-extrabold' :
                        'text-neutral-800'
                      }`}>
                        {v.name}
                      </span>
                      {v.displayOrder !== undefined && (
                        <span className="text-[8px] font-black font-mono w-3.5 h-3.5 flex items-center justify-center bg-slate-100/80 text-slate-500 rounded-full border border-slate-200/50 shrink-0 select-none" title={`展示顺序: ${v.displayOrder}`}>
                          {v.displayOrder}
                        </span>
                      )}
                      {v.waitingDesc && (
                        <span className="text-[8px] bg-neutral-100 text-neutral-500 px-1 rounded">
                          {v.waitingDesc}
                        </span>
                      )}
                      {v.id === 'express_promo' && (
                        <span className="text-[8px] bg-red-50 text-red-500 border border-red-100 px-1 rounded scale-90 origin-left">
                          折
                        </span>
                      )}
                      {v.tag && (
                        <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1 rounded font-bold scale-95">
                          {v.tag}
                        </span>
                      )}
                    </div>
                    
                    {v.subLabel && (
                      <p className="text-[9px] text-neutral-400 mt-0.5 truncate">{v.subLabel}</p>
                    )}
                  </div>

                  {/* Price & Checked state */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[8px] text-neutral-400">{v.priceDesc}</span>
                      <span className="text-[12px] font-bold text-neutral-800">¥{v.price}</span>
                    </div>

                    {v.originalPrice && (
                      <span className="text-[8px] text-neutral-400 line-through">
                        ¥{v.originalPrice}
                      </span>
                    )}

                    {v.discountDesc && (
                      <span className="text-[8px] text-red-500 font-medium scale-90 origin-right">
                        {v.discountDesc}
                      </span>
                    )}

                    {/* Action element (Call now or Checked radio) */}
                    {v.id === 'didi_bus' ? (
                      <button
                        onClick={(e) => handleCallNow(v, e)}
                        className="bg-red-500 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full hover:bg-red-600 transition-colors mt-0.5 scale-95"
                      >
                        去呼叫
                      </button>
                    ) : (
                      <div className="mt-1">
                        <div
                          className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                            v.checked
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {v.checked && (
                            <svg className="w-2.5 h-2.5 stroke-[3] stroke-current" viewBox="0 0 24 24" fill="none">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Bottom Floating Navigation (Absolute inside parent selection workspace, above action bar) */}
        <div className="absolute bottom-[56px] left-0 right-0 h-9 border-t border-neutral-100 bg-neutral-50 flex items-center justify-around text-[9px] text-neutral-500 shrink-0">
          <button 
            onClick={() => onAddEvent('expand_details', '用户点击“帮人叫车”功能')}
            className="flex items-center gap-0.5 hover:text-neutral-700 font-medium"
          >
            帮人叫车 &gt;
          </button>
          <span className="text-neutral-200">|</span>
          <button 
            onClick={() => onAddEvent('expand_details', '用户展开“偏好设置”面板')}
            className="flex items-center gap-0.5 hover:text-neutral-700 font-medium"
          >
            偏好设置 &gt;
          </button>
          <span className="text-neutral-200">|</span>
          <button 
            onClick={() => onAddEvent('expand_details', '用户查看当前路线的“行程预测”价格与时间预测')}
            className="flex items-center gap-0.5 hover:text-neutral-700 font-medium"
          >
            行程预测 &gt;
          </button>
        </div>

        {/* Real Bottom Action Board */}
        <div className="absolute bottom-0 left-0 right-0 h-[56px] bg-slate-900 flex items-center justify-between px-3 z-30 shadow-[0_-2px_8px_rgba(0,0,0,0.15)]">
          <div className="text-white">
            <p className="text-[7px] text-slate-400 uppercase tracking-wider font-semibold">预估合计</p>
            <p className="text-[14px] font-extrabold text-white">
              <span className="text-[10px] font-normal mr-0.5">¥</span>
              {priceText}
            </p>
          </div>
          <button
            id="btn-phone-call-ride"
            onClick={handleImmediateRide}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-[12px] font-bold h-10 px-8 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
          >
            立即打车
          </button>
        </div>
      </div>
    </div>
  );
}
