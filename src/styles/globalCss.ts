export const globalCss = {
  'html, body': {
    fontSize: '16px'
  },
  'tr, th, td, thead, tbody, table': {
    backgroundColor: 'transparent !important'
  },
  '.chakra-link': {
    color: 'inherit !important'
  },
  '[data-bg-theme="blue"] .chakra-card__root': {
    backgroundColor: 'var(--magi-card) !important'
  },
  '.dark[data-bg-theme="blue"] input, .dark[data-bg-theme="blue"] textarea, .dark[data-bg-theme="blue"] select': {
    backgroundColor: 'var(--magi-surface) !important',
    borderColor: '#4a5568 !important',
    transition: 'border-color 0.2s, background-color 0.2s'
  },
  '.dark[data-bg-theme="blue"] input:hover, .dark[data-bg-theme="blue"] textarea:hover, .dark[data-bg-theme="blue"] select:hover': {
    borderColor: '#718096 !important'
  },
  '.dark[data-bg-theme="blue"] input:focus-visible, .dark[data-bg-theme="blue"] textarea:focus-visible, .dark[data-bg-theme="blue"] select:focus-visible': {
    borderColor: '#ed64a6 !important'
  },
  '.dark[data-bg-theme="blue"] .chakra-dialog__content': {
    backgroundColor: 'var(--magi-surface) !important',
    borderColor: '#4a5568 !important'
  },
  '.dark[data-bg-theme="blue"] .chakra-dialog__header, .dark[data-bg-theme="blue"] .chakra-dialog__footer': {
    borderColor: '#4a5568 !important'
  },
  '.dark[data-bg-theme="blue"] .chakra-tabs__list': {
    borderColor: '#4a5568 !important'
  },
  '.dark[data-bg-theme="blue"] .chakra-tabs__trigger': {
    borderColor: '#4a5568 !important'
  },
  '.dark[data-bg-theme="blue"] .chakra-tabs__trigger:hover': {
    backgroundColor: 'var(--magi-surface-hover) !important'
  },
  '.dark[data-bg-theme="blue"] .chakra-tabs__trigger[data-selected]': {
    backgroundColor: 'var(--magi-surface) !important',
    borderColor: '#4a5568 !important',
    borderBottomColor: 'var(--magi-surface) !important'
  },
  '.dark[data-bg-theme="blue"] .chakra-card__root .chakra-table__cell, .dark[data-bg-theme="blue"] .chakra-card__root .chakra-table__columnHeader': {
    borderColor: '#4a5568 !important'
  },
  '.dark[data-bg-theme="blue"] .chakra-card__root .chakra-accordion__item': {
    borderColor: '#4a5568 !important'
  }
}
