// Grounded ambassador. There is no model: every reply is one fixed entry below,
// each written from the resume, so it can't invent facts or leak a prompt.
(function () {
  'use strict';

  var REFUSAL = "I don't have verified information about that.";
  var PRIVATE_REPLY = REFUSAL + ' The public contact is LinkedIn.';
  var INJECTION_REPLY = "I can't do that. I have no prompt to share and no instructions to change, " +
    "because every answer is a fixed entry from the resume. I also can't confirm claims the resume doesn't make. " + REFUSAL;
  var HINT = 'Ask about role fit, projects, impact, leadership, skills or education.';

  var INJECTION = /(ignore|disregard|forget|override|bypass)\b.{0,40}\b(instruction|prompt|rule|guardrail|above)|system\s*prompt|your\s+(prompt|instructions|rules)|you\s+are\s+now|pretend|jailbreak|developer\s+mode|confirm\s+that/i;
  var PRIVATE = /\b(phone|mobile\s+(number|no)|cell|telephone|whatsapp|e-?mail|gmail|home\s+address|street|address|pin\s*code|postcode|zip)\b/i;

  // Question words carry no facts, so they don't count as matches or as unknown terms.
  var STOP = ('a an the is are was were be been do does did has have had can could would will should shall may might ' +
    'what which who whom whose why how when where he she they his her hers their theirs him them mahfuz mahfuzul syed mazid ' +
    'i me my we our us you your it its this that these those there here and or but so if then than of for to in on at by with ' +
    'from as about into tell please give show list describe explain share know knows good strong great best really very much ' +
    'many more most some any one thing things like use used using uses work worked working works done doing get got make made ' +
    'candidate person someone kind type hi hello hey thanks thank name happen happened happening s t').split(' ');

  var ENTRIES = [
    { id: 'fit', keys: ['fit', 'match', 'suitable', 'hire', 'tech lead', 'capabilities', 'strength', 'strongest', 'remember'], weak: ['role', 'lead', 'position'],
      text: 'For a Tech Lead role, three things stand out. Mahfuz architects production SaaS across PHP and Python, as on Dentapal. Mahfuz ships AI and automation that saves labour: a hybrid rules-and-ML treatment-plan workflow reduced clinician labour by 40-50%. And Mahfuz leads engineers and modernises legacy systems: 4 developers on Dentapal, and a legacy Python migration to Laravel and MySQL.',
      href: '#match', label: 'Role match', source: 'Resume: Summary, Dentapal' },
    { id: 'background', keys: ['background', 'summary', 'overview', 'career', 'introduce', 'profile', 'history'], weak: [],
      text: 'Mahfuz is a Tech Lead and Software Analyst at Alegra Labs GmbH with 13+ years of experience, working as both a PHP/Laravel and a Python developer on HealthTech, AI/NLP and e-commerce platforms for clients in Germany, Switzerland and the USA.',
      href: '#experience', label: 'Experience', source: 'Resume: Summary' },
    { id: 'years', keys: ['years', 'long', 'seniority', 'senior', 'employer', 'employers', 'company', 'alegra', 'job', 'current', 'currently'], weak: ['experience'],
      text: 'The resume states 13+ years of experience. Mahfuz has been at Alegra Labs GmbH since Aug 2013, moving from Junior Developer to Senior Developer, Lead Developer and now Tech Lead & Software Analyst, with 7 production projects delivered.',
      href: '#experience', label: 'Experience', source: 'Resume: Experience' },
    { id: 'leadership', keys: ['lead', 'led', 'leading', 'leadership', 'leader', 'team', 'teams', 'manage', 'managed', 'manager', 'mentor', 'mentored', 'mentoring', 'mentorship', 'developers', 'engineers', 'size', 'people', 'standards', 'review'], weak: [],
      text: 'On Dentapal, Mahfuz led a cross-functional team of 4 developers, directing architecture, enforcing coding standards and mentoring junior engineers. On Interscriber, Mahfuz coordinated a multi-national engineering team. On DigiPro, Mahfuz collaborated with an international team of 15+ and led large-scale deployments.',
      href: '#experience', label: 'Experience', source: 'Resume: Dentapal, Interscriber, DigiPro' },
    { id: 'impact', keys: ['impact', 'measurable', 'measurably', 'change', 'changed', 'result', 'results', 'metric', 'metrics', 'outcome', 'outcomes', 'saving', 'savings', 'saved', 'achievement', 'achievements', 'accomplishment', 'percent'], weak: [],
      text: 'Measured results from the resume: Dentapal reduced clinician labour by 40-50%. Interscriber reduced operating costs by 30% and manual labour by 40%. Kamwo Herbs improved application performance by 30% and client satisfaction by 20%. Poster recognition eliminated thousands of hours of manual verification.',
      href: '#projects', label: 'Selected projects', source: 'Resume: Dentapal, Interscriber, Kamwo, Poster Recognition' },
    { id: 'projects', keys: ['portfolio'], weak: ['project', 'projects', 'built', 'build', 'delivered'],
      text: 'The featured projects are Dentapal, Interscriber, a machine learning chatbot platform, a poster recognition platform and the Kamwo Herbs e-commerce and ERP platform. Dentapal is the strongest for this role: a multi-portal clinic SaaS with a hybrid rules-and-ML treatment-plan workflow.',
      href: '#projects', label: 'Selected projects', source: 'Resume: Experience' },
    { id: 'dentapal', keys: ['dentapal', 'dental', 'clinic', 'clinics', 'healthcare', 'healthtech', 'hkp', 'dispatch', 'appointment', 'scheduling', 'saas', 'portal', 'portals', 'stripe', 'pipedrive', 'buchhaltungsbutler', 'ds-win', 'berlin'], weak: [],
      text: 'Dentapal is a healthcare and clinic operations SaaS for Dentapal GmbH in Berlin. Mahfuz architected its admin, employee and customer portals on Next.js, React, TypeScript, Laravel and MySQL, automated the HKP treatment plan workflow with a hybrid rules-and-ML system, reducing clinician labour by 40-50%, and built an appointment dispatch engine. Integrations include Stripe, Pipedrive and BuchhaltungsButler.',
      href: '#dentapal', label: 'Dentapal', source: 'Resume: Dentapal' },
    { id: 'dentabot', keys: ['dentabot', 'clinical', 'proposal'], weak: [],
      text: 'DentaBot is a FastAPI-based AI service for clinical chat and proposal generation, delivered as part of the Dentapal work.',
      href: '#dentapal', label: 'Dentapal', source: 'Resume: Dentapal' },
    { id: 'interscriber', keys: ['interscriber', 'transcription', 'transcribe', 'audio', 'zhaw', 'zurich', 'switzerland', 'research', 'researchers'], weak: [],
      text: 'Interscriber is an audio-to-text transcription platform built with ZHAW researchers, using Electron and Vue.js with Python, Flask, Nginx and PostgreSQL. Legacy modernisation reduced operating costs by 30%, and pipeline automation cut manual labour by 40%.',
      href: '#interscriber', label: 'Interscriber', source: 'Resume: Interscriber' },
    { id: 'chatbot', keys: ['chatbot', 'chatbots', 'conversational', 'intent', 'entity'], weak: [],
      text: 'Mahfuz was lead developer on a machine learning chatbot platform: conversational agents and backend services in Python, Flask and MySQL focused on intent recognition and entity extraction, with REST APIs for drop-in JavaScript integration on client websites.',
      href: '#chatbot', label: 'Conversational AI', source: 'Resume: Chatbot Platform' },
    { id: 'poster', keys: ['poster', 'posters', 'image', 'recognition', 'vision'], weak: [],
      text: 'Mahfuz built an ML-driven image-recognition system in Python, Flask and jQuery that detects and verifies street posters from mobile photos, eliminating thousands of hours of manual verification for the client.',
      href: '#poster', label: 'Poster recognition', source: 'Resume: Poster Recognition' },
    { id: 'kamwo', keys: ['kamwo', 'herbs', 'herb', 'ecommerce', 'e-commerce', 'erp', 'shop', 'shopping', 'warehouse', 'warehousing', 'logistics', 'cordova', 'firebase', 'acudirect'], weak: [],
      text: 'For Kamwo Herbs in New York City, Mahfuz engineered a large-scale e-commerce and ERP platform in PHP 7, MySQL and Firebase, and delivered a hybrid mobile shopping app. Application performance improved by 30% and client satisfaction by 20%.',
      href: '#kamwo', label: 'Kamwo Herbs', source: 'Resume: Kamwo Herbs' },
    { id: 'digipro', keys: ['digipro', 'cms', 'florida', 'escapia', 'iqware', 'propay', 'soap', 'vacation', 'rental'], weak: [],
      text: 'For DigiPro Media in Florida, Mahfuz built a multi-module CMS for vacation-rental properties and integrated SOAP and REST APIs from Escapia, IQware and Propay for booking, payments and channel synchronisation.',
      href: '#experience', label: 'Experience', source: 'Resume: DigiPro Media CMS' },
    { id: 'picletta', keys: ['picletta', 'svg', 'facebook', 'junior'], weak: [],
      text: 'Mahfuz started as a Junior Developer on Picletta, a Facebook application, building an SVG manipulation module in JavaScript and jQuery.',
      href: '#experience', label: 'Experience', source: 'Resume: Picletta' },
    { id: 'backend', keys: ['backend', 'php', 'laravel', 'python', 'fastapi', 'flask', 'api', 'apis', 'rest', 'microservices', 'sanctum', 'nginx', 'sse'], weak: ['skills', 'stack', 'languages', 'tech', 'technologies', 'tools'],
      text: 'Backend skills on the resume: Python, PHP, Laravel, FastAPI, Flask, REST and SOAP APIs, microservices, Nginx, Laravel Sanctum and Server-Sent Events. Laravel runs Dentapal, FastAPI runs DentaBot, and Flask runs Interscriber and the chatbot platform.',
      href: '#skills', label: 'Skills', source: 'Resume: Core Technical Skills' },
    { id: 'frontend', keys: ['frontend', 'front-end', 'react', 'vue', 'next', 'typescript', 'javascript', 'jquery', 'electron', 'css', 'html', 'full-stack', 'fullstack'], weak: [],
      text: 'Frontend skills on the resume: JavaScript, TypeScript, Next.js, React, Vue.js, jQuery, Electron, HTML5 and CSS3. Dentapal uses Next.js, React and TypeScript. Interscriber uses Electron with Vue.js.',
      href: '#skills', label: 'Skills', source: 'Resume: Core Technical Skills' },
    { id: 'data', keys: ['database', 'databases', 'mysql', 'postgresql', 'postgres', 'sql'], weak: [],
      text: 'Databases on the resume: MySQL, PostgreSQL and Firebase, plus database design under architecture skills.',
      href: '#skills', label: 'Skills', source: 'Resume: Core Technical Skills' },
    { id: 'devops', keys: ['devops', 'docker', 'cicd', 'ci/cd', 'ci', 'cd', 'aws', 'cloud', 'ec2', 's3', 'rds', 'linux', 'git', 'svn', 'deployment', 'deployments'], weak: [],
      text: 'DevOps and cloud skills on the resume: Docker, CI/CD, AWS (EC2, S3, RDS), Git, SVN, Linux and deployment automation. Mahfuz shipped CI/CD pipelines and Docker-based deployments on Dentapal.',
      href: '#skills', label: 'Skills', source: 'Resume: Core Technical Skills, Dentapal' },
    { id: 'ai', keys: ['ai', 'ml', 'machine', 'learning', 'nlp', 'pipeline', 'pipelines'], weak: [],
      text: 'AI and ML skills on the resume: natural language processing, chatbot development, image recognition and ML pipelines. Examples are DentaBot, Interscriber, the chatbot platform and poster recognition.',
      href: '#skills', label: 'Skills', source: 'Resume: Core Technical Skills' },
    { id: 'testing', keys: ['testing', 'tests', 'test', 'phpunit', 'pytest', 'qa'], weak: [],
      text: 'Testing skills on the resume: PHPUnit, Pytest, and unit, integration, API and automated testing.',
      href: '#skills', label: 'Skills', source: 'Resume: Core Technical Skills' },
    { id: 'architecture', keys: ['architecture', 'architect', 'design', 'system', 'scalability', 'performance', 'patterns', 'legacy', 'modernisation', 'modernization', 'migration', 'migrated'], weak: [],
      text: 'Architecture skills on the resume include system design, API design, database design, scalability and legacy modernisation. Mahfuz architected Dentapal and migrated legacy Python systems to Laravel and MySQL.',
      href: '#match', label: 'Role match', source: 'Resume: Core Technical Skills, Dentapal' },
    { id: 'agile', keys: ['agile', 'scrum', 'stakeholder', 'stakeholders'], weak: [],
      text: 'The resume lists Agile / Scrum, code review, mentoring, cross-functional collaboration and stakeholder management under leadership skills.',
      href: '#skills', label: 'Skills', source: 'Resume: Core Technical Skills' },
    { id: 'languages', keys: ['english', 'hindi', 'assamese', 'bengali', 'speak', 'spoken'], weak: [],
      text: 'Languages spoken: English (professional), Hindi (full professional), Assamese (native) and Bengali (limited).',
      href: '#skills', label: 'Skills', source: 'Resume: Core Technical Skills' },
    { id: 'education', keys: ['education', 'degree', 'degrees', 'mca', 'bca', 'college', 'university', 'studied', 'study', 'graduate', 'graduated', 'qualification', 'qualifications'], weak: [],
      text: "Mahfuz holds an MCA in Computer Science from St. Anthony's College, Shillong (2010 to 2013) and a BCA in Computer Science from Dibrugarh University (2007 to 2010).",
      href: '#education', label: 'Education', source: 'Resume: Education' },
    { id: 'awards', keys: ['award', 'awards', 'anandaram', 'jigyas', 'honor', 'honour', 'recognition'], weak: [],
      text: 'Awards on the resume: the Anandaram Baruah Award and the Jigyas Talent Search Examination.',
      href: '#education', label: 'Education', source: 'Resume: Certifications & Awards' },
    { id: 'book', keys: ['book', 'books', 'publication', 'publications', 'published', 'author', 'wrote', 'written', 'kindle', 'java'], weak: [],
      text: "The Architect's Journey is a six-volume programming book series covering fundamentals, desktop and database applications with Python, Java and SQL, web development, AI/ML and system design. It is on Amazon Kindle and free to read at smahfuzm.in/book.",
      href: '#education', label: 'Publications', source: 'Resume: Publications' },
    { id: 'location', keys: ['location', 'located', 'based', 'live', 'lives', 'city', 'guwahati', 'india', 'relocate', 'relocation', 'remote', 'bengaluru', 'hyderabad', 'pune', 'kolkata', 'mumbai', 'kochi'], weak: [],
      text: 'Mahfuz is based in Guwahati, India, and is open to relocating to Bengaluru, Hyderabad, Pune, Kolkata, Mumbai or Kochi, or to remote work across India.',
      href: '#main', label: 'Top of page', source: 'Resume: Header' },
    { id: 'contact', keys: ['contact', 'reach', 'linkedin', 'connect', 'message', 'github', 'resume', 'cv', 'download'], weak: [],
      text: 'The public contact is LinkedIn: linkedin.com/in/syed-mahfuzul-mazid. The resume is available as a PDF download at the top of this page.',
      href: '#main', label: 'Top of page', source: 'Resume: Header' }
  ];

  function stem(word) {
    return word.length > 3 && /s$/.test(word) && !/ss$/.test(word) ? word.slice(0, -1) : word;
  }

  function tokens(text) {
    return (text.toLowerCase().replace(/[’']s\b/g, '').replace(/\.js\b/g, '').match(/[a-z0-9][a-z0-9+#/-]*/g) || []).map(stem);
  }

  var stopSet = {};
  var vocab = {};
  STOP.forEach(function (w) { stopSet[stem(w)] = true; });
  ENTRIES.forEach(function (e) {
    e.keys.concat(e.weak, e.text.split(/\s+/)).forEach(function (phrase) {
      tokens(phrase).forEach(function (t) { vocab[t] = true; });
    });
  });

  function reply(entry) {
    return { text: entry.text, href: entry.href, label: entry.label, source: entry.source, id: entry.id };
  }

  function answer(question) {
    var q = String(question || '').slice(0, 300);
    if (INJECTION.test(q)) return { text: INJECTION_REPLY, id: 'injection' };
    if (PRIVATE.test(q)) return { text: PRIVATE_REPLY, id: 'private' };

    var content = tokens(q).filter(function (t) { return !stopSet[t]; });
    if (!content.length) return { text: HINT, id: 'hint' };

    // One unknown term sinks the question: "experience with Kubernetes" must not
    // match the general experience entry just because "experience" is known.
    if (content.some(function (t) { return !vocab[t]; })) return { text: REFUSAL, id: 'refusal' };

    var joined = ' ' + tokens(q).join(' ') + ' ';
    var best = null;
    var bestScore = 0;
    ENTRIES.forEach(function (e) {
      var score = 0;
      e.keys.forEach(function (k) { if (joined.indexOf(' ' + tokens(k).join(' ') + ' ') > -1) score += 3; });
      e.weak.forEach(function (k) { if (joined.indexOf(' ' + tokens(k).join(' ') + ' ') > -1) score += 1; });
      if (score > bestScore) { best = e; bestScore = score; }
    });
    return best ? reply(best) : { text: REFUSAL, id: 'refusal' };
  }

  var STARTERS = [
    'Why is Mahfuz a fit for a Tech Lead role?',
    'What happened on the Dentapal project?',
    'What has Mahfuz measurably changed?',
    'Where has Mahfuz led a team?'
  ];

  function mount() {
    var log = document.getElementById('log');
    var form = document.getElementById('form');
    var input = document.getElementById('q');
    var starters = document.getElementById('starters');

    function add(cls, text) {
      var p = document.createElement('p');
      p.className = 'msg ' + cls;
      p.textContent = text;
      log.appendChild(p);
      return p;
    }

    function ask(question) {
      var a = answer(question);
      add('user', question);
      var p = add('bot', a.text);
      if (a.source) {
        var src = document.createElement('span');
        src.className = 'src';
        src.appendChild(document.createTextNode(a.source + ' · '));
        var link = document.createElement('a');
        link.href = a.href;
        link.textContent = a.label;
        src.appendChild(link);
        p.appendChild(src);
      }
      log.scrollTop = log.scrollHeight;
    }

    STARTERS.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = s;
      b.addEventListener('click', function () { ask(s); });
      starters.appendChild(b);
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      ask(q);
      input.value = '';
    });
  }

  if (typeof document !== 'undefined') mount();
  if (typeof module !== 'undefined') module.exports = { answer: answer, ENTRIES: ENTRIES, REFUSAL: REFUSAL };
})();
