export interface MentorOgImageInput {
  name: string;
  rating: number;
  skills: string[];
}

export interface MentorMetaInput extends MentorOgImageInput {
  id: string;
  bio: string;
}

interface MetaDescriptor {
  name?: string;
  property?: string;
  content: string;
}

const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const upsertMetaTag = (meta: MetaDescriptor) => {
  const selector = meta.name
    ? `meta[name="${meta.name}"]`
    : `meta[property="${meta.property}"]`;

  let element = document.head.querySelector<HTMLMetaElement>(selector);
  const created = !element;
  const previousContent = element?.getAttribute('content') ?? null;

  if (!element) {
    element = document.createElement('meta');
    if (meta.name) {
      element.setAttribute('name', meta.name);
    }
    if (meta.property) {
      element.setAttribute('property', meta.property);
    }
    document.head.appendChild(element);
  }

  element.setAttribute('content', meta.content);

  return () => {
    if (created) {
      element?.remove();
      return;
    }

    if (previousContent === null) {
      element?.removeAttribute('content');
      return;
    }

    element?.setAttribute('content', previousContent);
  };
};

export const buildMentorOgImageUrl = ({ name, rating, skills }: MentorOgImageInput): string => {
  const safeName = escapeHtml(name);
  const safeSkills = escapeHtml(skills.slice(0, 4).join(' • '));
  const ratingLabel = `Rating ${rating.toFixed(1)}`;

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#0ea5e9" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" rx="24" />
  <rect x="58" y="58" width="1084" height="514" fill="rgba(255,255,255,0.08)" rx="24" />
  <text x="90" y="180" fill="#ffffff" font-size="60" font-family="Arial, sans-serif" font-weight="700">${safeName}</text>
  <text x="90" y="250" fill="#bae6fd" font-size="34" font-family="Arial, sans-serif">${escapeHtml(ratingLabel)}</text>
  <text x="90" y="320" fill="#e2e8f0" font-size="30" font-family="Arial, sans-serif">${safeSkills}</text>
  <text x="90" y="530" fill="#f8fafc" font-size="28" font-family="Arial, sans-serif" font-weight="600">MentorMinds</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const buildMentorProfileMeta = (mentor: MentorMetaInput): MetaDescriptor[] => {
  const canonicalUrl = `${window.location.origin}/mentors/${mentor.id}`;
  const description = `View ${mentor.name}'s mentor profile, skills, rating, reviews, and availability on MentorMinds.`;
  const imageUrl = buildMentorOgImageUrl({
    name: mentor.name,
    rating: mentor.rating,
    skills: mentor.skills,
  });

  return [
    { name: 'description', content: description },
    { property: 'og:title', content: `${mentor.name} | MentorMinds` },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'profile' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:alt', content: `${mentor.name} mentor profile preview` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${mentor.name} | MentorMinds` },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ];
};

export const buildCertificateTwitterMeta = (skill: string): MetaDescriptor[] => {
  const description = `I earned a ${skill} certificate on MentorMinds!`;

  return [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${skill} Certificate Achievement` },
    { name: 'twitter:description', content: description },
    { property: 'og:title', content: `${skill} Certificate Achievement` },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: window.location.href },
  ];
};

export const applyMetaTags = (entries: MetaDescriptor[]): (() => void) => {
  const rollbacks = entries.map((entry) => upsertMetaTag(entry));

  return () => {
    rollbacks.reverse().forEach((rollback) => rollback());
  };
};