package com.cocoapp;

import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
        ReactContext context = mReactInstanceManager.getCurrentReactContext();
        // If it's constructed, send a notification
        if (context == null) {
            // Otherwise wait for construction, then send the notification
            mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext context) {
                    MainActivity.this.startService(new Intent(MainActivity.this, CocoService.class));
                }
            });
        } else {
            MainActivity.this.startService(new Intent(MainActivity.this, CocoService.class));
        }
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "CocoApp";
    }
}
