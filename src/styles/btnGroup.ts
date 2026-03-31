export const btnGroupCss = {
  display: 'inline-flex',
  isolation: 'isolate',
  '& > button': {
    borderRadius: 0
  },
  '& > button:first-of-type': {
    borderStartStartRadius: 'l2',
    borderEndStartRadius: 'l2'
  },
  '& > button:last-of-type': {
    borderStartEndRadius: 'l2',
    borderEndEndRadius: 'l2'
  },
  '& > button:not(:last-of-type)': {
    marginInlineEnd: '-1px'
  }
}
