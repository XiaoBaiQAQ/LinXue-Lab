/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserPersona {
  userId: string;
  age: number | string;
  gender: string;
  occupation: string;
  vipLevel: string; // e.g., V6, V7, 普通
  priceSensitivity: number; // 1-10, where 10 is extremely sensitive to pricing/discounts
  comfortPreference: number; // 1-10, where 10 is high comfort requirement
  frequency: string; // e.g., 每天出行, 每周数次, 偶尔出行
  labels: string[]; // e.g., ["羊毛党", "商务出行", "通勤首选", "夜间出行"]
  averageRating: number; // User rating given to drivers, e.g. 4.85
  preRideCompareTimeSec: number; // Average time spent comparing prices before booking
  city?: string; // Column V
  historyRaw?: string; // Column W
}

export interface CurrentSession {
  sessionId: string;
  timestamp: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  durationMin: number;
  weather: string;
  timeSlot: string;
  deviceType: string;
  userChoices: string[]; // List of vehicle IDs selected simultaneously
  sessionEvents: SessionEvent[];
  startScene?: string; // Column R
  endScene?: string; // Column S
  bubbleTime?: string; // Column J
  estimatedAcceptRate?: string; // Column I
  callTime?: string; // Column K
  replyTime?: string; // Column L
  orderStatus?: string; // Column M
}

export interface SessionEvent {
  id: string;
  time: string;
  eventType: 'view' | 'click_vehicle' | 'select_vehicle' | 'deselect_vehicle' | 'change_category' | 'expand_details' | 'call_order';
  description: string;
}

export interface VehicleOption {
  id: string;
  name: string;
  category: 'recommend' | 'more';
  priceDesc: string; // e.g. 一口价, 固定价, 拼成
  price: number;
  originalPrice?: number;
  discountDesc?: string;
  subLabel?: string;
  waitingDesc?: string;
  checked: boolean;
  tag?: string; // e.g. V6-¥4.6
  callTime?: string | null; // Column K
  replyTime?: string | null; // Column L
  isFirstScreen?: boolean; // Column F
  displayOrder?: number; // Column E
}

export interface HistoricalRide {
  orderId: string;
  date: string;
  time: string;
  vehicleType: string;
  fare: number;
  discount: number;
  rating: number; // User's rating for this ride
  isCompleted: boolean;
  startLoc: string;
  endLoc: string;
  acceptRate?: string;          // 应答率
  startDistrict?: string;       // 起点区县
  startDetail?: string;         // 起点详细地址
  endDistrict?: string;         // 终点区县
  endDetail?: string;           // 终点详细地址
  distanceKm?: number;          // 订单距离
  defaultChecked?: string[];     // 本次冒泡默认勾
  addedChecked?: string[];       // 加勾
  removedChecked?: string[];     // 减勾
}

export interface Past30DaysData {
  totalRides: number;
  totalSpent: number;
  avgDiscountRate: number;
  avgDistance: number;
  preferredVehicle: string;
  dailyTrend: { date: string; spent: number; rides: number }[];
  categoryDistribution: { name: string; value: number }[];
  rides: HistoricalRide[];
}

export interface ParsedExcelSession {
  passengerId: string;
  startLocation: string; // P
  endLocation: string; // Q
  startScene: string; // R
  endScene: string; // S
  distanceMeters: number; // O
  distanceKm: number; // O / 1000
  bubbleTime: string; // J
  estimatedAcceptRate: string; // I
  age: string | number; // T
  gender: string; // U
  city: string; // V
  historyRaw: string; // W
  vehicles: VehicleOption[];
  callTime?: string; // K
  replyTime?: string; // L
  orderStatus?: string; // M
}
