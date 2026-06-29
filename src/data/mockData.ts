/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserPersona, CurrentSession, VehicleOption, Past30DaysData, ParsedExcelSession } from '../types';

export const INITIAL_VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'didi_bus',
    name: '滴滴小巴',
    category: 'recommend',
    priceDesc: '一口价',
    price: 13.0,
    subLabel: '站点拼车更便宜',
    checked: false
  },
  {
    id: 'surprise_promo',
    name: '惊喜特价',
    category: 'recommend',
    priceDesc: '固定价',
    price: 19.1,
    checked: true
  },
  {
    id: 'express_promo',
    name: '特惠快车',
    category: 'recommend',
    priceDesc: '固定价',
    price: 26.2,
    tag: 'V6-¥4.6',
    subLabel: '大家常选',
    waitingDesc: '7秒',
    checked: true
  },
  {
    id: 'carpool_promo',
    name: '特价拼车',
    category: 'recommend',
    priceDesc: '拼成价',
    price: 19.3,
    originalPrice: 22.5,
    discountDesc: '最高优惠¥4.8',
    checked: false
  },
  {
    id: 'express_carpool',
    name: '极速拼车',
    category: 'more',
    priceDesc: '固定价',
    price: 24.8,
    discountDesc: '已优惠¥5.4',
    subLabel: '先出发 顺路拼',
    waitingDesc: '2分钟',
    checked: false
  },
  {
    id: 'didi_express',
    name: '滴滴快车',
    category: 'more',
    priceDesc: '固定价',
    price: 26.2,
    tag: 'V6-¥4.6',
    subLabel: 'V7快速应答+',
    waitingDesc: '3秒',
    checked: false
  },
  {
    id: 'six_seat_premium',
    name: '六座专车',
    category: 'more',
    priceDesc: '固定价',
    price: 46.0,
    discountDesc: '已优惠¥30.7',
    subLabel: '超大空间 舒适可躺',
    waitingDesc: '7秒',
    checked: false
  }
];

export const DEFAULT_USER_PERSONA: UserPersona = {
  userId: 'USR-890241',
  age: 28,
  gender: '男',
  occupation: '互联网大厂产品运营',
  vipLevel: 'V6 会员',
  priceSensitivity: 8, // Very high price sensitivity, checks discounts
  comfortPreference: 5,
  frequency: '每周打车 5-8 次 (高频)',
  labels: ['白领通勤', '价格敏感型', '精明比价者', '特惠快车常客'],
  averageRating: 4.88,
  preRideCompareTimeSec: 42
};

export const DEFAULT_CURRENT_SESSION: CurrentSession = {
  sessionId: 'SES-20260629-98',
  timestamp: '2026-06-29T20:38:00',
  startLocation: '东亚上北小区12号楼',
  endLocation: '新橙海北停车场上车点',
  distanceKm: 11.0,
  durationMin: 17,
  weather: '晴天',
  timeSlot: '普通时段',
  deviceType: 'iPhone 15 Pro (Didi iOS client)',
  userChoices: ['surprise_promo', 'express_promo'], // Initially selected options
  sessionEvents: [
    {
      id: 'evt_1',
      time: '20:37:31',
      eventType: 'view',
      description: '用户进入打车界面，输入起点：东亚上北小区12号楼，终点：新橙海北停车场上车点。'
    },
    {
      id: 'evt_2',
      time: '20:37:34',
      eventType: 'view',
      description: '推荐和快速类车型加载完成，显示当前预估价格区间为 ¥19 - 27。'
    },
    {
      id: 'evt_3',
      time: '20:37:45',
      eventType: 'click_vehicle',
      description: '用户点击查看 “滴滴小巴” 一口价 ¥13.0，停留 3.2 秒，但因站点拼车需步行而未选择。'
    },
    {
      id: 'evt_4',
      time: '20:37:52',
      eventType: 'select_vehicle',
      description: '用户勾选 “惊喜特价” 车型，预估固定价 ¥19.1。'
    },
    {
      id: 'evt_5',
      time: '20:38:01',
      eventType: 'select_vehicle',
      description: '用户勾选 “特惠快车”，价格 ¥26.2（已应用V6专属折扣 -¥4.6），由于该车型标注为 “大家常选”，响应快速。'
    },
    {
      id: 'evt_6',
      time: '20:38:05',
      eventType: 'view',
      description: '用户在车型列表中上下滑动，比较 “惊喜特价” ¥19.1 与 “特价拼车” ¥19.3 (拼成价)。'
    },
    {
      id: 'evt_7',
      time: '20:38:08',
      eventType: 'click_vehicle',
      description: '用户查看 “六座专车” ¥46.0，但由于价格远高出预期而迅速折叠该卡片。'
    }
  ],
  bubbleTime: '2026-06-25 01:46:00',
  estimatedAcceptRate: '0.9-1.0',
  callTime: '2026-06-25 01:47:21',
  replyTime: '2026-06-25 01:47:22',
  orderStatus: '已完结'
};

export const DEFAULT_PAST_30_DAYS: Past30DaysData = {
  totalRides: 24,
  totalSpent: 624.5,
  avgDiscountRate: 0.18, // 18% savings average
  avgDistance: 8.4,
  preferredVehicle: '特惠快车',
  dailyTrend: [
    { date: '06-01', spent: 19.1, rides: 1 },
    { date: '06-03', spent: 26.2, rides: 1 },
    { date: '06-04', spent: 38.5, rides: 2 },
    { date: '06-06', spent: 13.0, rides: 1 },
    { date: '06-08', spent: 26.2, rides: 1 },
    { date: '06-10', spent: 19.1, rides: 1 },
    { date: '06-12', spent: 44.5, rides: 2 },
    { date: '06-14', spent: 13.0, rides: 1 },
    { date: '06-15', spent: 52.4, rides: 2 },
    { date: '06-17', spent: 26.2, rides: 1 },
    { date: '06-19', spent: 19.1, rides: 1 },
    { date: '06-20', spent: 32.4, rides: 1 },
    { date: '06-22', spent: 26.2, rides: 1 },
    { date: '06-23', spent: 19.1, rides: 1 },
    { date: '06-25', spent: 45.6, rides: 2 },
    { date: '06-26', spent: 26.2, rides: 1 },
    { date: '06-27', spent: 13.0, rides: 1 },
    { date: '06-28', spent: 38.5, rides: 2 },
    { date: '06-29', spent: 45.3, rides: 2 }
  ],
  categoryDistribution: [
    { name: '特惠快车', value: 12 },
    { name: '惊喜特价', value: 6 },
    { name: '滴滴小巴', value: 4 },
    { name: '特价拼车', value: 2 }
  ],
  rides: [
    {
      orderId: 'ORD-982401',
      date: '2026-06-28',
      time: '08:35',
      vehicleType: '特惠快车',
      fare: 26.2,
      discount: 4.6,
      rating: 5,
      isCompleted: true,
      startLoc: '东亚上北小区12号楼',
      endLoc: '望京SOHO塔3'
    },
    {
      orderId: 'ORD-982352',
      date: '2026-06-28',
      time: '18:45',
      vehicleType: '惊喜特价',
      fare: 19.1,
      discount: 3.5,
      rating: 4,
      isCompleted: true,
      startLoc: '望京SOHO塔3',
      endLoc: '东亚上北小区12号楼'
    },
    {
      orderId: 'ORD-981921',
      date: '2026-06-26',
      time: '19:15',
      vehicleType: '特惠快车',
      fare: 26.2,
      discount: 4.6,
      rating: 5,
      isCompleted: true,
      startLoc: '西二旗地铁站',
      endLoc: '东亚上北小区12号楼'
    },
    {
      orderId: 'ORD-981410',
      date: '2026-06-25',
      time: '09:05',
      vehicleType: '特惠快车',
      fare: 28.5,
      discount: 5.2,
      rating: 5,
      isCompleted: true,
      startLoc: '东亚上北小区12号楼',
      endLoc: '百度科技园'
    },
    {
      orderId: 'ORD-981223',
      date: '2026-06-25',
      time: '12:30',
      vehicleType: '滴滴小巴',
      fare: 13.0,
      discount: 1.5,
      rating: 4,
      isCompleted: true,
      startLoc: '东亚上北小区',
      endLoc: '回龙观地铁站'
    },
    {
      orderId: 'ORD-980455',
      date: '2026-06-23',
      time: '08:42',
      vehicleType: '惊喜特价',
      fare: 19.1,
      discount: 3.2,
      rating: 5,
      isCompleted: true,
      startLoc: '东亚上北小区12号楼',
      endLoc: '新橙海北停车场'
    },
    {
      orderId: 'ORD-979920',
      date: '2026-06-22',
      time: '18:30',
      vehicleType: '特惠快车',
      fare: 26.2,
      discount: 4.6,
      rating: 5,
      isCompleted: true,
      startLoc: '新橙海北停车场',
      endLoc: '东亚上北小区12号楼'
    }
  ]
};

export const DEFAULT_EXCEL_SESSIONS: ParsedExcelSession[] = [
  {
    passengerId: 'c448d6e66a',
    startLocation: '不会飞的烧鸟(华星新村店)',
    endLocation: '远洋公寓东区-西北门',
    startScene: '休闲娱乐·餐饮',
    endScene: '工作区域·公司',
    distanceMeters: 8003,
    distanceKm: 8.0,
    bubbleTime: '2026-06-25 01:46:00',
    estimatedAcceptRate: '0.9-1.0',
    age: '42',
    gender: '男',
    city: '杭州市',
    historyRaw: '[2026/06/25 21:18:51***0.8-0.9***[惊喜特价车|2380.000000|17469.000000|灞桥区|枫林九溪·竹韵-南门(超超烟酒便利店旁)|灞桥区|西侯社区洪庆新苑]***[惊喜特价车, 特惠快车]***未加勾***[特惠快车]]\n[2026/06/24 13:19:55***0.9-1.0***[普通快车|2880.000000|9450.000000|拱墅区|运河天地|上城区|湖滨银泰]***[普通快车]***[优享雅致]***未减勾]',
    callTime: '2026-06-25 01:47:21',
    replyTime: '2026-06-25 01:47:22',
    orderStatus: '已完结',
    vehicles: [
      {
        id: 'veh_c448_0',
        name: '普通快车',
        category: 'recommend',
        priceDesc: '一口价',
        price: 28.80,
        checked: true,
        callTime: '2026-06-25 01:47:21',
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 1
      },
      {
        id: 'veh_c448_1',
        name: '特惠出租车',
        category: 'recommend',
        priceDesc: '固定价',
        price: 27.20,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 2
      },
      {
        id: 'veh_c448_2',
        name: '线上让补_补',
        category: 'recommend',
        priceDesc: '固定价',
        price: 29.23,
        checked: true,
        callTime: '2026-06-25 01:47:21',
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 2
      },
      {
        id: 'veh_c448_3',
        name: '普通快车',
        category: 'recommend',
        priceDesc: '一口价',
        price: 32.03,
        checked: true,
        callTime: '2026-06-25 01:47:21',
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 3
      },
      {
        id: 'veh_c448_4',
        name: '滴滴轻享专车',
        category: 'more',
        priceDesc: '专车价',
        price: 32.90,
        checked: true,
        callTime: '2026-06-25 01:47:21',
        replyTime: '2026-06-25 01:47:22',
        isFirstScreen: true,
        displayOrder: 4
      },
      {
        id: 'veh_c448_5',
        name: '极速拼车',
        category: 'recommend',
        priceDesc: '拼成价',
        price: 14.70,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 5
      },
      {
        id: 'veh_c448_6',
        name: '特惠快车15t',
        category: 'recommend',
        priceDesc: '固定价',
        price: 17.30,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 6
      },
      {
        id: 'veh_c448_7',
        name: '特惠快车',
        category: 'recommend',
        priceDesc: '固定价',
        price: 24.60,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 7
      },
      {
        id: 'veh_c448_8',
        name: '特惠联盟',
        category: 'recommend',
        priceDesc: '一口价',
        price: 26.93,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 8
      },
      {
        id: 'veh_c448_9',
        name: '舒适型专车',
        category: 'more',
        priceDesc: '专车价',
        price: 52.30,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 9
      },
      {
        id: 'veh_c448_10',
        name: '滴滴小巴',
        category: 'more',
        priceDesc: '拼车价',
        price: 14.40,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: false,
        displayOrder: 10
      },
      {
        id: 'veh_c448_11',
        name: '惊喜特价',
        category: 'more',
        priceDesc: '特价价',
        price: 19.30,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: false,
        displayOrder: 41
      }
    ]
  },
  {
    passengerId: 'a392dd10bc',
    startLocation: '杭州东站-出发大厅',
    endLocation: '阿里西溪园区-南门',
    startScene: '交通枢纽·火车站',
    endScene: '工作区域·写字楼',
    distanceMeters: 22400,
    distanceKm: 22.4,
    bubbleTime: '2026-06-25 10:15:00',
    estimatedAcceptRate: '0.8-0.9',
    age: '29',
    gender: '女',
    city: '杭州市',
    historyRaw: '[2026/06/08 09:12:00***0.9-1.0***[滴滴快车|6250.000000|22400.000000|余杭区|未来科技城|萧山区|萧山机场]***[滴滴快车, 优享雅致]***未加勾***未减勾]\n[2026/06/15 18:30:11***0.8-0.9***[滴滴快车|6500.000000|23500.000000|滨江区|网易大厦|余杭区|阿里西溪园区]***[滴滴快车]***[六座专车]***未减勾]',
    callTime: '2026-06-25 10:16:12',
    replyTime: '2026-06-25 10:16:45',
    orderStatus: '已接单',
    vehicles: [
      {
        id: 'veh_a392_0',
        name: '滴滴快车',
        category: 'recommend',
        priceDesc: '预估价',
        price: 58.50,
        checked: true,
        callTime: '2026-06-25 10:16:12',
        replyTime: '2026-06-25 10:16:45',
        isFirstScreen: true,
        displayOrder: 1
      },
      {
        id: 'veh_a392_1',
        name: '特惠快车',
        category: 'recommend',
        priceDesc: '固定价',
        price: 49.80,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 2
      },
      {
        id: 'veh_a392_2',
        name: '舒适型专车',
        category: 'more',
        priceDesc: '专车价',
        price: 88.00,
        checked: false,
        callTime: null,
        replyTime: null,
        isFirstScreen: true,
        displayOrder: 3
      }
    ]
  }
];
