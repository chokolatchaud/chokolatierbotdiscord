import json
import random
import discord
from discord.ext import commands
import os



default_intents = discord.Intents.default()
default_intents.members = True  # Vous devez activer les intents dans les paramètres du Bot
bot = commands.Bot(command_prefix="?", intents=default_intents, help_command=None)


@bot.event
async def on_ready():
    print("Ready !")
    channel = bot.get_channel(980192834948833300)  # Gets channel from internal cache
    await channel.send("je suis en ligne Via La DataBase 24h/24h Dev impossible")  # Sends message to channel


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



@bot.command(name="work")
@commands.cooldown(1, 30, commands.BucketType.user)
async def travail(ctx):
    listrandom = [1, 2]
    varrandom = random.choice(listrandom)
    if varrandom == 1:
        await ctx.send("Vous venez de recevoir Une tablette de ChokoLat")
        with open('data.json', "r+") as f:
            data_raw = json.load(f)
            data_raw[str(ctx.author.id)]["argent"] += 1
            f.seek(0)
            json.dump(data_raw, f)
            f.truncate()
    else:
        await ctx.send("tu na pas eu de chokolat retente ta chance")


@bot.command(name="bal")
async def bank(ctx):
    with open('data.json', "r+") as f:
        f.seek(0)
        data_raw = json.load(f)
        bal = data_raw[str(ctx.author.id)]["argent"]
        await ctx.send(f"{ctx.author.name} tu as {bal} Tablette De ChokoLat sur ton compte")


@bot.command(name="idload")
@commands.has_role("Chef ChokoLatier")
async def load(ctx, id):
    with open('data.json', "r+") as f:
        data_raw = json.load(f)
        f.seek(0)
        try:
            recupid = data_raw[str(id)]
            await ctx.send(f"Voici Les Information que j'ai sur ce Joueur {recupid}")
        except:
            await ctx.send(f"L'uttulisateur {id} n'est pas connu")


@bot.command(name="help")
async def help__(ctx):
    await ctx.send("?work (permet de gagner des Tablette De ChokoLat)")
    await ctx.send("?bal (permet de savoir combien de tablette de ChokoLat on a)")
    await ctx.send("?shoplist (savoir tout les objet qui peuvent etre achetez et leurs prix)")
    await ctx.send("?shop <item_number> (permet d'acheter l'item par son numero)")


@bot.command(name="shoplist")
async def shoppingss(ctx):
    await ctx.send("1.ChokoLat Message (permet d'envoyer un message via le bot) cost: 30")


@bot.command(name="shop")
async def shopping(ctx, number):
    with open('data.json', "r+") as f:
        f.seek(0)
        data_raw = json.load(f)
        bal = data_raw[str(ctx.author.id)]["argent"]
        if number == "1":
            if bal >= 30:
                data_raw[str(ctx.author.id)]["ChokolatMessage"] += 1
                print(data_raw[str(ctx.author.id)]["ChokolatMessage"])
                data_raw[str(ctx.author.id)]["argent"] -= 30
                f.seek(0)
                json.dump(data_raw, f)
                f.truncate()
                bal = data_raw[str(ctx.author.id)]["argent"]
                await ctx.send(f"{ctx.author.name} a acheter Une Tablette Message")
                await ctx.send(f"{ctx.author.name} ton nouveau solde est {bal}")
            else:
                await ctx.send("tu n'a pas assez d'argent")


@bot.command(name="bag")
async def sac(ctx):
    with open('data.json', "r+") as f:
        data_raw = json.load(f)
        Chokolate_message = data_raw[str(ctx.author.id)]["ChokolatMessage"]
        await ctx.send(f"slot1: {Chokolate_message} tablette message")
        

@bot.command(name="useTabletteMessage")
async def tablettemessage(ctx, texte):
    with open('data.json', "r+") as f:
        try:
            f.seek(0)
            data_raw = json.load(f)
            bal = data_raw[str(ctx.author.id)]["ChokolatMessage"]
            if bal >= 1:
                data_raw[str(ctx.author.id)]["ChokolatMessage"] -= 1
                f.seek(0)
                json.dump(data_raw, f)
                f.truncate()
                await ctx.send(texte)
        except:
            ctx.send('?useTabletteMessage <texte>')


bot.run(os.environ['TOKEN'])

