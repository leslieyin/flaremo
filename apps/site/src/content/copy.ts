import { type Locale, normalizeLocale } from "@/lib/seo";

export type HomeContent = {
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  primaryCta: string;
  secondaryCta: string;
  statMemos: string;
  statPhotos: string;
  statServers: string;
  statUptime: string;
  featuresBadge: string;
  featuresHeading: string;
  featuresSubtitle: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  comparisonBadge: string;
  comparisonHeading: string;
  comparisonSubtitle: string;
  comparisonRows: Array<{
    label: string;
    cloudflare: string;
    nas: string;
    vps: string;
  }>;
  screenshotsHeading: string;
  screenshotsSubtitle: string;
  faqBadge: string;
  faqHeading: string;
  faqItems: Array<{
    q: string;
    a: string;
  }>;
  ctaBadge: string;
  ctaHeading: string;
  ctaSubtitle: string;
  ctaButton: string;
};

const EN_HOME: HomeContent = {
  heroEyebrow: "Open-source · Cloudflare Edge-native · Memos-compatible",
  heroTitleLine1: "Zero Servers. Forever Yours.",
  heroTitleLine2: "Your Second Brain on the Edge.",
  heroSubtitle:
    "Next-generation knowledge management built natively on Cloudflare Edge (Workers, D1, R2). Zero VPS maintenance, full Memos API ecosystem support, and persistent MCP memory for your AI copilots.",
  primaryCta: "Read Deploy Guide",
  secondaryCta: "GitHub Source",
  statMemos: "~2.5M text memos",
  statPhotos: "~10,000 photos · $0 egress",
  statServers: "300+ edge datacenters",
  statUptime: "Multi-region persistence & backup",
  featuresBadge: "Why FlareMo",
  featuresHeading: "Engineered for Focus and Longevity",
  featuresSubtitle:
    "Leave heavy server maintenance behind and enjoy pure, reliable, AI-native knowledge management",
  features: [
    {
      title: "Enterprise Durability",
      description:
        "Memos live in your Cloudflare D1 database and R2 bucket with multi-region persistence. Drive failure, power outages, and moving hardware won't touch your data.",
    },
    {
      title: "Generous Free Tier",
      description:
        "Cloudflare's free tier provides 5GB D1 database (~2.5 million text memos) and 10GB R2 storage (~10,000 photos). R2 has $0 egress fees so sharing notes won't surprise you with bandwidth charges.",
    },
    {
      title: "Offline-First & PWA",
      description:
        "Installable PWA for iOS, Android, and desktop. Write seamlessly on planes or subways. Drafts save instantly locally and sync sequentially when connectivity returns.",
    },
    {
      title: "AI-Native Long-Term Memory",
      description:
        "Built-in Model Context Protocol (MCP) endpoint allows AI agents (Claude, Cursor, Codex) to read and update your preferences and project context with full human auditability.",
    },
    {
      title: "Team Collaboration & Roles",
      description:
        "Owner, Admin, and Member roles with 3-tier visibility (private, team-visible, public). Safe offboarding deletes private data cleanly.",
    },
    {
      title: "Memos Compatible & Import/Export",
      description:
        "Full compatibility with Memos /api/v1 endpoints and OpenAPI. Direct integration with existing third-party clients like Moe Memos, plus one-click import and export.",
    },
  ],
  comparisonBadge: "Side-by-Side",
  comparisonHeading: "Why Cloudflare Native Wins",
  comparisonSubtitle:
    "Comparing Cloudflare Serverless against home NAS and traditional VPS self-hosting",
  comparisonRows: [
    {
      label: "Data Location",
      cloudflare: "Cloudflare multi-region enterprise storage",
      nas: "Single or RAID drive in your home",
      vps: "Single cloud vendor virtual disk",
    },
    {
      label: "Hardware Failure",
      cloudflare: "Auto-replicated, zero hardware risk",
      nas: "Drive crash or power surge risks total loss",
      vps: "Host outage or hypervisor crash risks loss",
    },
    {
      label: "Global Latency",
      cloudflare: "300+ edge locations, sub-100ms worldwide",
      nas: "Bound to home upload speeds & tunnels",
      vps: "Single datacenter region, high cross-border lag",
    },
    {
      label: "Daily Upkeep",
      cloudflare: "Zero: No OS patches, no Docker compose",
      nas: "OS updates, SMART drive health monitoring",
      vps: "Kernel updates, security patches, watchdogs",
    },
    {
      label: "SSL & Domains",
      cloudflare: "Automated HTTPS and custom domain binding",
      nas: "Manual certs, dynamic DNS & port forwarding",
      vps: "Nginx/Caddy maintenance & Let's Encrypt renewals",
    },
    {
      label: "Ongoing Cost",
      cloudflare: "$0 / month on generous free tier",
      nas: "High upfront hardware costs + electricity",
      vps: "Continuous monthly / annual hosting invoices",
    },
  ],
  screenshotsHeading: "Polished Visual Experience",
  screenshotsSubtitle:
    "Light mode, dark immersion, and mobile responsive design. Everything is live and working.",
  faqBadge: "Good to Know",
  faqHeading: "Frequently Asked Questions",
  faqItems: [
    {
      q: "Is the free tier really enough?",
      a: "More than enough. Cloudflare's free tier provides 5GB D1 database (~2.5 million text memos) and 10GB R2 storage (~10,000 compressed photos). Writing 100 memos every day would take 68 years to fill.",
    },
    {
      q: "How safe is my data?",
      a: "Data is stored on Cloudflare's enterprise-grade distributed infrastructure with multi-region replication. FlareMo also supports one-click exports to standard Memos bundles for regular offline archiving.",
    },
    {
      q: "Can I migrate from Memos or flomo?",
      a: "Yes. FlareMo imports ZIP or JSON export bundles from Memos and flomo, preserving timestamps, tags, and content while allowing custom conflict resolution.",
    },
    {
      q: "Do third-party apps and scripts still work?",
      a: "Yes. FlareMo implements the Memos /api/v1 endpoint surface and personal access tokens (PAT). Popular iOS/Android clients like Moe Memos connect directly.",
    },
    {
      q: "How does single-user differ from team mode?",
      a: "By default, it is a quiet single-user sanctuary. When team mode is enabled, admins invite members via one-time activation links. Memos can be private, team-visible, or public.",
    },
  ],
  ctaBadge: "Get Started",
  ctaHeading: "Your Second Brain Is One Deploy Away",
  ctaSubtitle:
    "No servers, no credit card required. Deploy on Cloudflare in 5 minutes.",
  ctaButton: "Open the Deploy Guide",
};

const ZH_HOME: HomeContent = {
  heroEyebrow: "开源免费 · Cloudflare 边缘原生 · Memos 生态兼容",
  heroTitleLine1: "零服务器，永久拥有",
  heroTitleLine2: "跑在边缘网络的第二大脑",
  heroSubtitle:
    "基于 Cloudflare 边缘网络（Workers + D1 + R2）原生构建的新一代知识库：无需 VPS、免运维，完整兼容 Memos 生态，还能作为 AI Agent 的长期记忆。灵感随手记下，永久沉淀。",
  primaryCta: "快速开始部署",
  secondaryCta: "GitHub 源码",
  statMemos: "约 250 万条纯文本笔记",
  statPhotos: "1 万张图片 · 0 出口流量费",
  statServers: "全球 300+ 边缘近场直连",
  statUptime: "企业级多副本 · 本地自由归档",
  featuresBadge: "为什么是 FlareMo",
  featuresHeading: "为专注记录与长期沉淀而生",
  featuresSubtitle: "把运维交给 Cloudflare，把注意力留给记录本身",
  features: [
    {
      title: "企业级持久化，永不丢失",
      description:
        "笔记存储于 Cloudflare D1 分布式数据库与 R2 存储桶，自带跨地域冗余容灾。无需担心硬盘坏道、停电或单点损坏。",
    },
    {
      title: "免费配额，终生充裕",
      description:
        "Cloudflare 免费层自带 5GB D1 数据库与 10GB R2 存储，且 R2 不收出口流量费——记得再多，也没有一张账单。",
    },
    {
      title: "离线优先，全平台 PWA",
      description:
        "深度支持 PWA 原生安装。在飞行模式或地铁弱网下照常书写，草稿本地秒级暂存，重新联网后自动按序安全提交。",
    },
    {
      title: "AI 原生，跨会话长期记忆",
      description:
        "内置标准化 MCP（Model Context Protocol）端点，Claude Desktop、Cursor、Codex 等 AI 助手可将知识库作为长期记忆安全读写。",
    },
    {
      title: "团队协作，三级精细权限",
      description:
        "支持 Owner / Admin / Member 多角色协同，提供私密、团队可见、公开三档可见性，离职成员私密数据支持深度彻底清理。",
    },
    {
      title: "全面兼容 Memos 与 flomo",
      description:
        "完整实现 Memos /api/v1 核心接口与 OpenAPI 规范，支持第三方客户端直接连接，Memos/flomo 数据一键无损导入导出。",
    },
  ],
  comparisonBadge: "横向对比",
  comparisonHeading: "为什么选择 Cloudflare 原生架构",
  comparisonSubtitle:
    "对比传统家用 NAS 与 VPS，看 Cloudflare 原生为何是现代自托管的最优解",
  comparisonRows: [
    {
      label: "数据存储位置",
      cloudflare: "Cloudflare 企业级多地域持久化",
      nas: "家中的单块或多块物理硬盘",
      vps: "单一云厂商机房虚拟机磁盘",
    },
    {
      label: "硬件/灾难风险",
      cloudflare: "自动故障转移，零硬件焦虑",
      nas: "硬盘损坏、断电漏水可能全丢",
      vps: "机房网络故障或误操作可能丢失",
    },
    {
      label: "全球访问延迟",
      cloudflare: "全球 300+ 边缘 CDN 毫秒就近响应",
      nas: "依赖家庭上行，需折腾内网穿透",
      vps: "取决于单一机房物理距离，延迟高",
    },
    {
      label: "日常运维开销",
      cloudflare: "零运维：无系统补丁、无 Docker 容器",
      nas: "需维护系统升级、监控硬盘 SMART",
      vps: "需维护操作系统安全补丁与看门狗",
    },
    {
      label: "证书与域名",
      cloudflare: "自带免费 HTTPS，自动配置与续期",
      nas: "需自行申请证书、配置 DDNS 与穿透",
      vps: "需配置 Nginx/Caddy 及证书轮换",
    },
    {
      label: "长期费用成本",
      cloudflare: "0 元 / 永久利用官方免费配额",
      nas: "数千元硬件采购费用 + 持续电费",
      vps: "按月/年持续支付服务器与带宽续费",
    },
  ],
  screenshotsHeading: "精致视觉，开箱即用",
  screenshotsSubtitle:
    "浅色明亮、深色沉浸与全功能移动端自适应，所有功能真实可用",
  faqBadge: "你可能想问",
  faqHeading: "常见问题",
  faqItems: [
    {
      q: "免费配额真的够用吗？",
      a: "完全够用。Cloudflare 免费层提供 5GB D1 数据库（可存约 250 万条普通文本笔记）与 10GB R2 存储（约 1 万张压缩图片）。即使每天写 100 条笔记，也能写 68 年，对绝大部分笔记用户而言终生都难以触及上限。",
    },
    {
      q: "如何确保我的数据绝对安全？",
      a: "笔记保存在 Cloudflare 企业级分布式基础设施中，自带跨地域冗余持久化，不会因单点硬件故障丢失。同时 FlareMo 支持一键导出标准 Memos 格式备份包，随时可本地离线归档形成双重保障。",
    },
    {
      q: "能从 Memos 或 flomo 搬家过来吗？",
      a: "可以。FlareMo 支持导入 Memos 和 flomo 导出的 ZIP 或 JSON 格式数据包，导入时可自由配置冲突策略，时间戳、标签与正文完整保留。",
    },
    {
      q: "现有的第三方 App 和自动化脚本还能用吗？",
      a: "完全兼容。FlareMo 实现了 Memos 核心的 /api/v1 接口子集与可撤销的 Personal Access Token（PAT），市面上主流的 Memos 客户端（如 Moe Memos）及快捷指令脚本均可无缝连接使用。",
    },
    {
      q: "单人使用和团队使用有什么区别？",
      a: "默认是一套安静专注的单人笔记系统；如果需要协同，管理员可在后台一键生成邀请激活链接添加成员。笔记支持设为私密（仅自己可见）、团队可见（成员只读）或全网公开，数据权属清晰明确。",
    },
  ],
  ctaBadge: "开始上手",
  ctaHeading: "灵感已就位，只差一次部署",
  ctaSubtitle:
    "无需服务器，无需信用卡，用免费 Cloudflare 账号 5 分钟即可跑起来。",
  ctaButton: "查看部署指南",
};

const JA_HOME: HomeContent = {
  heroEyebrow: "サーバー不要 · 全球エッジ直結 · 完全無料セルフホスト",
  heroTitleLine1: "サーバー不要、一生モノの所有権。",
  heroTitleLine2: "エッジネットワークで動く第二の脳。",
  heroSubtitle:
    "Cloudflare Workers、D1、R2 を活用した次世代ナレッジベース。VPS 管理ゼロ、Memos API 互換、AI エージェントの長期記憶を手のひらに。",
  primaryCta: "デプロイガイドを読む",
  secondaryCta: "GitHub ソースコード",
  statMemos: "約250万件のメモ",
  statPhotos: "1万枚の写真 · 転送料0円",
  statServers: "24時間超低遅延",
  statUptime: "マルチリージョン冗長化",
  featuresBadge: "コア機能",
  featuresHeading: "FlareMoを選ぶ理由",
  featuresSubtitle:
    "煩雑なサーバー運用を手放し、純粋で堅牢なAIネイティブ知識管理を実現",
  features: [
    {
      title: "企業級の永続化、データ損失ゼロ",
      description:
        "メモはCloudflare D1およびR2ストレージにマルチリージョン冗長化で保存。ディスク障害や停電の心配は不要です。",
    },
    {
      title: "無料枠で一生使える大容量",
      description:
        "無料枠で約250万件のメモと1万枚の写真を保存可能。R2は下り転送料金が無料のため、急な請求の心配もありません。",
    },
    {
      title: "オフライン対応 ＆ PWA",
      description:
        "インストール可能なPWA。通信圏外でもローカルに即時保存され、オンライン復帰時に安全に同期されます。",
    },
    {
      title: "AIネイティブな長期記憶",
      description:
        "/memory/mcp エンドポイントにより、ClaudeやCursorなどのAIがあなたの好みを長期記憶として自律的に読み書きできます。",
    },
    {
      title: "チーム協調と3段階アクセス権限",
      description:
        "Owner / Admin / Member の役割管理。プライベート・チーム・公開の3段階の可視性をサポートします。",
    },
    {
      title: "Memos互換で簡単移行",
      description:
        "Memos /api/v1 仕様と互換。既存のサードパーティアプリ（Moe Memos等）にそのまま接続でき、一括移行も簡単です。",
    },
  ],
  comparisonBadge: "比較表",
  comparisonHeading: "Cloudflareネイティブが選ばれる理由",
  comparisonSubtitle: "自宅NASや従来型VPSと比較して分かる、真のゼロ保守運用",
  comparisonRows: [
    {
      label: "データの保存場所",
      cloudflare: "Cloudflare エンタープライズ分散ストレージ",
      nas: "自宅内の単一またはRAIDハードディスク",
      vps: "単一クラウドベンダーの仮想ディスク",
    },
    {
      label: "ハードウェア障害リスク",
      cloudflare: "自動フェイルオーバー、故障ストレスゼロ",
      nas: "HDD故障や停電で全データ消失のリスク",
      vps: "ホスト障害や設定ミスによる消失リスク",
    },
    {
      label: "アクセス速度",
      cloudflare: "世界300以上のエッジCDNからミリ秒応答",
      nas: "自宅の上り回線依存、トンネル設定が必要",
      vps: "データセンターの物理距離に依存し遅延大",
    },
    {
      label: "日常のメンテナンス",
      cloudflare: "ゼロ：OS更新なし、Docker管理なし",
      nas: "OSアップデート、SMART監視が必要",
      vps: "セキュリティパッチ、デーモン監視が必要",
    },
    {
      label: "SSLと独自ドメイン",
      cloudflare: "自動HTTPS証明書発行＆自動更新",
      nas: "証明書取得やDDNS、ポート開放の手間",
      vps: "Nginx設定とLet's Encrypt保守が必要",
    },
    {
      label: "継続コスト",
      cloudflare: "0円（無料枠を永久に活用）",
      nas: "高額な初期ハードウェア代＋電気代",
      vps: "毎月のサーバー代と帯域費用の請求",
    },
  ],
  screenshotsHeading: "洗練されたUI、今すぐ体験",
  screenshotsSubtitle:
    "ライトモード、ダークモード、モバイル対応。すべての機能が本番利用可能です。",
  faqBadge: "チェックポイント",
  faqHeading: "よくある質問",
  faqItems: [
    {
      q: "無料枠で本当に足りるの？",
      a: "十分すぎます。5GBのD1データベース（約250万件のメモ）と10GBのR2ストレージ（約1万枚の写真）を無料で利用でき、毎日100件書いても68年間埋まりません。",
    },
    {
      q: "データは本当に安全？",
      a: "データはCloudflareの分散基盤で冗長化保管されます。さらに標準Memos形式でワンクリック完全バックアップも可能です。",
    },
    {
      q: "Memosやflomoから移行できる？",
      a: "はい。ZIPまたはJSONエクスポートファイルをアップロードするだけで、タグや作成日を保持したまま移行できます。",
    },
    {
      q: "既存のモバイルアプリは使える？",
      a: "Memos互換の/api/v1とPATを提供しているため、Moe Memos等の主要クライアントから直接利用可能です。",
    },
    {
      q: "個人利用とチーム利用の違いは？",
      a: "個人利用時は完全プライベートな日記として動作し、チームモードを有効化すると共有・権限分離ワークスペースへと拡張されます。",
    },
  ],
  ctaBadge: "今すぐ始める",
  ctaHeading: "知識の拠点を、自分のドメインに。",
  ctaSubtitle:
    "サーバー不要、クレジットカード不要。無料のCloudflareアカウントで5分でデプロイ。",
  ctaButton: "5分デプロイガイドを見る",
};

const FR_HOME: HomeContent = {
  heroEyebrow: "Zéro serveur · Latence sub-50ms · Hébergement gratuit à vie",
  heroTitleLine1: "Zéro serveur. Pour toujours à vous.",
  heroTitleLine2: "Votre second cerveau sur l'Edge.",
  heroSubtitle:
    "Gestionnaire de connaissances moderne propulsé par Cloudflare (Workers, D1, R2). Zéro maintenance VPS, compatible Memos API et mémoire persistante pour vos agents IA.",
  primaryCta: "Guide de déploiement",
  secondaryCta: "Code source GitHub",
  statMemos: "~2,5 millions de notes",
  statPhotos: "10 000 photos · 0$ trafic",
  statServers: "Ultra-basse latence 24/7",
  statUptime: "Réplication multi-régions",
  featuresBadge: "Atouts clés",
  featuresHeading: "Pourquoi choisir FlareMo",
  featuresSubtitle:
    "Oubliez la maintenance de serveur et profitez d'une gestion de connaissances pure et native pour l'IA",
  features: [
    {
      title: "Durabilité de classe entreprise",
      description:
        "Vos notes résident dans Cloudflare D1 et R2 avec réplication multi-régions. Pannes de disques et coupures de courant n'atteignent jamais vos données.",
    },
    {
      title: "Niveau gratuit ultra-généreux",
      description:
        "Le forfait gratuit contient 2,5 millions de notes et 10 000 photos. Aucun frais de transfert sortant avec Cloudflare R2.",
    },
    {
      title: "Fonctionne hors-ligne & PWA",
      description:
        "PWA installable. Rédigez en avion ou dans le métro. Vos brouillons se synchronisent automatiquement au retour de la connexion.",
    },
    {
      title: "Mémoire IA à long terme",
      description:
        "Grâce au point d'accès /memory/mcp, vos agents IA (Claude, Cursor) lisent et enrichissent votre mémoire persistante en toute sécurité.",
    },
    {
      title: "Collaboration d'équipe & Rôles",
      description:
        "Rôles Propriétaire, Admin et Membre avec 3 niveaux de visibilité (privé, équipe, public). Suppression propre des données privées lors d'un départ.",
    },
    {
      title: "Compatibilité Memos totale",
      description:
        "Compatible avec l'API Memos /api/v1 et OpenAPI. Connexion directe aux clients mobiles existants et import/export sans friction.",
    },
  ],
  comparisonBadge: "Comparatif",
  comparisonHeading: "Pourquoi le Cloud-Native surpasse le reste",
  comparisonSubtitle:
    "Comparaison de Cloudflare Serverless avec les NAS domestiques et les VPS classiques",
  comparisonRows: [
    {
      label: "Emplacement des données",
      cloudflare: "Stockage distribué multi-régions Cloudflare",
      nas: "Disque dur physique unique ou RAID chez soi",
      vps: "Disque virtuel dans un centre de données unique",
    },
    {
      label: "Risque matériel",
      cloudflare: "Basculement automatique, zéro risque matériel",
      nas: "Panne de disque ou inondation = perte totale",
      vps: "Panne de machine hôte ou mauvaise manipulation",
    },
    {
      label: "Latence d'accès mondiale",
      cloudflare: "300+ datacenters edge, réponse en millisecondes",
      nas: "Limité par l'envoi de la box, tunnels requis",
      vps: "Dépendant de l'emplacement unique du serveur",
    },
    {
      label: "Maintenance quotidienne",
      cloudflare: "Zéro : pas de patch d'OS ni de Docker",
      nas: "Mises à jour d'OS et surveillance SMART nécessaires",
      vps: "Patchs de sécurité, pare-feu et surveillance",
    },
    {
      label: "SSL & Domaines",
      cloudflare: "HTTPS automatisé et liaison de domaine sans frais",
      nas: "Gestion manuelle de certificats et DDNS",
      vps: "Configuration Nginx et renouvellements Let's Encrypt",
    },
    {
      label: "Coût continu",
      cloudflare: "0 € / mois avec le généreux forfait gratuit",
      nas: "Coût matériel élevé + consommation électrique",
      vps: "Factures mensuelles récurrentes d'hébergement",
    },
  ],
  screenshotsHeading: "Une interface soignée et vivante",
  screenshotsSubtitle:
    "Modes clair, sombre et vue mobile réactive. Tout est fonctionnel et connecté au backend.",
  faqBadge: "À savoir",
  faqHeading: "Questions fréquentes",
  faqItems: [
    {
      q: "Le quota gratuit est-il suffisant ?",
      a: "Largement. 5 Go de D1 (~2,5M de notes) et 10 Go de R2 (~10 000 photos). Écrire 100 notes par jour prendrait 68 ans pour remplir cet espace.",
    },
    {
      q: "Mes données sont-elles en sécurité ?",
      a: "Elles sont stockées sur l'infrastructure robuste de Cloudflare. Vous pouvez également exporter une sauvegarde complète Memos à tout moment.",
    },
    {
      q: "Puis-je migrer depuis Memos ou flomo ?",
      a: "Oui, chargez simplement votre fichier d'exportation ZIP ou JSON pour tout importer avec conservation des dates et étiquettes.",
    },
    {
      q: "Mes applications mobiles existantes fonctionnent-elles ?",
      a: "Oui, FlareMo implémente l'API /api/v1 et les jetons PAT de Memos pour fonctionner avec les applications comme Moe Memos.",
    },
    {
      q: "Quelle différence entre mode solo et équipe ?",
      a: "Par défaut, c'est un carnet personnel confidentiel. En activant le mode équipe, vous pouvez inviter des membres et partager des notes sélectivement.",
    },
  ],
  ctaBadge: "C'est parti",
  ctaHeading: "Votre second cerveau mérite mieux qu'un VPS.",
  ctaSubtitle:
    "Sans serveur, sans carte bancaire. Déployez sur Cloudflare en 5 minutes.",
  ctaButton: "Lire le guide de déploiement en 5 min",
};

const ES_HOME: HomeContent = {
  heroEyebrow:
    "Cero servidores · Borde global sub-50ms · Autohospedaje gratuito",
  heroTitleLine1: "Cero servidores. Tuyo para siempre.",
  heroTitleLine2: "Tu segundo cerebro en el Edge.",
  heroSubtitle:
    "Sistema de gestión del conocimiento de nueva generación basado en Cloudflare (Workers, D1, R2). Sin mantenimiento de VPS, compatible con Memos API y memoria duradera para IA.",
  primaryCta: "Guía de despliegue",
  secondaryCta: "Código en GitHub",
  statMemos: "~2,5 millones de notas",
  statPhotos: "10.000 fotos · 0$ tráfico",
  statServers: "Latencia ultrabaja 24/7",
  statUptime: "Replicación multirregional",
  featuresBadge: "Funciones clave",
  featuresHeading: "¿Por qué elegir FlareMo?",
  featuresSubtitle:
    "Olvídate del mantenimiento de servidores y disfruta de una gestión de conocimiento limpia y nativa de IA",
  features: [
    {
      title: "Durabilidad de nivel empresarial",
      description:
        "Tus notas viven en Cloudflare D1 y R2 con persistencia multirregional. Fallos de disco o cortes de luz jamás tocarán tus datos.",
    },
    {
      title: "Plan gratuito inagotable",
      description:
        "El plan gratuito alberga 2,5 millones de notas y 10.000 fotos. R2 no cobra por transferencia saliente, sin sorpresas en tu factura.",
    },
    {
      title: "Funciona sin conexión y PWA",
      description:
        "PWA instalable. Escribe en aviones o el metro. Tus borradores se guardan en local y se sincronizan al recuperar la red.",
    },
    {
      title: "Memoria de IA a largo plazo",
      description:
        "Mediante /memory/mcp, agentes de IA (Claude, Cursor) leen y actualizan tu contexto y preferencias persistentes de forma auditada.",
    },
    {
      title: "Colaboración de equipo y roles",
      description:
        "Roles de Propietario, Administrador y Miembro con 3 niveles de visibilidad (privado, equipo, público) y borrado seguro de datos.",
    },
    {
      title: "Compatibilidad con Memos",
      description:
        "Compatibilidad total con la API /api/v1 de Memos y OpenAPI. Conexión directa con clientes como Moe Memos e importación/exportación.",
    },
  ],
  comparisonBadge: "Comparativa",
  comparisonHeading: "¿Por qué Cloudflare Serverless es superior?",
  comparisonSubtitle:
    "Comparando el enfoque Cloudflare Native frente a NAS caseros y servidores VPS",
  comparisonRows: [
    {
      label: "Ubicación de datos",
      cloudflare: "Almacenamiento distribuido multirregional Cloudflare",
      nas: "Disco duro único o RAID en tu propia casa",
      vps: "Disco virtual en un centro de datos único",
    },
    {
      label: "Riesgo de hardware",
      cloudflare: "Conmutación por error automática, cero riesgo",
      nas: "Fallo de disco o corte eléctrico = pérdida total",
      vps: "Caída del hipervisor o error de configuración",
    },
    {
      label: "Latencia global",
      cloudflare: "300+ nodos perimetrales con respuesta en milisegundos",
      nas: "Limitado por la subida de tu fibra y túneles DDNS",
      vps: "Depende de la distancia al centro de datos único",
    },
    {
      label: "Mantenimiento diario",
      cloudflare: "Cero: sin parches de sistema ni Docker",
      nas: "Actualizaciones de SO y revisión de discos SMART",
      vps: "Parches de seguridad y configuración de cortafuegos",
    },
    {
      label: "SSL y Dominios",
      cloudflare: "HTTPS automatizado y dominios personalizados sin coste",
      nas: "Gestión manual de certificados y DDNS",
      vps: "Mantenimiento de Nginx y certificados Let's Encrypt",
    },
    {
      label: "Coste recurrente",
      cloudflare: "0 $ / mes en el generoso plan gratuito",
      nas: "Alto coste de hardware inicial + gasto de electricidad",
      vps: "Facturas mensuales o anuales de alojamiento",
    },
  ],
  screenshotsHeading: "Experiencia visual refinada",
  screenshotsSubtitle:
    "Modo claro, modo oscuro y diseño adaptable para móviles. Todo en producción y funcionando.",
  faqBadge: "Conviene saber",
  faqHeading: "Preguntas Frecuentes",
  faqItems: [
    {
      q: "¿Es suficiente el plan gratuito?",
      a: "De sobra. 5 GB de D1 (~2,5M de notas) y 10 GB de R2 (~10.000 fotos). Escribiendo 100 notas diarias tardarías 68 años en llenarlo.",
    },
    {
      q: "¿Están seguros mis datos?",
      a: "Están almacenados en la infraestructura global de Cloudflare. Además, puedes exportar una copia completa en formato Memos cuando desees.",
    },
    {
      q: "¿Puedo migrar desde Memos o flomo?",
      a: "Sí, sube tu archivo ZIP o JSON de exportación para importar todo conservando fechas, etiquetas y contenido.",
    },
    {
      q: "¿Funcionan las apps móviles existentes?",
      a: "Sí, FlareMo implementa los endpoints /api/v1 y tokens PAT de Memos para enlazar con clientes como Moe Memos.",
    },
    {
      q: "¿Qué diferencia hay entre modo personal y equipo?",
      a: "Por defecto es un diario personal cifrado. Al activar el modo de equipo, puedes invitar a colegas y compartir notas de manera selectiva.",
    },
  ],
  ctaBadge: "Empieza ahora",
  ctaHeading: "Tu segundo cerebro merece algo mejor que un VPS.",
  ctaSubtitle:
    "Sin servidores, sin tarjeta de crédito. Despliega en Cloudflare en 5 minutos.",
  ctaButton: "Ver guía de despliegue en 5 minutos",
};

const KO_HOME: HomeContent = {
  heroEyebrow: "서버리스 · 50ms 미만 글로벌 엣지 · 평생 무료 셀프 호스팅",
  heroTitleLine1: "서버 제로, 영구 소유.",
  heroTitleLine2: "엣지 네트워크에서 작동하는 두 번째 뇌.",
  heroSubtitle:
    "Cloudflare Workers, D1, R2 기반의 차세대 지식 관리 시스템. VPS 유지보수 없이, Memos API 생태계와 AI 에이전트 MCP 장기 기억을 영구 소유하세요.",
  primaryCta: "배포 가이드 읽기",
  secondaryCta: "GitHub 소스코드",
  statMemos: "약 250만 건의 메모",
  statPhotos: "1만 장 사진 · 트래픽 0원",
  statServers: "24/7 글로벌 초저지연",
  statUptime: "멀티 리전 다중화",
  featuresBadge: "핵심 기능",
  featuresHeading: "왜 FlareMo인가",
  featuresSubtitle:
    "복잡한 서버 유지보수에서 벗어나 순수하고 강력한 AI 네이티브 지식 관리를 경험하세요",
  features: [
    {
      title: "엔터프라이즈급 내구성",
      description:
        "메모는 Cloudflare D1과 R2에 멀티 리전으로 안전하게 저장됩니다. 디스크 고장이나 정전 걱정 없이 데이터를 보호하세요.",
    },
    {
      title: "평생 넉넉한 무료 제공량",
      description:
        "무료 플랜만으로 약 250만 건의 메모와 1만 장의 사진을 보관할 수 있습니다. R2는 다운로드 트래픽 비용이 무료입니다.",
    },
    {
      title: "오프라인 퍼스트 & PWA",
      description:
        "설치 가능한 PWA. 비행기나 지하철에서도 원활하게 작성하세요. 작성된 메모는 로컬에 보관 후 온라인 복구 시 자동 제출됩니다.",
    },
    {
      title: "AI 네이티브 장기 기억",
      description:
        "/memory/mcp 엔드포인트를 통해 Claude, Cursor 등의 AI 에이전트가 사용자의 영구 기억과 프로젝트 맥락을 안전하게 읽고 씁니다.",
    },
    {
      title: "팀 협업 및 역할 관리",
      description:
        "소유자, 관리자, 멤버 역할과 3단계 공개 범위(비공개, 팀, 전체 공개). 퇴사자 처리 시 비공개 데이터만 안전하게 영구 삭제됩니다.",
    },
    {
      title: "완벽한 Memos 호환성",
      description:
        "Memos /api/v1 사양 및 OpenAPI 완벽 호환. Moe Memos 등 기존 모바일 앱과 즉시 연동되며 클릭 한 번으로 가져오기/내보내기 가능합니다.",
    },
  ],
  comparisonBadge: "한눈에 보는 비교",
  comparisonHeading: "Cloudflare 네이티브가 정답인 이유",
  comparisonSubtitle: "홈 NAS 및 전통적인 VPS 호스팅과의 비교 분석",
  comparisonRows: [
    {
      label: "데이터 저장 위치",
      cloudflare: "Cloudflare 글로벌 멀티 리전 스토리지",
      nas: "집 안의 단일 또는 RAID 하드디스크",
      vps: "단일 클라우드 데이터센터의 가상 디스크",
    },
    {
      label: "하드웨어 장애 위험",
      cloudflare: "자동 장애 조치로 하드웨어 위험 0%",
      nas: "디스크 배드섹터나 정전 시 전량 손실 위험",
      vps: "하이퍼바이저 장애나 설정 실수로 손실 위험",
    },
    {
      label: "글로벌 접근 속도",
      cloudflare: "전 세계 300+ 엣지 노드에서 밀리초 응답",
      nas: "가정용 인터넷 업로드 속도 및 터널 의존",
      vps: "원격 단일 서버 위치에 종속되어 높은 지연시간",
    },
    {
      label: "일상 유지보수",
      cloudflare: "제로 : OS 패치 및 Docker 관리 불필요",
      nas: "OS 정기 업데이트 및 디스크 SMART 감시 필요",
      vps: "보안 패치, 커널 업그레이드, 방화벽 관리 필요",
    },
    {
      label: "SSL 및 도메인",
      cloudflare: "자동 HTTPS 발급 및 커스텀 도메인 무료 연결",
      nas: "인증서 수동 갱신 및 복잡한 DDNS 설정",
      vps: "Nginx 설정 및 Let's Encrypt 주기적 갱신",
    },
    {
      label: "지속 비용",
      cloudflare: "월 0원 (넉넉한 무료 티어 활용)",
      nas: "수십~수백만 원의 초기 기기값 + 전기요금",
      vps: "매월 반복 청구되는 호스팅 요금과 트래픽비",
    },
  ],
  screenshotsHeading: "단정하고 유려한 디자인",
  screenshotsSubtitle:
    "라이트 모드, 다크 모드, 모바일 반응형 완벽 대응. 모든 기능이 백엔드와 연동되어 작동합니다.",
  faqBadge: "알아두면 좋은 점",
  faqHeading: "자주 묻는 질문",
  faqItems: [
    {
      q: "무료 플랜으로 정말 충분한가요?",
      a: "차고 넘칩니다. 5GB의 D1 데이터베이스(약 250만 개 메모)와 10GB의 R2 스토리지(약 1만 장 사진)가 무료로 제공되며, 매일 100개씩 적어도 68년이 걸립니다.",
    },
    {
      q: "데이터가 정말 안전한가요?",
      a: "Cloudflare의 글로벌 분산 인프라에 안전하게 다중 복제됩니다. 또한 언제든 표준 Memos 패키지로 전체 오프라인 백업이 가능합니다.",
    },
    {
      q: "Memos나 flomo에서 가져올 수 있나요?",
      a: "네, 내보낸 ZIP이나 JSON 파일을 업로드하면 날짜, 태그, 본문 손실 없이 한 번에 가져올 수 있습니다.",
    },
    {
      q: "기존 모바일 앱과 연동되나요?",
      a: "네, FlareMo는 Memos /api/v1과 PAT 인증을 지원하여 Moe Memos 등 인기 있는 서드파티 앱에서 바로 연결할 수 있습니다.",
    },
    {
      q: "개인용과 팀용의 차이는 무엇인가요?",
      a: "혼자 사용할 때는 조용한 1인용 비밀 노트로 작동하며, 팀 모드를 켜면 초대 링크를 통해 동료를 추가하고 팀원끼리 노트를 공유할 수 있습니다.",
    },
  ],
  ctaBadge: "시작하기",
  ctaHeading: "제2의 뇌, 이제 내 도메인에.",
  ctaSubtitle:
    "서버도, 신용카드도 필요 없습니다. 무료 Cloudflare 계정으로 5분 만에 배포하세요.",
  ctaButton: "5분 배포 가이드 확인하기",
};

const RU_HOME: HomeContent = {
  heroEyebrow: "Ноль серверов · Глобальный Edge <50мс · Бесплатный хостинг",
  heroTitleLine1: "Ноль серверов. Навсегда ваше.",
  heroTitleLine2: "Второй мозг на глобальном Edge.",
  heroSubtitle:
    "Управление знаниями нового поколения на базе Cloudflare (Workers, D1, R2). Никаких VPS, поддержка экосистемы Memos API и постоянная память для ИИ-агентов.",
  primaryCta: "Руководство по установке",
  secondaryCta: "Исходный код на GitHub",
  statMemos: "~2.5 млн заметок",
  statPhotos: "10 000 фото · 0$ трафик",
  statServers: "Отклик в миллисекунды 24/7",
  statUptime: "Мультирегиональная надежность",
  featuresBadge: "Возможности",
  featuresHeading: "Почему именно FlareMo",
  featuresSubtitle:
    "Забудьте об администрировании серверов и наслаждайтесь чистым знанием с нативным ИИ",
  features: [
    {
      title: "Корпоративная надежность",
      description:
        "Заметки хранятся в Cloudflare D1 и R2 с геораспределенной репликацией. Ни поломка диска, ни сбой питания не затронут ваши данные.",
    },
    {
      title: "Щедрый бесплатный тариф",
      description:
        "Бесплатного лимита хватит на 2,5 миллиона заметок и 10 000 фото. Хранилище R2 не берет плату за исходящий трафик.",
    },
    {
      title: "Офлайн-режим и PWA",
      description:
        "Устанавливаемое PWA-приложение. Пишите в метро или самолете: черновики сохраняются локально и автоматически отправляются при подключении.",
    },
    {
      title: "Долгосрочная память ИИ",
      description:
        "Через интерфейс /memory/mcp ваши ИИ-помощники (Claude, Cursor) читают и дополняют постоянную память о проектах под вашим контролем.",
    },
    {
      title: "Командная работа и роли",
      description:
        "Роли Владельца, Администратора и Участника с 3 уровнями видимости. Безопасное удаление личных данных при исключении участника.",
    },
    {
      title: "Совместимость с Memos",
      description:
        "Поддержка API Memos /api/v1 и OpenAPI. Прямая работа с приложениями вроде Moe Memos и экспорт/импорт в один клик.",
    },
  ],
  comparisonBadge: "Сравнение",
  comparisonHeading: "Почему Cloudflare Serverless лучше",
  comparisonSubtitle:
    "Сравнение архитектуры Cloudflare Native с домашними NAS и VPS-серверами",
  comparisonRows: [
    {
      label: "Где хранятся данные",
      cloudflare: "Мультирегиональное хранилище Cloudflare",
      nas: "Физический жесткий диск или RAID у вас дома",
      vps: "Виртуальный диск в одном дата-центре провайдера",
    },
    {
      label: "Аппаратные сбои",
      cloudflare: "Автоматический переход на реплики, риск 0%",
      nas: "Отказ диска или скачок напряжения = потеря всего",
      vps: "Сбой оборудования хоста или ошибки виртуализации",
    },
    {
      label: "Скорость доступа",
      cloudflare: "300+ точек присутствия по миру, ответ за миллисекунды",
      nas: "Зависит от исходящей скорости домашнего интернета",
      vps: "Зависит от расстояния до единственного дата-центра",
    },
    {
      label: "Ежедневная поддержка",
      cloudflare: "Ноль: без обновлений ОС и контейнеров Docker",
      nas: "Необходимы апдейты ОС, контроль SMART и сети",
      vps: "Патчи безопасности ОС, настройка фаервола",
    },
    {
      label: "SSL и Домены",
      cloudflare: "Автоматический бесплатный HTTPS и легкая привязка",
      nas: "Ручной выпуск сертификатов и возня с DDNS",
      vps: "Настройка Nginx и автоматическое продление Let's Encrypt",
    },
    {
      label: "Постоянные расходы",
      cloudflare: "0 ₽ / месяц на щедром бесплатном тарифе",
      nas: "Высокая цена оборудования + расходы на электричество",
      vps: "Регулярная ежемесячная или ежегодная абонплата",
    },
  ],
  screenshotsHeading: "Продуманный визуальный стиль",
  screenshotsSubtitle:
    "Светлая и темная темы, адаптивный интерфейс для телефонов. Всё уже работает на сервере.",
  faqBadge: "Стоит знать",
  faqHeading: "Часто задаваемые вопросы",
  faqItems: [
    {
      q: "Действительно ли бесплатного тарифа хватает?",
      a: "Более чем. 5 ГБ базы данных D1 (~2,5 млн заметок) и 10 ГБ R2 (~10 000 фото). Записывая по 100 заметок в день, вам понадобится 68 лет, чтобы исчерпать лимит.",
    },
    {
      q: "Насколько безопасны мои данные?",
      a: "Данные распределены по глобальной инфраструктуре Cloudflare. Вы также в любой момент можете скачать полный архив в формате Memos.",
    },
    {
      q: "Можно ли переехать с Memos или flomo?",
      a: "Да, загрузите ваш файл ZIP или JSON для импорта заметок с полным сохранением дат создания и тегов.",
    },
    {
      q: "Работают ли сторонние клиенты?",
      a: "Да, благодаря поддержке эндпоинтов /api/v1 и токенов доступа PAT, приложения вроде Moe Memos подключаются без проблем.",
    },
    {
      q: "Чем отличается соло-режим от командного?",
      a: "По умолчанию это тихий индивидуальный блокнот. Включив командный режим, вы можете приглашать участников по одноразовым ссылкам и делиться выбранными заметками.",
    },
  ],
  ctaBadge: "Начать",
  ctaHeading: "Второй мозг — на вашем домене.",
  ctaSubtitle:
    "Без серверов и без кредитных карт. Разверните в Cloudflare за 5 минут.",
  ctaButton: "Открыть 5-минутное руководство",
};

const AR_HOME: HomeContent = {
  heroEyebrow: "بدون خوادم · استجابة فائقة السرعة · استضافة ذاتية مجانية للأبد",
  heroTitleLine1: "بدون خوادم. ملكك إلى الأبد.",
  heroTitleLine2: "دماغك الثاني على شبكة الحافة العالمية.",
  heroSubtitle:
    "نظام إدارة معرفة متطور مبني على Cloudflare Edge (Workers, D1, R2). لا صيانة للخوادم، متوافق مع Memos API وذاكرة دائمة لوكلاء الذكاء الاصطناعي.",
  primaryCta: "دليل النشر والتشغيل",
  secondaryCta: "الشيفرة على GitHub",
  statMemos: "نحو 2.5 مليون ملاحظة",
  statPhotos: "10 آلاف صورة · 0$ تكلفة نقل",
  statServers: "استجابة فورية فائقة 24/7",
  statUptime: "تكرار جغرافي متعدد المناطق",
  featuresBadge: "المزايا الأساسية",
  featuresHeading: "لماذا تختار FlareMo؟",
  featuresSubtitle:
    "تخلَّ عن أعباء صيانة الخوادم واستمتع بإدارة معرفية نقية ومدعومة أصلاً بالذكاء الاصطناعي",
  features: [
    {
      title: "متانة بمستوى المؤسسات",
      description:
        "تُحفظ ملاحظاتك في Cloudflare D1 و R2 مع تكرار عبر مناطق متعددة. لن تمس بياناتك أعطال الأقراص الصلبة أو انقطاعات الطاقة.",
    },
    {
      title: "خطة مجانية سخية جداً",
      description:
        "تتسع الحصة المجانية لنحو 2.5 مليون ملاحظة و 10 آلاف صورة. كما أن R2 لا يفرض أي رسوم على البيانات الصادرة.",
    },
    {
      title: "أولوية العمل بدون إنترنت & PWA",
      description:
        "تطبيق ويب تقدمي قابل للتثبيت. دوّن ملاحظاتك على متن الطائرة أو في المترو، وستتم مزامنتها تلقائياً وبالترتيب عند الاتصال.",
    },
    {
      title: "ذاكرة ذكاء اصطناعي طويلة المدى",
      description:
        "عبر نقطة النهاية /memory/mcp، تستطيع نماذج الذكاء الاصطناعي قراءة وتحديث سياقك وتفضيلاتك الدائمة بخصوصية كاملة.",
    },
    {
      title: "تعاون الفرق وإدارة الأدوار",
      description:
        "أدوار المالك والمسؤول والعضو مع 3 مستويات للرؤية (خاص، فريق، عام) مع مسح فعلي آمن لبيانات الأعضاء المغادرين.",
    },
    {
      title: "توافق كامل مع بيئة Memos",
      description:
        "توافق كامل مع واجهة Memos /api/v1 و OpenAPI. اتصال مباشر بالتطبيقات الخارجية مثل Moe Memos مع استيراد وتصدير سهل.",
    },
  ],
  comparisonBadge: "مقارنة مباشرة",
  comparisonHeading: "لماذا يتفوق التصميم القائم على Cloudflare؟",
  comparisonSubtitle:
    "مقارنة بين بنية Cloudflare Serverless والتخزين المنزلي NAS والخوادم الافتراضية VPS",
  comparisonRows: [
    {
      label: "مكان تخزين البيانات",
      cloudflare: "تخزين سحابي موزع ومتعدد المناطق من Cloudflare",
      nas: "قرص صلب منزلي واحد أو مصفوفة RAID في المنزل",
      vps: "قرص وهمي في مركز بيانات واحد لمزود سحابي",
    },
    {
      label: "مخاطر تعطل الأجهزة",
      cloudflare: "تحويل تلقائي عند الأعطال مع انعدام خطر التلف",
      nas: "تعطل القرص أو انقطاع الكهرباء قد يتلف كل شيء",
      vps: "تعطل جهاز الخادم المضيف قد يؤدي لفقدان البيانات",
    },
    {
      label: "سرعة الوصول العالمية",
      cloudflare: "أكثر من 300 مركز حافة عالمي مع استجابة بالمللي ثانية",
      nas: "مقيد بسرعة الرفع لإنترنت المنزل وحيل الأنفاق",
      vps: "مرتبط بموقع المركز الجغرافي الواحد وتأخيره العالي",
    },
    {
      label: "الصيانة اليومية",
      cloudflare: "صفر: لا تحديثات لنظام التشغيل ولا حاويات Docker",
      nas: "تحديثات دورية وفحص دوري للأقراص SMART",
      vps: "ترقيع الثغرات الأمنية ومراقبة جدار الحماية",
    },
    {
      label: "شهادات SSL والنطاقات",
      cloudflare: "تشفير HTTPS تلقائي وربط النطاقات مجاناً",
      nas: "تجديد يدوي وإعدادات DNS معقدة",
      vps: "إعداد خادم Nginx وتجديد شهادات Let's Encrypt",
    },
    {
      label: "التكلفة المستمرة",
      cloudflare: "0$ شهرياً ضمن الخطة المجانية السخية",
      nas: "تكلفة أجهزة باهظة مقدماً بالإضافة لفاتورة الكهرباء",
      vps: "فواتير شهرية أو سنوية مستمرة لاستضافة الخادم",
    },
  ],
  screenshotsHeading: "واجهة أنيقة وتجربة متكاملة",
  screenshotsSubtitle:
    "وضع فاتح، وضع داكن وتجاوب كامل مع الهواتف. جميع الميزات تعمل فعلياً ومتصلة بالنظام.",
  faqBadge: "معلومات مفيدة",
  faqHeading: "الأسئلة الشائعة",
  faqItems: [
    {
      q: "هل الخطة المجانية كافية حقاً؟",
      a: "كافية جداً وزيادة. 5 جيجابايت قاعدة بيانات (~2.5 مليون ملاحظة) و 10 جيجابايت تخزين (~10 آلاف صورة). حتى لو كتبت 100 ملاحظة يومياً ستستغرق 68 عاماً لملئها.",
    },
    {
      q: "ما مدى أمان بياناتي؟",
      a: "بياناتك موزعة ومكررة بأمان على بنية Cloudflare العالمية. كما يمكنك تصدير نسخة احتياطية كاملة بصيغة Memos في أي وقت.",
    },
    {
      q: "هل يمكنني الانتقال من Memos أو flomo؟",
      a: "نعم، ارفع ملف التصدير المضغوط ZIP أو JSON لاستيراد كل ملاحظاتك مع الاحتفاظ بالتواريخ والوسوم.",
    },
    {
      q: "هل تعمل تطبيقات الهواتف الحالية؟",
      a: "نعم، يدعم FlareMo واجهة /api/v1 ورموز PAT المتوافقة مع Memos، مما يتيح لتطبيقات مثل Moe Memos الاتصال مباشرة.",
    },
    {
      q: "ما الفرق بين الاستخدام الفردي والجماعي؟",
      a: "افتراضياً يعمل كدفتر ملاحظات شخصي وسري، وعند تفعيل وضع الفريق يمكنك دعوة الأعضاء ومشاركة الملاحظات باختيارك.",
    },
  ],
  ctaBadge: "ابدأ الآن",
  ctaHeading: "عقلك الثاني، على نطاقك الخاص.",
  ctaSubtitle:
    "بدون خوادم، وبدون بطاقة ائتمان. انشر التطبيق على Cloudflare في 5 دقائق.",
  ctaButton: "قراءة دليل النشر السريع (5 دقائق)",
};

export function getHomeContent(locale: Locale): HomeContent {
  const norm = normalizeLocale(locale);
  switch (norm) {
    case "zh":
      return ZH_HOME;
    case "ja":
      return JA_HOME;
    case "fr":
      return FR_HOME;
    case "es":
      return ES_HOME;
    case "ko":
      return KO_HOME;
    case "ru":
      return RU_HOME;
    case "ar":
      return AR_HOME;
    default:
      return EN_HOME;
  }
}
