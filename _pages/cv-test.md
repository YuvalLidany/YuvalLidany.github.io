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
<style>
  /* phone viewer styling lives here with the page so it is never stale-cached */
  div.cv-embed { overflow: auto; -webkit-overflow-scrolling: touch; touch-action: pan-x pan-y; }
  div.cv-embed .cv-zoom { transform-origin: 0 0; }
  div.cv-embed .cv-page { position: relative; margin: 0 auto; background: #fff; }
  div.cv-embed .cv-page + .cv-page { border-top: 1px solid #e8e8e8; }
  .cv-page__link { position: absolute; display: block; }
  .cv-shell { position: relative; }
  .cv-expand { position: absolute; top: 8px; left: 8px; z-index: 5; border: 0; border-radius: 999px;
    padding: 0.4em 0.75em; font-family: "Inter", sans-serif; font-size: 0.72rem; font-weight: 600;
    color: #fff; background: rgba(31, 92, 147, 0.65); cursor: pointer; }
  .cv-expand--full { position: fixed; top: 12px; left: auto; right: 12px; z-index: 10001;
    background: rgba(31, 92, 147, 0.92); }
  div.cv-embed--full { position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%;
    height: 100%; max-height: none; margin: 0; z-index: 10000; border: 0; border-radius: 0; }
</style>
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
  add('/assets/js/pdfjs/pdf.min.js?v=13', function () {
    if (!window.pdfjsLib) { restore(); return; }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/js/pdfjs/pdf.worker.min.js?v=13';
    add('/assets/js/cv-viewer.js?v=13');
  });
})();
</script>
