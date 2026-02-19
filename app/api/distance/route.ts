import { NextRequest, NextResponse } from 'next/server'

const SHOP_ADDRESS = '212 S Beach St, Daytona Beach, FL 32114'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')

    if (!destination) {
      return NextResponse.json(
        { error: 'destination is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      )
    }

    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
    url.searchParams.set('origins', SHOP_ADDRESS)
    url.searchParams.set('destinations', destination)
    url.searchParams.set('units', 'imperial')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Google Maps API error', details: data.status },
        { status: 500 }
      )
    }

    const element = data.rows?.[0]?.elements?.[0]
    if (!element || element.status !== 'OK') {
      return NextResponse.json(
        { error: 'Could not calculate distance for that address' },
        { status: 400 }
      )
    }

    // distance.value is in meters, convert to miles
    const miles = Math.round((element.distance.value / 1609.344) * 10) / 10
    // duration.value is in seconds, convert to minutes
    const minutes = Math.round(element.duration.value / 60)

    return NextResponse.json({
      miles,
      minutes,
      distance_text: element.distance.text,
      duration_text: element.duration.text,
      origin: SHOP_ADDRESS,
      destination,
    })
  } catch (error) {
    console.error('Distance API error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    )
  }
}
