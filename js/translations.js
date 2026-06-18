/**
 * Shared English -> Arabic dictionary.
 *
 * Single source of truth used by BOTH the public site (js/i18n.js) and the admin
 * editor (js/admin.js, which pre-fills empty Arabic boxes from here). Technical
 * terms are intentionally omitted so they stay in English/Latin.
 *
 * Edit Arabic wording here once and it updates the site + the admin defaults.
 */
window.PORTFOLIO_AR = {
  // ---- navbar ----
  'Home': 'الرئيسية',
  'About': 'نبذة',
  'Skills': 'المهارات',
  'Projects': 'المشاريع',
  'Certificates': 'الشهادات',
  'CV': 'السيرة',
  'Contact': 'تواصل',

  // ---- hero ----
  "Hi, I'm Feras Alkhodari": 'مرحبًا، أنا فراس الخضاري',
  "I'm a": 'أنا',
  'View My Work': 'شاهد أعمالي',
  'Get In Touch': 'تواصل معي',
  'Scroll Down': 'مرّر للأسفل',

  // ---- typewriter roles ----
  'Software Engineer.': 'مهندس برمجيات.',
  'Backend Developer.': 'مطوّر Backend.',
  'Cybersecurity Trainer.': 'مدرّب أمن سيبراني.',
  'DevOps & AppSec Enthusiast.': 'مهتمّ بـ DevOps وأمن التطبيقات.',

  // ---- section headings ----
  'About Me': 'نبذة عني',
  'Technical Skills': 'المهارات التقنية',
  'Featured Projects': 'مشاريع مختارة',
  'Certificates & Achievements': 'الشهادات والإنجازات',
  'Resume / CV': 'السيرة الذاتية',
  'Experience & Education': 'الخبرات والتعليم',
  'Skills & Technologies': 'المهارات والتقنيات',

  // ---- skill group titles (partially technical) ----
  'DevOps & Security': 'DevOps والأمن',
  'Backend & Security': 'Backend والأمن',
  'Frontend & Databases': 'Frontend وقواعد البيانات',

  // ---- buttons / labels ----
  'View Project': 'عرض المشروع',
  'View Certificate': 'عرض الشهادة',
  'View CV': 'عرض السيرة',
  'Download': 'تحميل',
  'Open in New Tab': 'فتح في تبويب جديد',
  'Send Message': 'إرسال الرسالة',
  'Certificate Preview': 'معاينة الشهادة',

  // ---- contact form placeholders ----
  'Your Name': 'اسمك',
  'Your Email': 'بريدك الإلكتروني',
  'Subject': 'الموضوع',
  'Your Message': 'رسالتك',

  // ---- about ----
  "As a recent Software Engineering graduate from the University of Jeddah, I build secure, high-performance backend systems and apply efficient DevOps practices. I have a solid foundation in full-stack development (Python, Node.js, React) and Linux system administration, backed by Red Hat certifications. My experience includes an impactful internship at King Fahad Armed Forces Hospital — optimizing healthcare ERP features and building secure internal portals — and a part-time role as a Cybersecurity Trainer at JICC. Driven by a 'secure-by-design' mindset, I'm available for full-time backend and application-security roles.":
    'بصفتي خريج هندسة برمجيات حديثًا من جامعة جدة، أبني أنظمة Backend آمنة وعالية الأداء وأطبّق ممارسات DevOps فعّالة. أمتلك أساسًا متينًا في تطوير الويب المتكامل (Python وNode.js وReact) وإدارة أنظمة Linux، مدعومًا بشهادات Red Hat. تشمل خبرتي تدريبًا تعاونيًا مؤثرًا في مستشفى الملك فهد للقوات المسلحة — حيث حسّنت ميزات أنظمة ERP الصحية وبنيت بوابات داخلية آمنة — إلى جانب عملي بدوام جزئي كمدرّب أمن سيبراني في JICC. وانطلاقًا من مبدأ «الأمان منذ التصميم»، أنا متاح للعمل بدوام كامل في وظائف تطوير Backend وأمن التطبيقات.',

  // ---- CV section ----
  'Feras Alkhodari — Software Engineer': 'فراس الخضاري — مهندس برمجيات',
  'Backend (Python & Node.js) · Application Security · DevOps. Preview or download my full CV (PDF).':
    'Backend (Python وNode.js) · أمن التطبيقات · DevOps. استعرض سيرتي الذاتية الكاملة أو حمّلها بصيغة PDF.',

  // ---- projects ----
  'An AI/ML application that assists healthcare providers by automating the analysis of audio consultations — recording, transcription, and disease prediction — built on a Python machine-learning pipeline (NumPy, Pandas, Scikit-learn).':
    'تطبيق ذكاء اصطناعي وتعلّم آلي يساعد مقدّمي الرعاية الصحية عبر أتمتة تحليل الاستشارات الصوتية — التسجيل والتفريغ النصّي والتنبؤ بالأمراض — مبني على مسار تعلّم آلي بلغة Python (NumPy وPandas وScikit-learn).',
  'A lightweight, modular Enterprise Resource Planning system built with ASP.NET Core and Entity Framework Core, designed for medium-sized organizations with clean architecture and modern practices.':
    'نظام تخطيط موارد مؤسسي (ERP) خفيف ومعياري مبني باستخدام ASP.NET Core وEntity Framework Core، مصمَّم للمؤسسات المتوسطة بمعمارية نظيفة وممارسات حديثة.',

  // ---- certificates ----
  'Red Hat Certified — Application Development I (AD183): Programming in Java EE':
    'شهادة Red Hat — تطوير التطبيقات I (AD183): البرمجة بلغة Java EE',
  'Building enterprise Java EE applications and services — server-side components, persistence, and deployment on Red Hat middleware.':
    'بناء تطبيقات وخدمات Java EE المؤسسية — مكوّنات جهة الخادم، والاستمرارية (Persistence)، والنشر على وسائط Red Hat.',
  'Red Hat Certified — System Administration I (RH124)':
    'شهادة Red Hat — إدارة الأنظمة I (RH124)',
  'Essential Linux system administration skills and command-line proficiency on Red Hat Enterprise Linux.':
    'مهارات أساسية في إدارة أنظمة Linux وإتقان سطر الأوامر على Red Hat Enterprise Linux.',
  'The Complete Full-Stack Web Development BootCamp (61.5 hours)':
    'معسكر تطوير الويب المتكامل الشامل (61.5 ساعة)',
  'Comprehensive full-stack development course covering modern frontend and backend technologies with hands-on projects.':
    'دورة شاملة في التطوير المتكامل تغطّي أحدث تقنيات الواجهة الأمامية والخلفية مع مشاريع تطبيقية عملية.',
  'The Complete Flutter Development BootCamp With Dart (29 hours)':
    'معسكر تطوير تطبيقات Flutter الشامل مع Dart (29 ساعة)',
  'Comprehensive mobile app development course covering the Flutter framework and Dart for cross-platform applications.':
    'دورة شاملة في تطوير تطبيقات الجوال تغطّي إطار عمل Flutter ولغة Dart لتطبيقات متعددة المنصات.',

  // ---- experience ----
  'Cybersecurity Trainer — JICC (Jeddah International Institute)':
    'مدرّب أمن سيبراني — JICC (معهد جدة الدولي العالي للتدريب)',
  'Software Engineer Intern — King Fahad Armed Forces Hospital (KFAFH)':
    'متدرّب مهندس برمجيات — مستشفى الملك فهد للقوات المسلحة (KFAFH)',
  'B.S. in Software Engineering — University of Jeddah':
    'بكالوريوس هندسة برمجيات — جامعة جدة',
  'Nov 2025 – Present': 'نوفمبر 2025 – حتى الآن',
  'Jan 2025 – Mar 2025': 'يناير 2025 – مارس 2025',
  'Instruct and mentor 50+ tech professionals and students across diploma levels, delivering 120+ hours of training on vulnerability identification, digital risk management, and compliance frameworks.':
    'أُدرّب وأُرشد أكثر من 50 متخصصًا وطالبًا في التقنية عبر مستويات دبلوم مختلفة، مع تقديم أكثر من 120 ساعة تدريبية في تحديد الثغرات وإدارة المخاطر الرقمية وأطر الامتثال.',
  "Designed and ran 15+ simulated cyberattack scenarios and hands-on lab assessments, improving learners' practical threat-detection skills by ~30%.":
    'صمّمت ونفّذت أكثر من 15 سيناريو هجوم سيبراني محاكى وتقييمات معملية عملية، مما رفع مهارات اكتشاف التهديدات لدى المتدربين بنحو 30%.',
  'Developed training modules bridging secure coding and system defense, maintaining a 90%+ pass rate in workforce-readiness evaluations.':
    'طوّرت وحدات تدريبية تربط بين البرمجة الآمنة والدفاع عن الأنظمة، مع الحفاظ على نسبة نجاح تتجاوز 90% في تقييمات الجاهزية المهنية.',
  'Optimized enterprise ERP features and resolved 25+ technical bugs, improving healthcare workflows and operational efficiency by ~15%.':
    'حسّنت ميزات نظام ERP المؤسسي وعالجت أكثر من 25 خللًا تقنيًا، مما طوّر سير العمل في الرعاية الصحية ورفع الكفاءة التشغيلية بنحو 15%.',
  'Built a secure Internship COOP portal with modern backend architecture, responsive UX, and strict data validation for 100+ active applicants.':
    'بنيت بوابة تدريب تعاوني (COOP) آمنة بمعمارية Backend حديثة وتجربة استخدام متجاوبة وتحقّق صارم من البيانات لأكثر من 100 متقدّم نشط.',
  'Revamped administrative communications UI and backend, accelerating secure data transmission and cutting latency by ~35%.':
    'أعدت تصميم واجهة وخلفية نظام الاتصالات الإدارية، مما سرّع نقل البيانات الآمن وقلّل زمن الاستجابة بنحو 35%.',
  'Delivered onboarding and technical training for 40+ hospital staff, achieving a 100% system adoption rate.':
    'قدّمت تدريبًا تعريفيًا وتقنيًا لأكثر من 40 موظفًا في المستشفى، محققًا نسبة تبنٍّ للنظام بلغت 100%.',
  'Graduated May 2025 with a focus on software architecture, backend engineering, and secure development.':
    'تخرّجت في مايو 2025 مع تركيز على معمارية البرمجيات وهندسة Backend والتطوير الآمن.',
  'Built an AI/NLP graduation project for audio-based disease prediction (Python, Scikit-learn).':
    'أنجزت مشروع تخرّج في الذكاء الاصطناعي ومعالجة اللغة الطبيعية (NLP) للتنبؤ بالأمراض اعتمادًا على الصوت (Python وScikit-learn).',
  'Earned Red Hat (RH124, AD183) and Full-Stack Web Development certifications.':
    'حصلت على شهادات Red Hat (RH124 وAD183) وتطوير الويب المتكامل.',

  // ---- contact ----
  "Let's Connect": 'لنتواصل',
  "I'm open to full-time backend and application-security roles. Feel free to reach out for collaborations, opportunities, or just to say hello!":
    'أنا منفتح على فرص العمل بدوام كامل في تطوير Backend وأمن التطبيقات. لا تتردّد في التواصل معي للتعاون أو الفرص أو حتى لإلقاء التحية!',
  'Jeddah, Saudi Arabia · Open to On-site or Remote roles':
    'جدة، المملكة العربية السعودية · متاح للعمل في الموقع أو عن بُعد',

  // ---- footer ----
  '© 2026 Feras Alkhodari. All rights reserved.':
    '© 2026 فراس الخضاري. جميع الحقوق محفوظة.',
};
