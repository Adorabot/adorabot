import { logger } from "./logger";

const { listCharts,getChart } = require('billboard-top-100');
var forEach = require("for-each")
const Discord = require('discord.js');

export async function billboardChartsHelpPage(message,command,args) {
    
}

export async function billboardListChartsScrollable(message,command,args) {

    var pages = []

    await listCharts((err, charts)=> {
        if (err) console.log(err);
       // console.log(charts); // prints array of all charts

        var currentPage:string = "";
        var currentPageStage:string = "";


        forEach(charts, function (eachChart, key) {
        
        var chartCode = eachChart.url.replace("http://www.billboard.com/charts/", "")
        
        currentPageStage = currentPageStage + chartCode + "\n";

       // logger.discordInfoLogger.info("key is " + key + " array size is " + charts.length)

        if(currentPageStage.length < 1000 && (key != 180-1)) {
            //write currentpagestage to currentpage
          // logger.discordInfoLogger.info({type: "billboardChartListTest", message: "currentPageStage.length < 2000"})
            currentPage = currentPageStage;
        } else {
           
           //if(key === ) {

            //}
            currentPageStage = chartCode + "\n";
            pages.push("`"  + currentPage + "`")
           //logger.discordInfoLogger.info({type: "billboardChartListTest", message: "currentPageStage.length >= 2000"})
        }

     //   logger.discordInfoLogger.info({type: "billboardChartListTest", pages: pages})



        //message.channel.send(chartCode)

        //pages.push(chartCode)

       //return true;

        });

        console.log(pages)

          let page = 1 
  
          const embed = new Discord.MessageEmbed() // Define a new embed
          .setColor(0xffffff) // Set the color
          .setFooter(`Page ${page} of ${pages.length}`)
          .setDescription(pages[page-1])
          .setTitle("Billboard List of Charts")
  
          message.channel.send({embed}).then(messageBillboardEmbed => {
            messageBillboardEmbed.react('⬅').then( r => {
              messageBillboardEmbed.react('➡')
  
              // Filters
              const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id
              const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id
  
              const backwards = messageBillboardEmbed.createReactionCollector(backwardsFilter, {timer: 60000})
              const forwards = messageBillboardEmbed.createReactionCollector(forwardsFilter, {timer: 60000})
  
              backwards.on('collect', (r, u) => {
                  if (page === 1) return r.users.remove(r.users.cache.filter(u => u === message.author).first())
                  page--
                  embed.setDescription(pages[page-1])
                  embed.setFooter(`Page ${page} of ${pages.length}`)
                  messageBillboardEmbed.edit(embed)
                  r.users.remove(r.users.cache.filter(u => u === message.author).first())
              })
  
              forwards.on('collect', (r, u) => {
                  if (page === pages.length) return r.users.remove(r.users.cache.filter(u => u === message.author).first())
                  page++
                  embed.setDescription(pages[page-1])
                  embed.setFooter(`Page ${page} of ${pages.length}`)
                  messageBillboardEmbed.edit(embed)
                  r.users.remove(r.users.cache.filter(u => u === message.author).first())
              })
            })
          })
    });
    

      
}

export async function billboardCharts(message,command,args) {
    if(args.length < 1) {
        await billboardChartsHelpPage(message,command,args)
    }
    
    if(args[0] === "list" || args[0] === "listchart" || args[0] === "listcharts" || args[0] === 'charts') {
        billboardListChartsScrollable(message,command,args)
    }
}