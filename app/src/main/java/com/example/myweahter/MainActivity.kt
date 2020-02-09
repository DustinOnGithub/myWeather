package com.example.myweahter

import android.Manifest
import android.app.Activity
import android.content.Context
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import androidx.core.app.ComponentActivity
import androidx.core.app.ComponentActivity.ExtraData
import androidx.core.content.ContextCompat.getSystemService
import android.icu.lang.UCharacter.GraphemeClusterBreak.T
import android.location.Location
import android.location.LocationManager
import android.webkit.*
import android.widget.Toast
import androidx.core.app.ActivityCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import kotlinx.android.synthetic.main.activity_main.*


class MainActivity : AppCompatActivity() {

    inner class WebAppInterface(private val mContext: Context) {

        private lateinit var fusedLocationClient: FusedLocationProviderClient

        fun onCreate(savedInstanceState: Bundle?) {
            fusedLocationClient = LocationServices.getFusedLocationProviderClient(this@MainActivity)
        }

        @JavascriptInterface
        fun showToast(toast: String) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show()
        }

        @JavascriptInterface
        fun getCoordinates(){
            Toast.makeText(mContext, "hole coordinates", Toast.LENGTH_SHORT).show()
            fusedLocationClient.lastLocation.addOnSuccessListener{ location : Location? ->
                if(location != null) {

                    Toast.makeText(mContext, "wuhuuu", Toast.LENGTH_SHORT).show()

                    this@MainActivity.callJs("setCoordinates(${location.latitude}, ${location.longitude}")
                    // Got last known location. In some rare situations this can be null.
                }
            }

        }
    }

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            if (0 != applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) {
                WebView.setWebContentsDebuggingEnabled(true)
            }
        }

        webView = findViewById(R.id.webView)

        webView.webChromeClient = object : WebChromeClient() {

            override fun onConsoleMessage(message: String, lineNumber: Int, sourceID: String) {
                Log.d("MyApplication", "$message -- From line $lineNumber of $sourceID")
            }
        }

        webView.webViewClient = object : WebViewClient(){
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                view?.loadUrl(url)
                return true
            }
        }

        webView.getSettings().setJavaScriptEnabled(true)
        webView.settings.javaScriptCanOpenWindowsAutomatically = true


        if (18 < Build.VERSION.SDK_INT){
            //18 = JellyBean MR2, KITKAT=19
            webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        }

        webView.addJavascriptInterface(WebAppInterface(this), "Android")

        webView.loadUrl("file:///android_asset/index.html")

        val geolocationPermissions : GeolocationPermissions = GeolocationPermissions.getInstance()
        geolocationPermissions.allow("file:///android_asset/index.html")
    }

    fun callJs(function: String){
        webView.loadUrl("javascript:$function;")
    }

}
