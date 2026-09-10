import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, MapPin, Compass, Clock, Car, Footprints, ExternalLink, 
  Copy, Check, X, ArrowUpRight, Crosshair, Landmark, ShieldCheck
} from 'lucide-react';

export default function DirectionsModal({
  isOpen,
  onClose,
  destination,
  userCoords,
  templeCoords
}) {
  const [travelMode, setTravelMode] = useState('walking'); // 'walking' or 'driving'
  const [originMode, setOriginMode] = useState('gps'); // 'gps' or 'temple'
  const [copied, setCopied] = useState(false);

  if (!isOpen || !destination) return null;

  // Determine origin coordinates and name
  const isGps = originMode === 'gps' && userCoords?.lat && userCoords?.lng;
  const originLat = isGps ? userCoords.lat : (templeCoords?.lat || 13.6833);
  const originLng = isGps ? userCoords.lng : (templeCoords?.lng || 79.3472);
  const originLabel = isGps 
    ? (userCoords.name || 'Your Live GPS Pin')
    : (templeCoords?.name || 'Temple Entrance Gate 1 (Vaikuntam Complex)');

  const destLat = destination.lat || 13.6273;
  const destLng = destination.lng || 79.4272;
  const destName = destination.name || destination.hotelName || 'Destination';
  const destAddress = destination.address || destination.proximityToGate || 'Sacred Pilgrimage Site';

  // Haversine distance
  const R = 6371; // km
  const dLat = ((destLat - originLat) * Math.PI) / 180;
  const dLon = ((destLng - originLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((originLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const calcDistKm = R * c;

  const displayDistance = calcDistKm < 1 
    ? `${Math.round(calcDistKm * 1000)} meters` 
    : `${calcDistKm.toFixed(1)} km`;

  // Estimated times (Walking: ~4.5 km/h, Driving: ~30 km/h in temple zone)
  const walkingMinutes = Math.max(1, Math.round((calcDistKm / 4.5) * 60));
  const drivingMinutes = Math.max(1, Math.round((calcDistKm / 30) * 60));

  // Build accurate Google Maps turn-by-turn navigation URL
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&destination_place_id=${encodeURIComponent(destName)}&travelmode=${travelMode}`;

  const handleCopy = () => {
    const textToCopy = `${destName}, ${destAddress} (GPS: ${destLat.toFixed(5)}, ${destLng.toFixed(5)})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate realistic navigation milestone steps
  const steps = [
    {
      num: 1,
      title: `Depart from ${originLabel.split(',')[0]}`,
      detail: `Check your orientation using compass. Head towards main transit corridor.`,
      icon: <Compass className="h-4 w-4 text-emerald-500" />
    },
    {
      num: 2,
      title: travelMode === 'walking' ? 'Follow pedestrian walkway' : 'Follow designated pilgrim traffic lane',
      detail: destination.proximityToGate 
        ? `${destination.proximityToGate}. Look for official pilgrimage signboard markings.` 
        : `Continue along the main road for approx ${displayDistance}. Follow destination signage.`,
      icon: travelMode === 'walking' ? <Footprints className="h-4 w-4 text-saffron" /> : <Car className="h-4 w-4 text-saffron" />
    },
    {
      num: 3,
      title: `Arrive at ${destName}`,
      detail: `Destination is situated on your approach. Enter through reception counter / main shrine gate.`,
      icon: <MapPin className="h-4 w-4 text-red-500" />
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg bg-white dark:bg-[#141424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative text-left"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Navigation className="h-3 w-3" /> Accurate GPS Navigation Guide
            </span>
            <span className="text-[10px] text-slate-500 font-bold">
              {destination.categoryName || destination.type || 'Verified Location'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            {destName}
          </h3>
          <p className="text-xs text-slate-500 flex items-start gap-1 mt-1 mb-4">
            <MapPin className="h-3.5 w-3.5 text-saffron shrink-0 mt-0.5" />
            <span>{destAddress}</span>
          </p>

          {/* Departure Origin Selector */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Crosshair className="h-3.5 w-3.5 text-emerald-500" /> Choose Departure Origin:
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setOriginMode('gps')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    originMode === 'gps'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Live GPS
                </button>
                <button
                  onClick={() => setOriginMode('temple')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    originMode === 'temple'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Temple Gate
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Starting from: <strong className="text-slate-800 dark:text-slate-200">{originLabel}</strong>
            </p>
          </div>

          {/* Travel Mode Toggle & Route Quick Summary */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setTravelMode('walking')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                travelMode === 'walking'
                  ? 'bg-saffron/10 border-saffron ring-1 ring-saffron/30 dark:bg-slate-900'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Footprints className={`h-4 w-4 ${travelMode === 'walking' ? 'text-saffron' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase text-slate-400">Walking</span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                ~{walkingMinutes} mins
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {displayDistance}
              </div>
            </button>

            <button
              onClick={() => setTravelMode('driving')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                travelMode === 'driving'
                  ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/30 dark:bg-slate-900'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Car className={`h-4 w-4 ${travelMode === 'driving' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase text-slate-400">Drive / Cab</span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                ~{drivingMinutes} mins
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {displayDistance}
              </div>
            </button>
          </div>

          {/* Step-by-Step Navigation Milestones */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Step-by-Step Route Guidance ({travelMode === 'walking' ? 'Walking Path' : 'Driving Route'}):
            </span>
            <div className="space-y-3 text-xs">
              {steps.map(step => (
                <div key={step.num} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 text-slate-800 dark:text-slate-200 font-bold shadow-xs">
                    {step.num}
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      {step.title}
                    </strong>
                    <span className="text-slate-500 text-[11px] leading-snug">
                      {step.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons: Launch Google Maps Directions & Copy Address */}
          <div className="space-y-2.5">
            <a
              href={googleMapsNavUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover:scale-101"
            >
              <Navigation className="h-4 w-4 stroke-[2.5]" />
              <span>Start Turn-by-Turn GPS Navigation in Google Maps</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
