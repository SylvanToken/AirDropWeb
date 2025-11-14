/**
 * Email Translation System
 * 
 * Provides multilingual email content for all email templates.
 * Supports: English (en), Turkish (tr), German (de), Chinese (zh), Russian (ru)
 */

export type EmailLocale = 'en' | 'tr' | 'de' | 'zh' | 'ru';

export interface EmailTranslations {
  welcome: {
    preview: string;
    title: string;
    greeting: string;
    intro: string;
    ctaButton: string;
    nextSteps: string;
    step1: string;
    step2: string;
    step3: string;
  };
  taskCompletion: {
    preview: string;
    title: string;
    message: string;
    totalPoints: string;
    ctaButton: string;
    keepGoing: string;
  };
  walletPending: {
    preview: string;
    title: string;
    message: string;
    walletAddress: string;
    nextSteps: string;
    step1: string;
    step2: string;
    ctaButton: string;
  };
  walletApproved: {
    preview: string;
    title: string;
    message: string;
    walletAddress: string;
    nextSteps: string;
    ctaButton: string;
  };
  walletRejected: {
    preview: string;
    title: string;
    message: string;
    walletAddress: string;
    reason: string;
    nextSteps: string;
    ctaButton: string;
  };
  adminReviewNeeded: {
    preview: string;
    title: string;
    message: string;
    details: string;
    ctaButton: string;
  };
  adminFraudAlert: {
    preview: string;
    title: string;
    message: string;
    fraudScore: string;
    ctaButton: string;
  };
  adminDailyDigest: {
    preview: string;
    title: string;
    greeting: string;
    newUsers: string;
    completions: string;
    pendingReviews: string;
    ctaButton: string;
  };
  adminErrorAlert: {
    preview: string;
    title: string;
    message: string;
    errorDetails: string;
    ctaButton: string;
  };
  unsubscribeConfirmation: {
    preview: string;
    title: string;
    greeting: string;
    messageAll: string;
    messageType: string;
    whatYouWillStillReceive: string;
    stillReceive1: string;
    stillReceive2: string;
    stillReceive3: string;
    changeYourMind: string;
    resubscribeButton: string;
    questions: string;
  };
  common: {
    footer: string;
    unsubscribe: string;
    support: string;
    needHelp: string;
    contactUs: string;
    allRightsReserved: string;
  };
}

// English translations
const en: EmailTranslations = {
  welcome: {
    preview: 'Welcome to Sylvan Token Airdrop Platform',
    title: 'Welcome to Sylvan Token! 🌿',
    greeting: 'Hi {{username}},',
    intro: 'Thank you for joining the Sylvan Token Airdrop Platform. We\'re excited to have you on board!',
    ctaButton: 'Go to Dashboard',
    nextSteps: 'Here\'s what you can do next:',
    step1: 'Complete your profile and connect your wallet',
    step2: 'Start completing daily tasks to earn points',
    step3: 'Climb the leaderboard and qualify for airdrops',
  },
  taskCompletion: {
    preview: 'Task completed! You earned {{points}} points',
    title: 'Congratulations! 🎉',
    message: 'You successfully completed "{{taskName}}" and earned {{points}} points.',
    totalPoints: 'Your total points: {{total}}',
    ctaButton: 'View Dashboard',
    keepGoing: 'Keep up the great work! Complete more tasks to increase your airdrop allocation.',
  },
  walletPending: {
    preview: 'Your wallet verification is pending',
    title: 'Wallet Verification Pending ⏳',
    message: 'We\'ve received your wallet address and it\'s currently under review.',
    walletAddress: 'Wallet Address: {{address}}',
    nextSteps: 'What happens next:',
    step1: 'Our team will verify your wallet address',
    step2: 'You\'ll receive an email once verification is complete',
    ctaButton: 'View Wallet Status',
  },
  walletApproved: {
    preview: 'Your wallet has been verified!',
    title: 'Wallet Verified! ✅',
    message: 'Great news! Your wallet address has been successfully verified.',
    walletAddress: 'Verified Wallet: {{address}}',
    nextSteps: 'You\'re now eligible to receive airdrops. Keep completing tasks to maximize your allocation!',
    ctaButton: 'View Dashboard',
  },
  walletRejected: {
    preview: 'Wallet verification unsuccessful',
    title: 'Wallet Verification Issue ⚠️',
    message: 'Unfortunately, we couldn\'t verify your wallet address.',
    walletAddress: 'Wallet Address: {{address}}',
    reason: 'Reason: {{reason}}',
    nextSteps: 'Please submit a valid wallet address to continue participating in the airdrop.',
    ctaButton: 'Update Wallet',
  },
  adminReviewNeeded: {
    preview: 'Manual review required',
    title: 'Manual Review Required 📋',
    message: 'A completion requires your review.',
    details: '{{details}}',
    ctaButton: 'Review Now',
  },
  adminFraudAlert: {
    preview: 'High fraud score detected',
    title: 'Fraud Alert! 🚨',
    message: 'A user has triggered a high fraud score.',
    fraudScore: 'Fraud Score: {{score}}',
    ctaButton: 'Investigate',
  },
  adminDailyDigest: {
    preview: 'Your daily platform summary',
    title: 'Daily Platform Digest 📊',
    greeting: 'Hello Admin,',
    newUsers: 'New Users: {{count}}',
    completions: 'Task Completions: {{count}}',
    pendingReviews: 'Pending Reviews: {{count}}',
    ctaButton: 'View Admin Dashboard',
  },
  adminErrorAlert: {
    preview: 'System error detected',
    title: 'System Error Alert ⚠️',
    message: 'A system error has occurred that requires attention.',
    errorDetails: 'Error: {{error}}',
    ctaButton: 'View Details',
  },
  unsubscribeConfirmation: {
    preview: 'You have been unsubscribed',
    title: 'Unsubscribe Confirmed',
    greeting: 'Hi {{username}},',
    messageAll: 'You have been successfully unsubscribed from all non-essential emails.',
    messageType: 'You have been successfully unsubscribed from {{type}} emails.',
    whatYouWillStillReceive: 'What you will still receive:',
    stillReceive1: 'Important account security notifications',
    stillReceive2: 'Wallet verification status updates',
    stillReceive3: 'Critical system announcements',
    changeYourMind: 'Changed your mind? You can update your email preferences anytime from your profile settings.',
    resubscribeButton: 'Manage Email Preferences',
    questions: 'Have questions about your email preferences?',
  },
  common: {
    footer: 'You\'re receiving this email because you have an account with Sylvan Token.',
    unsubscribe: 'Unsubscribe from these emails',
    support: 'Need help? Contact our support team.',
    needHelp: 'Need Help?',
    contactUs: 'Contact Us',
    allRightsReserved: '© 2025 Sylvan Token. All rights reserved.',
  },
};

// Turkish translations
const tr: EmailTranslations = {
  welcome: {
    preview: 'Sylvan Token Airdrop Platformuna Hoş Geldiniz',
    title: 'Sylvan Token\'a Hoş Geldiniz! 🌿',
    greeting: 'Merhaba {{username}},',
    intro: 'Sylvan Token Airdrop Platformuna katıldığınız için teşekkür ederiz. Sizi aramızda görmekten mutluluk duyuyoruz!',
    ctaButton: 'Panele Git',
    nextSteps: 'Yapabilecekleriniz:',
    step1: 'Profilinizi tamamlayın ve cüzdanınızı bağlayın',
    step2: 'Puan kazanmak için günlük görevleri tamamlamaya başlayın',
    step3: 'Sıralamada yükselip airdrop için hak kazanın',
  },
  taskCompletion: {
    preview: 'Görev tamamlandı! {{points}} puan kazandınız',
    title: 'Tebrikler! 🎉',
    message: '"{{taskName}}" görevini başarıyla tamamladınız ve {{points}} puan kazandınız.',
    totalPoints: 'Toplam puanınız: {{total}}',
    ctaButton: 'Paneli Görüntüle',
    keepGoing: 'Harika iş çıkarıyorsunuz! Airdrop tahsisinizi artırmak için daha fazla görev tamamlayın.',
  },
  walletPending: {
    preview: 'Cüzdan doğrulamanız beklemede',
    title: 'Cüzdan Doğrulama Beklemede ⏳',
    message: 'Cüzdan adresinizi aldık ve şu anda inceleme aşamasında.',
    walletAddress: 'Cüzdan Adresi: {{address}}',
    nextSteps: 'Sırada ne var:',
    step1: 'Ekibimiz cüzdan adresinizi doğrulayacak',
    step2: 'Doğrulama tamamlandığında e-posta alacaksınız',
    ctaButton: 'Cüzdan Durumunu Görüntüle',
  },
  walletApproved: {
    preview: 'Cüzdanınız doğrulandı!',
    title: 'Cüzdan Doğrulandı! ✅',
    message: 'Harika haber! Cüzdan adresiniz başarıyla doğrulandı.',
    walletAddress: 'Doğrulanmış Cüzdan: {{address}}',
    nextSteps: 'Artık airdrop almaya uygunsunuz. Tahsisinizi maksimize etmek için görevleri tamamlamaya devam edin!',
    ctaButton: 'Paneli Görüntüle',
  },
  walletRejected: {
    preview: 'Cüzdan doğrulama başarısız',
    title: 'Cüzdan Doğrulama Sorunu ⚠️',
    message: 'Maalesef cüzdan adresinizi doğrulayamadık.',
    walletAddress: 'Cüzdan Adresi: {{address}}',
    reason: 'Sebep: {{reason}}',
    nextSteps: 'Airdrop\'a katılmaya devam etmek için lütfen geçerli bir cüzdan adresi gönderin.',
    ctaButton: 'Cüzdanı Güncelle',
  },
  adminReviewNeeded: {
    preview: 'Manuel inceleme gerekli',
    title: 'Manuel İnceleme Gerekli 📋',
    message: 'Bir tamamlama incelemenizi bekliyor.',
    details: '{{details}}',
    ctaButton: 'Şimdi İncele',
  },
  adminFraudAlert: {
    preview: 'Yüksek dolandırıcılık skoru tespit edildi',
    title: 'Dolandırıcılık Uyarısı! 🚨',
    message: 'Bir kullanıcı yüksek dolandırıcılık skoru tetikledi.',
    fraudScore: 'Dolandırıcılık Skoru: {{score}}',
    ctaButton: 'İncele',
  },
  adminDailyDigest: {
    preview: 'Günlük platform özeti',
    title: 'Günlük Platform Özeti 📊',
    greeting: 'Merhaba Yönetici,',
    newUsers: 'Yeni Kullanıcılar: {{count}}',
    completions: 'Görev Tamamlamaları: {{count}}',
    pendingReviews: 'Bekleyen İncelemeler: {{count}}',
    ctaButton: 'Yönetici Panelini Görüntüle',
  },
  adminErrorAlert: {
    preview: 'Sistem hatası tespit edildi',
    title: 'Sistem Hatası Uyarısı ⚠️',
    message: 'Dikkat gerektiren bir sistem hatası oluştu.',
    errorDetails: 'Hata: {{error}}',
    ctaButton: 'Detayları Görüntüle',
  },
  unsubscribeConfirmation: {
    preview: 'Abonelikten çıkıldı',
    title: 'Abonelik İptali Onaylandı',
    greeting: 'Merhaba {{username}},',
    messageAll: 'Zorunlu olmayan tüm e-postalardan başarıyla aboneliğiniz iptal edildi.',
    messageType: '{{type}} e-postalarından başarıyla aboneliğiniz iptal edildi.',
    whatYouWillStillReceive: 'Almaya devam edeceğiniz e-postalar:',
    stillReceive1: 'Önemli hesap güvenliği bildirimleri',
    stillReceive2: 'Cüzdan doğrulama durum güncellemeleri',
    stillReceive3: 'Kritik sistem duyuruları',
    changeYourMind: 'Fikrinizi değiştirdiniz mi? E-posta tercihlerinizi profil ayarlarınızdan istediğiniz zaman güncelleyebilirsiniz.',
    resubscribeButton: 'E-posta Tercihlerini Yönet',
    questions: 'E-posta tercihleriniz hakkında sorularınız mı var?',
  },
  common: {
    footer: 'Bu e-postayı Sylvan Token\'da bir hesabınız olduğu için alıyorsunuz.',
    unsubscribe: 'Bu e-postalardan aboneliği iptal et',
    support: 'Yardıma mı ihtiyacınız var? Destek ekibimizle iletişime geçin.',
    needHelp: 'Yardıma mı İhtiyacınız Var?',
    contactUs: 'Bize Ulaşın',
    allRightsReserved: '© 2025 Sylvan Token. Tüm hakları saklıdır.',
  },
};

// German translations
const de: EmailTranslations = {
  welcome: {
    preview: 'Willkommen bei Sylvan Token Airdrop Platform',
    title: 'Willkommen bei Sylvan Token! 🌿',
    greeting: 'Hallo {{username}},',
    intro: 'Vielen Dank, dass Sie der Sylvan Token Airdrop Platform beigetreten sind. Wir freuen uns, Sie an Bord zu haben!',
    ctaButton: 'Zum Dashboard',
    nextSteps: 'Das können Sie als Nächstes tun:',
    step1: 'Vervollständigen Sie Ihr Profil und verbinden Sie Ihre Wallet',
    step2: 'Beginnen Sie mit täglichen Aufgaben, um Punkte zu verdienen',
    step3: 'Steigen Sie in der Rangliste auf und qualifizieren Sie sich für Airdrops',
  },
  taskCompletion: {
    preview: 'Aufgabe abgeschlossen! Sie haben {{points}} Punkte verdient',
    title: 'Glückwunsch! 🎉',
    message: 'Sie haben "{{taskName}}" erfolgreich abgeschlossen und {{points}} Punkte verdient.',
    totalPoints: 'Ihre Gesamtpunkte: {{total}}',
    ctaButton: 'Dashboard anzeigen',
    keepGoing: 'Machen Sie weiter so! Erledigen Sie mehr Aufgaben, um Ihre Airdrop-Zuteilung zu erhöhen.',
  },
  walletPending: {
    preview: 'Ihre Wallet-Verifizierung steht aus',
    title: 'Wallet-Verifizierung ausstehend ⏳',
    message: 'Wir haben Ihre Wallet-Adresse erhalten und sie wird derzeit überprüft.',
    walletAddress: 'Wallet-Adresse: {{address}}',
    nextSteps: 'Was passiert als Nächstes:',
    step1: 'Unser Team wird Ihre Wallet-Adresse verifizieren',
    step2: 'Sie erhalten eine E-Mail, sobald die Verifizierung abgeschlossen ist',
    ctaButton: 'Wallet-Status anzeigen',
  },
  walletApproved: {
    preview: 'Ihre Wallet wurde verifiziert!',
    title: 'Wallet verifiziert! ✅',
    message: 'Großartige Neuigkeiten! Ihre Wallet-Adresse wurde erfolgreich verifiziert.',
    walletAddress: 'Verifizierte Wallet: {{address}}',
    nextSteps: 'Sie sind jetzt berechtigt, Airdrops zu erhalten. Erledigen Sie weiterhin Aufgaben, um Ihre Zuteilung zu maximieren!',
    ctaButton: 'Dashboard anzeigen',
  },
  walletRejected: {
    preview: 'Wallet-Verifizierung fehlgeschlagen',
    title: 'Problem bei der Wallet-Verifizierung ⚠️',
    message: 'Leider konnten wir Ihre Wallet-Adresse nicht verifizieren.',
    walletAddress: 'Wallet-Adresse: {{address}}',
    reason: 'Grund: {{reason}}',
    nextSteps: 'Bitte reichen Sie eine gültige Wallet-Adresse ein, um weiterhin am Airdrop teilzunehmen.',
    ctaButton: 'Wallet aktualisieren',
  },
  adminReviewNeeded: {
    preview: 'Manuelle Überprüfung erforderlich',
    title: 'Manuelle Überprüfung erforderlich 📋',
    message: 'Eine Fertigstellung erfordert Ihre Überprüfung.',
    details: '{{details}}',
    ctaButton: 'Jetzt überprüfen',
  },
  adminFraudAlert: {
    preview: 'Hoher Betrugs-Score erkannt',
    title: 'Betrugswarnung! 🚨',
    message: 'Ein Benutzer hat einen hohen Betrugs-Score ausgelöst.',
    fraudScore: 'Betrugs-Score: {{score}}',
    ctaButton: 'Untersuchen',
  },
  adminDailyDigest: {
    preview: 'Ihre tägliche Plattformzusammenfassung',
    title: 'Tägliche Plattformübersicht 📊',
    greeting: 'Hallo Administrator,',
    newUsers: 'Neue Benutzer: {{count}}',
    completions: 'Aufgabenabschlüsse: {{count}}',
    pendingReviews: 'Ausstehende Überprüfungen: {{count}}',
    ctaButton: 'Admin-Dashboard anzeigen',
  },
  adminErrorAlert: {
    preview: 'Systemfehler erkannt',
    title: 'Systemfehlerwarnung ⚠️',
    message: 'Ein Systemfehler ist aufgetreten, der Aufmerksamkeit erfordert.',
    errorDetails: 'Fehler: {{error}}',
    ctaButton: 'Details anzeigen',
  },
  unsubscribeConfirmation: {
    preview: 'Sie wurden abgemeldet',
    title: 'Abmeldung bestätigt',
    greeting: 'Hallo {{username}},',
    messageAll: 'Sie wurden erfolgreich von allen nicht wesentlichen E-Mails abgemeldet.',
    messageType: 'Sie wurden erfolgreich von {{type}}-E-Mails abgemeldet.',
    whatYouWillStillReceive: 'Was Sie weiterhin erhalten werden:',
    stillReceive1: 'Wichtige Kontosicherheitsbenachrichtigungen',
    stillReceive2: 'Wallet-Verifizierungsstatus-Updates',
    stillReceive3: 'Kritische Systemankündigungen',
    changeYourMind: 'Haben Sie Ihre Meinung geändert? Sie können Ihre E-Mail-Einstellungen jederzeit in Ihren Profileinstellungen aktualisieren.',
    resubscribeButton: 'E-Mail-Einstellungen verwalten',
    questions: 'Haben Sie Fragen zu Ihren E-Mail-Einstellungen?',
  },
  common: {
    footer: 'Sie erhalten diese E-Mail, weil Sie ein Konto bei Sylvan Token haben.',
    unsubscribe: 'Von diesen E-Mails abmelden',
    support: 'Benötigen Sie Hilfe? Kontaktieren Sie unser Support-Team.',
    needHelp: 'Benötigen Sie Hilfe?',
    contactUs: 'Kontaktieren Sie uns',
    allRightsReserved: '© 2025 Sylvan Token. Alle Rechte vorbehalten.',
  },
};

// Chinese translations
const zh: EmailTranslations = {
  welcome: {
    preview: '欢迎来到 Sylvan Token 空投平台',
    title: '欢迎来到 Sylvan Token！🌿',
    greeting: '你好 {{username}}，',
    intro: '感谢您加入 Sylvan Token 空投平台。我们很高兴您的加入！',
    ctaButton: '前往仪表板',
    nextSteps: '接下来您可以做的事情：',
    step1: '完善您的个人资料并连接您的钱包',
    step2: '开始完成每日任务以赚取积分',
    step3: '攀登排行榜并获得空投资格',
  },
  taskCompletion: {
    preview: '任务完成！您获得了 {{points}} 积分',
    title: '恭喜！🎉',
    message: '您成功完成了"{{taskName}}"并获得了 {{points}} 积分。',
    totalPoints: '您的总积分：{{total}}',
    ctaButton: '查看仪表板',
    keepGoing: '继续保持！完成更多任务以增加您的空投分配。',
  },
  walletPending: {
    preview: '您的钱包验证正在等待中',
    title: '钱包验证待处理 ⏳',
    message: '我们已收到您的钱包地址，目前正在审核中。',
    walletAddress: '钱包地址：{{address}}',
    nextSteps: '接下来会发生什么：',
    step1: '我们的团队将验证您的钱包地址',
    step2: '验证完成后您将收到电子邮件',
    ctaButton: '查看钱包状态',
  },
  walletApproved: {
    preview: '您的钱包已验证！',
    title: '钱包已验证！✅',
    message: '好消息！您的钱包地址已成功验证。',
    walletAddress: '已验证的钱包：{{address}}',
    nextSteps: '您现在有资格接收空投。继续完成任务以最大化您的分配！',
    ctaButton: '查看仪表板',
  },
  walletRejected: {
    preview: '钱包验证失败',
    title: '钱包验证问题 ⚠️',
    message: '很遗憾，我们无法验证您的钱包地址。',
    walletAddress: '钱包地址：{{address}}',
    reason: '原因：{{reason}}',
    nextSteps: '请提交有效的钱包地址以继续参与空投。',
    ctaButton: '更新钱包',
  },
  adminReviewNeeded: {
    preview: '需要人工审核',
    title: '需要人工审核 📋',
    message: '有一个完成需要您的审核。',
    details: '{{details}}',
    ctaButton: '立即审核',
  },
  adminFraudAlert: {
    preview: '检测到高欺诈分数',
    title: '欺诈警报！🚨',
    message: '一个用户触发了高欺诈分数。',
    fraudScore: '欺诈分数：{{score}}',
    ctaButton: '调查',
  },
  adminDailyDigest: {
    preview: '您的每日平台摘要',
    title: '每日平台摘要 📊',
    greeting: '您好，管理员，',
    newUsers: '新用户：{{count}}',
    completions: '任务完成：{{count}}',
    pendingReviews: '待审核：{{count}}',
    ctaButton: '查看管理仪表板',
  },
  adminErrorAlert: {
    preview: '检测到系统错误',
    title: '系统错误警报 ⚠️',
    message: '发生了需要注意的系统错误。',
    errorDetails: '错误：{{error}}',
    ctaButton: '查看详情',
  },
  unsubscribeConfirmation: {
    preview: '您已取消订阅',
    title: '取消订阅已确认',
    greeting: '你好 {{username}}，',
    messageAll: '您已成功取消订阅所有非必要电子邮件。',
    messageType: '您已成功取消订阅{{type}}电子邮件。',
    whatYouWillStillReceive: '您仍将收到：',
    stillReceive1: '重要的账户安全通知',
    stillReceive2: '钱包验证状态更新',
    stillReceive3: '关键系统公告',
    changeYourMind: '改变主意了？您可以随时从个人资料设置中更新您的电子邮件偏好设置。',
    resubscribeButton: '管理电子邮件偏好设置',
    questions: '对您的电子邮件偏好设置有疑问？',
  },
  common: {
    footer: '您收到此电子邮件是因为您在 Sylvan Token 拥有帐户。',
    unsubscribe: '取消订阅这些电子邮件',
    support: '需要帮助？联系我们的支持团队。',
    needHelp: '需要帮助？',
    contactUs: '联系我们',
    allRightsReserved: '© 2025 Sylvan Token。保留所有权利。',
  },
};

// Russian translations
const ru: EmailTranslations = {
  welcome: {
    preview: 'Добро пожаловать на платформу Sylvan Token Airdrop',
    title: 'Добро пожаловать в Sylvan Token! 🌿',
    greeting: 'Привет, {{username}},',
    intro: 'Спасибо, что присоединились к платформе Sylvan Token Airdrop. Мы рады видеть вас!',
    ctaButton: 'Перейти к панели',
    nextSteps: 'Что вы можете сделать дальше:',
    step1: 'Заполните свой профиль и подключите кошелек',
    step2: 'Начните выполнять ежедневные задания, чтобы зарабатывать баллы',
    step3: 'Поднимайтесь в рейтинге и получите право на airdrop',
  },
  taskCompletion: {
    preview: 'Задание выполнено! Вы заработали {{points}} баллов',
    title: 'Поздравляем! 🎉',
    message: 'Вы успешно выполнили "{{taskName}}" и заработали {{points}} баллов.',
    totalPoints: 'Ваши общие баллы: {{total}}',
    ctaButton: 'Просмотреть панель',
    keepGoing: 'Продолжайте в том же духе! Выполняйте больше заданий, чтобы увеличить свою долю airdrop.',
  },
  walletPending: {
    preview: 'Ваша верификация кошелька ожидает рассмотрения',
    title: 'Верификация кошелька ожидает рассмотрения ⏳',
    message: 'Мы получили адрес вашего кошелька, и он находится на рассмотрении.',
    walletAddress: 'Адрес кошелька: {{address}}',
    nextSteps: 'Что будет дальше:',
    step1: 'Наша команда проверит адрес вашего кошелька',
    step2: 'Вы получите электронное письмо после завершения верификации',
    ctaButton: 'Просмотреть статус кошелька',
  },
  walletApproved: {
    preview: 'Ваш кошелек верифицирован!',
    title: 'Кошелек верифицирован! ✅',
    message: 'Отличные новости! Адрес вашего кошелька успешно верифицирован.',
    walletAddress: 'Верифицированный кошелек: {{address}}',
    nextSteps: 'Теперь вы имеете право на получение airdrop. Продолжайте выполнять задания, чтобы максимизировать свою долю!',
    ctaButton: 'Просмотреть панель',
  },
  walletRejected: {
    preview: 'Верификация кошелька не удалась',
    title: 'Проблема с верификацией кошелька ⚠️',
    message: 'К сожалению, мы не смогли верифицировать адрес вашего кошелька.',
    walletAddress: 'Адрес кошелька: {{address}}',
    reason: 'Причина: {{reason}}',
    nextSteps: 'Пожалуйста, отправьте действительный адрес кошелька, чтобы продолжить участие в airdrop.',
    ctaButton: 'Обновить кошелек',
  },
  adminReviewNeeded: {
    preview: 'Требуется ручная проверка',
    title: 'Требуется ручная проверка 📋',
    message: 'Выполнение требует вашей проверки.',
    details: '{{details}}',
    ctaButton: 'Проверить сейчас',
  },
  adminFraudAlert: {
    preview: 'Обнаружен высокий показатель мошенничества',
    title: 'Предупреждение о мошенничестве! 🚨',
    message: 'Пользователь вызвал высокий показатель мошенничества.',
    fraudScore: 'Показатель мошенничества: {{score}}',
    ctaButton: 'Расследовать',
  },
  adminDailyDigest: {
    preview: 'Ваша ежедневная сводка платформы',
    title: 'Ежедневная сводка платформы 📊',
    greeting: 'Здравствуйте, администратор,',
    newUsers: 'Новые пользователи: {{count}}',
    completions: 'Выполнения заданий: {{count}}',
    pendingReviews: 'Ожидающие проверки: {{count}}',
    ctaButton: 'Просмотреть панель администратора',
  },
  adminErrorAlert: {
    preview: 'Обнаружена системная ошибка',
    title: 'Предупреждение о системной ошибке ⚠️',
    message: 'Произошла системная ошибка, требующая внимания.',
    errorDetails: 'Ошибка: {{error}}',
    ctaButton: 'Просмотреть детали',
  },
  unsubscribeConfirmation: {
    preview: 'Вы отписались',
    title: 'Отписка подтверждена',
    greeting: 'Привет, {{username}},',
    messageAll: 'Вы успешно отписались от всех необязательных писем.',
    messageType: 'Вы успешно отписались от писем {{type}}.',
    whatYouWillStillReceive: 'Что вы по-прежнему будете получать:',
    stillReceive1: 'Важные уведомления о безопасности учетной записи',
    stillReceive2: 'Обновления статуса верификации кошелька',
    stillReceive3: 'Критические системные объявления',
    changeYourMind: 'Передумали? Вы можете обновить свои настройки электронной почты в любое время в настройках профиля.',
    resubscribeButton: 'Управление настройками электронной почты',
    questions: 'Есть вопросы о ваших настройках электронной почты?',
  },
  common: {
    footer: 'Вы получаете это письмо, потому что у вас есть учетная запись в Sylvan Token.',
    unsubscribe: 'Отписаться от этих писем',
    support: 'Нужна помощь? Свяжитесь с нашей службой поддержки.',
    needHelp: 'Нужна помощь?',
    contactUs: 'Свяжитесь с нами',
    allRightsReserved: '© 2025 Sylvan Token. Все права защищены.',
  },
};

// Translation registry
const emailTranslations: Record<EmailLocale, EmailTranslations> = {
  en,
  tr,
  de,
  zh,
  ru,
};

/**
 * Get email translations for a specific locale
 * 
 * @param locale - The locale code (en, tr, de, zh, ru)
 * @returns Email translations for the specified locale
 * 
 * @example
 * const t = getEmailTranslations('en');
 * console.log(t.welcome.title); // "Welcome to Sylvan Token! 🌿"
 */
export function getEmailTranslations(locale: string): EmailTranslations {
  const normalizedLocale = locale.toLowerCase() as EmailLocale;
  
  // Return requested locale or fallback to English
  if (normalizedLocale in emailTranslations) {
    return emailTranslations[normalizedLocale];
  }
  
  console.warn(`[Email Translations] Locale "${locale}" not found, falling back to English`);
  return emailTranslations.en;
}

/**
 * Replace placeholders in a translation string with actual values
 * 
 * @param template - The translation string with placeholders (e.g., "Hi {{username}}")
 * @param values - Object with placeholder values
 * @returns String with placeholders replaced
 * 
 * @example
 * replacePlaceholders("Hi {{username}}", { username: "John" }); // "Hi John"
 * replacePlaceholders("You earned {{points}} points", { points: 50 }); // "You earned 50 points"
 */
export function replacePlaceholders(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

/**
 * Get all supported email locales
 * 
 * @returns Array of supported locale codes
 */
export function getSupportedEmailLocales(): EmailLocale[] {
  return ['en', 'tr', 'de', 'zh', 'ru'];
}

/**
 * Check if a locale is supported for emails
 * 
 * @param locale - The locale code to check
 * @returns True if the locale is supported
 */
export function isEmailLocaleSupported(locale: string): boolean {
  return getSupportedEmailLocales().includes(locale.toLowerCase() as EmailLocale);
}
