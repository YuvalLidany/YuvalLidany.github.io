---
layout: archive
title: "CV"
permalink: /cv-test/
author_profile: true
sitemap: false
---

<p class="cv-actions">
  <a class="cv-download" href="/files/Yuval_Lidany_CV.pdf" target="_blank"><i class="fas fa-file-pdf"></i> Download CV (PDF)</a>
</p>

<!-- native browser PDF viewer -->
<iframe class="cv-embed" src="/files/Yuval_Lidany_CV.pdf" title="Yuval Lidany — CV"></iframe>
<script>
/* Phones/tablets only: swap the iframe for a PDF.js-rendered copy of the same
   PDF so its links become tappable. On laptops this script does nothing.
   NOTE: no "//" comments here — the HTML compressor collapses this script
   onto one line, and a "//" would comment out everything after it. */
(function () {
  if (!window.matchMedia || !matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  var iframe = document.querySelector('iframe.cv-embed');
  if (!iframe) return;
  var viewer = document.createElement('div');
  viewer.id = 'cv-viewer';
  viewer.className = 'cv-embed';
  viewer.setAttribute('data-src', '/files/Yuval_Lidany_CV.pdf');
  iframe.parentNode.replaceChild(viewer, iframe);
  function restore() {
    if (viewer.parentNode) { viewer.parentNode.replaceChild(iframe, viewer); }
  }
  function add(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onerror = restore;
    if (cb) { s.onload = cb; }
    document.body.appendChild(s);
  }
  add('/assets/js/pdfjs/pdf.min.js', function () {
    if (!window.pdfjsLib) { restore(); return; }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/js/pdfjs/pdf.worker.min.js';
    add('/assets/js/cv-viewer.js');
  });
})();
</script>
