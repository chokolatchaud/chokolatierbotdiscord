import discord
from discord.ext import commands

bot = commands.Bot(command_prefix="?", description="The description")

@bot.event
async def  on_ready():
    print("Ready !")


@bot.command()
async def Koukie(ctx):
    await ctx.send('Pas toi je t aime pas')





bot.run(getenv('TOKEN'))
