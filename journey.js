const journeyData = [
  { years: "Jul 2017 – Jan 2018", company: "VIP News", industry: "News", role: "Motion Graphic Designer", highlight: "Edited news videos and designed intros, stings, banners and 3D assets for election coverage." },
  { years: "Jan 2018 – Jun 2018", company: "Indradhanush News", industry: "News", role: "Motion Graphic Designer", highlight: "Edited full news packages and built broadcast motion graphics on newsroom deadlines." },
  { years: "Oct 2018 – Jun 2020", company: "Learncab", industry: "Edtech", role: "Motion Graphic Designer", highlight: "Explainer videos, ads, banners and social posts with consistent brand identity." },
  { years: "Jul 2020 – Dec 2022", company: "Vedantu", industry: "Edtech", role: "Video Editor & Graphic Designer", highlight: "Edited and designed for a YouTube ecosystem that crossed 1M+ subscribers, including the JEE Vedantu channel.", link: {label: "View channel", href: "https://www.youtube.com/@JEEVedantu/shorts"} },
  { years: "Dec 2022 – Jun 2023", company: "Mojocare", industry: "Healthcare", role: "Video Manager", highlight: "Owned video from script and concept through shoot, edit and delivery." },
  { years: "Feb 2024 – Sep 2026", company: "Angel One", industry: "Fintech", role: "Manager – Video Editor", highlight: "Led two YouTube channels and a creative team, with Shorts output up from 3.6 to 8.3 a week and retention up from 40.9% to 50.8%.", latest: true }
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('journey-timeline-entries');
  if (!container) return;

  journeyData.forEach((entry, i) => {
    const el = document.createElement('div');
    el.className = `journey-entry ${i % 2 === 0 ? 'left' : 'right'}`;
    el.innerHTML = `
      <div class="journey-dot ${entry.latest ? 'latest' : ''}"></div>
      <div class="journey-content">
        <div class="journey-years">${entry.years}</div>
        <h3 class="journey-company">${entry.company}</h3>
        <div class="journey-chips">
          <span class="journey-role">${entry.role}</span>
          <span class="journey-industry">${entry.industry}</span>
        </div>
        <p class="journey-highlight">${entry.highlight}</p>
        ${entry.link ? `<a href="${entry.link.href}" target="_blank" rel="noopener" class="journey-link">${entry.link.label} &rarr;</a>` : ''}
      </div>
    `;
    container.appendChild(el);
  });

  const timeline = document.getElementById('journey-timeline');
  const lineProgress = document.getElementById('journey-line-progress');
  const entries = document.querySelectorAll('.journey-entry');

  function updateJourneyScroll() {
    if (!timeline) return;
    const rect = timeline.getBoundingClientRect();
    const windowH = window.innerHeight;
    
    // Start drawing line when timeline top is at 75% of viewport
    const startY = windowH * 0.75;
    const endY = windowH * 0.25;
    
    // Progress calculation
    let progress = (startY - rect.top) / (rect.height);
    progress = Math.max(0, Math.min(1, progress));
    
    lineProgress.style.transform = `scaleY(${progress})`;
    
    entries.forEach((entry, idx) => {
      // If the line has passed this entry's dot, reveal it
      const entryRect = entry.getBoundingClientRect();
      const dotTop = entryRect.top + 24; // approx dot offset
      
      if (dotTop < startY && !entry.classList.contains('revealed')) {
        entry.classList.add('revealed');
      }
    });
  }

  window.addEventListener('scroll', updateJourneyScroll, {passive: true});
  updateJourneyScroll();
});
