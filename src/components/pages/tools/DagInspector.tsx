import { useEffect, useState } from 'react'
import { Box, Button, Card, CardBody, CardHeader, Flex, Heading, HStack, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { useSearchParams } from 'react-router'
import { themeColorLight, themeColorScheme } from '../../../settings'
import { useDagByCID } from '../../../requests'
import JsonToTableRecursive from '../../JsonTableRecursive'
import { CopyButton } from '../../CopyButton'

export const DagInspector = () => {
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [cid, setCid] = useState<string>(searchParams.get('cid') || '')
  const [cidToQuery, setCidToQuery] = useState<string>(searchParams.get('cid') || '')
  const { data: dag, isLoading, isError } = useDagByCID<object>(cidToQuery, !!cidToQuery, false)
  useEffect(() => {
    if (isError) {
      const t = toast({
        title: 'Failed to fetch DAG',
        status: 'error'
      })
      return () => toast.close(t)
    }
  }, [isError])
  const inspectClicked = () => {
    if (!cid)
      return toast({
        title: 'Please enter a CID',
        status: 'error'
      })
    setCidToQuery(cid)
  }
  return (
    <>
      <Text fontSize={'5xl'}>DAG Inspector</Text>
      <Text mb={'6'}>View the contents of a DAG by CID pinned by nodes.</Text>
      <HStack gap={'3'} mb={'6'}>
        <Input
          type="text"
          placeholder="Paste CID here (bafy...)"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' ? inspectClicked() : null)}
          focusBorderColor={themeColorLight}
        />
        <Button colorScheme={themeColorScheme} onClick={inspectClicked} disabled={isLoading}>
          <Flex gap={'2'} align={'center'}>
            <Spinner size={'sm'} hidden={!isLoading} />
            <Text>Inspect</Text>
          </Flex>
        </Button>
      </HStack>
      {!!dag && (
        <Card>
          <Box position={'absolute'} top={'3'} right={'3'}>
            <CopyButton text={JSON.stringify(dag, null, 2)} />
          </Box>
          <CardHeader>
            <Heading fontSize={'xl'}>DAG content</Heading>
          </CardHeader>
          <CardBody mt={'-6'}>
            <JsonToTableRecursive json={dag} isInCard minimalSpace />
          </CardBody>
        </Card>
      )}
    </>
  )
}
