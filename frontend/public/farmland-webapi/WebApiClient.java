package fr.kevyn.farmland.api;

import com.google.gson.Gson;
import okhttp3.*;
import org.bukkit.plugin.Plugin;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

/**
 * Client HTTP pour pousser les donnees Farmland vers le site web.
 * Tous les appels sont asynchrones (OkHttp.enqueue) - jamais de blocage du main thread.
 *
 * Pattern volontairement calque sur DiscordWebhook : OkHttpClient partage,
 * appels fire-and-forget, logs en cas d'echec.
 */
public class WebApiClient {

    private static final String EP_SERVER    = "/api/server/status";
    private static final String EP_MARKET    = "/api/market/structures";
    private static final String EP_LEADER    = "/api/leaderboard";
    private static final String EP_INVENTORY = "/api/player/inventory";

    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private final Plugin plugin;
    private final String baseUrl;
    private final String apiKey;
    private final OkHttpClient http;
    private final Gson gson = new Gson();

    public WebApiClient(Plugin plugin, String baseUrl, String apiKey) {
        this.plugin  = plugin;
        this.baseUrl = stripTrailingSlash(baseUrl);
        this.apiKey  = apiKey;
        this.http = new OkHttpClient.Builder()
                .connectTimeout(5, TimeUnit.SECONDS)
                .callTimeout(10, TimeUnit.SECONDS)
                .build();
    }

    // ===== API PUBLIQUE =====

    public void pushServerStatus(int online, int max, String version) {
        post(EP_SERVER, Map.of(
                "online_players", online,
                "max_players",    max,
                "version",        version
        ));
    }

    public void pushStructurePrice(String name, double price, String category) {
        post(EP_MARKET, Map.of(
                "name",     name,
                "price",    price,
                "category", category
        ));
    }

    public void pushPlayerBalance(String username, double balance, int structures) {
        post(EP_LEADER, Map.of(
                "username",   username,
                "balance",    balance,
                "structures", structures
        ));
    }

    public void pushPlayerInventory(String username, List<OwnedStructure> items) {
        post(EP_INVENTORY, Map.of(
                "username",   username,
                "structures", items
        ));
    }

    // ===== HTTP =====

    private void post(String path, Object bodyObj) {
        Request req = new Request.Builder()
                .url(baseUrl + path)
                .header("X-API-Key", apiKey)
                .header("Content-Type", "application/json")
                .post(RequestBody.create(gson.toJson(bodyObj), JSON))
                .build();

        http.newCall(req).enqueue(new Callback() {
            @Override public void onFailure(Call call, IOException e) {
                plugin.getLogger().log(Level.WARNING,
                        "[WebAPI] echec POST " + path + " : " + e.getMessage());
            }
            @Override public void onResponse(Call call, Response response) {
                try (Response r = response) {
                    if (!r.isSuccessful()) {
                        plugin.getLogger().warning(
                                "[WebAPI] " + path + " -> HTTP " + r.code());
                    }
                }
            }
        });
    }

    private static String stripTrailingSlash(String s) {
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }

    // ===== DTO =====

    public static class OwnedStructure {
        public final String name;
        public final int qty;
        public final double value;
        public OwnedStructure(String name, int qty, double value) {
            this.name = name; this.qty = qty; this.value = value;
        }
    }
}
