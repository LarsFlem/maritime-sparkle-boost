export default {
  // Navigation
  'nav.home': 'Hjem',
  'nav.services': 'Tjenester',
  'nav.portfolio': 'Portefølje',
  'nav.contact': 'Kontakt',
  'nav.hmi': 'HMI Dashboard',
  'nav.dataAnalysis': 'Dataanalyse',
  'nav.liveDemo': 'Live Demo',
  'nav.getQuote': 'Få Tilbud',

  // Live Demo — Offshore Crane Control
  'liveDemo.title': 'Offshore Krankontroll-demo',
  'liveDemo.subtitle': 'Sanntidssimulering av en dekksmontert kran som overfører containere mellom fartøy og plattform — viser anti-pendel-styring, sikkerhetsenvelope og automatiske operasjonssekvenser.',
  'liveDemo.status.running': 'I drift',
  'liveDemo.status.stopped': 'Standby',
  'liveDemo.status.eStop': 'Nødstopp',

  'liveDemo.kpi.load': 'Last',
  'liveDemo.kpi.wind': 'Vind',
  'liveDemo.kpi.mode': 'Modus',
  'liveDemo.kpi.cycles': 'Sykluser',

  'liveDemo.scene.title': 'Kranoperasjonsvisning',
  'liveDemo.controls.title': 'Kranstyring',
  'liveDemo.telemetry.title': 'Live telemetri',
  'liveDemo.trend.title': 'Last & pendel-trend (60 s)',
  'liveDemo.trend.load': 'Last (t)',
  'liveDemo.trend.sway': 'Pendel (°)',
  'liveDemo.alarms.title': 'Aktive alarmer',
  'liveDemo.alarms.allClear': 'Alle systemer nominelle',
  'liveDemo.explainer.title': 'Det demoen viser',

  'liveDemo.mode.manual': 'Manuell',
  'liveDemo.mode.semi': 'Anti-pendel',
  'liveDemo.mode.auto': 'Auto-sekvens',

  'liveDemo.controls.modeTitle': 'Driftsmodus',
  'liveDemo.controls.targetSlew': 'Sving-mål',
  'liveDemo.controls.targetHoist': 'Heise-mål',
  'liveDemo.controls.pickup': 'Plukk',
  'liveDemo.controls.landing': 'Landing',
  'liveDemo.controls.deck': 'Dekk',
  'liveDemo.controls.cruise': 'Marsj',
  'liveDemo.controls.sequence': 'Sekvens',
  'liveDemo.controls.cycles': 'Sykluser',
  'liveDemo.controls.start': 'Start',
  'liveDemo.controls.stop': 'Stopp',
  'liveDemo.controls.reset': 'Nullstill',
  'liveDemo.controls.eStop': 'Nødstopp',
  'liveDemo.controls.eStopReset': 'Tilbakestill nødstopp',
  'liveDemo.controls.attach': 'Fest krok',
  'liveDemo.controls.release': 'Slipp krok',
  'liveDemo.controls.hookHintLower': 'Senk kroken til dekksnivå (heis 0%) for å feste eller slippe.',
  'liveDemo.controls.hookHintToPickup': 'Sving til plukksone (sving 0%) for å feste containeren.',
  'liveDemo.controls.hookHintToLanding': 'Sving til landingssone (sving 100%) for å hente containeren.',
  'liveDemo.controls.hookHintAttachReady': 'Krok i posisjon — klar til å feste.',
  'liveDemo.controls.hookHintReleaseReady': 'Krok i posisjon — klar til å slippe.',

  'liveDemo.step.pickupLower': '1. Senk til plukk',
  'liveDemo.step.pickupLift': '2. Løft container',
  'liveDemo.step.slew': '3. Sving til landing',
  'liveDemo.step.setdown': '4. Sett ned',
  'liveDemo.step.return': '5. Tom retur',

  'liveDemo.gauge.load': 'Last',
  'liveDemo.gauge.slew': 'Sving',
  'liveDemo.gauge.hoist': 'Heis',
  'liveDemo.gauge.hydraulic': 'Hydraulikk',
  'liveDemo.gauge.wind': 'Vind',
  'liveDemo.gauge.sway': 'Pendel',

  'liveDemo.alarm.eStop': 'Nødstopp aktivert — all bevegelse stanset',
  'liveDemo.alarm.windHigh': 'Vind overskrider driftsenvelope (>35 kt)',
  'liveDemo.alarm.windCritical': 'Vind kritisk — drift må avbrytes (>45 kt)',
  'liveDemo.alarm.swayHigh': 'Forhøyet pendel-bevegelse (>5°)',
  'liveDemo.alarm.swayCritical': 'Kritisk pendel-bevegelse (>10°)',
  'liveDemo.alarm.hydraulicLow': 'Lavt hydraulikktrykk',
  'liveDemo.alarm.hydraulicHigh': 'Høyt hydraulikktrykk',
  'liveDemo.alarm.collisionRisk': 'Kollisjonsrisiko — pendel høy nær dekk',

  'liveDemo.explainer.antiSwayTitle': 'Anti-pendel-styring',
  'liveDemo.explainer.antiSwayBody': 'I Anti-pendel- og Auto-modus filtreres operatørens kommandoer for å undertrykke den naturlige pendelbevegelsen til hengende last — slik at lasten holdes stabil selv ved raske svingkommandoer.',
  'liveDemo.explainer.safetyTitle': 'Sikkerhetsenvelope',
  'liveDemo.explainer.safetyBody': 'Vindstyrke, last, pendelvinkel og hydraulikktrykk overvåkes kontinuerlig. Overskridelser inn i advarsels- eller kritisk område flagges, og avbryter aktiv sekvens automatisk om nødvendig.',
  'liveDemo.explainer.sequenceTitle': 'Sekvensert automasjon',
  'liveDemo.explainer.sequenceBody': 'En forhåndsprogrammert fem-stegs-syklus håndterer container-overføring fra start til slutt — plukk, løft, sving, sett ned og tom retur — med syklustelling og fremdriftsrapportering for hvert steg.',

  // Hero Section
  'hero.title': 'Maritime Automation',
  'hero.subtitle': 'Jeg tilbyr konsulent- og engineeringtjenester innen elektro og automasjon, med spesialisering i design og implementering av systemer for bevegelig maskineri, alarmsystemer og generell automasjon.',
  'hero.cta.services': 'Mine Tjenester',
  'hero.cta.contact': 'Kontakt Meg',
  'hero.feature1.title': 'Komplette Engineering-pakker',
  'hero.feature1.desc': 'Design og implementering av automatiseringssystemer',
  'hero.feature2.title': 'Support og Kommisjoning',
  'hero.feature2.desc': 'Igangsetting av automasjonsutstyr og maskineri',
  'hero.feature3.title': 'Prosjektsupportering',
  'hero.feature3.desc': 'Teknisk assistanse og Software Change Management',

  // Services Section
  'services.title': 'Mine Tjenester',
  'services.description': 'Med en solid bakgrunn innen mekatronikk og erfaring fra selskaper som Moreld Apply, Red Rock, HMH, Ocean Infinity Marine, Kongsberg Maritime / Rolls Royce Marine og Optimar Stette, kan jeg bidra til din bedrifts suksess.',
  
  'services.package.title': 'Komplette Engineering-pakker',
  'services.package.description': 'Design og implementering av automatiseringssystemer for bevegelig maskineri.',
  'services.package.feature1': 'Design og implementering av automatiseringssystemer for bevegelig maskineri',
  'services.package.feature2': 'Alarmsystemer og generell automasjon',
  'services.package.feature3': 'Planlegging, design og gjennomføring av elektriske systemer i samsvar med IECEx- og ATEX-standarder',
  'services.package.feature4': 'Programmering av PLC-er, spesielt TwinCAT for Beckhoff PLC-er',

  'services.support.title': 'Support og Kommisjoning',
  'services.support.description': 'Igangsetting av automasjonsutstyr og maskineri.',
  'services.support.feature1': 'Igangsetting av automasjonsutstyr og maskineri',
  'services.support.feature2': 'Feilsøking og teknisk støtte på elektrisk- og automasjonsutstyr',
  'services.support.feature3': 'Nettverkskonfigurasjon for routere, access points og brannmurer',
  'services.support.feature4': 'Leveranse av detaljert as-built dokumentasjon',

  'services.project.title': 'Prosjektsupportering og Assistanse',
  'services.project.description': 'Støtte i prosjektledelse, inkludert estimering av tid og kostnader for tekniske oppgraderinger.',
  'services.project.feature1': 'Støtte i prosjektledelse, inkludert estimering av tid og kostnader',
  'services.project.feature2': 'Assistanse i håndtering av programvareoppdateringer og endringer',
  'services.project.feature3': 'FMEA-assistanse (Failure Modes and Effects Analysis)',
'services.project.feature4': 'Assistanse ved implementering av nye verktøy som AutoCAD, Vault, TwinCAT',

  'services.printing.title': '3D Printing og Modellering',
  'services.printing.description': '3D-printingstjenester med en Bambu P1P-printer som støtter PLA, PETG, TPU og andre materialer.',
  'services.printing.feature1': 'Modellering og print av spesialtilpassede braketter og komponenter',
  'services.printing.feature2': 'Rådgivning om riktig filamentvalg basert på applikasjonens krav',
  'services.printing.feature3': 'Print av skalerte modeller og prototyper for messer',
  'services.printing.feature4': 'Utstyr kan kjøpes inn for spesielle krav',

  'services.readMore': 'Les Mer',
  'services.experience.title': 'Erfaring fra Ledende Maritime Selskaper',

  // Portfolio Section
  'portfolio.title': 'Prosjektportefølje',
  'portfolio.description': 'Utforsk våre vellykkede implementeringer på tvers av ulike maritime sektorer, som viser innovative automasjonsløsninger som leverer målbare resultater.',
  'portfolio.all': 'Alle Prosjekter',
  'portfolio.offshore': 'Offshore',
  'portfolio.technologies': 'Teknologier',
  'portfolio.results': 'Nøkkelresultater',
  'portfolio.client': 'Klient',
  'portfolio.drawings': 'Tegninger',
  'portfolio.cat.offshore': 'Offshore',
  'portfolio.cat.green': 'Grønn Tech',
  'portfolio.cat.project': 'Prosjekt',

  // Portfolio — Prosjekter
  'portfolio.proj.crane.title': '3D Bevegelseskompenserte Kransystemer',
  'portfolio.proj.crane.location': 'Verdensomspennende',
  'portfolio.proj.crane.duration': '18 måneder',
  'portfolio.proj.crane.description': 'PLS-programmering i strukturert tekst i TwinCAT for Beckhoff-baserte 3D bevegelseskompenserte offshorekraner. HMI-utvikling i HTML/CSS/JS, SQL-alarmdatabaser, nettverkskonfigurasjon, og oppfølging på sjøprøver i Taiwan for IMECA hybrid 6 t Cygnus-kran om bord på Edda Monsoon.',
  'portfolio.proj.crane.tech': 'TwinCAT|Beckhoff PLS|HTML/CSS/JS HMI|SQL|3D-kompensering',
  'portfolio.proj.crane.results': 'Flere kranleveranser fullført|Vellykkede sjøprøver i Taiwan|Mannskapsopplæring på 3D-kompensert drift',

  'portfolio.proj.battery.title': 'Autonomt Batteribytte – SHIFTR',
  'portfolio.proj.battery.location': 'Stavanger, Norge',
  'portfolio.proj.battery.duration': 'Pågående',
  'portfolio.proj.battery.description': 'Idriftsettelse- og teststøtte for autonomt batteribyttesystem til hurtiggående ferger. Bidro til etterlevelse av maskindirektiv og sikkerhetsstandarder, og leverte teknisk tilbakemelding for å forbedre systemdesign, pålitelighet og ytelse.',
  'portfolio.proj.battery.tech': 'Maskindirektiv|Sikkerhetsstandarder|Systemintegrasjon|Batteriteknologi',
  'portfolio.proj.battery.results': 'Autonomt batteribytte for ferger|Etterlevelse av sikkerhetsstandarder|Forbedret systempålitelighet',

  'portfolio.proj.ks.title': 'Injeksjonsutstyr – KS-Service & Injeksjonsutstyr AS',
  'portfolio.proj.ks.location': 'Norge',
  'portfolio.proj.ks.duration': 'Pågående',
  'portfolio.proj.ks.description': 'Bistand i produktutvikling for et injeksjonsutstyrsprosjekt — 3D-modellering og produksjonstegninger, inkludert platekapptegninger for en sementtank-sammenstilling. I tillegg bistått med innføring av AI-støttede arbeidsflyter i organisasjonen — Claude Code CLI for ingeniør- og administrasjonsoppgaver, Lovable for rask app-prototyping, og et internt AI-drevet intranett for delt kunnskap og dokumentasjon.',
  'portfolio.proj.ks.tech': 'Produktutvikling|SolidWorks|Platedesign|STEP/PDF-tegninger|Claude Code CLI|Lovable|Intranett / AI-arbeidsflyter',
  'portfolio.proj.ks.results': 'Produktutviklingsstøtte på tvers av design og dokumentasjon|Produksjonsklare 3D-modeller og kapptegninger levert|AI-arbeidsflyter tatt i bruk på tvers av ingeniør og administrasjon',
  'portfolio.proj.ks.download.pdf': 'Platekapptegning (PDF)',
  'portfolio.proj.ks.download.step': 'Sementtank platearbeid (STEP)',

  'portfolio.proj.ks3d.title': '3D-printing av prototyper og praktisk introduksjon – KS-Service',
  'portfolio.proj.ks3d.location': 'Norge',
  'portfolio.proj.ks3d.duration': 'Pågående',
  'portfolio.proj.ks3d.description': '3D-printing av prototyper for KS-Service, samt en praktisk introduksjon til additiv produksjon — fra valg av riktig filament (PLA, PETG, TPU m.m.) og finjustering av slicer-innstillinger, til design av deler tilpasset printing og raske iterasjoner mellom revisjoner på en Bambu P1P-printer.',
  'portfolio.proj.ks3d.tech': 'Bambu P1P|PLA / PETG / TPU|Slicer-justering|Design for AM|Rask Prototyping',
  'portfolio.proj.ks3d.results': 'Prototyper printet og itereres ved behov|Praktisk opplæring i additiv produksjon|Raskere design-til-prototype-syklus internt',

  'portfolio.proj.racing.title': 'Align Racing – Formula Student',
  'portfolio.proj.racing.location': 'Grimstad, Norge',
  'portfolio.proj.racing.duration': '12 måneder',
  'portfolio.proj.racing.description': 'Sjef for elektronikk med ansvar for å lede 13 studenter gjennom design, prototyping, produksjon og innstilling av hele elektronikkpakken på en formula student-racerbil. Sikret etterlevelse av løpsreglement og holdt teammotivasjon oppe.',
  'portfolio.proj.racing.tech': 'Innebygde Systemer|PCB-design|CAN-buss|Lederskap',
  'portfolio.proj.racing.results': 'Komplett elektronikkpakke levert|13-personers team ledet|Etterlevelse av løpsreglement',

  // Contact Section
  'contact.title': 'Kontakt Meg',
  'contact.subtitle': 'La Oss Diskutere Ditt Prosjekt',
  'contact.description': 'Klar til å forbedre dine maritime operasjoner? Ta kontakt for å diskutere dine automasjonsbehov og oppdage hvordan vi kan samarbeide.',
  
  'contact.info.email': 'E-post',
  'contact.info.phone': 'Telefon',
  'contact.info.location': 'Lokasjon',
  'contact.info.responseTime': 'Responstid',
  'contact.info.responseTimeValue': 'Innen 24 timer',
  'contact.info.certifications': 'Sertifiseringer',
'contact.info.certificationsValue': 'Innehaver nødvendige sertifikat og attester for arbeid på sjøen og på rig',
  'contact.info.address': 'Jørpeland, Rogaland, Norge',

  // About/CV Section
  'about.title': 'Om Meg',
  'about.subtitle': 'Mekatronikk-ingeniør med solid erfaring',
  'about.description': 'Skreddersydde elektriske og automasjonssystemer for maritime prosjekter — fra design til levering.',
  'about.downloadCV': 'Last ned CV',
  'about.watchInterview': 'Se Portrettintervju',
  'about.ceo': 'Daglig leder - Enkeltpersonforetak',
  'about.role.moreld': 'Senior Automasjonsingeniør',
  'about.role.redrock': 'Senior Elektro-Automasjonsingeniør',
  'about.role.hmh': 'Senior Kontrollsystem Support Ingeniør',
  'about.role.ocean': 'Elektro-Automasjonsingeniør, Senere Teamleder',
  'about.role.kongsberg': 'Montør, Testingeniør, Senere Reservedelskoordinator',

  // Education
  'education.title': 'Utdanning',
  'education.uia': 'Bachelor i Mekatronikk, Robotikk og Automatiseringsteknikk',
  'education.uia.years': '2016 - 2019',
  'education.ntnu': 'Årsstudium i Økonomi og Ledelse',
  'education.ntnu.years': '2015 - 2016',
  'education.haram': 'Fagbrev og Realfagskompetanse - Teknisk Allmenne Fag, Automasjon',
  'education.haram.years': '2010 - 2015',

  // Skills
  'skills.title': 'Ferdigheter',
  'skills.solidworks': 'SolidWorks',
  'skills.network': 'Nettverkskonfigurasjon',
  'skills.leadership': 'Lederskap',
  'skills.languages': 'Språk',
  'skills.norwegian': 'Norsk (Morsmål)',
  'skills.english': 'Engelsk (Flytende)',

  'contact.form.name': 'Fullt Navn',
  'contact.form.email': 'E-postadresse',
  'contact.form.company': 'Selskap',
  'contact.form.phone': 'Telefonnummer',
  'contact.form.subject': 'Emne',
  'contact.form.message': 'Prosjektdetaljer',
  'contact.form.messagePlaceholder': 'Beskriv dine prosjektkrav, tidsramme og eventuelle spesifikke utfordringer du står overfor...',
  'contact.form.submit': 'Send Melding',

  // Footer
  'footer.services': 'Tjenester',
  'footer.expertise': 'Ekspertise',
  'footer.copyright': 'Alle rettigheter forbeholdt.',
  'footer.tagline': 'Navigerer fremtiden for maritim automasjon',

  // HMI Dashboard

  // Data Analysis
  'dataAnalysis.title': 'Dataanalyse',
  'dataAnalysis.subtitle': 'Historisk ytelsesanalyse for offshore bølgegeneratorer',

  // Common

  // Not Found
  'notFound.title': '404',
  'notFound.message': 'Oops! Siden ble ikke funnet',
  'notFound.returnHome': 'Tilbake til Hjem',

  // HMI Dashboard Additional

  // Portfolio Additional
  'portfolio.engineers': 'ingeniører',

  // Contact Additional

  // Footer Additional
  'ship3d.rotateHint': '🖱️ Dra for å rotere',
};