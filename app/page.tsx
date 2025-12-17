"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthDate || !birthTime) {
      alert("请填写完整的出生日期和时间");
      return;
    }

    setIsSubmitting(true);

    try {
      // 组合生日字符串：YYYY-MM-DD HH:mm
      const birthday = `${birthDate} ${birthTime}`;
      
      // 跳转到结果页面
      const params = new URLSearchParams({
        name: name || "",
        birthday: birthday,
      });
      
      router.push(`/result?${params.toString()}`);
    } catch (error) {
      console.error("提交失败:", error);
      alert("提交失败，请重试");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <main className="w-full max-w-2xl">
        {/* 标题区域 */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="text-[#00ff41]">人生大盘</span>
            <span className="text-gray-400 mx-3">|</span>
            <span className="text-gray-500 text-3xl md:text-4xl font-mono">
              Life Market
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light tracking-wide">
            查看你的生命 K 线与市值报告
          </p>
        </div>

        {/* 表单区域 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名输入 */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-mono text-[#00ff41] uppercase tracking-wider"
            >
              姓名
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-4 py-3 rounded-md transition-all duration-200 placeholder:text-gray-600 placeholder:font-mono"
              required
            />
          </div>

          {/* 出生日期 */}
          <div className="space-y-2">
            <label
              htmlFor="birthDate"
              className="block text-sm font-mono text-[#00ff41] uppercase tracking-wider"
            >
              出生日期
            </label>
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 rounded-md transition-all duration-200 font-mono"
              required
            />
          </div>

          {/* 出生时间 */}
          <div className="space-y-2">
            <label
              htmlFor="birthTime"
              className="block text-sm font-mono text-[#00ff41] uppercase tracking-wider"
            >
              出生时间
            </label>
            <input
              type="time"
              id="birthTime"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full px-4 py-3 rounded-md transition-all duration-200 font-mono"
              required
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-[#00ff41] text-[#0a0a0a] font-bold font-mono text-lg uppercase tracking-wider rounded-md transition-all duration-200 hover:bg-[#00e63a] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "处理中..." : "开始复盘"}
          </button>
        </form>

        {/* 装饰性元素 */}
        <div className="mt-16 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#00ff41]"></div>
          <div className="w-2 h-2 bg-[#00ff41] rounded-full animate-pulse"></div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#00ff41]"></div>
        </div>
      </main>
    </div>
  );
}
