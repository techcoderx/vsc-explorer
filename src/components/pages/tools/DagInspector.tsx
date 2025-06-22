import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Input,
  Spinner,
  Switch,
  Text,
  useToast
} from '@chakra-ui/react'
import { useSearchParams } from 'react-router'
import { themeColorLight, themeColorScheme } from '../../../settings'
import { useDagByCID } from '../../../requests'
import JsonToTableRecursive from '../../JsonTableRecursive'
import { CopyButton } from '../../CopyButton'
import { SourceFile } from '../../SourceFile'

export const DagInspector = () => {
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [rawJson, setRawJson] = useState<boolean>(false)
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
  console.log(JSON.stringify(dag, null, 2))
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
            <HStack gap={'4'}>
              <Heading fontSize={'xl'}>DAG content</Heading>
              <HStack gap={'2'}>
                <Switch colorScheme={themeColorScheme} isChecked={rawJson} onChange={() => setRawJson((v) => !v)} />
                <Text>Raw JSON</Text>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody mt={'-6'}>
            {rawJson ? (
              <SourceFile content={JSON.stringify(dag, null, 2)} />
            ) : (
              <JsonToTableRecursive json={dag} isInCard minimalSpace />
            )}
          </CardBody>
        </Card>
      )}
    </>
  )
}
