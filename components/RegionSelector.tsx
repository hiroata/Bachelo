'use client'

import Link from 'next/link'

interface Area {
  id: number
  name: string
  slug: string
}

interface Region {
  id: number
  name: string
  slug: string
  order: number
  areas: Area[]
}

interface RegionSelectorProps {
  regions: Region[]
}

export default function RegionSelector({ regions }: RegionSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 my-8">
      {regions.map((region) => (
        <div
          key={region.id}
          className="bg-bbs-region text-white rounded-lg p-6 hover:opacity-90 transition-opacity"
        >
          <h3 className="text-xl font-bold mb-3">{region.name}</h3>
          <ul className="text-sm space-y-1">
            {region.areas.map((area) => (
              <li key={area.id}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="hover:underline text-white"
                >
                  {area.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}