import type { SupportedLocale } from "@/lib/seo";

export type ShowcaseContent = {
  memo1: {
    title: string;
    content: string;
    quote: string;
    tags: string[];
    time: string;
  };
  memo2: {
    title: string;
    content: string;
    tags: string[];
    time: string;
  };
  presets: Array<{
    text: string;
    title: string;
    quote: string;
    tag: string;
  }>;
  ui: {
    statsRecords: string;
    statsTags: string;
    statsDays: string;
    trend: string;
    calendar: string;
    timeline: string;
    archive: string;
    trash: string;
    dailyReview: string;
    randomWalk: string;
    memory: string;
    calendarView: string;
    projects: string;
    tagIndex: string;
    searchPlaceholder: string;
    composerPlaceholder: string;
    send: string;
    justNow: string;
    clearFilter: string;
    recordPrefix: string;
    months: [string, string, string, string];
    tags: Array<{ name: string; count: number }>;
  };
};

export const SHOWCASE_I18N: Record<SupportedLocale, ShowcaseContent> = {
  zh: {
    memo1: {
      title: "阅读摘录：注意力与创造力",
      content:
        "信息越多，越需要为自己留出安静的空间。把零散的观察记下来，连接就会慢慢浮现。",
      quote: "学习不是积累答案，而是不断提出更好的问题。",
      tags: ["灵感", "阅读"],
      time: "21分钟前",
    },
    memo2: {
      title: "让记录成为思考的起点",
      content:
        "今天散步时想到：好的工具应该让人专注于自己的想法。打开就能写，想找的内容也能很快找到。\n• 保留清晰的主线\n• 给重要的灵感加上标签\n• 每周花一点时间回顾",
      tags: ["思考", "产品"],
      time: "1小时前",
    },
    presets: [
      {
        text: "在机场候机时随手理清了多端同步幂等协议 #架构 #灵感",
        title: "边缘毫秒同步方案设计",
        quote: "客户端优先本地落盘，联网后单调时间戳递增同步。",
        tag: "架构",
      },
      {
        text: "离线 PWA 模式断网随心记，连网秒级入库 #灵感",
        title: "离线优先使用体验",
        quote: "地铁与飞行途中无网环境下的心流完全不中断。",
        tag: "灵感",
      },
      {
        text: "配置完成 Telegram 随手记 Bot，直接发语音自动转文字入库 #生活",
        title: "碎片化灵感速记链路",
        quote: "随手语音发给专属 Bot，10 秒内自动汇总成结构化知识点。",
        tag: "生活",
      },
    ],
    ui: {
      statsRecords: "记录",
      statsTags: "标签",
      statsDays: "天",
      trend: "趋势",
      calendar: "日历",
      timeline: "时间线",
      archive: "归档",
      trash: "回收站",
      dailyReview: "每日回顾",
      randomWalk: "随机漫步",
      memory: "记忆",
      calendarView: "日程",
      projects: "项目",
      tagIndex: "标签索引",
      searchPlaceholder: "搜索记录...",
      composerPlaceholder: "此刻在想什么？记下来...",
      send: "发送",
      justNow: "刚刚",
      clearFilter: "✕ 全部",
      recordPrefix: "记录",
      months: ["6月", "7月", "8月", "9月"],
      tags: [
        { name: "产品", count: 22 },
        { name: "思考", count: 22 },
        { name: "灵感", count: 22 },
        { name: "生活", count: 21 },
        { name: "计划", count: 21 },
        { name: "阅读", count: 22 },
      ],
    },
  },
  en: {
    memo1: {
      title: "Reading Notes: Attention and Synthesis",
      content:
        "The more fragmented the information, the more we need quiet space for synthesis. Capture raw observations early, and patterns gradually emerge.",
      quote: "Learning isn't hoarding answers—it's asking better questions.",
      tags: ["ideas", "reading"],
      time: "21m ago",
    },
    memo2: {
      title: "Turning Capture into the Start of Thought",
      content:
        "Thought during a walk: great tools eliminate friction between thinking and writing. Instant launch, instant search.\n• Keep a clear mainline\n• Tag key sparks\n• Weekly synthesis ritual",
      tags: ["thinking", "product"],
      time: "1h ago",
    },
    presets: [
      {
        text: "Drafted idempotent edge sync protocol while waiting at airport gate #architecture #ideas",
        title: "Edge Sub-Second Sync Design",
        quote:
          "Local SQLite persistence first, monotonic timestamp replication on reconnect.",
        tag: "architecture",
      },
      {
        text: "Offline PWA keeps cognitive flow unbroken during flight #ideas",
        title: "Offline-First Mobile Experience",
        quote:
          "Subway or air transit without connectivity never interrupts writing flow.",
        tag: "ideas",
      },
      {
        text: "Connected Telegram voice memo bot for hands-free thought capture #life",
        title: "Instant Audio Capture Pipeline",
        quote:
          "Voice memos automatically transcribed and structured into knowledge entries in seconds.",
        tag: "life",
      },
    ],
    ui: {
      statsRecords: "Memos",
      statsTags: "Tags",
      statsDays: "Days",
      trend: "Trend",
      calendar: "Calendar",
      timeline: "Timeline",
      archive: "Archive",
      trash: "Trash",
      dailyReview: "Daily Review",
      randomWalk: "Random Walk",
      memory: "Memory",
      calendarView: "Schedule",
      projects: "Projects",
      tagIndex: "Tags",
      searchPlaceholder: "Search records...",
      composerPlaceholder: "What's on your mind? Capture it...",
      send: "Send",
      justNow: "just now",
      clearFilter: "✕ All",
      recordPrefix: "Memo",
      months: ["Jun", "Jul", "Aug", "Sep"],
      tags: [
        { name: "product", count: 22 },
        { name: "thinking", count: 22 },
        { name: "ideas", count: 22 },
        { name: "life", count: 21 },
        { name: "plans", count: 21 },
        { name: "reading", count: 22 },
      ],
    },
  },
  ja: {
    memo1: {
      title: "読書メモ：集中力と創造性",
      content:
        "情報が溢れる時代だからこそ、静かに思考をまとめる空間が必要。断片的な観察を書き留めておけば、やがて繋がりが見えてくる。",
      quote:
        "学習とは答えを蓄積することではなく、より良い問いを立て続けること。",
      tags: ["ひらめき", "読書"],
      time: "21分前",
    },
    memo2: {
      title: "記録を思考の起点にする",
      content:
        "散歩中のひらめき：優れたツールは書くことへの摩擦を極限まで減らしてくれる。開けばすぐ書け、探したいものが一瞬で見つかる。\n• 明確な主軸を保つ\n• 重要なインサイトにタグ付け\n• 週末の振り返り習慣",
      tags: ["思考", "プロダクト"],
      time: "1時間前",
    },
    presets: [
      {
        text: "空港の待ち時間にエッジ同期プロトコルの冪等性を整理 #アーキテクチャ #ひらめき",
        title: "ミリ秒エッジ同期設計",
        quote:
          "ローカル先行書き込み、再接続時にタイムスタンプ昇順で安全に同期。",
        tag: "アーキテクチャ",
      },
      {
        text: "オフラインPWAなら機内や地下鉄でも思考の中断ゼロ #ひらめき",
        title: "オフラインファースト体験",
        quote: "オフラインでも手元で即座に保存され、通信回復時に自動整合。",
        tag: "ひらめき",
      },
      {
        text: "Telegramボット連携完了。音声入力から自動文字起こしでナレッジ化 #日常",
        title: "瞬時インスピレーション記録",
        quote: "思いついた音声を送信するだけで、自動で構造化メモとして蓄積。",
        tag: "日常",
      },
    ],
    ui: {
      statsRecords: "記録",
      statsTags: "タグ",
      statsDays: "日",
      trend: "傾向",
      calendar: "カレンダー",
      timeline: "タイムライン",
      archive: "アーカイブ",
      trash: "ゴミ箱",
      dailyReview: "振り返り",
      randomWalk: "散歩",
      memory: "記憶",
      calendarView: "予定",
      projects: "プロジェクト",
      tagIndex: "タグ一覧",
      searchPlaceholder: "記録を検索...",
      composerPlaceholder: "今何を考えていますか？書き留めよう...",
      send: "送信",
      justNow: "たった今",
      clearFilter: "✕ すべて",
      recordPrefix: "記録",
      months: ["6月", "7月", "8月", "9月"],
      tags: [
        { name: "プロダクト", count: 22 },
        { name: "思考", count: 22 },
        { name: "ひらめき", count: 22 },
        { name: "日常", count: 21 },
        { name: "計画", count: 21 },
        { name: "読書", count: 22 },
      ],
    },
  },
  fr: {
    memo1: {
      title: "Notes de lecture : Attention et synthèse",
      content:
        "Plus l'information abonde, plus nous avons besoin de calme. Notez vos observations éparses : les connexions apparaîtront naturellement.",
      quote:
        "Apprendre ne consiste pas à accumuler des réponses, mais à poser de meilleures questions.",
      tags: ["idées", "lecture"],
      time: "il y a 21m",
    },
    memo2: {
      title: "Faire de la note le point de départ de la pensée",
      content:
        "Réflexion pendant une marche : un bon outil supprime les frictions cognitives. Ouvrez et écrivez instantanément.\n• Garder une ligne directrice claire\n• Étiqueter les idées clés\n• Revue hebdomadaire",
      tags: ["pensée", "produit"],
      time: "il y a 1h",
    },
    presets: [
      {
        text: "Conception du protocole de synchronisation idempotent en salle d'attente #architecture #idées",
        title: "Synchronisation Edge en millisecondes",
        quote:
          "Persistance locale d'abord, synchronisation incrémentielle dès le retour du réseau.",
        tag: "architecture",
      },
      {
        text: "Le mode PWA hors-ligne maintient le flux intact en vol ou en métro #idées",
        title: "Expérience Offline-First",
        quote: "Aucune coupure de pensée même sans connexion.",
        tag: "idées",
      },
      {
        text: "Bot Telegram configuré pour capturer des mémos vocaux transcrits instantanément #vie",
        title: "Capture vocale instantanée",
        quote:
          "Un message vocal se transforme en note structurée en quelques secondes.",
        tag: "vie",
      },
    ],
    ui: {
      statsRecords: "Notes",
      statsTags: "Tags",
      statsDays: "Jours",
      trend: "Tendance",
      calendar: "Calendrier",
      timeline: "Fil",
      archive: "Archives",
      trash: "Corbeille",
      dailyReview: "Revue du jour",
      randomWalk: "Exploration",
      memory: "Mémoire",
      calendarView: "Agenda",
      projects: "Projets",
      tagIndex: "Index des tags",
      searchPlaceholder: "Rechercher...",
      composerPlaceholder: "À quoi pensez-vous en ce moment ?...",
      send: "Publier",
      justNow: "à l'instant",
      clearFilter: "✕ Tout",
      recordPrefix: "Note",
      months: ["Juin", "Juil", "Août", "Sept"],
      tags: [
        { name: "produit", count: 22 },
        { name: "pensée", count: 22 },
        { name: "idées", count: 22 },
        { name: "vie", count: 21 },
        { name: "plans", count: 21 },
        { name: "lecture", count: 22 },
      ],
    },
  },
  es: {
    memo1: {
      title: "Notas de lectura: Atención y claridad",
      content:
        "Cuanta más información nos rodea, más espacio silencioso necesitamos. Captura las observaciones sueltas: las conexiones emergerán solas.",
      quote:
        "Aprender no es acumular respuestas, sino formular mejores preguntas.",
      tags: ["ideas", "lectura"],
      time: "hace 21m",
    },
    memo2: {
      title: "Hacer de cada nota el inicio del pensamiento",
      content:
        "Pensamiento durante una caminata: las buenas herramientas eliminan la fricción. Abre y escribe al instante.\n• Mantener una línea clara\n• Etiquetar los chispazos clave\n• Revisión semanal",
      tags: ["reflexión", "producto"],
      time: "hace 1h",
    },
    presets: [
      {
        text: "Diseño del protocolo de sincronización idempotente en el aeropuerto #arquitectura #ideas",
        title: "Sincronización en el Edge",
        quote:
          "Persistencia local primero, sincronización incremental al reconectar.",
        tag: "arquitectura",
      },
      {
        text: "PWA offline mantiene el flujo de concentración en el metro o avión #ideas",
        title: "Experiencia Offline-First",
        quote: "Sin conexión, sin interrupciones.",
        tag: "ideas",
      },
      {
        text: "Bot de Telegram configurado para transcripción de notas de voz al vuelo #vida",
        title: "Captura de voz instantánea",
        quote:
          "Un audio casual se convierte en conocimiento estructurado en segundos.",
        tag: "vida",
      },
    ],
    ui: {
      statsRecords: "Notas",
      statsTags: "Etiquetas",
      statsDays: "Días",
      trend: "Tendencia",
      calendar: "Calendario",
      timeline: "Cronología",
      archive: "Archivo",
      trash: "Papelera",
      dailyReview: "Repaso diario",
      randomWalk: "Paseo aleatorio",
      memory: "Memoria",
      calendarView: "Agenda",
      projects: "Proyectos",
      tagIndex: "Etiquetas",
      searchPlaceholder: "Buscar notas...",
      composerPlaceholder: "¿En qué piensas ahora?...",
      send: "Enviar",
      justNow: "ahora",
      clearFilter: "✕ Todo",
      recordPrefix: "Nota",
      months: ["Jun", "Jul", "Ago", "Sep"],
      tags: [
        { name: "producto", count: 22 },
        { name: "reflexión", count: 22 },
        { name: "ideas", count: 22 },
        { name: "vida", count: 21 },
        { name: "planes", count: 21 },
        { name: "lectura", count: 22 },
      ],
    },
  },
  ko: {
    memo1: {
      title: "독서 발췌: 집중력과 창의성",
      content:
        "정보가 많아질수록 고요한 사색 공간이 절실해집니다. 흩어진 생각을 적어두면 자연스레 연결 고리가 형성됩니다.",
      quote: "배움은 정답을 모으는 것이 아니라 더 나은 질문을 던지는 과정이다.",
      tags: ["영감", "독서"],
      time: "21분 전",
    },
    memo2: {
      title: "기록을 사유의 출발점으로",
      content:
        "산책 중 떠오른 생각: 훌륭한 도구는 생각과 기록 사이의 마찰을 없애줍니다. 켜자마자 바로 적고, 필요한 것을 즉시 찾는다.\n• 명확한 메인 라인 유지\n• 핵심 영감에 태그 부여\n• 매주 짧은 회고 루틴",
      tags: ["생각", "프로덕트"],
      time: "1시간 전",
    },
    presets: [
      {
        text: "공항 대기 중 엣지 동기화 멱등성 프로토콜 설계 완료 #아키텍처 #영감",
        title: "엣지 밀리초 동기화 설계",
        quote:
          "로컬 SQLite 우선 저장, 네트워크 재연결 시 단조 타임스탬프 동기화.",
        tag: "아키텍처",
      },
      {
        text: "비행기나 지하철에서도 흐름 끊김 없는 오프라인 PWA 경험 #영감",
        title: "오프라인 우선 모바일 경험",
        quote: "인터넷 없는 환경에서도 언제든 마음껏 메모.",
        tag: "영감",
      },
      {
        text: "텔레그램 음성 메모 봇 연동 완료. 음성 녹음 시 자동 텍스트화 입고 #일상",
        title: "음성 즉시 메모 파이프라인",
        quote: "음성을 전송하면 수 초 내에 구조화된 지식 카드로 변환.",
        tag: "일상",
      },
    ],
    ui: {
      statsRecords: "기록",
      statsTags: "태그",
      statsDays: "일",
      trend: "트렌드",
      calendar: "캘린더",
      timeline: "타임라인",
      archive: "보관함",
      trash: "휴지통",
      dailyReview: "일일 회고",
      randomWalk: "랜덤 워크",
      memory: "기억",
      calendarView: "일정",
      projects: "프로젝트",
      tagIndex: "태그 색인",
      searchPlaceholder: "기록 검색...",
      composerPlaceholder: "지금 어떤 생각을 하고 계신가요?...",
      send: "게시",
      justNow: "방금",
      clearFilter: "✕ 전체",
      recordPrefix: "기록",
      months: ["6월", "7월", "8월", "9월"],
      tags: [
        { name: "프로덕트", count: 22 },
        { name: "생각", count: 22 },
        { name: "영감", count: 22 },
        { name: "일상", count: 21 },
        { name: "계획", count: 21 },
        { name: "독서", count: 22 },
      ],
    },
  },
  ru: {
    memo1: {
      title: "Заметки из книг: Внимание и синтез",
      content:
        "Чем больше вокруг информации, тем важнее тихое пространство для размышлений. Фиксируйте наблюдения: со временем они сложатся в систему.",
      quote:
        "Обучение — это не накопление ответов, а умение задавать лучшие вопросы.",
      tags: ["мысли", "чтение"],
      time: "21 мин. назад",
    },
    memo2: {
      title: "Заметка как начало глубокой мысли",
      content:
        "Инсайт на прогулке: хороший инструмент убирает трение между мыслью и текстом. Открыл — записал, нужное — нашел за секунду.\n• Держать главную линию\n• Тегировать ключевые инсайты\n• Еженедельный обзор",
      tags: ["размышления", "продукт"],
      time: "1 час назад",
    },
    presets: [
      {
        text: "Спроектировал идемпотентный протокол синхронизации в зале ожидания #архитектура #мысли",
        title: "Мгновенная синхронизация на Edge",
        quote:
          "Сначала запись в локальный SQLite, затем инкрементальная синхронизация.",
        tag: "архитектура",
      },
      {
        text: "Офлайн-режим PWA сохраняет фокус в метро и в полетах #мысли",
        title: "Офлайн-ориентированный опыт",
        quote: "Мысли никогда не теряются даже без подключения к сети.",
        tag: "мысли",
      },
      {
        text: "Настроил Telegram-бота для голосовых заметок с автотранскрипцией #жизнь",
        title: "Быстрая фиксация аудио",
        quote:
          "Голосовое сообщение за секунды превращается в структурированную запись.",
        tag: "жизнь",
      },
    ],
    ui: {
      statsRecords: "Заметки",
      statsTags: "Теги",
      statsDays: "Дни",
      trend: "Тренд",
      calendar: "Календарь",
      timeline: "Лента",
      archive: "Архив",
      trash: "Корзина",
      dailyReview: "Обзор дня",
      randomWalk: "Случайная",
      memory: "Память",
      calendarView: "Расписание",
      projects: "Проекты",
      tagIndex: "Индекс тегов",
      searchPlaceholder: "Поиск заметок...",
      composerPlaceholder: "О чем думаете прямо сейчас?...",
      send: "Отправить",
      justNow: "только что",
      clearFilter: "✕ Все",
      recordPrefix: "Заметка",
      months: ["Июн", "Июл", "Авг", "Сен"],
      tags: [
        { name: "продукт", count: 22 },
        { name: "размышления", count: 22 },
        { name: "мысли", count: 22 },
        { name: "жизнь", count: 21 },
        { name: "планы", count: 21 },
        { name: "чтение", count: 22 },
      ],
    },
  },
  ar: {
    memo1: {
      title: "مقتطفات القراءة: الانتباه والإبداع",
      content:
        "كلما زاد تدفق المعلومات، زادت حاجتنا لمساحة هادئة للتأمل. سجّل ملاحظاتك المبعثرة، وستتصل الأفكار تلقائياً مع الوقت.",
      quote:
        "التعلم ليس مجرد تجميع للإجابات، بل هو الاستمرار في طرح أسئلة أفضل.",
      tags: ["إلهام", "قراءة"],
      time: "منذ 21 دقيقة",
    },
    memo2: {
      title: "تحويل التدوين إلى بداية التفكير",
      content:
        "فكرة أثناء المشي: الأداة الممتازة تزيل العوائق بين الفكرة وكتابتها. تفتح لتكتب فوراً، وتبحث لتجد المطلوب بلحظة.\n• الحفاظ على مسار رئيسي واضح\n• وسم الأفكار الجوهرية\n• مراجعة أسبوعية منتظمة",
      tags: ["تفكير", "منتج"],
      time: "منذ ساعة",
    },
    presets: [
      {
        text: "صياغة بروتوكول المزامنة السحابية أثناء الانتظار في المطار #بنية #إلهام",
        title: "تصميم المزامنة في أجزاء من الثانية",
        quote: "التخزين المحلي أولاً، ثم المزامنة التراكمية عند عودة الاتصال.",
        tag: "بنية",
      },
      {
        text: "وضع PWA بدون اتصال يحافظ على استمرارية الإبداع في كل مكان #إلهام",
        title: "تجربة العمل دون اتصال أولاً",
        quote: "الكتابة تتدفق بسلاسة في الطائرة أو المترو دون أي توقف.",
        tag: "إلهام",
      },
      {
        text: "إعداد بوت تيليجرام لتحويل المذكرات الصوتية إلى نصوص تلقائياً #حياة",
        title: "مسار التدوين الصوتي الفوري",
        quote: "تسجيل صوتي عفوي يتحول إلى بطاقة معرفية منظمة خلال ثوانٍ.",
        tag: "حياة",
      },
    ],
    ui: {
      statsRecords: "مذكرات",
      statsTags: "وسوم",
      statsDays: "أيام",
      trend: "المسار",
      calendar: "التقويم",
      timeline: "الخط الزمني",
      archive: "الأرشيف",
      trash: "سلة المهملات",
      dailyReview: "المراجعة اليومية",
      randomWalk: "جولة عشوائية",
      memory: "الذاكرة",
      calendarView: "الجدول",
      projects: "المشاريع",
      tagIndex: "فهرس الوسوم",
      searchPlaceholder: "بحث في المذكرات...",
      composerPlaceholder: "ما الذي يدور في ذهنك الآن؟ دوّنه...",
      send: "إرسال",
      justNow: "الآن",
      clearFilter: "✕ الكل",
      recordPrefix: "مذكرة",
      months: ["يونيو", "يوليو", "أغسطس", "سبتمبر"],
      tags: [
        { name: "منتج", count: 22 },
        { name: "تفكير", count: 22 },
        { name: "إلهام", count: 22 },
        { name: "حياة", count: 21 },
        { name: "خطط", count: 21 },
        { name: "قراءة", count: 22 },
      ],
    },
  },
};
