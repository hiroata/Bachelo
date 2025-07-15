import { NextResponse } from 'next/server'

// モックデータ生成API
export async function GET() {
  const mockCreators = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'sweetvoice_aoi',
      display_name: 'あおい',
      avatar_url: null,
      bio: '優しい声で癒しをお届けします。甘い囁きが得意です。',
      role: 'creator',
      price_per_10sec: 1500,
      sample_voice_url: null,
      tags: ['癒し系', '囁き', 'ロリボイス'],
      is_accepting_orders: true,
      average_delivery_hours: 24,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      username: 'mature_voice_yui',
      display_name: 'ゆい',
      avatar_url: null,
      bio: '大人の魅力を声でお届け。お姉さんボイスならお任せください。',
      role: 'creator',
      price_per_10sec: 2000,
      sample_voice_url: null,
      tags: ['お姉さん', 'セクシー', '大人'],
      is_accepting_orders: true,
      average_delivery_hours: 48,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '323e4567-e89b-12d3-a456-426614174002',
      username: 'moe_voice_sakura',
      display_name: 'さくら',
      avatar_url: null,
      bio: '元気いっぱいの萌えボイスでお客様を楽しませます！',
      role: 'creator',
      price_per_10sec: 1200,
      sample_voice_url: null,
      tags: ['萌え', '元気', 'ツンデレ'],
      is_accepting_orders: false,
      average_delivery_hours: 36,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  return NextResponse.json({
    success: true,
    creators: mockCreators,
    message: 'これはテスト用のモックデータです。実際のデータベース接続時は削除してください。'
  })
}