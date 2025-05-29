package com.yourname.weilang.widgets

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.widget.RemoteViews
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.yourname.weilang.R

@ReactModule(name = StreakWidgetModule.NAME)
class StreakWidgetModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val NAME = "StreakWidget"
    }

    override fun getName() = NAME

    @ReactMethod
    fun updateStreak(streak: Int) {
        val manager = AppWidgetManager.getInstance(reactContext)
        val component = ComponentName(reactContext, StreakWidgetProvider::class.java)
        val ids = manager.getAppWidgetIds(component)
        for (id in ids) {
            val views = RemoteViews(reactContext.packageName, R.layout.streak_widget)
            views.setTextViewText(R.id.streak_text, "$streak day streak")
            manager.updateAppWidget(id, views)
        }
    }
}
