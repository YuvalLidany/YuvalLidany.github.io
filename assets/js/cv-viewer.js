/* Renders the CV PDF with PDF.js inside the same white .cv-embed box used
   today, with working hyperlinks. Only ever loaded on phones/tablets, where
   the browser's native inline PDF preview ignores link annotations. */
(function () {
  'use strict';

  var container = document.getElementById('cv-viewer');
  if (!container || !window.pdfjsLib) return;

  var src = container.getAttribute('data-src');
  var renderedWidth = 0;

  function availableWidth() {
    return container.clientWidth;
  }

  function renderDocument(pdf) {
    var width = availableWidth();
    if (width <= 0) return;
    renderedWidth = width;
    var dpr = Math.min(window.devicePixelRatio || 1, 3);

    var pagePromises = [];
    for (var n = 1; n <= pdf.numPages; n++) pagePromises.push(pdf.getPage(n));

    Promise.all(pagePromises).then(function (pages) {
      container.textContent = '';
      pages.forEach(function (page) {
        var base = page.getViewport({ scale: 1 });
        var vp = page.getViewport({ scale: width / base.width });

        var wrap = document.createElement('div');
        wrap.className = 'cv-page';
        wrap.style.width = vp.width + 'px';
        wrap.style.height = vp.height + 'px';

        var canvas = document.createElement('canvas');
        canvas.width = Math.floor(vp.width * dpr);
        canvas.height = Math.floor(vp.height * dpr);
        canvas.style.width = vp.width + 'px';
        canvas.style.height = vp.height + 'px';
        wrap.appendChild(canvas);
        container.appendChild(wrap);

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
            link.style.left = Math.min(r[0], r[2]) + 'px';
            link.style.top = Math.min(r[1], r[3]) + 'px';
            link.style.width = Math.abs(r[2] - r[0]) + 'px';
            link.style.height = Math.abs(r[3] - r[1]) + 'px';
            wrap.appendChild(link);
          });
        });
      });
    });
  }

  function load() {
    var task = window.CV_PDF_DATA
      ? pdfjsLib.getDocument({ data: window.CV_PDF_DATA })
      : pdfjsLib.getDocument(src);
    task.promise.then(function (pdf) {
      renderDocument(pdf);
      var resizeTimer = null;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (Math.abs(availableWidth() - renderedWidth) > 30) renderDocument(pdf);
        }, 200);
      });
    }).catch(function () {
      container.innerHTML = '<p style="padding:2em;text-align:center;">' +
        'Could not display the CV here. <a href="' + src + '">Open the PDF directly</a>.</p>';
    });
  }

  load();
})();
