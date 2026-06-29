/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Upload, Download, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { UserPersona, CurrentSession, HistoricalRide, Past30DaysData, ParsedExcelSession, VehicleOption } from '../types';

// Helper to convert any raw Excel cell date value to a standard YYYY-MM-DD HH:mm:ss format
const formatExcelDateValue = (val: any): string => {
  if (val === undefined || val === null) return '';
  
  // If it's a JS Date object
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      const year = val.getFullYear();
      const month = String(val.getMonth() + 1).padStart(2, '0');
      const day = String(val.getDate()).padStart(2, '0');
      const hours = String(val.getHours()).padStart(2, '0');
      const minutes = String(val.getMinutes()).padStart(2, '0');
      const seconds = String(val.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  }

  // If it's a number and could be an Excel date serial number (typically between 30000 and 60000)
  const num = Number(val);
  if (!isNaN(num) && num > 30000 && num < 60000) {
    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Otherwise, handle as string
  let str = String(val).trim();
  
  if (str.includes('T') && !isNaN(Date.parse(str))) {
    const parsed = new Date(str);
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    const hours = String(parsed.getHours()).padStart(2, '0');
    const minutes = String(parsed.getMinutes()).padStart(2, '0');
    const seconds = String(parsed.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  return str;
};

interface ExcelImporterProps {
  onDataImported: (data: {
    persona?: UserPersona;
    session?: Partial<CurrentSession>;
    history?: Past30DaysData;
    sessions?: ParsedExcelSession[];
  }) => void;
  onAddEvent: (description: string) => void;
}

export default function ExcelImporter({ onDataImported, onAddEvent }: ExcelImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  // Generate and download a perfectly structured Excel template for the user
  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();

      const headers = [
        "乘客属性-乘客ID", "冒泡主键-冒", "冒泡主键-预", "车型", "展示顺序", 
        "是否首屏曝光", "是否推荐区", "是否默勾", "预估应答率", "冒泡时间", 
        "呼叫时间", "应答时间", "订单状态", "券后价, 单位:分", "乘客属性-订单距离", 
        "出发地地址", "目的地地址", "起点场景", "终点场景", "年龄（段）", 
        "性别", "城市", "历史订单"
      ];

      const rows = [
        headers,
        [
          "c448d6e66a", "17e744d5de", "0.9-1.0", "普通快车", 1, 1, 1, 1, "0.9-1.0", "2026-06-25 01:46:00", 
          "2026-06-25 01:47:21", null, "5", 2880, 8003, 
          "不会飞的烧鸟(华星新村店)", "远洋公寓东区-西北门", "休闲娱乐·餐饮", "工作区域·公司", "42", "男", "杭州市",
          "[2026/06/11 03:26:15***0.9...***特惠快车]\n[2026/06/24 13:19:55***普通快车]"
        ],
        [
          "c448d6e66a", "5122e8e8cc", "0.9-1.0", "特惠出租车", 2, 1, 1, 0, "0.9-1.0", "2026-06-25 01:46:00", 
          null, null, "-", 2720, 8003, 
          "不会飞的烧鸟(华星新村店)", "远洋公寓东区-西北门", "休闲娱乐·餐饮", "工作区域·公司", "42", "男", "杭州市",
          "[2026/06/11 03:26:15***0.9...***特惠快车]\n[2026/06/24 13:19:55***普通快车]"
        ],
        [
          "c448d6e66a", "e4fecac12b", "0.9-1.0", "线上让补_补", 2, 1, 1, 1, "0.9-1.0", "2026-06-25 01:46:00", 
          "2026-06-25 01:47:21", null, "5", 2923, 8003, 
          "不会飞的烧鸟(华星新村店)", "远洋公寓东区-西北门", "休闲娱乐·餐饮", "工作区域·公司", "42", "男", "杭州市",
          "[2026/06/11 03:26:15***0.9...***特惠快车]\n[2026/06/24 13:19:55***普通快车]"
        ],
        [
          "c448d6e66a", "24c3cd72bd", "0.9-1.0", "普通快车", 3, 1, 1, 1, "0.9-1.0", "2026-06-25 01:46:00", 
          "2026-06-25 01:47:21", null, "5", 3203, 8003, 
          "不会飞的烧鸟(华星新村店)", "远洋公寓东区-西北门", "休闲娱乐·餐饮", "工作区域·公司", "42", "男", "杭州市",
          "[2026/06/11 03:26:15***0.9...***特惠快车]\n[2026/06/24 13:19:55***普通快车]"
        ],
        [
          "c448d6e66a", "5559569572", "0.9-1.0", "滴滴轻享专车", 4, 1, 1, 1, "0.9-1.0", "2026-06-25 01:46:00", 
          "2026-06-25 01:47:21", "2026-06-25 01:47:22", "5", 3290, 8003, 
          "不会飞的烧鸟(华星新村店)", "远洋公寓东区-西北门", "休闲娱乐·餐饮", "工作区域·公司", "42", "男", "杭州市",
          "[2026/06/11 03:26:15***0.9...***特惠快车]\n[2026/06/24 13:19:55***普通快车]"
        ],
        [
          "c448d6e66a", "cac3d389bc", "0.9-1.0", "极速拼车", 5, 1, 1, 0, "0.9-1.0", "2026-06-25 01:46:00", 
          null, null, "-", 1470, 8003, 
          "不会飞的烧鸟(华星新村店)", "远洋公寓东区-西北门", "休闲娱乐·餐饮", "工作区域·公司", "42", "男", "杭州市",
          "[2026/06/11 03:26:15***0.9...***特惠快车]\n[2026/06/24 13:19:55***普通快车]"
        ],
        [
          "c448d6e66a", "f96f92ba15", "0.9-1.0", "特惠快车15t", 6, 1, 1, 0, "0.9-1.0", "2026-06-25 01:46:00", 
          null, null, "-", 1730, 8003, 
          "不会飞的烧鸟(华星新村店)", "远洋公寓东区-西北门", "休闲娱乐·餐饮", "工作区域·公司", "42", "男", "杭州市",
          "[2026/06/11 03:26:15***0.9...***特惠快车]\n[2026/06/24 13:19:55***普通快车]"
        ],
        [
          "c448d6e66a", "fbf2fbcda3", "0.9-1.0", "特惠快车", 7, 1, 1, 0, "0.9-1.0", "2026-06-25 01:46:00", 
          null, null, "-", 2460, 8003, 
          "不会飞的烧鸟(华星新村店)", "远洋公寓东区-西北门", "休闲娱乐·餐饮", "工作区域·公司", "42", "男", "杭州市",
          "[2026/06/11 03:26:15***0.9...***特惠快车]\n[2026/06/24 13:19:55***普通快车]"
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = headers.map(() => ({ wch: 15 }));
      XLSX.utils.book_append_sheet(wb, ws, "出行时序决策日志");

      XLSX.writeFile(wb, "打车用户会话行为分析模版.xlsx");
      onAddEvent("用户下载了出行行为时序分析系统标准 Excel 数据模版。");
    } catch (err: any) {
      console.error(err);
      alert('模版生成失败，请稍后重试');
    }
  };

  // Process the uploaded Excel file binary
  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });

        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

        if (rows.length < 2) {
          throw new Error("工作表为空或行数不足！");
        }

        // Find the index of the header row (usually the first row containing keywords like "乘客ID" or "车型")
        let headerRowIdx = 0;
        for (let r = 0; r < Math.min(10, rows.length); r++) {
          const row = rows[r];
          if (row && row.some((cell: any) => {
            const str = String(cell || '').trim().toLowerCase();
            return str.includes('乘客id') || str.includes('乘客属性') || str.includes('车型') || str.includes('券后价');
          })) {
            headerRowIdx = r;
            break;
          }
        }

        const headers = rows[headerRowIdx].map((h: any) => String(h || '').trim());

        // Check format: Is it the single-sheet format from the screenshot?
        const isSingleSheetFormat = headers.some(h => 
          h.includes('乘客属性-乘客ID') || h.includes('乘客ID') || h.includes('车型') || h.includes('券后价') || h.includes('是否默勾')
        );

        if (isSingleSheetFormat) {
          // Find index of each column
          const findColIdx = (names: string[], fallback: number): number => {
            const idx = headers.findIndex(h => names.some(name => h.toLowerCase().includes(name.toLowerCase())));
            return idx !== -1 ? idx : fallback;
          };

          const passengerIdIdx = findColIdx(["乘客ID", "乘客属性-乘客ID", "乘客id", "用户id", "乘客属性_乘客id"], 0);
          const bubbleKeyIdx = findColIdx(["冒泡主键", "冒泡id", "主键"], 1);
          const vehicleIdx = findColIdx(["车型", "车型名称", "产品名称", "可用车型", "呼叫车型", "产品"], 3);
          const displayOrderIdx = findColIdx(["展示顺序", "顺序", "排序", "位置"], 4);
          const isFirstScreenIdx = findColIdx(["是否首屏曝光", "是否首屏", "首屏", "首屏曝光"], 5);
          const isRecommendIdx = findColIdx(["是否推荐区", "是否推荐", "推荐区", "推荐"], 6);
          const isDefaultCheckedIdx = findColIdx(["是否默勾", "是否默认勾选", "默勾", "默认勾选", "勾选"], 7);
          const estimatedAcceptRateIdx = findColIdx(["预估应答率", "应答率", "接受率", "接单率"], 8);
          const bubbleTimeIdx = findColIdx(["冒泡时间", "时间", "创建时间"], 9);
          const callTimeIdx = findColIdx(["呼叫时间", "呼叫时"], 10);
          const replyTimeIdx = findColIdx(["应答时间", "接单时间"], 11);
          const orderStatusIdx = findColIdx(["订单状态", "状态", "是否接单", "是否应答"], 12);
          const ticketPriceIdx = findColIdx(["券后价", "券后价, 单位:分", "实际支付", "价格", "金额"], 13);
          const distanceIdx = findColIdx(["订单距离", "乘客属性-订单距离", "距离", "里程", "公里数"], 14);
          const startLocationIdx = findColIdx(["出发地地址", "起点", "起点位置", "起点地址"], 15);
          const endLocationIdx = findColIdx(["目的地地址", "终点", "终点位置", "终点地址"], 16);
          const startSceneIdx = findColIdx(["起点场景", "出发场景"], 17);
          const endSceneIdx = findColIdx(["终点场景", "目的地场景", "到达场景"], 18);
          const ageIdx = findColIdx(["年龄", "年龄段", "年龄（段）"], 19);
          const genderIdx = findColIdx(["性别"], 20);
          const cityIdx = findColIdx(["城市", "注册城市"], 21);
          const historyRawIdx = findColIdx(["历史订单", "历史订单轨迹"], 22);

          // Group rows by PassengerID with fill-down for merged cells
          const groups: { [passengerId: string]: any[] } = {};
          let lastSeenPid = '';
          for (let i = headerRowIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            let pid = String(row[passengerIdIdx] || '').trim();
            if (!pid || pid === 'null' || pid === 'undefined') {
              pid = lastSeenPid;
            } else {
              lastSeenPid = pid;
            }
            if (!pid) continue;
            if (!groups[pid]) groups[pid] = [];
            groups[pid].push(row);
          }

          const parsedSessions: ParsedExcelSession[] = Object.keys(groups).map((pid) => {
            const groupRows = groups[pid];

            // Helper to get first non-empty value of a column within this group (handles merged cells robustly)
            const findFirstNonEmpty = (colIdx: number, defaultValue: string = ''): string => {
              for (const row of groupRows) {
                const val = String(row[colIdx] || '').trim();
                if (val && val !== 'null' && val !== 'undefined') return val;
              }
              return defaultValue;
            };

            // Map vehicle options
            const vehicles: VehicleOption[] = groupRows
              .map((row, index) => {
                const vehicleName = String(row[vehicleIdx] || '').trim();
                if (!vehicleName || vehicleName === 'null' || vehicleName === 'undefined') {
                  return null;
                }
                const ticketPriceVal = Number(row[ticketPriceIdx] || 0);
                let priceYuan = ticketPriceVal;
                // Auto-detect if price is in cents or yuan
                const headerName = headers[ticketPriceIdx] || '';
                if (headerName.includes('分') || ticketPriceVal > 200) {
                  priceYuan = Number((ticketPriceVal / 100).toFixed(2));
                }
                const isRec = Number(row[isRecommendIdx]) === 1;
                const isDefChecked = Number(row[isDefaultCheckedIdx]) === 1;
                const cTime = row[callTimeIdx] ? formatExcelDateValue(row[callTimeIdx]) : null;
                const rTime = row[replyTimeIdx] ? formatExcelDateValue(row[replyTimeIdx]) : null;

                // Derive suitable category based on Column G (是否推荐区)
                const cat: VehicleOption['category'] = isRec ? 'recommend' : 'more';

                return {
                  id: `veh_${pid}_${index}_${Math.random().toString(36).substr(2, 4)}`,
                  name: vehicleName,
                  category: cat,
                  priceDesc: isDefChecked ? '默认勾选' : '未勾选',
                  price: priceYuan,
                  checked: isDefChecked,
                  callTime: cTime && cTime !== 'null' && cTime !== '' ? cTime : null,
                  replyTime: rTime && rTime !== 'null' && rTime !== '' ? rTime : null,
                  isFirstScreen: Number(row[isFirstScreenIdx]) === 1,
                  displayOrder: Number(row[displayOrderIdx] || 1)
                } as VehicleOption;
              })
              .filter((v): v is VehicleOption => v !== null);

            // Distance & Details
            let distMeters = 0;
            for (const row of groupRows) {
              const val = Number(row[distanceIdx] || 0);
              if (val > 0) {
                distMeters = val;
                break;
              }
            }
            
            let distKm = distMeters;
            const distHeader = headers[distanceIdx] || '';
            if (distHeader.includes('米') || distMeters > 100) {
              distKm = Number((distMeters / 1000).toFixed(2));
            } else {
              distMeters = distMeters * 1000;
            }

            const startLocation = findFirstNonEmpty(startLocationIdx, '出发地地址未知');
            const endLocation = findFirstNonEmpty(endLocationIdx, '目的地地址未知');
            const startScene = findFirstNonEmpty(startSceneIdx, '未知起点场景');
            const endScene = findFirstNonEmpty(endSceneIdx, '未知终点场景');
            const bubbleTimeRaw = findFirstNonEmpty(bubbleTimeIdx, '');
            const bubbleTime = formatExcelDateValue(bubbleTimeRaw);
            const estimatedAcceptRate = findFirstNonEmpty(estimatedAcceptRateIdx, '');
            const age = findFirstNonEmpty(ageIdx, '未知');
            const gender = findFirstNonEmpty(genderIdx, '未知');
            const city = findFirstNonEmpty(cityIdx, '未知');
            const historyRaw = findFirstNonEmpty(historyRawIdx, '');

            const rawCallTime = findFirstNonEmpty(callTimeIdx, '');
            const callTime = rawCallTime ? formatExcelDateValue(rawCallTime) : '';
            const rawReplyTime = findFirstNonEmpty(replyTimeIdx, '');
            const replyTime = rawReplyTime ? formatExcelDateValue(rawReplyTime) : '';
            const orderStatus = findFirstNonEmpty(orderStatusIdx, '未知');

            return {
              passengerId: pid,
              startLocation,
              endLocation,
              startScene,
              endScene,
              distanceMeters: distMeters,
              distanceKm: distKm,
              bubbleTime,
              estimatedAcceptRate,
              age,
              gender,
              city,
              historyRaw,
              vehicles,
              callTime,
              replyTime,
              orderStatus
            };
          });

          if (parsedSessions.length === 0) {
            throw new Error("未能成功分组任何有效的乘客出行会话数据！");
          }

          // Deliver list of sessions to parent
          onDataImported({
            sessions: parsedSessions
          });

          setImportStatus({
            type: 'success',
            message: `成功解析了打车会话表格！共导入了 ${parsedSessions.length} 个乘客的出行会话轨迹（共 ${rows.length - 1} 行车型曝光比价数据）。`
          });
          onAddEvent(`用户上传了高精时序打车数据 Excel，解析成功：检测到 ${parsedSessions.length} 个打车会话，正在开始回放。`);

        } else {
          // Standard three-sheet parse mode as fallback
          let parsedPersona: UserPersona | undefined;
          let parsedSession: Partial<CurrentSession> | undefined;
          let parsedHistory: Past30DaysData | undefined;

          // 1. Parse Persona Sheet
          const personaSheet = workbook.Sheets["用户画像"] || workbook.Sheets[workbook.SheetNames[0]];
          if (personaSheet) {
            const personaRows = XLSX.utils.sheet_to_json<any[]>(personaSheet, { header: 1 });
            const tempPersona: Partial<UserPersona> = { labels: [] };
            
            personaRows.forEach((row: any) => {
              if (!row || row.length < 2) return;
              const key = String(row[0]).trim();
              const val = row[1];

              if (key === '用户ID') tempPersona.userId = String(val);
              else if (key === '年龄') tempPersona.age = Number(val);
              else if (key === '性别') tempPersona.gender = String(val);
              else if (key === '职业') tempPersona.occupation = String(val);
              else if (key === 'VIP等级') tempPersona.vipLevel = String(val);
              else if (key === '价格敏感度') tempPersona.priceSensitivity = Math.min(10, Math.max(1, Number(val)));
              else if (key === '舒适度偏好') tempPersona.comfortPreference = Math.min(10, Math.max(1, Number(val)));
              else if (key === '打车频次') tempPersona.frequency = String(val);
              else if (key === '平均评分') tempPersona.averageRating = Number(val);
              else if (key === '比价耗时秒') tempPersona.preRideCompareTimeSec = Number(val);
              else if (key === '标签列表' || key === '标签') {
                tempPersona.labels = String(val).split(/[,，]/).map(t => t.trim()).filter(Boolean);
              }
            });

            if (tempPersona.userId) {
              parsedPersona = tempPersona as UserPersona;
            }
          }

          // 2. Parse Current Session Sheet
          const sessionSheet = workbook.Sheets["本次订单"] || workbook.Sheets["本次订单数据"];
          if (sessionSheet) {
            const data = XLSX.utils.sheet_to_json<any>(sessionSheet);
            if (data && data.length > 0) {
              const firstRow = data[0];
              parsedSession = {
                startLocation: firstRow["起点位置"] || firstRow["起点"] || '东亚上北小区12号楼',
                endLocation: firstRow["终点位置"] || firstRow["终点"] || '新橙海北停车场上车点',
                distanceKm: Number(firstRow["出行距离km"] || firstRow["距离km"] || 11),
                durationMin: Number(firstRow["行驶时长分钟"] || firstRow["时长"] || 17),
                weather: firstRow["天气状况"] || firstRow["天气"] || '晴天',
                timeSlot: firstRow["出行时段"] || firstRow["时间段"] || '普通时段',
                deviceType: firstRow["设备类型"] || 'iPhone 15 Pro'
              };
            }
          }

          // 3. Parse History Sheet
          const historySheet = workbook.Sheets["历史订单数据"] || workbook.Sheets["历史订单"] || workbook.Sheets["历史数据"];
          if (historySheet) {
            const data = XLSX.utils.sheet_to_json<any>(historySheet);
            if (data && data.length > 0) {
              const parsedRides: HistoricalRide[] = data.map((row: any, idx: number) => ({
                orderId: row["订单ID"] || `ORD-EX-${idx + 100}`,
                date: row["日期"] || '2026-06-28',
                time: row["具体时间"] || row["时间"] || '08:00',
                vehicleType: row["车型类型"] || row["车型"] || '特惠快车',
                fare: Number(row["实付车费"] || row["车费"] || 20),
                discount: Number(row["优惠金额"] || row["优惠"] || 0),
                rating: Number(row["行程评分"] || row["评分"] || 5),
                isCompleted: row["是否完结"] === '是' || row["是否完结"] === true,
                startLoc: row["行程起点"] || row["起点"] || '起点',
                endLoc: row["行程终点"] || row["终点"] || '终点'
              }));

              const totalRides = parsedRides.length;
              const totalSpent = parsedRides.reduce((sum, r) => sum + r.fare, 0);
              const totalBase = parsedRides.reduce((sum, r) => sum + r.fare + r.discount, 0);
              const avgDiscountRate = totalBase > 0 ? (parsedRides.reduce((sum, r) => sum + r.discount, 0) / totalBase) : 0.15;

              const counts: { [key: string]: number } = {};
              parsedRides.forEach(r => {
                counts[r.vehicleType] = (counts[r.vehicleType] || 0) + 1;
              });
              let preferredVehicle = '特惠快车';
              let maxCount = 0;
              Object.keys(counts).forEach(k => {
                if (counts[k] > maxCount) {
                  maxCount = counts[k];
                  preferredVehicle = k;
                }
              });

              const distribution = Object.keys(counts).map(name => ({ name, value: counts[name] }));
              const dateMap: { [key: string]: { spent: number; count: number } } = {};
              parsedRides.forEach(r => {
                const d = r.date.substring(5);
                if (!dateMap[d]) dateMap[d] = { spent: 0, count: 0 };
                dateMap[d].spent += r.fare;
                dateMap[d].count += 1;
              });
              const dailyTrend = Object.keys(dateMap).sort().map(date => ({
                date,
                spent: Number(dateMap[date].spent.toFixed(1)),
                rides: dateMap[date].count
              }));

              parsedHistory = {
                totalRides,
                totalSpent: Number(totalSpent.toFixed(1)),
                avgDiscountRate,
                avgDistance: 8.5,
                preferredVehicle,
                dailyTrend,
                categoryDistribution: distribution,
                rides: parsedRides
              };
            }
          }

          onDataImported({
            persona: parsedPersona,
            session: parsedSession,
            history: parsedHistory
          });

          setImportStatus({
            type: 'success',
            message: '导入成功：成功解析并读取了标准多 Sheet 配置模板数据！'
          });
          onAddEvent(`用户上传了标准多 Sheet 打车数据 Excel。`);
        }
      } catch (err: any) {
        console.error(err);
        setImportStatus({ type: 'error', message: `解析失败: ${err.message || '表格数据格式不兼容，请参照标准数据模板格式'}` });
        onAddEvent(`用户尝试上传Excel但发生解析错误：${err.message || '未知异常'}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processExcelFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        processExcelFile(file);
      } else {
        setImportStatus({ type: 'error', message: '仅支持上传 Excel (.xlsx / .xls) 文件格式！' });
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="excel-importer-container" className="bg-white rounded-xl border border-slate-100 p-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-slate-800">数据文件导入</span>
        </div>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            id="excel-upload-btn"
            onClick={triggerFileSelect}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            上传文件
          </button>
        </div>
      </div>

      {/* Upload Status Bar */}
      {importStatus.type !== 'idle' && (
        <div
          id="import-status-bar"
          className={`mt-2.5 p-2 rounded-lg border flex items-center gap-2 transition-all text-[10px] ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-red-50 border-red-100 text-red-800'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-extrabold">{importStatus.type === 'success' ? '导入成功' : '导入失败'}</p>
            <p className="text-[9px] text-slate-600 truncate mt-0.5" title={importStatus.message}>
              {importStatus.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
