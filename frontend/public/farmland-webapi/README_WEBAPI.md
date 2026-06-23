# Integration WebAPI - Farm & Build

Ce dossier contient le client HTTP pour pousser les donnees du plugin vers le site
https://farm-and-build.preview.emergentagent.com

## Fichier ajoute (aucune modification du code existant)

- `src/main/java/fr/kevyn/farmland/api/WebApiClient.java`

## Modifications a faire MANUELLEMENT dans ton code existant

Tous les `// AJOUT WEBAPI:` ci-dessous sont des NOUVELLES lignes a inserer.
Aucune ligne existante n'a besoin d'etre modifiee ou supprimee.

---

### 1. Dans ton plugin principal (ex: `fr.kevyn.farmland.Main` - la classe avec onEnable)

```java
// AJOUT WEBAPI: import en haut du fichier
import fr.kevyn.farmland.api.WebApiClient;

public class Main extends JavaPlugin {

    // AJOUT WEBAPI: champ
    private WebApiClient webApi;

    @Override
    public void onEnable() {
        // ... ton code existant inchange ...

        // AJOUT WEBAPI: bloc complet a coller a la fin de onEnable()
        saveDefaultConfig();
        if (getConfig().getBoolean("webapi.enabled", false)) {
            String base = getConfig().getString("webapi.base_url");
            String key  = getConfig().getString("webapi.api_key");
            this.webApi = new WebApiClient(this, base, key);

            long ticks = getConfig().getLong("webapi.push_interval_seconds", 30L) * 20L;
            getServer().getScheduler().runTaskTimerAsynchronously(this, () -> {
                webApi.pushServerStatus(
                    getServer().getOnlinePlayers().size(),
                    getServer().getMaxPlayers(),
                    getServer().getBukkitVersion()
                );
            }, 20L, ticks);
        }
        // FIN AJOUT WEBAPI
    }

    // AJOUT WEBAPI: getter
    public WebApiClient getWebApi() { return webApi; }
}
```

### 2. Dans ton listener de join/quit (laisse intact, ajoute juste l'appel)

```java
@EventHandler
public void onJoin(PlayerJoinEvent e) {
    // ... ton code existant ...

    // AJOUT WEBAPI:
    if (plugin.getWebApi() != null) {
        plugin.getWebApi().pushServerStatus(
            plugin.getServer().getOnlinePlayers().size(),
            plugin.getServer().getMaxPlayers(),
            plugin.getServer().getBukkitVersion()
        );
    }
}
```

### 3. Dans ton MarketManager (apres recalcul de prix)

```java
// AJOUT WEBAPI: a chaque structure dont le prix change
if (plugin.getWebApi() != null) {
    plugin.getWebApi().pushStructurePrice(
        structure.getName(), structure.getPrice(), structure.getCategory()
    );
}
```

### 4. Dans ton PlayerServer (apres modif de solde / inventaire)

```java
// AJOUT WEBAPI: extraire les valeurs en local AVANT l'appel async (thread-safety)
final String name = player.getUsername();
final double bal  = player.getBalance();
final int    cnt  = player.getOwnedStructures().size();
if (plugin.getWebApi() != null) {
    plugin.getWebApi().pushPlayerBalance(name, bal, cnt);

    List<WebApiClient.OwnedStructure> items = player.getOwnedStructures().stream()
        .map(s -> new WebApiClient.OwnedStructure(s.getName(), s.getQty(), s.getValue()))
        .toList();
    plugin.getWebApi().pushPlayerInventory(name, items);
}
```

### 5. Dans `src/main/resources/config.yml`

Ajoute ce bloc a la fin (sans toucher au reste) :

```yaml
webapi:
  enabled: true
  base_url: "https://farm-and-build.preview.emergentagent.com"
  api_key: "REMPLACER_PAR_PLUGIN_API_KEY"
  push_interval_seconds: 30
```

---

## Dependances Maven (pom.xml)

OkHttp et Gson sont probablement deja dispo via ton DiscordWebhook.
Sinon, ajoute :

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.12.0</version>
</dependency>
```

(Gson est shade par defaut dans Spigot/Paper.)
