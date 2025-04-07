import { useEffect, useState } from 'react'
import {
  Text,
  Heading,
  Box,
  Link,
  Skeleton,
  Table,
  TableContainer,
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
  Center,
  Flex,
  Card,
  CardBody,
  Spinner,
  Stack
} from '@chakra-ui/react'
import { CheckCircleIcon, QuestionIcon, WarningIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router'
import { fetchCallsByContractId, fetchContractByID } from '../../requests'
import TableRow from '../TableRow'
import { timeAgo, thousandSeperator, abbreviateHash } from '../../helpers'
import { cvApi, l1Explorer } from '../../settings'
import { themeColorScheme } from '../../settings'
// import { ParticipatedMembers } from '../BlsAggMembers'
import { L1ContractCallTx, L2ContractCallTx } from '../../types/HafApiResult'
import { cvInfo, fetchSrcFiles } from '../../cvRequests'
import { SourceFile } from '../SourceFile'
import { CopyButton } from '../CopyButton'

const callerSummary = (tx: L1ContractCallTx | L2ContractCallTx): { primary: string; add: number } => {
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
  const [contractTxs, setContractTxs] = useState<(L1ContractCallTx | L2ContractCallTx)[]>([])
  const [contractTxEnd, setContractTxEnd] = useState(false)
  const { contractId } = useParams()
  const invalidContractId = !contractId?.startsWith('vs4') && contractId?.length !== 68
  const {
    data: contract,
    isLoading,
    isSuccess,
    isError
  } = useQuery({
    queryKey: ['vsc-contract', contractId],
    queryFn: async () => fetchContractByID(contractId!),
    enabled: !invalidContractId
  })
  const hasStorageProof = contract?.storage_proof.hash && contract?.storage_proof.sig && contract?.storage_proof.bv
  // const { data: members } = useQuery({
  //   queryKey: ['vsc-members-at-block', 'l2', contract?.created_in_l1_block],
  //   queryFn: async () => fetchMembersAtBlock(contract!.created_in_l1_block),
  //   enabled: !isError && !isLoading && !invalidContractId && !!hasStorageProof
  // })
  // const { votedMembers } = getVotedMembers((contract && contract.storage_proof.bv) ?? '0', members ?? [])
  const {
    data: verifInfo,
    error: verifError,
    isLoading: verifLoading
  } = useQuery({
    queryKey: ['vsc-cv-verif-info', contractId],
    queryFn: async () => cvInfo(contractId!),
    enabled: !invalidContractId
  })
  const { data: verifFiles } = useQuery({
    queryKey: ['vsc-cv-files', contractId],
    queryFn: async () => fetchSrcFiles(contractId!),
    enabled: !invalidContractId && !!verifInfo && verifInfo.status === 'success'
  })
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
          <TableContainer>
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
                <TableRow label="Bytecode CID">
                  <Flex align={'center'} gap={'2'}>
                    <Text>{contract.code}</Text>
                    {verifInfo && verifInfo.status === 'success' ? <CheckCircleIcon color={themeColorScheme} /> : null}
                  </Flex>
                </TableRow>
              </Tbody>
            </Table>
          </TableContainer>
          <Tabs mt={'7'} colorScheme={themeColorScheme} variant={'solid-rounded'}>
            <TabList overflow={'scroll'} whiteSpace={'nowrap'}>
              <Tab>
                Transactions ({txCount}
                {!contractTxEnd ? '+' : ''})
              </Tab>
              {hasStorageProof ? <Tab>Storage Proof</Tab> : null}
              <Tab>Source Code</Tab>
            </TabList>
            <TabPanels mt={'2'}>
              <TabPanel>
                <TableContainer>
                  <Table mb={'5'}>
                    <Thead>
                      <Tr>
                        <Th textAlign={'center'}>Source</Th>
                        <Th>Transaction ID</Th>
                        <Th>Age</Th>
                        <Th>Action</Th>
                        <Th>Sender</Th>
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
                            <Td>{tx.contract_action}</Td>
                            <Td>
                              <Tooltip label={callerSumm.primary} placement={'top'}>
                                <Link
                                  as={ReactRouterLink}
                                  to={(tx.input_src === 'vsc' ? '/address/' : '/@') + callerSumm.primary}
                                >
                                  {abbreviateHash(callerSumm.primary, 20, 0)}
                                </Link>
                              </Tooltip>
                              {callerSumm.add > 0 ? (
                                <Text fontStyle={'italic'} opacity={'0.5'}>{` (+${callerSumm.add})`}</Text>
                              ) : (
                                ''
                              )}
                            </Td>
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
                </TableContainer>
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
                  {/* <ParticipatedMembers
                    bvHex={contract.storage_proof.bv!}
                    sig={contract.storage_proof.sig!}
                    members={votedMembers.map((m) => m.username)}
                    isLoading={isLoading}
                  /> */}
                </TabPanel>
              ) : null}
              <TabPanel>
                {verifInfo ? (
                  verifInfo.status === 'success' ? (
                    <>
                      <Flex align={'center'} gap={'2'}>
                        <CheckCircleIcon color={themeColorScheme} />
                        <Heading fontSize={'md'}>Contract source code verified</Heading>
                      </Flex>
                      <Text m={'5px 0'}>
                        VSC Blocks has verified that the source code below matches the deployed bytecode for the contract. This
                        does not mean the contract is safe to interact with.
                      </Text>
                      <Card mt={'5'} mb={'5'}>
                        <CardBody>
                          <TableContainer>
                            <Table variant={'unstyled'}>
                              <Tbody>
                                <TableRow label="Language" value={verifInfo.lang} isInCard minimalSpace />
                                <TableRow label="License" value={verifInfo.license} isInCard minimalSpace />
                                <TableRow label="Verified At" isInCard minimalSpace>
                                  {verifInfo.verified_ts + ' (' + timeAgo(verifInfo.verified_ts) + ')'}
                                </TableRow>
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </CardBody>
                      </Card>
                      <Stack direction="row" justifyContent="space-between" align="flex-end">
                        <Box fontSize={'lg'}>
                          <b>Dependencies</b>
                          {!!verifInfo.lockfile ? (
                            <Box display={'inline'}>
                              {' ('}
                              <Link href={`${cvApi}/contract/${contractId}/files/cat/${verifInfo.lockfile}`} target="_blank">
                                View lockfile
                              </Link>
                              {')'}
                            </Box>
                          ) : (
                            ''
                          )}
                        </Box>
                        <CopyButton text={JSON.stringify(verifInfo.dependencies, null, 2)} />
                      </Stack>
                      <SourceFile content={JSON.stringify(verifInfo.dependencies, null, 2)} />
                      {!!verifFiles
                        ? verifFiles.map((f, i) => (
                            <Box key={i} mt="3" mb="3">
                              <Stack direction="row" justifyContent="space-between" align="flex-end">
                                <Text fontSize={'lg'}>
                                  <b>
                                    File {i + 1} of {verifFiles.length}:
                                  </b>{' '}
                                  {f.name}
                                </Text>
                                <CopyButton text={f.content} />
                              </Stack>
                              <SourceFile content={f.content} />
                            </Box>
                          ))
                        : null}
                    </>
                  ) : verifInfo.status === 'queued' ? (
                    <Flex align={'center'} gap={'2'}>
                      <Spinner size={'sm'} />
                      <Text fontSize={'md'}>Contract verification request is currently in queue.</Text>
                    </Flex>
                  ) : verifInfo.status === 'in progress' ? (
                    <Flex align={'center'} gap={'2'}>
                      <Spinner size={'sm'} />
                      <Text fontSize={'md'}>Contract verification request is currently being processed.</Text>
                    </Flex>
                  ) : verifInfo.status === 'failed' ? (
                    <Flex align={'center'} gap={'2'}>
                      <WarningIcon />
                      <Text fontSize={'md'}>Contract verification failed to complete.</Text>
                    </Flex>
                  ) : verifInfo.status === 'not match' ? (
                    <Flex align={'center'} gap={'2'}>
                      <WarningIcon />
                      <Text fontSize={'md'}>
                        Contract verification failed due to non-matching deployed bytecode from compiled source code.
                      </Text>
                    </Flex>
                  ) : verifInfo.status === 'pending' ? (
                    <Flex align={'center'} gap={'2'}>
                      <Spinner size={'sm'} />
                      <Text fontSize={'md'}>Contract verification request is currently pending.</Text>
                    </Flex>
                  ) : null
                ) : verifError ? (
                  <Text>Failed to fetch contract verification status.</Text>
                ) : verifLoading ? (
                  <Flex align={'center'} gap={'2'}>
                    <Spinner size={'sm'} />
                    <Text fontSize={'md'}>Loading contract verification status...</Text>
                  </Flex>
                ) : (
                  <>
                    <Flex align={'center'} gap={'2'}>
                      <QuestionIcon color={themeColorScheme} />
                      <Heading fontSize={'md'}>Contract source code not verified</Heading>
                    </Flex>
                    <Text m={'5px 0'}>Source code for this contract is unknown.</Text>
                  </>
                )}
              </TabPanel>
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
