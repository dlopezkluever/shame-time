

# **Architect's Guide to Cross-Platform Screen Time Integration in React Native**

## **Part 1: Architectural Blueprint & Strategic Overview**

Integrating native device screen time APIs into a cross-platform React Native application is a complex undertaking that extends beyond simple data fetching. It requires a nuanced understanding of two fundamentally different operating system philosophies, stringent privacy and security models, and a robust architectural strategy to unify disparate data streams. This guide provides a comprehensive, end-to-end blueprint for developers tasked with building such a feature, covering the native integration on both iOS and Android, and the subsequent data synchronization with a Supabase backend.

### **1.1 High-Level System Architecture**

The core of the system is designed to bridge the gap between the protected, low-level operating system APIs and a cloud-based backend, using React Native as the central orchestration layer. The data flow follows a distinct path, which must be carefully engineered to handle platform-specific constraints.

The architectural components are as follows:

1. **Native OS Layer (iOS/Android):** This is the source of truth for screen time data. On iOS, this involves the Screen Time API frameworks (FamilyControls, DeviceActivity), which operate within a strict privacy sandbox. On Android, this is the UsageStatsManager, which provides more direct, queryable access to usage data.  
2. **Native Module Bridge (Swift/Kotlin):** This critical layer serves as the intermediary between the native OS and the React Native JavaScript environment. It is responsible for invoking the platform-specific APIs, requesting necessary permissions, and, most importantly, processing and transforming the raw data into a standardized format.  
3. **React Native/Expo Application (JavaScript/TypeScript):** The JS layer orchestrates the entire process. It initiates data fetch requests, manages user-facing UI for permission requests, and contains the business logic for data synchronization. It defines a canonical data model that both native modules must adhere to, ensuring consistency before data is sent to the backend.  
4. **Synchronization Service:** A dedicated module within the React Native application responsible for communicating with the Supabase backend. It handles authentication, data formatting for the database schema, and executing the upsert operations to ensure data integrity and avoid duplication.  
5. **Supabase Backend:** A PostgreSQL database with a suite of tools including authentication and auto-generated APIs. It serves as the final destination for the screen time data, where it is stored securely and can be used for further analysis or user-facing features.

The primary architectural challenge is not merely building these components in isolation but engineering a cohesive system that presents a unified data model to the backend. The iOS API is event-driven and asynchronous, providing data within a sandboxed extension 1, while the Android API is query-based and synchronous, returning detailed, aggregated statistics directly to the application.2 The React Native layer must therefore function as a normalization engine, abstracting these fundamental differences away from the core application logic and the backend.

### **1.2 Critical Platform Divergence: An API Feature Comparison**

A developer embarking on this integration must immediately recognize that the task is highly asymmetrical across iOS and Android. The platforms differ not only in their technical implementation but also in their permission models, data granularity, and the prerequisites for development and distribution. Failure to account for these differences at the project's outset can lead to significant delays and architectural rework. The following table provides a high-impact summary of these critical divergences.

**Table 1: API Feature Comparison: iOS Screen Time vs. Android UsageStatsManager**

| Feature | iOS (Screen Time API) | Android (UsageStatsManager) | Key Implication for Developer |
| :---- | :---- | :---- | :---- |
| **Permission Model** | FamilyControls Entitlement (Requires manual application to Apple) \+ Runtime user authorization.4 | PACKAGE\_USAGE\_STATS special permission (User must be manually redirected to Settings).3 | iOS requires a lengthy, unpredictable approval process before App Store distribution. Android requires designing a careful UX flow to guide users through a non-standard permission process. |
| **Data Access Method** | Event-driven and asynchronous. Monitoring is configured, and the system notifies a sandboxed extension when events occur.1 | Query-based. The app directly queries the system for aggregated stats over a specified time range.2 | iOS logic is reactive and spread across the main app and background extensions. Android logic is proactive and contained within a single module. The app's data-fetching logic must accommodate these two different patterns. |
| **Data Granularity** | Privacy-preserving. Provides total usage time for apps/categories within a sandboxed DeviceActivityReportExtension. The main app handles opaque tokens, not raw app identifiers.8 | Highly granular. Provides package name, total foreground time in milliseconds, and first/last usage timestamps for each app.2 | Raw, detailed data for Supabase sync is more readily available on Android. For iOS, extracting this data for syncing is a major architectural challenge requiring inter-process communication (e.g., via App Groups). |
| **Development Pre-reqs** | Apple Developer Program membership. Xcode. Physical device for testing. Entitlement approval for distribution.4 | Android Studio. Physical device or emulator with Google Play. | The barrier to entry for production is significantly higher on iOS due to the formal entitlement process, which must be treated as a critical project dependency. |
| **RN Library Support** | Good support via react-native-device-activity.11 | Immature/WIP. Custom native module development is the most reliable path.12 | The developer can leverage a third-party library for much of the iOS boilerplate but will likely need to write a custom native module from scratch for Android. |

## **Part 2: Mastering the iOS Screen Time API: A Privacy-First Approach**

Apple's Screen Time API is not a simple data-fetching utility; it is a suite of frameworks designed with user privacy as the foremost principle.1 This design imposes a specific architecture on any application that uses it, involving sandboxed extensions, special entitlements, and an event-driven model. Successfully integrating this API requires a thorough understanding of its components and a strategic approach to its prerequisites.

### **2.1 Deconstructing the Apple Frameworks**

The Screen Time API is composed of three primary frameworks that work in concert to provide parental controls and usage monitoring capabilities. An application must use them together to achieve the goal of fetching usage data.1

* **FamilyControls:** This framework serves as the gatekeeper to the entire API. Its primary responsibilities are managing user authorization and enabling the selection of apps and websites to be monitored. It provides the AuthorizationCenter to request permission from a user (or a guardian in a Family Sharing group).7 Crucially, it also provides the  
  FamilyActivityPicker, a system-level UI component that allows users to select apps, categories, or websites. This picker does not return identifiable information like bundle IDs to the app; instead, it provides an opaque FamilyActivitySelection object containing tokens.1 This is the entry point for any monitoring activity.  
* **DeviceActivity:** This framework is the observer. It takes the opaque tokens provided by FamilyControls and uses them to monitor device activity. Developers can define a DeviceActivitySchedule (e.g., all day, every day) and DeviceActivityEvents (e.g., a threshold of usage for a selection of apps).7 When these events occur, the system wakes up a sandboxed  
  DeviceActivityMonitor extension in the background to execute code, even if the main application is not running.1 This is the mechanism through which an app can react to usage patterns.  
* **ManagedSettings:** This framework is the enforcer. While not directly used for fetching usage data, it is used to apply restrictions based on the monitoring from DeviceActivity. For example, an app could use ManagedSettings to "shield" (block) applications once a usage threshold has been met.5 It is mentioned here for context as part of the complete API suite.

### **2.2 The FamilyControls Entitlement: Your Project's Critical Path**

Before a single line of Screen Time API code can function in a production environment, the application must be granted a special entitlement by Apple: com.apple.developer.family-controls.5 This is not a standard capability that can be enabled in Xcode; it requires a formal application and review process. This process is the single greatest risk and longest lead-time item for the iOS portion of the project and must be treated as a primary project management task.

#### **Step-by-Step Application Process**

1. **Locate the Request Form:** The entitlement must be requested via a specific form on the Apple Developer website. This form is typically accessible only to the Account Holder of an organization's developer account.4 The form is found at  
   developer.apple.com/contact/request/family-controls-distribution.  
2. **Provide Justification:** The application requires a clear and compelling explanation for why access to this sensitive API is necessary. The justification should align with the intended use case of parental controls or digital well-being.  
3. **Request for All Targets:** A common point of failure is neglecting to request the entitlement for all necessary binary targets. The entitlement is tied to a bundle ID, and since the Screen Time API uses extensions, the request must be submitted for the main app's bundle ID *and* the bundle IDs of each extension (e.g., ActivityMonitorExtension, ShieldConfigurationExtension, etc.).4

#### **Timelines and Expectations**

Community and developer forum feedback indicates that the approval process is opaque and can be lengthy. Wait times can range from one to five weeks, and if a request is denied, Apple typically provides no specific feedback, forcing the developer to revise their justification and re-apply.4 Development can proceed using a development-only entitlement on local devices, but distribution to TestFlight or the App Store is completely blocked until the distribution entitlement is granted.4 Therefore, this application process must be initiated at the very beginning of the development cycle, in parallel with coding efforts.

### **2.3 Implementation with react-native-device-activity**

Given the complexity of setting up the native extensions and bridging them to React Native, leveraging a dedicated third-party library is the most efficient approach. The react-native-device-activity library provides a comprehensive wrapper around the Screen Time APIs and is the recommended tool for this implementation.11

#### **Installation and Configuration**

1. **Install the Package:** Add the library to the project using a package manager.  
   Bash  
   npm install react-native-device-activity

2. **Configure the Expo Plugin:** In the project's app.json or app.config.js, configure the library's Expo plugin. This step is crucial as it automates much of the native project setup. The appleTeamId is the developer team ID from the Apple Developer account. The appGroup defines a shared data container that is essential for communication between the main app and its extensions.11  
   JSON  
   {  
     "expo": {  
       "plugins":,

     }  
   }

3. **Generate Native Project:** Run the Expo prebuild command to apply the plugin's configurations and generate the native ios directory.  
   Bash  
   npx expo prebuild \--platform ios

#### **Xcode Project Setup**

After prebuilding, the native iOS project must be opened in Xcode to finalize the configuration.

1. **Open the Workspace:** Open the .xcworkspace file located in the ios directory (open ios/YourProject.xcworkspace).  
2. **Verify Targets:** The Expo plugin should have automatically created the necessary extension targets. Verify that ActivityMonitorExtension, ShieldAction, and ShieldConfiguration exist alongside the main app target.11  
3. **Add Capabilities:** For the main app target *and* for each of the new extension targets, navigate to the "Signing & Capabilities" tab. Click "+ Capability" and add "App Groups," ensuring the group identifier matches the one specified in app.config.js. Then, add the "Family Controls" capability. This action creates the necessary .entitlements files and configures the project to use the APIs.15

### **2.4 Data Retrieval Architecture for iOS**

The primary architectural challenge on iOS is extracting quantifiable usage data from the privacy-preserving sandbox of the DeviceActivity framework and making it available to the React Native application for synchronization with Supabase. The API is intentionally designed to prevent the main app from directly accessing this raw data. A multi-hop data flow using the App Group as a shared medium is required.

Step 1: Request Authorization (JavaScript)  
From the React Native code, the first step is to request authorization from the user.

JavaScript

import \* as DeviceActivity from 'react-native-device-activity';

const requestScreenTimeAuthorization \= async () \=\> {  
  try {  
    await DeviceActivity.requestAuthorization();  
  } catch (error) {  
    console.error("Failed to request authorization", error);  
  }  
};

Step 2: Select Apps to Monitor (JavaScript)  
Next, present the native FamilyActivityPicker to the user. This is done via a component provided by the library. The onSelect callback receives the familyActivitySelection object, which contains the opaque tokens. This selection must be stored (e.g., in component state or persistent storage) and given a unique identifier for later use.11

JavaScript

import { DeviceActivitySelectionView } from 'react-native-device-activity';

const AppSelectionComponent \= ({ onSelectionChange }) \=\> {  
  return (  
    \<DeviceActivitySelectionView  
      onSelect\={(selection) \=\> {  
        console.log('User selected:', selection);  
        onSelectionChange(selection);  
      }}  
      style={{ flex: 1 }}  
    /\>  
  );  
};

Step 3: Start the Monitor (JavaScript)  
Once a selection is made, use it to start a DeviceActivity monitor. A schedule is defined (e.g., 24/7) along with an event that has a threshold. For data collection, the threshold can be set to a small value (e.g., 1 minute) to trigger the monitor extension frequently.

JavaScript

const startMonitoring \= async (selection) \=\> {  
  const schedule \= {  
    intervalStart: { hour: 0, minute: 0 },  
    intervalEnd: { hour: 23, minute: 59 },  
    repeats: true,  
  };

  const events \= {  
    daily: {  
      applications: selection.applicationTokens,  
      categories: selection.categoryTokens,  
      webDomains: selection.webDomainTokens,  
      threshold: { minute: 1 }, // Trigger frequently  
    },  
  };

  await DeviceActivity.startMonitoring('daily\_usage', schedule, events);  
};

Step 4: Process and Share Data in the Native Extension (Swift)  
This is the most critical and complex step. The DeviceActivityMonitor extension runs in the background. When an event threshold is reached, its methods are called. However, this extension does not directly receive the total usage time. The strategy is to use the DeviceActivityReportExtension to generate a report containing the data, and then write this data to the shared App Group.  
The react-native-device-activity library's plugin creates a placeholder ActivityMonitorExtension.swift. This file must be modified to perform the data extraction and sharing.

Swift

import DeviceActivity  
import Foundation  
import ManagedSettings

// This is inside your ActivityMonitorExtension.swift file  
class ActivityMonitorExtension: DeviceActivityMonitor {  
    let store \= ManagedSettingsStore()  
    let userDefaults \= UserDefaults(suiteName: "group.com.yourcompany.yourapp") // Use your App Group ID

    override func intervalDidEnd(for activity: DeviceActivityName) {  
        super.intervalDidEnd(for: activity)  
        Task {  
            await processActivityData()  
        }  
    }  
      
    override func eventDidReachThreshold(\_ event: DeviceActivityEvent.Name, for activity: DeviceActivityName) {  
        super.eventDidReachThreshold(event, for: activity)  
        Task {  
            await processActivityData()  
        }  
    }

    private func processActivityData() async {  
        let context \= DeviceActivityReport.Context("Total Activity")  
        let filter \= DeviceActivityFilter(  
            segment:.daily(  
                during: Calendar.current.dateInterval(  
                    of:.day, for: Date()  
                )\!  
            )  
        )  
          
        do {  
            // This is the key step: get the report data  
            let activityData \= try await DeviceActivityCenter().activityData(for: filter, with: context)  
              
            var usageData: \= \[:\]  
              
            // The activityData contains streams of usage information  
            for activity in activityData.activitySegments {  
                for category in activity.categories {  
                    for application in category.applications {  
                        let appToken \= application.application  
                        // The token itself is not useful, but we can get its bundleIdentifier  
                        if let bundleId \= appToken.bundleIdentifier {  
                            usageData\[bundleId, default: 0\] \+= application.totalActivityDuration  
                        }  
                    }  
                }  
            }  
              
            // Save the processed data to the shared UserDefaults  
            userDefaults?.set(usageData, forKey: "dailyUsageData")  
            print("Successfully saved usage data to App Group UserDefaults.")  
              
        } catch {  
            print("Error processing activity data: \\(error)")  
        }  
    }  
}

Step 5: Retrieve Data from App Group (JavaScript via Native Module)  
The react-native-device-activity library provides a function to read from the shared UserDefaults. From the React Native application, this function can now be called to retrieve the data that the extension has saved.

JavaScript

const getIosUsageData \= async () \=\> {  
  try {  
    // This function is part of the library and reads from the shared App Group  
    const usageData \= await DeviceActivity.getUsageData();   
    console.log('Retrieved usage data from native side:', usageData);  
    return usageData; // e.g., { "com.apple.mobilesafari": 3600, "com.facebook.Facebook": 1800 }  
  } catch (error) {  
    console.error("Failed to get usage data", error);  
    return null;  
  }  
};

This completes the complex data pipeline on iOS, successfully circumventing the privacy sandbox to make usage data available for backend synchronization.

## **Part 3: Implementing Android's UsageStatsManager**

In contrast to iOS, Android provides a more direct, query-based API for accessing application usage statistics: the UsageStatsManager.23 While technically more straightforward, it requires the development of a custom native module, as mature, full-featured React Native libraries for this specific purpose are lacking.12 The primary challenge on Android lies in managing the special user permission required to access the data.

### **3.1 Core Concepts of UsageStatsManager**

The UsageStatsManager API provides access to a device's usage history. The key components are:

* **UsageStatsManager:** The main class used to query for usage statistics. It is obtained via the system service Context.USAGE\_STATS\_SERVICE.3  
* **UsageStats:** An object that contains usage information for a specific application over a given time interval. Key data points include the package name, total time in the foreground (getTotalTimeInForeground), and the first and last time the app was used in the interval (getFirstTimeStamp, getLastTimeStamp).2  
* **Query Intervals:** When querying, a time interval must be specified (INTERVAL\_DAILY, INTERVAL\_WEEKLY, INTERVAL\_MONTHLY, INTERVAL\_YEARLY). The system aggregates data into these buckets. The duration for which data is kept varies by interval; for example, daily data is kept for about 7 days, while yearly data can be kept for up to 2 years.3

### **3.2 Building the PACKAGE\_USAGE\_STATS Permission Flow**

Accessing UsageStatsManager requires the android.permission.PACKAGE\_USAGE\_STATS permission. This is a special permission that cannot be requested via the standard runtime permission dialog. Instead, the user must manually grant it in the device's settings.6 The application is responsible for guiding the user through this process.

Step 1: Manifest Declaration  
First, declare the permission in the android/app/src/main/AndroidManifest.xml file. The tools:ignore="ProtectedPermissions" attribute is added to suppress warnings from Android Studio about using a permission with a protectionLevel of "signature|appop".26

XML

\<manifest xmlns:android\="http://schemas.android.com/apk/res/android"  
          xmlns:tools\="http://schemas.android.com/tools"\>

    \<uses-permission android:name\="android.permission.PACKAGE\_USAGE\_STATS"  
                     tools:ignore\="ProtectedPermissions" /\>

    \<application...\>  
     ...  
    \</application\>  
\</manifest\>

Step 2: Permission Checking and User Guidance  
A native function must be created to check if the permission has been granted. If not, another native function will launch an Intent that takes the user directly to the relevant settings screen.3 These functions will be part of the custom native module.

### **3.3 Developing a Custom Native Module (Kotlin/React Native)**

Since there is no universally adopted library, building a custom native module is the most reliable path. This involves writing Kotlin code and the necessary boilerplate to expose it to React Native's JavaScript environment.28

Step 1: Create Module and Package Files  
In the android/app/src/main/java/com/yourprojectname/ directory, create two new Kotlin files:

* ScreenTimeModule.kt: This will contain the core logic for accessing UsageStatsManager.  
* ScreenTimePackage.kt: This file is boilerplate required by React Native to register the module.

Step 2: Implement the ScreenTimePackage  
This class tells React Native that ScreenTimeModule exists and should be made available.

Kotlin

// ScreenTimePackage.kt  
package com.yourprojectname

import com.facebook.react.ReactPackage  
import com.facebook.react.bridge.NativeModule  
import com.facebook.react.bridge.ReactApplicationContext  
import com.facebook.react.uimanager.ViewManager

class ScreenTimePackage : ReactPackage {  
    override fun createNativeModules(reactContext: ReactApplicationContext): List\<NativeModule\> {  
        return listOf(ScreenTimeModule(reactContext))  
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List\<ViewManager\<\*, \*\>\> {  
        return emptyList()  
    }  
}

Step 3: Register the Package  
Open android/app/src/main/java/com/yourprojectname/MainApplication.kt (or .java) and add the new package to the list of packages returned by the getPackages() method.

Kotlin

// MainApplication.kt  
//...  
import com.yourprojectname.ScreenTimePackage // Import your package

class MainApplication : Application(), ReactApplication {  
    //...  
    override val reactNativeHost: ReactNativeHost \=  
        object : ReactNativeHost(this) {  
            //...  
            override fun getPackages(): List\<ReactPackage\> \=  
                PackageList(this).packages.apply {  
                    // Packages that cannot be autolinked yet can be added manually here, for example:  
                    add(ScreenTimePackage()) // Add your package here  
                }  
            //...  
        }  
    //...  
}

Step 4: Implement the ScreenTimeModule  
This is where the core functionality resides. The module will extend ReactContextBaseJavaModule and expose methods to JavaScript using the @ReactMethod annotation.28

Kotlin

// ScreenTimeModule.kt  
package com.yourprojectname

import android.app.AppOpsManager  
import android.app.usage.UsageStatsManager  
import android.content.Context  
import android.content.Intent  
import android.os.Process  
import android.provider.Settings  
import com.facebook.react.bridge.\*

class ScreenTimeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() \= "ScreenTimeModule"

    @ReactMethod  
    fun hasPermission(promise: Promise) {  
        val appOps \= reactApplicationContext.getSystemService(Context.APP\_OPS\_SERVICE) as AppOpsManager  
        val mode \= appOps.checkOpNoThrow(  
            AppOpsManager.OPSTR\_GET\_USAGE\_STATS,  
            Process.myUid(),  
            reactApplicationContext.packageName  
        )  
        promise.resolve(mode \== AppOpsManager.MODE\_ALLOWED)  
    }

    @ReactMethod  
    fun requestPermission() {  
        val intent \= Intent(Settings.ACTION\_USAGE\_ACCESS\_SETTINGS)  
        intent.flags \= Intent.FLAG\_ACTIVITY\_NEW\_TASK  
        reactApplicationContext.startActivity(intent)  
    }

    // This is the main data fetching method, defined in the next section  
    @ReactMethod  
    fun getUsageStats(startTime: Double, endTime: Double, promise: Promise) {  
        // Implementation in 3.4  
    }  
}

### **3.4 Querying and Processing Usage Data (Kotlin)**

The getUsageStats method is the heart of the native module. It will take start and end timestamps from JavaScript, query the UsageStatsManager, process the results into a clean format, and return them via a Promise.

A crucial function of this native method is to aggregate the data. A query for a multi-day range with a daily interval will return multiple UsageStats objects for the same app. The native code should sum these durations to provide a single, clean total for each application over the entire requested range. This simplifies the logic on the JavaScript side significantly.

Kotlin

// Add this method inside ScreenTimeModule.kt

@ReactMethod  
fun getUsageStats(startTime: Double, endTime: Double, promise: Promise) {  
    try {  
        val usageStatsManager \= reactApplicationContext.getSystemService(Context.USAGE\_STATS\_SERVICE) as UsageStatsManager  
        val usageStatsList \= usageStatsManager.queryUsageStats(  
            UsageStatsManager.INTERVAL\_DAILY,  
            startTime.toLong(),  
            endTime.toLong()  
        )

        if (usageStatsList.isNullOrEmpty()) {  
            promise.resolve(Arguments.createArray())  
            return  
        }

        // Aggregate data: Sum up total time for each package name  
        val aggregatedStats \= mutableMapOf\<String, Long\>()  
        for (usageStats in usageStatsList) {  
            val currentTotal \= aggregatedStats.getOrDefault(usageStats.packageName, 0L)  
            aggregatedStats \= currentTotal \+ usageStats.totalTimeInForeground  
        }

        // Convert the aggregated map to a WritableArray for React Native  
        val results \= Arguments.createArray()  
        for ((packageName, totalTime) in aggregatedStats) {  
            if (totalTime \> 0) { // Only include apps that were actually used  
                val statMap \= Arguments.createMap()  
                statMap.putString("packageName", packageName)  
                // Convert milliseconds to seconds for consistency  
                statMap.putDouble("totalTime", totalTime / 1000.0)  
                results.pushMap(statMap)  
            }  
        }

        promise.resolve(results)

    } catch (e: Exception) {  
        promise.reject("E\_USAGE\_STATS\_ERROR", "Could not retrieve usage stats", e)  
    }  
}

With this custom module in place, the React Native application now has a reliable and efficient way to query and receive processed screen time data on Android.

## **Part 4: Engineering the Supabase Data Sync**

With platform-specific data now accessible from the React Native layer, the final step is to structure this information and synchronize it with a Supabase backend. This involves designing a database schema that can accommodate data from both iOS and Android, configuring the Supabase client, and implementing a robust synchronization service.

### **4.1 Designing the Supabase Database Schema**

A well-designed schema is essential for storing the data efficiently and ensuring data integrity. The schema should be created in the Supabase Dashboard via the SQL Editor.30

#### **SQL Schema Definition**

A single table, screen\_time\_usage, will store the core data. A composite unique constraint is critical here; it prevents duplicate entries for the same user, app, and day, allowing for idempotent upsert operations. This means the sync logic can be run multiple times without creating redundant data.

SQL

\-- Table to store daily screen time usage per app  
CREATE TABLE public.screen\_time\_usage (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  
  device\_id TEXT, \-- An identifier for the specific device, if needed  
  app\_identifier TEXT NOT NULL, \-- e.g., 'com.facebook.katana' or 'com.facebook.Facebook'  
  usage\_date DATE NOT NULL,  
  duration\_seconds INTEGER NOT NULL,  
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),  
  synced\_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  \-- Ensure that there is only one entry per user, per app, per day  
  CONSTRAINT unique\_usage\_entry UNIQUE (user\_id, app\_identifier, usage\_date)  
);

\-- Enable Row Level Security  
ALTER TABLE public.screen\_time\_usage ENABLE ROW LEVEL SECURITY;

\-- RLS Policy: Users can only see and manage their own screen time data  
CREATE POLICY "Allow users to access their own usage data"  
ON public.screen\_time\_usage  
FOR ALL  
USING (auth.uid() \= user\_id)  
WITH CHECK (auth.uid() \= user\_id);

This schema, combined with Supabase's built-in Row Level Security (RLS), ensures that user data is properly isolated and secure.30

### **4.2 Configuring the Supabase Client in Expo**

To communicate with the Supabase backend, the official supabase-js client library must be configured within the Expo application. It requires async-storage for session management in a React Native environment.30

**Step 1: Install Dependencies**

Bash

npx expo install @supabase/supabase-js @react-native-async-storage/async-storage

Step 2: Initialize the Client  
Create a dedicated file, for example lib/supabase.ts, to initialize and export a singleton Supabase client instance. This ensures the client is configured only once. The Project URL and Anon Key are found in the API settings of the Supabase project dashboard.30

TypeScript

// lib/supabase.ts  
import 'react-native-url-polyfill/auto';  
import AsyncStorage from '@react-native-async-storage/async-storage';  
import { createClient } from '@supabase/supabase-js';

const supabaseUrl \= 'YOUR\_SUPABASE\_URL';  
const supabaseAnonKey \= 'YOUR\_SUPABASE\_ANON\_KEY';

export const supabase \= createClient(supabaseUrl, supabaseAnonKey, {  
  auth: {  
    storage: AsyncStorage,  
    autoRefreshToken: true,  
    persistSession: true,  
    detectSessionInUrl: false,  
  },  
});

### **4.3 Implementing the Synchronization Service (TypeScript)**

A dedicated service module should encapsulate all logic related to fetching data from the native modules and sending it to Supabase. This promotes separation of concerns and makes the logic reusable.

The syncScreenTimeData function will be the core of this service. It will determine the current platform, invoke the correct native module, normalize the data into the structure required by the database schema, and perform an upsert operation.

TypeScript

// services/SyncService.ts  
import { Platform, NativeModules } from 'react-native';  
import { supabase } from '../lib/supabase';

// Define a canonical data structure  
interface UsageData {  
  app\_identifier: string;  
  duration\_seconds: number;  
  usage\_date: string; // YYYY-MM-DD  
  platform: 'ios' | 'android';  
}

// Access the custom Android module and the iOS module (from the library)  
const { ScreenTimeModule } \= NativeModules;  
const { RNCScreenTime } \= NativeModules; // Assuming this is the name from the iOS library

const SyncService \= {  
  async syncScreenTimeData(): Promise\<void\> {  
    const { data: { user } } \= await supabase.auth.getUser();  
    if (\!user) {  
      console.log('No user session found. Skipping sync.');  
      return;  
    }

    try {  
      let rawData: { \[key: string\]: any } \=;  
      const today \= new Date();  
      const yesterday \= new Date(today);  
      yesterday.setDate(today.getDate() \- 1);  
        
      const startTime \= yesterday.getTime();  
      const endTime \= today.getTime();

      if (Platform.OS \=== 'ios') {  
        // The iOS module reads pre-processed data from the App Group  
        const iosData \= await RNCScreenTime.getUsageData(); // Fictional method name, replace with actual library method  
        rawData \= Object.entries(iosData).map((\[bundleId, duration\]) \=\> ({  
          app\_identifier: bundleId,  
          duration\_seconds: Math.round(duration as number),  
        }));  
      } else if (Platform.OS \=== 'android') {  
        const hasPerms \= await ScreenTimeModule.hasPermission();  
        if (\!hasPerms) {  
          console.log('Android usage stats permission not granted. Skipping sync.');  
          return;  
        }  
        const androidData \= await ScreenTimeModule.getUsageStats(startTime, endTime);  
        rawData \= androidData.map((stat: any) \=\> ({  
          app\_identifier: stat.packageName,  
          duration\_seconds: Math.round(stat.totalTime),  
        }));  
      }

      if (rawData.length \=== 0) {  
        console.log('No new usage data to sync.');  
        return;  
      }

      // Normalize data for Supabase  
      const payload: UsageData \= rawData.map(item \=\> ({  
       ...item,  
        user\_id: user.id,  
        usage\_date: yesterday.toISOString().split('T'), // Attribute usage to the previous full day  
        platform: Platform.OS,  
      }));

      // Perform an upsert operation  
      const { error } \= await supabase.from('screen\_time\_usage').upsert(payload, {  
        onConflict: 'user\_id,app\_identifier,usage\_date',  
      });

      if (error) {  
        throw error;  
      }

      console.log(\`Successfully synced ${payload.length} usage records.\`);

    } catch (error) {  
      console.error('Error during screen time synchronization:', error);  
    }  
  },  
};

export default SyncService;

This service provides a robust, platform-aware mechanism for keeping the user's screen time data synchronized with the backend, handling normalization and using upsert to maintain data integrity.

## **Part 5: Production-Ready Considerations & Best Practices**

Moving from a functional prototype to a production-ready application requires addressing user experience, data consistency, and background processing. These considerations ensure the feature is not only technically sound but also reliable, user-friendly, and respectful of user privacy.

### **5.1 Designing User-Centric Permission Requests**

Both iOS and Android require access to highly sensitive user data, and their permission models are intrusive by design. Requesting such permissions without context will likely result in a high rate of denial from users. The principle of "permission priming" is essential for building user trust and increasing acceptance rates.33

Instead of immediately triggering the native system permission dialog, the application should first present its own UI—a modal or a dedicated screen—that clearly and concisely explains the value proposition. This "priming" screen should answer three key questions for the user 35:

1. **What data is being requested?** (e.g., "access to your app usage data")  
2. **Why is it needed?** (e.g., "to provide you with personalized insights into your digital habits")  
3. **How will it be used?** (e.g., "This data is used to generate your private reports and is never shared with third parties")

Only after the user agrees on this priming screen should the application invoke the native function to show the actual system-level permission request. This approach respects the user's autonomy, provides necessary context, and frames the permission request as a feature enablement rather than an intrusive data grab.

### **5.2 Data Normalization and Cross-Platform Consistency**

The data returned from iOS and Android APIs have inherent inconsistencies that must be resolved to maintain a clean and useful dataset in the backend.

* **The App Identifier Problem:** iOS uses bundle identifiers (e.g., com.apple.mobilesafari), while Android uses package names (e.g., com.android.chrome). While these are often similar for third-party apps, they are fundamentally different strings for the same logical application. Storing them as-is would result in fragmented data for a single user across their devices.  
* **The Categorization Challenge:** Apple's FamilyActivityPicker can return broad, user-friendly categories like "Social" or "Games".5 Android's  
  UsageStatsManager provides no such categorization natively.

A robust solution to these problems is to implement a backend-driven mapping and enrichment layer. A new table can be created in Supabase, for example app\_metadata, to store a canonical representation of applications.

SQL

CREATE TABLE public.app\_metadata (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  app\_name TEXT NOT NULL,  
  category TEXT,  
  ios\_bundle\_id TEXT UNIQUE,  
  android\_package\_name TEXT UNIQUE,  
  icon\_url TEXT  
);

The synchronization service can then be updated to enrich the raw data. When usage data for an unknown app\_identifier is received, it could query this table. If a match is found, the data can be stored with a canonical app\_id instead of the platform-specific identifier. If no match is found, the new identifier can be added to the table, awaiting manual or automated classification later. This approach ensures that data from different platforms is unified, enabling meaningful cross-device analysis.

### **5.3 Navigating Background Execution and Data Freshness**

For the best user experience, screen time data should be synchronized automatically without requiring the user to manually open the app each day. Implementing reliable background processing is an advanced topic with significant platform-specific complexities.

* **On iOS:** The architecture is naturally suited for background execution. The DeviceActivityMonitor extension is woken up by the system periodically based on the configured schedule and events.1 As demonstrated in Part 2, this extension can process and save the latest usage data to the shared App Group. The synchronization with Supabase can then occur the next time the main application is launched, ensuring the data is reasonably fresh. True background network calls from the extension itself are heavily restricted and less reliable.  
* **On Android:** The standard solution for reliable, deferrable background work is WorkManager. An application can schedule a periodic Worker (e.g., to run once every 24 hours) that executes even if the app is not in the foreground. This worker would need to be implemented in native Kotlin. It would be responsible for invoking the getUsageStats logic from the custom native module and then either performing the Supabase sync directly from native code (using a Kotlin Supabase client) or using a mechanism like Headless JS to trigger the JavaScript-based sync service.

Given the complexity, the recommended initial implementation is a reliable "sync-on-app-open" model. This provides core functionality and a solid foundation. Fully automated background synchronization can be introduced later as a feature enhancement, with WorkManager on Android being the correct path for further investigation.

#### **Works cited**

1. Meet the Screen Time API \- WWDC21 \- Videos \- Apple Developer, accessed August 29, 2025, [https://developer.apple.com/videos/play/wwdc2021/10123/](https://developer.apple.com/videos/play/wwdc2021/10123/)  
2. UsageStatsManager.QueryAndAggregateUsageStats(Int64, Int64) Method (Android.App.Usage) | Microsoft Learn, accessed August 29, 2025, [https://learn.microsoft.com/en-us/dotnet/api/android.app.usage.usagestatsmanager.queryandaggregateusagestats?view=net-android-35.0](https://learn.microsoft.com/en-us/dotnet/api/android.app.usage.usagestatsmanager.queryandaggregateusagestats?view=net-android-35.0)  
3. android \- How to use UsageStatsManager? \- Stack Overflow, accessed August 29, 2025, [https://stackoverflow.com/questions/26431795/how-to-use-usagestatsmanager](https://stackoverflow.com/questions/26431795/how-to-use-usagestatsmanager)  
4. Production Access to Screen Time API : r/swift \- Reddit, accessed August 29, 2025, [https://www.reddit.com/r/swift/comments/1j1rpi2/production\_access\_to\_screen\_time\_api/](https://www.reddit.com/r/swift/comments/1j1rpi2/production_access_to_screen_time_api/)  
5. A Developer's Guide to Apple's Screen Time APIs (FamilyControls, ManagedSettings, DeviceActivity) | by Juliusbrussee | Medium, accessed August 29, 2025, [https://medium.com/@juliusbrussee/a-developers-guide-to-apple-s-screen-time-apis-familycontrols-managedsettings-deviceactivity-e660147367d7](https://medium.com/@juliusbrussee/a-developers-guide-to-apple-s-screen-time-apis-familycontrols-managedsettings-deviceactivity-e660147367d7)  
6. android.app.usage.UsageStatsManager \- Documentation \- HCL Software Open Source, accessed August 29, 2025, [http://opensource.hcltechsw.com/volt-mx-native-function-docs/Android/android.app.usage-Android-10.0/\#\!/api/android.app.usage.UsageStatsManager](http://opensource.hcltechsw.com/volt-mx-native-function-docs/Android/android.app.usage-Android-10.0/#!/api/android.app.usage.UsageStatsManager)  
7. Exploring Screen Time API in Swift | by Expert App Devs \- Medium, accessed August 29, 2025, [https://medium.com/@expertappdevs/exploring-screen-time-api-in-swift-146eeda5ad02](https://medium.com/@expertappdevs/exploring-screen-time-api-in-swift-146eeda5ad02)  
8. Mastering Apple's Screen Time API (Part 4): Visualizing and Managing Activity Data, accessed August 29, 2025, [https://medium.com/@manishdevstudio/mastering-apples-screen-time-api-part-4-visualizing-and-managing-activity-data-a761a8daed55](https://medium.com/@manishdevstudio/mastering-apples-screen-time-api-part-4-visualizing-and-managing-activity-data-a761a8daed55)  
9. Swift using Family Controls to limit apps and get name of app \- Stack Overflow, accessed August 29, 2025, [https://stackoverflow.com/questions/79286261/swift-using-family-controls-to-limit-apps-and-get-name-of-app](https://stackoverflow.com/questions/79286261/swift-using-family-controls-to-limit-apps-and-get-name-of-app)  
10. Has anyone requested Family Controls entitlement from Apple? How long did that process take? How was it? : r/iOSProgramming \- Reddit, accessed August 29, 2025, [https://www.reddit.com/r/iOSProgramming/comments/1jtojjk/has\_anyone\_requested\_family\_controls\_entitlement/](https://www.reddit.com/r/iOSProgramming/comments/1jtojjk/has_anyone_requested_family_controls_entitlement/)  
11. kingstinct/react-native-device-activity: Provides direct ... \- GitHub, accessed August 29, 2025, [https://github.com/kingstinct/react-native-device-activity](https://github.com/kingstinct/react-native-device-activity)  
12. mvincent7891/UsageStatsModule: UsageStats React Native Module \- GitHub, accessed August 29, 2025, [https://github.com/mvincent7891/UsageStatsModule](https://github.com/mvincent7891/UsageStatsModule)  
13. app-usage-tracker · GitHub Topics, accessed August 29, 2025, [https://github.com/topics/app-usage-tracker?l=kotlin](https://github.com/topics/app-usage-tracker?l=kotlin)  
14. Screen Time Technology Frameworks | Apple Developer Documentation, accessed August 29, 2025, [https://developer.apple.com/documentation/screentimeapidocumentation](https://developer.apple.com/documentation/screentimeapidocumentation)  
15. FamilyControls | Apple Developer Documentation, accessed August 29, 2025, [https://developer.apple.com/documentation/FamilyControls](https://developer.apple.com/documentation/FamilyControls)  
16. DeviceActivity | Apple Developer Documentation, accessed August 29, 2025, [https://developer.apple.com/documentation/deviceactivity](https://developer.apple.com/documentation/deviceactivity)  
17. Getting Applications from DeviceActivityEvent swift \- Stack Overflow, accessed August 29, 2025, [https://stackoverflow.com/questions/72020020/getting-applications-from-deviceactivityevent-swift](https://stackoverflow.com/questions/72020020/getting-applications-from-deviceactivityevent-swift)  
18. Family Controls | Apple Developer Documentation, accessed August 29, 2025, [https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.family-controls](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.family-controls)  
19. Family Controls | Apple Developer Forums, accessed August 29, 2025, [https://developer.apple.com/forums/tags/family-controls?page=3\&sortBy=oldest](https://developer.apple.com/forums/tags/family-controls?page=3&sortBy=oldest)  
20. Screen Time | Apple Developer Documentation, accessed August 29, 2025, [https://developer.apple.com/documentation/ScreenTime](https://developer.apple.com/documentation/ScreenTime)  
21. README.md \- kingstinct/react-native-device-activity \- GitHub, accessed August 29, 2025, [https://github.com/kingstinct/react-native-device-activity/blob/main/README.md](https://github.com/kingstinct/react-native-device-activity/blob/main/README.md)  
22. react-native-screen-time-api CDN by jsDelivr \- A CDN for npm and ..., accessed August 29, 2025, [https://www.jsdelivr.com/package/npm/react-native-screen-time-api](https://www.jsdelivr.com/package/npm/react-native-screen-time-api)  
23. android.app.usage | API reference | Android Developers, accessed August 29, 2025, [https://developer.android.com/reference/kotlin/android/app/usage/package-summary](https://developer.android.com/reference/kotlin/android/app/usage/package-summary)  
24. UsageStatsManager \- Android SDK, accessed August 29, 2025, [http://docs.52im.net/extend/docs/api/android-50/reference/android/app/usage/UsageStatsManager.html](http://docs.52im.net/extend/docs/api/android-50/reference/android/app/usage/UsageStatsManager.html)  
25. UsageStatsManager Permissions : r/learnandroid \- Reddit, accessed August 29, 2025, [https://www.reddit.com/r/learnandroid/comments/e2to8h/usagestatsmanager\_permissions/](https://www.reddit.com/r/learnandroid/comments/e2to8h/usagestatsmanager_permissions/)  
26. Error in Manifest.xml when adding PACKAGE\_USAGE\_STATS ..., accessed August 29, 2025, [https://stackoverflow.com/questions/27097743/error-in-manifest-xml-when-adding-package-usage-stats-android-lollipop](https://stackoverflow.com/questions/27097743/error-in-manifest-xml-when-adding-package-usage-stats-android-lollipop)  
27. usage\_stats | Flutter package \- Pub.dev, accessed August 29, 2025, [https://pub.dev/packages/usage\_stats](https://pub.dev/packages/usage_stats)  
28. Android Native Modules, accessed August 29, 2025, [https://reactnative.dev/docs/legacy/native-modules-android](https://reactnative.dev/docs/legacy/native-modules-android)  
29. React Native: Two-Way Bridging with Android Native Modules \- DEV Community, accessed August 29, 2025, [https://dev.to/amitkumar13/react-native-079-new-architecture-bridging-with-android-native-modules-11ih](https://dev.to/amitkumar13/react-native-079-new-architecture-bridging-with-android-native-modules-11ih)  
30. Build a User Management App with Expo React Native | Supabase ..., accessed August 29, 2025, [https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)  
31. Use Supabase with React, accessed August 29, 2025, [https://supabase.com/docs/guides/getting-started/quickstarts/reactjs](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)  
32. Use Supabase Auth with React Native, accessed August 29, 2025, [https://supabase.com/docs/guides/auth/quickstarts/react-native](https://supabase.com/docs/guides/auth/quickstarts/react-native)  
33. Asking nicely: 3 strategies for successful mobile permission priming \- Appcues, accessed August 29, 2025, [https://www.appcues.com/blog/mobile-permission-priming](https://www.appcues.com/blog/mobile-permission-priming)  
34. Consent Management 101: Navigating User Consent for Data Collection and Use \- Zendata, accessed August 29, 2025, [https://www.zendata.dev/post/consent-management-101-navigating-user-consent-for-data-collection-and-use](https://www.zendata.dev/post/consent-management-101-navigating-user-consent-for-data-collection-and-use)  
35. Determine sensitive data access needs \- Android Developers, accessed August 29, 2025, [https://developer.android.com/games/develop/permissions](https://developer.android.com/games/develop/permissions)  
36. Designing for Privacy \- UXmatters, accessed August 29, 2025, [https://www.uxmatters.com/mt/archives/2024/10/designing-for-privacy.php](https://www.uxmatters.com/mt/archives/2024/10/designing-for-privacy.php)