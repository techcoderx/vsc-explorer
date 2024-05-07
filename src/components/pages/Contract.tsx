import { Text, Box, Skeleton, Table, Tbody, Tabs, Tab, TabList, TabPanels, TabPanel } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { fetchContractByID, fetchMembersAtBlock } from '../../requests'
import TableRow from '../TableRow'
import { timeAgo, getVotedMembers } from '../../helpers'
import { l1Explorer } from '../../settings'
import { themeColorScheme } from '../../settings'
import { ParticipatedMembers } from '../BlsAggMembers'

export const Contract = () => {
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
  const votedMembers = getVotedMembers((contract && contract.storage_proof.bv) ?? '0', members ?? [])
  return (
    <>
      <Box marginBottom={'15px'}>
        <Text fontSize={'5xl'}>Contract</Text>
        <Text fontSize={'3xl'} opacity={'0.7'}>
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
          {hasStorageProof ? (
            <Tabs mt={'7'} colorScheme={themeColorScheme} variant={'enclosed'}>
              <TabList>
                <Tab>Storage Proof</Tab>
              </TabList>
              <TabPanels mt={'2'}>
                <TabPanel>
                  <ParticipatedMembers
                    bvHex={contract.storage_proof.bv!}
                    sig={contract.storage_proof.sig!}
                    members={votedMembers}
                    isLoading={isLoading}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : null}
        </Box>
      ) : isSuccess && contract.error ? (
        <Text>{contract.error}</Text>
      ) : isError ? (
        <Text>Failed to fetch contract</Text>
      ) : null}
    </>
  )
}
