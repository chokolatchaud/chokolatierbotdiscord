import discord
from discord.ext import commands

bot = commands.Bot(command_prefix="?", description="The description")

@bot.event
async def  on_ready():
    print("Ready !")


@bot.command()
async def koukie(ctx):
    await ctx.send('Pas toi je t aime pas')
    
@bot.command()
async def help(ctx):
    await ctx.send("Test du panel heroku en cours")
    await ctx.send("Le panel est correctement connecté")
    





bot.run("OTc0NzMwODIxNDU1OTk0OTAw.GZmQlr.VdMW9hi1LGYPv0pXT8wYdHrkpiflTNcdr-PQoY")
