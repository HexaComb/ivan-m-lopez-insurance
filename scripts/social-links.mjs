const icons = {
  review: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
  linktree: '<path d="M12 3v11M5 5l14 10M19 5 5 15M3 10h18M12 17v5"/>',
  facebook: '<path d="M14 22v-9h3l.5-4H14V6.5c0-1.2.4-2 2-2h2V1.2C17.6 1.1 16.4 1 15 1c-3 0-5 1.8-5 5v3H7v4h3v9"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
  x: '<path d="M4 3h4.5L20 21h-4.5ZM20 3l-6.5 7.5M4 21l6.5-7.5"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M7 10v7M11 17v-7m0 3c0-4 6-4 6 0v4"/><circle cx="7" cy="7" r=".7" fill="currentColor" stroke="none"/>'
};

export function socialLinks(lang) {
  const links = [
    ['review', lang === 'en' ? 'Write Us a Review' : 'Escríbanos una reseña', 'https://medicarebrokerdirectory.com/review/ivan-lopez'],
    ['linktree', 'Linktree', 'https://linktr.ee/IvanMLopez'],
    ['facebook', 'Facebook', 'https://www.facebook.com/people/Ivan-M-Lopez/61594200754350/'],
    ['instagram', 'Instagram', 'https://www.instagram.com/ivanm.lopezinsurance'],
    ['x', 'X', 'https://x.com/IvanMLopezins'],
    ['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/ivan-m-lopez-02979180']
  ];
  return links.map(([icon, label, href]) => `<a href="${href}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[icon]}</svg><span>${label}</span></a>`).join('');
}
