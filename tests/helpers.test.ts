import { expect, describe, it } from 'vitest'
import { timeAgo, thousandSeperator } from '../src/helpers'

describe('helpers', () => {
  describe('timeAgo', () => {
    it('returns seconds for recent dates', () => {
      const now = new Date().toISOString()
      expect(timeAgo(now)).toMatch(/secs ago/)
    })

    it('returns minutes for older dates', () => {
      const past = new Date(Date.now() - 120000).toISOString()
      expect(timeAgo(past)).toMatch(/mins ago/)
    })
  })

  describe('thousandSeperator', () => {
    it('formats numbers with commas', () => {
      expect(thousandSeperator(1000)).toBe('1,000')
      expect(thousandSeperator(1234567)).toBe('1,234,567')
    })

    it('handles decimal numbers', () => {
      expect(thousandSeperator(1234.56)).toBe('1,234.56')
    })
  })
})
