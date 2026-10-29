import { SupportedLanguage } from '../types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    habits: string;
    calendar: string;
    analytics: string;
    aiCoach: string;
    settings: string;
    testSuite: string;
  };
  dashboard: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    encouragingMessage: string;
    activeHabits: string;
    completedToday: string;
    completionRate: string;
    currentStreak: string;
    bestHabitStreak: string;
    weeklyProgress: string;
    todayProgress: string;
    remaining: string;
    completed: string;
    scheduled: string;
    filterAll: string;
    filterCompleted: string;
    filterIncomplete: string;
    allCategories: string;
    addHabit: string;
    noHabitsToday: string;
    noHabitsTodaySub: string;
    weeklyConsistencyOverview: string;
    recentActivity: string;
    noRecentActivity: string;
    noRecentActivitySub: string;
  };
  habits: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    newHabit: string;
    active: string;
    archived: string;
    noHabitsFound: string;
    createFirstHabit: string;
    currentStreak: string;
    longestStreak: string;
    frequency: string;
    target: string;
    edit: string;
    archive: string;
    unarchive: string;
    delete: string;
    deleteConfirmTitle: string;
    deleteConfirmText: string;
    cancel: string;
    confirm: string;
  };
  calendar: {
    title: string;
    subtitle: string;
    today: string;
    prevMonth: string;
    nextMonth: string;
    scheduledOnDate: string;
    noHabitsOnDate: string;
    markCompleted: string;
    markIncomplete: string;
    completionNotes: string;
  };
  analytics: {
    title: string;
    subtitle: string;
    last7Days: string;
    last30Days: string;
    last90Days: string;
    totalCompletions: string;
    avgCompletionRate: string;
    longestStreak: string;
    mostConsistent: string;
    needsAttention: string;
    categoryPerformance: string;
    completionTrend: string;
    dayOfWeekConsistency: string;
    noDataTitle: string;
    noDataSub: string;
  };
  aiCoach: {
    title: string;
    subtitle: string;
    badge: string;
    placeholder: string;
    send: string;
    suggestedHeading: string;
    prompt1: string;
    prompt2: string;
    prompt3: string;
    prompt4: string;
    prompt5: string;
    thinking: string;
    errorTitle: string;
    adoptHabit: string;
  };
  settings: {
    title: string;
    subtitle: string;
    profile: string;
    displayName: string;
    preferences: string;
    theme: string;
    weekStart: string;
    language: string;
    notifications: string;
    enableBrowserAlerts: string;
    testNotification: string;
    dataManagement: string;
    exportJson: string;
    importJson: string;
    loadDemo: string;
    resetAll: string;
    resetWarning: string;
    saveChanges: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'Habit Builder AI',
    tagline: 'Small steps. Consistent progress.',
    nav: {
      dashboard: 'Dashboard',
      habits: 'My Habits',
      calendar: 'Calendar',
      analytics: 'Analytics',
      aiCoach: 'AI Habit Coach',
      settings: 'Settings',
      testSuite: 'System Tests',
    },
    dashboard: {
      welcomeTitle: 'Your progress, at a glance.',
      welcomeSubtitle: 'Small steps. Consistent progress.',
      encouragingMessage: 'Consistency matters more than perfection. Every check is a vote for your future self.',
      activeHabits: 'Active Habits',
      completedToday: 'Completed Today',
      completionRate: 'Completion Rate',
      currentStreak: 'Consistency Streak',
      bestHabitStreak: 'Best Habit Streak',
      weeklyProgress: 'Weekly Progress',
      todayProgress: "Today's Progress",
      remaining: 'remaining',
      completed: 'completed',
      scheduled: 'scheduled',
      filterAll: 'All Habits',
      filterCompleted: 'Completed',
      filterIncomplete: 'To Do',
      allCategories: 'All Categories',
      addHabit: 'Add Habit',
      noHabitsToday: 'No habits scheduled for today',
      noHabitsTodaySub: 'Enjoy your rest day or create a new routine to start tracking.',
      weeklyConsistencyOverview: '7-Day Consistency Trend',
      recentActivity: 'Recent Verified Activity',
      noRecentActivity: 'No completions recorded yet',
      noRecentActivitySub: 'Check off a habit above to start your activity timeline.',
    },
    habits: {
      title: 'Habit Management',
      subtitle: 'Build sustainable routines with clear targets and flexible scheduling.',
      searchPlaceholder: 'Search habits by name, category, or notes...',
      newHabit: 'New Habit',
      active: 'Active',
      archived: 'Archived',
      noHabitsFound: 'No habits found',
      createFirstHabit: 'Create your first habit to begin building consistency.',
      currentStreak: 'Current Streak',
      longestStreak: 'Longest Streak',
      frequency: 'Frequency',
      target: 'Target',
      edit: 'Edit',
      archive: 'Archive',
      unarchive: 'Restore',
      delete: 'Delete',
      deleteConfirmTitle: 'Delete Habit Permanently?',
      deleteConfirmText: 'This will delete the habit and its associated completion history. This action cannot be undone.',
      cancel: 'Cancel',
      confirm: 'Delete',
    },
    calendar: {
      title: 'Habit Calendar',
      subtitle: 'Review historical daily completions and log past achievements.',
      today: 'Today',
      prevMonth: 'Previous Month',
      nextMonth: 'Next Month',
      scheduledOnDate: 'Habits on this date',
      noHabitsOnDate: 'No habits were scheduled for this date.',
      markCompleted: 'Mark as Completed',
      markIncomplete: 'Mark as Incomplete',
      completionNotes: 'Add a note or quantity',
    },
    analytics: {
      title: 'Analytics & Insights',
      subtitle: 'Accurate statistics calculated strictly from your recorded habit completions.',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      last90Days: 'Last 90 Days',
      totalCompletions: 'Total Completions',
      avgCompletionRate: 'Average Completion Rate',
      longestStreak: 'Longest Habit Streak',
      mostConsistent: 'Most Consistent Habits',
      needsAttention: 'Habits Needing Attention',
      categoryPerformance: 'Category Distribution & Performance',
      completionTrend: 'Daily Completion Trend',
      dayOfWeekConsistency: 'Consistency by Day of the Week',
      noDataTitle: 'No analytics available for this period',
      noDataSub: 'Log habits to view data-driven charts and consistency breakdowns.',
    },
    aiCoach: {
      title: 'AI Habit Coach',
      subtitle: 'Evidence-based behavioural coaching powered by Gemini AI.',
      badge: 'Gemini 3.8 Flash',
      placeholder: 'Ask your coach anything about habits, friction, or routines...',
      send: 'Send',
      suggestedHeading: 'Suggested Coaching Prompts',
      prompt1: 'Review my weekly progress.',
      prompt2: 'Help me build a morning routine.',
      prompt3: 'Which habits need attention?',
      prompt4: 'Create a realistic weekly plan.',
      prompt5: 'Help me stay consistent with reading.',
      thinking: 'Analyzing your habit data & preparing guidance...',
      errorTitle: 'AI Coaching Notice',
      adoptHabit: 'Add to My Habits',
    },
    settings: {
      title: 'Settings & Preferences',
      subtitle: 'Customize display preferences, manage data backups, and notifications.',
      profile: 'User Profile',
      displayName: 'Display Name',
      preferences: 'Preferences',
      theme: 'Theme',
      weekStart: 'Week Starts On',
      language: 'Language',
      notifications: 'Reminders & Notifications',
      enableBrowserAlerts: 'Enable browser notifications for scheduled habits',
      testNotification: 'Test Browser Notification',
      dataManagement: 'Data Management & Privacy',
      exportJson: 'Export Data (JSON)',
      importJson: 'Import Data (JSON)',
      loadDemo: 'Load Demo Dataset',
      resetAll: 'Reset All Data',
      resetWarning: 'Permanently erases all habits and history stored in this browser.',
      saveChanges: 'Save Changes',
    },
  },
  roman_ur: {
    appName: 'Habit Builder AI',
    tagline: 'Chhotay qadam. Musalsal taraqqi.',
    nav: {
      dashboard: 'Dashboard',
      habits: 'Meri Aadatein',
      calendar: 'Calendar',
      analytics: 'Analytics',
      aiCoach: 'AI Habit Coach',
      settings: 'Settings',
      testSuite: 'System Tests',
    },
    dashboard: {
      welcomeTitle: 'Aapki taraqqi aik nazar mein.',
      welcomeSubtitle: 'Chhotay qadam. Musalsal taraqqi.',
      encouragingMessage: 'Kamyabi ka raaz perfection mein nahi, balkay lagatar koshish mein hai.',
      activeHabits: 'Active Aadatein',
      completedToday: 'Aaj Mukammal',
      completionRate: 'Completion Rate',
      currentStreak: 'Consistency Streak',
      bestHabitStreak: 'Behtareen Streak',
      weeklyProgress: 'Haftawar Taraqqi',
      todayProgress: 'Aaj Ki Taraqqi',
      remaining: 'baaqi',
      completed: 'mukammal',
      scheduled: 'muqarrar',
      filterAll: 'Tamam Aadatein',
      filterCompleted: 'Mukammal',
      filterIncomplete: 'Baaqi Kaam',
      allCategories: 'Tamam Categories',
      addHabit: 'Nayi Aadat Shamil Karein',
      noHabitsToday: 'Aaj ke liye koi aadat muqarrar nahi',
      noHabitsTodaySub: 'Aaj aaraam ka din hai ya nayi routine shuru karein.',
      weeklyConsistencyOverview: '7 Dino Ka Trend',
      recentActivity: 'Taaza Tareen Activity',
      noRecentActivity: 'Abhi tak koi record nahi mila',
      noRecentActivitySub: 'Upar kisi aadat par check lagayein taake timeline shuru ho.',
    },
    habits: {
      title: 'Aadaton Ka Intizam',
      subtitle: 'Wazeh ahdaaf aur asaan schedule ke saath behtar routines banayein.',
      searchPlaceholder: 'Naam ya category se talash karein...',
      newHabit: 'Nayi Aadat',
      active: 'Active',
      archived: 'Archived',
      noHabitsFound: 'Koi aadat nahi mili',
      createFirstHabit: 'Pehli aadat shamil karke safar ka aaghaz karein.',
      currentStreak: 'Maujooda Streak',
      longestStreak: 'Lambi Tareen Streak',
      frequency: 'Tawaatur',
      target: 'Hadaf',
      edit: 'Tameer / Edit',
      archive: 'Archive Karein',
      unarchive: 'Bahaal Karein',
      delete: 'Khatam Karein',
      deleteConfirmTitle: 'Kya aap aadat khatam karna chahte hain?',
      deleteConfirmText: 'Is aadat ka tamam pichhla record bhi khatam ho jayega.',
      cancel: 'Wapas',
      confirm: 'Khatam Karein',
    },
    calendar: {
      title: 'Aadat Calendar',
      subtitle: 'Pichhli tareekhon ki tafseelat dekhein aur record darj karein.',
      today: 'Aaj',
      prevMonth: 'Pichhla Mahina',
      nextMonth: 'Agla Mahina',
      scheduledOnDate: 'Is tareekh ki aadatein',
      noHabitsOnDate: 'Is tareekh par koi aadat muqarrar nahi thi.',
      markCompleted: 'Mukammal Nishan Lagayein',
      markIncomplete: 'Nishan Hatayein',
      completionNotes: 'Note ya quantity shamil karein',
    },
    analytics: {
      title: 'Tajziya & Analytics',
      subtitle: 'Aapke haqeeqi recorded data se tayyar shuda accurate hisab kitab.',
      last7Days: 'Pichhle 7 Din',
      last30Days: 'Pichhle 30 Din',
      last90Days: 'Pichhle 90 Din',
      totalCompletions: 'Kul Mukammal Kaam',
      avgCompletionRate: 'Ausat Completion Rate',
      longestStreak: 'Sab Se Badi Streak',
      mostConsistent: 'Sab Se Mustaqil Aadatein',
      needsAttention: 'Tawajjah Talab Aadatein',
      categoryPerformance: 'Categories Ki Karkardagi',
      completionTrend: 'Roozana Ka Trend',
      dayOfWeekConsistency: 'Hafte Ke Dino Ka Hisab',
      noDataTitle: 'Is muddat ka koi data maujood nahi',
      noDataSub: 'Graphs dekhne ke liye aadatein mukammal karke mark karein.',
    },
    aiCoach: {
      title: 'AI Habit Coach',
      subtitle: 'Gemini AI ki madad se aadat saazi aur rehnumai.',
      badge: 'Gemini 3.8 Flash',
      placeholder: 'Apne coach se routines ya mushkilaat ke bare mein poochein...',
      send: 'Bhejein',
      suggestedHeading: 'Tajweez Kardah Sawalaat',
      prompt1: 'Review my weekly progress.',
      prompt2: 'Help me build a morning routine.',
      prompt3: 'Which habits need attention?',
      prompt4: 'Create a realistic weekly plan.',
      prompt5: 'Help me stay consistent with reading.',
      thinking: 'Aapke data ka tajziya ho raha hai...',
      errorTitle: 'AI Coach Ittila',
      adoptHabit: 'Meri Aadaton Mein Shamil Karein',
    },
    settings: {
      title: 'Settings & Preferences',
      subtitle: 'Language, theme, notifications aur data backup ka intizam.',
      profile: 'User Profile',
      displayName: 'Aapka Naam',
      preferences: 'Tarjeehaat',
      theme: 'Theme',
      weekStart: 'Hafte Ka Aaghaz',
      language: 'Zaban / Language',
      notifications: 'Reminders & Notifications',
      enableBrowserAlerts: 'Browser alerts on karein',
      testNotification: 'Test Alert Bhejein',
      dataManagement: 'Data Backup & Privacy',
      exportJson: 'Data Export Karein (JSON)',
      importJson: 'Data Import Karein (JSON)',
      loadDemo: 'Demo Data Load Karein',
      resetAll: 'Tamam Data Saaf Karein',
      resetWarning: 'Tamam aadatein aur tareekh hamesha ke liye delete ho jayengi.',
      saveChanges: 'Tabdeeli Mehfooz Karein',
    },
  },
  ur: {
    appName: 'ہیبٹ بلڈر اے آئی',
    tagline: 'چھوٹے قدم۔ مسلسل پیشرفت۔',
    nav: {
      dashboard: 'ڈیش بورڈ',
      habits: 'میری عادات',
      calendar: 'کیلنڈر',
      analytics: 'تجزیات',
      aiCoach: 'اے آئی ہیبٹ کوچ',
      settings: 'ترتیبات',
      testSuite: 'سسٹم ٹیسٹس',
    },
    dashboard: {
      welcomeTitle: 'آپ کی پیشرفت ایک نظر میں۔',
      welcomeSubtitle: 'چھوٹے قدم۔ مسلسل پیشرفت۔',
      encouragingMessage: 'کامیابی کمال میں نہیں بلکہ استقامت میں ہے۔ ہر چیک آپ کے مستقبل کا سرمایہ ہے۔',
      activeHabits: 'فعال عادات',
      completedToday: 'آج مکمل',
      completionRate: 'تکمیل کی شرح',
      currentStreak: 'تسلسل کا تسلسل',
      bestHabitStreak: 'بہترین سٹریک',
      weeklyProgress: 'ہفتہ وار پیشرفت',
      todayProgress: 'آج کی پیشرفت',
      remaining: 'باقی',
      completed: 'مکمل',
      scheduled: 'مقرر',
      filterAll: 'تمام عادات',
      filterCompleted: 'مکمل شدہ',
      filterIncomplete: 'باقی ماندہ',
      allCategories: 'تمام اقسام',
      addHabit: 'نئی عادت شامل کریں',
      noHabitsToday: 'آج کوئی عادت مقرر نہیں ہے',
      noHabitsTodaySub: 'آج آرام کریں یا نئی روٹین کا آغاز کریں۔',
      weeklyConsistencyOverview: '7 دنوں کا تسلسل کا رجحان',
      recentActivity: 'حالیہ تصدیق شدہ سرگرمی',
      noRecentActivity: 'ابھی تک کوئی ریکارڈ درج نہیں ہوا',
      noRecentActivitySub: 'اپنی ٹائم لائن شروع کرنے کے لیے اوپر عادت پر نشان لگائیں۔',
    },
    habits: {
      title: 'عادات کا نظم و نسق',
      subtitle: 'واضح اہداف اور آسان شیڈول کے ساتھ پائیدار عادات اپنائیں۔',
      searchPlaceholder: 'نام یا قسم سے تلاش کریں...',
      newHabit: 'نئی عادت',
      active: 'فعال',
      archived: 'محفوظ شدہ',
      noHabitsFound: 'کوئی عادت نہیں ملی',
      createFirstHabit: 'تسلسل قائم کرنے کے لیے اپنی پہلی عادت شامل کریں۔',
      currentStreak: 'موجودہ سٹریک',
      longestStreak: 'طویل ترین سٹریک',
      frequency: 'تواتر',
      target: 'ہدف',
      edit: 'ترمیم کریں',
      archive: 'آرکائیو کریں',
      unarchive: 'بحال کریں',
      delete: 'حذف کریں',
      deleteConfirmTitle: 'کیا آپ اس عادت کو مستقل حذف کرنا چاہتے ہیں؟',
      deleteConfirmText: 'اس عادت کی تمام سابقہ تاریخ بھی حذف ہو جائے گی اور واپس نہیں لائی جا سکے گی۔',
      cancel: 'منسوخ',
      confirm: 'حذف کریں',
    },
    calendar: {
      title: 'عادات کا کیلنڈر',
      subtitle: 'ماضی کی تکمیل دیکھیں اور پچھلی تاریخوں کا ریکارڈ درج کریں۔',
      today: 'آج',
      prevMonth: 'پچھلا مہینہ',
      nextMonth: 'اگلا مہینہ',
      scheduledOnDate: 'اس تاریخ کی عادات',
      noHabitsOnDate: 'اس تاریخ پر کوئی عادت مقرر نہیں تھی۔',
      markCompleted: 'مکمل نشان لگائیں',
      markIncomplete: 'نامکمل نشان لگائیں',
      completionNotes: 'کوئی نوٹ یا مقدار درج کریں',
    },
    analytics: {
      title: 'تجزیات اور بصیرت',
      subtitle: 'آپ کے حقیقی ریکارڈ شدہ ڈیٹا سے تیار کردہ مکمل اعداد و شمار۔',
      last7Days: 'پچھلے 7 دن',
      last30Days: 'پچھلے 30 دن',
      last90Days: 'پچھلے 90 دن',
      totalCompletions: 'کل تکمیل شدہ عادات',
      avgCompletionRate: 'اوسط تکمیل کی شرح',
      longestStreak: 'طویل ترین سٹریک',
      mostConsistent: 'سب سے باقاعدہ عادات',
      needsAttention: 'توجہ طلب عادات',
      categoryPerformance: 'اقسام کی کارکردگی',
      completionTrend: 'روزانہ تکمیل کا رجحان',
      dayOfWeekConsistency: 'ہفتے کے دنوں کا تسلسل',
      noDataTitle: 'اس مدت کے لیے کوئی ڈیٹا دستیاب نہیں ہے',
      noDataSub: 'چارٹس دیکھنے کے لیے عادات مکمل کریں اور نشان لگائیں۔',
    },
    aiCoach: {
      title: 'اے آئی ہیبٹ کوچ',
      subtitle: 'Gemini AI سے چلنے والی عملی اور حوصلہ افزا رہنمائی۔',
      badge: 'Gemini 3.8 Flash',
      placeholder: 'اپنے کوچ سے عادات، روٹین یا رکاوٹوں کے متعلق رہنمائی لیں...',
      send: 'ارسال',
      suggestedHeading: 'تجویز کردہ سوالات',
      prompt1: 'Review my weekly progress.',
      prompt2: 'Help me build a morning routine.',
      prompt3: 'Which habits need attention?',
      prompt4: 'Create a realistic weekly plan.',
      prompt5: 'Help me stay consistent with reading.',
      thinking: 'آپ کی عادات کا ڈیٹا پڑھا جا رہا ہے...',
      errorTitle: 'اے آئی کوچ نوٹس',
      adoptHabit: 'میری عادات میں شامل کریں',
    },
    settings: {
      title: 'ترتیبات اور ترجیحات',
      subtitle: 'ڈسپلے، نوٹیفیکیشنز اور ڈیٹا بیک اپ کی ترتیبات۔',
      profile: 'صارف پروفائل',
      displayName: 'ظاہری نام',
      preferences: 'ترجیحات',
      theme: 'تھیم',
      weekStart: 'ہفتے کا آغاز',
      language: 'زبان / Language',
      notifications: 'یاد دہانی اور نوٹیفیکیشنز',
      enableBrowserAlerts: 'براؤزر نوٹیفیکیشنز آن کریں',
      testNotification: 'ٹیسٹ نوٹیفیکیشن بھیجیں',
      dataManagement: 'ڈیٹا بیک اپ اور پرائیویسی',
      exportJson: 'ڈیٹا ایکسپورٹ کریں (JSON)',
      importJson: 'ڈیٹا امپورٹ کریں (JSON)',
      loadDemo: 'ڈیمو ڈیٹا لوڈ کریں',
      resetAll: 'تمام ڈیٹا حذف کریں',
      resetWarning: 'اس براؤزر میں محفوظ تمام عادات اور تاریخ مستقل ختم ہو جائے گی۔',
      saveChanges: 'تبدیلیاں محفوظ کریں',
    },
  },
};
