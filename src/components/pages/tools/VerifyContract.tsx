import { InfoIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Code,
  Flex,
  Heading,
  Link,
  Stack,
  StackDivider,
  Step,
  Stepper,
  StepIndicator,
  StepStatus,
  StepDescription,
  StepIcon,
  StepNumber,
  StepTitle,
  StepSeparator,
  Text,
  useSteps,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Input,
  useBreakpointValue,
  useToast,
  Spinner,
  ToastId
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useSearchParams, Link as ReactRouterLink } from 'react-router'
import { themeColorScheme, themeColorLight, cvApi } from '../../../settings'
import MultiFileInput from '../../MultiFileInput'
import { isValidJSONStr } from '../../../helpers'
import { cvInfo } from '../../../cvRequests'
import { fetchContracts } from '../../../requests'

const steps = [
  {
    title: 'Notice',
    description: 'Read This First'
  },
  {
    title: 'Contract Info',
    description: 'Particulars'
  },
  {
    title: 'Upload',
    description: 'Source Code'
  }
]

const notice = [
  {
    title: 'Language',
    body: <Text>The contract verifier supports AssemblyScript (AS) source files only. Other languages are WIP.</Text>
  },
  {
    title: 'Compiler Options',
    body: (
      <Text>
        There is currently no way to set custom compiler options yet. The verifier uses{' '}
        <Code>--optimize --exportRuntime --runPasses asyncify</Code> for AS contracts.
      </Text>
    )
  },
  {
    title: 'Entrypoint',
    body: (
      <Text>
        The entrypoint filename must be <Code>index.ts</Code> for AS contracts. Please ensure that this file exists and exports
        all public methods.
      </Text>
    )
  },
  {
    title: 'Folder Structure',
    body: (
      <Text>
        All source code files must not be located in any sub-folders. See example in{' '}
        <Link href="https://github.com/vsc-eco/btc-relay/tree/main/assembly" target="_blank">
          BTC relay contract
        </Link>
        .
      </Text>
    )
  },
  {
    title: 'Experimental',
    body: (
      <Text>
        This tool is currently <b>experimental</b> and some issues may be expected. User authentication is disabled for now. Use
        at your own risk.
      </Text>
    )
  }
]

const licenses = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0-only',
  'GPL-3.0-or-later',
  'LGPL-3.0-only',
  'LGPL-3.0-or-later',
  'AGPL-3.0-only',
  'AGPL-3.0-or-later',
  'MPL 2.0',
  'BSL-1.0',
  'WTFPL',
  'Unlicense'
]

export const VerifyContract = () => {
  const [searchParams] = useSearchParams()
  const { activeStep: stage, setActiveStep: setStage } = useSteps({
    index: searchParams.get('skipnotice') === '1' ? 1 : 0,
    count: steps.length
  })
  const stepOrient: 'vertical' | 'horizontal' | undefined = useBreakpointValue({
    base: 'vertical',
    md: 'horizontal'
  })
  const [addr, setAddr] = useState<string>(searchParams.get('address') || '')
  const [license, setLicense] = useState<string>()
  const [deps, setDeps] = useState<string>()
  const [files, setFiles] = useState<File[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const toast = useToast()
  const toastRef = useRef<ToastId>()
  const nextClicked = async () => {
    let e = ''
    if (!addr.startsWith('vsc1')) {
      e = "Contract address must start with 'vsc1'"
    } else if (!license) {
      e = 'Please select a license'
    } else if (!deps || !isValidJSONStr(deps)) {
      e = 'Dependencies must be a valid JSON'
    }
    if (e) {
      return toast({ title: e, status: 'error' })
    }

    try {
      setIsSpinning(true)
      const verifInfo = await cvInfo(addr)
      if (verifInfo && (verifInfo.status === 'queued' || verifInfo.status === 'in progress' || verifInfo.status === 'success')) {
        setIsSpinning(false)
        return toast({ title: 'Contract is already verified or being verified.', status: 'error' })
      }
      if (!verifInfo) {
        const ct = await fetchContracts({ byId: addr })
        if (!ct || ct.length === 0) {
          setIsSpinning(false)
          return toast({ title: 'Contract not found', status: 'error' })
        }
      }
    } catch {
      setIsSpinning(false)
      return toast({ title: 'Failed to call backend for contract verification status', status: 'error' })
    }
    setIsSpinning(false)
    setStage(2)
  }
  const submitClicked = async () => {
    if (files.length === 0)
      return toast({
        title: 'Please choose a file',
        status: 'error'
      })
    setIsSpinning(true)
    toastRef.current = toast({
      title: 'Submitting verification request...',
      description: '(1/3) Preparing request...',
      status: 'loading',
      duration: null
    })
    try {
      let createReq = await fetch(`${cvApi}/verify/${addr}/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ license, dependencies: JSON.parse(deps!) })
      })
      if (createReq.status !== 200) {
        setIsSpinning(false)
        let e = await createReq.json()
        toast.update(toastRef.current, { title: 'Error', description: e.error, status: 'error', duration: 15000 })
        return
      }
      for (let f in files) {
        toast.update(toastRef.current, {
          description: `(2/3) Uploading file ${parseInt(f) + 1} of ${files.length}: ${files[f].name}`
        })
        const fd = new FormData()
        fd.append('file', files[f])
        fd.append('filename', files[f].name)
        const uploadReq = await fetch(`${cvApi}/verify/${addr}/upload`, {
          method: 'POST',
          body: fd
        })
        if (uploadReq.status !== 200) {
          setIsSpinning(false)
          let e = await uploadReq.json()
          toast.update(toastRef.current, { title: 'Error', description: e.error, status: 'error', duration: 15000 })
          return
        }
      }
      toast.update(toastRef.current, { description: '(3/3) Finalizing upload...' })
      const finalizeReq = await fetch(`${cvApi}/verify/${addr}/complete`, { method: 'POST' })
      if (finalizeReq.status !== 200) {
        setIsSpinning(false)
        let e = await finalizeReq.json()
        toast.update(toastRef.current, { title: 'Error', description: e.error, status: 'error', duration: 15000 })
        return
      }
      toast.update(toastRef.current, {
        title: 'Success',
        description: 'Contract verification request submitted successfully!',
        status: 'success',
        duration: 30000
      })
      setIsSpinning(false)
      setStage(3)
    } catch {
      setIsSpinning(false)
      toast.update(toastRef.current, { title: 'Error', description: 'Unknown error occurred', status: 'error', duration: 15000 })
      return
    }
  }
  return (
    <>
      <Text fontSize={'5xl'}>Verify Contract</Text>
      <Text mb={'6'}>
        Submit contract source code to VSC Blocks to verify that the resulting compiled bytecode matches the deployed contract
        bytecode.
      </Text>
      <Center>
        <Stack direction="column" gap={'6'} maxW={'4xl'} w={'100%'}>
          <Stepper
            size="lg"
            index={stage}
            colorScheme={themeColorScheme}
            orientation={stepOrient}
            height={stepOrient === 'vertical' ? '200px' : undefined}
            gap={stepOrient === 'vertical' ? 0 : undefined}
          >
            {steps.map((s, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{s.title}</StepTitle>
                  <StepDescription>{s.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>
          {stage === 0 ? (
            <Box>
              <Card mb={'3'}>
                <CardHeader>
                  <Heading fontSize={'2xl'}>
                    <Flex align={'center'} gap={'2'}>
                      <InfoIcon />
                      Read This First!
                    </Flex>
                  </Heading>
                </CardHeader>
                <CardBody mt={'-20px'}>
                  <Stack divider={<StackDivider />} spacing={'3'}>
                    {notice.map((n, i) => (
                      <Box key={i}>
                        <Heading size={'sm'} textTransform={'uppercase'}>
                          {n.title}
                        </Heading>
                        <Box pt={'2'}>{n.body}</Box>
                      </Box>
                    ))}
                  </Stack>
                </CardBody>
              </Card>
              <Center>
                <Button colorScheme={themeColorScheme} onClick={() => setStage(1)}>
                  Next
                </Button>
              </Center>
            </Box>
          ) : stage === 1 ? (
            <Box>
              <Card mb={'3'}>
                <CardBody>
                  <Stack direction={'column'} gap={'3'}>
                    <FormControl>
                      <FormLabel>Contract Address</FormLabel>
                      <Input
                        type="text"
                        placeholder="vsc1..."
                        value={addr}
                        onChange={(e) => setAddr(e.target.value)}
                        focusBorderColor={themeColorLight}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>License</FormLabel>
                      <Select
                        focusBorderColor={themeColorLight}
                        placeholder="Choose a license..."
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                      >
                        {licenses.map((l, i) => (
                          <option key={i} value={l}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Dependencies</FormLabel>
                      <Textarea
                        focusBorderColor={themeColorLight}
                        placeholder="Copy dependencies from package.json here"
                        value={deps}
                        onChange={(e) => setDeps(e.target.value)}
                      ></Textarea>
                    </FormControl>
                  </Stack>
                </CardBody>
              </Card>
              <Center>
                <Stack direction="row" gap="3">
                  <Button onClick={() => setStage(0)}>Previous</Button>
                  <Button colorScheme={themeColorScheme} onClick={nextClicked} disabled={isSpinning}>
                    <Flex gap={'2'} align={'center'}>
                      <Spinner size={'sm'} hidden={!isSpinning} />
                      <Text>Next</Text>
                    </Flex>
                  </Button>
                </Stack>
              </Center>
            </Box>
          ) : stage === 2 ? (
            <Box>
              <Card mb={'3'}>
                <CardBody>
                  <FormControl>
                    <MultiFileInput files={files} setFiles={setFiles} accept=".ts" onChange={(f) => setFiles(f)} />
                  </FormControl>
                </CardBody>
              </Card>
              <Center>
                <Stack direction="row" gap="3">
                  <Button onClick={() => setStage(1)}>Previous</Button>
                  <Button colorScheme={themeColorScheme} onClick={submitClicked} disabled={isSpinning}>
                    <Flex gap={'2'} align={'center'}>
                      <Spinner size={'sm'} hidden={!isSpinning} />
                      <Text>Submit</Text>
                    </Flex>
                  </Button>
                </Stack>
              </Center>
            </Box>
          ) : stage === 3 ? (
            <Flex direction="column" gap={'5'} align={'center'}>
              <Text fontSize={'9xl'}>🎉</Text>
              <Text>
                Your contract source code is being verified. This may take a few minutes depending on the queue. Refer to the
                Source Code tab in contract page for status.
              </Text>
              <Button colorScheme={themeColorScheme} as={ReactRouterLink} to={`/contract/${addr}`}>
                View Contract
              </Button>
            </Flex>
          ) : null}
        </Stack>
      </Center>
    </>
  )
}
