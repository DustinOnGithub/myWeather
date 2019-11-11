package com.example.myweahter

import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView);
        webView.webViewClient = object : WebViewClient(){
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                view?.loadUrl(url)
                return true
            }
        }

        webView.getSettings().setJavaScriptEnabled(true)
        webView.settings.javaScriptCanOpenWindowsAutomatically = true;


        if (18 < Build.VERSION.SDK_INT){
            //18 = JellyBean MR2, KITKAT=19
            webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        }

        webView.loadUrl("file:///android_asset/index.html")
    }
}
