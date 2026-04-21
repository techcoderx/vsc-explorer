import { useTranslation } from 'react-i18next'
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
import { InfoTip } from '../../ui/toggle-tip'
import { TFunction } from 'i18next'

const tinygoVersions: { [v: string]: { go: string; llvm: string; img_digest: string } } = {
  '0.40.1': {
    go: '1.25.5',
    llvm: '20.1.1',
    img_digest: 'sha256:89a77cc87b191399077be51a295d1d29569314931f334b2730427d7ed3a2b18e'
  },
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

const getNotice = (t: TFunction) => [
  {
    title: t('verifyContract.notice.language'),
    body: <Text>{t('verifyContract.notice.languageBody')}</Text>
  },
  {
    title: t('verifyContract.notice.compilerOptions'),
    body: (
      <Text>
        {t('verifyContract.notice.compilerOptionsBody')}{' '}
        <Code>-gc=custom -scheduler=none -panic=trap -no-debug -target=wasm-unknown</Code>
      </Text>
    )
  },
  {
    title: t('verifyContract.notice.environment'),
    body: (
      <Text>
        {t('verifyContract.notice.environmentBody')}{' '}
        <Link href="https://hub.docker.com/r/tinygo/tinygo" target="_blank" rel="noopener noreferrer" aria-label="TinyGo Docker image (opens in new tab)">
          TinyGo Docker image
        </Link>
        .
      </Text>
    )
  },
  {
    title: t('verifyContract.notice.entrypoint'),
    body: <Text>{t('verifyContract.notice.entrypointBody')}</Text>
  },
  {
    title: t('verifyContract.notice.dependencies'),
    body: <Text>{t('verifyContract.notice.dependenciesBody')}</Text>
  },
  {
    title: t('verifyContract.notice.experimental'),
    body: <Text>{t('verifyContract.notice.experimentalBody')}</Text>
  }
]

export const VerifyContract = () => {
  const { t } = useTranslation('tools')
  const notice = getNotice(t)
  const [searchParams] = useSearchParams()
  const { aioha, user, provider } = useAioha()
  const [stage, setStage] = useState(searchParams.get('skipnotice') === '1' ? 1 : 0)
  const [addr, setAddr] = useState<string>(searchParams.get('address') || '')
  const [repoUrl, setRepoUrl] = useState<string>('')
  const [gitBranch, setGitBranch] = useState<string>('')
  const [tinygoVersion, setTinyGoVersion] = useState<string>('0.39.0')
  const [contractDir, setContractDir] = useState<string>('')
  const [goModDir, setGoModDir] = useState<string>('')
  const [wasmStripTool, setWasmStripTool] = useState<string>('')
  const [isSpinning, setIsSpinning] = useState(false)
  const toastIdRef = useRef<string | undefined>(undefined)
  const [walletOpen, setWalletOpen] = useState(false)
  const submitClicked = async () => {
    let e = ''
    if (!addr.startsWith('vsc1')) {
      e = t('verifyContract.errors.mustStartVsc1')
    } else if (!repoUrl.startsWith('https://github.com/')) {
      e = t('verifyContract.errors.mustBeGithub')
    }
    const repoId = repoUrl.replace('https://github.com/', '')
    const repoIdParts = repoId.split('/')
    if (repoIdParts.length !== 2) {
      e = t('verifyContract.errors.invalidRepoUrl')
    } else if (repoIdParts[0].length > 39 || !/^[A-Za-z0-9-]+$/.test(repoIdParts[0])) {
      e = t('verifyContract.errors.invalidGithubUser')
    } else if (repoIdParts[1].length > 100 || !/^[A-Za-z0-9._-]+$/.test(repoIdParts[1])) {
      e = t('verifyContract.errors.invalidGithubRepo')
    }
    if (
      contractDir.length > 0 &&
      (contractDir.includes('..') || contractDir.startsWith('/') || !/^[A-Za-z0-9/_.-]+$/.test(contractDir))
    ) {
      e = t('verifyContract.errors.invalidContractDir')
    }
    if (
      goModDir.length > 0 &&
      (goModDir.includes('..') || goModDir.startsWith('/') || !/^[A-Za-z0-9/_.-]+$/.test(goModDir))
    ) {
      e = t('verifyContract.errors.invalidGoModDir')
    }
    if (e) {
      return toaster.error({ title: e })
    }

    try {
      setIsSpinning(true)
      const verifInfo = await cvInfo(addr)
      if (verifInfo && (verifInfo.status === 'queued' || verifInfo.status === 'in progress' || verifInfo.status === 'success')) {
        setIsSpinning(false)
        return toaster.error({ title: t('verifyContract.errors.alreadyVerified') })
      }
      if (!verifInfo) {
        const ct = await fetchContracts({ byId: addr })
        if (!ct || ct.length === 0) {
          setIsSpinning(false)
          return toaster.error({ title: t('verifyContract.errors.contractNotFound') })
        }
      }
    } catch {
      setIsSpinning(false)
      return toaster.error({ title: t('verifyContract.errors.backendError') })
    }
    try {
      const fetchedRepo = await fetch(`https://api.github.com/repos/${repoId}`)
      if (fetchedRepo.status !== 200) {
        return toaster.error({ title: t('verifyContract.errors.repoFetchError', { statusCode: fetchedRepo.status }) })
      }
      if (gitBranch.length > 0) {
        const fetchedBranch = await fetch(`https://api.github.com/repos/${repoId}/branches/${gitBranch}`)
        if (fetchedBranch.status !== 200) {
          return toaster.error({ title: t('verifyContract.errors.branchFetchError', { statusCode: fetchedBranch.status }) })
        }
      }
    } catch {
      setIsSpinning(false)
      return toaster.error({ title: t('verifyContract.errors.repoValidateError') })
    }
    toastIdRef.current = toaster.create({
      title: t('verifyContract.submitting'),
      description: t('verifyContract.approveSignature'),
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
        toaster.error({ title: t('verifyContract.errors.signatureError'), description: sign.error })
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
          title: t('error', { ns: 'common' }),
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
          strip_tool: wasmStripTool.length > 0 ? wasmStripTool : undefined,
          contract_dir: contractDir.length > 0 ? contractDir : undefined,
          go_mod_dir: goModDir.length > 0 ? goModDir : undefined
        })
      })
      if (createReq.status !== 200) {
        setIsSpinning(false)
        const e = await createReq.json()
        if (toastIdRef.current) {
          toaster.dismiss(toastIdRef.current)
        }
        toaster.error({ title: t('error', { ns: 'common' }), description: e.error })
        return
      }
      if (toastIdRef.current) {
        toaster.dismiss(toastIdRef.current)
      }
      toaster.success({
        title: t('success', { ns: 'common' }),
        description: t('verifyContract.submitted')
      })
      setIsSpinning(false)
      setStage(2)
    } catch {
      setIsSpinning(false)
      if (toastIdRef.current) {
        toaster.dismiss(toastIdRef.current)
      }
      toaster.error({ title: t('error', { ns: 'common' }), description: t('verifyContract.errors.unknownError') })
      return
    }
  }
  return (
    <>
      <PageTitle title={t('verifyContract.title')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('verifyContract.title')}</Heading>
      <Text mb={'6'}>
        {t('verifyContract.description')}
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
                      {t('verifyContract.readThisFirst')}
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
                  {t('next', { ns: 'common' })}
                </Button>
              </Center>
            </Box>
          ) : stage === 1 ? (
            <Box>
              <Card.Root mb={'3'}>
                <Card.Body>
                  <Stack direction={'column'} gap={'3'}>
                    <Field.Root>
                      <Field.Label>{t('form.username', { ns: 'common' })}</Field.Label>
                      <Button variant={'outline'} colorPalette={'gray'} _focus={{ boxShadow: 'none' }} onClick={() => setWalletOpen(true)}>
                        {user ? <Box as={FaHive} fontSize={'lg'} /> : null}
                        {user ?? t('connectWallet', { ns: 'common' })}
                      </Button>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>{t('verifyContract.form.contractAddress')}</Field.Label>
                      <Input type="text" placeholder="vsc1..." value={addr} onChange={(e) => setAddr(e.target.value)} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>{t('verifyContract.form.githubRepoUrl')}</Field.Label>
                      <Input
                        type="text"
                        placeholder="https://github.com/..."
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>{t('verifyContract.form.gitBranch')}</Field.Label>
                      <Input
                        type="text"
                        placeholder={t('verifyContract.form.defaultBranch')}
                        value={gitBranch}
                        onChange={(e) => setGitBranch(e.target.value)}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>
                        {t('verifyContract.form.contractDir')}
                        <InfoTip>{t('verifyContract.form.contractDirTip')}</InfoTip>
                      </Field.Label>
                      <Input
                        type="text"
                        placeholder={t('verifyContract.form.contractDirPlaceholder')}
                        value={contractDir}
                        onChange={(e) => setContractDir(e.target.value)}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>
                        {t('verifyContract.form.goModDir')}
                        <InfoTip>{t('verifyContract.form.goModDirTip')}</InfoTip>
                      </Field.Label>
                      <Input
                        type="text"
                        placeholder={t('verifyContract.form.goModDirPlaceholder')}
                        value={goModDir}
                        onChange={(e) => setGoModDir(e.target.value)}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>{t('verifyContract.form.tinygoVersion')}</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={tinygoVersion} onChange={(e) => setTinyGoVersion(e.target.value)}>
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
                      <Field.Label>{t('verifyContract.form.wasmStripTool')}</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={wasmStripTool} onChange={(e) => setWasmStripTool(e.target.value)}>
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
                  <Button onClick={() => setStage(0)}>{t('previous', { ns: 'common' })}</Button>
                  <Button
                    colorPalette={themeColorScheme}
                    onClick={submitClicked}
                    disabled={
                      isSpinning || !user || addr.length === 0 || repoUrl.length === 0 || provider === Providers.MetaMaskSnap
                    }
                  >
                    <Flex gap={'2'} align={'center'}>
                      <Spinner size={'sm'} hidden={!isSpinning} />
                      <Text>{provider === Providers.MetaMaskSnap ? t('unsupportedWallet', { ns: 'common' }) : t('submit', { ns: 'common' })}</Text>
                    </Flex>
                  </Button>
                </Stack>
              </Center>
            </Box>
          ) : stage === 2 ? (
            <Flex direction="column" gap={'5'} align={'center'}>
              <Text fontSize={'9xl'}>🎉</Text>
              <Text>
                {t('verifyContract.completionMsg')}
              </Text>
              <Button asChild colorPalette={themeColorScheme}>
                <ReactRouterLink to={`/contract/${addr}`}>{t('verifyContract.viewContract')}</ReactRouterLink>
              </Button>
            </Flex>
          ) : null}
        </Stack>
      </Center>
      <AiohaModal displayed={walletOpen} onClose={() => setWalletOpen(false)} disabledProviders={[Providers.MetaMaskSnap]} />
    </>
  )
}
