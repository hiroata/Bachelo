# Bachelo Database Setup Guide

## Current Database Issues Analysis

Based on the analysis of your Supabase database, here are the identified issues and solutions:

### 🔍 Issues Found

1. **Database Schema Inconsistency**: Multiple table structures (original board system + 5ch-style system)
2. **RLS (Row Level Security) Blocking Operations**: RLS is enabled but may be preventing insertions
3. **Migration State Unclear**: Not all migrations may have been applied correctly
4. **MCP Tool Connection Issues**: Supabase MCP tools are not connecting properly

### 🛠️ Solutions Provided

## Step 1: Complete Database Setup

Run the complete database setup script to ensure all tables, indexes, and functions are created:

```bash
# Install required dependencies if not already installed
npm install pg

# Run the complete database setup
node setup-complete-database.js
```

This script will:
- Create all necessary tables (voice posts, board system, 5ch system, reports, etc.)
- Add proper indexes for performance
- Create required functions and triggers
- Disable RLS for development
- Insert initial categories and boards
- Provide comprehensive error handling

## Step 2: Populate with Sample Data

After the database setup is complete, run the population script:

```bash
node diagnose-and-populate-database.js
```

This script will:
- Diagnose current database state
- Fix any remaining issues
- Populate with legitimate sample forum content
- Generate statistics and reports

## 📊 Database Schema Overview

### Core Tables Created

#### Forum System
- `board_categories` - Forum categories (質問, 雑談, ニュース, etc.)
- `board_posts` - Main forum posts
- `board_replies` - Replies to posts
- `board_post_images` - Image attachments
- `board_post_votes` - Voting system
- `board_reply_votes` - Reply voting

#### 5ch-Style System  
- `boards` - 5ch-style boards (板)
- `threads` - Discussion threads (スレッド)
- `posts` - Individual posts (レス)
- `post_anchors` - Post references (アンカー)
- `post_images` - Image attachments

#### Voice Posts System
- `anonymous_voice_posts` - Voice recordings
- `anonymous_post_comments` - Comments on voice posts
- `anonymous_post_likes` - Like system

#### Moderation & Management
- `reports` - User reports
- `ng_words` - Blocked words filter
- `user_points` - Point system
- `point_transactions` - Point history
- `live_chat_rooms` - Chat rooms
- `live_chat_messages` - Chat messages

## 🚀 Quick Start Commands

```bash
# 1. Complete setup (run once)
node setup-complete-database.js

# 2. Populate with data
node diagnose-and-populate-database.js

# 3. Start your application
npm run dev

# 4. Visit http://localhost:3000
```

## 🔧 Troubleshooting

### If you get connection errors:
1. Check your `.env.local` file has correct Supabase credentials
2. Ensure your Supabase project is active
3. Verify network connectivity

### If tables already exist:
- The scripts use `IF NOT EXISTS` clauses, so they're safe to run multiple times
- Existing data will be preserved

### If you need to start fresh:
1. Go to Supabase Dashboard > SQL Editor
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Re-run the setup scripts

## 📝 Sample Data Included

The population script adds:
- 8 forum categories with descriptions and icons
- 8 sample posts across different categories
- Multiple replies per post
- 4 5ch-style boards
- Basic NG words filter
- Live chat room

## 🔒 Security Notes

- RLS is disabled for development convenience
- Before production deployment, re-enable RLS with proper policies
- IP hashing is used instead of storing actual IP addresses
- No explicit adult content is included in the sample data

## 📊 Expected Results

After running both scripts, you should have:
- 20+ database tables
- 6-8 forum categories
- 4 5ch-style boards  
- 8+ sample posts with replies
- Full moderation system ready
- Live chat system ready

## 🎯 Next Steps

1. **Run the setup scripts as outlined above**
2. **Test your application** at http://localhost:3000
3. **Add custom content** through your admin interface
4. **Configure moderation settings** as needed
5. **Enable RLS policies** before production deployment

The scripts are designed to be safe, comprehensive, and provide immediate working results for your forum system.