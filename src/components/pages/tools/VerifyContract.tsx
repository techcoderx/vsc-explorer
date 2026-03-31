import { LuInfo } from 'react-icons/lu'
import {
  Box,
  Button,
  Card,
  Center,
  Code,
  Field,
  Flex,
  Heading,
  Link,
  NativeSelect,
  Stack,
  StackSeparator,
  Text,
  Spinner,
  Input
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useSearchParams, Link as ReactRouterLink } from 'react-router'
import { useAioha } from '@aioha/providers/react'
import { KeyTypes, Providers } from '@aioha/aioha'
import { themeColorScheme, cvApi } from '../../../settings'
import { cvInfo } from '../../../cvRequests'
import { fetchContracts } from '../../../requests'
import { PageTitle } from '../../PageTitle'
import { AiohaModal } from '../../Aioha'
import { generateMessageToSign } from '../../../helpers'
import { FaHive } from 'react-icons/fa6'
import { toaster } from '../../ui/toaster'

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
  const [stage, setStage] = useState(searchParams.get('skipnotice') === '1' ? 1 : 0)
  const [addr, setAddr] = useState<string>(searchParams.get('address') || '')
  const [repoUrl, setRepoUrl] = useState<string>('')
  const [gitBranch, setGitBranch] = useState<string>('')
  const [tinygoVersion, setTinyGoVersion] = useState<string>('0.39.0')
  const [wasmStripTool, setWasmStripTool] = useState<string>('')
  const [isSpinning, setIsSpinning] = useState(false)
  const toastIdRef = useRef<string | undefined>(undefined)
  const [walletOpen, setWalletOpen] = useState(false)
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
      return toaster.error({ title: e })
    }

    try {
      setIsSpinning(true)
      const verifInfo = await cvInfo(addr)
      if (verifInfo && (verifInfo.status === 'queued' || verifInfo.status === 'in progress' || verifInfo.status === 'success')) {
        setIsSpinning(false)
        return toaster.error({ title: 'Contract is already verified or being verified.' })
      }
      if (!verifInfo) {
        const ct = await fetchContracts({ byId: addr })
        if (!ct || ct.length === 0) {
          setIsSpinning(false)
          return toaster.error({ title: 'Contract not found' })
        }
      }
    } catch {
      setIsSpinning(false)
      return toaster.error({ title: 'Failed to call backend for contract verification status' })
    }
    try {
      const fetchedRepo = await fetch(`https://api.github.com/repos/${repoId}`)
      if (fetchedRepo.status !== 200) {
        return toaster.error({ title: 'Failed to fetch repository info with status code ' + fetchedRepo.status })
      }
      if (gitBranch.length > 0) {
        const fetchedBranch = await fetch(`https://api.github.com/repos/${repoId}/branches/${gitBranch}`)
        if (fetchedBranch.status !== 200) {
          return toaster.error({ title: 'Failed to fetch branch info with status code ' + fetchedBranch.status })
        }
      }
    } catch {
      setIsSpinning(false)
      return toaster.error({ title: 'Failed to validate repository' })
    }
    toastIdRef.current = toaster.create({
      title: 'Submitting verification request...',
      description: 'Approve message signature request in wallet when prompted',
      type: 'loading',
      duration: Infinity
    })
    try {
      const msgToSign = await generateMessageToSign(user!)
      const sign = await aioha.signMessage(msgToSign, KeyTypes.Posting)
      if (!sign.success) {
        if (toastIdRef.current) {
          toaster.dismiss(toastIdRef.current)
        }
        toaster.error({ title: 'Signature Error', description: sign.error })
        return
      }
      const authReq = await fetch(`${cvApi}/login`, {
        method: 'POST',
        body: `${msgToSign}:${sign.result}`
      })
      if (authReq.status !== 200) {
        if (toastIdRef.current) {
          toaster.dismiss(toastIdRef.current)
        }
        toaster.error({
          title: 'Error',
          description: (await authReq.json()).error
        })
        return
      }
      const authResult = await authReq.json()
      const createReq = await fetch(`${cvApi}/verify/${addr}/new`, {
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
        const e = await createReq.json()
        if (toastIdRef.current) {
          toaster.dismiss(toastIdRef.current)
        }
        toaster.error({ title: 'Error', description: e.error })
        return
      }
      if (toastIdRef.current) {
        toaster.dismiss(toastIdRef.current)
      }
      toaster.success({
        title: 'Success',
        description: 'Contract verification request submitted successfully!'
      })
      setIsSpinning(false)
      setStage(2)
    } catch {
      setIsSpinning(false)
      if (toastIdRef.current) {
        toaster.dismiss(toastIdRef.current)
      }
      toaster.error({ title: 'Error', description: 'Unknown error occurred' })
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
              <Card.Root mb={'3'}>
                <Card.Header>
                  <Heading fontSize={'2xl'}>
                    <Flex align={'center'} gap={'2'}>
                      <LuInfo />
                      Read This First!
                    </Flex>
                  </Heading>
                </Card.Header>
                <Card.Body mt={'-20px'}>
                  <Stack separator={<StackSeparator />} gap={'3'}>
                    {notice.map((n, i) => (
                      <Box key={i}>
                        <Heading size={'sm'} textTransform={'uppercase'}>
                          {n.title}
                        </Heading>
                        <Box pt={'2'}>{n.body}</Box>
                      </Box>
                    ))}
                  </Stack>
                </Card.Body>
              </Card.Root>
              <Center>
                <Button colorPalette={themeColorScheme} onClick={() => setStage(1)}>
                  Next
                </Button>
              </Center>
            </Box>
          ) : stage === 1 ? (
            <Box>
              <Card.Root mb={'3'}>
                <Card.Body>
                  <Stack direction={'column'} gap={'3'}>
                    <Field.Root>
                      <Field.Label>Username</Field.Label>
                      <Button
                        _focus={{ boxShadow: 'none' }}
                        onClick={() => setWalletOpen(true)}
                      >
                        {user ? <Box as={FaHive} fontSize={'lg'} /> : null}
                        {user ?? 'Connect Wallet'}
                      </Button>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Contract Address</Field.Label>
                      <Input
                        type="text"
                        placeholder="vsc1..."
                        value={addr}
                        onChange={(e) => setAddr(e.target.value)}
              
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>GitHub Repository URL</Field.Label>
                      <Input
                        type="text"
                        placeholder="https://github.com/..."
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
              
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Git Branch</Field.Label>
                      <Input
                        type="text"
                        placeholder={'default branch'}
                        value={gitBranch}
                        onChange={(e) => setGitBranch(e.target.value)}
              
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>TinyGo Version</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                
                          value={tinygoVersion}
                          onChange={(e) => setTinyGoVersion(e.target.value)}
                        >
                          {Object.keys(tinygoVersions).map((val, i) => (
                            <option key={i} value={val}>
                              v{val} (Go: v{tinygoVersions[val].go})
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>WASM Strip Tool</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                
                          value={wasmStripTool}
                          onChange={(e) => setWasmStripTool(e.target.value)}
                        >
                          {wasmStripTools.map((val, i) => (
                            <option key={i} value={val[0]}>
                              {val[1]}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                  </Stack>
                </Card.Body>
              </Card.Root>
              <Center>
                <Stack direction="row" gap="3">
                  <Button onClick={() => setStage(0)}>Previous</Button>
                  <Button
                    colorPalette={themeColorScheme}
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
              <Button asChild colorPalette={themeColorScheme}>
                <ReactRouterLink to={`/contract/${addr}`}>View Contract</ReactRouterLink>
              </Button>
            </Flex>
          ) : null}
        </Stack>
      </Center>
      <AiohaModal
        displayed={walletOpen}
        onClose={() => setWalletOpen(false)}
        disabledProviders={[Providers.MetaMaskSnap]}
      />
    </>
  )
}
