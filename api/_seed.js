// Default ("seed") content for the portfolio.
// This mirrors the static index.html content. It is returned by /api/content until
// you save something from the admin page, and is loaded as the starting point in
// the admin editor. Edit everything from /admin instead of editing this by hand.

module.exports = {
  // Schema version, so future changes can migrate old saved content safely.
  version: 1,

  brand: 'Feras Alkhodari',
  pageTitle: 'Feras Alkhodari',

  hero: {
    title: "Hi, I'm Feras Alkhodari",
    roles: [
      'Software Engineer.',
      'Backend Developer.',
      'Cybersecurity Trainer.',
      'DevOps & AppSec Enthusiast.',
    ],
  },

  about: {
    text:
      "As a recent Software Engineering graduate from the University of Jeddah, I build secure, high-performance backend systems and apply efficient DevOps practices. I have a solid foundation in full-stack development (Python, Node.js, React) and Linux system administration, backed by Red Hat certifications. My experience includes an impactful internship at King Fahad Armed Forces Hospital — optimizing healthcare ERP features and building secure internal portals — and a part-time role as a Cybersecurity Trainer at JICC. Driven by a 'secure-by-design' mindset, I'm available for full-time backend and application-security roles.",
  },

  // Resume / CV section
  cv: {
    heading: 'Resume / CV',
    title: 'Feras Alkhodari — Software Engineer',
    description:
      'Backend (Python & Node.js) · Application Security · DevOps. Preview or download my full CV (PDF).',
    url: 'files/Feras_Alkhodari_CV.pdf',
  },

  // Icon skill grid (the "Technical Skills" section)
  skills: [
    {
      title: 'Frontend',
      items: [
        { icon: 'fab fa-html5', name: 'HTML5' },
        { icon: 'fab fa-css3-alt', name: 'CSS3' },
        { icon: 'fab fa-js', name: 'JavaScript' },
        { icon: 'fab fa-react', name: 'React' },
      ],
    },
    {
      title: 'Backend',
      items: [
        { icon: 'fab fa-python', name: 'Python' },
        { icon: 'fab fa-node-js', name: 'Node.js' },
        { icon: 'fas fa-server', name: 'Express' },
        { icon: 'fab fa-microsoft', name: '.NET / EF Core' },
        { icon: 'fas fa-database', name: 'MS SQL Server' },
        { icon: 'fas fa-leaf', name: 'MongoDB' },
      ],
    },
    {
      title: 'DevOps & Security',
      items: [
        { icon: 'fab fa-redhat', name: 'RedHat Linux' },
        { icon: 'fab fa-git-alt', name: 'Git' },
        { icon: 'fab fa-github', name: 'GitHub' },
        { icon: 'fas fa-shield-halved', name: 'Cybersecurity' },
        { icon: 'fas fa-infinity', name: 'DevOps' },
        { icon: 'fas fa-sitemap', name: 'Clean Architecture' },
      ],
    },
  ],

  // Featured projects. `image` = banner thumbnail (optional).
  // `widgets` = small clickable thumbnails shown before the tech tags.
  // `links` = the action buttons at the bottom of the card.
  projects: [
    {
      title: 'SymptomsEaseAI',
      description:
        'An AI/ML application that assists healthcare providers by automating the analysis of audio consultations — recording, transcription, and disease prediction — built on a Python machine-learning pipeline (NumPy, Pandas, Scikit-learn).',
      image: '',
      widgets: [],
      tech: ['Python', 'Machine Learning', 'NLP', 'Scikit-learn'],
      links: [
        {
          label: 'View Project',
          url: 'https://github.com/FerasAlkhodari/SymptomsEaseAi.git',
          icon: '',
        },
      ],
    },
    {
      title: 'ERP Lite',
      description:
        'A lightweight, modular Enterprise Resource Planning system built with ASP.NET Core and Entity Framework Core, designed for medium-sized organizations with clean architecture and modern practices.',
      image: '',
      widgets: [],
      tech: ['.NET Core', 'SQL Server', 'Entity Framework', 'JWT'],
      links: [
        {
          label: 'View Project',
          url: 'https://github.com/FerasAlkhodari/ERPLite.git',
          icon: '',
        },
      ],
    },
  ],

  certificates: [
    {
      icon: 'fab fa-redhat',
      title: 'Red Hat Certified — Application Development I (AD183): Programming in Java EE',
      issuer: 'Red Hat, Inc.',
      date: '2023',
      description:
        'Building enterprise Java EE applications and services — server-side components, persistence, and deployment on Red Hat middleware.',
      skills: ['Java EE', 'Enterprise Apps', 'Backend Development', 'Red Hat'],
      image: 'images/certificates/AD183-7.0.jpg',
    },
    {
      icon: 'fab fa-redhat',
      title: 'Red Hat Certified — System Administration I (RH124)',
      issuer: 'Red Hat, Inc.',
      date: '2023',
      description:
        'Essential Linux system administration skills and command-line proficiency on Red Hat Enterprise Linux.',
      skills: ['Linux Fundamentals', 'Command Line', 'System Administration', 'RHEL'],
      image: 'images/certificates/RH124-9.0.jpg',
    },
    {
      icon: 'fas fa-code',
      title: 'The Complete Full-Stack Web Development BootCamp (61.5 hours)',
      issuer: 'Udemy Academy',
      date: '2024',
      description:
        'Comprehensive full-stack development course covering modern frontend and backend technologies with hands-on projects.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'REST APIs'],
      image: 'images/certificates/WebCource.jpg',
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'The Complete Flutter Development BootCamp With Dart (29 hours)',
      issuer: 'Udemy Academy',
      date: '2024',
      description:
        'Comprehensive mobile app development course covering the Flutter framework and Dart for cross-platform applications.',
      skills: ['Flutter', 'Dart', 'Mobile Development', 'Cross-Platform', 'UI/UX Design'],
      image: 'images/certificates/FlutterCourse.jpg',
    },
  ],

  experience: [
    {
      title: 'Cybersecurity Trainer — JICC (Jeddah International Institute)',
      date: 'Nov 2025 – Present',
      details: [
        'Instruct and mentor 50+ tech professionals and students across diploma levels, delivering 120+ hours of training on vulnerability identification, digital risk management, and compliance frameworks.',
        "Designed and ran 15+ simulated cyberattack scenarios and hands-on lab assessments, improving learners' practical threat-detection skills by ~30%.",
        'Developed training modules bridging secure coding and system defense, maintaining a 90%+ pass rate in workforce-readiness evaluations.',
      ],
    },
    {
      title: 'Software Engineer Intern — King Fahad Armed Forces Hospital (KFAFH)',
      date: 'Jan 2025 – Mar 2025',
      details: [
        'Optimized enterprise ERP features and resolved 25+ technical bugs, improving healthcare workflows and operational efficiency by ~15%.',
        'Built a secure Internship COOP portal with modern backend architecture, responsive UX, and strict data validation for 100+ active applicants.',
        'Revamped administrative communications UI and backend, accelerating secure data transmission and cutting latency by ~35%.',
        'Delivered onboarding and technical training for 40+ hospital staff, achieving a 100% system adoption rate.',
      ],
    },
    {
      title: 'B.S. in Software Engineering — University of Jeddah',
      date: '2020 – 2025',
      details: [
        'Graduated May 2025 with a focus on software architecture, backend engineering, and secure development.',
        'Built an AI/NLP graduation project for audio-based disease prediction (Python, Scikit-learn).',
        'Earned Red Hat (RH124, AD183) and Full-Stack Web Development certifications.',
      ],
    },
  ],

  // The "Skills & Technologies" progress-bar section
  skillBars: [
    {
      title: 'Backend & Security',
      bars: [
        { label: 'Python', value: 90 },
        { label: 'Node.js / Express', value: 85 },
        { label: 'RedHat Linux', value: 85 },
        { label: 'Cybersecurity', value: 80 },
        { label: 'DevOps', value: 75 },
      ],
    },
    {
      title: 'Frontend & Databases',
      bars: [
        { label: 'JavaScript (ES6+)', value: 85 },
        { label: 'React.js', value: 80 },
        { label: 'MS SQL Server', value: 85 },
        { label: '.NET / EF Core', value: 80 },
        { label: 'MongoDB', value: 75 },
      ],
    },
  ],

  contact: {
    heading: "Let's Connect",
    intro:
      "I'm open to full-time backend and application-security roles. Feel free to reach out for collaborations, opportunities, or just to say hello!",
    email: 'me@feraswe.com',
    location: 'Jeddah, Saudi Arabia · Open to On-site or Remote roles',
    social: [
      { icon: 'fab fa-github', url: 'https://github.com/FerasAlkhodari', title: 'GitHub' },
      { icon: 'fab fa-linkedin', url: 'https://www.linkedin.com/in/feraswe/', title: 'LinkedIn' },
    ],
  },

  footer: {
    text: '© 2026 Feras Alkhodari. All rights reserved.',
  },
};
