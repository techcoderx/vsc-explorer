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
  Text,
  useSteps,
  FormControl,
  FormLabel,
  Select,
  Input,
  useToast,
  Spinner,
  ToastId,
  useDisclosure,
  Icon
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useSearchParams, Link as ReactRouterLink } from 'react-router'
import { useAioha } from '@aioha/providers/react'
import { KeyTypes, Providers } from '@aioha/aioha'
import { themeColorScheme, themeColorLight, cvApi } from '../../../settings'
import { cvInfo } from '../../../cvRequests'
import { fetchContracts } from '../../../requests'
import { PageTitle } from '../../PageTitle'
import { AiohaModal } from '../../Aioha'
import { generateMessageToSign } from '../../../helpers'
import { FaHive } from 'react-icons/fa6'

const tinygoVersions: { [v: string]: { go: string; llvm: string; img_digest: string } } = {
  '0.39.0': {
    go: '1.25.0',
    llvm: '19.1.2',
    img_digest: 'sha256:0e51d243c1b84ec650f2dcd1cce3a09bb09730e1134771aeace2240ade4b32f5'
  },
  '0.38.0': {
    go: '1.24.4',
    llvm: '19.1.2',
    img_digest: 'sha256:98447dff0e56426b98f96a1d47ac7c1d82d27e3cd630cba81732cfc13c9a410f'
  }
}

const wasmStripTools = [
  ['', 'N/A'],
  ['wabt', 'Wabt (v1.0.37)'],
  ['wasm-tools', 'Wasm Tools (v1.239.0)']
]

const notice = [
  {
    title: 'Language',
    body: <Text>The contract verifier supports contracts written in Go only.</Text>
  },
  {
    title: 'Compiler Options',
    body: (
      <Text>
        There is currently no way to set custom compiler options yet. The verifier uses{' '}
        <Code>-gc=custom -scheduler=none -panic=trap -no-debug -target=wasm-unknown</Code> for Go contracts.
      </Text>
    )
  },
  {
    title: 'Environment',
    body: (
      <Text>
        Contracts are compiled using the official{' '}
        <Link href="https://hub.docker.com/r/tinygo/tinygo" target="_blank">
          TinyGo Docker image
        </Link>
        .
      </Text>
    )
  },
  {
    title: 'Entrypoint',
    body: (
      <Text>
        The entrypoint filename must be <Code>contract/main.go</Code> for Go contracts. Please ensure that this file exists as
        part of the main package.
      </Text>
    )
  },
  {
    title: 'Dependencies',
    body: <Text>The contract verifier does not support importing external packages outside of Go standard library for now.</Text>
  },
  {
    title: 'Experimental',
    body: (
      <Text>
        This tool is currently <b>experimental</b> and some issues are to be expected. It is only available for whitelisted users
        for now.
      </Text>
    )
  }
]

export const VerifyContract = () => {
  const [searchParams] = useSearchParams()
  const { aioha, user, provider } = useAioha()
  const { activeStep: stage, setActiveStep: setStage } = useSteps({
    index: searchParams.get('skipnotice') === '1' ? 1 : 0,
    count: 2
  })
  const [addr, setAddr] = useState<string>(searchParams.get('address') || '')
  const [repoUrl, setRepoUrl] = useState<string>('')
  const [gitBranch, setGitBranch] = useState<string>('')
  const [tinygoVersion, setTinyGoVersion] = useState<string>('0.39.0')
  const [wasmStripTool, setWasmStripTool] = useState<string>('')
  const [isSpinning, setIsSpinning] = useState(false)
  const toast = useToast()
  const toastRef = useRef<ToastId>()
  const walletDisclosure = useDisclosure()
  const submitClicked = async () => {
    let e = ''
    if (!addr.startsWith('vsc1')) {
      e = "Contract address must start with 'vsc1'"
    } else if (!repoUrl.startsWith('https://github.com/')) {
      e = 'Repository URL must be a GitHub link'
    }
    const repoId = repoUrl.replace('https://github.com/', '')
    const repoIdParts = repoId.split('/')
    if (repoIdParts.length !== 2) {
      e = 'Invalid GitHub repository URL'
    } else if (repoIdParts[0].length > 39 || !/^[A-Za-z0-9-]+$/.test(repoIdParts[0])) {
      e = 'Invalid Github user'
    } else if (repoIdParts[1].length > 100 || !/^[A-Za-z0-9._-]+$/.test(repoIdParts[1])) {
      e = 'Invalid Github repo name'
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
    try {
      let fetchedRepo = await fetch(`https://api.github.com/repos/${repoId}`)
      if (fetchedRepo.status !== 200) {
        return toast({ title: 'Failed to fetch repository info with status code ' + fetchedRepo.status, status: 'error' })
      }
      if (gitBranch.length > 0) {
        let fetchedBranch = await fetch(`https://api.github.com/repos/${repoId}/branches/${gitBranch}`)
        if (fetchedBranch.status !== 200) {
          return toast({ title: 'Failed to fetch branch info with status code ' + fetchedBranch.status, status: 'error' })
        }
      }
    } catch {
      setIsSpinning(false)
      return toast({ title: 'Failed to validate repository', status: 'error' })
    }
    toastRef.current = toast({
      title: 'Submitting verification request...',
      description: 'Approve message signature request in wallet when prompted',
      status: 'loading',
      duration: null
    })
    try {
      let msgToSign = await generateMessageToSign(user!)
      let sign = await aioha.signMessage(msgToSign, KeyTypes.Posting)
      if (!sign.success) {
        toast.update(toastRef.current, { title: 'Signature Error', description: sign.error, status: 'error', duration: 15000 })
        return
      }
      const authReq = await fetch(`${cvApi}/login`, {
        method: 'POST',
        body: `${msgToSign}:${sign.result}`
      })
      if (authReq.status !== 200) {
        toast.update(toastRef.current, {
          title: 'Error',
          description: (await authReq.json()).error,
          status: 'error',
          duration: 15000
        })
        return
      }
      const authResult = await authReq.json()
      let createReq = await fetch(`${cvApi}/verify/${addr}/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authResult.access_token}`
        },
        body: JSON.stringify({
          repo_url: repoUrl,
          repo_branch: gitBranch.length > 0 ? gitBranch : undefined,
          tinygo_version: tinygoVersion,
          strip_tool: wasmStripTool.length > 0 ? wasmStripTool : undefined
        })
      })
      if (createReq.status !== 200) {
        setIsSpinning(false)
        let e = await createReq.json()
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
      setStage(2)
    } catch {
      setIsSpinning(false)
      toast.update(toastRef.current, { title: 'Error', description: 'Unknown error occurred', status: 'error', duration: 15000 })
      return
    }
  }
  return (
    <>
      <PageTitle title="Verify Contract" />
      <Text fontSize={'5xl'}>Verify Contract</Text>
      <Text mb={'6'}>
        Submit contract source code to Magi Blocks to verify that the resulting compiled bytecode matches the deployed contract
        bytecode.
      </Text>
      <Center>
        <Stack direction="column" gap={'6'} maxW={'4xl'} w={'100%'}>
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
                      <FormLabel>Username</FormLabel>
                      <Button
                        _focus={{ boxShadow: 'none' }}
                        onClick={walletDisclosure.onOpen}
                        leftIcon={user ? <Icon as={FaHive} fontSize={'lg'} /> : undefined}
                      >
                        {user ?? 'Connect Wallet'}
                      </Button>
                    </FormControl>
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
                      <FormLabel>GitHub Repository URL</FormLabel>
                      <Input
                        type="text"
                        placeholder="https://github.com/..."
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        focusBorderColor={themeColorLight}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Git Branch</FormLabel>
                      <Input
                        type="text"
                        placeholder={'default branch'}
                        value={gitBranch}
                        onChange={(e) => setGitBranch(e.target.value)}
                        focusBorderColor={themeColorLight}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>TinyGo Version</FormLabel>
                      <Select
                        focusBorderColor={themeColorLight}
                        value={tinygoVersion}
                        onChange={(e) => setTinyGoVersion(e.target.value)}
                      >
                        {Object.keys(tinygoVersions).map((val, i) => (
                          <option key={i} value={val}>
                            v{val} (Go: v{tinygoVersions[val].go})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>WASM Strip Tool</FormLabel>
                      <Select
                        focusBorderColor={themeColorLight}
                        value={wasmStripTool}
                        onChange={(e) => setWasmStripTool(e.target.value)}
                      >
                        {wasmStripTools.map((val, i) => (
                          <option key={i} value={val[0]}>
                            {val[1]}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </CardBody>
              </Card>
              <Center>
                <Stack direction="row" gap="3">
                  <Button onClick={() => setStage(0)}>Previous</Button>
                  <Button
                    colorScheme={themeColorScheme}
                    onClick={submitClicked}
                    disabled={
                      isSpinning || !user || addr.length === 0 || repoUrl.length === 0 || provider === Providers.MetaMaskSnap
                    }
                  >
                    <Flex gap={'2'} align={'center'}>
                      <Spinner size={'sm'} hidden={!isSpinning} />
                      <Text>{provider === Providers.MetaMaskSnap ? 'Unsupported Wallet' : 'Submit'}</Text>
                    </Flex>
                  </Button>
                </Stack>
              </Center>
            </Box>
          ) : stage === 2 ? (
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
      <AiohaModal
        displayed={walletDisclosure.isOpen}
        onClose={walletDisclosure.onClose}
        disabledProviders={[Providers.MetaMaskSnap]}
      />
    </>
  )
}
