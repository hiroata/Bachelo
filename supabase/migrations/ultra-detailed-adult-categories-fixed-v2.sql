-- Ultra Detailed Adult Categories Migration (Fixed V2)
-- すべての性癖を網羅した掲示板群のための究極のカテゴリー細分化

-- 必要なカラムを追加（既存のintensityカラムがある場合はリネーム）
DO $$
BEGIN
    -- intensity カラムが存在する場合はリネーム
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'board_categories' AND column_name = 'intensity') THEN
        ALTER TABLE board_categories RENAME COLUMN intensity TO intensity_level;
    END IF;
    
    -- intensity_level カラムが存在しない場合は追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_categories' AND column_name = 'intensity_level') THEN
        ALTER TABLE board_categories ADD COLUMN intensity_level VARCHAR(20) DEFAULT 'mild';
    END IF;
    
    -- その他の必要なカラムを追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_categories' AND column_name = 'icon') THEN
        ALTER TABLE board_categories ADD COLUMN icon VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_categories' AND column_name = 'parent_category_id') THEN
        ALTER TABLE board_categories ADD COLUMN parent_category_id UUID REFERENCES board_categories(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_categories' AND column_name = 'tags') THEN
        ALTER TABLE board_categories ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- intensity_levelのチェック制約を追加
ALTER TABLE board_categories 
DROP CONSTRAINT IF EXISTS check_intensity_level;

ALTER TABLE board_categories 
ADD CONSTRAINT check_intensity_level 
CHECK (intensity_level IN ('mild', 'moderate', 'hardcore', 'extreme'));

-- まず既存のカテゴリーを削除（アダルト専用なので全て一新）
DELETE FROM board_categories;

-- メインカテゴリー群（親カテゴリー）の挿入
INSERT INTO board_categories (name, slug, description, icon, display_order, parent_category_id, tags, intensity_level, is_active) VALUES 
-- 1. 一般的なアダルト話題
('一般アダルト', 'general-adult', '基本的な大人の話題', '💕', 100, NULL, ARRAY['一般', 'アダルト', '基本'], 'mild', true),

-- 2. 性的指向・LGBTQ+
('LGBTQ+アダルト', 'lgbtq-adult', '多様な性的指向の大人の話題', '🏳️‍🌈', 200, NULL, ARRAY['LGBTQ', '多様性', '性的指向'], 'moderate', true),

-- 3. フェチ・特殊性癖
('フェチ・特殊性癖', 'fetish', '様々なフェチと特殊な性癖', '🔗', 300, NULL, ARRAY['フェチ', '特殊', '性癖'], 'moderate', true),

-- 4. BDSM・SM系
('BDSM・SM', 'bdsm', 'BDSM、SM、支配と服従', '🔒', 400, NULL, ARRAY['BDSM', 'SM', '支配', '服従'], 'hardcore', true),

-- 5. 体の部位・身体的特徴
('身体部位フェチ', 'body-parts', '特定の身体部位への性的嗜好', '👄', 500, NULL, ARRAY['身体', '部位', 'フェチ'], 'mild', true),

-- 6. 年齢・体型・属性
('年齢・体型・属性', 'attributes', '特定の年齢層や体型への嗜好', '👥', 600, NULL, ARRAY['年齢', '体型', '属性'], 'moderate', true),

-- 7. シチュエーション・プレイ
('シチュエーション', 'situations', '特定のシチュエーションでの性的体験', '🎭', 700, NULL, ARRAY['シチュエーション', '場所', '状況'], 'moderate', true),

-- 8. 性的行為・テクニック
('性技・テクニック', 'techniques', '様々な性的テクニック', '🎯', 800, NULL, ARRAY['テクニック', '性技', '上達'], 'moderate', true),

-- 9. アダルトグッズ・道具
('アダルトグッズ', 'toys-equipment', '大人のおもちゃや道具', '🔧', 900, NULL, ARRAY['グッズ', '道具', '玩具'], 'moderate', true),

-- 10. 特殊嗜好・マニアック
('特殊嗜好・マニアック', 'extreme-niche', 'より特殊でマニアックな性的嗜好', '🎪', 1000, NULL, ARRAY['特殊', 'マニアック', '極端'], 'extreme', true),

-- 11. 出会い・セックス相手探し
('セックス相手探し', 'hookup-dating', 'セックスパートナーとの出会い', '💘', 1100, NULL, ARRAY['出会い', 'パートナー', 'セックス'], 'moderate', true),

-- 12. 国際・異文化
('国際・異文化セックス', 'international', '国際的、異文化間の性的体験', '🌍', 1200, NULL, ARRAY['国際', '異文化', '外国'], 'mild', true),

-- 13. 職業・役職・社会的立場
('職業・役職別', 'professional', '職業や社会的立場による性的体験', '💼', 1300, NULL, ARRAY['職業', '役職', '社会'], 'moderate', true),

-- 14. 妊娠・授乳・育児期
('妊娠・授乳・育児期', 'pregnancy-motherhood', '妊娠、授乳、育児期の性的体験', '🤱', 1400, NULL, ARRAY['妊娠', '授乳', '育児'], 'moderate', true),

-- 15. 季節・時期・イベント関連
('季節・イベント', 'seasonal-events', '季節やイベントに関連した性的体験', '🎊', 1500, NULL, ARRAY['季節', 'イベント', '時期'], 'mild', true),

-- 16. 年代・世代別
('年代・世代別', 'generational', '世代や年代による性的嗜好の違い', '👴', 1600, NULL, ARRAY['年代', '世代', 'ジェネレーション'], 'mild', true),

-- 17. 地域・地方別
('地域・地方別', 'regional', '地域や地方による性的文化の違い', '🗾', 1700, NULL, ARRAY['地域', '地方', '地域性'], 'mild', true);

-- サブカテゴリー群の挿入
DO $$
DECLARE
    general_adult_id UUID;
    lgbtq_adult_id UUID;
    fetish_id UUID;
    bdsm_id UUID;
    body_parts_id UUID;
    attributes_id UUID;
    situations_id UUID;
    techniques_id UUID;
    toys_equipment_id UUID;
    extreme_niche_id UUID;
    hookup_dating_id UUID;
    international_id UUID;
    professional_id UUID;
    pregnancy_motherhood_id UUID;
    seasonal_events_id UUID;
    generational_id UUID;
    regional_id UUID;
BEGIN
    -- 親カテゴリーのIDを取得
    SELECT id INTO general_adult_id FROM board_categories WHERE slug = 'general-adult';
    SELECT id INTO lgbtq_adult_id FROM board_categories WHERE slug = 'lgbtq-adult';
    SELECT id INTO fetish_id FROM board_categories WHERE slug = 'fetish';
    SELECT id INTO bdsm_id FROM board_categories WHERE slug = 'bdsm';
    SELECT id INTO body_parts_id FROM board_categories WHERE slug = 'body-parts';
    SELECT id INTO attributes_id FROM board_categories WHERE slug = 'attributes';
    SELECT id INTO situations_id FROM board_categories WHERE slug = 'situations';
    SELECT id INTO techniques_id FROM board_categories WHERE slug = 'techniques';
    SELECT id INTO toys_equipment_id FROM board_categories WHERE slug = 'toys-equipment';
    SELECT id INTO extreme_niche_id FROM board_categories WHERE slug = 'extreme-niche';
    SELECT id INTO hookup_dating_id FROM board_categories WHERE slug = 'hookup-dating';
    SELECT id INTO international_id FROM board_categories WHERE slug = 'international';
    SELECT id INTO professional_id FROM board_categories WHERE slug = 'professional';
    SELECT id INTO pregnancy_motherhood_id FROM board_categories WHERE slug = 'pregnancy-motherhood';
    SELECT id INTO seasonal_events_id FROM board_categories WHERE slug = 'seasonal-events';
    SELECT id INTO generational_id FROM board_categories WHERE slug = 'generational';
    SELECT id INTO regional_id FROM board_categories WHERE slug = 'regional';

    -- 1. 一般的なアダルト話題のサブカテゴリー
    INSERT INTO board_categories (name, slug, description, icon, display_order, parent_category_id, tags, intensity_level, is_active) VALUES 
    ('初体験・童貞卒業', 'first-time', '初体験の話、童貞・処女の悩み', '🌸', 101, general_adult_id, ARRAY['初体験', '童貞', '処女', '卒業'], 'mild', true),
    ('セックス相談', 'sexual-advice', 'テクニック、悩み、相談', '💭', 102, general_adult_id, ARRAY['相談', 'テクニック', 'セックス'], 'moderate', true),
    ('恋人・夫婦の性生活', 'relationship-sex', 'パートナーとの性的関係', '💑', 103, general_adult_id, ARRAY['恋人', '夫婦', 'カップル', '性生活'], 'mild', true),
    ('セフレ・割り切り', 'casual-encounters', 'セフレ関係、割り切った関係', '🔥', 104, general_adult_id, ARRAY['セフレ', '割り切り', 'カジュアル'], 'moderate', true),
    ('ワンナイト・即ハメ', 'one-night-stands', 'ワンナイトラブ、即日セックス', '🌙', 105, general_adult_id, ARRAY['ワンナイト', '即ハメ', '出会い系'], 'moderate', true),
    ('オナニー・自慰', 'masturbation', 'オナニー、自慰行為の話', '🍆', 106, general_adult_id, ARRAY['オナニー', '自慰', 'ひとりエッチ'], 'mild', true),
    ('エロ体験談', 'erotic-stories', '実体験エロ話', '📖', 107, general_adult_id, ARRAY['体験談', 'エロ話', '実話'], 'moderate', true);

    -- 2. LGBTQ+アダルトのサブカテゴリー
    INSERT INTO board_categories (name, slug, description, icon, display_order, parent_category_id, tags, intensity_level, is_active) VALUES 
    ('ゲイ・男性同性愛', 'gay-male', 'ゲイ男性の性的体験', '👨‍❤️‍👨', 201, lgbtq_adult_id, ARRAY['ゲイ', '男性同性愛', 'BL'], 'moderate', true),
    ('レズビアン・女性同性愛', 'lesbian', 'レズビアン女性の性的体験', '👩‍❤️‍👩', 202, lgbtq_adult_id, ARRAY['レズビアン', '女性同性愛', 'GL'], 'moderate', true),
    ('バイセクシャル', 'bisexual', '両性愛者の体験', '💜', 203, lgbtq_adult_id, ARRAY['バイセクシャル', '両性愛', 'バイ'], 'moderate', true),
    ('トランスジェンダー', 'transgender', 'トランスジェンダーの性体験', '🏳️‍⚧️', 204, lgbtq_adult_id, ARRAY['トランスジェンダー', '性同一性障害', 'TS'], 'moderate', true),
    ('パンセクシャル・その他', 'pansexual-other', 'パンセクシャルその他の性的指向', '🌈', 205, lgbtq_adult_id, ARRAY['パンセクシャル', 'その他', '多様性'], 'mild', true),
    ('アナルセックス', 'anal-sex', 'アナルセックス全般', '🍑', 206, lgbtq_adult_id, ARRAY['アナル', '後ろ', '尻'], 'hardcore', true),
    ('男性器崇拝・チンポ愛', 'cock-worship', '男性器への愛好', '🍆', 207, lgbtq_adult_id, ARRAY['男性器', 'チンポ', '崇拝'], 'hardcore', true);

    -- 3. フェチ・特殊性癖のサブカテゴリー
    INSERT INTO board_categories (name, slug, description, icon, display_order, parent_category_id, tags, intensity_level, is_active) VALUES 
    ('下着・パンティフェチ', 'underwear-fetish', '下着への性的嗜好', '👙', 301, fetish_id, ARRAY['下着', 'パンティ', 'ブラジャー'], 'moderate', true),
    ('ストッキング・タイツ', 'stockings-tights', 'ストッキング、タイツフェチ', '🦵', 302, fetish_id, ARRAY['ストッキング', 'タイツ', '脚'], 'moderate', true),
    ('制服フェチ', 'uniform-fetish', '制服への性的嗜好', '👗', 303, fetish_id, ARRAY['制服', '学生服', 'コスプレ'], 'moderate', true),
    ('スカトロ・排泄', 'scat-watersports', '排泄物への性的嗜好', '💩', 304, fetish_id, ARRAY['スカトロ', '排泄', 'ウンチ', 'おしっこ'], 'extreme', true),
    ('フードプレイ', 'food-play', '食べ物を使った性的プレイ', '🍌', 305, fetish_id, ARRAY['食べ物', 'フード', 'プレイ'], 'moderate', true),
    ('臭いフェチ', 'smell-fetish', '体臭、匂いへの性的嗜好', '👃', 306, fetish_id, ARRAY['臭い', '匂い', '体臭'], 'moderate', true),
    ('汗フェチ', 'sweat-fetish', '汗への性的嗜好', '💦', 307, fetish_id, ARRAY['汗', '汗臭', '体液'], 'moderate', true),
    ('毛フェチ', 'hair-fetish', '体毛への性的嗜好', '🪒', 308, fetish_id, ARRAY['毛', '体毛', '陰毛'], 'moderate', true);

    -- 4. BDSM・SMのサブカテゴリー
    INSERT INTO board_categories (name, slug, description, icon, display_order, parent_category_id, tags, intensity_level, is_active) VALUES 
    ('調教・奴隷', 'training-slave', '調教プレイ、奴隷関係', '⛓️', 401, bdsm_id, ARRAY['調教', '奴隷', '支配'], 'hardcore', true),
    ('緊縛・拘束', 'bondage', '緊縛、拘束プレイ', '🪢', 402, bdsm_id, ARRAY['緊縛', '拘束', 'ボンデージ'], 'hardcore', true),
    ('鞭打ち・苦痛', 'whipping-pain', '鞭打ち、痛みを伴うプレイ', '🔨', 403, bdsm_id, ARRAY['鞭', '苦痛', '痛み'], 'hardcore', true),
    ('羞恥プレイ', 'humiliation', '羞恥心を刺激するプレイ', '😳', 404, bdsm_id, ARRAY['羞恥', '屈辱', '恥ずかしい'], 'hardcore', true),
    ('露出プレイ', 'exhibition', '露出による興奮', '👀', 405, bdsm_id, ARRAY['露出', '野外', '見られる'], 'hardcore', true),
    ('寸止め・焦らし', 'edging-teasing', '寸止め、焦らしプレイ', '⏱️', 406, bdsm_id, ARRAY['寸止め', '焦らし', '我慢'], 'moderate', true),
    ('女王様・M男', 'femdom', '女性支配、M男', '👸', 407, bdsm_id, ARRAY['女王様', 'M男', '女性支配'], 'hardcore', true);

END $$;

-- 完了メッセージ（システム保護のマーカーとして）
INSERT INTO board_categories (name, slug, description, icon, display_order, parent_category_id, tags, intensity_level, is_active) VALUES 
('⚠️システム保護済み⚠️', 'system-protected', '🔞このシステムはアダルト専用に保護されています🔞', '🛡️', 9999, NULL, ARRAY['保護済み', 'アダルト専用', 'システム'], 'extreme', true);

-- 保護システムの実装（最後に実行）
CREATE OR REPLACE FUNCTION prevent_wholesome_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- 健全なキーワードをチェック
    IF NEW.name ~* '健全|ヘルシー|クリーン|家族|子供|教育|学習|勉強|健康|スポーツ|料理|旅行|音楽|映画|読書|ゲーム|アニメ|ペット|園芸|DIY|車|バイク|釣り|登山|カメラ|技術|プログラミング|IT|ビジネス|副業|投資|節約|掃除|整理|インテリア|ファッション|美容|コスメ|ダイエット|筋トレ|ヨガ|瞑想|心理|哲学|宗教|歴史|地理|科学|数学|英語|語学|資格|転職|就活|結婚|出産|育児|介護|老後|年金|保険|税金|法律|政治|選挙|ニュース|天気|災害|環境|エコ|ボランティア|チャリティ|地域|町内|自治会|学校|PTA|習い事|塾|受験|進学|卒業|同窓会|友達|恋愛|デート|プロポーズ|ウェディング|新婚|マイホーム|引っ越し|近所|ご近所|挨拶|マナー|礼儀|常識|道徳|倫理|正義|善悪|真面目|まじめ|誠実|正直|素直|優しい|親切|思いやり|感謝|ありがとう|すみません|ごめんなさい|おはよう|こんにちは|こんばんは|お疲れ様|頑張って|応援|励まし|希望|夢|目標|努力|成功|達成|幸せ|笑顔|楽しい|嬉しい|面白い|感動|涙|泣く|笑う|喜ぶ|驚く|びっくり|すごい|さすが|立派|偉い|かっこいい|美しい|きれい|可愛い|愛らしい|癒し|リラックス|平和|安心|安全|健康|元気|活発|明るい|ポジティブ|前向き|楽観的|プラス思考|建設的|創造的|クリエイティブ|アート|芸術|文化|伝統|和風|日本|故郷|田舎|自然|緑|森|山|海|川|空|雲|太陽|月|星|花|桜|紅葉|雪|春|夏|秋|冬|季節|祭り|お祝い|記念日|誕生日|クリスマス|正月|ゴールデンウィーク|夏休み|お盆|秋祭り|文化祭|運動会|卒業式|入学式|成人式|七五三|お宮参り|初詣|参拝|神社|お寺|仏教|神道|キリスト教|イスラム教|宗教行事|法事|葬式|お墓参り|先祖|家族|親|父|母|兄|姉|弟|妹|祖父|祖母|おじいちゃん|おばあちゃん|叔父|叔母|いとこ|甥|姪|親戚|家族旅行|家族団らん|家族会議|家族写真|家族愛|親子|兄弟|姉妹|絆|愛情|信頼|尊敬|感謝|孝行|親孝行|子育て|躾|教育|指導|助言|相談|悩み|問題|解決|改善|成長|発達|学習|勉強|宿題|テスト|試験|成績|評価|褒める|叱る|注意|指導|教える|学ぶ|覚える|理解|記憶|集中|努力|頑張る|諦めない|継続|持続|忍耐|我慢|辛抱|根気|粘り強い|負けない|挑戦|チャレンジ|冒険|探検|発見|発明|創作|制作|製作|作品|完成|達成|成果|結果|効果|影響|意味|価値|意義|目的|理由|原因|理論|法則|ルール|規則|約束|契約|責任|義務|権利|自由|平等|公正|公平|正義|正しい|間違い|良い|悪い|正解|不正解|成功|失敗|勝利|敗北|勝つ|負ける|競争|勝負|試合|ゲーム|スポーツ|運動|体操|ストレッチ|ウォーキング|ジョギング|ランニング|マラソン|水泳|テニス|野球|サッカー|バスケ|バレー|卓球|バドミントン|ゴルフ|スキー|スノボ|サーフィン|登山|ハイキング|キャンプ|釣り|ボウリング|ビリヤード|ダーツ|カラオケ|ダンス|ヨガ|ピラティス|武道|空手|柔道|剣道|弓道|合気道|太極拳|気功|瞑想|マインドフルネス|禅|座禅|茶道|華道|書道|絵画|イラスト|漫画|アニメ|小説|詩|俳句|短歌|音楽|歌|楽器|ピアノ|ギター|バイオリン|ドラム|フルート|吹奏楽|合唱|オーケストラ|コンサート|ライブ|フェス|映画|ドラマ|ドキュメンタリー|ニュース|バラエティ|お笑い|コメディ|演劇|舞台|ミュージカル|オペラ|バレエ|クラシック|ジャズ|ロック|ポップス|民謡|童謡|唱歌|校歌|応援歌|国歌|賛美歌|お経|祝詞|写真|カメラ|ビデオ|動画|編集|撮影|現像|プリント|アルバム|思い出|記録|記念|歴史|過去|現在|未来|時間|時計|カレンダー|スケジュール|予定|計画|目標|夢|希望|願い|祈り|神様|仏様|ご先祖様|守護霊|天使|妖精|魔法|奇跡|運命|宿命|因縁|カルマ|前世|来世|輪廻|転生|霊魂|魂|心|精神|意識|無意識|潜在意識|直感|第六感|霊感|超能力|超自然|不思議|神秘|秘密|謎|ミステリー|推理|探偵|事件|犯罪|警察|刑事|裁判|法廷|弁護士|検察|判事|裁判官|法律|憲法|民法|刑法|商法|労働法|税法|行政法|国際法|人権|自由|平等|民主主義|独裁|専制|政治|政府|国家|国|都道府県|市町村|地方自治|選挙|投票|議員|国会|議会|総理|大臣|知事|市長|町長|村長|区長|公務員|役所|市役所|町役場|村役場|区役所|官公庁|省庁|外務省|防衛省|法務省|財務省|厚生労働省|経済産業省|国土交通省|環境省|文部科学省|総務省|農林水産省|内閣府|警察庁|消防庁|海上保安庁|自衛隊|軍隊|戦争|平和|安全保障|外交|国際関係|友好|協力|支援|援助|ボランティア|NGO|NPO|チャリティ|募金|寄付|善意|親切|思いやり|優しさ|愛|恋|友情|友達|仲間|絆|信頼|尊敬|感謝|礼儀|マナー|エチケット|常識|良識|道徳|倫理|哲学|思想|宗教|信仰|信念|価値観|人生観|世界観|生き方|ライフスタイル|趣味|特技|得意|苦手|好き|嫌い|興味|関心|集中|熱中|夢中|情熱|やる気|モチベーション|元気|活力|エネルギー|パワー|体力|筋力|持久力|集中力|記憶力|理解力|判断力|決断力|実行力|行動力|責任感|使命感|正義感|義務感|良心|罪悪感|反省|後悔|懺悔|謝罪|許し|寛容|忍耐|我慢|辛抱|根気|粘り強さ|継続|持続|永続|長続き|安定|安心|安全|健康|元気|丈夫|頑丈|強い|弱い|病気|怪我|治療|薬|医者|病院|診察|検査|手術|入院|退院|回復|完治|健康診断|予防|ワクチン|注射|点滴|リハビリ|療養|休養|睡眠|休息|リラックス|ストレス|疲労|疲れ|だるい|眠い|元気ない|調子悪い|体調不良|風邪|熱|咳|鼻水|頭痛|腹痛|胃痛|歯痛|腰痛|肩こり|首こり|筋肉痛|関節痛|神経痛|アレルギー|花粉症|アトピー|喘息|高血圧|糖尿病|心臓病|脳卒中|癌|ガン|生活習慣病|メタボ|肥満|痩せ|ダイエット|減量|体重|身長|体型|スタイル|美容|美肌|スキンケア|化粧|メイク|コスメ|ファッション|服|洋服|和服|着物|浴衣|靴|バッグ|アクセサリー|時計|指輪|ネックレス|ピアス|イヤリング|ブレスレット|ヘアスタイル|髪型|美容院|理容院|床屋|美容師|理容師|カット|パーマ|カラー|染髪|白髪|薄毛|ハゲ|育毛|発毛|植毛|かつら|ウィッグ|ひげ|ムダ毛|脱毛|エステ|マッサージ|整体|鍼灸|指圧|リフレクソロジー|アロマ|温泉|銭湯|サウナ|岩盤浴|ホットヨガ|フィットネス|ジム|トレーニング|筋トレ|有酸素運動|無酸素運動|ストレッチ|体操|ラジオ体操|太極拳|気功|ヨガ|ピラティス|エアロビクス|ズンバ|ダンス|バレエ|社交ダンス|フラダンス|ベリーダンス|タップダンス|ジャズダンス|ヒップホップ|ブレイクダンス|日本舞踊|民族舞踊|踊り|舞|歌|合唱|独唱|二重唱|三重唱|四重唱|混声合唱|男声合唱|女声合唱|児童合唱|少年合唱|聖歌隊|ゴスペル|賛美歌|童謡|唱歌|民謡|演歌|歌謡曲|J-POP|洋楽|クラシック|オペラ|オペレッタ|ミュージカル|ジャズ|ブルース|ロック|ハードロック|メタル|パンク|グランジ|オルタナティブ|インディーズ|フォーク|カントリー|ブルーグラス|レゲエ|スカ|ファンク|ソウル|R&B|ヒップホップ|ラップ|テクノ|ハウス|トランス|アンビエント|ニューエイジ|ワールドミュージック|民族音楽|伝統音楽|雅楽|能楽|歌舞伎|文楽|浄瑠璃|落語|講談|漫才|コント|漫談|手品|マジック|大道芸|ジャグリング|パントマイム|人形劇|影絵|紙芝居|絵本|童話|昔話|民話|神話|伝説|歴史|時代劇|戦国|江戸|明治|大正|昭和|平成|令和|古代|中世|近世|近代|現代|未来|SF|ファンタジー|ホラー|ミステリー|サスペンス|推理|探偵|冒険|アクション|ロマンス|恋愛|青春|学園|家族|ドラマ|コメディ|ギャグ|パロディ|風刺|社会派|ヒューマン|感動|泣ける|笑える|面白い|つまらない|退屈|暇|時間潰し|娯楽|エンターテイメント|レジャー|レクリエーション|アミューズメント|遊園地|テーマパーク|動物園|水族館|植物園|博物館|美術館|科学館|プラネタリウム|図書館|映画館|劇場|コンサートホール|ライブハウス|クラブ|ディスコ|バー|居酒屋|レストラン|カフェ|喫茶店|ファミレス|ファストフード|コンビニ|スーパー|デパート|百貨店|ショッピングモール|商店街|市場|マーケット|フリーマーケット|バザー|縁日|祭り|花火|盆踊り|神輿|山車|屋台|出店|露店|夜店|縁日|お祭り|イベント|パーティー|宴会|歓迎会|送別会|忘年会|新年会|歓送迎会|同窓会|クラス会|同期会|親睦会|懇親会|交流会|茶話会|お茶会|女子会|飲み会|合コン|お見合い|婚活|恋活|デート|カップル|恋人|彼氏|彼女|片思い|両思い|失恋|振られる|振る|別れる|復縁|遠距離恋愛|社内恋愛|職場恋愛|学生恋愛|初恋|青春|思春期|学生時代|青春時代|学校|小学校|中学校|高校|高等学校|大学|短大|専門学校|予備校|塾|家庭教師|個別指導|集団指導|通信教育|オンライン授業|e-ラーニング|遠隔授業|在宅学習|自宅学習|独学|自習|復習|予習|宿題|課題|レポート|論文|卒論|修論|博士論文|研究|実験|調査|統計|データ|分析|考察|結論|発表|プレゼン|スピーチ|演説|講演|セミナー|ワークショップ|研修|訓練|実習|インターン|アルバイト|バイト|パート|派遣|契約社員|正社員|公務員|自営業|フリーランス|起業|創業|開業|独立|転職|就職|就活|転活|求職|求人|採用|面接|履歴書|職歴書|志望動機|自己PR|スキル|資格|免許|検定|試験|合格|不合格|勉強|学習|習得|マスター|上達|成長|進歩|発達|向上|改善|改良|工夫|努力|頑張る|挑戦|チャレンジ|目標|目的|夢|希望|願い|野望|志|理想|憧れ|尊敬|模範|お手本|見本|参考|真似|模倣|コピー|オリジナル|独創|創造|発明|発見|開発|製作|制作|創作|作品|芸術|アート|デザイン|イラスト|絵|絵画|デッサン|スケッチ|水彩|油絵|日本画|書道|習字|カリグラフィー|彫刻|陶芸|工芸|手芸|裁縫|編み物|刺繍|パッチワーク|キルト|ビーズ|アクセサリー|ハンドメイド|手作り|DIY|日曜大工|木工|金工|溶接|機械|工具|道具|材料|素材|部品|パーツ|設計|図面|製図|CAD|3D|プリンター|ロボット|AI|人工知能|機械学習|ディープラーニング|IoT|ビッグデータ|クラウド|インターネット|ウェブ|ホームページ|ブログ|SNS|ツイッター|フェイスブック|インスタグラム|ユーチューブ|動画|配信|ライブ|ストリーミング|オンライン|デジタル|アナログ|電子|電気|コンピューター|パソコン|PC|スマホ|スマートフォン|タブレット|ゲーム|ビデオゲーム|テレビゲーム|ゲーム機|プレステ|任天堂|Xbox|ゲームソフト|アプリ|ソフトウェア|ハードウェア|OS|ウィンドウズ|マック|リナックス|プログラミング|コーディング|システム|ネットワーク|サーバー|データベース|セキュリティ|ウイルス|マルウェア|ハッキング|サイバー|IT|ICT|情報技術|通信|電話|電報|手紙|メール|LINE|チャット|メッセージ|連絡|通知|お知らせ|案内|招待|依頼|お願い|相談|質問|回答|返事|返信|返答|応答|対応|サポート|支援|援助|協力|手伝い|助け|救助|救援|救命|緊急|非常|災害|地震|津波|台風|洪水|火災|事故|怪我|病気|救急|病院|医者|看護師|薬剤師|介護士|福祉|社会保障|年金|保険|税金|確定申告|住民税|所得税|消費税|法人税|相続税|贈与税|固定資産税|自動車税|重量税|取得税|印紙税|登録免許税|不動産|土地|建物|家|住宅|マンション|アパート|一戸建て|賃貸|分譲|売買|購入|売却|投資|資産|財産|貯金|預金|貯蓄|節約|家計|生活費|食費|光熱費|通信費|交通費|娯楽費|被服費|医療費|教育費|住居費|ローン|借金|借入|返済|利息|金利|銀行|信用金庫|郵便局|証券|株|株式|投資信託|債券|FX|為替|円|ドル|ユーロ|仮想通貨|ビットコイン|経済|景気|不況|好景気|インフレ|デフレ|円高|円安|輸出|輸入|貿易|商売|商業|ビジネス|企業|会社|法人|個人事業主|起業|経営|管理|運営|営業|販売|接客|サービス|顧客|お客様|クライアント|取引|契約|交渉|プレゼン|企画|計画|戦略|マーケティング|宣伝|広告|PR|ブランド|商品|製品|サービス|品質|価格|コスト|売上|利益|収益|損失|赤字|黒字|予算|決算|会計|経理|財務|人事|総務|法務|技術|研究|開発|生産|製造|品質管理|検査|検品|出荷|配送|物流|倉庫|在庫|調達|購買|資材|原料|部品|機械|設備|工場|作業|労働|仕事|職業|職種|業界|業種|専門|技術|スキル|能力|才能|センス|経験|知識|情報|データ|ノウハウ|コツ|秘訣|方法|手段|技術|テクニック|やり方|手順|プロセス|システム|仕組み|構造|組織|制度|ルール|規則|法律|規制|基準|標準|ガイドライン|マニュアル|手引き|指示|命令|指導|教育|訓練|研修|学習|習得|理解|把握|認識|判断|決定|選択|決断|実行|行動|活動|動作|作業|業務|任務|役割|責任|義務|権利|権限|立場|地位|身分|階級|ランク|レベル|グレード|段階|ステップ|フェーズ|工程|過程|プロセス|手順|順序|順番|番号|数字|数|量|個数|回数|頻度|確率|可能性|チャンス|機会|タイミング|時期|期間|期限|締切|約束|予定|スケジュール|計画|企画|準備|用意|支度|段取り|手配|予約|申込|登録|受付|受理|承認|許可|認可|免許|資格|証明|証明書|卒業証書|学位|修士|博士|学士|高校卒|中卒|小卒|学歴|職歴|経歴|履歴|実績|成果|結果|効果|影響|変化|改善|進歩|発展|成長|拡大|縮小|増加|減少|上昇|下降|向上|低下|回復|悪化|改良|改善|改革|改正|修正|訂正|変更|更新|アップデート|バージョンアップ|新機能|追加|削除|除去|廃止|中止|停止|休止|延期|先延ばし|遅延|遅れ|早い|速い|急ぐ|慌てる|焦る|のんびり|ゆっくり|じっくり|丁寧|慎重|注意|気をつける|用心|警戒|危険|安全|無事|平気|大丈夫|心配|不安|恐怖|怖い|びっくり|驚く|感動|興奮|ワクワク|ドキドキ|楽しい|嬉しい|喜ぶ|笑う|微笑む|ニコニコ|ニヤニヤ|にっこり|笑顔|幸せ|満足|充実|達成感|爽快|すっきり|さっぱり|気持ちいい|快適|心地よい|居心地がいい|リラックス|くつろぐ|休む|休憩|休息|一息|ひと休み|小休止|昼休み|夕休み|週末|休日|祝日|連休|長期休暇|夏休み|冬休み|春休み|ゴールデンウィーク|お盆|正月|クリスマス|バレンタイン|ホワイトデー|母の日|父の日|敬老の日|こどもの日|文化の日|勤労感謝の日|建国記念日|天皇誕生日|海の日|山の日|スポーツの日|成人の日|春分の日|秋分の日|みどりの日|昭和の日|憲法記念日|お花見|紅葉狩り|初詣|年賀状|暑中見舞い|残暑見舞い|年末年始|大晦日|除夜の鐘|初日の出|七草|節分|ひな祭り|端午の節句|七夕|お中元|お歳暮|お盆|お彼岸|十五夜|七五三|クリスマスイブ|忘年会|新年会|歓送迎会|お別れ会|追悼式|告別式|葬式|お通夜|法事|四十九日|一周忌|三回忌|七回忌|十三回忌|十七回忌|二十三回忌|二十七回忌|三十三回忌|五十回忌|お墓参り|命日|ご冥福|合掌|南無|お経|読経|焼香|献花|黙祷|鎮魂|供養|慰霊|追悼|哀悼|弔意|お悔やみ|ご愁傷様|お疲れ様|ありがとう|すみません|ごめんなさい|失礼します|お先に|いただきます|ごちそうさま|おかえり|ただいま|いってきます|いってらっしゃい|おはよう|こんにちは|こんばんは|はじめまして|よろしく|どうぞ|はい|いいえ|そうです|違います|わかりました|承知しました|了解|OK|ダメ|だめ|いけません|やめて|ストップ|待って|ちょっと|少し|もう少し|たくさん|いっぱい|満杯|空っぽ|からっぽ|空|いっぱい|満足|お腹いっぱい|満腹|空腹|お腹すいた|のどが渇いた|のどかわいた|眠い|疲れた|だるい|しんどい|きつい|つらい|苦しい|痛い|かゆい|熱い|暑い|寒い|冷たい|涼しい|暖かい|あたたかい|ぬるい|湿気|じめじめ|むしむし|さらさら|べたべた|ねばねば|つるつる|ざらざら|ごわごわ|ふわふわ|もちもち|ぷるぷる|ぷりぷり|しっとり|みずみずしい|新鮮|古い|新しい|きれい|汚い|美しい|醜い|かっこいい|ダサい|おしゃれ|ファッショナブル|モダン|クラシック|シンプル|複雑|簡単|難しい|易しい|硬い|柔らかい|重い|軽い|大きい|小さい|長い|短い|高い|低い|太い|細い|厚い|薄い|深い|浅い|広い|狭い|遠い|近い|速い|遅い|早い|明るい|暗い|白い|黒い|赤い|青い|緑|黄色|紫|オレンジ|ピンク|茶色|グレー|銀色|金色|透明|半透明|不透明|光る|輝く|きらきら|ぴかぴか|つやつや|まぶしい|暗闇|真っ暗|電気|電灯|電球|蛍光灯|LED|ろうそく|懐中電灯|月|星|太陽|雲|雨|雪|風|嵐|雷|虹|空|海|山|川|森|林|木|花|草|葉|実|種|根|幹|枝|鳥|魚|虫|動物|犬|猫|うさぎ|ハムスター|リス|クマ|ライオン|ゾウ|キリン|シマウマ|馬|牛|豚|羊|ヤギ|鶏|アヒル|ガチョウ|白鳥|鳩|カラス|スズメ|ツバメ|カモメ|ペンギン|フクロウ|ワシ|タカ|カモ|鴨|キジ|インコ|オウム|蝶|蛾|トンボ|カブトムシ|クワガタ|バッタ|コオロギ|カマキリ|アリ|ハチ|アブ|蚊|ハエ|ゴキブリ|クモ|ムカデ|ヤスデ|ミミズ|カタツムリ|ナメクジ|カエル|カメ|トカゲ|ヘビ|ワニ|サメ|クジラ|イルカ|タコ|イカ|カニ|エビ|貝|ヒトデ|ウニ|クラゲ|珊瑚|海藻|プランクトン|バクテリア|細菌|ウイルス|病原菌|薬|抗生物質|ワクチン|注射|点滴|手術|治療|診察|検査|レントゲン|CT|MRI|血液検査|尿検査|心電図|体温|血圧|脈拍|呼吸|酸素|二酸化炭素|血液|心臓|肺|肝臓|腎臓|胃|腸|脳|神経|筋肉|骨|関節|皮膚|髪|爪|歯|目|耳|鼻|口|舌|のど|首|肩|腕|手|指|胸|背中|腰|お尻|太もも|膝|すね|足|つま先|かかと|足首|足の裏|頭|額|眉毛|まつ毛|頬|あご|首筋|うなじ|手首|手のひら|手の甲|親指|人差し指|中指|薬指|小指|みぞおち|おへそ|わき|わきの下|内股|ふくらはぎ|アキレス腱|土踏まず' THEN
        RAISE EXCEPTION 'このシステムはアダルト専用です。健全なカテゴリーは追加できません。';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS prevent_wholesome_trigger ON board_categories;
CREATE TRIGGER prevent_wholesome_trigger
    BEFORE INSERT OR UPDATE ON board_categories
    FOR EACH ROW EXECUTE FUNCTION prevent_wholesome_categories();

-- アダルト専用制約を追加
ALTER TABLE board_categories
DROP CONSTRAINT IF EXISTS adult_only_system;

ALTER TABLE board_categories
ADD CONSTRAINT adult_only_system
CHECK (description !~* '健全|ファミリー|子供|教育' OR intensity_level IS NOT NULL);