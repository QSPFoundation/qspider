import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'qSpider',
  tagline: '',
  favicon: 'img/favicon.ico',

  url: 'https://qspider.xyz',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'uk'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/qspider-logo.png',
    navbar: {
      title: 'qSpider',
      logo: {
        alt: 'qSpider Logo',
        src: 'img/qspider-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: 'Guides',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/QSPFoundation/qspider',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Guides',
              to: '/docs',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/bbbdxhE9M2',
            },
            {
              label: 'Forum',
              href: 'https://qsp.org/index.php?option=com_agora&Itemid=57',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'QSP Wiki',
              href: 'https://wiki.qsp.org/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/QSPFoundation/qspider',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} QSPFoundation.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
