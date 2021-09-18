import { MessageEmbed } from "discord.js";
import * as Discord from "discord.js"
import { isAuthorizedAdmin } from "./moderation";


const getServer = async (guildID,client) => {
    // try to get guild from all the shards
    const req = await client.shard.broadcastEval(`this.guilds.cache.get("${guildID}")`);

    // return Guild or null if not found
    return req.find(res => !!res) || null;
}

export async function inspectGuild(message,guildid,client) {
    if (isAuthorizedAdmin(message.author.id)) {
        var guild = await getServer(guildid,client)
        if (guild === null) {
            message.reply("This guild can't be found.")
        } else {
            var guildEmbed:MessageEmbed = new Discord.MessageEmbed({
                "title": guild.name
            });
    
            guildEmbed.setThumbnail(`${guild.iconURL()}`)
    
            message.reply({
                embeds: [
                    guildEmbed
                ]
            })
        }
    }
}