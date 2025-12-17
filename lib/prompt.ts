import { Solar, Lunar } from 'lunar-javascript';

/**
 * 八字信息接口
 */
export interface EightCharInfo {
  year: string;      // 年柱
  month: string;     // 月柱
  day: string;       // 日柱
  time: string;      // 时柱
  yearNaYin: string; // 年纳音
  monthNaYin: string; // 月纳音
  dayNaYin: string;   // 日纳音
  timeNaYin: string;  // 时纳音
  yearShiShen: string; // 年十神
  monthShiShen: string; // 月十神
  dayShiShen: string;   // 日十神（日主）
  timeShiShen: string;  // 时十神
  fiveElements: {
    木: number;
    火: number;
    土: number;
    金: number;
    水: number;
  };
}

/**
 * 从生日字符串提取八字信息
 */
export function extractEightCharInfo(birthday: string): EightCharInfo {
  const [datePart, timePart] = birthday.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour = 12, minute = 0] = timePart ? timePart.split(':').map(Number) : [12, 0];

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 统计五行
  const fiveElements = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  const ganToElement: Record<string, string> = {
    甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
    己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
  };

  const zhiToElement: Record<string, string> = {
    子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
    午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
  };

  [eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), eightChar.getTime()].forEach((ganzhi) => {
    const gan = ganzhi[0];
    const zhi = ganzhi[1];
    if (ganToElement[gan]) fiveElements[ganToElement[gan] as keyof typeof fiveElements]++;
    if (zhiToElement[zhi]) fiveElements[zhiToElement[zhi] as keyof typeof fiveElements]++;
  });

  return {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    time: eightChar.getTime(),
    yearNaYin: eightChar.getYearNaYin()?.toString() || '',
    monthNaYin: eightChar.getMonthNaYin()?.toString() || '',
    dayNaYin: eightChar.getDayNaYin()?.toString() || '',
    timeNaYin: eightChar.getTimeNaYin()?.toString() || '',
    yearShiShen: eightChar.getYearShiShenGan()?.toString() || '',
    monthShiShen: eightChar.getMonthShiShenGan()?.toString() || '',
    dayShiShen: eightChar.getDayShiShenGan()?.toString() || '',
    timeShiShen: eightChar.getTimeShiShenGan()?.toString() || '',
    fiveElements,
  };
}

/**
 * 分析好运年和低谷期
 */
export function analyzeGoodAndBadYears(birthday: string): {
  goodYears: number[];
  badYears: number[];
} {
  const [datePart] = birthday.split(' ');
  const [year] = datePart.split('-').map(Number);
  const solar = Solar.fromYmdHms(year, 1, 1, 12, 0, 0);
  const lunar = solar.getLunar();
  const birthEightChar = lunar.getEightChar();
  const birthDayGan = birthEightChar.getDay()[0]; // 日主天干

  const goodYears: number[] = [];
  const badYears: number[] = [];

  // 分析未来80年的流年
  for (let age = 0; age < 80; age++) {
    const currentYear = year + age;
    const currentSolar = Solar.fromYmd(currentYear, 1, 1);
    const currentLunar = currentSolar.getLunar();
    const currentEightChar = currentLunar.getEightChar();
    const currentYearGan = currentEightChar.getYear()[0];

    // 简单的相生相克判断（简化版）
    const ganRelations: Record<string, { good: string[]; bad: string[] }> = {
      甲: { good: ['壬', '癸', '丙', '丁'], bad: ['庚', '辛', '戊', '己'] },
      乙: { good: ['壬', '癸', '丙', '丁'], bad: ['庚', '辛', '戊', '己'] },
      丙: { good: ['甲', '乙', '戊', '己'], bad: ['壬', '癸'] },
      丁: { good: ['甲', '乙', '戊', '己'], bad: ['壬', '癸'] },
      戊: { good: ['丙', '丁', '庚', '辛'], bad: ['甲', '乙'] },
      己: { good: ['丙', '丁', '庚', '辛'], bad: ['甲', '乙'] },
      庚: { good: ['戊', '己', '壬', '癸'], bad: ['丙', '丁'] },
      辛: { good: ['戊', '己', '壬', '癸'], bad: ['丙', '丁'] },
      壬: { good: ['庚', '辛', '甲', '乙'], bad: ['戊', '己'] },
      癸: { good: ['庚', '辛', '甲', '乙'], bad: ['戊', '己'] },
    };

    const relations = ganRelations[birthDayGan];
    if (relations) {
      if (relations.good.includes(currentYearGan)) {
        goodYears.push(currentYear);
      } else if (relations.bad.includes(currentYearGan)) {
        badYears.push(currentYear);
      }
    }
  }

  return { goodYears, badYears };
}

/**
 * 根据五行推荐行业
 */
export function recommendIndustries(fiveElements: EightCharInfo['fiveElements']): string[] {
  const industries: string[] = [];
  const sorted = Object.entries(fiveElements).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];

  const industryMap: Record<string, string[]> = {
    木: ['教育', '出版', '文化创意', '环保', '农业', '林业', '医疗健康'],
    火: ['互联网', '科技', '能源', '餐饮', '娱乐', '传媒', '广告'],
    土: ['房地产', '建筑', '金融', '投资', '咨询', '管理', '物流'],
    金: ['金融', '法律', '机械', '汽车', '珠宝', '精密制造', '审计'],
    水: ['贸易', '物流', '旅游', '服务', '咨询', '投资', '航运'],
  };

  if (industryMap[dominant]) {
    industries.push(...industryMap[dominant]);
  }

  // 添加第二强的五行行业
  if (sorted[1] && sorted[1][1] > 0) {
    const second = sorted[1][0];
    if (industryMap[second]) {
      industries.push(...industryMap[second].slice(0, 3));
    }
  }

  return [...new Set(industries)]; // 去重
}

/**
 * 生成发送给大模型的 Prompt
 */
export function generatePrompt(birthday: string, name?: string): string {
  const eightCharInfo = extractEightCharInfo(birthday);
  const { goodYears, badYears } = analyzeGoodAndBadYears(birthday);
  const industries = recommendIndustries(eightCharInfo.fiveElements);

  // 格式化好运年和低谷期
  const goodYearsStr = goodYears.length > 0
    ? goodYears.slice(0, 10).join('、') + (goodYears.length > 10 ? '等' : '')
    : '需结合具体流年分析';
  
  const badYearsStr = badYears.length > 0
    ? badYears.slice(0, 10).join('、') + (badYears.length > 10 ? '等' : '')
    : '需结合具体流年分析';

  const prompt = `你是一个资深华尔街分析师，同时精通中国传统命理学。现在请根据以下八字信息，融合传统命理经典理论，为这位客户写一份《人生招股说明书》。

【参考命理经典】
请结合以下传统命理经典的理论和方法进行分析：
- 《穷通宝鉴》（穷通宝典）：五行调候、格局分析
- 《三命通会》：十神格局、神煞运用
- 《滴天髓》：命理精髓、格局高低
- 《渊海子平》：子平八字、格局判断
- 《千里命稿》：格局分析、用神取用
- 《协纪辨方书》：择日择时、吉凶判断
- 《果老星宗》：星命学、星曜影响
- 《子平真诠》：格局真诠、用神理论
- 《神峰通考》：命理通考、格局详解

【八字信息】
姓名：${name || '客户'}
八字：${eightCharInfo.year} ${eightCharInfo.month} ${eightCharInfo.day} ${eightCharInfo.time}
年柱：${eightCharInfo.year}（${eightCharInfo.yearNaYin}）
月柱：${eightCharInfo.month}（${eightCharInfo.monthNaYin}）
日柱：${eightCharInfo.day}（${eightCharInfo.dayNaYin}）
时柱：${eightCharInfo.time}（${eightCharInfo.timeNaYin}）
十神：年${eightCharInfo.yearShiShen} 月${eightCharInfo.monthShiShen} 日${eightCharInfo.dayShiShen} 时${eightCharInfo.timeShiShen}
五行分布：木${eightCharInfo.fiveElements.木} 火${eightCharInfo.fiveElements.火} 土${eightCharInfo.fiveElements.土} 金${eightCharInfo.fiveElements.金} 水${eightCharInfo.fiveElements.水}

【分析数据】
主力建仓期（好运年）：${goodYearsStr}
风险提示（低谷期）：${badYearsStr}
适合行业：${industries.join('、')}

请为这位客户撰写一份专业的《人生招股说明书》，必须包含以下四个部分：

1. 【核心业务（性格）】
   基于八字中的十神和五行特征，结合《穷通宝鉴》的调候理论、《滴天髓》的格局分析、《子平真诠》的格局判断，分析客户的性格特质、核心优势、行为模式。用金融术语描述，比如"主营业务"、"核心竞争力"、"商业模式"等。要结合具体的十神和五行数据，引用命理经典的理论依据进行分析。

2. 【主力建仓期（好运年）】
   列出客户人生中的关键好运年份，结合《三命通会》的流年理论、《协纪辨方书》的择时方法、《千里命稿》的格局分析，分析这些年份的特点和机遇。用投资术语描述，比如"最佳买入时机"、"价值发现期"、"业绩爆发期"等。要说明为什么这些年份是好运年，可以引用相关命理理论。

3. 【风险提示（低谷期）】
   列出需要谨慎的年份，结合《渊海子平》的格局判断、《神峰通考》的格局详解、《果老星宗》的星曜影响，分析可能面临的挑战和风险。用金融风险术语描述，比如"市场回调"、"系统性风险"、"流动性危机"等。要给出具体的风险防范建议，可以结合命理中的化解方法。

4. 【投资建议（适合的行业）】
   根据五行特征，结合《穷通宝鉴》的五行调候、《滴天髓》的格局高低、《子平真诠》的用神理论，推荐最适合的行业和职业方向。用投资组合理论描述，比如"资产配置"、"行业轮动"、"赛道选择"等。要说明为什么这些行业适合，以及如何在这些行业中发挥优势，可以引用命理经典中的相关理论。

要求：
- 语气要专业、冷峻，带有华尔街分析师的风格
- 适当使用金融幽默感，但不要过度（比如可以用"人生IPO"、"生命市值"等比喻）
- 用词要精准，逻辑要清晰
- 每个部分都要有具体的数据支撑和逻辑分析
- 要适当引用传统命理经典的理论，但要用现代金融语言表达
- 整体风格要像一份真实的招股说明书
- 开头要有标题"人生招股说明书"，结尾要有"投资有风险，人生需谨慎"的免责声明
- 可以在适当的地方提及参考的命理经典，增强专业性和可信度`;

  return prompt;
}

