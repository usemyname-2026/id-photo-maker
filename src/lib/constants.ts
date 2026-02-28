// 常用证件照尺寸（像素，300 DPI 标准）
// 一寸：25×35mm；二寸：35×49mm
export const PHOTO_SIZES = [
  { id: '1inch', name: '一寸', width: 295, height: 413, description: '25×35mm' },
  { id: '2inch', name: '二寸', width: 413, height: 626, description: '35×49mm' },
] as const;

export const BACKGROUND_COLORS = [
  { id: 'white', name: '白色', value: '#FFFFFF', class: 'bg-white' },
  { id: 'red', name: '红色', value: '#B22222', class: 'bg-[#B22222]' },
  { id: 'blue', name: '蓝色', value: '#4169E1', class: 'bg-[#4169E1]' },
] as const;

// 支付弹窗配置 - 请替换为你的收款码和微信号
export const PAYMENT_CONFIG = {
  wechatId: 'your_wechat_id', // 替换为你的微信号
  wechatQrPath: '/wechat-qr.png', // 将微信收款码图片放到 public/wechat-qr.png
};
