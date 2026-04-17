(function () {
  var THEME_KEY = "copilot-chat-sync.theme";
  var LAST_SESSION_KEY = "copilot-chat-sync.lastSessionId";
  var GROUP_BY_KEY = "copilot-chat-sync.groupBy";
  var WORKSPACE_LAYOUT_KEY = "copilot-chat-sync.workspaceViewMode";
  var SEARCH_KEY = "copilot-chat-sync.search";
  var params = new URLSearchParams(window.location.search);
  var root = document.documentElement;
  var prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function getParam(name) {
    var value = params.get(name);
    return value === null ? '' : value;
  }

  function safeGet(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // ignore
    }
  }

  function parseEntries() {
    var el = document.getElementById('copilot-chat-index-data');
    if (!el) {
      return [];
    }

    try {
      var parsed = JSON.parse(el.textContent || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  var entries = parseEntries();
  var entriesById = new Map(entries.map(function (entry) { return [entry.sessionId, entry]; }));
  var initialTheme = getParam('theme');
  var initialGroupBy = getParam('groupBy');
  var initialWorkspaceViewMode = getParam('workspaceViewMode');
  var initialSearch = getParam('search');
  var initialSessionId = getParam('sessionId');
  var state = {
    theme: initialTheme === 'light' || initialTheme === 'dark' || initialTheme === 'auto'
      ? initialTheme
      : safeGet(THEME_KEY, 'auto'),
    groupBy: initialGroupBy === 'date'
      ? 'date'
      : initialGroupBy === 'workspace'
        ? 'workspace'
        : safeGet(GROUP_BY_KEY, 'workspace') === 'date'
          ? 'date'
          : 'workspace',
    workspaceViewMode: initialWorkspaceViewMode === 'byDate'
      ? 'byDate'
      : initialWorkspaceViewMode === 'flat'
        ? 'flat'
        : safeGet(WORKSPACE_LAYOUT_KEY, 'flat') === 'byDate'
          ? 'byDate'
          : 'flat',
    search: initialSearch || safeGet(SEARCH_KEY, ''),
    selectedSessionId: '',
  };

  var sessionList = document.getElementById('session-list');
  var searchInput = document.getElementById('session-search');
  var detailFrame = document.getElementById('session-detail-frame');
  var sessionTitle = document.getElementById('selected-session-title');
  var sessionMeta = document.getElementById('selected-session-meta');
  var markdownLink = document.getElementById('selected-markdown-link');
  var standaloneLink = document.getElementById('open-standalone-link');
  var groupButtons = Array.prototype.slice.call(document.querySelectorAll('#group-by-control button'));
  var layoutButtons = Array.prototype.slice.call(document.querySelectorAll('#workspace-layout-control button'));
  var themeButtons = Array.prototype.slice.call(document.querySelectorAll('#theme-control button'));
  var workspaceLayoutBlock = document.getElementById('workspace-layout-block');

  function toSortTime(value) {
    var time = new Date(value || '').getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  function resolveThemeChoice(choice) {
    if (choice === 'light' || choice === 'dark') {
      return choice;
    }
    return prefersDark && prefersDark.matches ? 'dark' : 'light';
  }

  function applyTheme(choice, persist) {
    state.theme = choice === 'light' || choice === 'dark' ? choice : 'auto';
    if (persist) {
      safeSet(THEME_KEY, state.theme);
    }

    var resolved = resolveThemeChoice(state.theme);
    root.setAttribute('data-theme', resolved);

    themeButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.value === state.theme);
    });

    refreshDetailFrame();
  }

  function buildFrameSrc(entry) {
    var url = entry.detailPath + '?embedded=1&theme=' + encodeURIComponent(state.theme);
    return url;
  }

  function buildStandaloneHref(entry) {
    return entry.detailPath + '?theme=' + encodeURIComponent(state.theme);
  }

  function refreshDetailFrame() {
    if (!state.selectedSessionId) {
      return;
    }
    var entry = entriesById.get(state.selectedSessionId);
    if (!entry || !detailFrame) {
      return;
    }

    var src = buildFrameSrc(entry);
    if (detailFrame.getAttribute('src') !== src) {
      detailFrame.setAttribute('src', src);
    }

    if (standaloneLink) {
      standaloneLink.setAttribute('href', buildStandaloneHref(entry));
    }
  }

  function getLatestEntry() {
    if (entries.length === 0) {
      return null;
    }
    return entries.slice().sort(function (a, b) {
      return toSortTime(b.startTime) - toSortTime(a.startTime);
    })[0];
  }

  function getInitialSessionId() {
    if (initialSessionId && entriesById.has(initialSessionId)) {
      return initialSessionId;
    }

    var fromHash = (window.location.hash || '').replace(/^#/, '');
    if (fromHash && entriesById.has(fromHash)) {
      return fromHash;
    }

    var last = safeGet(LAST_SESSION_KEY, '');
    if (last && entriesById.has(last)) {
      return last;
    }

    var latest = getLatestEntry();
    return latest ? latest.sessionId : '';
  }

  function selectSession(sessionId, options) {
    var entry = entriesById.get(sessionId);
    if (!entry) {
      var fallback = getLatestEntry();
      if (!fallback) {
        return;
      }
      entry = fallback;
    }

    state.selectedSessionId = entry.sessionId;
    safeSet(LAST_SESSION_KEY, entry.sessionId);
    window.location.hash = entry.sessionId;

    if (sessionTitle) {
      sessionTitle.textContent = entry.title;
    }
    if (sessionMeta) {
      sessionMeta.textContent = entry.workspaceName + ' · ' + new Date(entry.startTime).toLocaleString('zh-CN', {
        timeZone: "Asia/Shanghai",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' · ' + entry.messageCount + ' messages';
    }
    if (markdownLink) {
      markdownLink.setAttribute('href', entry.markdownPath);
    }
    if (standaloneLink) {
      standaloneLink.setAttribute('href', buildStandaloneHref(entry));
    }
    refreshDetailFrame();
    renderSessionList();
  }

  function normalizeText(value) {
    return (value || '').toLowerCase();
  }

  function getFilteredEntries() {
    var query = normalizeText(state.search).trim();
    if (!query) {
      return entries.slice();
    }

    return entries.filter(function (entry) {
      return [entry.title, entry.workspaceName, entry.previewText, entry.dateKey]
        .map(normalizeText)
        .some(function (value) { return value.indexOf(query) >= 0; });
    });
  }

  function createGroupCard(label, count, children, depth) {
    var card = document.createElement('section');
    card.className = 'group-card';

    var details = document.createElement('details');
    details.open = true;

    var summary = document.createElement('summary');
    summary.innerHTML = '<span class="group-title-line"><span class="group-chevron" aria-hidden="true">▸</span><span class="group-label"></span></span><span class="group-count"></span>';
    var labelNode = summary.querySelector('.group-label');
    var countNode = summary.querySelector('.group-count');
    if (labelNode) {
      labelNode.textContent = label;
    }
    if (countNode) {
      countNode.textContent = count + ' sessions';
    }

    var childWrap = document.createElement('div');
    childWrap.className = 'group-children' + (depth > 0 ? ' nested' : '');
    children.forEach(function (child) { childWrap.appendChild(child); });

    details.appendChild(summary);
    details.appendChild(childWrap);
    card.appendChild(details);
    return card;
  }

  function createSessionRow(entry) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'session-row' + (entry.sessionId === state.selectedSessionId ? ' active' : '');
    button.innerHTML =
      '<div class="session-title-line">' +
        '<span class="session-title-text"></span>' +
        (entry.hasToolCalls ? '<span class="session-badge">tools ' + entry.toolCallCount + '</span>' : '') +
      '</div>' +
      '<div class="session-meta-line">' +
        '<span>' + entry.workspaceName + '</span>' +
        '<span>·</span>' +
        '<span>' + entry.dateKey + '</span>' +
        '<span>·</span>' +
        '<span>' + entry.messageCount + ' msgs</span>' +
      '</div>' +
      '<div class="session-preview"></div>';

    var titleNode = button.querySelector('.session-title-text');
    var previewNode = button.querySelector('.session-preview');
    if (titleNode) {
      titleNode.textContent = entry.title;
    }
    if (previewNode) {
      previewNode.textContent = entry.previewText;
    }

    button.addEventListener('click', function () {
      selectSession(entry.sessionId);
    });
    return button;
  }

  function sortEntriesDesc(list) {
    return list.slice().sort(function (a, b) {
      return toSortTime(b.startTime) - toSortTime(a.startTime);
    });
  }

  function renderByDate(entriesToRender) {
    var byDate = new Map();
    sortEntriesDesc(entriesToRender).forEach(function (entry) {
      if (!byDate.has(entry.dateKey)) {
        byDate.set(entry.dateKey, []);
      }
      byDate.get(entry.dateKey).push(entry);
    });

    return Array.from(byDate.entries())
      .sort(function (a, b) { return b[0].localeCompare(a[0]); })
      .map(function (pair) {
        var children = pair[1].map(createSessionRow);
        return createGroupCard(pair[0], pair[1].length, children, 0);
      });
  }

  function renderWorkspaceFlat(entriesToRender) {
    var byWorkspace = new Map();
    sortEntriesDesc(entriesToRender).forEach(function (entry) {
      if (!byWorkspace.has(entry.workspaceName)) {
        byWorkspace.set(entry.workspaceName, []);
      }
      byWorkspace.get(entry.workspaceName).push(entry);
    });

    return Array.from(byWorkspace.entries())
      .sort(function (a, b) {
        return toSortTime(b[1][0].startTime) - toSortTime(a[1][0].startTime);
      })
      .map(function (pair) {
        var children = pair[1].map(createSessionRow);
        return createGroupCard(pair[0], pair[1].length, children, 0);
      });
  }

  function renderWorkspaceByDate(entriesToRender) {
    var byWorkspace = new Map();
    sortEntriesDesc(entriesToRender).forEach(function (entry) {
      if (!byWorkspace.has(entry.workspaceName)) {
        byWorkspace.set(entry.workspaceName, []);
      }
      byWorkspace.get(entry.workspaceName).push(entry);
    });

    return Array.from(byWorkspace.entries())
      .sort(function (a, b) {
        return toSortTime(b[1][0].startTime) - toSortTime(a[1][0].startTime);
      })
      .map(function (pair) {
        var byDate = new Map();
        pair[1].forEach(function (entry) {
          if (!byDate.has(entry.dateKey)) {
            byDate.set(entry.dateKey, []);
          }
          byDate.get(entry.dateKey).push(entry);
        });

        var children = Array.from(byDate.entries())
          .sort(function (a, b) { return b[0].localeCompare(a[0]); })
          .map(function (datePair) {
            return createGroupCard(datePair[0], datePair[1].length, datePair[1].map(createSessionRow), 1);
          });

        return createGroupCard(pair[0], pair[1].length, children, 0);
      });
  }

  function renderSessionList() {
    if (!sessionList) {
      return;
    }

    sessionList.innerHTML = '';
    var filtered = getFilteredEntries();
    if (filtered.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No sessions match the current filters.';
      sessionList.appendChild(empty);
      return;
    }

    var groups;
    if (state.groupBy === 'date') {
      groups = renderByDate(filtered);
    } else if (state.workspaceViewMode === 'byDate') {
      groups = renderWorkspaceByDate(filtered);
    } else {
      groups = renderWorkspaceFlat(filtered);
    }

    groups.forEach(function (group) { sessionList.appendChild(group); });
  }

  function renderControlState() {
    groupButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.value === state.groupBy);
    });
    layoutButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.value === state.workspaceViewMode);
    });
    if (workspaceLayoutBlock) {
      workspaceLayoutBlock.style.display = state.groupBy === 'workspace' ? '' : 'none';
    }
    if (searchInput) {
      searchInput.value = state.search;
    }
  }

  function bindEvents() {
    groupButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.groupBy = button.dataset.value === 'date' ? 'date' : 'workspace';
        safeSet(GROUP_BY_KEY, state.groupBy);
        renderControlState();
        renderSessionList();
      });
    });

    layoutButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.workspaceViewMode = button.dataset.value === 'byDate' ? 'byDate' : 'flat';
        safeSet(WORKSPACE_LAYOUT_KEY, state.workspaceViewMode);
        renderControlState();
        renderSessionList();
      });
    });

    themeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyTheme(button.dataset.value || 'auto', true);
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function (event) {
        var target = event.target;
        state.search = target && target.value ? target.value : '';
        safeSet(SEARCH_KEY, state.search);
        renderSessionList();
      });
    }

    window.addEventListener('hashchange', function () {
      var fromHash = (window.location.hash || '').replace(/^#/, '');
      if (fromHash && entriesById.has(fromHash)) {
        selectSession(fromHash);
      }
    });

    if (prefersDark && typeof prefersDark.addEventListener === 'function') {
      prefersDark.addEventListener('change', function () {
        if (state.theme === 'auto') {
          applyTheme('auto', false);
        }
      });
    }
  }

  function init() {
    renderControlState();
    bindEvents();
    applyTheme(state.theme, false);
    state.selectedSessionId = getInitialSessionId();
    if (state.selectedSessionId) {
      selectSession(state.selectedSessionId);
    } else {
      renderSessionList();
    }
  }

  init();
})();