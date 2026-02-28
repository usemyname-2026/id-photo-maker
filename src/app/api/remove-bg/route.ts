import { NextRequest, NextResponse } from 'next/server';

/**
 * 去背景接口
 * 接收前端上传的图片，调用 Remove.bg 扣图，返回透明背景 PNG
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(
        { error: '请先在 .env.local 中配置 REMOVE_BG_API_KEY（在 remove.bg 注册获取）' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: '请上传图片文件' },
        { status: 400 }
      );
    }

    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', file);
    removeBgFormData.append('size', 'auto');
    // 不传 bg_color，默认返回透明背景 PNG

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.errors?.[0]?.title || `Remove.bg API 错误: ${response.status}` },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';

    return NextResponse.json({
      success: true,
      image: `data:${contentType};base64,${base64}`,
    });
  } catch (error) {
    console.error('Remove.bg 处理错误:', error);
    return NextResponse.json(
      { error: '处理失败，请稍后重试' },
      { status: 500 }
    );
  }
}
