const Discord = require('discord.js');
//import * as Discord from 'discord.js'
import { verboseDiscordLog } from "./verboseDiscordLog";
import { billboardVote, billboardPollGetValue } from "./billboardPolls";
import {cassandraclient} from './cassandraclient'
import { editProfile, fetchProfile } from "./userProfile";
import { banGuildMember, isAuthorizedAdmin } from "./moderation";
import { geniusLyrics } from "./genius"
import { billboardCharts } from "./billboard"
import { crossUsageMamaPre, crossUsageMamaFinals } from './get2021mamavoteinfo'
import { processAllModerationCommands, howManyUsersInBanDatabase } from "./moderation"
import { updateDiscordBotsGG, updateDatadogCount } from "./uploadStatsToBotsGg"
import {youtubeChannelStats, youtubeVideoStats} from "./youtube/youtube"
import {sendVoteLinks,showListOfVotersTimes,showTopVoters} from "./vote"
import {helpDirectory, helpDirectoryTest} from "./help"
import {manuallyAddVote} from './adminvotes'
import axios from 'axios'
const wiktionary = require('wiktionary')
const isUrl = require("is-url");
const scrapeyoutube = require('scrape-youtube').default;
const fs = require('fs');
const ytdl = require('ytdl-core');

const getQueryParam = require('get-query-param')

const editJsonFile = require("edit-json-file");
const yts = require('yt-search')
const requestjson = require('request-json');
const request = require('request');
const https = require('https')

const translate = require('@vitalets/google-translate-api');
import { logger,tracer,span } from './logger'
import { ping } from "./ping";
//import { playMusic } from "./music";
import { ytparty,fishing } from "./discordTogether";
import { Message } from "discord.js";
import { igprofile } from "./instagram";
import { adminhelp } from "./adminhelp";
import { makeGif } from "./gif";
const { query } = require("mathram");
import { removeAllPoints, removeVideoId, spitoutlist } from "./trackedListManager";
import { banFromGuild, inspectGuild, listAllGuilds, listAllGuildsAndInsertAutoban, turnOnAdorabanInGuild, turnOffAdorabanInGuild } from "./inspectGuild";
import { spotifySearchForStatsFromMessage } from "./spotify";

export async function commandHandler(msg, config, dogstatsd, startupTime) {

  let client = msg.client;

  const isDM: boolean = msg.guild === null;

  if (msg.content.toLowerCase().startsWith(config.prefix) || msg.content.toLowerCase().startsWith("a!")) {
    
    //warn users about discord ending message services
   if (!isAuthorizedAdmin(msg.author.id)) {
    msg.reply("Discord will be disabling bots reading messages starting August 31, 2022.\n" + 
    "Users of Adora should switch to Adora's Slash Commands.\n"+
    "If Slash Commands aren't showing up in your server, you'll need to give Adora permissions again.\n" +
    "Click this link to give Adora slash permissions in your server. https://discord.com/oauth2/authorize?client_id=737046643974733845&scope=bot%20applications.commands&permissions=2151017550\n" + 
    "Run /help for a list of commands and /invite for our support server."
    );
   }


    if (!msg.author.bot) {

      console.log("prefix true")
      //log triggerprefix adorabot
      //message legal, proceed kind user.
      //parse out args and command

      var args;

      if (msg.content.toLowerCase().startsWith(config.prefix)) {
        args = msg.content.slice(config.prefix.length).split(' ');
      } else {
        if (msg.content.toLowerCase().startsWith("a!")) {
          args = msg.content.slice("a!".length).split(' ');
        }
      }


      const command = args.shift().toLowerCase();
      console.log("Command is " + command);

      try {
        
      const currentspan = tracer.scope().active()
      currentspan.setTag("commandName", command)
      } catch (tracerfail) {
        console.error(tracerfail)
      }
      if (command === "ping") {
       await ping(msg,client);
      }


      if (command === "testytkeys") {

       if (isAuthorizedAdmin(msg.author.id)) {
        console.log("testytkeys");

        var statuses = {}

        config.youtubeApiKeysDaemon.forEach((key, keyIndex) => {

          statuses[keyIndex] = "Loading...";

        });

      var editthismsg = await msg.channel.send(Object.entries(statuses).map(([key, value]) => `${key}: ${value}`).join('\n'));

        config.youtubeApiKeysDaemon.forEach(async (key, keyIndex) => {
    
          const pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=hr-325mclek&key=" + key;

          await axios.get(pathForYtRequest)
          .then(async (response:any) => {

           const body = JSON.parse(response.data);

           if (body.items) {
              if (body.items[0].statistics) {
                statuses[keyIndex] = "Success";
                
            console.log(body);
              } else {
                statuses[keyIndex] = "No stats";
                
            console.log(body);
              }
           } else {
            
            statuses[keyIndex] = "No items found";
            console.log(body);

           }
            
          }).catch((error:any) => {
              
          statuses[keyIndex] = "Failed! Catch axios";
          });

          
          editthismsg.edit(Object.entries(statuses).map(([key, value]) => `${key}: ${value}`).join('\n'));


        });

       }
       

      }

      if (command === "igprofile") {
         igprofile({
           message: msg,
           args
         })
      }

      if (command === "info") {
        msg.reply("This command is deprecated, please use `a!botstats`").catch()
      }

      if (command === "updatepresence") {
       if( isAuthorizedAdmin(msg.author.id))
 {

  msg.reply("you are authorized :unlock:")
  var presencetext = msg.content.replace(/a!update( )?presence/g,"").trim()

        await msg.channel.send('updating presence...')
        if(presencetext.length > 0) {
         // await client.setPresenceForAdoraCustom(presencetext)
          await client.shard.broadcastEval((client,contextParam) => client.setPresenceForAdoraCustom(contextParam.presencetext), 
          {
            context: {
              presencetext: presencetext
            }
          })
          await msg.channel.send('done!')
        //  await msg.channel.send('do') 
        } else {
          await client.setPresenceForAdora()
        await client.shard.broadcastEval(client => client.setPresenceForAdora())
        await msg.channel.send('done!')
        }
 }
      }

      if(command === "manualvoteadd") {
        manuallyAddVote({message: msg, args: args})
      }

      if (command === 'uptime') {
        var roundedTime = Math.round((startupTime/1000))
        msg.reply({embeds: [{
          description: `Up since <t:${roundedTime}:D> <t:${roundedTime}:T>`,
          fields: [
            {"name":"Uptime",
            "value": `<t:${roundedTime}:R>`
          }
          ]
        }]})
      }

      if (command === 'ytparty' || command === "youtubetogether" || command === "yttogether") {
        ytparty({message: msg, client: client})
      }

      if (command === 'fishing') {
        fishing({message: msg, client: client})
      }

      if (command === "spotify" || command === "spot" || command === "s" || command === "sp" || command === "spot") {
        await spotifySearchForStatsFromMessage({
          message: msg,
          client: client,
          config: config,
          command: command
        })
      }

      if (command === 'botstats') {

      //await howManyUsersInBanDatabase(cassandraclient)

      var queryNumberOfSubscribedServers = "SELECT COUNT(*) FROM adoramoderation.guildssubscribedtoautoban WHERE subscribed= ? ALLOW FILTERING;"
      var parametersForSubscribedServers = [true]
      var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
      var lookuphowmanyphishinglinks = "SELECT COUNT(*) FROM adoramoderation.badlinks;"
      var lookuphowmanyytvidstracked = "SELECT COUNT(*) FROM adorastats.trackedytvideosids;"
      var lookuphowmanyytvidsstats = "SELECT * FROM adorastats.statpoints;"
      //return numberofrowsindatabase;

      const promises = [
        client.shard.fetchClientValues('guilds.cache.size'),
        client.shard.broadcastEval(client => client.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)),
        cassandraclient.execute(queryNumberOfSubscribedServers, parametersForSubscribedServers),
        cassandraclient.execute(lookuphowmanybannedusersquery),
        cassandraclient.execute(lookuphowmanyphishinglinks),
        cassandraclient.execute(lookuphowmanyytvidstracked),
        cassandraclient.execute(lookuphowmanyytvidsstats)
      ];

      return Promise.all(promises)
        .then(results => {
          console.log(results[6])

          const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
          const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);
          var returnSubscribedServersCount = results[2];
          var subscribedServerCount = returnSubscribedServersCount.rows[0].count.low
          var returnBanDatabaseAmount = results[3];
          var numberofrowsindatabase = returnBanDatabaseAmount.rows[0].count.low
          var numberofrowsphishing = results[4].rows[0].count.low
          var numberofrowsytvids = results[5].rows[0].count.low
          var numberofrowsytstats = results[6].rows[0].amount
          var bob = `Bot Statistics`
          return msg.channel.send({embeds: [{description: bob,"fields": [
            {
              "name": "Servers",
              "value": `${totalGuilds}`
            },
            {
              "name": "Members",
              "value": `${totalMembers}`
            },
            {
              "name": "Shards",
              "value": `${client.shard.count}`
            },
            {
              "name": "Bans in Database",
              "value": `${numberofrowsindatabase}`,
              "inline": true
            },
            {
              "name": "Servers Subscribed to Autoban",
              "value": `${subscribedServerCount}`,
              "inline": true
            },
            {
              "name": "Phishing links blocked",
              "value": `${numberofrowsphishing}`
            }
          ]},
          {
            "fields": [
              {
                "name": "Tracked YouTube Videos",
                "value": `${numberofrowsytvids}`,
                "inline": true
              },
              {
                "name": "Video Statistic Points",
                "value": `${numberofrowsytstats}`,
                "inline": true
              }
            ]
          }]
        })
        .catch(console.error);





    }).catch((error) => {
      console.error(error)
    })
    
    }

      if (command === "bio" || command === "viewbio") {
        fetchProfile(client, msg, args, cassandraclient)
      }

      if (command === "gif") {
        makeGif({message:msg,args})
      }

      if (command === "datadog") {
        updateDatadogCount(client,config)
      }

      if (command === "vote") {
        sendVoteLinks(msg)
      }

      if (command === "votes") {
        showTopVoters({message: msg,client})
      }

      if (command === "votesconsolelogtimes") {
        showListOfVotersTimes({message: msg,client})
      }

      if (command === "editbio") {
        editProfile(client, msg, args, cassandraclient)
      }

      if (command === "help") {
        helpDirectory({message: msg,
          command,args})
      }

      if (command === "helptest") {
        helpDirectoryTest({message: msg,
          command,args})
      }

      if (command === "translate") {
        msg.channel.send("")
      }

      if (command === "inviteme" || command === "invite" || command === "inviter") {
        msg.reply("Here's the invite link! It's an honor to help you :) \n" + 
        "https://discord.com/oauth2/authorize?client_id=737046643974733845&scope=bot%20applications.commands&permissions=2151017550"+
        "\nHere's our support server for announcements and questions! Subscribe to the announcements channel for updates. https://discord.gg/3h6dpyzHk7\nRemember to run `a!help` for the list of commands!")
      }

      if (command === "billboard" || command === "bb") {
        await billboardCharts(msg, command, args,client)
      }

      if (command === "testtypetime") {

        console.log("before")
        var t0 = Date.now()
        msg.channel.startTyping()
          var t1 = Date.now()

         

          msg.channel.send("Call to startTyping took " + (t1 - t0))
      }

      if (command === "gaon" || command === "goan") {
        let pages = ['Page one!', 'Second page', 'Third page']
        let page = 1

        const embed = new Discord.MessageEmbed() // Define a new embed
          .setColor(0xffffff) // Set the color
          .setFooter(`Page ${page} of ${pages.length}`)
          .setDescription(pages[page - 1])

        msg.channel.send({ embeds: [embed] }).then(msgGaonEmbed => {
          msgGaonEmbed.react('⬅').then(r => {
            msgGaonEmbed.react('➡')

            // Filters
            const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === msg.author.id
            const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === msg.author.id

            const backwards = msgGaonEmbed.createReactionCollector(backwardsFilter, { timer: 6000 })
            const forwards = msgGaonEmbed.createReactionCollector(forwardsFilter, { timer: 6000 })

            backwards.on('collect', (r, u) => {
              if (page === 1) return r.users.remove(r.users.cache.filter(u => u === msg.author).first())
              page--
              embed.setDescription(pages[page - 1])
              embed.setFooter(`Page ${page} of ${pages.length}`)
              msgGaonEmbed.edit(embed)
              r.users.remove(r.users.cache.filter(u => u === msg.author).first())
            })

            forwards.on('collect', (r, u) => {
              if (page === pages.length) return r.users.remove(r.users.cache.filter(u => u === msg.author).first())
              page++
              embed.setDescription(pages[page - 1])
              embed.setFooter(`Page ${page} of ${pages.length}`)
              msgGaonEmbed.edit(embed)
              r.users.remove(r.users.cache.filter(u => u === msg.author).first())
            })
          })
        })
      }

      if (command === "bv") {
        billboardVote(msg, args)
      }

      if (command === "adminhelp") {
        adminhelp({message: msg})
      }

      if (command === "youtubestats" || command === "ytstat" || command === "ytstats" || command === "youtube" || command === "yt") {
       
       await youtubeVideoStats(msg,command,client,config,args);

       const commandRegex = new RegExp(`${command}`,"i")

       const searchYtString = msg.content.replace(/a!/i, "").trim().replace(commandRegex, "").trim()

       setTimeout(() => {
        msg.reply(`**Discord will suspend Message Ingest on 08-31. You must switch to Slash commands from now on: ** \`/yt${args[0] ? `search-or-url: ${searchYtString}`: ""}\`. \n We are sorry for the inconvenience.`);
       }, 1000)
      }

      if (command === "channel" || command === "ch" || command === "youtubechannel") {
        await youtubeChannelStats(msg, command, client, config, args)
      }

      //listing all the tracked videos
      if (command === 'listvideos') {
       if ( isAuthorizedAdmin(msg.author.id) ) {
        spitoutlist(msg)
       }
      }

      if (command === "removevideo") {
        if ( isAuthorizedAdmin(msg.author.id) ) {
          removeVideoId(args[0],msg)
         }
      } 

      if (command === "removepoints") {
        if (isAuthorizedAdmin(msg.author.id)) {
          removeAllPoints(args[0], msg)
        }
      }

      if (command === "wolf") {
        const mathramquery =  msg.content.replace(config.prefix, "").replace(command, "").trim()

        let answer = await query(mathramquery);

        console.log('answer', answer)

        msg.reply({
          embeds: {
            "description": answer
          }
        })
      }

      if (command === 'wiktionary') {
        const wikitionaryQuery = msg.content.replace("a!wiktionary", "").replace("a! wiktionary", "").trim()
        wiktionary(wikitionaryQuery).then(result => {
          console.log(result)
          const discordResponse = result.html.replace(new RegExp('<(/)?i(\S||\s)*?>', "gm"), "_").replace(new RegExp('<(/)?b(\S||\s)*?>', "gm"), "**").replace(new RegExp("(<([^>]+)>)", "gm"), "")
          console.log(discordResponse)
          var discordResponseArray = discordResponse.split("\n");
          console.log(discordResponseArray)
          var previousMessageWiktionaryBlankLine = true
          discordResponseArray.forEach(
            async function (element) {
              if (element === "") {
                if (previousMessageWiktionaryBlankLine === false) {
                  await msg.channel.send("\u2800")
                  previousMessageWiktionaryBlankLine = true
                }
              } else {
                await msg.channel.send(element)
                previousMessageWiktionaryBlankLine = false
              }
            }

          )
        })
      }

      if (command === 'fetchvoiceregions') {
        client.fetchVoiceRegions()
          .then(regions => msg.channel.send(`Available regions are: ${regions.map(region => region.name).join(', ')}`))
          .catch(console.error);
      }

      if (command === "bbp") {
        billboardPollGetValue(msg, args)
      }
/*
      if (command === "play") {
        playMusic({command,message: msg,args,client})
      }*/

      if (command === "inspectguild") {
        if (isAuthorizedAdmin(msg.author.id)) {
          try {
            if (args[0].toLowerCase() === "thisguild") {
              if (msg.inGuild) {
                
                if (msg.guildId) {
                  console.log(msg.guildId)
              inspectGuild(msg,msg.guildId,client)
                }
              } else {
                msg.reply('not inside a guild! try again!')
              }
            } else {
              if (args[0]) {
              
                inspectGuild(msg,args[0],client)
                  } else {
                    msg.reply('please enter a valid guild!\n`a!inspectguild GUILDID` or `a!inspectguild thisguild`')
                  }
            }
            
          } catch (error) {
            console.error(error)
            logger.discordErrorLogger.error({type: error, errortext: error})
          }
        }
       
      }

      if (command === "guilds") {
        if (isAuthorizedAdmin(msg.author.id)) {
          listAllGuilds(msg,client)
        } 
       
      }

      if (command === "adorabanforallguilds") {
        if (isAuthorizedAdmin(msg.author.id)) {
          listAllGuildsAndInsertAutoban(msg, client)
        }
      }

      if(command === "addguildautoban") {
        turnOnAdorabanInGuild(msg,args[0].trim(),client)
      }

      if(command === "removeguildautoban") {
        turnOffAdorabanInGuild(msg,args[0].trim(),client)
      }

      try {
        if (command==="mamapre") {
          msg.reply("The 2021 Mama Awards Votes have ended. Come back next year!");
          crossUsageMamaPre(msg)
        }
  
        if (command === "mama" || command ==="snake" || command==="🐍") {
          msg.reply("The 2021 Mama Awards Votes have ended. Come back next year!");
          crossUsageMamaFinals(msg)
        }
      } catch (mamaerror) {
        console.error(mamaerror)
      }
     

      if (command === "banfromguild") {
        banFromGuild(msg,args[0],client,args[1])
      }

      processAllModerationCommands(msg, command, args, config, client)

      if (command === "genius" || command === "lyric" || command === "lyrics") {
        try {
          geniusLyrics(msg, args, client)
        }
        catch (geniusLyricsCommandError) {
          console.log(geniusLyricsCommandError)
        }

      }

      await dogstatsd.increment('adorabot.triggerprefix');

      await updateDiscordBotsGG(client, config)

     // const isDM: boolean = msg.guild === null;

      var commandToAdoraInfo = {
        type: "commandToAdora", 
        Command: msg.content, 
        msgObject: msg, 
        msgObjectAuthorTag: msg.author.tag,
        commandName: command
      }

      if (msg.guild && isDM === false) {
        commandToAdoraInfo["guildID"] = msg.guild.id;
        commandToAdoraInfo["guildName"] = msg.guild.name;
        }
      

      const loggedCommand = await logger.discordInfoLogger.info(commandToAdoraInfo)
     try {
      tracer.inject(span, 'log', loggedCommand)
     } catch (tracerfail) {
      console.error(tracerfail)
     }

    }

  }
}


