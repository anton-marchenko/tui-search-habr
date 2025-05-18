import { ExtraSearchServiceDto, SearchResult } from '../search.model';

export const EXTRA_SEARCH_DATA: SearchResult = {
  Users: [
    {
      data: {
        title: 'Anton Marchenko',
        subtitle: 'Frontend developer',
        href: 'https://github.com/anton-marchenko',
        icon: '@tui.user',
      },
    },
  ],
  Links: [
    {
      data: {
        title: 'Taiga UI Anton',
        subtitle: 'Super awesome library',
        href: 'https://taiga-ui.dev',
        icon: '@tui.user',
      },
    },
  ],
  Code: [
    {
      data: {
        title: 'Taiga UI Proprietary Anton',
        href: 'https://super-secret-evil.org/taiga-ui',
        icon: '@tui.gitlab',
      },
    },
  ],
};

export const MAIN_SEARCH_DATA: SearchResult = {
  Posts: [
    {
      data: {
        title: 'Post 1 Anton Marchenko',
        href: 'https://en.wikipedia.org/wiki/Monty_Python',
        icon: '@tui.file-text',
      },
    },
    {
      data: {
        title: 'Post 2',
        href: 'https://en.wikipedia.org/wiki/Monty_Python',
        icon: '@tui.file-text',
      },
    },
  ],
  Articles: [
    {
      data: {
        title: 'Ar 1 Anton Marchenko',
        href: 'https://en.wikipedia.org/wiki/Monty_Python',
        icon: '@tui.file-text',
      },
    },
    {
      data: {
        title: 'Article 2',
        href: 'https://en.wikipedia.org/wiki/Monty_Python',
        icon: '@tui.file-text',
      },
    },
  ],
};

export const EXTRA_SEARCH_SERVICES: ExtraSearchServiceDto[] = [
  {
    sourceId: 'users',
    name: 'Users',
    priority: 2,
  },
  {
    sourceId: 'code',
    name: 'Code',
    priority: 1,
  },
  {
    sourceId: 'links',
    name: 'Links',
    priority: 1,
  },
];
