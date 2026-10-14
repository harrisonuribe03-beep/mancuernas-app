package com.harrison.mancuernas;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativePlugin.class);
        super.onCreate(savedInstanceState);

        // Botón atrás: primero cierra hojas y pantallas abiertas dentro de la app
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView wv = bridge != null ? bridge.getWebView() : null;
                if (wv != null && wv.canGoBack()) {
                    wv.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                    setEnabled(true);
                }
            }
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleLaunch(intent, true);
    }

    // Widget y accesos directos: mancuernas://start, ://hiit, ://body, ://stretch o el extra mc_action
    private void handleLaunch(Intent i, boolean live) {
        if (i == null) return;
        String a = i.getStringExtra("mc_action");
        if (a == null && i.getData() != null && "mancuernas".equals(i.getData().getScheme())) a = i.getData().getHost();
        if (a == null) return;
        // Queda pendiente hasta que la app la lea; si la app ya está abierta, además se avisa al instante.
        NativePlugin.pending = a;
        if (live) {
            try {
                PluginHandle h = bridge != null ? bridge.getPlugin("Native") : null;
                if (h != null) ((NativePlugin) h.getInstance()).fireLaunch(a);
            } catch (Exception ignored) {}
        }
    }
}
