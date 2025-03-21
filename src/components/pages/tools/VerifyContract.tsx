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
  Spinner
} from '@chakra-ui/react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { themeColorScheme, themeColorLight } from '../../../settings'
import MultiFileInput from '../../MultiFileInput'
import { isValidJSONStr } from '../../../helpers'
import { cvInfo } from '../../../cvRequests'
import { fetchContractByID } from '../../../requests'

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
  const nextClicked = async () => {
    let e = ''
    if (!addr.startsWith('vs4')) {
      e = "Contract address must start with 'vs4'"
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
        const contractInf = await fetchContractByID(addr)
        if (contractInf.error) {
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
                        placeholder="vs4..."
                        value={addr}
                        onChange={(e) => setAddr(e.target.value)}
                        focusBorderColor={themeColorLight}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Language</FormLabel>
                      <Select focusBorderColor={themeColorLight} disabled>
                        <option value="assemblyscript">AssemblyScript</option>
                      </Select>
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
                  <Button colorScheme={themeColorScheme} onClick={nextClicked}>
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
                    <MultiFileInput accept=".ts" onChange={(f) => setFiles(f)} />
                  </FormControl>
                </CardBody>
              </Card>
              <Center>
                <Stack direction="row" gap="3">
                  <Button onClick={() => setStage(1)}>Previous</Button>
                  <Button colorScheme={themeColorScheme} onClick={submitClicked}>
                    Submit
                  </Button>
                </Stack>
              </Center>
            </Box>
          ) : null}
        </Stack>
      </Center>
    </>
  )
}
