-- Fix for ON CONFLICT error in Bachelo migration
-- This script addresses the unique constraint issues
-- Only applies fixes to tables that already exist

-- Function to check if table and columns exist before creating constraints
DO $$ 
BEGIN
    -- 1. Fix anonymous_post_likes if it exists and has required columns
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'anonymous_post_likes') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'anonymous_post_likes' AND column_name = 'ip_hash') THEN
            ALTER TABLE anonymous_post_likes DROP CONSTRAINT IF EXISTS anonymous_post_likes_post_id_ip_hash_key;
            ALTER TABLE anonymous_post_likes ADD CONSTRAINT anonymous_post_likes_post_id_ip_hash_key UNIQUE(post_id, ip_hash);
            RAISE NOTICE 'Fixed constraints for anonymous_post_likes';
        ELSE
            RAISE NOTICE 'Table anonymous_post_likes exists but ip_hash column missing, skipping constraint...';
        END IF;
    ELSE
        RAISE NOTICE 'Table anonymous_post_likes does not exist, skipping...';
    END IF;

    -- 2. Fix board_post_votes if it exists and has required columns
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'board_post_votes') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_post_votes' AND column_name = 'ip_hash') THEN
            ALTER TABLE board_post_votes DROP CONSTRAINT IF EXISTS board_post_votes_post_id_ip_hash_key;
            ALTER TABLE board_post_votes ADD CONSTRAINT board_post_votes_post_id_ip_hash_key UNIQUE(post_id, ip_hash);
            RAISE NOTICE 'Fixed constraints for board_post_votes';
        ELSE
            RAISE NOTICE 'Table board_post_votes exists but ip_hash column missing, skipping constraint...';
        END IF;
    ELSE
        RAISE NOTICE 'Table board_post_votes does not exist, skipping...';
    END IF;

    -- 3. Fix board_reply_votes if it exists and has required columns
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'board_reply_votes') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_reply_votes' AND column_name = 'ip_hash') THEN
            ALTER TABLE board_reply_votes DROP CONSTRAINT IF EXISTS board_reply_votes_reply_id_ip_hash_key;
            ALTER TABLE board_reply_votes ADD CONSTRAINT board_reply_votes_reply_id_ip_hash_key UNIQUE(reply_id, ip_hash);
            RAISE NOTICE 'Fixed constraints for board_reply_votes';
        ELSE
            RAISE NOTICE 'Table board_reply_votes exists but ip_hash column missing, skipping constraint...';
        END IF;
    ELSE
        RAISE NOTICE 'Table board_reply_votes does not exist, skipping...';
    END IF;
END $$;

-- Clean up duplicate data only if tables and columns exist
-- Using DISTINCT ON approach which is more reliable for UUID types
DO $$ 
BEGIN
    -- Clean anonymous_post_likes duplicates (check columns exist)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'anonymous_post_likes') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'anonymous_post_likes' AND column_name = 'ip_hash') THEN
        -- Create temp table with unique records
        CREATE TEMP TABLE temp_anonymous_post_likes AS 
        SELECT DISTINCT ON (post_id, ip_hash) * 
        FROM anonymous_post_likes 
        ORDER BY post_id, ip_hash, created_at;
        
        -- Clear original table and insert unique records
        DELETE FROM anonymous_post_likes;
        INSERT INTO anonymous_post_likes SELECT * FROM temp_anonymous_post_likes;
        DROP TABLE temp_anonymous_post_likes;
        
        RAISE NOTICE 'Cleaned duplicates from anonymous_post_likes';
    ELSE
        RAISE NOTICE 'Skipping duplicate cleanup for anonymous_post_likes (table or columns missing)';
    END IF;

    -- Clean board_post_votes duplicates (check columns exist)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'board_post_votes') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_post_votes' AND column_name = 'ip_hash') THEN
        -- Create temp table with unique records
        CREATE TEMP TABLE temp_board_post_votes AS 
        SELECT DISTINCT ON (post_id, ip_hash) * 
        FROM board_post_votes 
        ORDER BY post_id, ip_hash, created_at;
        
        -- Clear original table and insert unique records
        DELETE FROM board_post_votes;
        INSERT INTO board_post_votes SELECT * FROM temp_board_post_votes;
        DROP TABLE temp_board_post_votes;
        
        RAISE NOTICE 'Cleaned duplicates from board_post_votes';
    ELSE
        RAISE NOTICE 'Skipping duplicate cleanup for board_post_votes (table or columns missing)';
    END IF;

    -- Clean board_reply_votes duplicates (check columns exist)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'board_reply_votes') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_reply_votes' AND column_name = 'ip_hash') THEN
        -- Create temp table with unique records
        CREATE TEMP TABLE temp_board_reply_votes AS 
        SELECT DISTINCT ON (reply_id, ip_hash) * 
        FROM board_reply_votes 
        ORDER BY reply_id, ip_hash, created_at;
        
        -- Clear original table and insert unique records
        DELETE FROM board_reply_votes;
        INSERT INTO board_reply_votes SELECT * FROM temp_board_reply_votes;
        DROP TABLE temp_board_reply_votes;
        
        RAISE NOTICE 'Cleaned duplicates from board_reply_votes';
    ELSE
        RAISE NOTICE 'Skipping duplicate cleanup for board_reply_votes (table or columns missing)';
    END IF;

    -- Clean board_categories duplicates (check name column exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'board_categories') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_categories' AND column_name = 'name') THEN
        
        -- Add slug column if it doesn't exist to avoid NOT NULL constraint errors
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_categories' AND column_name = 'slug') THEN
            ALTER TABLE board_categories ADD COLUMN slug TEXT;
        END IF;
        
        -- Update null slugs with generated values
        UPDATE board_categories SET slug = lower(replace(name, ' ', '-')) WHERE slug IS NULL;
        
        -- Create temp table with unique records
        CREATE TEMP TABLE temp_board_categories AS 
        SELECT DISTINCT ON (name) * 
        FROM board_categories 
        ORDER BY name, created_at;
        
        -- Clear original table and insert unique records
        DELETE FROM board_categories;
        INSERT INTO board_categories SELECT * FROM temp_board_categories;
        DROP TABLE temp_board_categories;
        
        RAISE NOTICE 'Cleaned duplicates from board_categories and fixed slug column';
    ELSE
        RAISE NOTICE 'Skipping duplicate cleanup for board_categories (table or columns missing)';
    END IF;
END $$;

-- Fix remaining table constraints only if they exist with proper columns
DO $$ 
BEGIN
    -- 4. Fix board_categories (check name column)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'board_categories') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_categories' AND column_name = 'name') THEN
        ALTER TABLE board_categories DROP CONSTRAINT IF EXISTS board_categories_name_key;
        ALTER TABLE board_categories ADD CONSTRAINT board_categories_name_key UNIQUE(name);
        RAISE NOTICE 'Fixed constraints for board_categories';
    ELSE
        RAISE NOTICE 'Skipping board_categories constraint (table or name column missing)';
    END IF;

    -- 5. Fix threads table (check required columns)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'threads') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'threads' AND column_name = 'board_id') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'threads' AND column_name = 'thread_number') THEN
        ALTER TABLE threads DROP CONSTRAINT IF EXISTS threads_board_id_thread_number_key;
        ALTER TABLE threads ADD CONSTRAINT threads_board_id_thread_number_key UNIQUE(board_id, thread_number);
        RAISE NOTICE 'Fixed constraints for threads';
    ELSE
        RAISE NOTICE 'Skipping threads constraint (table or required columns missing)';
    END IF;

    -- 6. Fix posts table (check required columns)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'thread_id') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'post_number') THEN
        ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_thread_id_post_number_key;
        ALTER TABLE posts ADD CONSTRAINT posts_thread_id_post_number_key UNIQUE(thread_id, post_number);
        RAISE NOTICE 'Fixed constraints for posts';
    ELSE
        RAISE NOTICE 'Skipping posts constraint (table or required columns missing)';
    END IF;

    -- 7. Fix reports table (check required columns)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reports') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'target_type') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'target_id') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'reporter_ip_hash') THEN
        ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_target_type_target_id_reporter_ip_hash_key;
        ALTER TABLE reports ADD CONSTRAINT reports_target_type_target_id_reporter_ip_hash_key UNIQUE(target_type, target_id, reporter_ip_hash);
        RAISE NOTICE 'Fixed constraints for reports';
    ELSE
        RAISE NOTICE 'Skipping reports constraint (table or required columns missing)';
    END IF;

    -- 8. Fix chat_active_users table (check required columns)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_active_users') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'chat_active_users' AND column_name = 'room_id') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'chat_active_users' AND column_name = 'user_id') THEN
        ALTER TABLE chat_active_users DROP CONSTRAINT IF EXISTS chat_active_users_room_id_user_id_key;
        ALTER TABLE chat_active_users ADD CONSTRAINT chat_active_users_room_id_user_id_key UNIQUE(room_id, user_id);
        RAISE NOTICE 'Fixed constraints for chat_active_users';
    ELSE
        RAISE NOTICE 'Skipping chat_active_users constraint (table or required columns missing)';
    END IF;

    -- 9. Fix monthly_mvp table (check month column)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'monthly_mvp') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'monthly_mvp' AND column_name = 'month') THEN
        ALTER TABLE monthly_mvp DROP CONSTRAINT IF EXISTS monthly_mvp_month_key;
        ALTER TABLE monthly_mvp ADD CONSTRAINT monthly_mvp_month_key UNIQUE(month);
        RAISE NOTICE 'Fixed constraints for monthly_mvp';
    ELSE
        RAISE NOTICE 'Skipping monthly_mvp constraint (table or month column missing)';
    END IF;

    -- 10. Fix user_profiles table (check user_id column)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
        ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_key;
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE(user_id);
        RAISE NOTICE 'Fixed constraints for user_profiles';
    ELSE
        RAISE NOTICE 'Skipping user_profiles constraint (table or user_id column missing)';
    END IF;

    -- 11. Fix ng_words table (check word column)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ng_words') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ng_words' AND column_name = 'word') THEN
        ALTER TABLE ng_words DROP CONSTRAINT IF EXISTS ng_words_word_key;
        ALTER TABLE ng_words ADD CONSTRAINT ng_words_word_key UNIQUE(word);
        RAISE NOTICE 'Fixed constraints for ng_words';
    ELSE
        RAISE NOTICE 'Skipping ng_words constraint (table or word column missing)';
    END IF;

    RAISE NOTICE 'All available table constraints have been checked and fixed where possible!';
END $$;

-- Now you can run the main migration script