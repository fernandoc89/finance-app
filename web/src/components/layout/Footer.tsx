import React from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  links?: FooterLink[];
  companyName?: string;
}

const defaultLinks: FooterLink[] = [
  { label: 'Termos de Uso', href: '#' },
  { label: 'Privacidade', href: '#' },
  { label: 'Ajuda', href: '#' },
];

export const Footer: React.FC<FooterProps> = React.memo(({
  links = defaultLinks,
  companyName = 'FinanceApp',
}) => {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} {companyName}. Todos os direitos reservados.
        </p>
        <nav className="flex items-center gap-4" aria-label="Links do rodapé">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
