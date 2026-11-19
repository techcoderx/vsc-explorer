/**
 * @vitest-environment node
 */
import { expect, describe, it, vi, afterEach } from 'vitest'
import { fetchWitnessesConsensusStake } from '../src/requests'

type GqlRequestBody = { query: string; variables: Record<string, string> }

const gqlBody = (fetchMock: ReturnType<typeof vi.fn>, callIndex: number): GqlRequestBody =>
  JSON.parse(String((fetchMock.mock.calls[callIndex][1] as RequestInit).body)) as GqlRequestBody

const mockStakeQuery = (stakePerAccount: number) => {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const { variables } = JSON.parse(String(init?.body)) as GqlRequestBody
    const data = Object.fromEntries(Object.keys(variables).map((_, idx) => [`s${idx}`, stakePerAccount]))
    return new Response(JSON.stringify({ data }), { headers: { 'Content-Type': 'application/json' } })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('fetchWitnessesConsensusStake', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sums the consensus stake of every account in one batched query', async () => {
    const fetchMock = mockStakeQuery(2000000)
    const total = await fetchWitnessesConsensusStake(['alice', 'hive:bob'])
    expect(total).toBe(4000000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const body = gqlBody(fetchMock, 0)
    // Election records store bare usernames, ledger balances are keyed "hive:<name>".
    expect(body.variables).toEqual({ acc0: 'hive:alice', acc1: 'hive:bob' })
    expect(body.query).toContain('s1: witnessStake(account: $acc1)')
  })

  it('de-duplicates accounts and skips blanks', async () => {
    const fetchMock = mockStakeQuery(1000)
    const total = await fetchWitnessesConsensusStake(['alice', 'hive:alice', ''])
    expect(total).toBe(1000)
    expect(gqlBody(fetchMock, 0).variables).toEqual({ acc0: 'hive:alice' })
  })

  it('returns 0 without querying when there are no accounts', async () => {
    const fetchMock = mockStakeQuery(1000)
    expect(await fetchWitnessesConsensusStake([])).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('splits large committees across requests to stay under the node alias limit', async () => {
    const fetchMock = mockStakeQuery(1000)
    const accounts = Array.from({ length: 120 }, (_, idx) => `witness${idx}`)
    expect(await fetchWitnessesConsensusStake(accounts)).toBe(120000)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(Object.keys(gqlBody(fetchMock, 2).variables)).toHaveLength(20)
  })

  it('throws instead of reporting 0 when the node rejects the query', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ errors: [{ message: 'Cannot query field "witnessStake" on type "Query".' }] }), {
            headers: { 'Content-Type': 'application/json' }
          })
      )
    )
    await expect(fetchWitnessesConsensusStake(['alice'])).rejects.toThrow('witnessStake')
  })
})
