'use client';

import { useState, useRef, useEffect } from 'react';
import { PHOTO_SIZES, BACKGROUND_COLORS } from '@/lib/constants';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

/** 使用 Canvas 将透明人像合成到指定背景色 */
function compositeWithBackground(
  transparentImageUrl: string,
  bgColorValue: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bgColorValue;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = transparentImageUrl;
  });
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('white');
  const [compositePreview, setCompositePreview] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState<string>('1inch');
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 底色切换时，用 Canvas 合成透明人像与背景色，实时更新预览
  useEffect(() => {
    if (!resultUrl) {
      setCompositePreview(null);
      return;
    }
    const bgConfig = BACKGROUND_COLORS.find((c) => c.id === bgColor);
    if (!bgConfig) return;

    compositeWithBackground(resultUrl, bgConfig.value).then(setCompositePreview);
  }, [resultUrl, bgColor]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件（JPG、PNG 等）');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResultUrl(null);
    setPreviewUrl(URL.createObjectURL(file));
    setState('idle');
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setError('请先选择图片');
      return;
    }

    setState('processing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '处理失败');
      }

      setResultUrl(data.image);
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败');
      setState('error');
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;

    const sizeConfig = PHOTO_SIZES.find((s) => s.id === photoSize);
    if (!sizeConfig) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = resultUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = sizeConfig.width;
    canvas.height = sizeConfig.height;
    const ctx = canvas.getContext('2d')!;

    const bgColorConfig = BACKGROUND_COLORS.find((c) => c.id === bgColor);
    if (bgColorConfig) {
      ctx.fillStyle = bgColorConfig.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const scale = Math.max(
      canvas.width / img.width,
      canvas.height / img.height
    );
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    const link = document.createElement('a');
    link.download = `证件照_${sizeConfig.name}_${bgColor}底.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setState('idle');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            自动证件照制作
          </h1>
          <p className="mt-2 text-slate-600">
            上传照片，自动去背景，一键生成红/蓝/白底证件照
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            {/* 上传区域 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                1. 上传照片
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="flex justify-center gap-4 flex-wrap">
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="原图"
                        className="max-h-48 rounded-lg object-contain border border-slate-200"
                      />
                      <span className="absolute -top-2 -right-2 bg-slate-500 text-white text-xs px-2 py-0.5 rounded">
                        原图
                      </span>
                    </div>
                    {(compositePreview ?? resultUrl) && (
                      <div className="relative">
                        <img
                          src={compositePreview ?? resultUrl}
                          alt="证件照预览"
                          className="max-h-48 rounded-lg object-contain border-2 border-indigo-200"
                        />
                        <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded">
                          {bgColor === 'white' ? '白底' : bgColor === 'blue' ? '蓝底' : '红底'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500">
                    <svg
                      className="mx-auto h-12 w-12 text-slate-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2">点击或拖拽上传照片</p>
                    <p className="mt-1 text-sm">支持 JPG、PNG 格式</p>
                  </div>
                )}
              </div>
            </div>

            {/* 底色切换 - Canvas 实时合成预览 */}
            {resultUrl && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  切换底色（实时预览）
                </label>
                <div className="flex gap-3">
                  {BACKGROUND_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setBgColor(color.id)}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        bgColor === color.id
                          ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                      style={
                        bgColor === color.id
                          ? {
                              backgroundColor: color.value,
                              color: color.id === 'white' ? '#334155' : '#fff',
                              ringColor: '#6366f1',
                            }
                          : {}
                      }
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 尺寸选择 - 下拉菜单 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                选择证件照尺寸
              </label>
              <select
                value={photoSize}
                onChange={(e) => setPhotoSize(e.target.value)}
                className="w-full sm:w-auto min-w-[200px] py-3 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {PHOTO_SIZES.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}（{size.description}）
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-slate-500">
                导出时将按所选尺寸裁剪，符合标准证件照比例
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleProcess}
                disabled={!selectedFile || state === 'processing'}
                className="flex-1 py-3 px-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state === 'processing' ? '处理中...' : '去除背景'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!resultUrl}
                className="flex-1 py-3 px-6 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下载证件照
              </button>
              <button
                onClick={handleReset}
                className="py-3 px-6 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                重新开始
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          使用 Remove.bg API 进行背景去除 · 请确保照片光线充足、人脸清晰
        </p>
      </div>
    </main>
  );
}
