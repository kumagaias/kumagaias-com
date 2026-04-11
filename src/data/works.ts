export interface Work {
  title: string;
  description: string;
  url: string;
  screenshot: string;
}

export const works: Work[] = [
  {
    title: "学級アラート",
    description: "学校の学級閉鎖・出席停止情報をリアルタイムで確認できるサービス",
    url: "https://gakkyu-alert.kumagaias.com/",
    screenshot: "https://gakkyu-alert.kumagaias.com/og-image.png",
  },
];
