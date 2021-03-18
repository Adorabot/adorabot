const Discord = require('discord.js');
var client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], retryLimit: Infinity});
const { config } = require('./config.json');
//const prefix = "shake ";
//const token = process.env.BOT_TOKEN;
//var fs = require('fs'); 
import { appendFile } from 'fs';

import { commandHandler } from "./modules/commandhandler"; 
import { runOnStartup, everyServerRecheckBans } from "./modules/moderation";
import {updateDiscordBotsGG} from "./modules/uploadStatsToBotsGg"

const discordbots = require('discord.bots.gg')
const dbots = new discordbots(config.clientid, config.discordbotsggapitoken)

//datadog
var StatsD = require('node-dogstatsd').StatsD;
var dogstatsd = new StatsD();

var fsdateObj = new Date();
var fsmonth;
var fsday;
var fsyear;

var finalfswrite;

var fsnewdate;

var fshour;

let fsnewfilename = "bruh";

const cassandra = require('cassandra-driver');

const cassandraclient = new cassandra.Client({
  contactPoints: config.cassandra.contactPoints,
  localDataCenter: config.cassandra.localDataCenter,
  authProvider: new cassandra.auth
   .PlainTextAuthProvider(config.cassandra.plainTextUsername, config.cassandra.plainTextPassword)
});


client.everyServerRecheckBansOnThisShard = function () {
  everyServerRecheckBans(cassandraclient,client)
}

function bruhhasadate() {
  fsdateObj = new Date();
  fsmonth =fsdateObj.getUTCMonth() + 1; //months from 1-12
  fsday =fsdateObj.getUTCDate();
  fsyear =fsdateObj.getUTCFullYear();
  fshour = fsdateObj.getUTCHours();

  //console.log("Current time: "  + fsdateObj.getUTCHours() + ":" +fsdateObj.getUTCMinutes() + ":" +fsdateObj.getUTCSeconds());

  fsnewdate = fsyear + "-" + fsmonth + "-" + fsday;

  fsnewfilename = fsnewdate + "-" + fshour + "hr";

  return fsnewfilename;
}

async function setPresenceForAdora() {
  // Set the client user's presence
await client.user.setPresence({ activity: { name: 'a!help \n 💜 Invite me to your server please! do a!invite' }, status: 'online' })
.then(console.log)
.catch(console.error);
}

function logFloorGangText(appendtxt) {
  
  bruhhasadate();

  finalfswrite =fsdateObj.getUTCHours() + ":" +fsdateObj.getUTCMinutes() + ":" +fsdateObj.getUTCSeconds()  + " - " + appendtxt + "\r\n";

  appendFile( "logs/" + fsnewdate + '.log.txt', finalfswrite, function (err) {
    if (err) return console.log(err);
    //console.log('Appended!');
 });
}

async function moderationCassandra() {
  await runOnStartup(cassandraclient, client)
}

client.on('ready',async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  
  setPresenceForAdora();

    //ban list
    try {moderationCassandra()} catch (error38362) {
      console.error(error38362)
    }

    //dbots.postStats(client.guilds.size, client.shard.count, client.shard.id)
    
    updateDiscordBotsGG(client,config)
});

client.on('rateLimit', async rateLimitInfo => {
  console.log(`Rate Limited! for ${rateLimitInfo.timeout} ms because only ${rateLimitInfo.limit} can be used on this endpoint at ${rateLimitInfo.path}`)
})

client.on('message', async message => {

  dogstatsd.increment('adorabot.client.message');
  try {
    commandHandler(message,client,config,cassandraclient,dogstatsd,dbots)
  }
    catch {
      console.log("Command failed");
    }
  //setPresenceForAdora();
});

client.on("invalidated", () => {
  console.log("This client session has been invalidated. Exiting.")
  process.exit(1)
}
)

client.login(config.token);
