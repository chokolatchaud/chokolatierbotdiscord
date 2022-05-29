import discord
from discord.ext import commands

default_intents = discord.Intents.default()
default_intents.members = True  # Vous devez activer les intents dans les paramètres du Bot
bot = commands.Bot(command_prefix="?", intents=default_intents)


@bot.event
async def on_ready():
    print("Ready !")
    channel = bot.get_channel(980192834948833300)  # Gets channel from internal cache
    await channel.send("je suis en ligne")  # Sends message to channel


@bot.event
async def on_member_join(member):
    bienvenur: discord.TextChannel = bot.get_channel(974373563370991656)
    await bienvenur.send(
        f"🍫🍫bienvenue dans la ChokoLaterie 🍫🍫{member.display_name}🍫🍫 , Mange Plein de ChokoLat🍫🍫")


@bot.command(name="clear")
async def delete(ctx, number: int):
    messages = await ctx.channel.history(limit=number + 1).flatten()

    for each_message in messages:
        await each_message.delete()


bot.run("OTc0NzMwODIxNDU1OTk0OTAw.GZmQlr.VdMW9hi1LGYPv0pXT8wYdHrkpiflTNcdr-PQoY")
