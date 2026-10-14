package com.harrison.mancuernas;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Locale;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.graphics.Color;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Native")
public class NativePlugin extends Plugin {

    @PluginMethod
    public void vibrate(PluginCall call) {
        int ms = call.getInt("ms", 50);
        try {
            Vibrator v = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= 26) {
                    v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(ms);
                }
            }
        } catch (Exception ignored) {}
        call.resolve();
    }

    @PluginMethod
    public void keepAwake(PluginCall call) {
        final boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        getActivity().runOnUiThread(() -> {
            if (on) getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        });
        call.resolve();
    }

    @PluginMethod
    public void setBars(PluginCall call) {
        final String c = call.getString("color", "#f4f5f8");
        final boolean dark = Boolean.TRUE.equals(call.getBoolean("dark", false));
        getActivity().runOnUiThread(() -> {
            try {
                Window w = getActivity().getWindow();
                int col = Color.parseColor(c);
                w.setStatusBarColor(col);
                w.setNavigationBarColor(col);
                WindowInsetsControllerCompat ic = WindowCompat.getInsetsController(w, w.getDecorView());
                ic.setAppearanceLightStatusBars(!dark);
                ic.setAppearanceLightNavigationBars(!dark);
                call.resolve();
            } catch (Exception e) {
                call.reject("color inválido");
            }
        });
    }

    // ---------- sonidos (SoundPool, se mezclan con la música sin pausarla) ----------
    private SoundPool pool;
    private final HashMap<String, Integer> sounds = new HashMap<>();

    private SoundPool pool() {
        if (pool == null) {
            AudioAttributes aa = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
            pool = new SoundPool.Builder().setMaxStreams(6).setAudioAttributes(aa).build();
        }
        return pool;
    }

    @PluginMethod
    public void loadSounds(PluginCall call) {
        JSArray names = call.getArray("names");
        String dir = call.getString("dir", "public/sounds");
        int ok = 0;
        try {
            for (int i = 0; i < names.length(); i++) {
                String n = names.getString(i);
                String key = dir + "/" + n;
                if (sounds.containsKey(key)) { ok++; continue; }
                int id;
                try {
                    AssetFileDescriptor fd = getContext().getAssets().openFd(key);
                    id = pool().load(fd, 1);
                    fd.close();
                } catch (Exception e) {
                    File out = new File(getContext().getCacheDir(), key.replace('/', '_'));
                    if (!out.exists()) {
                        InputStream in = getContext().getAssets().open(key);
                        OutputStream os = new FileOutputStream(out);
                        byte[] buf = new byte[8192]; int r;
                        while ((r = in.read(buf)) > 0) os.write(buf, 0, r);
                        os.close(); in.close();
                    }
                    id = pool().load(out.getAbsolutePath(), 1);
                }
                sounds.put(key, id);
                ok++;
            }
        } catch (Exception ignored) {}
        JSObject r = new JSObject();
        r.put("loaded", ok);
        call.resolve(r);
    }

    @PluginMethod
    public void play(PluginCall call) {
        String key = call.getString("dir", "public/sounds") + "/" + call.getString("name", "");
        float vol = call.getFloat("vol", 1f);
        Integer id = sounds.get(key);
        if (id != null) pool().play(id, vol, vol, 1, 0, 1f);
        call.resolve();
    }

    // ---------- voz (TextToSpeech, baja el volumen de la música mientras habla) ----------
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private AudioFocusRequest focusReq;

    private AudioManager am() { return (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE); }

    private void duck(boolean on) {
        try {
            AudioManager a = am();
            if (Build.VERSION.SDK_INT >= 26) {
                if (on) {
                    focusReq = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                        .setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()).build();
                    a.requestAudioFocus(focusReq);
                } else if (focusReq != null) {
                    a.abandonAudioFocusRequest(focusReq);
                }
            } else {
                if (on) a.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK);
                else a.abandonAudioFocus(null);
            }
        } catch (Exception ignored) {}
    }

    @PluginMethod
    public void ttsInit(PluginCall call) {
        if (tts != null) { JSObject r = new JSObject(); r.put("ok", ttsReady); call.resolve(r); return; }
        tts = new TextToSpeech(getContext(), status -> {
            if (status == TextToSpeech.SUCCESS) {
                int res = tts.setLanguage(new Locale("es", "CO"));
                if (res < 0) res = tts.setLanguage(new Locale("es", "US"));
                if (res < 0) res = tts.setLanguage(new Locale("es"));
                ttsReady = res >= 0;
                tts.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) {}
                    @Override public void onDone(String id) { if (!tts.isSpeaking()) duck(false); }
                    @Override public void onError(String id) { duck(false); }
                });
            }
            JSObject r = new JSObject();
            r.put("ok", ttsReady);
            call.resolve(r);
        });
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        float rate = call.getFloat("rate", 1f);
        float pitch = call.getFloat("pitch", 1f);
        boolean queue = Boolean.TRUE.equals(call.getBoolean("queue", false));
        if (tts != null && ttsReady && text.length() > 0) {
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);
            duck(true);
            Bundle b = new Bundle();
            b.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1f);
            tts.speak(text, queue ? TextToSpeech.QUEUE_ADD : TextToSpeech.QUEUE_FLUSH, b, "mc" + System.currentTimeMillis());
        }
        call.resolve();
    }

    @PluginMethod
    public void stopSpeak(PluginCall call) {
        if (tts != null) tts.stop();
        duck(false);
        call.resolve();
    }


    // ---------- notificación en curso: cronómetro del entreno o cuenta regresiva del descanso ----------
    private static final int ONGOING_ID = 900;
    private static final String CH = "mc_live";

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CH) == null) {
                NotificationChannel c = new NotificationChannel(CH, "Entrenamiento en curso", NotificationManager.IMPORTANCE_LOW);
                c.setDescription("Muestra el temporizador del descanso y el tiempo del entreno");
                c.setShowBadge(false);
                c.setSound(null, null);
                c.enableVibration(false);
                nm.createNotificationChannel(c);
            }
        }
    }

    @PluginMethod
    public void ongoing(PluginCall call) {
        try {
            Context ctx = getContext();
            ensureChannel();
            String title = call.getString("title", "Mancuernas");
            String body = call.getString("body", "");
            long when = (long) (double) call.getDouble("when", (double) System.currentTimeMillis());
            boolean down = Boolean.TRUE.equals(call.getBoolean("countdown", false));
            Intent open = new Intent(ctx, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pi = PendingIntent.getActivity(ctx, 3, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, CH) : new Notification.Builder(ctx);
            int icon = ctx.getResources().getIdentifier("ic_stat_mancuernas", "drawable", ctx.getPackageName());
            b.setSmallIcon(icon != 0 ? icon : android.R.drawable.ic_media_play)
                .setContentTitle(title).setContentText(body).setContentIntent(pi)
                .setOngoing(true).setOnlyAlertOnce(true).setShowWhen(true).setWhen(when)
                .setUsesChronometer(true).setColor(Color.parseColor(call.getString("color", "#3D5AFE")))
                .setCategory(Notification.CATEGORY_PROGRESS);
            if (Build.VERSION.SDK_INT >= 24) b.setChronometerCountDown(down);
            if (Build.VERSION.SDK_INT >= 26 && down) b.setTimeoutAfter(Math.max(1000, when - System.currentTimeMillis() + 1500));
            if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_LOW);
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.notify(ONGOING_ID, b.build());
        } catch (Exception ignored) {}
        call.resolve();
    }

    @PluginMethod
    public void ongoingCancel(PluginCall call) {
        try {
            NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.cancel(ONGOING_ID);
        } catch (Exception ignored) {}
        call.resolve();
    }

    // ---------- widget de pantalla de inicio ----------
    @PluginMethod
    public void setWidget(PluginCall call) {
        try {
            String data = call.getString("data", "{}");
            SharedPreferences p = getContext().getSharedPreferences("mc_widget", Context.MODE_PRIVATE);
            p.edit().putString("data", data).apply();
            TodayWidget.updateAll(getContext());
        } catch (Exception ignored) {}
        call.resolve();
    }

    // ---------- acciones al abrir desde el widget o los accesos directos ----------
    static String pending = null;

    @PluginMethod
    public void getLaunchAction(PluginCall call) {
        JSObject r = new JSObject();
        r.put("action", pending);
        pending = null;
        call.resolve(r);
    }

    void fireLaunch(String action) {
        JSObject r = new JSObject();
        r.put("action", action);
        notifyListeners("launch", r, false);
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) { tts.shutdown(); tts = null; }
        if (pool != null) { pool.release(); pool = null; }
        super.handleOnDestroy();
    }
}
