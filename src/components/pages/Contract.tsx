import { useEffect, useState } from 'react'
import {
  Text,
  Box,
  Link,
  Skeleton,
  Table,
  Tbody,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Thead,
  Th,
  Tr,
  Td,
  Badge,
  Tooltip,
  Button,
  Center
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router-dom'
import { fetchCallsByContractId, fetchContractByID, fetchMembersAtBlock } from '../../requests'
import TableRow from '../TableRow'
import { timeAgo, getVotedMembers, thousandSeperator, abbreviateHash } from '../../helpers'
import { l1Explorer } from '../../settings'
import { themeColorScheme } from '../../settings'
import { ParticipatedMembers } from '../BlsAggMembers'
import { L1Tx, L2Tx } from '../../types/HafApiResult'

const callerSummary = (tx: L1Tx | L2Tx): { primary: string; add: number } => {
  return tx.input_src === 'vsc'
    ? { primary: tx.signers[0], add: tx.signers.length - 1 }
    : tx.input_src === 'hive'
    ? {
        primary: tx.signers.active.length > 0 ? tx.signers.active[0] : tx.signers.posting[0],
        add: tx.signers.active.length + tx.signers.posting.length - 1
      }
    : { primary: '', add: 0 }
}

export const Contract = () => {
  const [txCount, setTxCount] = useState(0)
  const [contractTxs, setContractTxs] = useState<(L1Tx | L2Tx)[]>([])
  const [contractTxEnd, setContractTxEnd] = useState(false)
  const { contractId } = useParams()
  const invalidContractId = !contractId?.startsWith('vs4') && contractId?.length !== 68
  const {
    data: contract,
    isLoading,
    isSuccess,
    isError
  } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-contract', contractId],
    queryFn: async () => fetchContractByID(contractId!),
    enabled: !invalidContractId
  })
  const hasStorageProof = contract?.storage_proof.hash && contract?.storage_proof.sig && contract?.storage_proof.bv
  const { data: members } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-members-at-block', 'l2', contract?.created_in_l1_block],
    queryFn: async () => fetchMembersAtBlock(contract!.created_in_l1_block),
    enabled: !isError && !isLoading && !invalidContractId && !!hasStorageProof
  })
  const { votedMembers } = getVotedMembers((contract && contract.storage_proof.bv) ?? '0', members ?? [])
  useEffect(() => {
    if (contractId)
      fetchCallsByContractId(contractId)
        .then((txs) => {
          setContractTxs(txs)
          setTxCount(txs.length)
          if (txs.length < 100) setContractTxEnd(true)
        })
        .catch(() => {})
  }, [])
  return (
    <>
      <Box marginBottom={'15px'}>
        <Text fontSize={'5xl'}>Contract</Text>
        <Text fontSize={'2xl'} opacity={'0.7'}>
          {contractId}
        </Text>
      </Box>
      {isLoading ? <Skeleton h={'20px'} mt={'20px'} /> : null}
      {isSuccess && !contract.error ? (
        <Box>
          <Table>
            <Tbody>
              <TableRow
                label="Creation Timestamp"
                value={contract ? contract.created_at + ' (' + timeAgo(contract.created_at) + ')' : ''}
                isLoading={isLoading}
              />
              <TableRow
                label="Created In L1 Block"
                value={contract.created_in_l1_block}
                link={l1Explorer + '/b/' + contract.created_in_l1_block}
                isLoading={isLoading}
              />
              <TableRow label="Created in L1 Tx" value={contract.created_in_op} link={'/tx/' + contract.created_in_op} />
              <TableRow label="Creator" value={contract.creator} link={'/@' + contract.creator} />
              <TableRow label="Contract Code CID" value={contract.code} />
            </Tbody>
          </Table>
          <Tabs mt={'7'} colorScheme={themeColorScheme} variant={'enclosed'}>
            <TabList>
              <Tab>
                Transactions ({txCount}
                {!contractTxEnd ? '+' : ''})
              </Tab>
              {hasStorageProof ? <Tab>Storage Proof</Tab> : null}
            </TabList>
            <TabPanels mt={'2'}>
              <TabPanel>
                <Table mb={'5'}>
                  <Thead>
                    <Tr>
                      <Th textAlign={'center'}>Source</Th>
                      <Th>Transaction ID</Th>
                      <Th>Age</Th>
                      <Th>Sender</Th>
                      <Th>Action</Th>
                      <Th>Gas Used</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {contractTxs.map((tx, i) => {
                      const callerSumm = callerSummary(tx)
                      return (
                        <Tr key={i}>
                          <Td textAlign={'center'}>
                            <Badge colorScheme={themeColorScheme}>{tx.input_src}</Badge>
                          </Td>
                          <Td>
                            <Tooltip label={tx.input} placement={'top'}>
                              <Link as={ReactRouterLink} to={(tx.input_src === 'hive' ? '/tx/' : '/vsc-tx/') + tx.input}>
                                {abbreviateHash(tx.input, 20, 0)}
                              </Link>
                            </Tooltip>
                          </Td>
                          <Td>
                            <Tooltip label={tx.ts} placement={'top'}>
                              {timeAgo(tx.ts)}
                            </Tooltip>
                          </Td>
                          <Td>
                            <Tooltip label={callerSumm.primary} placement={'top'}>
                              {abbreviateHash(callerSumm.primary, 20, 0)}
                            </Tooltip>
                            {callerSumm.add > 0 ? (
                              <Text fontStyle={'italic'} opacity={'0.5'}>{` (+${callerSumm.add})`}</Text>
                            ) : (
                              ''
                            )}
                          </Td>
                          <Td>{tx.contract_action}</Td>
                          <Td isNumeric>
                            {typeof tx.io_gas === 'number' ? (
                              thousandSeperator(tx.io_gas)
                            ) : (
                              <Text fontStyle={'italic'} opacity={'0.5'}>
                                Pending...
                              </Text>
                            )}
                          </Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
                {!contractTxEnd && contractTxs.length > 0 ? (
                  <Center>
                    <Button
                      as={ReactRouterLink}
                      colorScheme={themeColorScheme}
                      onClick={(evt) => {
                        evt.preventDefault()
                        fetchCallsByContractId(
                          contractId!,
                          100,
                          (contractTxs[contractTxs.length - 1].id as unknown as number) - 1
                        )
                          .then((moarTxs) => {
                            moarTxs.forEach((t) => contractTxs.push(t))
                            setContractTxs(contractTxs)
                            setTxCount(contractTxs.length)
                            if (moarTxs.length < 100) setContractTxEnd(true)
                          })
                          .catch(() => {})
                      }}
                    >
                      Load More
                    </Button>
                  </Center>
                ) : null}
              </TabPanel>
              {hasStorageProof ? (
                <TabPanel>
                  <ParticipatedMembers
                    bvHex={contract.storage_proof.bv!}
                    sig={contract.storage_proof.sig!}
                    members={votedMembers.map((m) => m.username)}
                    isLoading={isLoading}
                  />
                </TabPanel>
              ) : null}
            </TabPanels>
          </Tabs>
        </Box>
      ) : isSuccess && contract.error ? (
        <Text>{contract.error}</Text>
      ) : isError ? (
        <Text>Failed to fetch contract</Text>
      ) : null}
    </>
  )
}
