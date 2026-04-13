export interface Work {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  url: string;
  iosUrl?: string;
  androidUrl?: string;
  githubUrl?: string;
  screenshot: string;         // thumbnail used on card
  screenshots?: string[];     // full gallery shown in detail modal (include thumbnail as first)
  techStack: string[];
  types: ("web" | "iOS" | "Android")[];
  releaseDate: string; // "YYYY.M"
  period: string;
  periodEn?: string;
  motivation: string;
  motivationEn?: string;
  painPoint: string;
  painPointEn?: string;
  price: "無料" | "有料";
}

export const works: Work[] = [
  {
    title: "学級アラート",
    titleEn: "Class Alert",
    description: "学校の学級閉鎖・出席停止情報をリアルタイムで確認できるサービス",
    descriptionEn: "A service to check class closure and absence notices from schools in real time",
    url: "https://gakkyu-alert.kumagaias.com/",
    githubUrl: "https://github.com/kumagaias/gakkyu-alert",
    screenshot: "/screenshot-gakkyu-alert.png",
    techStack: ["React Native", "AWS", "Claude Code", "Kiro"],
    types: ["web", "iOS"],
    releaseDate: "2026.4",
    period: "2〜3週間",
    periodEn: "2–3 weeks",
    motivation:
      "感染症の流行が多い小学校・幼稚園・保育園で、早めに対策を打ってリスク回避できるアプリを作りたかったため",
    motivationEn:
      "I wanted to build an app that helps parents at elementary schools and daycare centers detect outbreaks early and take precautions before illness spreads.",
    painPoint: "データソースが自治体や国によってバラバラな点",
    painPointEn: "Data sources vary widely by municipality and authority",
    price: "無料",
  },
  {
    title: "JetOni",
    description:
      "Reddit (Devvit) 上で動く 3D マルチプレイヤーおにごっこゲーム。ジェットパックを持つ「鬼」が、プロシージャル生成された都市で「逃げる人」を追いかける非対称アクション。Reddit × Kiro Community Games Challenge にて Honorable Mention 受賞。",
    descriptionEn:
      "A first-person, asymmetric 3D tag game running natively on Reddit via Devvit. Jetpack-equipped Oni (chasers) hunt Runners across a procedurally generated futuristic city. Won Honorable Mention at the Reddit × Kiro Community Games Challenge.",
    url: "https://devpost.com/software/jetoni",
    screenshot: "/screenshot-jetoni.jpg",
    screenshots: [
      "/screenshot-jetoni.jpg",
      "/jetoni-gameplay-1.jpg",
      "/jetoni-gameplay-2.jpg",
    ],
    techStack: ["Three.js", "TypeScript", "Devvit", "WebGL"],
    types: ["web"],
    releaseDate: "2025.9",
    period: "ハッカソン (48h)",
    periodEn: "Hackathon (48h)",
    motivation:
      "Reddit × Kiro のハッカソンで、Reddit 上で動く本格的な 3D マルチプレイヤーゲームという前例のないものを作りたかった",
    motivationEn:
      "At the Reddit × Kiro hackathon, we wanted to push the limits of what's possible on Reddit by building a high-fidelity 3D multiplayer game that runs entirely inside the platform.",
    painPoint:
      "Devvit の iframe 制約の中での WebGL パフォーマンス最適化と、リアルタイムマルチプレイヤー状態の同期",
    painPointEn:
      "Optimizing WebGL performance within Devvit's iframe constraints, and synchronizing complex real-time multiplayer state across clients.",
    price: "無料",
  },
];
