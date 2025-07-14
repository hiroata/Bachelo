-- まず実際のpost_idを取得して使用
DO $$
DECLARE
    post1_id UUID;
    post2_id UUID;
BEGIN
    -- 「今の若者は～」の投稿のIDを取得
    SELECT id INTO post1_id FROM board_posts 
    WHERE title LIKE '%今の若者は%' 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- 「病院の待ち時間長すぎ」の投稿のIDを取得
    SELECT id INTO post2_id FROM board_posts 
    WHERE title LIKE '%病院の待ち時間%' 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- 最初の投稿への追加返信（レス番号4-30）
    IF post1_id IS NOT NULL THEN
        INSERT INTO board_replies (post_id, author_name, author_email, content, created_at) VALUES
        (post1_id, '匿名', 'sage', '>>2
それな！俺も全く同じこと思ってた
最近の子は恵まれすぎてるよな', NOW() - INTERVAL '8 hours'),
        (post1_id, '匿名', '', '>>3
いやいや、今の若者だって苦労してるよ
給料は上がらないし物価は上がるし', NOW() - INTERVAL '7 hours 30 minutes'),
        (post1_id, '匿名', 'sage', 'ゆとり世代の俺から見ても今の若い子たちは優秀だと思う
デジタルネイティブで何でもこなせるし', NOW() - INTERVAL '7 hours'),
        (post1_id, '匿名', '', '>>5
給料上がらないのはマジできつい
実家暮らしじゃないと貯金できない', NOW() - INTERVAL '6 hours 30 minutes'),
        (post1_id, '匿名', 'sage', '世代論とか不毛すぎるｗｗｗ
どの世代にも優秀な人もダメな人もいるだろ', NOW() - INTERVAL '6 hours'),
        (post1_id, '匿名', '', '>>8
それを言っちゃおしまいよｗ', NOW() - INTERVAL '5 hours 45 minutes'),
        (post1_id, '匿名', 'sage', '昔は良かったおじさん沸いてて草', NOW() - INTERVAL '5 hours 30 minutes'),
        (post1_id, '匿名', '', '>>7
実家暮らしで何が悪いんだよ
合理的だろ', NOW() - INTERVAL '5 hours'),
        (post1_id, '匿名', 'sage', '>>4
同意。俺たちの頃の方が楽だったと思う
ネットもSNSもなくて気楽だった', NOW() - INTERVAL '4 hours 45 minutes'),
        (post1_id, '匿名', '', 'どの世代も「今の若い奴は」って言われ続けてきたんだよな
古代エジプトの壁画にも書いてあるらしいぞｗ', NOW() - INTERVAL '4 hours 30 minutes'),
        (post1_id, '匿名', 'sage', '>>13
マジかよｗｗｗ
人類の永遠のテーマかｗ', NOW() - INTERVAL '4 hours 15 minutes'),
        (post1_id, '匿名', '', '結局みんな自分の世代が一番苦労してると思いたいんだよ', NOW() - INTERVAL '4 hours'),
        (post1_id, '匿名', 'sage', '>>11
実家暮らし批判するやつは大体嫉妬だよな
俺も実家だけど貯金できて最高', NOW() - INTERVAL '3 hours 45 minutes'),
        (post1_id, '匿名', '', 'てか今の若者って言っても幅広すぎない？
20代前半と後半でも全然違うし', NOW() - INTERVAL '3 hours 30 minutes'),
        (post1_id, '匿名', 'sage', '>>17
確かに
Z世代って言葉も雑すぎる', NOW() - INTERVAL '3 hours 15 minutes'),
        (post1_id, '匿名', '', '>>16
羨ましいわ
俺は親と仲悪くて実家出たけど生活カツカツ', NOW() - INTERVAL '3 hours'),
        (post1_id, '匿名', 'sage', 'こういうスレ見てると日本の未来が心配になるわ
世代間で争ってる場合じゃないだろ', NOW() - INTERVAL '2 hours 45 minutes'),
        (post1_id, '匿名', '', '>>20
ほんそれ
もっと建設的な話しようぜ', NOW() - INTERVAL '2 hours 30 minutes'),
        (post1_id, '匿名', 'sage', '>>12
SNS疲れはガチである
常に誰かと比較されてる感じがしてしんどい', NOW() - INTERVAL '2 hours 15 minutes'),
        (post1_id, '匿名', '', '>>22
インスタとか見なきゃいいじゃん
俺は全部やめたら楽になったぞ', NOW() - INTERVAL '2 hours'),
        (post1_id, '匿名', 'sage', 'ぶっちゃけどの世代も大変だよ
比較しても意味ない', NOW() - INTERVAL '1 hour 45 minutes'),
        (post1_id, '匿名', '', '>>23
仕事の関係で使わざるを得ないんだよなぁ...', NOW() - INTERVAL '1 hour 30 minutes'),
        (post1_id, '匿名', 'sage', '>>19
親と仲悪いのきついよな
実家暮らしできる人は親に感謝した方がいい', NOW() - INTERVAL '1 hour 15 minutes'),
        (post1_id, '匿名', '', 'このスレ見てたら自分がどれだけ恵まれてるか実感したわ
みんな頑張ろうぜ', NOW() - INTERVAL '1 hour'),
        (post1_id, '匿名', 'sage', '>>27
いいこと言うじゃん
結局は自分次第だよな', NOW() - INTERVAL '45 minutes'),
        (post1_id, '匿名', '', '>>15
これな
みんな被害者意識強すぎｗ', NOW() - INTERVAL '30 minutes'),
        (post1_id, '匿名', 'sage', 'まとめ：どの世代も大変。以上！', NOW() - INTERVAL '15 minutes');
    END IF;
    
    -- 2番目の投稿への追加返信
    IF post2_id IS NOT NULL THEN
        INSERT INTO board_replies (post_id, author_name, author_email, content, created_at) VALUES
        (post2_id, '匿名', 'sage', '>>1
激しく同意
こないだ病院行ったら2時間待たされた', NOW() - INTERVAL '5 hours'),
        (post2_id, '匿名', '', '>>4
予約制じゃないの？
うちの近所は全部予約制になったけど', NOW() - INTERVAL '4 hours 30 minutes'),
        (post2_id, '匿名', 'sage', '>>5
大学病院とかは予約してても待たされるよ
システムがおかしい', NOW() - INTERVAL '4 hours'),
        (post2_id, '匿名', '', 'オンライン診療増えてきたけどまだまだだよな
もっと普及してほしい', NOW() - INTERVAL '3 hours 30 minutes'),
        (post2_id, '匿名', 'sage', '>>7
オンライン診療は便利だけど
触診できないから限界あるよね', NOW() - INTERVAL '3 hours'),
        (post2_id, '匿名', '', '病院の待ち時間で本1冊読めるｗ
ポジティブに考えようｗ', NOW() - INTERVAL '2 hours 30 minutes'),
        (post2_id, '匿名', 'sage', '待合室のイスが硬くて腰痛くなるんだよなー
もっと座り心地いいイスにしてほしい', NOW() - INTERVAL '2 hours'),
        (post2_id, '匿名', '', '>>10
わかるｗ
長時間座ってるとお尻も痛くなる', NOW() - INTERVAL '1 hour 45 minutes'),
        (post2_id, '匿名', 'sage', '予約時間の意味ないよな
10時予約で12時に呼ばれるとか普通', NOW() - INTERVAL '1 hour 30 minutes'),
        (post2_id, '匿名', '', '>>12
それで午後の予定狂うんだよね
半日つぶれる', NOW() - INTERVAL '1 hour 15 minutes');
    END IF;
END $$;