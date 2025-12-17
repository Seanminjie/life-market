import { NextRequest, NextResponse } from 'next/server';
import { generatePrompt } from '@/lib/prompt';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-6c2d30aef42a4503a393705dfec89612';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthday, name } = body;

    if (!birthday) {
      return NextResponse.json(
        { error: '缺少必要参数：birthday' },
        { status: 400 }
      );
    }

    // 生成 Prompt
    const prompt = generatePrompt(birthday, name);

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API Error:', errorData);
      return NextResponse.json(
        { error: '调用 DeepSeek API 失败', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const report = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      report,
      prompt, // 可选：返回生成的 prompt 用于调试
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: '生成报告时发生错误', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

