package com.voicecallselfmanged;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AndroidLog extends ReactContextBaseJavaModule {
    AndroidLog(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "AndroidLog";
    }

    @ReactMethod
    public void createAndroidLog(String logValue) {
        Log.d("AndroidLog", logValue);
    }
}
