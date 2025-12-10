import { NextRequest, NextResponse } from 'next/server';
import { GeoLocation } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get the client's IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    let ip = forwardedFor?.split(',')[0] || realIp || '';

    // In development, use a default location or fetch from external service
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      // Use ip-api.com to get location based on the server's outgoing IP
      // This will at least work for deployed environments
      const response = await fetch('http://ip-api.com/json/?fields=status,lat,lon,city,regionName,country');
      const data = await response.json();

      if (data.status === 'success') {
        const location: GeoLocation = {
          latitude: data.lat,
          longitude: data.lon,
          city: data.city,
          region: data.regionName,
          country: data.country,
        };
        return NextResponse.json(location);
      }

      // Fallback to a default location (New York City)
      return NextResponse.json({
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
        region: 'New York',
        country: 'United States',
      } as GeoLocation);
    }

    // Use ip-api.com for geolocation (free, no API key required)
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,lat,lon,city,regionName,country`
    );
    const data = await response.json();

    if (data.status === 'fail') {
      console.error('Geolocation failed:', data.message);
      // Return default location
      return NextResponse.json({
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
        region: 'New York',
        country: 'United States',
      } as GeoLocation);
    }

    const location: GeoLocation = {
      latitude: data.lat,
      longitude: data.lon,
      city: data.city,
      region: data.regionName,
      country: data.country,
    };

    return NextResponse.json(location);
  } catch (error) {
    console.error('Geolocation error:', error);
    // Return default location on error
    return NextResponse.json({
      latitude: 40.7128,
      longitude: -74.006,
      city: 'New York',
      region: 'New York',
      country: 'United States',
    } as GeoLocation);
  }
}
