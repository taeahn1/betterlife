# 🏃‍♂️ Apple Watch Workout Data Auto-Upload Guide

This guide explains how to automatically upload Apple Watch workout data to the BetterLife server using iPhone Shortcuts.

---

## 📱 Shortcut Setup Instructions

### **Step 1: Create New Shortcut**

1. Open **Shortcuts** app on iPhone
2. Tap **+** button to create new shortcut
3. Name it: "Upload Workout Data"

---

### **Step 2: Add Actions**

#### **Action 1: Get Recent Workout**
```
Search: "Find Health Samples"
- Type: Workouts
- Sort by: Start Date (Newest First)
- Limit: 1
```

#### **Action 2: Extract Workout Details**
```
Search: "Get Details of Health Sample"
Select the following:
- Workout Type
- Start Date
- End Date
- Duration
- Distance
- Active Energy
- Total Energy
```

#### **Action 3: Get Raw Heart Rate Data**
```
Search: "Find Health Samples"
- Type: Heart Rate
- Add Filters:
  * Start Date >= [Workout Start Date]
  * End Date <= [Workout End Date]
- Sort by: Start Date
- Limit: No Limit
```

#### **Action 4: Build Heart Rate Array**
```
Search: "Repeat"
- Repeat with: [Heart Rate Samples]
- For each item:
  1. Add "Dictionary" action
     - timestamp: [Repeat Item's Start Date]
     - bpm: [Repeat Item's Value]
  2. Add "Add to Variable" action
     - Variable name: heart_rate_samples
```

#### **Action 5: (Optional) Get Pace Data**
```
Search: "Find Health Samples"
- Type: Running Speed
- Filters: Workout time range
- Sort by: Start Date
```

#### **Action 6: (Optional) Get Cadence Data**
```
Search: "Find Health Samples"
- Type: Running Cadence
- Filters: Workout time range
```

#### **Action 7: Create JSON Data**
```
Search: "Dictionary"
Enter the following key-value pairs:

user_id: "your_user_id"  (Replace with your ID)
workout_type: [Workout Type]
start_time: [Start Date]
end_time: [End Date]
duration_seconds: [Duration (seconds)]
distance_meters: [Distance (meters)]
active_calories: [Active Energy]
total_calories: [Total Energy]
avg_heart_rate: [Average Heart Rate]
max_heart_rate: [Max Heart Rate]
min_heart_rate: [Min Heart Rate]
heart_rate_samples: [heart_rate_samples variable]
```

#### **Action 8: Send to API**
```
Search: "Get Contents of URL"
- URL: https://betterlife-zeta.vercel.app/api/workouts
- Method: POST
- Headers:
  * Content-Type: application/json
- Request Body: JSON
  * Select: [Dictionary]
```

#### **Action 9: Show Result (Optional)**
```
Search: "Show Notification"
- Title: "Workout Data Uploaded"
- Body: "Distance: [Distance]km, Time: [Time]min"
```

---

## 🤖 Automation Setup

### **Auto-run When Workout Ends**

1. In **Shortcuts** app, select **Automation** tab
2. Tap **+** button → **Create Personal Automation**
3. Select trigger: **Workout**
4. Condition: **When workout ends**
5. Add action: **Run Shortcut**
   - Select: "Upload Workout Data"
6. Turn OFF **Ask Before Running** (for auto-run)
7. Done

---

## 📊 Data Structure Example

```json
{
  "user_id": "user123",
  "workout_type": "running",
  "start_time": "2026-01-02T18:00:00Z",
  "end_time": "2026-01-02T18:45:00Z",
  "duration_seconds": 2700,
  "distance_meters": 5000,
  "active_calories": 400,
  "total_calories": 450,
  "avg_heart_rate": 150,
  "max_heart_rate": 180,
  "min_heart_rate": 120,
  "heart_rate_samples": [
    { "timestamp": "2026-01-02T18:00:00Z", "bpm": 120 },
    { "timestamp": "2026-01-02T18:01:00Z", "bpm": 135 },
    { "timestamp": "2026-01-02T18:02:00Z", "bpm": 145 }
    // ... more samples
  ]
}
```

---

## ⚠️ Important Notes

### **Data Size Limits**
- Max heart rate samples: 10,000
- For long workouts (2+ hours), sampling is required
- Solution: Select only 1 sample every 10 seconds

### **Sampling Method**
```
In Repeat action:
- Only add when: Index % 10 == 0
```

### **Battery Saving**
- Upload only when connected to Wi-Fi
- Add condition: "If Wi-Fi is connected"

---

## 🎯 Testing

1. Do a short workout with Apple Watch (5-min walk)
2. End workout
3. Manually run "Upload Workout Data" shortcut in Shortcuts app
4. Check notification for success
5. Verify data in BetterLife app

---

## 🆘 Troubleshooting

### **"Permission Denied" Error**
- Go to Settings → Privacy → Health
- Allow all permissions for Shortcuts app

### **"No Data Found" Error**
- Check Apple Watch and iPhone sync
- Verify data in Health app

### **"Upload Failed" Error**
- Check internet connection
- Verify API URL
- Confirm user_id

---

## 📈 Next Steps

Once data is successfully uploaded:
1. Check workout summary on BetterLife main page
2. View detailed records on `/workouts` page
3. Analyze workout intensity with heart rate graphs

**Happy Running! 🏃‍♂️💪**
