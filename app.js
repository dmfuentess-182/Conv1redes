  /* =====================================================================
     GLOBAL APPLICATION STATE & PERSISTENCE
     ===================================================================== */
  var appState = {
    currentTab: 'home',
    t2QuizAnswers: {},
    finalQuizAnswers: {},
    s1Priority: '32768',
    s2Priority: '32768',
    s3Priority: '32768',
    activeTopo: 'estrella'
  };

  /* Hoisted Navigation Function */
  function navigateTo(tabId) {
    var validTabs = ['home', 't1', 't2', 't3', 't4', 't5'];
    if (validTabs.indexOf(tabId) === -1) tabId = 'home';

    appState.currentTab = tabId;

    // Toggle nav buttons
    for (var i = 0; i < validTabs.length; i++) {
      var t = validTabs[i];
      var btn = document.getElementById('nav-' + t);
      var view = document.getElementById('view-' + t);
      if (btn) {
        if (t === tabId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
      if (view) {
        if (t === tabId) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      }
    }

    // Scroll to top of main area
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Persist state
    saveAppState();
  }

  /* Async state saver */
  async function saveAppState() {
    try {
      if (window.notebookAppApi && typeof window.notebookAppApi.setAppState === 'function') {
        await window.notebookAppApi.setAppState(appState);
      }
    } catch (err) {
      console.warn('Persistence save error:', err);
    }
  }

  /* Async state loader */
  async function loadAppState() {
    try {
      if (window.notebookAppApi && typeof window.notebookAppApi.getAppState === 'function') {
        var saved = await window.notebookAppApi.getAppState();
        if (saved && typeof saved === 'object') {
          if (saved.currentTab) appState.currentTab = saved.currentTab;
          if (saved.t2QuizAnswers) appState.t2QuizAnswers = saved.t2QuizAnswers;
          if (saved.finalQuizAnswers) appState.finalQuizAnswers = saved.finalQuizAnswers;
          if (saved.s1Priority) appState.s1Priority = saved.s1Priority;
          if (saved.s2Priority) appState.s2Priority = saved.s2Priority;
          if (saved.s3Priority) appState.s3Priority = saved.s3Priority;
          if (saved.activeTopo) appState.activeTopo = saved.activeTopo;
        }
      }
    } catch (err) {
      console.warn('Persistence load error:', err);
    }

    // Restore UI from loaded state
    restoreUIFromState();
  }

  function restoreUIFromState() {
    // Restore tab
    navigateTo(appState.currentTab || 'home');

    // Restore STP priorities in dropdowns
    var s1El = document.getElementById('s1-priority');
    if (s1El && appState.s1Priority) s1El.value = appState.s1Priority;
    var s2El = document.getElementById('s2-priority');
    if (s2El && appState.s2Priority) s2El.value = appState.s2Priority;
    var s3El = document.getElementById('s3-priority');
    if (s3El && appState.s3Priority) s3El.value = appState.s3Priority;

    updateSTPState();
    setTopology(appState.activeTopo || 'estrella');
  }

  /* =====================================================================
     TUTORÍA 1: OSI vs TCP/IP DATA & INTERACTION
     ===================================================================== */
  var osiLayersData = [
    {
      num: 7,
      name: `Capa de Aplicación`,
      tcp: `Capa 4 (Aplicación)`,
      pdu: `Datos`,
      hw: `Computadores, Servidores Web/Correo, Clientes`,
      proto: `HTTP, HTTPS, DNS, DHCP, SSH, FTP, Telnet`,
      desc: `Ofrece a las aplicaciones de usuario acceso a los servicios de red. Es la interfaz directa con los programas del usuario final.`
    },
    {
      num: 6,
      name: `Capa de Presentación`,
      tcp: `Capa 4 (Aplicación)`,
      pdu: `Datos`,
      hw: `Sistemas Operativos, Librerías de Cifrado`,
      proto: `TLS/SSL, ASCII, JPEG, MPEG, GIF`,
      desc: `Formatea, comprime y cifra la información para garantizar que los datos enviados por un sistema heterogéneo sean legibles por el receptor.`
    },
    {
      num: 5,
      name: `Capa de Sesión`,
      tcp: `Capa 4 (Aplicación)`,
      pdu: `Datos`,
      hw: `Manejadores de Sesión del Sistema Operativo`,
      proto: `NetBIOS, RPC, Sockets, PPTP`,
      desc: `Establece, gestiona, sincroniza y termina las sesiones y diálogos de comunicación bidireccional entre las aplicaciones pares.`
    },
    {
      num: 4,
      name: `Capa de Transporte`,
      tcp: `Capa 3 (Transporte)`,
      pdu: `Segmentos (TCP) / Datagramas (UDP)`,
      hw: `Hosts terminales, Balanceadores de Carga`,
      proto: `TCP, UDP, SCTP`,
      desc: `Garantiza el transporte extremo a extremo de mensajes entre procesos de software mediante números de puerto. Provee control de flujo y errores.`
    },
    {
      num: 3,
      name: `Capa de Red`,
      tcp: `Capa 2 (Red / Internet)`,
      pdu: `Paquetes`,
      hw: `Routers (Encaminadores), Switches de Capa 3`,
      proto: `IPv4, IPv6, ICMP, ARP, OSPF, RIP, BGP`,
      desc: `Encargada del enrutamiento lógico de paquetes a través de subredes heterogéneas mediante direcciones IP y tablas de ruteo.`
    },
    {
      num: 2,
      name: `Capa de Enlace de Datos`,
      tcp: `Capa 1 (Red Subyacente / Acceso)`,
      pdu: `Tramas (Frames)`,
      hw: `Switches (Conmutadores Capa 2), NICs (Tarjetas de Red)`,
      proto: `Ethernet (IEEE 802.3), WiFi (IEEE 802.11), STP (802.1D)`,
      desc: `Permite la comunicación confiable salto a salto entre nodos directamente conectados en una misma LAN usando direcciones físicas MAC.`
    },
    {
      num: 1,
      name: `Capa Física`,
      tcp: `Capa 1 (Red Subyacente / Acceso)`,
      pdu: `Bits`,
      hw: `Cables UTP, Fibra Óptica, Antenas RF, Repetidores`,
      proto: `1000BASE-T, V.90, DSL, EIA/TIA-568`,
      desc: `Gestiona la transmisión de secuencias de bits sin estructurar a través de señales eléctricas, lumínicas o de radiofrecuencia en el medio físico.`
    }
  ];

  function renderOSIStack() {
    var container = document.getElementById('osi-stack-container');
    if (!container) return;

    var html = '';
    for (var i = 0; i < osiLayersData.length; i++) {
      var item = osiLayersData[i];
      var isDefault = (item.num === 7);
      html += `
        <div class="osi-layer-row ${isDefault ? 'active' : ''}" id="osi-row-${item.num}" onclick="selectOSILayer(${item.num})" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-xs) var(--space-sm); background-color: var(--surface-container); border: var(--rule); border-left: 3px solid ${isDefault ? 'var(--primary)' : 'var(--outline)'}; cursor: pointer; transition: background-color var(--dur-micro) var(--ease-out);">
          <div style="display: flex; gap: var(--space-sm); align-items: center;">
            <span class="mono-cell" style="font-weight: 600; color: var(--primary);">Nivel ${item.num}</span>
            <span style="font-size: 0.875rem; font-weight: 500;">${item.name}</span>
          </div>
          <span class="tag neutral" style="font-size: 0.65rem;">${item.tcp}</span>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  function selectOSILayer(num) {
    var data = null;
    for (var i = 0; i < osiLayersData.length; i++) {
      if (osiLayersData[i].num === num) {
        data = osiLayersData[i];
        break;
      }
    }
    if (!data) return;

    // Update active highlight on rows
    for (var j = 1; j <= 7; j++) {
      var row = document.getElementById('osi-row-' + j);
      if (row) {
        if (j === num) {
          row.style.borderLeftColor = 'var(--primary)';
          row.style.backgroundColor = 'var(--primary-container)';
        } else {
          row.style.borderLeftColor = 'var(--outline)';
          row.style.backgroundColor = 'var(--surface-container)';
        }
      }
    }

    // Update detail card
    var tagEl = document.getElementById('layer-tag');
    var tcpTagEl = document.getElementById('layer-tcp-tag');
    var nameEl = document.getElementById('layer-name');
    var descEl = document.getElementById('layer-desc');
    var pduEl = document.getElementById('layer-pdu');
    var hwEl = document.getElementById('layer-hw');
    var protoEl = document.getElementById('layer-proto');

    if (tagEl) tagEl.textContent = `Capa ${data.num} OSI`;
    if (tcpTagEl) tcpTagEl.textContent = data.tcp;
    if (nameEl) nameEl.textContent = data.name;
    if (descEl) descEl.textContent = data.desc;
    if (pduEl) pduEl.textContent = data.pdu;
    if (hwEl) hwEl.textContent = data.hw;
    if (protoEl) protoEl.textContent = data.proto;
  }

  /* =====================================================================
     TUTORÍA 1: TOPOLOGY VISUALIZER
     ===================================================================== */
  var topoData = {
    estrella: {
      title: `Topología en Estrella`,
      badge: `Estándar LAN Moderno`,
      def: `Todos los computadores y terminales autónomos se conectan de manera directa e independiente a un conmutador central (Switch) mediante enlaces punto a punto.`,
      pros: `Aislamiento total de fallos: si un cable o terminal se desconecta, el resto de la red sigue operativa. Fácil administración y adición de nuevos equipos sin detener la red.`,
      cons: `Requiere mayor cantidad de cableado UTP que la topología bus. El switch central representa el punto neurálgico de la infraestructura.`,
      spof: `El conmutador central (Switch 2960). Si este falla, todas las terminales quedan desconectadas.`
    },
    bus: {
      title: `Topología en Bus`,
      badge: `Legada / Coaxial`,
      def: `Diseño lineal donde todos los equipos comparten un único cable central (backbone) que requiere terminadores resistivos en ambos extremos para absorber rebotes de señal.`,
      pros: `Uso mínimo de cableado; fácil de tender en espacios reducidos y de muy bajo costo de instalación inicial.`,
      cons: `Punto único de fallo catastrófico (SPOF): si el cable central se rompe en cualquier punto, toda la red colapsa. Difícil detección de averías y alta probabilidad de colisiones de datos.`,
      spof: `El cable principal troncal (Backbone). Cualquier daño físico detiene toda comunicación.`
    },
    anillo: {
      title: `Topología en Anillo`,
      badge: `Bucle Cerrado`,
      def: `Cada terminal se conecta directamente con el host anterior y el siguiente formando un circuito o bucle cerrado unidireccional (como Token Ring).`,
      pros: `Acceso ordenado al medio; el rendimiento es predecible incluso con alta carga porque las tramas siguen una secuencia fija de paso de testigo.`,
      cons: `Si un solo nodo intermedio o cable se desconecta, se interrumpe el anillo completo, provocando la caída de toda la red.`,
      spof: `Cualquiera de los enlaces o estaciones activas si no se implementa un doble anillo de respaldo.`
    },
    malla: {
      title: `Topología en Malla (Mesh)`,
      badge: `Máxima Tolerancia a Fallos`,
      def: `Cada nodo tiene conexiones directas y dedicadas con todos los demás dispositivos de la red, garantizando redundancia completa de rutas.`,
      pros: `Absoluta tolerancia a averías. Si un enlace falla, el tráfico se encamina de inmediato por cualquiera de las rutas alternativas sin interrupción.`,
      cons: `Costo elevado y complejidad exponencial de cableado. Requiere una fórmula de n(n-1)/2 enlaces físicos y múltiples tarjetas de red por equipo.`,
      spof: `Ninguno a nivel de enlaces; redundancia distribuida total.`
    },
    arbol: {
      title: `Topología en Árbol (Jerárquica)`,
      badge: `Diseño Cisco Empresarial`,
      def: `Estructura en cascada o estrellas extendidas con jerarquía por capas: un switch raíz (Núcleo/Core) interconecta switches de Distribución, y estos a su vez switches de Acceso con hosts.`,
      pros: `Altamente escalable y modular. Facilita la división en subredes y VLANs departamentales, simplifica el diagnóstico y optimiza el ancho de banda.`,
      cons: `Si el switch raíz del nivel superior falla, se pierde la interconexión entre las diferentes ramas o departamentos secundarios.`,
      spof: `El switch raíz (Core Switch). Por eso se mitiga duplicándolo con protocolos de redundancia como HSRP y STP.`
    }
  };

  function setTopology(type) {
    if (!topoData[type]) type = 'estrella';
    appState.activeTopo = type;

    // Update buttons
    var btnsContainer = document.getElementById('topo-btns');
    if (btnsContainer) {
      var btns = btnsContainer.getElementsByTagName('button');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
      }
    }

    // Update panel
    var info = topoData[type];
    var titleEl = document.getElementById('topo-title');
    var badgeEl = document.getElementById('topo-badge');
    var defEl = document.getElementById('topo-def');
    var prosEl = document.getElementById('topo-pros');
    var consEl = document.getElementById('topo-cons');
    var spofEl = document.getElementById('topo-spof');

    if (titleEl) titleEl.textContent = info.title;
    if (badgeEl) badgeEl.textContent = info.badge;
    if (defEl) defEl.textContent = info.def;
    if (prosEl) prosEl.textContent = info.pros;
    if (consEl) consEl.textContent = info.cons;
    if (spofEl) spofEl.textContent = info.spof;

    // Render SVG
    renderTopologySVG(type);
    saveAppState();
  }

  function renderTopologySVG(type) {
    var svg = document.getElementById('topo-svg');
    if (!svg) return;

    var s = '';
    if (type === 'estrella') {
      // Switch central in (250, 160)
      s += `
        <!-- Links -->
        <line x1="250" y1="160" x2="110" y2="80" stroke="var(--primary)" stroke-width="2" />
        <line x1="250" y1="160" x2="390" y2="80" stroke="var(--primary)" stroke-width="2" />
        <line x1="250" y1="160" x2="90" y2="240" stroke="var(--primary)" stroke-width="2" />
        <line x1="250" y1="160" x2="410" y2="240" stroke="var(--primary)" stroke-width="2" />
        <line x1="250" y1="160" x2="250" y2="280" stroke="var(--primary)" stroke-width="2" />
        
        <!-- Central Switch -->
        <rect x="215" y="140" width="70" height="40" fill="var(--on-surface)" stroke="var(--primary)" stroke-width="2" rx="2"/>
        <text x="250" y="165" font-family="var(--font-label)" font-size="11" fill="#ffffff" text-anchor="middle" font-weight="600">SWITCH</text>
        
        <!-- Nodes -->
        <circle cx="110" cy="80" r="22" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="110" y="84" font-family="var(--font-label)" font-size="10" fill="var(--on-surface)" text-anchor="middle">PC-0</text>
        
        <circle cx="390" cy="80" r="22" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="390" y="84" font-family="var(--font-label)" font-size="10" fill="var(--on-surface)" text-anchor="middle">PC-1</text>
        
        <circle cx="90" cy="240" r="22" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="90" y="244" font-family="var(--font-label)" font-size="10" fill="var(--on-surface)" text-anchor="middle">PC-2</text>
        
        <circle cx="410" cy="240" r="22" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="410" y="244" font-family="var(--font-label)" font-size="10" fill="var(--on-surface)" text-anchor="middle">PC-3</text>
        
        <circle cx="250" cy="280" r="22" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="250" y="284" font-family="var(--font-label)" font-size="10" fill="var(--on-surface)" text-anchor="middle">PC-4</text>
      `;
    } else if (type === 'bus') {
      s += `
        <!-- Backbone trunk cable -->
        <line x1="60" y1="160" x2="440" y2="160" stroke="var(--on-surface)" stroke-width="6" />
        
        <!-- Terminators -->
        <rect x="50" y="145" width="10" height="30" fill="var(--error)" stroke="var(--on-surface)" stroke-width="1"/>
        <text x="55" y="140" font-family="var(--font-label)" font-size="9" fill="var(--error)" text-anchor="middle">TERM</text>
        
        <rect x="440" y="145" width="10" height="30" fill="var(--error)" stroke="var(--on-surface)" stroke-width="1"/>
        <text x="445" y="140" font-family="var(--font-label)" font-size="9" fill="var(--error)" text-anchor="middle">TERM</text>
        
        <!-- Drop lines -->
        <line x1="120" y1="160" x2="120" y2="90" stroke="var(--primary)" stroke-width="2" />
        <line x1="200" y1="160" x2="200" y2="230" stroke="var(--primary)" stroke-width="2" />
        <line x1="290" y1="160" x2="290" y2="90" stroke="var(--primary)" stroke-width="2" />
        <line x1="380" y1="160" x2="380" y2="230" stroke="var(--primary)" stroke-width="2" />
        
        <!-- T-connectors -->
        <circle cx="120" cy="160" r="5" fill="var(--primary)"/>
        <circle cx="200" cy="160" r="5" fill="var(--primary)"/>
        <circle cx="290" cy="160" r="5" fill="var(--primary)"/>
        <circle cx="380" cy="160" r="5" fill="var(--primary)"/>
        
        <!-- Nodes -->
        <circle cx="120" cy="70" r="20" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="120" y="74" font-family="var(--font-label)" font-size="9" text-anchor="middle">HOST-A</text>
        
        <circle cx="200" cy="250" r="20" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="200" y="254" font-family="var(--font-label)" font-size="9" text-anchor="middle">HOST-B</text>
        
        <circle cx="290" cy="70" r="20" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="290" y="74" font-family="var(--font-label)" font-size="9" text-anchor="middle">HOST-C</text>
        
        <circle cx="380" cy="250" r="20" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="380" y="254" font-family="var(--font-label)" font-size="9" text-anchor="middle">HOST-D</text>
      `;
    } else if (type === 'anillo') {
      s += `
        <!-- Circular Loop -->
        <circle cx="250" cy="160" r="100" fill="none" stroke="var(--primary)" stroke-width="3" stroke-dasharray="6,4" />
        
        <!-- Nodes on circle -->
        <!-- Node 1: Top (250, 60) -->
        <circle cx="250" cy="60" r="22" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="250" y="64" font-family="var(--font-label)" font-size="10" text-anchor="middle">Nodo 1</text>
        
        <!-- Node 2: Right (350, 160) -->
        <circle cx="350" cy="160" r="22" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="350" y="164" font-family="var(--font-label)" font-size="10" text-anchor="middle">Nodo 2</text>
        
        <!-- Node 3: Bottom (250, 260) -->
        <circle cx="250" cy="260" r="22" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="250" y="264" font-family="var(--font-label)" font-size="10" text-anchor="middle">Nodo 3</text>
        
        <!-- Node 4: Left (150, 160) -->
        <circle cx="150" cy="160" r="22" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="150" y="164" font-family="var(--font-label)" font-size="10" text-anchor="middle">Nodo 4</text>
        
        <!-- Center label -->
        <text x="250" y="165" font-family="var(--font-label)" font-size="11" fill="var(--secondary)" text-anchor="middle">Token Ring</text>
      `;
    } else if (type === 'malla') {
      var pts = [
        { x: 160, y: 80, name: `N1` },
        { x: 340, y: 80, name: `N2` },
        { x: 410, y: 210, name: `N3` },
        { x: 250, y: 280, name: `N4` },
        { x: 90, y: 210, name: `N5` }
      ];
      // Draw lines between all pairs
      for (var p1 = 0; p1 < pts.length; p1++) {
        for (var p2 = p1 + 1; p2 < pts.length; p2++) {
          s += `<line x1="${pts[p1].x}" y1="${pts[p1].y}" x2="${pts[p2].x}" y2="${pts[p2].y}" stroke="var(--primary)" stroke-width="1.5" stroke-opacity="0.6"/>`;
        }
      }
      // Draw nodes
      for (var k = 0; k < pts.length; k++) {
        s += `
          <circle cx="${pts[k].x}" cy="${pts[k].y}" r="20" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
          <text x="${pts[k].x}" y="${pts[k].y + 4}" font-family="var(--font-label)" font-size="10" text-anchor="middle" font-weight="600">${pts[k].name}</text>
        `;
      }
    } else if (type === 'arbol') {
      s += `
        <!-- Core Switch (Root) -->
        <rect x="205" y="40" width="90" height="34" fill="var(--on-surface)" stroke="var(--primary)" stroke-width="2"/>
        <text x="250" y="62" font-family="var(--font-label)" font-size="10" fill="#fff" text-anchor="middle" font-weight="600">CORE ROOT</text>
        
        <!-- Branches to Distribution Switches -->
        <line x1="225" y1="74" x2="140" y2="135" stroke="var(--primary)" stroke-width="2"/>
        <line x1="275" y1="74" x2="360" y2="135" stroke="var(--primary)" stroke-width="2"/>
        
        <!-- Distribution Switch 1 -->
        <rect x="95" y="135" width="90" height="30" fill="var(--surface-container-high)" stroke="var(--outline)" stroke-width="2"/>
        <text x="140" y="154" font-family="var(--font-label)" font-size="9" text-anchor="middle">DIST-SW1</text>
        
        <!-- Distribution Switch 2 -->
        <rect x="315" y="135" width="90" height="30" fill="var(--surface-container-high)" stroke="var(--outline)" stroke-width="2"/>
        <text x="360" y="154" font-family="var(--font-label)" font-size="9" text-anchor="middle">DIST-SW2</text>
        
        <!-- Links to Access Hosts -->
        <line x1="120" y1="165" x2="80" y2="230" stroke="var(--outline)" stroke-width="1.5"/>
        <line x1="160" y1="165" x2="160" y2="230" stroke="var(--outline)" stroke-width="1.5"/>
        <line x1="340" y1="165" x2="330" y2="230" stroke="var(--outline)" stroke-width="1.5"/>
        <line x1="380" y1="165" x2="410" y2="230" stroke="var(--outline)" stroke-width="1.5"/>
        
        <!-- Hosts -->
        <circle cx="80" cy="245" r="16" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="80" y="249" font-family="var(--font-label)" font-size="8" text-anchor="middle">PC1</text>
        
        <circle cx="160" cy="245" r="16" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="160" y="249" font-family="var(--font-label)" font-size="8" text-anchor="middle">PC2</text>
        
        <circle cx="330" cy="245" r="16" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="330" y="249" font-family="var(--font-label)" font-size="8" text-anchor="middle">PC3</text>
        
        <circle cx="410" cy="245" r="16" fill="var(--background)" stroke="var(--on-surface)" stroke-width="2"/>
        <text x="410" y="249" font-family="var(--font-label)" font-size="8" text-anchor="middle">PC4</text>
      `;
    }
    svg.innerHTML = s;
  }

  /* =====================================================================
     TUTORÍA 2: IP ADDRESSING & PING SIMULATION
     ===================================================================== */
  var ipDataRows = [
    { dept: `admin`, deptName: `Administración`, dev: `PC0`, iface: `FastEthernet0`, ip: `192.168.10.10`, mask: `255.255.255.0`, gw: `192.168.10.1`, role: `Terminal Host` },
    { dept: `admin`, deptName: `Administración`, dev: `PC1`, iface: `FastEthernet0`, ip: `192.168.10.11`, mask: `255.255.255.0`, gw: `192.168.10.1`, role: `Terminal Host` },
    { dept: `admin`, deptName: `Administración`, dev: `PC2`, iface: `FastEthernet0`, ip: `192.168.10.12`, mask: `255.255.255.0`, gw: `192.168.10.1`, role: `Terminal Host` },
    { dept: `admin`, deptName: `Administración`, dev: `PC3`, iface: `FastEthernet0`, ip: `192.168.10.13`, mask: `255.255.255.0`, gw: `192.168.10.1`, role: `Terminal Host` },
    { dept: `ventas`, deptName: `Ventas`, dev: `PC2 (Ventas)`, iface: `FastEthernet0`, ip: `192.168.20.10`, mask: `255.255.255.0`, gw: `192.168.20.1`, role: `Terminal Host` },
    { dept: `ventas`, deptName: `Ventas`, dev: `PC3 (Ventas)`, iface: `FastEthernet0`, ip: `192.168.20.11`, mask: `255.255.255.0`, gw: `192.168.20.1`, role: `Terminal Host` },
    { dept: `soporte`, deptName: `Soporte Técnico`, dev: `PC4`, iface: `FastEthernet0`, ip: `192.168.10.30`, mask: `255.255.255.0`, gw: `192.168.10.1`, role: `Host Especial` },
    { dept: `soporte`, deptName: `Soporte Técnico`, dev: `PC5`, iface: `FastEthernet0`, ip: `192.168.10.31`, mask: `255.255.255.0`, gw: `192.168.10.1`, role: `Host Especial` },
    { dept: `router`, deptName: `Router Cisco 1941`, dev: `Router0`, iface: `GigabitEthernet0/0`, ip: `192.168.10.1`, mask: `255.255.255.0`, gw: `N/A (Es la Puerta)`, role: `Gateway Admin` },
    { dept: `router`, deptName: `Router Cisco 1941`, dev: `Router0`, iface: `GigabitEthernet0/1`, ip: `192.168.20.1`, mask: `255.255.255.0`, gw: `N/A (Es la Puerta)`, role: `Gateway Ventas` }
  ];

  function renderIPTable(filter) {
    var tbody = document.getElementById('ip-table-body');
    if (!tbody) return;

    var filtered = ipDataRows;
    if (filter && filter !== 'all') {
      filtered = ipDataRows.filter(function(r) { return r.dept === filter; });
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var row = filtered[i];
      var badgeClass = 'neutral';
      if (row.dept === 'admin') badgeClass = '';
      else if (row.dept === 'ventas') badgeClass = 'amber';
      else if (row.dept === 'router') badgeClass = 'green';

      html += `
        <tr>
          <td><span class="tag ${badgeClass}">${row.deptName}</span></td>
          <td><strong>${row.dev}</strong></td>
          <td class="mono-cell">${row.iface}</td>
          <td class="mono-cell" style="font-weight:600;">${row.ip}</td>
          <td class="mono-cell">${row.mask}</td>
          <td class="mono-cell" style="color:var(--primary); font-weight:600;">${row.gw}</td>
          <td><span style="font-size:0.75rem; color:var(--on-surface-variant);">${row.role}</span></td>
        </tr>
      `;
    }
    tbody.innerHTML = html;
  }

  function filterDeptTable(dept) {
    var container = document.getElementById('dept-filter-btns');
    if (container) {
      var btns = container.getElementsByTagName('button');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
      }
    }
    // Highlight clicked button
    var eventTarget = window.event ? window.event.target : null;
    if (eventTarget) eventTarget.classList.add('active');

    renderIPTable(dept);
  }

  /* Ping Simulation Logic */
  function runPingSimulation() {
    var sourceEl = document.getElementById('sim-source-pc');
    var targetEl = document.getElementById('sim-target-pc');
    var gwStatusEl = document.getElementById('sim-gw-status');
    var term = document.getElementById('ping-terminal-output');
    if (!sourceEl || !targetEl || !gwStatusEl || !term) return;

    var src = sourceEl.value;
    var dst = targetEl.value;
    var gw = gwStatusEl.value;

    // IP lookup
    var ipMap = {
      'PC0': { ip: '192.168.10.10', net: '192.168.10.0', gw: '192.168.10.1', dept: 'Administración' },
      'PC1': { ip: '192.168.10.11', net: '192.168.10.0', gw: '192.168.10.1', dept: 'Administración' },
      'PC2': { ip: '192.168.20.10', net: '192.168.20.0', gw: '192.168.20.1', dept: 'Ventas' },
      'PC3': { ip: '192.168.20.11', net: '192.168.20.0', gw: '192.168.20.1', dept: 'Ventas' },
      'PC4': { ip: '192.168.10.30', net: '192.168.10.0', gw: '192.168.10.1', dept: 'Soporte' }
    };

    var srcObj = ipMap[src];
    var dstObj = ipMap[dst];
    var isSameNet = (srcObj.net === dstObj.net);

    var text = `Packet Tracer PC Command Line 1.0\n`;
    text += `C:\\> ping ${dstObj.ip}\n\n`;
    text += `Pinging ${dstObj.ip} with 32 bytes of data:\n\n`;

    if (src === dst) {
      text += `Reply from ${dstObj.ip}: bytes=32 time<1ms TTL=128\n`;
      text += `Reply from ${dstObj.ip}: bytes=32 time<1ms TTL=128\n`;
      text += `Reply from ${dstObj.ip}: bytes=32 time<1ms TTL=128\n`;
      text += `Reply from ${dstObj.ip}: bytes=32 time<1ms TTL=128\n\n`;
      text += `Ping statistics for ${dstObj.ip}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)\n\n`;
      text += `DIAGNÓSTICO: Prueba de Loopback local exitosa en el mismo host.`;
    } else if (isSameNet) {
      // Same subnet: Always works, Gateway is NOT needed!
      text += `Reply from ${dstObj.ip}: bytes=32 time<1ms TTL=128\n`;
      text += `Reply from ${dstObj.ip}: bytes=32 time<1ms TTL=128\n`;
      text += `Reply from ${dstObj.ip}: bytes=32 time<1ms TTL=128\n`;
      text += `Reply from ${dstObj.ip}: bytes=32 time<1ms TTL=128\n\n`;
      text += `Ping statistics for ${dstObj.ip}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)\n\n`;
      text += `DIAGNÓSTICO TÉCNICO (LABORATORIO):\n`;
      text += `¡ÉXITO LOCAL! ${src} y ${dst} pertenecen a la misma subred (${srcObj.net}/24).\n`;
      text += `La comunicación ocurre a nivel de Capa 2 a través del Switch mediante direcciones MAC.\n`;
      text += `No se necesita Router ni Gateway para este tráfico.`;
    } else {
      // Cross-subnet: Gateway is essential!
      if (gw === 'valid') {
        text += `Reply from ${dstObj.ip}: bytes=32 time=2ms TTL=127\n`;
        text += `Reply from ${dstObj.ip}: bytes=32 time=1ms TTL=127\n`;
        text += `Reply from ${dstObj.ip}: bytes=32 time=1ms TTL=127\n`;
        text += `Reply from ${dstObj.ip}: bytes=32 time=1ms TTL=127\n\n`;
        text += `Ping statistics for ${dstObj.ip}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)\n\n`;
        text += `DIAGNÓSTICO TÉCNICO (LABORATORIO):\n`;
        text += `¡ÉXITO INTER-SUBRED! El paquete salió de ${src} hacia el Gateway (${srcObj.gw}),\n`;
        text += `el Router Cisco 1941 consultó su tabla de enrutamiento y reenvió la trama por\n`;
        text += `la interfaz hacia la red de destino (${dstObj.net}) alcanzando a ${dst}.`;
      } else if (gw === 'wrong') {
        text += `Request timed out.\n`;
        text += `Request timed out.\n`;
        text += `Request timed out.\n`;
        text += `Request timed out.\n\n`;
        text += `Ping statistics for ${dstObj.ip}:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)\n\n`;
        text += `FALLO DE LABORATORIO (GATEWAY INCORRECTO):\n`;
        text += `El host ${src} sabe que ${dstObj.ip} está fuera de su subred local,\n`;
        text += `pero la puerta de enlace configurada no responde o no existe.\n`;
        text += `El tráfico interdepartamental queda completamente bloqueado.`;
      } else {
        text += `Destination host unreachable.\n`;
        text += `Destination host unreachable.\n`;
        text += `Destination host unreachable.\n`;
        text += `Destination host unreachable.\n\n`;
        text += `Ping statistics for ${dstObj.ip}:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)\n\n`;
        text += `FALLO DE LABORATORIO (SIN GATEWAY):\n`;
        text += `El host ${src} no tiene puerta de salida predeterminada.\n`;
        text += `El stack TCP/IP descarta los paquetes inmediatamente porque no sabe por dónde salir.`;
      }
    }

    term.textContent = text;
  }

  /* Quiz Checking Logic */
  function checkQuizAnswer(qNum, selected, correct) {
    var feedbackEl = document.getElementById('q-feedback-' + qNum);
    var cardEl = document.getElementById('q-card-' + qNum);
    if (!feedbackEl || !cardEl) return;

    appState.t2QuizAnswers[qNum] = selected;

    var explanations = {
      1: `Exacto: Dentro de la misma subred local (LAN), la comunicación es directa en Capa 2 (Switch). No se requiere ningún router.`,
      2: `Correcto: El Default Gateway es la IP activa del puerto del router que permite a los hosts comunicarse fuera de su subred local.`,
      3: `Correcto: Si el Gateway es erróneo, la comunicación local funciona pero se pierde todo acceso a subredes externas como Ventas o Internet.`,
      4: `Correcto: La IP de red identifica al grupo de hosts (/24) y no se asigna; el Gateway es una interfaz de hardware real con IP utilizable.`
    };

    if (selected === correct) {
      feedbackEl.className = 'quiz-feedback correct';
      feedbackEl.textContent = '¡Correcto! ' + explanations[qNum];
      cardEl.style.borderLeftColor = 'var(--positive)';
    } else {
      feedbackEl.className = 'quiz-feedback incorrect';
      feedbackEl.textContent = 'Incorrecto. Revisa los conceptos del laboratorio: ' + explanations[qNum];
      cardEl.style.borderLeftColor = 'var(--error)';
    }

    // Update score counter
    var answeredCount = Object.keys(appState.t2QuizAnswers).length;
    var scoreEl = document.getElementById('quiz-t2-score');
    if (scoreEl) scoreEl.textContent = `${answeredCount} / 4 Respondidas`;

    saveAppState();
  }

  /* =====================================================================
     TUTORÍA 3: STP SIMULATOR & CISCO CLI
     ===================================================================== */
  function updateSTPState() {
    var s1Sel = document.getElementById('s1-priority');
    var s2Sel = document.getElementById('s2-priority');
    var s3Sel = document.getElementById('s3-priority');

    var p1 = s1Sel ? parseInt(s1Sel.value, 10) : 32768;
    var p2 = s2Sel ? parseInt(s2Sel.value, 10) : 32768;
    var p3 = s3Sel ? parseInt(s3Sel.value, 10) : 32768;

    appState.s1Priority = String(p1);
    appState.s2Priority = String(p2);
    appState.s3Priority = String(p3);

    var switches = [
      { id: 'S1', name: 'Switch 1', priority: p1, mac: '0001.42A1.1111' },
      { id: 'S2', name: 'Switch 2', priority: p2, mac: '0001.42A1.2222' },
      { id: 'S3', name: 'Switch 3', priority: p3, mac: '0001.42A1.3333' }
    ];

    // Determine Root Bridge: lowest priority, then lowest MAC
    switches.sort(function(a, b) {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.mac.localeCompare(b.mac);
    });

    var root = switches[0];

    // Update badges
    var b1 = document.getElementById('s1-badge');
    var b2 = document.getElementById('s2-badge');
    var b3 = document.getElementById('s3-badge');

    if (b1) {
      if (root.id === 'S1') {
        b1.className = 'tag green';
        b1.textContent = 'ROOT BRIDGE';
      } else {
        b1.className = 'tag neutral';
        b1.textContent = 'Esclavo (Non-Root)';
      }
    }
    if (b2) {
      if (root.id === 'S2') {
        b2.className = 'tag green';
        b2.textContent = 'ROOT BRIDGE';
      } else {
        b2.className = 'tag neutral';
        b2.textContent = 'Esclavo (Non-Root)';
      }
    }
    if (b3) {
      if (root.id === 'S3') {
        b3.className = 'tag green';
        b3.textContent = 'ROOT BRIDGE';
      } else {
        b3.className = 'tag neutral';
        b3.textContent = 'Esclavo (Non-Root)';
      }
    }

    // Explanation text
    var expEl = document.getElementById('stp-explanation');
    if (expEl) {
      var reason = (p1 === p2 && p2 === p3) 
        ? `Todas las prioridades son iguales (${p1}). El Root Bridge se seleccionó por MENOR DIRECCIÓN MAC (${root.mac}).`
        : `El Root Bridge es ${root.name} por tener la MENOR PRIORIDAD (${root.priority}) de la topología.`;
      expEl.textContent = reason;
    }

    // Render Canvas
    renderSTPCanvas(root.id);
    saveAppState();
  }

  function renderSTPCanvas(rootId) {
    var svg = document.getElementById('stp-svg-canvas');
    if (!svg) return;

    // S1: Top (250, 60), S2: Bottom-Left (120, 240), S3: Bottom-Right (380, 240)
    var isS1Root = (rootId === 'S1');
    var isS2Root = (rootId === 'S2');
    var isS3Root = (rootId === 'S3');

    // Blocked port determination:
    // If S1 is root: loop between S2 and S3 is blocked at S3's port to S2
    // If S3 is root: loop between S1 and S2 is blocked at S2's port to S1
    // If S2 is root: loop between S1 and S3 is blocked at S3's port to S1
    var blockedLink = 'S2-S3';
    var blockedNode = 'S3';
    if (isS3Root) {
      blockedLink = 'S1-S2';
      blockedNode = 'S2';
    } else if (isS2Root) {
      blockedLink = 'S1-S3';
      blockedNode = 'S3';
    }

    var s = `
      <!-- Links -->
      <!-- Link S1 to S2 -->
      <line x1="230" y1="85" x2="140" y2="220" stroke="${blockedLink === 'S1-S2' ? 'var(--outline)' : 'var(--port-forward)'}" stroke-width="${blockedLink === 'S1-S2' ? '2' : '3'}" stroke-dasharray="${blockedLink === 'S1-S2' ? '4,4' : 'none'}"/>
      
      <!-- Link S1 to S3 -->
      <line x1="270" y1="85" x2="360" y2="220" stroke="${blockedLink === 'S1-S3' ? 'var(--outline)' : 'var(--port-forward)'}" stroke-width="${blockedLink === 'S1-S3' ? '2' : '3'}" stroke-dasharray="${blockedLink === 'S1-S3' ? '4,4' : 'none'}"/>
      
      <!-- Link S2 to S3 -->
      <line x1="165" y1="240" x2="335" y2="240" stroke="${blockedLink === 'S2-S3' ? 'var(--outline)' : 'var(--port-forward)'}" stroke-width="${blockedLink === 'S2-S3' ? '2' : '3'}" stroke-dasharray="${blockedLink === 'S2-S3' ? '4,4' : 'none'}"/>
      
      <!-- Port State Dots -->
      <!-- Link S1-S2 dots -->
      <circle cx="215" cy="110" r="6" fill="${blockedLink === 'S1-S2' && blockedNode === 'S1' ? 'var(--port-blocked)' : 'var(--port-forward)'}" stroke="#fff" stroke-width="1"/>
      <circle cx="155" cy="195" r="6" fill="${blockedLink === 'S1-S2' && blockedNode === 'S2' ? 'var(--port-blocked)' : 'var(--port-forward)'}" stroke="#fff" stroke-width="1"/>
      
      <!-- Link S1-S3 dots -->
      <circle cx="285" cy="110" r="6" fill="${blockedLink === 'S1-S3' && blockedNode === 'S1' ? 'var(--port-blocked)' : 'var(--port-forward)'}" stroke="#fff" stroke-width="1"/>
      <circle cx="345" cy="195" r="6" fill="${blockedLink === 'S1-S3' && blockedNode === 'S3' ? 'var(--port-blocked)' : 'var(--port-forward)'}" stroke="#fff" stroke-width="1"/>
      
      <!-- Link S2-S3 dots -->
      <circle cx="190" cy="240" r="6" fill="${blockedLink === 'S2-S3' && blockedNode === 'S2' ? 'var(--port-blocked)' : 'var(--port-forward)'}" stroke="#fff" stroke-width="1"/>
      <circle cx="310" cy="240" r="6" fill="${blockedLink === 'S2-S3' && blockedNode === 'S3' ? 'var(--port-blocked)' : 'var(--port-forward)'}" stroke="#fff" stroke-width="1"/>
      
      <!-- S1 Box -->
      <rect x="200" y="35" width="100" height="48" fill="${isS1Root ? 'var(--primary)' : 'var(--surface-container-high)'}" stroke="var(--outline)" stroke-width="2" rx="2"/>
      <text x="250" y="56" font-family="var(--font-label)" font-size="11" fill="${isS1Root ? '#fff' : 'var(--on-surface)'}" text-anchor="middle" font-weight="700">SWITCH 1</text>
      <text x="250" y="72" font-family="var(--font-label)" font-size="8" fill="${isS1Root ? '#fff' : 'var(--on-surface-variant)'}" text-anchor="middle">${isS1Root ? '★ ROOT BRIDGE' : 'NON-ROOT'}</text>
      
      <!-- S2 Box -->
      <rect x="70" y="215" width="100" height="48" fill="${isS2Root ? 'var(--primary)' : 'var(--surface-container-high)'}" stroke="var(--outline)" stroke-width="2" rx="2"/>
      <text x="120" y="236" font-family="var(--font-label)" font-size="11" fill="${isS2Root ? '#fff' : 'var(--on-surface)'}" text-anchor="middle" font-weight="700">SWITCH 2</text>
      <text x="120" y="252" font-family="var(--font-label)" font-size="8" fill="${isS2Root ? '#fff' : 'var(--on-surface-variant)'}" text-anchor="middle">${isS2Root ? '★ ROOT BRIDGE' : 'NON-ROOT'}</text>
      
      <!-- S3 Box -->
      <rect x="330" y="215" width="100" height="48" fill="${isS3Root ? 'var(--primary)' : 'var(--surface-container-high)'}" stroke="var(--outline)" stroke-width="2" rx="2"/>
      <text x="380" y="236" font-family="var(--font-label)" font-size="11" fill="${isS3Root ? '#fff' : 'var(--on-surface)'}" text-anchor="middle" font-weight="700">SWITCH 3</text>
      <text x="380" y="252" font-family="var(--font-label)" font-size="8" fill="${isS3Root ? '#fff' : 'var(--on-surface-variant)'}" text-anchor="middle">${isS3Root ? '★ ROOT BRIDGE' : 'NON-ROOT'}</text>
      
      <!-- Blocked Port Indicator Label -->
      <text x="250" y="295" font-family="var(--font-label)" font-size="9" fill="var(--port-blocked)" text-anchor="middle" font-weight="600">● Puerto Bloqueado (Altn BLK): Evita Bucles y Tormentas</text>
    `;

    svg.innerHTML = s;
  }

  function forceS3AsRootBridge() {
    var s3Sel = document.getElementById('s3-priority');
    if (s3Sel) {
      s3Sel.value = '24576';
    }
    updateSTPState();

    // Also inject into CLI output
    runCLICommand('spanning-tree vlan 1 root primary');
  }

  function runCLICommand(cmd) {
    var cli = document.getElementById('stp-cli-output');
    if (!cli) return;

    if (cmd === 'clear') {
      cli.textContent = `Switch3# `;
      return;
    }

    var append = `\nSwitch3# ${cmd}\n`;
    if (cmd === 'show spanning-tree') {
      append += `VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    ${appState.s3Priority === '24576' ? '24577' : '32769'}
             Address     ${appState.s3Priority === '24576' ? '0001.42A1.3333' : '0001.42A1.1111'}
             ${appState.s3Priority === '24576' ? 'This bridge is the root' : 'Cost        19\n             Port        1 (FastEthernet0/1)'}
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    ${parseInt(appState.s3Priority, 10) + 1}  (priority ${appState.s3Priority} sys-id-ext 1)
             Address     0001.42A1.3333
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300

Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Fa0/1            ${appState.s3Priority === '24576' ? 'Desg FWD' : 'Root FWD'} 19        128.1    P2p
Fa0/2            ${appState.s3Priority === '24576' ? 'Desg FWD' : 'Altn BLK'} 19        128.2    P2p\n`;
    } else if (cmd === 'spanning-tree vlan 1 root primary') {
      append += `Switch3(config)# spanning-tree vlan 1 root primary
Switch3(config)# exit
%SYS-5-CONFIG_I: Configured from console by console
Prioridad ajustada automáticamente a 24576 (+1 VLAN = 24577).
Switch3 ahora ha ganado la elección y es el ROOT BRIDGE.\n`;
    } else if (cmd === 'show mac address-table') {
      append += `          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0001.42a1.1111    DYNAMIC     Fa0/1
   1    0001.42a1.2222    DYNAMIC     Fa0/2
Total Mac Addresses for this module: 2\n`;
    } else if (cmd === 'show ip interface brief') {
      append += `Interface              IP-Address      OK? Method Status                Protocol
FastEthernet0/1        unassigned      YES unset  up                    up
FastEthernet0/2        unassigned      YES unset  up                    up
Vlan1                  192.168.10.254  YES manual up                    up\n`;
    }

    cli.textContent += append;
    cli.scrollTop = cli.scrollHeight;
  }

  /* =====================================================================
     TUTORÍA 4: ROUTING TABLE INSPECTOR & FAILOVER
     ===================================================================== */
  var routesData = [
    { code: 'C', net: '192.168.1.0/24', metric: '0 / 0', hop: 'Directamente conectada', iface: 'FastEthernet0/0', type: 'Red LAN Local Directa' },
    { code: 'C', net: '192.168.70.0/24', metric: '0 / 0', hop: 'Directamente conectada', iface: 'FastEthernet0/1', type: 'Troncal Router Primario' },
    { code: 'C', net: '192.168.80.0/24', metric: '0 / 0', hop: 'Directamente conectada', iface: 'Serial0/0/0', type: 'Troncal Router Secundario' },
    { code: 'S', net: '192.168.4.0/24', metric: '1 / 0', hop: '192.168.70.2', iface: 'FastEthernet0/1', type: 'Ruta Estática Manual' },
    { code: 'S', net: '192.168.5.0/24', metric: '1 / 0', hop: '192.168.70.2', iface: 'FastEthernet0/1', type: 'Ruta Estática Manual' },
    { code: 'R', net: '192.168.6.0/24', metric: '120 / 1', hop: '192.168.70.2', iface: 'FastEthernet0/1', type: 'Dinámica RIPv2 (1 Salto)' },
    { code: 'R', net: '192.168.90.0/24', metric: '120 / 2', hop: '192.168.80.2', iface: 'Serial0/0/0', type: 'Dinámica RIPv2 (2 Saltos)' }
  ];

  function renderRoutingTable(filter) {
    var tbody = document.getElementById('routing-table-body');
    if (!tbody) return;

    var filtered = routesData;
    if (filter && filter !== 'all') {
      filtered = routesData.filter(function(r) { return r.code === filter; });
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var r = filtered[i];
      var badgeClass = 'neutral';
      if (r.code === 'C') badgeClass = 'green';
      else if (r.code === 'S') badgeClass = '';
      else if (r.code === 'R') badgeClass = 'amber';

      html += `
        <tr>
          <td><span class="tag ${badgeClass}"><strong>${r.code}</strong></span></td>
          <td class="mono-cell" style="font-weight:600;">${r.net}</td>
          <td class="mono-cell">[${r.metric}]</td>
          <td class="mono-cell">${r.hop}</td>
          <td class="mono-cell">${r.iface}</td>
          <td><span style="font-size:0.8125rem;">${r.type}</span></td>
        </tr>
      `;
    }
    tbody.innerHTML = html;
  }

  function filterRoutes(code) {
    var container = document.getElementById('route-filter-btns');
    if (container) {
      var btns = container.getElementsByTagName('button');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
      }
    }
    var eventTarget = window.event ? window.event.target : null;
    if (eventTarget) eventTarget.classList.add('active');

    renderRoutingTable(code);
  }

  function runFailoverSimulation() {
    var protoEl = document.getElementById('sim-failover-proto');
    var linkEl = document.getElementById('sim-failover-link');
    var tagEl = document.getElementById('failover-tag');
    var titleEl = document.getElementById('failover-title');
    var descEl = document.getElementById('failover-desc');
    var pathEl = document.getElementById('failover-path');

    if (!protoEl || !linkEl || !tagEl || !titleEl || !descEl || !pathEl) return;

    var proto = protoEl.value;
    var link = linkEl.value;

    if (link === 'up') {
      tagEl.className = 'tag green';
      tagEl.textContent = 'Enlace Activo';
      titleEl.textContent = 'Tráfico Fluido por Enlace Primario FastEthernet';
      descEl.textContent = 'El enlace 192.168.70.0/24 está operativo. El tráfico fluye normalmente con máxima velocidad y latencia mínima.';
      pathEl.textContent = 'Ruta Actual: R4 [Fa0/0] ---> [192.168.70.0/24] ---> R5 [Fa0/0] (Latencia: 1ms)';
    } else {
      // Link is DOWN
      if (proto === 'rip') {
        tagEl.className = 'tag amber';
        tagEl.textContent = 'Convergencia RIP';
        titleEl.textContent = '¡Redirección Automática por Enlace Serial de Respaldo!';
        descEl.textContent = 'El protocolo dinámico RIP detectó la pérdida de paquetes de actualización en el enlace primario y actualizó su tabla de enrutamiento para conmutar por la ruta secundaria (192.168.80.0/24).';
        pathEl.textContent = 'Ruta Actual de Respaldo: R4 [Se0/0/0] ---> [192.168.80.0/24] ---> R5 [Se0/0/0] (Métrica: 2 saltos)';
      } else {
        tagEl.className = 'tag red';
        tagEl.textContent = 'Ruta Inalcanzable';
        titleEl.textContent = '¡Caída Total del Tráfico! (Sin adaptabilidad)';
        descEl.textContent = 'Enrutamiento Estático simple: La tabla de rutas de R4 sigue apuntando fijamente al siguiente salto 192.168.70.2. Al estar cortado el enlace, los paquetes se descartan (Destination Unreachable) hasta que un administrador configure una nueva ruta manualmente.';
        pathEl.textContent = 'Ruta Fallida: R4 [Fa0/0] ---> [CABLE ROTO] X R5 (Pérdida de Paquetes: 100%)';
      }
    }
  }

  /* =====================================================================
     TUTORÍA 5: OSPF METRIC CALCULATOR & FINAL ASSESSMENT
     ===================================================================== */
  function calculateOSPFMetric() {
    var sel = document.getElementById('calc-iface-type');
    var costEl = document.getElementById('calc-cost-display');
    var expEl = document.getElementById('calc-cost-explanation');
    var ripEl = document.getElementById('calc-rip-comparison');
    if (!sel || !costEl || !expEl || !ripEl) return;

    var bw = parseFloat(sel.value);
    var refBw = 100000000; // 100 Mbps
    var cost = Math.max(1, Math.round(refBw / bw));

    costEl.textContent = String(cost);

    if (bw >= 100000000) {
      expEl.textContent = `Interfaces de 100 Mbps o superiores (Fast/Gigabit/10G) reciben un costo mínimo de 1. (En redes de 10G se suele ajustar el comando 'auto-cost reference-bandwidth' a 10000 para diferenciar Gigabit de 10G).`;
      ripEl.textContent = `RIP consideraría esta interfaz ultrarrápida exactamente igual a un enlace dial-up de 64 Kbps (1 salto). OSPF entiende la capacidad física.`;
    } else if (bw === 10000000) {
      expEl.textContent = `Ethernet estándar de 10 Mbps: 100,000,000 / 10,000,000 = Costo 10. OSPF preferirá 10 veces una interfaz FastEthernet.`;
      ripEl.textContent = `RIP no nota la diferencia de 10x en ancho de banda.`;
    } else if (bw === 1544000) {
      expEl.textContent = `Línea serial T1 tradicional (1.544 Mbps): 100,000,000 / 1,544,000 = Costo 64.`;
      ripEl.textContent = `Si hay una ruta de 2 saltos de 1 Gbps vs 1 salto de línea T1, RIP comete el grave error de elegir la lenta T1. OSPF elige correctamente la ruta de 1 Gbps (Costo 2 vs Costo 64).`;
    } else {
      expEl.textContent = `Línea lenta dial-up de 64 Kbps: 100,000,000 / 64,000 = Costo 1562.`;
      ripEl.textContent = `OSPF penaliza severamente el enlace lento debido a su enorme costo de 1562, protegiendo a las aplicaciones de retardos severos.`;
    }
  }

  /* Final Quiz Evaluation */
  function checkFinalQuiz(qNum, selected, correct) {
    var feedbackEl = document.getElementById('fq-feedback-' + qNum);
    var cardEl = document.getElementById('fq-card-' + qNum);
    if (!feedbackEl || !cardEl) return;

    appState.finalQuizAnswers[qNum] = selected;

    var explanations = {
      1: `Correcto: En una universidad en expansión a 5 años, la Escalabilidad mediante diseño modular jerárquico es la prioridad absoluta para no tener que rediseñar toda la red.`,
      2: `Correcto: OSPF calcula su árbol de rutas mediante el algoritmo Dijkstra evaluando el Costo en función del ancho de banda, ignorando el recuento ciego de saltos de RIP.`,
      3: `Correcto: El Área 0 Backbone es el núcleo troncal ineludible de OSPF; todas las demás áreas deben tener adyacencia a ella para garantizar el intercambio de rutas libre de bucles.`
    };

    if (selected === correct) {
      feedbackEl.className = 'quiz-feedback correct';
      feedbackEl.textContent = '¡Correcto! ' + explanations[qNum];
      cardEl.style.borderLeftColor = 'var(--positive)';
    } else {
      feedbackEl.className = 'quiz-feedback incorrect';
      feedbackEl.textContent = 'Incorrecto. ' + explanations[qNum];
      cardEl.style.borderLeftColor = 'var(--error)';
    }

    // Check if all 3 are correct
    var q1 = appState.finalQuizAnswers[1] === 'b';
    var q2 = appState.finalQuizAnswers[2] === 'a';
    var q3 = appState.finalQuizAnswers[3] === 'c';

    var certBox = document.getElementById('final-certificate-box');
    if (certBox) {
      if (q1 && q2 && q3) {
        certBox.style.display = 'block';
      }
    }

    saveAppState();
  }

  /* =====================================================================
     INITIALIZATION
     ===================================================================== */
  document.addEventListener('DOMContentLoaded', async function() {
    // 1. Render dynamic components
    renderOSIStack();
    selectOSILayer(7);
    renderTopologySVG('estrella');
    renderIPTable('all');
    runPingSimulation();
    updateSTPState();
    renderRoutingTable('all');
    calculateOSPFMetric();

    // 2. Initialize Lucide icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // 3. Load persisted state from notebookAppApi
    await loadAppState();

    // 4. Notify app is ready
    if (window.notebookAppApi && typeof window.notebookAppApi.notifyAppReady === 'function') {
      window.notebookAppApi.notifyAppReady();
    }
  });
