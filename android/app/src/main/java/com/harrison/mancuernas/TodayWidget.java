package com.harrison.mancuernas;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;
import java.util.Calendar;
import org.json.JSONArray;
import org.json.JSONObject;

/** Widget "Hoy": la rutina del día, la racha y el avance de la semana. Lee los datos que guarda la app. */
public class TodayWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) update(c, m, id);
    }

    static void updateAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, TodayWidget.class));
        for (int id : ids) update(c, m, id);
    }

    private static PendingIntent action(Context c, String a, int req) {
        Intent i = new Intent(c, MainActivity.class);
        i.putExtra("mc_action", a);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void update(Context c, AppWidgetManager m, int id) {
        String title = "Mancuernas", sub = "Abre la app para armar tu plan", streak = "0", week = "", btn = "Abrir";
        String food = "";
        boolean train = false;
        try {
            SharedPreferences p = c.getSharedPreferences("mc_widget", Context.MODE_PRIVATE);
            JSONObject o = new JSONObject(p.getString("data", "{}"));
            Calendar cal = Calendar.getInstance();
            int dow = (cal.get(Calendar.DAY_OF_WEEK) + 5) % 7; // lunes = 0
            String today = cal.get(Calendar.YEAR) + "-" + (cal.get(Calendar.MONTH) + 1) + "-" + cal.get(Calendar.DAY_OF_MONTH);
            JSONArray days = o.optJSONArray("days");
            JSONObject d = days != null ? days.optJSONObject(dow) : null;
            streak = o.optString("streak", "0");
            week = o.optString("week", "");
            JSONObject f = o.optJSONObject("food");
            if (f != null) food = today.equals(f.optString("day", "")) ? f.optString("txt", "") : f.optString("empty", "");
            if (today.equals(o.optString("doneDay", ""))) {
                title = "Listo por hoy";
                sub = o.optString("doneSub", "Buen trabajo. A recuperar.");
                btn = "Ver";
            } else if (d != null) {
                title = d.optString("t", "Entreno");
                sub = d.optString("s", "");
                btn = "Empezar";
                train = true;
            } else {
                title = "Hoy descansas";
                sub = o.optString("next", "El músculo crece mientras descansas");
                btn = "Estirar";
            }
        } catch (Exception ignored) {}
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_today);
        v.setTextViewText(R.id.w_title, title);
        v.setTextViewText(R.id.w_sub, sub);
        v.setTextViewText(R.id.w_streak, streak);
        v.setTextViewText(R.id.w_week, week);
        v.setTextViewText(R.id.w_btn, btn);
        v.setTextViewText(R.id.w_food, food);
        v.setViewVisibility(R.id.w_food, food.isEmpty() ? View.GONE : View.VISIBLE);
        v.setOnClickPendingIntent(R.id.w_food, action(c, "food", 12));
        v.setOnClickPendingIntent(R.id.w_root, action(c, "home", 10));
        v.setOnClickPendingIntent(R.id.w_btn, action(c, train ? "start" : "Estirar".equals(btn) ? "stretch" : "home", 11));
        m.updateAppWidget(id, v);
    }
}
