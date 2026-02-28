import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../hooks/useAuth';
import {
  type CashPoint,
  getAvailableCountries,
  getCashPointsByService,
  getCashPointsNearby,
  COUNTRY_COORDINATES,
} from '../data/cashPoints';
import '../styles/Deposit.css';

type Tab = 'qrcode' | 'cashpoints';

interface LocationState {
  loading: boolean;
  error: string | null;
  country: string | null;
  countryName: string | null;
  coordinates: { lat: number; lng: number } | null;
}

export const Deposit: React.FC = () => {
  const { user } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('qrcode');

  // Location state
  const [location, setLocation] = useState<LocationState>({
    loading: false,
    error: null,
    country: null,
    countryName: null,
    coordinates: null,
  });

  // Cash points state
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [cashPoints, setCashPoints] = useState<(CashPoint & { distance?: number })[]>([]);

  const countries = getAvailableCountries();

  // The user's WPAY ID for the QR code
  const wpayId = user?.userId || '';
  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.userName || 'User';

  // Detect location when switching to cash points tab
  useEffect(() => {
    if (activeTab === 'cashpoints' && !location.country && !location.loading) {
      detectLocation();
    }
  }, [activeTab]);

  const detectLocation = () => {
    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setLocation({
        loading: false,
        error: 'Geolocation is not supported by your browser',
        country: null,
        countryName: null,
        coordinates: null,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();

          const countryCode = data.countryCode;
          const countryName = data.countryName;

          const availableCountry = countries.find((c) => c.code === countryCode);

          if (availableCountry) {
            setLocation({
              loading: false,
              error: null,
              country: countryCode,
              countryName: countryName,
              coordinates: { lat: latitude, lng: longitude },
            });
            setSelectedCountry(countryCode);

            // Get nearby cash points for deposits (cash_in)
            const nearby = getCashPointsNearby(latitude, longitude, 'cash_in');
            setCashPoints(nearby.filter((cp) => cp.country === countryCode));
          } else {
            setLocation({
              loading: false,
              error: `No cash points available in ${countryName}. Please select a different country.`,
              country: countryCode,
              countryName: countryName,
              coordinates: { lat: latitude, lng: longitude },
            });
          }
        } catch {
          setLocation({
            loading: false,
            error: 'Could not determine your location. Please select manually.',
            country: null,
            countryName: null,
            coordinates: { lat: latitude, lng: longitude },
          });
        }
      },
      (error) => {
        let errorMessage = 'Could not get your location. Please select manually.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied. Please select your country manually.';
        }
        setLocation({
          loading: false,
          error: errorMessage,
          country: null,
          countryName: null,
          coordinates: null,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const country = countries.find((c) => c.code === countryCode);

    // Get cash points for deposits (cash_in)
    if (location.coordinates) {
      const nearby = getCashPointsNearby(
        location.coordinates.lat,
        location.coordinates.lng,
        'cash_in'
      ).filter((cp) => cp.country === countryCode);
      setCashPoints(nearby);
    } else {
      const coords = COUNTRY_COORDINATES[countryCode];
      if (coords) {
        const nearby = getCashPointsNearby(coords.lat, coords.lng, 'cash_in').filter(
          (cp) => cp.country === countryCode
        );
        setCashPoints(nearby);
      } else {
        const points = getCashPointsByService('cash_in', countryCode);
        setCashPoints(points);
      }
    }

    setLocation((prev) => ({
      ...prev,
      country: countryCode,
      countryName: country?.name || countryCode,
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="deposit-page">
      <div className="deposit-header">
        <h1>Deposit Cash</h1>
        <p className="deposit-subtitle">
          Receive cash deposits at a WinPay Cash Point
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="deposit-tabs">
        <button
          className={`tab-btn ${activeTab === 'qrcode' ? 'active' : ''}`}
          onClick={() => setActiveTab('qrcode')}
        >
          My QR Code
        </button>
        <button
          className={`tab-btn ${activeTab === 'cashpoints' ? 'active' : ''}`}
          onClick={() => setActiveTab('cashpoints')}
        >
          Find Cash Points
        </button>
      </div>

      <div className="deposit-content">
        {/* QR Code Tab */}
        {activeTab === 'qrcode' && (
          <div className="deposit-card qr-card">
            <div className="qr-section">
              <div className="qr-container">
                <QRCodeSVG
                  value={wpayId}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="var(--bg-primary)"
                  fgColor="var(--text-primary)"
                />
              </div>

              <div className="wpay-id-section">
                <p className="wpay-id-label">Your WPAY ID</p>
                <div className="wpay-id-box">
                  <span className="wpay-id">{wpayId}</span>
                  <button
                    className="btn-copy-small"
                    onClick={() => copyToClipboard(wpayId)}
                    title="Copy WPAY ID"
                  >
                    Copy
                  </button>
                </div>
                <p className="wpay-name">{displayName}</p>
              </div>
            </div>

            <div className="deposit-instructions">
              <h3>How to Deposit</h3>
              <ol>
                <li>Visit any WinPay Cash Point</li>
                <li>Show this QR code to the agent</li>
                <li>Hand over your cash</li>
                <li>Receive instant credit to your wallet</li>
              </ol>
            </div>

            <div className="deposit-notice">
              <span className="notice-icon">i</span>
              <p>
                The Cash Point agent will scan your QR code and send an instant
                payment to your account. Funds are available immediately.
              </p>
            </div>
          </div>
        )}

        {/* Cash Points Tab */}
        {activeTab === 'cashpoints' && (
          <div className="deposit-card">
            <h2>Find Nearby Cash Points</h2>

            {location.loading ? (
              <div className="location-detecting">
                <div className="location-spinner"></div>
                <p>Detecting your location...</p>
              </div>
            ) : (
              <>
                {location.error && (
                  <div className="location-error">
                    <span className="error-icon">!</span>
                    <p>{location.error}</p>
                  </div>
                )}

                <div className="country-selector">
                  <label>Select Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountrySelect(e.target.value)}
                    className="country-select"
                  >
                    <option value="">-- Select a country --</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn-detect-location"
                  onClick={detectLocation}
                  disabled={location.loading}
                >
                  <span className="location-icon">📍</span>
                  Use My Location
                </button>

                {selectedCountry && (
                  <>
                    <p className="selected-country">
                      Showing deposit locations in <strong>{location.countryName}</strong>
                    </p>

                    <div className="cashpoint-list">
                      {cashPoints.length === 0 ? (
                        <div className="no-cashpoints">
                          <p>No deposit locations available in this area.</p>
                        </div>
                      ) : (
                        cashPoints.map((cp) => (
                          <div key={cp.id} className="cashpoint-item">
                            <div className="cashpoint-info">
                              <h3>{cp.name}</h3>
                              <p className="cashpoint-address">{cp.address}</p>
                              <p className="cashpoint-hours">{cp.operatingHours}</p>
                              <div className="cashpoint-currencies">
                                {cp.supportedCurrencies.slice(0, 4).map((ccy) => (
                                  <span key={ccy} className="currency-badge">
                                    {ccy}
                                  </span>
                                ))}
                                {cp.supportedCurrencies.length > 4 && (
                                  <span className="currency-badge more">
                                    +{cp.supportedCurrencies.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                            {cp.distance !== undefined && (
                              <div className="cashpoint-distance">
                                {cp.distance < 1
                                  ? `${Math.round(cp.distance * 1000)}m`
                                  : `${cp.distance.toFixed(1)}km`}
                              </div>
                            )}
                            {cp.phone && (
                              <a
                                href={`tel:${cp.phone}`}
                                className="cashpoint-phone"
                                title="Call"
                              >
                                📞
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
