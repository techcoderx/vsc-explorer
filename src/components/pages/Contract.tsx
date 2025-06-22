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
  Tag,
  Flex,
  Card,
  CardBody,
  Spinner,
  Stack
} from '@chakra-ui/react'
import { CheckCircleIcon, QuestionIcon, WarningIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { fetchL2TxnsBy, useContracts } from '../../requests'
import TableRow from '../TableRow'
import { timeAgo } from '../../helpers'
import { cvApi, l1Explorer } from '../../settings'
import { themeColorScheme } from '../../settings'
import { Flairs } from '../../flairs'
import { cvInfo, fetchSrcFiles } from '../../cvRequests'
import { SourceFile } from '../SourceFile'
import { CopyButton } from '../CopyButton'
import { Txns } from '../tables/Transactions'
import { AddressBalanceCard } from './address/Balances'

export const Contract = () => {
  const { contractId } = useParams()
  const invalidContractId = !contractId?.startsWith('vsc1')
  const { contracts: ct, isLoading, isError } = useContracts({ byId: contractId })
  const contract = ct && ct.length > 0 ? ct[0] : null
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
  const { data: txns } = useQuery({
    queryKey: ['vsc-txs-contract', contractId],
    queryFn: async () => fetchL2TxnsBy(0, 100, { byContract: contractId }),
    enabled: !invalidContractId
  })
  return (
    <>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Box mb={'4'}>
          <Text fontSize={'5xl'}>Contract</Text>
          <Text fontSize={'2xl'} opacity={'0.7'}>
            {contractId}
          </Text>
        </Box>
        {Flairs[contractId!] && (
          <Tag colorScheme={themeColorScheme} size={'lg'} variant={'outline'} alignSelf={'end'} mb={'3'}>
            {Flairs[contractId!]}
          </Tag>
        )}
      </Stack>
      <hr />
      {isLoading ? <Skeleton h={'20px'} mt={'20px'} /> : null}
      {!!contract ? (
        <Box mt={'4'}>
          <AddressBalanceCard addr={contract.id} />
          <Tabs mt={'7'} colorScheme={themeColorScheme} variant={'solid-rounded'}>
            <TabList overflow={'scroll'} whiteSpace={'nowrap'}>
              <Tab>Transactions</Tab>
              <Tab>Info</Tab>
              <Tab>Source Code</Tab>
            </TabList>
            <TabPanels mt={'2'}>
              <TabPanel pt={'2'} px={'0'}>
                <Txns txs={txns?.txns || []} />
              </TabPanel>
              <TabPanel px={'0'}>
                <TableContainer>
                  <Table>
                    <Tbody>
                      <TableRow
                        label="Created At"
                        value={contract ? contract.creation_ts + ' (' + timeAgo(contract.creation_ts) + ')' : ''}
                        isLoading={isLoading}
                      />
                      <TableRow
                        label="Created In L1 Block"
                        value={contract.creation_height}
                        link={l1Explorer + '/b/' + contract.creation_height}
                        isLoading={isLoading}
                      />
                      <TableRow label="Creation Tx" value={contract.tx_id} link={'/tx/' + contract.tx_id} />
                      <TableRow label="Creator" value={contract.creator} link={'/address/hive:' + contract.creator} />
                      <TableRow label="Bytecode CID">
                        <Flex align={'center'} gap={'2'}>
                          <Text>{contract.code}</Text>
                          {verifInfo && verifInfo.status === 'success' ? (
                            <CheckCircleIcon color={themeColorScheme} aria-label="Contract source code verified" />
                          ) : null}
                        </Flex>
                      </TableRow>
                      <TableRow label="Runtime" value={contract.runtime} />
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
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
      ) : isError ? (
        <Text>Failed to fetch contract</Text>
      ) : (
        <Text>Contract does not exist</Text>
      )}
    </>
  )
}
