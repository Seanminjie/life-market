"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { KLineData } from "@/lib/engine";

interface LifeKLineProps {
  data: KLineData[];
  name?: string;
  birthday?: string; // 生日，用于计算年份
}

/**
 * 根据年龄和 K 线数据生成核心事件预测（融合传统命理经典）
 */
function generateEventPrediction(age: number, kLineData: KLineData): string {
  const [open, close, low, high] = kLineData;
  const isRising = close > open;
  const changePercent = ((close - open) / open) * 100;
  const volatility = ((high - low) / open) * 100;
  const range = ((high - low) / open) * 100;

  // 根据年龄阶段和涨跌情况生成事件
  const events: string[] = [];

  // 年龄阶段事件（结合命理理论）
  if (age >= 0 && age < 6) {
    events.push("童限初开");
    if (isRising && changePercent > 5) {
      events.push("根基深厚");
      events.push("健康发育");
    } else if (!isRising) {
      events.push("需调养");
    }
    if (volatility > 15) {
      events.push("环境变动");
    }
  } else if (age >= 6 && age < 18) {
    events.push("求学运程");
    if (isRising && changePercent > 8) {
      events.push("文昌显贵");
      events.push("学业有成");
    } else if (!isRising && changePercent < -5) {
      events.push("学业压力");
      events.push("需勤勉");
    }
    if (age >= 12 && age < 16 && isRising) {
      events.push("关键转折");
    }
  } else if (age >= 18 && age < 25) {
    events.push("青年运程");
    if (isRising && changePercent > 10) {
      events.push("事业起步");
      events.push("贵人相助");
    } else if (volatility > 20) {
      events.push("人生转折");
      events.push("选择关键期");
    }
    if (age >= 20 && age < 23 && isRising) {
      events.push("机遇显现");
    }
  } else if (age >= 25 && age < 35) {
    events.push("事业发展期");
    if (isRising && changePercent > 12) {
      events.push("事业高峰");
      events.push("财运亨通");
    } else if (volatility > 25) {
      events.push("职业变动");
      events.push("需谨慎决策");
    }
    if (age >= 28 && age <= 32 && isRising) {
      events.push("房产运势");
      events.push("置业良机");
    }
    if (age >= 30 && age < 33 && changePercent > 15) {
      events.push("人生黄金期");
    }
  } else if (age >= 35 && age < 45) {
    events.push("人生黄金期");
    if (isRising && changePercent > 15) {
      events.push("财富积累");
      events.push("事业巅峰");
    } else if (!isRising && changePercent < -10) {
      events.push("投资风险");
      events.push("需稳健经营");
    }
    if (volatility > 30) {
      events.push("重大决策");
      events.push("人生转折点");
    }
    if (age >= 38 && age < 42 && isRising) {
      events.push("事业突破");
    }
  } else if (age >= 45 && age < 55) {
    events.push("中年稳定期");
    if (isRising && changePercent > 10) {
      events.push("事业稳定");
      events.push("经验积累");
    } else if (!isRising) {
      events.push("健康关注");
      events.push("需调养");
    }
    if (age >= 48 && age < 52 && volatility > 20) {
      events.push("人生调整期");
    }
  } else if (age >= 55 && age < 65) {
    events.push("人生转型期");
    if (isRising) {
      events.push("退休规划");
      events.push("颐养天年");
    } else {
      events.push("生活调整");
      events.push("节奏放缓");
    }
    if (age >= 58 && age < 62 && isRising) {
      events.push("晚年运势");
    }
  } else if (age >= 65 && age < 80) {
    events.push("晚年生活");
    if (isRising && changePercent > 5) {
      events.push("健康良好");
      events.push("安享晚年");
    } else if (volatility > 15) {
      events.push("健康波动");
      events.push("需注意调养");
    }
  }

  // 根据涨跌幅度添加额外事件（结合命理理论）
  if (Math.abs(changePercent) > 20) {
    events.push("人生重大转折");
    if (changePercent > 20) {
      events.push("运势大旺");
    } else {
      events.push("需谨慎应对");
    }
  }
  
  if (volatility > 30) {
    events.push("波动较大");
    events.push("需稳中求进");
  } else if (volatility < 10) {
    events.push("运势平稳");
  }

  // 根据 K 线形态添加预测
  if (high > close * 1.15) {
    events.push("潜力未完全释放");
  }
  if (low < open * 0.85) {
    events.push("经历低谷");
  }
  if (range > 25) {
    events.push("起伏较大");
  }

  // 特殊年龄节点
  const specialAges = [12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78];
  if (specialAges.includes(age)) {
    events.push("关键节点");
  }

  return events.length > 0 ? events.join(" · ") : "平稳发展";
}

/**
 * 计算 K 线统计数据
 */
function calculateStatistics(data: KLineData[]) {
  const closes = data.map(([open, close]) => close);
  const opens = data.map(([open, close]) => open);
  const highs = data.map(([open, close, low, high]) => high);
  const lows = data.map(([open, close, low, high]) => low);
  
  // 第一年的开盘价（初始状态）和最后一年的收盘价（最终状态）
  const firstOpen = opens[0] || 100;
  const lastClose = closes[closes.length - 1] || 100;
  const firstClose = closes[0] || 100;
  
  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);
  const avgClose = closes.reduce((sum, val) => sum + val, 0) / closes.length;
  
  // 总涨幅：从第一年的开盘价到最后一年的收盘价
  const totalReturn = ((lastClose - firstOpen) / firstOpen) * 100;
  
  // 找到最高点和最低点的年龄
  const maxHighAge = highs.indexOf(maxHigh);
  const minLowAge = lows.indexOf(minLow);
  
  // 计算波动率
  const variance = closes.reduce((sum, val) => sum + Math.pow(val - avgClose, 2), 0) / closes.length;
  const volatility = Math.sqrt(variance) / avgClose * 100;
  
  return {
    firstOpen,
    firstClose,
    lastClose,
    maxHigh,
    minLow,
    avgClose,
    totalReturn,
    maxHighAge,
    minLowAge,
    volatility,
  };
}

export default function LifeKLine({ data, name = "人生指数", birthday }: LifeKLineProps) {
  // 计算统计数据
  const stats = useMemo(() => calculateStatistics(data), [data]);
  
  // 计算出生年份
  const birthYear = useMemo(() => {
    if (!birthday) return null;
    const [datePart] = birthday.split(' ');
    const [year] = datePart.split('-').map(Number);
    return year;
  }, [birthday]);
  
  // 准备 ECharts 数据格式
  const chartData = useMemo(() => {
    const ages = Array.from({ length: 80 }, (_, i) => i);
    const kLineData = ages.map((age) => {
      const [open, close, low, high] = data[age] || [100, 100, 100, 100];
      return [open, close, low, high];
    });
    
    // 生成 X 轴标签：显示年龄和年份
    const xAxisLabels = ages.map((age) => {
      if (birthYear !== null) {
        const year = birthYear + age;
        return `${age}岁\n${year}年`;
      }
      return `${age}岁`;
    });

    return {
      ages,
      kLineData,
      xAxisLabels,
    };
  }, [data, birthYear]);

  // ECharts 配置选项
  const option = useMemo(() => {
    return {
      backgroundColor: "transparent",
      grid: {
        left: "10%",
        right: "8%",
        top: "10%",
        bottom: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: chartData.xAxisLabels,
        name: "年龄 / 年份",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: {
          color: "#00ff41",
          fontSize: 14,
          fontFamily: "monospace",
        },
        axisLine: {
          lineStyle: {
            color: "#333",
          },
        },
        axisLabel: {
          color: "#888",
          fontSize: 11,
          fontFamily: "monospace",
          interval: 4, // 每5年显示一次标签（0, 5, 10, 15...）
          formatter: (value: string) => {
            // 提取年龄
            const ageMatch = value.match(/(\d+)岁/);
            const age = ageMatch ? parseInt(ageMatch[1]) : 0;
            
            // 显示年龄和年份
            if (birthYear !== null) {
              const year = birthYear + age;
              return `${age}岁\n${year}年`;
            }
            return `${age}岁`;
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#1a1a1a",
            type: "dashed",
          },
        },
      },
      yAxis: {
        type: "value",
        name: "人生指数",
        nameLocation: "middle",
        nameGap: 50,
        nameTextStyle: {
          color: "#00ff41",
          fontSize: 14,
          fontFamily: "monospace",
        },
        axisLine: {
          lineStyle: {
            color: "#333",
          },
        },
        axisLabel: {
          color: "#888",
          fontSize: 12,
          fontFamily: "monospace",
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#1a1a1a",
            type: "dashed",
          },
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          lineStyle: {
            color: "#00ff41",
            width: 1,
            type: "dashed",
          },
        },
        backgroundColor: "rgba(10, 10, 10, 0.95)",
        borderColor: "#00ff41",
        borderWidth: 1,
        textStyle: {
          color: "#00ff41",
          fontSize: 12,
          fontFamily: "monospace",
        },
        formatter: (params: any) => {
          if (!params || !Array.isArray(params) || params.length === 0) {
            return "";
          }
          const param = params[0];
          const axisValue = param.axisValue as string;
          // 从标签中提取年龄（可能是 "25岁\n2020年" 或 "25岁" 格式）
          const ageMatch = axisValue.match(/(\d+)岁/);
          const age = ageMatch ? parseInt(ageMatch[1]) : 0;
          const value = param.value as number[];
          const [open, close, low, high] = value;
          const isRising = close >= open;
          const changePercent = ((close - open) / open) * 100;
          const event = generateEventPrediction(age, [open, close, low, high]);
          
          // 计算年份
          const year = birthYear !== null ? birthYear + age : null;
          const yearText = year ? ` (${year}年)` : '';

          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">
                ${age} 岁${yearText}
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #888;">开盘：</span>
                <span style="color: ${isRising ? "#00ff41" : "#ff3b30"};">
                  ${open.toFixed(2)}
                </span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #888;">收盘：</span>
                <span style="color: ${isRising ? "#00ff41" : "#ff3b30"};">
                  ${close.toFixed(2)}
                </span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #888;">最高：</span>
                <span style="color: #00ff41;">${high.toFixed(2)}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #888;">最低：</span>
                <span style="color: #ff3b30;">${low.toFixed(2)}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #888;">涨跌：</span>
                <span style="color: ${isRising ? "#00ff41" : "#ff3b30"};">
                  ${isRising ? "+" : ""}${changePercent.toFixed(2)}%
                </span>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #333;">
                <div style="color: #888; font-size: 11px; margin-bottom: 4px;">
                  核心事件预测：
                </div>
                <div style="color: #00ff41; font-size: 12px;">
                  ${event}
                </div>
              </div>
            </div>
          `;
        },
      },
      series: [
        {
          name: "人生指数",
          type: "candlestick",
          data: chartData.kLineData,
          itemStyle: {
            color: "#00ff41", // 上涨颜色（绿色）
            color0: "#ff3b30", // 下跌颜色（红色）
            borderColor: "#00ff41",
            borderColor0: "#ff3b30",
          },
          emphasis: {
            itemStyle: {
              color: "#00ff41",
              color0: "#ff3b30",
              borderColor: "#00ff41",
              borderColor0: "#ff3b30",
              borderWidth: 2,
            },
          },
        },
      ],
    };
  }, [chartData, birthYear]);

  return (
    <div className="w-full h-full">
      {/* 统计信息面板 */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3">
          <div className="text-xs text-gray-500 font-mono uppercase mb-1">初始指数</div>
          <div className="text-lg font-bold text-[#00ff41] font-mono">
            {stats.firstOpen.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3">
          <div className="text-xs text-gray-500 font-mono uppercase mb-1">当前指数</div>
          <div className="text-lg font-bold text-[#00ff41] font-mono">
            {stats.lastClose.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3">
          <div className="text-xs text-gray-500 font-mono uppercase mb-1">总涨幅</div>
          <div className={`text-lg font-bold font-mono ${
            stats.totalReturn >= 0 ? "text-[#00ff41]" : "text-[#ff3b30]"
          }`}>
            {stats.totalReturn >= 0 ? "+" : ""}{stats.totalReturn.toFixed(2)}%
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3">
          <div className="text-xs text-gray-500 font-mono uppercase mb-1">波动率</div>
          <div className="text-lg font-bold text-[#00ff41] font-mono">
            {stats.volatility.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 关键指标 */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3">
          <div className="text-xs text-gray-500 font-mono uppercase mb-1">历史最高</div>
          <div className="text-sm font-bold text-[#00ff41] font-mono">
            {stats.maxHigh.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600 font-mono mt-1">
            {stats.maxHighAge} 岁
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3">
          <div className="text-xs text-gray-500 font-mono uppercase mb-1">历史最低</div>
          <div className="text-sm font-bold text-[#ff3b30] font-mono">
            {stats.minLow.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600 font-mono mt-1">
            {stats.minLowAge} 岁
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3">
          <div className="text-xs text-gray-500 font-mono uppercase mb-1">平均指数</div>
          <div className="text-sm font-bold text-[#00ff41] font-mono">
            {stats.avgClose.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3">
          <div className="text-xs text-gray-500 font-mono uppercase mb-1">数据周期</div>
          <div className="text-sm font-bold text-[#00ff41] font-mono">
            0-79 岁
          </div>
          <div className="text-xs text-gray-600 font-mono mt-1">
            80 个数据点
          </div>
        </div>
      </div>

      {/* 图例说明 */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#00ff41] border border-[#00ff41]"></div>
          <span className="text-gray-400">上涨（收盘价 ≥ 开盘价）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#ff3b30] border border-[#ff3b30]"></div>
          <span className="text-gray-400">下跌（收盘价 &lt; 开盘价）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-[#00ff41]"></div>
          <span className="text-gray-400">上影线（最高价）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-[#ff3b30]"></div>
          <span className="text-gray-400">下影线（最低价）</span>
        </div>
      </div>

      {/* K 线图 */}
      <div className="w-full min-h-[500px]">
        <ReactECharts
          option={option}
          style={{ width: "100%", height: "100%", minHeight: "500px" }}
          opts={{ renderer: "canvas" }}
        />
      </div>

      {/* 说明文字 */}
      <div className="mt-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded text-xs text-gray-500 font-mono leading-relaxed">
        <div className="mb-2">
          <span className="text-[#00ff41]">●</span> 本 K 线图基于生辰八字、大运流年、五行能量和十神强弱计算生成，展示 0-79 岁共 80 年的人生指数走势。
        </div>
        <div className="mb-2">
          <span className="text-[#00ff41]">●</span> 每根 K 线代表一年，包含开盘价（年初状态）、收盘价（年末状态）、最高价（年度峰值）、最低价（年度低谷）。
        </div>
        <div className="mb-2">
          <span className="text-[#00ff41]">●</span> 绿色 K 线表示该年度整体向好（收盘价高于开盘价），红色 K 线表示该年度整体向下（收盘价低于开盘价）。
        </div>
        <div>
          <span className="text-[#00ff41]">●</span> 鼠标悬停可查看详细数据及核心事件预测。数据仅供参考，不构成任何建议。
        </div>
      </div>
    </div>
  );
}

