// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
import { tmt } from "tencentcloud-sdk-nodejs";
import { Client } from "tencentcloud-sdk-nodejs/tencentcloud/services/tmt/v20180321/tmt_client";
import { getTargetAndSource } from "./utils";

const TmtClient = tmt.v20180321.Client;

// 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey,此处还需注意密钥对的保密
// 密钥可前往https://console.cloud.tencent.com/cam/capi网站进行获取

// 实例化要请求产品的client对象,clientProfile是可选的
let client: Client | undefined;

export const tencentTranslator = (SourceText: string, userConfig: IUserConfig) => {
  if (!client) {
    client = new TmtClient({
      credential: {
        secretId: userConfig.appId,
        secretKey: userConfig.token,
      },
      region: "ap-chengdu",
      profile: {
        httpProfile: {
          endpoint: "tmt.tencentcloudapi.com",
        },
      },
    });
  }

  const { to, from } = getTargetAndSource(SourceText)

  console.log(SourceText)

  return client.TextTranslate({
    SourceText,
    Source: from,
    Target: to,
    ProjectId: 0
  }).then((data) => {
    return data.TargetText
  }).catch((e) => {
    return e.toString()
  })
}
