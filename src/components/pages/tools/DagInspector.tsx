import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Input,
  Spinner,
  Switch,
  Text
} from '@chakra-ui/react'
import { useSearchParams } from 'react-router'
import { themeColorScheme } from '../../../settings'
import { useDagByCID } from '../../../requests'
import JsonToTableRecursive from '../../JsonTableRecursive'
import { CopyButton } from '../../CopyButton'
import { SourceFile } from '../../SourceFile'
import { PageTitle } from '../../PageTitle'
import { toaster } from '../../ui/toaster'

export const DagInspector = () => {
  const [searchParams] = useSearchParams()
  const [rawJson, setRawJson] = useState<boolean>(false)
  const [cid, setCid] = useState<string>(searchParams.get('cid') || '')
  const [cidToQuery, setCidToQuery] = useState<string>(searchParams.get('cid') || '')
  const { data: dag, isLoading, isError } = useDagByCID<object>(cidToQuery, !!cidToQuery, false)
  useEffect(() => {
    if (isError) {
      toaster.error({
        title: 'Failed to fetch DAG'
      })
    }
  }, [isError])
  const inspectClicked = () => {
    if (!cid)
      return toaster.error({
        title: 'Please enter a CID'
      })
    setCidToQuery(cid)
  }
  return (
    <>
      <PageTitle title="DAG Inspector" />
      <Heading as="h1" size="5xl" fontWeight="normal">DAG Inspector</Heading>
      <Text mb={'6'}>View the contents of a DAG by CID pinned by nodes.</Text>
      <HStack gap={'3'} mb={'6'}>
        <Input
          type="text"
          placeholder="Paste CID here (bafy...)"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' ? inspectClicked() : null)}

        />
        <Button colorPalette={themeColorScheme} onClick={inspectClicked} disabled={isLoading}>
          <Flex gap={'2'} align={'center'}>
            <Spinner size={'sm'} hidden={!isLoading} />
            <Text>Inspect</Text>
          </Flex>
        </Button>
      </HStack>
      {!!dag && (
        <Card.Root>
          <Box position={'absolute'} top={'3'} right={'3'}>
            <CopyButton text={JSON.stringify(dag, null, 2)} />
          </Box>
          <Card.Header pb={'4'}>
            <HStack gap={'4'}>
              <Heading fontSize={'xl'}>DAG content</Heading>
              <HStack gap={'2'}>
                <Switch.Root colorPalette={themeColorScheme} checked={rawJson} onCheckedChange={(e) => setRawJson(e.checked)}>
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
                <Text>Raw JSON</Text>
              </HStack>
            </HStack>
          </Card.Header>
          <Card.Body pt={'0'}>
            {rawJson ? (
              <SourceFile content={JSON.stringify(dag, null, 2)} />
            ) : (
              <JsonToTableRecursive json={dag} isInCard minimalSpace />
            )}
          </Card.Body>
        </Card.Root>
      )}
    </>
  )
}
