export interface CvInfo {
  address: string
  code: string
  similar_match?: string
  verifier: string
  request_ts: string
  verified_ts: string
  status: 'pending' | 'queued' | 'in progress' | 'success' | 'failed' | 'not match'
  repo_name: string
  git_commit: string
  tinygo_version: string
  go_version: string
  llvm_version: string
  strip_tool?: 'wabt' | 'wasm-tools'
  exports: string[]
  license: string
  lang: string
}

export interface SrcFile {
  name: string
  content: string
}
