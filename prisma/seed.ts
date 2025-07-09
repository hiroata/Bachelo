import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 既存のデータをクリーンアップ（開発環境のみ）
  await prisma.post.deleteMany()
  await prisma.thread.deleteMany()
  await prisma.area.deleteMany()
  await prisma.region.deleteMany()

  // 地域データの作成
  const regions = [
    {
      name: '北海道',
      slug: 'hokkaido',
      order: 1,
      areas: [
        { name: '札幌', slug: 'sapporo' },
        { name: '函館', slug: 'hakodate' },
        { name: '旭川', slug: 'asahikawa' },
        { name: '釧路', slug: 'kushiro' },
      ]
    },
    {
      name: '東北',
      slug: 'tohoku',
      order: 2,
      areas: [
        { name: '仙台', slug: 'sendai' },
        { name: '青森', slug: 'aomori' },
        { name: '秋田', slug: 'akita' },
        { name: '盛岡', slug: 'morioka' },
        { name: '山形', slug: 'yamagata' },
        { name: '福島', slug: 'fukushima' },
      ]
    },
    {
      name: '関東',
      slug: 'kanto',
      order: 3,
      areas: [
        { name: '東京', slug: 'tokyo' },
        { name: '横浜', slug: 'yokohama' },
        { name: '千葉', slug: 'chiba' },
        { name: 'さいたま', slug: 'saitama' },
        { name: '宇都宮', slug: 'utsunomiya' },
        { name: '前橋', slug: 'maebashi' },
        { name: '水戸', slug: 'mito' },
      ]
    },
    {
      name: '中部',
      slug: 'chubu',
      order: 4,
      areas: [
        { name: '名古屋', slug: 'nagoya' },
        { name: '新潟', slug: 'niigata' },
        { name: '金沢', slug: 'kanazawa' },
        { name: '長野', slug: 'nagano' },
        { name: '静岡', slug: 'shizuoka' },
        { name: '岐阜', slug: 'gifu' },
        { name: '富山', slug: 'toyama' },
        { name: '福井', slug: 'fukui' },
      ]
    },
    {
      name: '関西',
      slug: 'kansai',
      order: 5,
      areas: [
        { name: '大阪', slug: 'osaka' },
        { name: '京都', slug: 'kyoto' },
        { name: '神戸', slug: 'kobe' },
        { name: '奈良', slug: 'nara' },
        { name: '和歌山', slug: 'wakayama' },
        { name: '大津', slug: 'otsu' },
      ]
    },
    {
      name: '中国',
      slug: 'chugoku',
      order: 6,
      areas: [
        { name: '広島', slug: 'hiroshima' },
        { name: '岡山', slug: 'okayama' },
        { name: '松江', slug: 'matsue' },
        { name: '鳥取', slug: 'tottori' },
        { name: '山口', slug: 'yamaguchi' },
      ]
    },
    {
      name: '四国',
      slug: 'shikoku',
      order: 7,
      areas: [
        { name: '高松', slug: 'takamatsu' },
        { name: '松山', slug: 'matsuyama' },
        { name: '高知', slug: 'kochi' },
        { name: '徳島', slug: 'tokushima' },
      ]
    },
    {
      name: '九州・沖縄',
      slug: 'kyushu-okinawa',
      order: 8,
      areas: [
        { name: '福岡', slug: 'fukuoka' },
        { name: '熊本', slug: 'kumamoto' },
        { name: '鹿児島', slug: 'kagoshima' },
        { name: '長崎', slug: 'nagasaki' },
        { name: '大分', slug: 'oita' },
        { name: '宮崎', slug: 'miyazaki' },
        { name: '佐賀', slug: 'saga' },
        { name: '那覇', slug: 'naha' },
      ]
    }
  ]

  // データベースに地域とエリアを作成
  for (const regionData of regions) {
    await prisma.region.create({
      data: {
        name: regionData.name,
        slug: regionData.slug,
        order: regionData.order,
        areas: {
          create: regionData.areas
        }
      }
    })
  }

  console.log('シーディング完了: 地域とエリアのデータを投入しました。')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })