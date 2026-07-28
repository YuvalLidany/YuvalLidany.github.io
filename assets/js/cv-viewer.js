/* Renders the CV PDF with PDF.js inside the same white .cv-embed box used
   today, with working hyperlinks. Only ever loaded on phones/tablets, where
   the browser's native inline PDF preview ignores link annotations.
   The page's blank side margins are cropped so the text itself fills the
   screen width. Supports pinch-to-zoom and double-tap-to-zoom; pages are
   re-rendered at the new scale so zoomed text stays sharp. */
(function () {
  'use strict';

  var container = document.getElementById('cv-viewer');
  if (!container || !window.pdfjsLib) return;

  var src = container.getAttribute('data-src');
  var MAX_ZOOM = 4;
  var MAX_CANVAS_PIXELS = 16000000; /* iOS Safari canvas limit */

  var zoomLayer = document.createElement('div');
  zoomLayer.className = 'cv-zoom';
  container.textContent = '';
  container.appendChild(zoomLayer);

  var pdfDoc = null;
  var crop = null;       /* {x0, x1} in PDF units: horizontal text extent */
  var zoom = 1;          /* 1 = cropped text width fits the container */
  var fitWidth = 0;
  var rendering = false;
  var pendingZoom = null;

  function measureFitWidth() {
    fitWidth = container.clientWidth;
    return fitWidth;
  }

  /* Union of the text bounding boxes across pages; falls back to full page
     width when the result looks implausible. */
  function computeCrop(pages) {
    return Promise.all(pages.map(function (page) {
      return page.getTextContent().then(function (tc) {
        var minX = Infinity, maxX = -Infinity;
        tc.items.forEach(function (it) {
          if (!it.width) return;
          var x = it.transform[4];
          if (x < minX) minX = x;
          if (x + it.width > maxX) maxX = x + it.width;
        });
        return { minX: minX, maxX: maxX, pageW: page.getViewport({ scale: 1 }).width };
      });
    })).then(function (boxes) {
      var minX = Infinity, maxX = -Infinity, pageW = 0;
      boxes.forEach(function (b) {
        if (b.minX < minX) minX = b.minX;
        if (b.maxX > maxX) maxX = b.maxX;
        if (b.pageW > pageW) pageW = b.pageW;
      });
      var pad = 6;
      if (!isFinite(minX) || !isFinite(maxX) || maxX - minX < pageW * 0.3) return null;
      return { x0: Math.max(0, minX - pad), x1: Math.min(pageW, maxX + pad) };
    }).catch(function () { return null; });
  }

  function renderDocument(cssWidth) {
    if (!pdfDoc || cssWidth <= 0) return;
    if (rendering) { pendingZoom = cssWidth; return; }
    rendering = true;

    var pagePromises = [];
    for (var n = 1; n <= pdfDoc.numPages; n++) pagePromises.push(pdfDoc.getPage(n));

    Promise.all(pagePromises).then(function (pages) {
      zoomLayer.textContent = '';
      zoomLayer.style.transform = '';
      zoomLayer.style.width = cssWidth + 'px';

      pages.forEach(function (page) {
        var base = page.getViewport({ scale: 1 });
        var cropX0 = crop ? crop.x0 : 0;
        var cropX1 = crop ? Math.min(crop.x1, base.width) : base.width;
        var scale = cssWidth / (cropX1 - cropX0);
        var vp = page.getViewport({ scale: scale });
        var shift = cropX0 * scale;

        var dpr = Math.min(window.devicePixelRatio || 1, 3);
        var maxDpr = Math.sqrt(MAX_CANVAS_PIXELS / (vp.width * vp.height));
        if (dpr > maxDpr) dpr = maxDpr;

        var wrap = document.createElement('div');
        wrap.className = 'cv-page';
        wrap.style.width = cssWidth + 'px';
        wrap.style.height = vp.height + 'px';
        wrap.style.overflow = 'hidden';

        var canvas = document.createElement('canvas');
        canvas.width = Math.floor(vp.width * dpr);
        canvas.height = Math.floor(vp.height * dpr);
        canvas.style.width = vp.width + 'px';
        canvas.style.height = vp.height + 'px';
        canvas.style.marginLeft = -shift + 'px';
        wrap.appendChild(canvas);
        zoomLayer.appendChild(wrap);

        page.render({
          canvasContext: canvas.getContext('2d'),
          viewport: vp,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
        });

        page.getAnnotations().then(function (annotations) {
          annotations.forEach(function (a) {
            if (a.subtype !== 'Link' || !a.url) return;
            var r = vp.convertToViewportRectangle(a.rect);
            var link = document.createElement('a');
            link.href = a.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'cv-page__link';
            link.style.left = (Math.min(r[0], r[2]) - shift) + 'px';
            link.style.top = Math.min(r[1], r[3]) + 'px';
            link.style.width = Math.abs(r[2] - r[0]) + 'px';
            link.style.height = Math.abs(r[3] - r[1]) + 'px';
            wrap.appendChild(link);
          });
        });
      });

      rendering = false;
      if (pendingZoom !== null) {
        var w = pendingZoom;
        pendingZoom = null;
        renderDocument(w);
      }
    });
  }

  /* Change zoom, keeping the content point at (anchorX, anchorY) — container
     coordinates — stationary. Re-renders so the result is sharp. */
  function setZoom(newZoom, anchorX, anchorY) {
    newZoom = Math.max(1, Math.min(MAX_ZOOM, newZoom));
    if (Math.abs(newZoom - zoom) < 0.01) return;
    var ratio = newZoom / zoom;
    var newScrollLeft = (container.scrollLeft + anchorX) * ratio - anchorX;
    var newScrollTop = (container.scrollTop + anchorY) * ratio - anchorY;
    zoom = newZoom;
    renderDocument(fitWidth * zoom);
    container.scrollLeft = Math.max(0, newScrollLeft);
    container.scrollTop = Math.max(0, newScrollTop);
  }

  function attachGestures() {
    var pinch = null;
    var lastTap = { time: 0, x: 0, y: 0 };

    function touchDist(t) {
      var dx = t[0].clientX - t[1].clientX;
      var dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function containerPoint(clientX, clientY) {
      var rect = container.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    container.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        var mid = containerPoint(
          (e.touches[0].clientX + e.touches[1].clientX) / 2,
          (e.touches[0].clientY + e.touches[1].clientY) / 2);
        pinch = {
          startDist: touchDist(e.touches),
          startZoom: zoom,
          midX: mid.x,
          midY: mid.y,
          startScrollLeft: container.scrollLeft,
          startScrollTop: container.scrollTop,
          ratio: 1
        };
        e.preventDefault();
      }
    }, { passive: false });

    container.addEventListener('touchmove', function (e) {
      if (pinch && e.touches.length === 2) {
        pinch.ratio = touchDist(e.touches) / pinch.startDist;
        var target = pinch.startZoom * pinch.ratio;
        if (target < 1) pinch.ratio = 1 / pinch.startZoom;
        if (target > MAX_ZOOM) pinch.ratio = MAX_ZOOM / pinch.startZoom;
        /* live preview: cheap CSS scale, re-rendered sharp on release */
        var originX = pinch.startScrollLeft + pinch.midX;
        var originY = pinch.startScrollTop + pinch.midY;
        zoomLayer.style.transformOrigin = originX + 'px ' + originY + 'px';
        zoomLayer.style.transform = 'scale(' + pinch.ratio + ')';
        e.preventDefault();
      }
    }, { passive: false });

    container.addEventListener('touchend', function (e) {
      if (pinch && e.touches.length < 2) {
        var p = pinch;
        pinch = null;
        zoomLayer.style.transform = '';
        setZoom(p.startZoom * p.ratio, p.midX, p.midY);
        return;
      }
      if (e.touches.length === 0 && e.changedTouches.length === 1) {
        var t = e.changedTouches[0];
        var now = Date.now();
        var moved = Math.abs(t.clientX - lastTap.x) + Math.abs(t.clientY - lastTap.y);
        if (now - lastTap.time < 300 && moved < 40) {
          lastTap.time = 0;
          var pt = containerPoint(t.clientX, t.clientY);
          setZoom(zoom > 1.2 ? 1 : 2, pt.x, pt.y);
          e.preventDefault();
        } else {
          lastTap = { time: now, x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: false });

    /* iOS fires proprietary gesture events for pinch; stop page-level zoom
       while the fingers are inside the viewer */
    container.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    container.addEventListener('gesturechange', function (e) { e.preventDefault(); });
  }

  function load() {
    var task = window.CV_PDF_DATA
      ? pdfjsLib.getDocument({ data: window.CV_PDF_DATA })
      : pdfjsLib.getDocument(src);
    task.promise.then(function (pdf) {
      pdfDoc = pdf;
      var pagePromises = [];
      for (var n = 1; n <= pdf.numPages; n++) pagePromises.push(pdf.getPage(n));
      return Promise.all(pagePromises).then(computeCrop).then(function (c) {
        crop = c;
        renderDocument(measureFitWidth());
        attachGestures();
        var resizeTimer = null;
        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function () {
            var old = fitWidth;
            if (Math.abs(measureFitWidth() - old) > 30) renderDocument(fitWidth * zoom);
          }, 200);
        });
      });
    }).catch(function () {
      container.innerHTML = '<p style="padding:2em;text-align:center;">' +
        'Could not display the CV here. <a href="' + src + '">Open the PDF directly</a>.</p>';
    });
  }

  load();
})();
