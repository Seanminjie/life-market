"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { generateLifeData, KLineData } from "@/lib/engine";
import LifeKLine from "@/components/LifeKLine";
import ShareCard from "@/components/ShareCard";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kLineData, setKLineData] = useState<KLineData[]>([]);
  const [report, setReport] = useState<string>("");
  const [generatingReport, setGeneratingReport] = useState(false);

  const name = searchParams.get("name") || "";
  const birthday = searchParams.get("birthday") || "";

  useEffect(() => {
    if (!birthday) {
      setError("缺少必要参数");
      setLoading(false);
      return;
    }

    try {
      // 生成 K 线数据
      const data = generateLifeData(birthday);
      setKLineData(data);
      setLoading(false);
    } catch (err) {
      setError("生成 K 线数据失败");
      setLoading(false);
      console.error(err);
    }
  }, [birthday]);

  const handleGenerateReport = async () => {
    if (!birthday) return;

    setGeneratingReport(true);
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birthday,
          name,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.report);
      } else {
        setError(data.error || "生成报告失败");
      }
    } catch (err) {
      setError("生成报告时发生错误");
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#00ff41] text-xl font-mono mb-4">正在生成数据...</div>
          <div className="w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-[#ff3b30] text-xl font-mono mb-4">{error}</div>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#00ff41] text-[#0a0a0a] font-bold font-mono rounded-md hover:bg-[#00e63a] transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 头部 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="text-[#00ff41]">人生大盘</span>
            <span className="text-gray-400 mx-3">|</span>
            <span className="text-gray-500 text-2xl md:text-3xl font-mono">
              Life Market
            </span>
          </h1>
          {name && (
            <p className="text-lg text-gray-400 font-mono">
              {name} · {birthday}
            </p>
          )}
        </div>

        {/* K 线图 */}
        <div className="bg-[#0a0a0a] border border-[#00ff41]/20 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-mono text-[#00ff41] mb-2 uppercase tracking-wider">
              K 线走势图
            </h2>
            <p className="text-sm text-gray-400 font-mono">
              基于您的生辰八字，通过五行能量、十神强弱、大运流年等维度计算生成的人生指数走势
            </p>
          </div>
          <LifeKLine data={kLineData} name={name} />
        </div>

        {/* 分享卡片 */}
        <div className="flex justify-center">
          <ShareCard data={kLineData} name={name} birthday={birthday} />
        </div>

        {/* 招股说明书 */}
        <div className="bg-[#0a0a0a] border border-[#00ff41]/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-mono text-[#00ff41] uppercase tracking-wider">
              人生招股说明书
            </h2>
            {!report && (
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="px-4 py-2 bg-[#00ff41] text-[#0a0a0a] font-bold font-mono text-sm rounded-md hover:bg-[#00e63a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingReport ? "生成中..." : "生成报告"}
              </button>
            )}
          </div>

          {generatingReport && (
            <div className="text-center py-8">
              <div className="text-[#00ff41] font-mono mb-4">正在生成报告...</div>
              <div className="w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          {report && (
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                {report}
              </div>
            </div>
          )}

          {!report && !generatingReport && (
            <div className="text-center py-8 text-gray-500 font-mono">
              点击"生成报告"按钮，获取您的人生招股说明书
            </div>
          )}
        </div>

        {/* 返回按钮 */}
        <div className="text-center pb-8">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#00ff41] text-[#0a0a0a] font-bold font-mono rounded-md hover:bg-[#00e63a] transition-colors"
          >
            重新复盘
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#00ff41] text-xl font-mono mb-4">加载中...</div>
            <div className="w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}

