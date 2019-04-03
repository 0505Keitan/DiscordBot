const {Client, RichEmbed} = require('discord.js');
const client = new Client();
const twitter = require('twitter');
const moment = require('moment');
const fetch = require('node-fetch');
const https = require("https");
const fs = require("fs");
const tcpscan = require("simple-tcpscan");
const request = require('request');
const cheerio = require('cheerio-httpcli');
const schedule = require("node-schedule");

//ユーザー環境変数
const CHANNEL_ACCESS_TOKEN = '**LINE_CHANNEL_ACCESS_TOKEN**';
const USER_ID = '**LINE_USER_ID**';

//グローバル関数宣言
const charset = 'utf-8';
const now = new Date();
const oshogatsu = new Date(now.getFullYear() + "!1/1");

const red = '\u001b[31m';
const green = '\u001b[32m';
const reset = '\u001b[0m';

const lastResults = JSON.parse(fs.readFileSync('**FILE_PLACE**'));
const lastResultsChusen = JSON.parse(fs.readFileSync('**FILE_PLACE**'));

const Twiclient = new twitter({
  consumer_key: '**YOUR_API_KEY**',
  consumer_secret: '**YOUR_API_SECRET**',
  access_token_key: '**YOUR_ACCESS_KEY**',
  access_token_secret: '**YOUR_ ACCESS_SECRET**',
});

client.on('uncaughtException', function(err){
    var postData = {
        "to": USER_ID,
        "messages": [{
            "type": "text",
            "text": "BOT停止通知\n" + err,
        }]
    };
    request.post({
        uri: 'https://api.line.me/v2/bot/message/push',
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
        },
        json: postData
    });
            console.log(err);
});

client.on('error', error => {
    var postData = {
        "to": USER_ID,
        "messages": [{
            "type": "text",
            "text": "BOT停止通知\n" + error,
        }]
    };
    request.post({
        uri: 'https://api.line.me/v2/bot/message/push',
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
        },
        json: postData
    });
    console.log(error);
    });


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('test');
    client.user.setPresence({
        game: {
            name: `DiscordBOT | !helpで表示`,
            type: 0,
        },
    });
});

var YouTubeNotify = schedule.scheduleJob({
  hour   : 22,
  minute:  00
}, function (){
  function callback(error, response, body){
  if(!error && response.statusCode == 200){
      var ytData = JSON.parse(fs.readFileSync('**FILE_PLACE**'));
      if(typeof ytData === 'undefined'){
    ytData = {date : 0, subCount: 0};
}
      var year = now.getFullYear();
    var mon = now.getMonth() + 1;
    var day = now.getDate();
    var res = JSON.parse(body);
    var lastSubsc = res.items[0].statistics.subscriberCount - ytData.subCount;
    var lastSub = String(lastSubsc);
    if(!lastSub.match(/-/)){
        var lastSub = '+' + lastSub;
    }
    var napoanMsg = {embed: {
            title: year + '年' + mon + '月' + day + '日のYouTubeチャンネル概要',
    color: 7506394,
    fields: [
      {
        name: "視聴回数",
        value: res.items[0].statistics.viewCount
      },
      {
        name: "登録者数",
        value: res.items[0].statistics.subscriberCount
      },
      {
        name: "総動画数",
        value: res.items[0].statistics.videoCount
      },
      {
        name: "登録者数の前日比",
        value: lastSub
      }
      ]
  }}
    client.channels.get('000000000000000000').send(napoanMsg);
    ytData.date = String(year) + String(mon) + String(day);
    ytData.subCount = res.items[0].statistics.subscriberCount;
    var place = '**YOUR_FILE_PLACE**';
  fs.writeFileSync(place, JSON.stringify(ytData), charset);
  }
}
request.get('https://www.googleapis.com/youtube/v3/channels?part=statistics&id=YOUR_CHANNEL_ID&key=YOUR_DEV_KEY', callback);
});


client.on('message', async msg => {
    const ngCount = JSON.parse(fs.readFileSync('**FILE_PLACE**'));
    const level = JSON.parse(fs.readFileSync('**FILE_PLACE**'));
    const now = new Date();
    const year = now.getFullYear();
    const mon = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const min = now.getMinutes();
    const args = msg.content.split(' ');
    
    if(msg.author.bot){
        return;
    }
    
    if(msg.content === '?length'){
        const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
            max: 1,
            time: 10000,
        });
        if(responses && responses.size){
            msg.reply(`この文章は${responses.first().content.length}文字です。`);
        }else{
            msg.reply('要求がタイムアウトしました。もう一度実行してください。');
        }
    }
    
    // BITコインレート
    if(msg.content === "?btc"){
        function callback(error, response, body){
          if(!error && response.statusCode == 200){
              var res = JSON.parse(body);
              msg.channel.send("現在のBitcoinレートは" + res.rate + "円/Bitcoinです。");
            }
        }
        request.get('https://coincheck.com/api/rate/btc_jpy', callback);
    }
    
  // ETHレート
  if(msg.content === "?eth"){
            function callback(error, response, body){
          if(!error && response.statusCode == 200){
              var res = JSON.parse(body);
              msg.channel.send("現在のイーサリアムレートは" + res.rate + "円/ethです。");
            }
        }
        request.get('https://coincheck.com/api/rate/eth_jpy', callback);
  }
  
  // XEMレート
  if(msg.content === "?xem"){
      function callback(error, response, body){
          if(!error && response.statusCode == 200){
              var res = JSON.parse(body);
              msg.channel.send("現在のネムレートは" + res.rate + "円/xemです。");
            }
        }
        request.get('https://coincheck.com/api/rate/xem_jpy', callback);
  }
  
  // 地震情報
  if(msg.content === "?jishin"){
    
    function callback(error, response, body){
  if(!error && response.statusCode == 200){
    var res = JSON.parse(body);
        var time = res[0].time;
        var code = res[0].code;
        if(code === 5610){
        var count = res[0].count;
        for (var key in res[0].areas){
       var area = key;
        }
        msg.channel.send("```集計済み地震感知情報\n集計件数：" + count + "\n感知時刻：" + time + "\n感知エリア：" + area + "```");
        }else if(code === 551){
        var source = res[0].issue.source;
        var timing = res[0].earthquake.time;
        var place = res[0].earthquake.hypocenter.name;
        var depth = res[0].earthquake.hypocenter.depth;
        var magnitude = res[0].earthquake.hypocenter.magnitude;
        var m = res[0].earthquake.maxScale;
        var t = res[0].earthquake.domesticTsunami;
        
        if(m === 0){
        var maxScale = "なし";
        }else if(m === 10){
        var maxScale = "震度1";
        }else if(m === 20){
        var maxScale = "震度2";
        }else if(m === 30){
        var maxScale = "震度3";
        }else if(m === 40){
        var maxScale = "震度4";
        }else if(m === 45){
        var maxScale = "震度5弱";
        }else if(m === 50){
        var maxScale = "震度5強";
        }else if(m === 55){
        var maxScale = "震度6弱";
        }else if(m === 60){
        var maxScale = "震度6強";
        }else if(m === 70){
        var maxScale = "震度7";
        }
        
        if(t === "None"){
        var tsunami = "この地震による津波の心配はありません。";
        }else if(t === "Unknown"){
        var tsunami = "不明";
        }else if(t === "Checking"){
        var tsunami = "調査中";
        }else if(t === "NonEffective"){
        var tsunami = "若干の海面変動(被害の心配なし)";
        }else if(t === "Watch"){
        var tsunami = "津波注意報";
        }else if(t === "Warning"){
        var tsunami = "津波予報(種類不明)";
        }
        
        msg.channel.send("```発生日時：" + timing + "\n発生場所：" + place + "\n深さ：" + depth + "\nマグニチュード：" + magnitude + "\n最大震度：" + maxScale + "\n津波の有無：" + tsunami + "```");
        }else if(code === 552){
        var cancel = res[0].cancelled;
        if(cancel === "true"){
        msg.channel.send("```津波予報は解除されました。```");
        return false;
        }
        var areaname = res[0].areas[0].name;
        var grade = res[0].areas[0].grade;
        msg.channel.send("```津波予報発表区域：" + areaname + "```");
        }
    }
  
}

request.get('https://api.p2pquake.net/v1/human-readable', callback);
}
// ここまで地震


  if(msg.content.startsWith('?eval')){
        if(msg.author.id === "YOUR_ID"){
            var eva = args[1];
            var unicode = eva.charCodeAt(0);
            if(unicode>=0x3040 && unicode<=0x309f){
                msg.reply('コマンドに日本語入力してどーすんだボケ！');
                return;
            }
            var aaa = eval(eva);
            if(aaa === null){
                msg.channel.send('**ERROR** null\n```' + eva + '```');
            }else if(aaa === undefined){
                msg.channel.send('**ERROR** undefined\n```' + eva + '```');
            }else{
                msg.channel.send(aaa);
            }
        }else{
            msg.reply('権限がありません');
        }
    }
    
    if(msg.content.startsWith('?port')){
         var tmp = msg.content.split(' ');
      var portnum = tmp[1];
      var address = tmp[2];
      
        if(portnum === undefined){
            msg.reply('**ERROR** : ポート番号を入力してください');
            return;
        }else if(isNaN(portnum) === true){
            msg.reply('**ERROR** : 数値を入力してください');
            return;
        }else if(portnum.match(/-/)){
            msg.reply('**ERROR** : 整数を入力してください');
            return;
    }else if(!(portnum >= 0 && portnum <= 65535)){
        msg.reply('**ERROR** : 0~65535までの番号を入力してください');
        return;
    }else if(portnum.startsWith(0)){
        msg.reply('**ERROR** : ポート番号を0から始めることはできません');
        return;
    }else if(portnum.match(/ /)){
        msg.reply('**ERROR** : ポート番号を空白から始めることはできません');
        return;
    }
        if(address.match(/http:/)){
            address = address.replace('http://','');
        }else if(address.match(/https:/)){
            address = address.replace('https://','');
        }
        
        if(address.match(/192./) || address.match(/127./)){
        msg.reply('ローカルへのアクセスは禁止されています。');
        return;
        }else if(address === 'localhost'){
        msg.reply('ローカルへのアクセスは禁止されています。');
        return;
        }else if(address.match(/ /)){
        msg.reply('有効なURLを入力してください');
        return;
        }
  tcpscan.run({'host': address, 'port': portnum  
  }).then(() => msg.reply(address + "のポート" + portnum + "は正常です。"), () => msg.reply(address + "のポート" + portnum + "は閉じています。"));
  }
  
  // ツイート表示
  if(msg.content === '?Twiter'){
    (function(){
      let params = {
        screen_name: 'YOUR_ID',
        count: 1,
        include_rts: false,
        exclude_replies: true
      };
      Twiclient.get('statuses/user_timeline', params, function (error, tweets, response){
        if(!error){
          for (let i = 0; i < tweets.length; i++){
          msg.channel.send('ツイート```' + tweets[i].text + '```');
          }
        }else{
          msg.channel.send(error);
        }
      });
    })();
  }

  // 遅延情報
  if(msg.content === '?delay'){
    (async () => {
        const url = 'https://rti-giken.jp/fhc/api/train_tetsudo/delay.json';
        const obj = await fetch(url).then(res => res.json());
        msg.channel.send('遅延が確認されている路線は以下の通りです\n```' + obj.map(({name}) => [name]) + '\n最終更新(GMT)：' + obj[0].lastupdate_gmt + '```');
      }
    )();
  }

  // ヘルプコマンド
  if(msg.content === '?help'){
    const embed = new RichEmbed()
    msg.channel.send({embed: {
    color: 0x00FF00,
    author: {
      name: client.user.username,
      icon_url: client.user.avatarURL
    },
    title: "ヘルプはこちらからご覧ください",
    url: "https://example.com/help",
    timestamp: new Date(),
    footer: {
      icon_url: client.user.avatarURL,
      text: "DiscordBOT | made by 0505Keitan"
    }
  }
});
  }
  
  // 朝の挨拶
  if(msg.content === '?morning'){
    if(hour <= 0 || hour <= 5){
      msg.channel.send('おはようございます。早いですね！今は' + hour + '時です！');
    } else if(hour <= 6 || hour <= 8){
      msg.channel.send('おはようございます！今は' + hour + '時です！');
    } else if(hour <= 9 || hour <= 12){
      msg.channel.send('起きるのおそい！もう' + hour + '時ですよ！');
    } else if(hour <= 13 || hour <= 21){
      msg.channel.send('もう午後ですよ？もう' + hour + '時です。ひどいです。');
    } else if(hour <= 22 || hour <= 23){
      msg.channel.send('呆れました。もう言うことないです。だって' + hour + '時ですよ？？');
    }
  }
  
  // サイコロ
  if(msg.content === "?rand"){
  ran = Math.floor(Math.random() * 5);
  if(ran == 0) randa = "1";
  if(ran == 1) randa = "2";
  if(ran == 2) randa = "3";
  if(ran == 3) randa = "4";
  if(ran == 4) randa = "5";
  if(ran == 5) randa = "6";
  msg.channel.send(randa);
  }
  
  // 抽選器
  if(msg.content === '?chusen'){
      if(level[userId].level >= 3){
  const userId = msg.author.id;
const currentTimestamp = new Date().getTime();
if(typeof lastResultsChusen[userId] === 'undefined'){
    lastResultsChusen[userId] = {timestamp: 0, head: ''};
}
if((currentTimestamp - lastResultsChusen[userId].timestamp) < 30000){
    msg.reply('少し時間を置いてから実行してください。');
    return;
}else{
    rand = Math.floor(Math.random() * 40);
    if(0 <= rand && rand <= 2)
      head = '１等';
    else if(3 <= rand && 5 >= rand)
      head = '２等';
    else if(6 <= rand && 9 >= rand)
      head = '３等';
    else if(10 <= rand && 15 >= rand)
      head = '４等';
    else if(16 <= rand && 24 >= rand)
      head = '５等';
    else if(25 <= rand && 38 >= rand)
      head = '６等';
    else
      head = '特等';
    msg.channel.send('抽選中...').then(sent => {
     var send = function (){
        sent.edit('<@' + userId + '> 抽選結果＝＞||' + head + '||');
      };
      setTimeout(send, 2000);
    });
    lastResultsChusen[userId].timestamp = currentTimestamp;
    lastResultsChusen[userId].head = head;
    var charset = 'utf-8';

var place = '';


  fs.writeFileSync(place, JSON.stringify(lastResultsChusen), charset);
}
}else{
msg.reply('レベルが足りません');
}
}
  
  // おみくじ
  if(msg.content === '?omikuji'){
    if(year === year && mon === 12 && day > 15){
        msg.reply('新年になってから実行可能です。');
        return;
    }
  const userId = msg.author.id;
const currentTimestamp = new Date().getTime();
if(typeof lastResults[userId] === 'undefined'){
    lastResults[userId] = {timestamp: 0, head: ''};
}
if((currentTimestamp - lastResults[userId].timestamp) < 31536000000){
    msg.reply('あなたは既に' + year + '年のおみくじを引いています。結果は** ' + lastResults[userId].head + ' **でした。なお12/15に' + year + '年のおみくじはリセットされ、引けなくなります。');
    return;
}else{
    rand = Math.floor(Math.random() * 6);
    if(rand === 0){
      head = '大吉';
    }else if(rand === 1){
      head = '中吉';
    }else if(rand === 2){
      head = '吉';
    }else if(rand === 3){
      head = '小吉';
    }else if(rand === 4){
      head = '凶';
    }else if(rand === 5){
      head = '大凶';
    }
    msg.reply('おみくじを引いています...').then(sent => {
     var send = function (){
        sent.edit('<@' + userId + '> ' + year + '年のあなたの結果は**' + head + '**です！');
      };
      setTimeout(send, 2000);
    });
    lastResults[userId].timestamp = currentTimestamp;
    lastResults[userId].head = head;
    var charset = 'utf-8';

var place = '**YOUR_PLACE**';


  fs.writeFileSync(place, JSON.stringify(lastResults), charset);
}
  }
  
  // 時間表示
  if(msg.content === '?time'){
    msg.channel.send('現在の時刻は' + year + '年' + mon + '月' + day + '日' + hour + '時' + min + '分です。');
  }

if(msg.content.startsWith('?nickname')){
      if(level[userId].level >= 3){
var nick = args[1];
var afId = msg.author.id;
var member = msg.guild.members.get(afId);
msg.member.setNickname(nick);
return;
    }else{
        msg.reply('レベルが足りません');
     return;   
    }
}
  
  if(msg.content === '?shutdown'){
    if(msg.author.id === 'YOUR_ID'){
      var alertmsg = function (){
        process.exit(1);
      };
      msg.channel.send('システムを緊急シャットダウン中......');
      setTimeout(alertmsg, 3000);
    }else{
      msg.channel.send('YOUR_NAMEのみ可能なコマンドです。');
    }
  }
  
  var coolDown = new Date().getTime();
level[userId].coolDown = coolDown;
level[userId].authorUsername = msg.author.username;
        if(!((coolDown - level[userId].coolDown) > 2000)){
                level[userId].msgCount = Number(level[userId].msgCount) + 1;
            }else{
        return;
        }

        
        
        
        var levelMsgCount = level[userId].msgCount;
        
        if((levelMsgCount % 30) == 0){
            level[userId].level = level[userId].level + 1;
        }
        
        var charset = 'utf-8';

var place = '**FILE_PLACE**';


  fs.writeFileSync(place, JSON.stringify(level), charset);
  
});
client.login('**YOUR_CLIENT_TOKEN');