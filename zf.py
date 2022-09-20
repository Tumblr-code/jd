import asyncio
import datetime
import json
import logging
import os
import re
import time
from urllib import parse


from telethon import TelegramClient, events

# 0. 进入容器
# 1. pip3 install -U cacheout
# 2. 复制magic.py,magic.json到/ql/config/目录 并配置
# 3. python3 /ql/config/magic.py 用手机号登录
# 4. 给bot发送在吗 有反应即可
# 5. pm2 start /ql/config/magic.py -x --interpreter python3
# 6. 挂起bot到后台 查看状态 pm2 l
# 7. 如果修改了magic.json,执行pm2 restart magic 即可重启
# pm2 start /jd/config/magic.py -x --interpreter python3

logging.basicConfig(format='[%(levelname) 5s/%(asctime)s] %(name)s: %(message)s', level=logging.INFO)
# 创建
logger = logging.getLogger("magic")
logger.setLevel(logging.INFO)

properties = {
    "api_id": 6788638,
    "api_hash": "debbe1496f32808395da1ea9b2d98bf6",
    "bot_id": 5619591051,
    "bot_token": "5619591051:AAHWmeQ-TfD0uzv_6sWJxna0bZA_bcK2c8g",
    "user_id": 5486328200,
    "proxy": False,
    "proxy_type": "socks5",
    "proxy_addr": "",
    "proxy_port": 7891,
    "proxy_username": "",
    "proxy_password": "",
    "proxy_secret": "如果proxy_type是MTProxy,则该值必填",
    "monitor_cars": [
        -736076129
    ],
    "monitor_auto_stops": [
        "jd_AutoOpenCard"
    ]
}

# 缓存
#cache = FIFOCache(maxsize=properties.get("monitor_cache_size"), ttl=0, timer=time.time)

# Telegram相关
api_id = properties.get("api_id")
api_hash = properties.get("api_hash")
bot_id = properties.get("bot_id")
bot_token = properties.get("bot_token")
user_id = properties.get("user_id")
# 监控相关
monitor_cars = properties.get("monitor_cars")
logger.info(f"监控的频道或群组-->{monitor_cars}")

if properties.get("proxy"):
    if properties.get("proxy_type") == "MTProxy":
        proxy = {
            'addr': properties.get("proxy_addr"),
            'port': properties.get("proxy_port"),
            'proxy_secret': properties.get('proxy_secret', "")
        }
    else:
        proxy = {
            'proxy_type': properties.get("proxy_type"),
            'addr': properties.get("proxy_addr"),
            'port': properties.get("proxy_port"),
            'username': properties.get('proxy_username', ""),
            'password': properties.get('proxy_password', "")
        }
    client = TelegramClient("magic", api_id, api_hash, proxy=proxy, auto_reconnect=True, retry_delay=1, connection_retries=99999).start()
else:
    client = TelegramClient("magic", api_id, api_hash, auto_reconnect=True, retry_delay=1, connection_retries=99999).start()


@client.on(events.NewMessage(chats=monitor_cars, pattern=r'^([0-9+\.]+(~|-)[0-9+\.]+( )+[\u4e00-\u9fa5]+( )+[\u4e00-\u9fa5]+)( )+\(gua_opencard[0-9+]+.js\)([\d\D]*)'))
async def handler(event):
    origin = event.message.text
    #logger.info(f"识别到消息id: {event.message.id}")
    #logger.info(f"识别到消息群id: {event.message.peer_id.channel_id}")
    m = re.findall("^([0-9+\.]+~[0-9+\.]+ +[\u4e00-\u9fa5]+ +[\u4e00-\u9fa5]+ +\(gua_opencard[0-9+]+.js\))", origin)
    logger.info(f"新脚本: {m[0]}")
    logger.info(f"消息内容: {event.message}")
    await client.forward_messages(-1001603206320,event.message.id,event.message.peer_id.chat_id)
    await client.send_message(-1001603206320, f'新脚本:【{m[0]}】')

if __name__ == "__main__":
    try:
        logger.info("开始运行")
        client.run_until_disconnected()
    except Exception as e:
        logger.error(e)
        client.disconnect()