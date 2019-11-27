interface IUserConfig {
  appId?: string,
  token?: string,
  showType?: 'menuBar' | 'notification' | undefined,
}

interface IBaiduResponse {
  from: string,
  to: string,
  trans_result: Array<{
    src: string,
    dst: string,
  }>,
  error_code?: number,
}
