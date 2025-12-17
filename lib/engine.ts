import { Solar, Lunar } from 'lunar-javascript';

/**
 * ECharts K 线图数据格式
 * [开盘价, 收盘价, 最低价, 最高价]
 */
export type KLineData = [number, number, number, number];

/**
 * 五行能量权重
 */
const FIVE_ELEMENTS_WEIGHT: Record<string, number> = {
  木: 1.0,
  火: 1.2,
  土: 0.8,
  金: 1.1,
  水: 0.9,
};

/**
 * 十神权重（基于对日主的影响）
 */
const TEN_GODS_WEIGHT: Record<string, number> = {
  比肩: 1.0,
  劫财: 0.9,
  食神: 1.1,
  伤官: 1.2,
  偏财: 1.3,
  正财: 1.4,
  七杀: 1.5,
  正官: 1.6,
  偏印: 1.7,
  正印: 1.8,
  日主: 1.0,
};

/**
 * 天干对应的五行
 */
const GAN_TO_ELEMENT: Record<string, string> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

/**
 * 地支对应的五行
 */
const ZHI_TO_ELEMENT: Record<string, string> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

/**
 * 计算五行能量得分
 */
function calculateFiveElementsScore(eightChar: any): number {
  const elements: Record<string, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  // 统计八字中的五行
  const year = eightChar.getYear();
  const month = eightChar.getMonth();
  const day = eightChar.getDay();
  const time = eightChar.getTime();

  // 天干
  [year, month, day, time].forEach((ganzhi) => {
    const gan = ganzhi[0];
    const zhi = ganzhi[1];
    
    if (GAN_TO_ELEMENT[gan]) {
      elements[GAN_TO_ELEMENT[gan]] += 1;
    }
    if (ZHI_TO_ELEMENT[zhi]) {
      elements[ZHI_TO_ELEMENT[zhi]] += 1;
    }
  });

  // 计算加权得分
  let score = 0;
  for (const [element, count] of Object.entries(elements)) {
    score += count * (FIVE_ELEMENTS_WEIGHT[element] || 1.0);
  }

  return score;
}

/**
 * 计算十神强弱得分
 */
function calculateTenGodsScore(eightChar: any): number {
  let score = 0;

  // 获取天干十神
  const yearShiShen = eightChar.getYearShiShenGan();
  const monthShiShen = eightChar.getMonthShiShenGan();
  const dayShiShen = eightChar.getDayShiShenGan();
  const timeShiShen = eightChar.getTimeShiShenGan();

  [yearShiShen, monthShiShen, dayShiShen, timeShiShen].forEach((shiShen) => {
    if (shiShen && TEN_GODS_WEIGHT[shiShen]) {
      score += TEN_GODS_WEIGHT[shiShen];
    }
  });

  // 获取地支十神（可能有多个）
  const yearShiShenZhi = eightChar.getYearShiShenZhi()?.toString() || '';
  const monthShiShenZhi = eightChar.getMonthShiShenZhi()?.toString() || '';
  const dayShiShenZhi = eightChar.getDayShiShenZhi()?.toString() || '';
  const timeShiShenZhi = eightChar.getTimeShiShenZhi()?.toString() || '';

  [yearShiShenZhi, monthShiShenZhi, dayShiShenZhi, timeShiShenZhi].forEach((shiShenStr) => {
    if (shiShenStr) {
      const shiShenList = shiShenStr.split(',').map((s: string) => s.trim());
      shiShenList.forEach((shiShen: string) => {
        if (TEN_GODS_WEIGHT[shiShen]) {
          score += TEN_GODS_WEIGHT[shiShen] * 0.5; // 地支权重稍低
        }
      });
    }
  });

  return score;
}

/**
 * 获取大运信息（基于实际起运时间）
 */
function getDayunInfo(birthEightChar: any, age: number, gender: number = 0): {
  dayunIndex: number;
  dayunFactor: number;
} {
  // 尝试获取实际大运（需要性别信息，默认男性）
  try {
    const yun = birthEightChar.getYun(gender);
    const startYear = yun.getStartYear();
    const startMonth = yun.getStartMonth();
    
    // 计算起运年龄（年+月/12）
    const startAge = startYear + startMonth / 12;
    
    // 如果还没起运，返回基础因子
    if (age < startAge) {
      return { dayunIndex: -1, dayunFactor: 1.0 };
    }
    
    // 计算大运索引（每10年一个大运）
    const dayunIndex = Math.floor((age - startAge) / 10);
    
    // 大运因子：根据大运周期波动（8个大运周期）
    const cycle = (dayunIndex % 8) / 8;
    const dayunFactor = 0.85 + cycle * 0.3; // 0.85-1.15 的波动
    
    return { dayunIndex, dayunFactor };
  } catch (e) {
    // 如果获取失败，使用简化版本
    const dayunIndex = Math.floor(age / 10);
    const cycle = (dayunIndex % 8) / 8;
    const dayunFactor = 0.85 + cycle * 0.3;
    return { dayunIndex, dayunFactor };
  }
}

/**
 * 获取流年信息（更精确的计算）
 */
function getLiunian(birthDate: Date, age: number): any {
  const currentYear = birthDate.getFullYear() + age;
  const solar = Solar.fromYmd(currentYear, birthDate.getMonth() + 1, birthDate.getDate());
  const lunar = solar.getLunar();
  return lunar.getEightChar();
}

/**
 * 计算天干地支的相生相克关系
 */
function calculateGanZhiRelation(birthGan: string, currentGan: string): number {
  // 天干相生：甲乙生丙丁，丙丁生戊己，戊己生庚辛，庚辛生壬癸，壬癸生甲乙
  // 天干相克：甲乙克戊己，丙丁克庚辛，戊己克壬癸，庚辛克甲乙，壬癸克丙丁
  const ganOrder: Record<string, number> = {
    甲: 0, 乙: 1, 丙: 2, 丁: 3, 戊: 4,
    己: 5, 庚: 6, 辛: 7, 壬: 8, 癸: 9,
  };
  
  const birthOrder = ganOrder[birthGan] ?? 0;
  const currentOrder = ganOrder[currentGan] ?? 0;
  
  // 相生：+0.1，相克：-0.1，相同：+0.05
  const diff = (currentOrder - birthOrder + 10) % 10;
  if (diff === 2 || diff === 3) return 1.1; // 相生
  if (diff === 6 || diff === 7) return 0.9; // 相克
  if (diff === 0 || diff === 1) return 1.05; // 相同或比和
  return 1.0; // 中性
}

/**
 * 计算某个年龄的能量得分（参考 lifekline 算法优化）
 */
function calculateAgeScore(
  birthEightChar: any,
  currentAge: number,
  birthDate: Date
): number {
  // 基础得分：出生八字的五行和十神
  const baseFiveElementsScore = calculateFiveElementsScore(birthEightChar);
  const baseTenGodsScore = calculateTenGodsScore(birthEightChar);
  const baseScore = (baseFiveElementsScore + baseTenGodsScore) / 2;

  // 大运影响（使用实际大运计算）
  const { dayunFactor } = getDayunInfo(birthEightChar, currentAge);
  
  // 流年影响（更精确的计算）
  const liunian = getLiunian(birthDate, currentAge);
  const liunianFiveElementsScore = calculateFiveElementsScore(liunian);
  const liunianTenGodsScore = calculateTenGodsScore(liunian);
  const liunianScore = (liunianFiveElementsScore + liunianTenGodsScore) / 2;
  
  // 流年因子：基于流年得分相对于基础得分的比例
  const liunianRatio = liunianScore / baseScore;
  const liunianFactor = 0.85 + (liunianRatio - 0.8) * 0.3; // 0.85-1.15 的波动
  
  // 天干相生相克影响
  const birthDayGan = birthEightChar.getDay()[0];
  const liunianYearGan = liunian.getYear()[0];
  const ganZhiFactor = calculateGanZhiRelation(birthDayGan, liunianYearGan);

  // 年龄因子（模拟人生不同阶段的起伏，更平滑的曲线）
  let ageFactor = 1.0;
  if (currentAge < 20) {
    // 0-20岁：成长期，从0.8到1.0
    ageFactor = 0.8 + (currentAge / 20) * 0.2;
  } else if (currentAge < 40) {
    // 20-40岁：上升期，从1.0到1.25
    ageFactor = 1.0 + ((currentAge - 20) / 20) * 0.25;
  } else if (currentAge < 60) {
    // 40-60岁：稳定期，从1.25到1.1
    ageFactor = 1.25 - ((currentAge - 40) / 20) * 0.15;
  } else {
    // 60-80岁：下降期，从1.1到0.85
    ageFactor = 1.1 - ((currentAge - 60) / 20) * 0.25;
  }

  // 综合得分（增加天干相生相克的影响）
  const finalScore = baseScore * dayunFactor * liunianFactor * ageFactor * ganZhiFactor;

  return finalScore;
}

/**
 * 生成 K 线数据
 * @param birthday 生日字符串，格式：YYYY-MM-DD HH:mm 或 YYYY-MM-DD
 * @returns ECharts K 线图数据数组
 */
export function generateLifeData(birthday: string): KLineData[] {
  // 解析生日字符串
  const [datePart, timePart] = birthday.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour = 12, minute = 0] = timePart ? timePart.split(':').map(Number) : [12, 0];

  // 创建公历日期
  const birthDate = new Date(year, month - 1, day, hour, minute);
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const birthEightChar = lunar.getEightChar();

  // 生成 0-79 岁的 K 线数据（80个数据点，对应 80 根 K 线）
  const kLineData: KLineData[] = [];

  // 计算初始基准价格（基于0岁的能量得分）
  const initialScore = calculateAgeScore(birthEightChar, 0, birthDate);
  const basePrice = Math.max(initialScore * 10, 100); // 将得分放大10倍作为基础价格
  let previousClose = basePrice;

  for (let age = 0; age < 80; age++) {
    // 计算当前年龄的能量得分
    const currentScore = calculateAgeScore(birthEightChar, age, birthDate);
    const previousScore = age > 0 
      ? calculateAgeScore(birthEightChar, age - 1, birthDate)
      : initialScore;
    
    // 计算得分变化率（相对于上一年）
    const scoreChange = (currentScore - previousScore) / previousScore;
    
    // 添加随机波动（模拟市场波动，但受得分变化影响）
    const baseVolatility = 0.15; // 基础波动率 15%
    const volatility = baseVolatility + Math.abs(scoreChange) * 0.1; // 得分变化大时波动更大
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;

    // 计算目标价格（基于得分变化和随机波动）
    const targetPrice = previousClose * (1 + scoreChange * 2) * randomFactor;
    
    // 开盘价：基于上一年的收盘价，有轻微波动（-2% 到 +2%）
    const open = previousClose * (0.98 + Math.random() * 0.04);
    
    // 收盘价：基于目标价格，但受开盘价约束，形成合理的涨跌
    // 涨跌幅度：-15% 到 +20%，但受得分变化影响
    const baseChange = scoreChange * 3; // 得分变化的影响放大3倍
    const randomChange = (Math.random() - 0.3) * 0.35; // 随机变化，偏向上涨
    const totalChange = baseChange + randomChange;
    const close = open * (1 + Math.max(-0.15, Math.min(0.20, totalChange)));
    
    // 确保收盘价不会异常
    const safeClose = Math.max(close, open * 0.6);
    
    // 最高价和最低价：基于开盘和收盘，有合理的波动范围
    const priceRange = Math.abs(safeClose - open) * 0.5;
    const high = Math.max(open, safeClose) + priceRange * (1 + Math.random() * 0.5);
    const low = Math.min(open, safeClose) - priceRange * (0.5 + Math.random() * 0.5);
    
    // 确保价格合理
    const safeHigh = Math.max(high, Math.max(open, safeClose) * 1.02);
    const safeLow = Math.max(low, Math.min(open, safeClose) * 0.95);

    // 更新上一年的收盘价（用于下一年计算）
    previousClose = safeClose;

    // ECharts K 线格式：[开盘, 收盘, 最低, 最高]
    kLineData.push([
      Math.round(open * 100) / 100,
      Math.round(safeClose * 100) / 100,
      Math.round(safeLow * 100) / 100,
      Math.round(safeHigh * 100) / 100,
    ]);
  }

  return kLineData;
}

