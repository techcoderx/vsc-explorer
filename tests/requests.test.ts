/**
 * @vitest-environment node
 */
import { expect, describe, it } from 'vitest'
import { sumWitnessStake } from '../src/requests'
import type { WitnessStat } from '../src/types/HafApiResult'

const witness = (stake: number, id = 'w'): WitnessStat => ({
  _id: id,
  block_count: 0,
  election_count: 0,
  last_block: 0,
  last_epoch: 0,
  weight: 1,
  did_key: 'key',
  stake
})

describe('sumWitnessStake', () => {
  it('sums the consensus stake of every witness', () => {
    expect(sumWitnessStake([witness(2000000, 'alice'), witness(500000, 'bob')])).toBe(2500000)
  })

  it('returns undefined when there is no committee', () => {
    expect(sumWitnessStake([])).toBeUndefined()
  })

  it('returns undefined instead of a partial total when stake is missing', () => {
    const stale = { ...witness(1000000), stake: undefined as unknown as number }
    expect(sumWitnessStake([witness(1000000), stale])).toBeUndefined()
  })

  it('returns undefined for non-finite stake values', () => {
    expect(sumWitnessStake([witness(Number.NaN)])).toBeUndefined()
  })
})
