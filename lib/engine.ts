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
 * 获取五行分布（返回五行数量统计）
 */
function getFiveElementsDistribution(eightChar: any): Record<string, number> {
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

  return elements;
}

/**
 * 计算五行能量得分
 */
function calculateFiveElementsScore(eightChar: any): number {
  const elements = getFiveElementsDistribution(eightChar);

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
 * 计算天干地支的相生相克关系（更精确的计算）
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
  
  // 相生：+0.15，相克：-0.15，相同：+0.08，比和：+0.05
  const diff = (currentOrder - birthOrder + 10) % 10;
  if (diff === 2 || diff === 3) return 1.15; // 相生（流年生日主）
  if (diff === 6 || diff === 7) return 0.85; // 相克（流年克日主）
  if (diff === 0) return 1.08; // 相同
  if (diff === 1) return 1.05; // 比和（同五行）
  if (diff === 4 || diff === 5) return 0.92; // 被克（日主克流年，但流年强）
  return 1.0; // 中性
}

/**
 * 计算地支关系（更精确）
 */
function calculateZhiRelation(birthZhi: string, currentZhi: string): number {
  const zhiOrder: Record<string, number> = {
    子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5,
    午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11,
  };
  
  const birthOrder = zhiOrder[birthZhi] ?? 0;
  const currentOrder = zhiOrder[currentZhi] ?? 0;
  
  // 地支相合：子丑合、寅亥合、卯戌合、辰酉合、巳申合、午未合
  const hePairs: [number, number][] = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
  const isHe = hePairs.some(([a, b]) => 
    (birthOrder === a && currentOrder === b) || (birthOrder === b && currentOrder === a)
  );
  
  // 地支相冲：子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲
  const chongPairs: [number, number][] = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
  const isChong = chongPairs.some(([a, b]) => 
    (birthOrder === a && currentOrder === b) || (birthOrder === b && currentOrder === a)
  );
  
  if (isHe) return 1.1; // 相合：+10%
  if (isChong) return 0.9; // 相冲：-10%
  if (birthOrder === currentOrder) return 1.05; // 相同：+5%
  return 1.0; // 中性
}

/**
 * 计算五行匹配度（流年五行与出生五行的匹配程度）
 */
function calculateFiveElementsMatch(
  birthElements: Record<string, number>,
  liunianElements: Record<string, number>
): number {
  // 计算五行匹配度
  // 如果流年五行与出生五行相生或相同，则匹配度高
  // 如果相克，则匹配度低
  
  let matchScore = 0;
  const totalBirth = Object.values(birthElements).reduce((a, b) => a + b, 0);
  const totalLiunian = Object.values(liunianElements).reduce((a, b) => a + b, 0);
  
  if (totalBirth === 0 || totalLiunian === 0) return 1.0;
  
  // 五行相生关系：木生火，火生土，土生金，金生水，水生木
  const elementOrder: Record<string, number> = { 木: 0, 火: 1, 土: 2, 金: 3, 水: 4 };
  const elementNames = ['木', '火', '土', '金', '水'];
  
  for (const element of elementNames) {
    const birthCount = birthElements[element] || 0;
    const liunianCount = liunianElements[element] || 0;
    
    // 相同五行：+1
    if (liunianCount > 0 && birthCount > 0) {
      matchScore += 1;
    }
    
    // 相生关系：+0.5
    const birthOrder = elementOrder[element];
    const nextElement = elementNames[(birthOrder + 1) % 5]; // 被生的五行
    if (liunianElements[nextElement] > 0 && birthCount > 0) {
      matchScore += 0.5;
    }
    
    // 相克关系：-0.3
    const prevElement = elementNames[(birthOrder + 3) % 5]; // 被克的五行
    if (liunianElements[prevElement] > 0 && birthCount > 0) {
      matchScore -= 0.3;
    }
  }
  
  // 归一化到 0.85-1.15 范围
  const normalizedScore = 0.85 + (matchScore / 10) * 0.3;
  return Math.max(0.85, Math.min(1.15, normalizedScore));
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

  // 预计算所有年龄的得分，用于更准确的计算
  const scores: number[] = [];
  for (let age = 0; age < 80; age++) {
    scores[age] = calculateAgeScore(birthEightChar, age, birthDate);
  }

  for (let age = 0; age < 80; age++) {
    // 获取当前年龄和上一年的得分
    const currentScore = scores[age];
    const previousScore = age > 0 ? scores[age - 1] : initialScore;
    
    // 计算得分变化率（这是核心，完全基于计算，无随机）
    const scoreChangeRatio = (currentScore - previousScore) / previousScore;
    
    // 获取流年信息，用于更精确的计算
    const liunian = getLiunian(birthDate, age);
    const birthDayGan = birthEightChar.getDay()[0];
    const birthDayZhi = birthEightChar.getDay()[1];
    const liunianYearGan = liunian.getYear()[0];
    const liunianYearZhi = liunian.getYear()[1];
    
    // 天干关系
    const ganZhiFactor = calculateGanZhiRelation(birthDayGan, liunianYearGan);
    
    // 地支关系
    const zhiFactor = calculateZhiRelation(birthDayZhi, liunianYearZhi);
    
    // 获取大运信息
    const { dayunFactor } = getDayunInfo(birthEightChar, age);
    
    // 计算流年与日主的五行关系
    const liunianFiveElements = getFiveElementsDistribution(liunian);
    const birthFiveElements = getFiveElementsDistribution(birthEightChar);
    const fiveElementsMatch = calculateFiveElementsMatch(birthFiveElements, liunianFiveElements);
    
    // 计算流年十神对日主的影响
    const liunianShiShen = liunian.getYearShiShenGan();
    const shiShenWeight = TEN_GODS_WEIGHT[liunianShiShen] || 1.0;
    const shiShenFactor = 0.9 + (shiShenWeight - 1.0) * 0.2; // 0.9-1.1 的波动
    
    // 开盘价：基于上一年的收盘价，考虑流年天干地支的综合影响
    const openAdjustment = ((ganZhiFactor - 1.0) * 0.015 + (zhiFactor - 1.0) * 0.01); // 天干影响1.5%，地支影响1%
    const open = previousClose * (1 + openAdjustment);
    
    // 收盘价：完全基于得分变化率、大运、流年、天干地支、五行、十神关系计算
    // 得分变化的影响系数（最重要）
    const scoreImpact = scoreChangeRatio * 3.0; // 得分变化放大3倍
    
    // 大运影响（相对于1.0的偏差）
    const dayunImpact = (dayunFactor - 1.0) * 0.35; // 大运影响35%
    
    // 流年天干影响（相对于1.0的偏差）
    const ganZhiImpact = (ganZhiFactor - 1.0) * 0.25; // 天干影响25%
    
    // 流年地支影响
    const zhiImpact = (zhiFactor - 1.0) * 0.15; // 地支影响15%
    
    // 五行匹配度影响
    const fiveElementsImpact = (fiveElementsMatch - 1.0) * 0.18; // 五行影响18%
    
    // 十神影响
    const shiShenImpact = (shiShenFactor - 1.0) * 0.12; // 十神影响12%
    
    // 综合涨跌幅度（完全基于计算，无随机）
    const totalChange = scoreImpact + dayunImpact + ganZhiImpact + zhiImpact + fiveElementsImpact + shiShenImpact;
    
    // 限制涨跌幅度在合理范围内（-22% 到 +28%）
    const safeChange = Math.max(-0.22, Math.min(0.28, totalChange));
    const close = open * (1 + safeChange);
    
    // 最高价和最低价：基于涨跌幅度和波动性计算（非随机）
    // 波动性基于得分变化的绝对值、天干地支关系、五行匹配度
    const baseVolatility = Math.abs(scoreChangeRatio) * 0.25;
    const ganZhiVolatility = Math.abs(ganZhiFactor - 1.0) * 0.15;
    const zhiVolatility = Math.abs(zhiFactor - 1.0) * 0.1;
    const volatility = baseVolatility + ganZhiVolatility + zhiVolatility + 0.04; // 最小4%波动
    
    // 限制波动率在合理范围（4%-40%）
    const safeVolatility = Math.max(0.04, Math.min(0.40, volatility));
    
    // 最高价：收盘价或开盘价中较高的，加上波动
    const highBase = Math.max(open, close);
    const high = highBase * (1 + safeVolatility * 0.7); // 最高价上浮波动率的70%
    
    // 最低价：收盘价或开盘价中较低的，减去波动
    const lowBase = Math.min(open, close);
    const low = lowBase * (1 - safeVolatility * 0.6); // 最低价下浮波动率的60%
    
    // 确保价格合理（防止异常值）
    const safeHigh = Math.max(high, Math.max(open, close) * 1.01);
    const safeLow = Math.max(low, Math.min(open, close) * 0.90);

    // 更新上一年的收盘价（用于下一年计算）
    previousClose = close;

    // ECharts K 线格式：[开盘, 收盘, 最低, 最高]
    kLineData.push([
      Math.round(open * 100) / 100,
      Math.round(close * 100) / 100,
      Math.round(safeLow * 100) / 100,
      Math.round(safeHigh * 100) / 100,
    ]);
  }

  return kLineData;
}

