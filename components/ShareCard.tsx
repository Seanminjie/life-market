"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { KLineData } from "@/lib/engine";

interface ShareCardProps {
  data: KLineData[];
  name?: string;
  birthday?: string;
}

/**
 * 计算人生总估值
 */
function calculateTotalValuation(data: KLineData[]): string {
  // 计算平均收盘价
  const avgClose = data.reduce((sum, [open, close]) => sum + close, 0) / data.length;
  
  // 计算总涨幅
  const firstClose = data[0]?.[1] || 100;
  const lastClose = data[data.length - 1]?.[1] || 100;
  const totalReturn = ((lastClose - firstClose) / firstClose) * 100;
  
  // 生成一个高大上的估值数字（基于平均收盘价和总涨幅）
  const baseValue = avgClose * 1000; // 基础估值
  const multiplier = 1 + Math.abs(totalReturn) / 100; // 根据涨幅调整
  const valuation = baseValue * multiplier;
  
  // 格式化为带单位的数字
  if (valuation >= 100000000) {
    return `${(valuation / 100000000).toFixed(2)}亿`;
  } else if (valuation >= 10000) {
    return `${(valuation / 10000).toFixed(2)}万`;
  } else {
    return valuation.toFixed(2);
  }
}

/**
 * 根据 K 线数据生成标签
 */
function generateTags(data: KLineData[]): string[] {
  const tags: string[] = [];
  
  // 计算统计数据
  const closes = data.map(([open, close]) => close);
  const firstClose = closes[0] || 100;
  const lastClose = closes[closes.length - 1] || 100;
  const totalReturn = ((lastClose - firstClose) / firstClose) * 100;
  
  // 计算波动率
  const avgClose = closes.reduce((sum, val) => sum + val, 0) / closes.length;
  const variance = closes.reduce((sum, val) => sum + Math.pow(val - avgClose, 2), 0) / closes.length;
  const volatility = Math.sqrt(variance) / avgClose;
  
  // 计算早期表现（前20年）
  const earlyData = data.slice(0, 20);
  const earlyAvg = earlyData.reduce((sum, [open, close]) => sum + close, 0) / earlyData.length;
  const earlyReturn = ((earlyAvg - firstClose) / firstClose) * 100;
  
  // 计算后期表现（后20年）
  const lateData = data.slice(-20);
  const lateAvg = lateData.reduce((sum, [open, close]) => sum + close, 0) / lateData.length;
  const lateReturn = ((lateAvg - firstClose) / firstClose) * 100;
  
  // 生成标签
  if (totalReturn > 50 && volatility > 0.2) {
    tags.push("成长股");
  }
  
  if (earlyReturn > 30) {
    tags.push("潜力黑马");
  }
  
  if (volatility < 0.15 && totalReturn > 0) {
    tags.push("抗跌蓝筹");
  }
  
  if (lateReturn > 40) {
    tags.push("价值股");
  }
  
  if (totalReturn < -20) {
    tags.push("风险提示");
  }
  
  if (volatility > 0.3) {
    tags.push("高波动");
  }
  
  if (totalReturn > 100) {
    tags.push("超级成长");
  }
  
  // 如果没有标签，给一个默认标签
  if (tags.length === 0) {
    tags.push("稳健型");
  }
  
  return tags.slice(0, 3); // 最多显示3个标签
}

export default function ShareCard({ data, name = "人生大盘", birthday }: ShareCardProps) {
  const valuation = useMemo(() => calculateTotalValuation(data), [data]);
  const tags = useMemo(() => generateTags(data), [data]);
  
  // 准备缩略 K 线图数据（只显示关键点，减少数据量）
  const chartData = useMemo(() => {
    // 每5年取一个点，共16个点
    const sampleIndices = Array.from({ length: 16 }, (_, i) => Math.floor((i / 15) * (data.length - 1)));
    const kLineData = sampleIndices.map((idx) => {
      const [open, close, low, high] = data[idx] || [100, 100, 100, 100];
      return [open, close, low, high];
    });
    const ages = sampleIndices;
    
    return { ages, kLineData };
  }, [data]);
  
  // ECharts 配置（缩略版）
  const chartOption = useMemo(() => {
    return {
      backgroundColor: "transparent",
      grid: {
        left: "5%",
        right: "5%",
        top: "5%",
        bottom: "5%",
        containLabel: false,
      },
      xAxis: {
        type: "category",
        data: chartData.ages,
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          type: "candlestick",
          data: chartData.kLineData,
          itemStyle: {
            color: "#00ff41",
            color0: "#ff3b30",
            borderColor: "#00ff41",
            borderColor0: "#ff3b30",
            borderWidth: 1,
          },
        },
      ],
    };
  }, [chartData]);
  
  return (
    <div className="relative w-full max-w-md mx-auto bg-[#0a0a0a] border border-[#00ff41]/20 rounded-lg p-6 font-mono shadow-[0_0_20px_rgba(0,255,65,0.1)]">
      {/* 顶部：人生总估值 */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-[#00ff41] rounded-full"></span>
          人生总估值
        </div>
        <div className="text-4xl font-bold text-[#00ff41] tracking-tight">
          ¥{valuation}
        </div>
        {name && (
          <div className="text-sm text-gray-400 mt-2 flex items-center gap-2">
            <span className="text-[#00ff41]">●</span>
            {name}
          </div>
        )}
      </div>
      
      {/* 中间：缩略 K 线图 */}
      <div className="mb-6 h-32 bg-[#0a0a0a] border border-[#1a1a1a] rounded p-2 relative overflow-hidden">
        <div className="absolute top-2 left-2 text-[10px] text-gray-600 z-10">
          K线走势
        </div>
        <ReactECharts
          option={chartOption}
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>
      
      {/* 底部：标签和二维码区域 */}
      <div className="flex items-end justify-between gap-4">
        {/* 标签区域 */}
        <div className="flex flex-wrap gap-2 flex-1">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded border border-[#00ff41]/30 text-[#00ff41] bg-[#00ff41]/5 hover:bg-[#00ff41]/10 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* 二维码区域 */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-[#1a1a1a] border border-[#333] rounded flex items-center justify-center relative overflow-hidden">
            {/* 二维码占位图案（固定图案） */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-4 gap-0.5 p-1">
                {[1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1].map((val, i) => (
                  <div
                    key={i}
                    className={`aspect-square ${val ? "bg-[#00ff41]" : "bg-transparent"}`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-600 text-center relative z-10">
              <div className="mb-1 font-bold">QR</div>
              <div className="text-[8px]">扫码查看</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部装饰线 */}
      <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
        <div className="text-[10px] text-gray-600 text-center flex items-center justify-center gap-2">
          <span className="text-[#00ff41]">●</span>
          <span>人生大盘 · Life Market</span>
          <span className="text-[#00ff41]">●</span>
        </div>
      </div>
    </div>
  );
}

