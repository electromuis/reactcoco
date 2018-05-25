package com.cocoapp;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.widget.Toast;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import okhttp3.*;
import okio.ByteString;

public class CocoService extends Service {
    private OkHttpClient client;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    protected void init() {
        WebSocketListener listener = new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                super.onOpen(webSocket, response);

                WritableMap props = new WritableNativeMap();
                CocoService.this.sendEvent("WS_OPEN", props);
            }

            @Override
            public void onMessage(WebSocket webSocket, String text) {
                super.onMessage(webSocket, text);

                WritableMap props = new WritableNativeMap();
                props.putString("message", text);
                CocoService.this.sendEvent("WS_MESSAGE", props);
            }

            @Override
            public void onMessage(WebSocket webSocket, ByteString bytes) {
                super.onMessage(webSocket, bytes);
            }

            @Override
            public void onClosing(WebSocket webSocket, int code, String reason) {
                super.onClosing(webSocket, code, reason);
            }

            @Override
            public void onClosed(WebSocket webSocket, int code, String reason) {
                super.onClosed(webSocket, code, reason);

                WritableMap props = new WritableNativeMap();
                CocoService.this.sendEvent("WS_CLOSE", props);
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                super.onFailure(webSocket, t, response);
            }
        };

        client = new OkHttpClient();
        Request request = new Request.Builder().url("ws://192.168.1.12:8080").build();
        WebSocket ws = client.newWebSocket(request, listener);
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        ReactContext reactContext = ((ReactApplication)getApplication()).getReactNativeHost().getReactInstanceManager().getCurrentReactContext();

        if(reactContext == null) {
            return;
        }

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Toast.makeText(this,"Service created", Toast.LENGTH_LONG).show();

        init();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Toast.makeText(this,"Service destroyed", Toast.LENGTH_LONG).show();
    }
}
