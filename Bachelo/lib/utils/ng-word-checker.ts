import { createClient } from '@/lib/supabase/server'

export type NgWordSeverity = 'low' | 'medium' | 'high' | 'critical'
export type NgWordCategory = 'illegal' | 'child_safety' | 'personal_info' | 'harassment' | 'spam' | 'general'

export interface NgWordCheckResult {
  isClean: boolean
  detectedWords: Array<{
    word: string
    category: NgWordCategory
    severity: NgWordSeverity
  }>
  highestSeverity: NgWordSeverity | null
  shouldBlock: boolean
  shouldAutoRemove: boolean
}

/**
 * NGワードをチェックする
 */
export async function checkNgWords(content: string, severityThreshold: NgWordSeverity = 'low'): Promise<NgWordCheckResult> {
  try {
    const supabase = createClient()
    
    // Supabaseの関数を呼び出してNGワードをチェック
    const { data, error } = await supabase
      .rpc('check_ng_words', {
        p_content: content,
        p_severity_threshold: severityThreshold
      })

    if (error) {
      console.error('NGワードチェックエラー:', error)
      // エラーの場合は安全側に倒す（ブロックしない）
      return {
        isClean: true,
        detectedWords: [],
        highestSeverity: null,
        shouldBlock: false,
        shouldAutoRemove: false
      }
    }

    const detectedWords = data || []
    const isClean = detectedWords.length === 0

    // 最も高い重要度を取得
    let highestSeverity: NgWordSeverity | null = null
    if (detectedWords.length > 0) {
      const severityOrder = ['low', 'medium', 'high', 'critical']
      highestSeverity = detectedWords.reduce((highest: NgWordSeverity, word: any) => {
        return severityOrder.indexOf(word.severity) > severityOrder.indexOf(highest) 
          ? word.severity 
          : highest
      }, 'low' as NgWordSeverity)
    }

    // アクションの決定
    const shouldBlock = highestSeverity === 'high' || highestSeverity === 'critical'
    const shouldAutoRemove = highestSeverity === 'critical'

    return {
      isClean,
      detectedWords,
      highestSeverity,
      shouldBlock,
      shouldAutoRemove
    }
  } catch (error) {
    console.error('NGワードチェックエラー:', error)
    // エラーの場合は安全側に倒す（ブロックしない）
    return {
      isClean: true,
      detectedWords: [],
      highestSeverity: null,
      shouldBlock: false,
      shouldAutoRemove: false
    }
  }
}

/**
 * NGワード検出をログに記録する
 */
export async function logNgWordDetection(
  contentType: string,
  contentId: string,
  detectedWords: string[],
  severity: NgWordSeverity,
  actionTaken: 'blocked' | 'flagged' | 'auto_removed',
  userIpHash?: string
) {
  try {
    const supabase = createClient()
    
    await supabase
      .from('ng_word_detections')
      .insert({
        content_type: contentType,
        content_id: contentId,
        detected_words: detectedWords,
        severity,
        action_taken: actionTaken,
        user_ip_hash: userIpHash
      })
  } catch (error) {
    console.error('NGワード検出ログエラー:', error)
  }
}

/**
 * テキストをマスクする（NGワードを伏せ字にする）
 */
export function maskNgWords(content: string, ngWords: string[]): string {
  let maskedContent = content
  
  for (const word of ngWords) {
    // 単純な文字列の場合
    const regex = new RegExp(word, 'gi')
    maskedContent = maskedContent.replace(regex, (match) => {
      // 最初と最後の文字以外を*に置換
      if (match.length <= 2) {
        return '*'.repeat(match.length)
      }
      return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1]
    })
  }
  
  return maskedContent
}