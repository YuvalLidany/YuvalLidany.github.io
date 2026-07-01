---
layout: archive
title: "CV"
permalink: /cv/
author_profile: false
redirect_from:
  - /resume
---

<p class="cv-actions">
  <a class="cv-download" href="/files/Yuval_Lidany_CV.pdf" target="_blank"><i class="fas fa-file-pdf"></i> Download CV (PDF)</a>
</p>

<div id="cv-viewer" class="cv-viewer">
  <noscript><p style="text-align:center;">Please use the Download button above to view the CV.</p></noscript>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
(function () {
  if (!window.pdfjsLib) { return; }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  var container = document.getElementById('cv-viewer');
  var url = '/files/Yuval_Lidany_CV.pdf';
  pdfjsLib.getDocument(url).promise.then(function (pdf) {
    var renderPage = function (n) {
      if (n > pdf.numPages) { return; }
      pdf.getPage(n).then(function (page) {
        var targetWidth = container.clientWidth || 800;
        var base = page.getViewport({ scale: 1 });
        var scale = targetWidth / base.width;
        var viewport = page.getViewport({ scale: scale });
        var canvas = document.createElement('canvas');
        canvas.className = 'cv-page-canvas';
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = '100%';
        container.appendChild(canvas);
        page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise.then(function () {
          renderPage(n + 1);
        });
      });
    };
    renderPage(1);
  }).catch(function () {
    container.innerHTML = '<p style="text-align:center;">Unable to load the CV preview — please use the Download button above.</p>';
  });
})();
</script>
