
import md5 from 'md5';
import axios from 'axios';
import { is } from 'electron-util';
import { getTargetAndSource } from './utils';


const API_PATH = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

/**
 * 翻译
 * @param conditionText 待翻译文本
 */
export async function baiduTranslate(conditionText: string, userConfig: IUserConfig) {
  const { to, from } = getTargetAndSource(conditionText);

  const { appId, token } = userConfig;
  const salt = Date.now();
  const sign = md5(`${appId}${conditionText}${salt}${token}`);
  if (is.development) {
    console.time('用时')
  }
  const data = await axios.get<IBaiduResponse>(`${API_PATH}?q=${encodeURIComponent(conditionText)}&from=${from}&to=${to}&appid=${appId}&salt=${salt}&sign=${sign}`)
    .then(({ data }) => data);
  if (is.development) {
    console.timeEnd('用时')
  }

  const { error_code, trans_result, error_msg }  = data;

  if (error_code) {
    return `× ${error_msg || `${error_code} 未知错误`}`;
  }

  return trans_result.map(({ dst }) => dst).join('').replace(/\n/g, '')
}
