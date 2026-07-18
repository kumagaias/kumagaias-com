export interface Work {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  url?: string;
  iosUrl?: string;
  androidUrl?: string;
  githubUrl?: string;
  screenshot: string;         // thumbnail used on card
  screenshots?: string[];     // full gallery shown in detail modal (include thumbnail as first)
  techStack: string[];
  types: ("web" | "iOS" | "Android" | "CLI")[];
  releaseDate: string; // "YYYY.M"
  award?: string;
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
    description:
      "登録した地域の学級閉鎖を毎朝プッシュ通知し、インフルエンザ・新型コロナなど主要感染症の閉鎖クラス数を地図で確認できるアプリ。通知レベル設定や複数エリア登録にも対応。",
    descriptionEn:
      "An app that sends morning push notifications for class closures in registered areas and shows closure counts for major infectious diseases such as influenza and COVID-19 on a map. Supports alert-level settings and multiple registered areas.",
    url: "https://gakkyu-alert.kumagaias.com/",
    iosUrl: "https://apps.apple.com/jp/app/%E5%AD%A6%E7%B4%9A%E3%82%A2%E3%83%A9%E3%83%BC%E3%83%88/id6761877828",
    androidUrl: "https://play.google.com/store/apps/details?id=jp.gakkyu_alert.app&hl=ja",
    screenshot: "/works/gakkyu-alert/screenshot-gakkyu-alert.png",
    screenshots: [
      "/works/gakkyu-alert/screenshot-gakkyu-alert.png",
      "/works/gakkyu-alert/screenshot-gakkyu-alert-1.png",
      "/works/gakkyu-alert/screenshot-gakkyu-alert-2.png",
      "/works/gakkyu-alert/screenshot-gakkyu-alert-4.png",
      "/works/gakkyu-alert/screenshot-gakkyu-alert-5.png",
    ],
    techStack: ["React Native", "AWS", "Claude Code", "Kiro"],
    types: ["web", "iOS", "Android"],
    releaseDate: "2026.4",
    period: "2〜3週間",
    periodEn: "2–3 weeks",
    motivation:
      "感染症の流行が多い小学校・幼稚園・保育園で、早めに対策を打ってリスク回避できるアプリを作りたかったため",
    motivationEn:
      "I wanted to build an app that helps parents at elementary schools and daycare centers detect outbreaks early and take precautions before illness spreads.",
    painPoint:
      "Google Play のクローズドテスト対応と、審査要件に合わせた申請内容の整理",
    painPointEn:
      "Handling Google Play closed testing and organizing submission details to meet review requirements.",
    price: "無料",
  },
  {
    title: "tailfeed",
    description:
      "Web ベースの RSS リーダー。記事一覧、検索、ストック、詳細プレビューをひとつの画面で扱えるようにし、日々のニュース確認をブラウザで素早く完結できます。",
    descriptionEn:
      "A web-based RSS reader for daily news scanning, with article lists, search, stock, and detail previews in a single browser interface.",
    screenshot: "/works/tailfeed/tailfeed-web.png",
    screenshots: [
      "/works/tailfeed/tailfeed-web.png",
      "/works/tailfeed/tailfeed-1.png",
      "/works/tailfeed/tailfeed-2.png",
    ],
    techStack: ["Go", "React", "RSS"],
    types: ["web"],
    releaseDate: "2026.5",
    period: "約1時間",
    periodEn: "About 1 hour",
    motivation:
      "日々の RSS チェックと記事要約を、一覧性の高い Web UI で素早く完結できるようにしたかったため",
    motivationEn:
      "I wanted to make daily RSS scanning and article summaries fast to complete in a scannable web UI.",
    painPoint: "特になし",
    painPointEn: "None in particular",
    price: "無料",
  },
  {
    title: "JetOni",
    description:
      "Reddit (Devvit) 上で動く 3D マルチプレイヤーおにごっこゲーム。ジェットパックを持つ「鬼」が、プロシージャル生成された都市で「逃げる人」を追いかける非対称アクション。",
    descriptionEn:
      "A first-person, asymmetric 3D tag game running natively on Reddit via Devvit. Jetpack-equipped Oni (chasers) hunt Runners across a procedurally generated futuristic city.",
    url: "https://devpost.com/software/jetoni",
    screenshot: "/works/jetoni/screenshot-jetoni.jpg",
    screenshots: [
      "/works/jetoni/screenshot-jetoni.jpg",
      "/works/jetoni/jetoni-gameplay-1.jpg",
      "/works/jetoni/jetoni-gameplay-2.jpg",
    ],
    techStack: ["Three.js", "TypeScript", "Devvit", "WebGL"],
    types: ["web"],
    releaseDate: "2025.9",
    award: "Reddit and Kiro: Community Games Challenge / Winner Honorable Mention - Kiro Developer Experience",
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
